import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { downloadTextFile, slugFile } from './engineHelpers';
import type { DomainEngineProps } from './engineTypes';
import './engine-shell.css';

type SensorDirection = 'above' | 'below';
type SensorStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

interface TelemetrySensor {
  id: string;
  equipmentId: string;
  labelEn: string;
  labelId: string;
  unit: string;
  direction: SensorDirection;
  minBound: number;
  maxBound: number;
  step: number;
  nominalBase: number;
  jitter: number;
  warnThreshold: number;
  critThreshold: number;
  currentValue: number;
  history: number[];
}

interface ScadaAlarm {
  id: string;
  sensorId: string;
  equipmentId: string;
  sensorLabelEn: string;
  sensorLabelId: string;
  severity: 'WARNING' | 'CRITICAL';
  reading: number;
  unit: string;
  threshold: number;
  direction: SensorDirection;
  timestamp: string;
  acknowledged: boolean;
  woId: string | null;
}

interface WorkOrder {
  id: string;
  alarmId: string;
  equipmentId: string;
  priority: 'P1-EMERGENCY' | 'P2-HIGH';
  summaryEn: string;
  summaryId: string;
  crewEn: string;
  crewId: string;
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
}

const INITIAL_SENSORS: TelemetrySensor[] = [
  {
    id: 'THERM-01',
    equipmentId: 'EQ-KILN-01',
    labelEn: 'Primary Thermal Zone Temp',
    labelId: 'Suhu Zona Termal Utama',
    unit: 'C',
    direction: 'above',
    minBound: 600,
    maxBound: 950,
    step: 5,
    nominalBase: 745,
    jitter: 8,
    warnThreshold: 800,
    critThreshold: 860,
    currentValue: 746,
    history: [738, 742, 740, 745, 748, 744, 743, 747, 745, 746],
  },
  {
    id: 'COMP-02',
    equipmentId: 'EQ-COMP-02',
    labelEn: 'Compressor Header Pressure',
    labelId: 'Tekanan Header Kompresor',
    unit: 'bar',
    direction: 'below',
    minBound: 2.0,
    maxBound: 10.0,
    step: 0.2,
    nominalBase: 7.4,
    jitter: 0.25,
    warnThreshold: 5.8,
    critThreshold: 4.4,
    currentValue: 7.4,
    history: [7.5, 7.3, 7.4, 7.6, 7.4, 7.2, 7.5, 7.4, 7.3, 7.4],
  },
  {
    id: 'VIB-03',
    equipmentId: 'EQ-DRIVE-03',
    labelEn: 'Rotary Drive Vibration',
    labelId: 'Getaran Penggerak Rotari',
    unit: 'mm/s',
    direction: 'above',
    minBound: 0.5,
    maxBound: 12.0,
    step: 0.2,
    nominalBase: 2.8,
    jitter: 0.35,
    warnThreshold: 5.5,
    critThreshold: 8.0,
    currentValue: 2.9,
    history: [2.7, 2.8, 3.0, 2.9, 2.6, 2.8, 3.1, 2.9, 2.8, 2.9],
  },
  {
    id: 'CURR-04',
    equipmentId: 'EQ-BUS-04',
    labelEn: 'Substation Feeder Current',
    labelId: 'Arus Feeder Gardu Induk',
    unit: 'A',
    direction: 'above',
    minBound: 100,
    maxBound: 420,
    step: 5,
    nominalBase: 235,
    jitter: 9,
    warnThreshold: 310,
    critThreshold: 360,
    currentValue: 236,
    history: [228, 232, 235, 238, 234, 231, 237, 235, 233, 236],
  },
];

function evaluateSensorStatus(sensor: TelemetrySensor): SensorStatus {
  if (sensor.direction === 'above') {
    if (sensor.currentValue >= sensor.critThreshold) return 'CRITICAL';
    if (sensor.currentValue >= sensor.warnThreshold) return 'WARNING';
    return 'NOMINAL';
  }
  if (sensor.currentValue <= sensor.critThreshold) return 'CRITICAL';
  if (sensor.currentValue <= sensor.warnThreshold) return 'WARNING';
  return 'NOMINAL';
}

function roundForStep(val: number, step: number): number {
  const decimals = step < 1 ? 1 : 0;
  return Number(val.toFixed(decimals));
}

function buildSparklinePoints(values: number[], minBound: number, maxBound: number, width: number, height: number): string {
  if (values.length === 0) return '';
  const span = Math.max(1e-6, maxBound - minBound);
  return values
    .map((v, idx) => {
      const x = values.length === 1 ? width : (idx / (values.length - 1)) * width;
      const norm = Math.min(1, Math.max(0, (v - minBound) / span));
      const y = height - norm * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function valueToY(val: number, minBound: number, maxBound: number, height: number): number {
  const span = Math.max(1e-6, maxBound - minBound);
  const norm = Math.min(1, Math.max(0, (val - minBound) / span));
  return height - norm * (height - 8) - 4;
}

export default function IndustrialScadaEngine({ project }: DomainEngineProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'telemetry' | 'alarms'>('telemetry');
  const [sensors, setSensors] = useState<TelemetrySensor[]>(INITIAL_SENSORS);
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(true);
  const [thermalFault, setThermalFault] = useState<boolean>(false);
  const [pressureFault, setPressureFault] = useState<boolean>(false);

  const [isOfflineEdge, setIsOfflineEdge] = useState<boolean>(false);
  const [edgeBufferCount, setEdgeBufferCount] = useState<number>(0);
  const [deltaSyncBanner, setDeltaSyncBanner] = useState<{ flushed: number; at: string } | null>(null);

  const [alarms, setAlarms] = useState<ScadaAlarm[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [tickCount, setTickCount] = useState<number>(0);
  const [edgeLog, setEdgeLog] = useState<string[]>([
    '[15:02:00] OPC-UA / MQTT Edge Gateway connected. Polling interval 1800ms.',
  ]);

  const thermalFaultRef = useRef(thermalFault);
  const pressureFaultRef = useRef(pressureFault);
  const isOfflineRef = useRef(isOfflineEdge);

  useEffect(() => {
    thermalFaultRef.current = thermalFault;
  }, [thermalFault]);

  useEffect(() => {
    pressureFaultRef.current = pressureFault;
  }, [pressureFault]);

  useEffect(() => {
    isOfflineRef.current = isOfflineEdge;
  }, [isOfflineEdge]);

  const appendEdgeLog = (line: string) => {
    setEdgeLog((prev) => [line, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    if (!isLiveRunning) return undefined;

    const timer = window.setInterval(() => {
      const nowStr = new Date().toTimeString().slice(0, 8);
      setTickCount((c) => c + 1);

      setSensors((prev) =>
        prev.map((s) => {
          let target = s.nominalBase;
          if (s.id === 'THERM-01' && thermalFaultRef.current) {
            target = Math.min(s.maxBound - 15, s.critThreshold + 32);
          }
          if (s.id === 'COMP-02' && pressureFaultRef.current) {
            target = Math.max(s.minBound + 0.3, s.critThreshold - 1.1);
          }
          const delta = (Math.random() - 0.5) * 2 * s.jitter;
          const nextRaw = Math.min(s.maxBound, Math.max(s.minBound, target + delta));
          const nextVal = roundForStep(nextRaw, s.step);
          const nextHistory = [...s.history.slice(-17), nextVal];
          return {
            ...s,
            currentValue: nextVal,
            history: nextHistory,
          };
        })
      );

      if (isOfflineRef.current) {
        setEdgeBufferCount((b) => b + 4);
        appendEdgeLog(`[${nowStr}] EDGE-RING-BUF: Stored 4 telemetry frames locally (uplink offline).`);
      }
    }, 1800);

    return () => {
      window.clearInterval(timer);
    };
  }, [isLiveRunning]);

  useEffect(() => {
    const nowStr = new Date().toTimeString().slice(0, 8);
    setAlarms((prevAlarms) => {
      let changed = false;
      const nextAlarms = [...prevAlarms];

      for (const s of sensors) {
        const status = evaluateSensorStatus(s);
        if (status === 'NOMINAL') continue;

        const severity = status;
        const threshold = severity === 'CRITICAL' ? s.critThreshold : s.warnThreshold;
        const existingIdx = nextAlarms.findIndex(
          (a) => a.sensorId === s.id && !a.acknowledged
        );

        if (existingIdx === -1) {
          changed = true;
          nextAlarms.unshift({
            id: `ALM-${Date.now().toString().slice(-5)}-${s.id}`,
            sensorId: s.id,
            equipmentId: s.equipmentId,
            sensorLabelEn: s.labelEn,
            sensorLabelId: s.labelId,
            severity,
            reading: s.currentValue,
            unit: s.unit,
            threshold,
            direction: s.direction,
            timestamp: nowStr,
            acknowledged: false,
            woId: null,
          });
        } else {
          const existing = nextAlarms[existingIdx];
          if (existing.severity !== severity || existing.reading !== s.currentValue) {
            changed = true;
            nextAlarms[existingIdx] = {
              ...existing,
              severity: existing.severity === 'CRITICAL' ? 'CRITICAL' : severity,
              reading: s.currentValue,
              threshold,
              timestamp: nowStr,
            };
          }
        }
      }

      return changed ? nextAlarms.slice(0, 20) : prevAlarms;
    });
  }, [sensors]);

  const sensorStatuses = useMemo(
    () => sensors.map((s) => ({ sensor: s, status: evaluateSensorStatus(s) })),
    [sensors]
  );

  const kpis = useMemo(() => {
    const nominalCount = sensorStatuses.filter((item) => item.status === 'NOMINAL').length;
    const activeAlarmCount = alarms.filter((a) => !a.acknowledged).length;
    const openWoCount = workOrders.filter((w) => w.status !== 'COMPLETED').length;
    return {
      nominalCount,
      totalSensors: sensors.length,
      activeAlarmCount,
      openWoCount,
    };
  }, [sensorStatuses, alarms, workOrders, sensors.length]);

  const handleThresholdChange = (sensorId: string, kind: 'warn' | 'crit', rawValue: number) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id !== sensorId) return s;
        const val = roundForStep(rawValue, s.step);
        if (s.direction === 'above') {
          if (kind === 'warn') {
            return { ...s, warnThreshold: Math.min(val, roundForStep(s.critThreshold - s.step, s.step)) };
          }
          return { ...s, critThreshold: Math.max(val, roundForStep(s.warnThreshold + s.step, s.step)) };
        }
        if (kind === 'warn') {
          return { ...s, warnThreshold: Math.max(val, roundForStep(s.critThreshold + s.step, s.step)) };
        }
        return { ...s, critThreshold: Math.min(val, roundForStep(s.warnThreshold - s.step, s.step)) };
      })
    );
  };

  const injectThermalSpike = () => {
    const nowStr = new Date().toTimeString().slice(0, 8);
    setThermalFault(true);
    setDeltaSyncBanner(null);
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id !== 'THERM-01') return s;
        const spikeVal = roundForStep(Math.min(s.maxBound - 10, s.critThreshold + 34), s.step);
        return {
          ...s,
          currentValue: spikeVal,
          history: [...s.history.slice(-17), spikeVal],
        };
      })
    );
    appendEdgeLog(`[${nowStr}] INTERLOCK FAULT: Thermal Spike injected on EQ-KILN-01 (THERM-01).`);
  };

  const injectPressureDrop = () => {
    const nowStr = new Date().toTimeString().slice(0, 8);
    setPressureFault(true);
    setDeltaSyncBanner(null);
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id !== 'COMP-02') return s;
        const dropVal = roundForStep(Math.max(s.minBound + 0.2, s.critThreshold - 1.2), s.step);
        return {
          ...s,
          currentValue: dropVal,
          history: [...s.history.slice(-17), dropVal],
        };
      })
    );
    appendEdgeLog(`[${nowStr}] INTERLOCK FAULT: Compressor Pressure Drop injected on EQ-COMP-02 (COMP-02).`);
  };

  const clearAllFaults = () => {
    const nowStr = new Date().toTimeString().slice(0, 8);
    setThermalFault(false);
    setPressureFault(false);
    setSensors((prev) =>
      prev.map((s) => ({
        ...s,
        currentValue: s.nominalBase,
        history: [...s.history.slice(-17), s.nominalBase],
      }))
    );
    appendEdgeLog(`[${nowStr}] SAFETY INTERLOCK RESET: Plant faults cleared to nominal baseline.`);
  };

  const toggleOfflineEdge = () => {
    const nowStr = new Date().toTimeString().slice(0, 8);
    if (!isOfflineEdge) {
      setIsOfflineEdge(true);
      setDeltaSyncBanner(null);
      appendEdgeLog(`[${nowStr}] EDGE GATEWAY OFFLINE: Switching to local ring-buffer persistence.`);
      return;
    }

    const flushed = edgeBufferCount;
    setIsOfflineEdge(false);
    setEdgeBufferCount(0);
    setDeltaSyncBanner({ flushed, at: nowStr });
    appendEdgeLog(
      `[${nowStr}] EDGE DELTA-SYNC COMPLETE: Reconnected and flushed ${flushed} buffered frames to historian.`
    );
  };

  const acknowledgeAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, acknowledged: true } : a))
    );
  };

  const generateWorkOrder = (alarm: ScadaAlarm) => {
    if (alarm.woId) return;
    const woNumber = 101 + workOrders.length;
    const woId = `WO-2026-${woNumber}`;
    const priority: WorkOrder['priority'] = alarm.severity === 'CRITICAL' ? 'P1-EMERGENCY' : 'P2-HIGH';
    const nowStr = new Date().toTimeString().slice(0, 8);

    const newWo: WorkOrder = {
      id: woId,
      alarmId: alarm.id,
      equipmentId: alarm.equipmentId,
      priority,
      summaryEn: `${alarm.sensorId} ${alarm.severity} (${alarm.reading} ${alarm.unit} vs ${alarm.threshold} ${alarm.unit})`,
      summaryId: `${alarm.sensorId} ${alarm.severity} (${alarm.reading} ${alarm.unit} vs ${alarm.threshold} ${alarm.unit})`,
      crewEn: alarm.sensorId === 'COMP-02' || alarm.sensorId === 'VIB-03' ? 'Mechanical Rotating Crew' : 'Instrumentation & PLC Crew',
      crewId: alarm.sensorId === 'COMP-02' || alarm.sensorId === 'VIB-03' ? 'Tim Mekanik Rotasi' : 'Tim Instrumentasi & PLC',
      createdAt: nowStr,
      status: 'OPEN',
    };

    setWorkOrders((prev) => [newWo, ...prev]);
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarm.id ? { ...a, woId, acknowledged: true } : a))
    );
    appendEdgeLog(`[${nowStr}] CMMS DISPATCH: Generated ${woId} (${priority}) for ${alarm.equipmentId}.`);
  };

  const advanceWorkOrder = (woId: string) => {
    setWorkOrders((prev) =>
      prev.map((w) => {
        if (w.id !== woId) return w;
        const nextStatus: WorkOrder['status'] =
          w.status === 'OPEN' ? 'IN_PROGRESS' : w.status === 'IN_PROGRESS' ? 'COMPLETED' : 'COMPLETED';
        return { ...w, status: nextStatus };
      })
    );
  };

  const exportTelemetryCsv = () => {
    const header = 'SensorID,EquipmentID,Label,CurrentValue,Unit,WarnThreshold,CritThreshold,Direction,Status,EdgeSyncMode';
    const rows = sensorStatuses.map(({ sensor, status }) => {
      const label = isEn ? sensor.labelEn : sensor.labelId;
      const syncMode = isOfflineEdge ? `OFFLINE_BUFFERED_${edgeBufferCount}` : 'ONLINE_SYNCED';
      return [
        sensor.id,
        sensor.equipmentId,
        `"${label.replace(/"/g, '""')}"`,
        sensor.currentValue,
        sensor.unit,
        sensor.warnThreshold,
        sensor.critThreshold,
        sensor.direction,
        status,
        syncMode,
      ].join(',');
    });
    downloadTextFile(`${slugFile(project.name)}-telemetry-snapshot.csv`, [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <section className="eng-shell" aria-label={`${project.name} Industrial SCADA Engine`}>
      <div className="eng-topbar">
        <div>
          <div className="eng-eyebrow">
            <span className={`status-dot ${kpis.activeAlarmCount > 0 ? 'bad' : isOfflineEdge ? 'warn' : 'ok'}`} />
            <span>{project.id} | {isEn ? 'Industrial SCADA & Edge Telemetry Engine' : 'Engine SCADA Industri & Telemetri Edge'}</span>
            <span>|</span>
            <span>{project.standards.slice(0, 2).join(' | ')}</span>
          </div>
          <h2 className="eng-title">{project.name}</h2>
        </div>

        <div className="eng-actions">
          <button type="button" className="btn btn-sm" onClick={() => setIsLiveRunning((r) => !r)}>
            {isLiveRunning
              ? (isEn ? 'Pause Live Tick' : 'Jeda Tick Live')
              : (isEn ? 'Resume Live Tick' : 'Lanjutkan Tick Live')}
          </button>
          <button type="button" className="btn btn-sm" onClick={injectThermalSpike} disabled={thermalFault}>
            {isEn ? 'Thermal Spike Fault' : 'Gangguan Lonjakan Suhu'}
          </button>
          <button type="button" className="btn btn-sm" onClick={injectPressureDrop} disabled={pressureFault}>
            {isEn ? 'Compressor Pressure Drop' : 'Penurunan Tekanan Kompresor'}
          </button>
          {(thermalFault || pressureFault) && (
            <button type="button" className="btn btn-sm" onClick={clearAllFaults}>
              {isEn ? 'Clear Faults' : 'Reset Gangguan'}
            </button>
          )}
          <button type="button" className="btn btn-sm" onClick={toggleOfflineEdge}>
            {isOfflineEdge
              ? (isEn ? 'Reconnect Edge Online' : 'Rekonek Edge Online')
              : (isEn ? 'Offline Edge Mode' : 'Mode Edge Offline')}
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={exportTelemetryCsv}>
            {isEn ? 'Export Telemetry Snapshot CSV' : 'Ekspor Snapshot Telemetri CSV'}
          </button>
        </div>
      </div>

      <div className="eng-kpi-row">
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Sensors Nominal' : 'Sensor Nominal'}</span>
          <span className={`eng-kpi-val ${kpis.nominalCount === kpis.totalSensors ? 'is-ok' : kpis.nominalCount >= 2 ? 'is-warn' : 'is-bad'}`}>
            {kpis.nominalCount} / {kpis.totalSensors}
          </span>
          <span className="eng-kpi-sub">
            {isLiveRunning
              ? (isEn ? `Tick #${tickCount} (1800ms)` : `Tick #${tickCount} (1800ms)`)
              : (isEn ? 'Stream paused' : 'Aliran dijeda')}
          </span>
        </div>

        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Active Alarms' : 'Alarm Aktif'}</span>
          <span className={`eng-kpi-val ${kpis.activeAlarmCount === 0 ? 'is-ok' : 'is-bad'}`}>
            {kpis.activeAlarmCount}
          </span>
          <span className="eng-kpi-sub">
            {alarms.length} {isEn ? 'total logged events' : 'total event tercatat'}
          </span>
        </div>

        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Edge Sync Status' : 'Status Sinkronisasi Edge'}</span>
          <span className={`eng-kpi-val ${isOfflineEdge ? 'is-warn' : 'is-ok'}`}>
            {isOfflineEdge
              ? (isEn ? `OFFLINE (${edgeBufferCount} msgs)` : `OFFLINE (${edgeBufferCount} pesan)`)
              : (isEn ? 'ONLINE' : 'ONLINE')}
          </span>
          <span className="eng-kpi-sub">
            {isOfflineEdge
              ? (isEn ? 'Buffering to local ring queue' : 'Menampung ke antrean ring lokal')
              : (isEn ? 'OPC-UA / MQTT synced' : 'OPC-UA / MQTT tersinkron')}
          </span>
        </div>

        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Open Work Orders' : 'Work Order Terbuka'}</span>
          <span className={`eng-kpi-val ${kpis.openWoCount > 0 ? 'is-accent' : ''}`}>
            {kpis.openWoCount}
          </span>
          <span className="eng-kpi-sub">
            {workOrders.length} {isEn ? 'total WOs issued' : 'total WO diterbitkan'}
          </span>
        </div>
      </div>

      {isOfflineEdge && (
        <div className="eng-banner is-warn">
          {isEn
            ? `OFFLINE EDGE MODE ACTIVE: Uplink disconnected. Telemetry frames are buffering into local Edge Queue (${edgeBufferCount} msgs). Click Reconnect Edge Online to flush delta-sync.`
            : `MODE EDGE OFFLINE AKTIF: Uplink terputus. Frame telemetri ditampung ke Antrean Edge lokal (${edgeBufferCount} pesan). Klik Rekonek Edge Online untuk flush delta-sync.`}
        </div>
      )}

      {!isOfflineEdge && deltaSyncBanner && (
        <div className="eng-banner is-ok">
          {isEn
            ? `DELTA-SYNC CONFIRMED (${deltaSyncBanner.at}): Edge gateway reconnected and flushed ${deltaSyncBanner.flushed} buffered telemetry messages to central plant historian.`
            : `KONFIRMASI DELTA-SYNC (${deltaSyncBanner.at}): Gateway edge tersambung kembali dan melakukan flush ${deltaSyncBanner.flushed} pesan telemetri terbuffer ke historian pusat.`}
        </div>
      )}

      <div className="eng-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'telemetry'}
          className={`lens-chip ${activeTab === 'telemetry' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          {isEn ? '01 Live Plant & Edge Telemetry Grid' : '01 Grid Telemetri Plant & Edge Live'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'alarms'}
          className={`lens-chip ${activeTab === 'alarms' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('alarms')}
        >
          {isEn ? `02 Alarm & Maintenance Work Order Desk (${kpis.activeAlarmCount})` : `02 Desk Alarm & Work Order Pemeliharaan (${kpis.activeAlarmCount})`}
        </button>
      </div>

      {activeTab === 'telemetry' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="eng-sensor-grid">
            {sensorStatuses.map(({ sensor, status }) => {
              const cardStateClass = status === 'CRITICAL' ? 'is-bad' : status === 'WARNING' ? 'is-warn' : '';
              const tagClass = status === 'CRITICAL' ? 'tag-bad' : status === 'WARNING' ? 'tag-warn' : 'tag-ok';
              const strokeColor = status === 'CRITICAL' ? 'var(--ui-bad)' : status === 'WARNING' ? 'var(--ui-warn)' : 'var(--ui-accent)';
              const pts = buildSparklinePoints(sensor.history, sensor.minBound, sensor.maxBound, 240, 56);
              const warnY = valueToY(sensor.warnThreshold, sensor.minBound, sensor.maxBound, 56);
              const critY = valueToY(sensor.critThreshold, sensor.minBound, sensor.maxBound, 56);
              const lastPt = pts.split(' ').pop()?.split(',') ?? ['240', '28'];

              return (
                <div key={sensor.id} className={`eng-sensor-card ${cardStateClass}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)' }}>
                        {sensor.id} | {sensor.equipmentId}
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ui-text)' }}>
                        {isEn ? sensor.labelEn : sensor.labelId}
                      </div>
                    </div>
                    <span className={`tag ${tagClass}`}>{status}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--ui-text)' }}>
                      {sensor.currentValue} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ui-text-2)' }}>{sensor.unit}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '10.5px', color: 'var(--ui-text-muted)' }}>
                      {sensor.direction === 'above'
                        ? (isEn ? `Trip >= ${sensor.critThreshold} ${sensor.unit}` : `Trip >= ${sensor.critThreshold} ${sensor.unit}`)
                        : (isEn ? `Trip <= ${sensor.critThreshold} ${sensor.unit}` : `Trip <= ${sensor.critThreshold} ${sensor.unit}`)}
                    </div>
                  </div>

                  <div style={{ background: 'var(--ui-surface)', border: '1px solid var(--ui-line)', borderRadius: 'var(--ui-r-2)', padding: '6px' }}>
                    <svg viewBox="0 0 240 56" style={{ width: '100%', height: '56px', display: 'block' }} role="img" aria-label={`${sensor.id} sparkline`}>
                      <line x1="0" y1={warnY} x2="240" y2={warnY} stroke="var(--ui-warn)" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                      <line x1="0" y1={critY} x2="240" y2={critY} stroke="var(--ui-bad)" strokeWidth="1" strokeDasharray="4 2" opacity="0.85" />
                      <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={pts}
                      />
                      <circle cx={lastPt[0]} cy={lastPt[1]} r="3.2" fill={strokeColor} />
                    </svg>
                  </div>

                  <div className="eng-form-grid">
                    <div>
                      <label className="eng-field-label" htmlFor={`${sensor.id}-warn`}>
                        {isEn ? 'Warning' : 'Peringatan'}: <span style={{ fontFamily: 'var(--ui-mono)' }}>{sensor.warnThreshold} {sensor.unit}</span>
                      </label>
                      <input
                        id={`${sensor.id}-warn`}
                        type="range"
                        min={sensor.minBound}
                        max={sensor.maxBound}
                        step={sensor.step}
                        value={sensor.warnThreshold}
                        onChange={(e) => handleThresholdChange(sensor.id, 'warn', Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label className="eng-field-label" htmlFor={`${sensor.id}-crit`}>
                        {isEn ? 'Critical' : 'Kritis'}: <span style={{ fontFamily: 'var(--ui-mono)' }}>{sensor.critThreshold} {sensor.unit}</span>
                      </label>
                      <input
                        id={`${sensor.id}-crit`}
                        type="range"
                        min={sensor.minBound}
                        max={sensor.maxBound}
                        step={sensor.step}
                        value={sensor.critThreshold}
                        onChange={(e) => handleThresholdChange(sensor.id, 'crit', Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Edge Gateway & Safety Interlock Stream' : 'Aliran Gateway Edge & Interlock Keselamatan'}</h3>
              <span className="tag tag-mono">
                {isOfflineEdge ? `BUFFER: ${edgeBufferCount}` : 'SYNC: REALTIME'}
              </span>
            </div>
            <div className="eng-card-body">
              <pre className="eng-code">{edgeLog.join('\n')}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="eng-grid-equal">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Automated Threshold Alarm List' : 'Daftar Alarm Ambang Batas Otomatis'}</h3>
              <span className={`tag ${kpis.activeAlarmCount > 0 ? 'tag-bad' : 'tag-ok'}`}>
                {kpis.activeAlarmCount} {isEn ? 'Active' : 'Aktif'}
              </span>
            </div>
            <div className="eng-card-body">
              {alarms.length === 0 ? (
                <div className="eng-banner is-ok">
                  {isEn
                    ? 'All sensors within nominal operating envelopes. Inject a fault or adjust threshold sliders in Tab 01 to trigger automated alarms.'
                    : 'Semua sensor dalam batas operasi nominal. Injeksi gangguan atau geser slider ambang batas di Tab 01 untuk memicu alarm otomatis.'}
                </div>
              ) : (
                <div className="eng-list" style={{ border: '1px solid var(--ui-line)', borderRadius: 'var(--ui-r-3)' }}>
                  {alarms.map((alarm) => (
                    <div key={alarm.id} className="eng-row" style={{ cursor: 'default', alignItems: 'flex-start', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px', flexWrap: 'wrap' }}>
                        <div className="eng-row-title" style={{ fontFamily: 'var(--ui-mono)' }}>
                          {alarm.sensorId} ({alarm.equipmentId})
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span className={`tag ${alarm.severity === 'CRITICAL' ? 'tag-bad' : 'tag-warn'}`}>
                            {alarm.severity}
                          </span>
                          <span className={`tag ${alarm.acknowledged ? 'tag-ok' : 'tag-mono'}`}>
                            {alarm.acknowledged ? (isEn ? 'ACK' : 'TERKONFIRMASI') : (isEn ? 'UNACK' : 'BELUM ACK')}
                          </span>
                        </div>
                      </div>

                      <div className="eng-row-sub">
                        {isEn ? alarm.sensorLabelEn : alarm.sensorLabelId} | {alarm.reading} {alarm.unit} ({alarm.direction === 'above' ? '>=' : '<='} {alarm.threshold} {alarm.unit}) | {alarm.timestamp}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={alarm.acknowledged}
                          onClick={() => acknowledgeAlarm(alarm.id)}
                        >
                          {alarm.acknowledged
                            ? (isEn ? 'Acknowledged' : 'Sudah Dikonfirmasi')
                            : (isEn ? 'Acknowledge Alarm' : 'Konfirmasi Alarm')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          disabled={Boolean(alarm.woId)}
                          onClick={() => generateWorkOrder(alarm)}
                        >
                          {alarm.woId
                            ? `${isEn ? 'WO Linked' : 'WO Terkait'}: ${alarm.woId}`
                            : (isEn ? 'Generate Maintenance Work Order (WO)' : 'Buat Work Order Pemeliharaan (WO)')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Maintenance Work Order (WO) Desk' : 'Desk Work Order Pemeliharaan (WO)'}</h3>
              <span className="tag tag-mono">{kpis.openWoCount} {isEn ? 'Open' : 'Terbuka'}</span>
            </div>
            <div className="eng-card-body">
              {workOrders.length === 0 ? (
                <div className="eng-banner">
                  {isEn
                    ? 'No Maintenance Work Orders created yet. Generate a WO from any triggered alarm on the left panel.'
                    : 'Belum ada Work Order Pemeliharaan dibuat. Buat WO dari alarm aktif pada panel sebelah kiri.'}
                </div>
              ) : (
                <div className="eng-list" style={{ border: '1px solid var(--ui-line)', borderRadius: 'var(--ui-r-3)' }}>
                  {workOrders.map((wo) => (
                    <div key={wo.id} className="eng-row" style={{ cursor: 'default', alignItems: 'flex-start', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px', flexWrap: 'wrap' }}>
                        <div className="eng-row-title" style={{ fontFamily: 'var(--ui-mono)' }}>
                          {wo.id} | {wo.equipmentId}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span className={`tag ${wo.priority === 'P1-EMERGENCY' ? 'tag-bad' : 'tag-warn'}`}>
                            {wo.priority}
                          </span>
                          <span className={`tag ${wo.status === 'COMPLETED' ? 'tag-ok' : wo.status === 'IN_PROGRESS' ? 'tag-accent' : 'tag-mono'}`}>
                            {wo.status}
                          </span>
                        </div>
                      </div>

                      <div className="eng-row-sub">
                        {isEn ? wo.summaryEn : wo.summaryId}
                      </div>
                      <div className="eng-row-sub">
                        {isEn ? 'Assigned Crew' : 'Tim Pelaksana'}: {isEn ? wo.crewEn : wo.crewId} | {wo.createdAt}
                      </div>

                      {wo.status !== 'COMPLETED' && (
                        <div style={{ marginTop: '6px' }}>
                          <button type="button" className="btn btn-sm" onClick={() => advanceWorkOrder(wo.id)}>
                            {wo.status === 'OPEN'
                              ? (isEn ? 'Start Repair (IN_PROGRESS)' : 'Mulai Perbaikan (IN_PROGRESS)')
                              : (isEn ? 'Mark COMPLETED' : 'Tandai COMPLETED')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
