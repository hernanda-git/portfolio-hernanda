import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { downloadTextFile, simpleHash, slugFile } from './engineHelpers';
import type { DomainEngineProps } from './engineTypes';
import './engine-shell.css';

type HubCode = 'JKT' | 'SMG' | 'SUB' | 'UPG';
type SlaStatus = 'ON_TIME' | 'AT_RISK' | 'DELAYED' | 'DELIVERED';

interface EpodChecks {
  geofenceLock: boolean;
  receiverOtp: boolean;
  sealIntegrity: boolean;
  weighbridgeTicket: boolean;
}

interface FleetUnit {
  id: string;
  unitCode: string;
  plateOrVessel: string;
  driverName: string;
  backupUnitCode: string;
  cargoEn: string;
  cargoId: string;
  isColdChain: boolean;
  targetTempC: number;
  baseTempC: number;
  baseSpeedKmh: number;
  fromHub: HubCode;
  toHub: HubCode;
  progressPct: number;
  baseEtaMin: number;
  gateSlot: string;
  receiverName: string;
  otpCode: string;
  weighbridgeRef: string;
  rerouted: boolean;
  reassigned: boolean;
  delivered: boolean;
  epodHash: string | null;
  epodSignedAt: string | null;
  checks: EpodChecks;
}

interface AuditEntry {
  id: string;
  at: string;
  unitCode: string;
  messageEn: string;
  messageId: string;
  tone: 'ok' | 'warn' | 'bad' | 'neutral';
}

const HUBS: Array<{ code: HubCode; name: string; port: string; x: number; y: number }> = [
  { code: 'JKT', name: 'Jakarta', port: 'Tanjung Priok', x: 95, y: 155 },
  { code: 'SMG', name: 'Semarang', port: 'Tanjung Emas', x: 295, y: 155 },
  { code: 'SUB', name: 'Surabaya', port: 'Tanjung Perak', x: 495, y: 155 },
  { code: 'UPG', name: 'Makassar', port: 'Soekarno-Hatta Port', x: 675, y: 120 },
];

const INITIAL_UNITS: FleetUnit[] = [
  {
    id: 'unit-1',
    unitCode: 'TRK-JKT-014',
    plateOrVessel: 'B 9284 UXS',
    driverName: 'Budi Santoso',
    backupUnitCode: 'TRK-BKP-102',
    cargoEn: 'Cold-Chain Biologics (2C to 8C)',
    cargoId: 'Biologis Cold-Chain (2C s.d. 8C)',
    isColdChain: true,
    targetTempC: 4.2,
    baseTempC: 4.4,
    baseSpeedKmh: 68,
    fromHub: 'JKT',
    toHub: 'SMG',
    progressPct: 62,
    baseEtaMin: 115,
    gateSlot: 'GATE-SMG-A04',
    receiverName: 'PT Kimia Medika Semarang',
    otpCode: '482910',
    weighbridgeRef: 'WB-2611-8804',
    rerouted: false,
    reassigned: false,
    delivered: false,
    epodHash: null,
    epodSignedAt: null,
    checks: { geofenceLock: true, receiverOtp: true, sealIntegrity: true, weighbridgeTicket: false },
  },
  {
    id: 'unit-2',
    unitCode: 'TRK-SMG-027',
    plateOrVessel: 'H 8412 KPA',
    driverName: 'Agus Wijaya',
    backupUnitCode: 'TRK-BKP-107',
    cargoEn: 'Reefer Export Seafood (-18C)',
    cargoId: 'Seafood Ekspor Reefer (-18C)',
    isColdChain: true,
    targetTempC: -18.0,
    baseTempC: -17.6,
    baseSpeedKmh: 64,
    fromHub: 'SMG',
    toHub: 'SUB',
    progressPct: 54,
    baseEtaMin: 140,
    gateSlot: 'GATE-SUB-C11',
    receiverName: 'Tanjung Perak Reefer Terminal',
    otpCode: '739204',
    weighbridgeRef: 'WB-2611-8819',
    rerouted: false,
    reassigned: false,
    delivered: false,
    epodHash: null,
    epodSignedAt: null,
    checks: { geofenceLock: true, receiverOtp: false, sealIntegrity: true, weighbridgeTicket: false },
  },
  {
    id: 'unit-3',
    unitCode: 'VSL-SUB-009',
    plateOrVessel: 'KM Nusantara VIII',
    driverName: 'Capt. Hendra Putra',
    backupUnitCode: 'VSL-BKP-012',
    cargoEn: 'Containerized Nickel Cathode',
    cargoId: 'Kontainer Katoda Nikel',
    isColdChain: false,
    targetTempC: 27.0,
    baseTempC: 27.5,
    baseSpeedKmh: 31,
    fromHub: 'SUB',
    toHub: 'UPG',
    progressPct: 48,
    baseEtaMin: 260,
    gateSlot: 'BERTH-UPG-02',
    receiverName: 'Makassar Container Yard 2',
    otpCode: '194558',
    weighbridgeRef: 'WB-2611-8833',
    rerouted: false,
    reassigned: false,
    delivered: false,
    epodHash: null,
    epodSignedAt: null,
    checks: { geofenceLock: false, receiverOtp: false, sealIntegrity: true, weighbridgeTicket: true },
  },
  {
    id: 'unit-4',
    unitCode: 'TRK-JKT-041',
    plateOrVessel: 'B 9771 FQA',
    driverName: 'Rizky Pratama',
    backupUnitCode: 'TRK-BKP-115',
    cargoEn: 'FMCG Palletized Dry Goods',
    cargoId: 'Barang Kering Palet FMCG',
    isColdChain: false,
    targetTempC: 24.0,
    baseTempC: 24.8,
    baseSpeedKmh: 72,
    fromHub: 'JKT',
    toHub: 'SUB',
    progressPct: 78,
    baseEtaMin: 85,
    gateSlot: 'GATE-SUB-B06',
    receiverName: 'DC Rungkut Surabaya',
    otpCode: '605129',
    weighbridgeRef: 'WB-2611-8842',
    rerouted: false,
    reassigned: false,
    delivered: false,
    epodHash: null,
    epodSignedAt: null,
    checks: { geofenceLock: true, receiverOtp: true, sealIntegrity: true, weighbridgeTicket: true },
  },
];

function formatEta(minutes: number, isEn: boolean): string {
  if (minutes <= 0) return isEn ? 'Arrived' : 'Tiba';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getHubCoords(code: HubCode) {
  return HUBS.find((h) => h.code === code) ?? HUBS[0];
}

function computeUnitPosition(unit: FleetUnit): { x: number; y: number } {
  const from = getHubCoords(unit.fromHub);
  const to = getHubCoords(unit.toHub);
  const t = unit.delivered ? 1 : Math.min(0.95, Math.max(0.08, unit.progressPct / 100));
  const x = from.x + (to.x - from.x) * t;
  const baseY = from.y + (to.y - from.y) * t;
  const arcOffset = unit.rerouted ? -52 * Math.sin(Math.PI * t) : 14 * Math.sin(Math.PI * t);
  return { x, y: baseY + arcOffset };
}

export default function GeoDispatchEngine({ project }: DomainEngineProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'corridor' | 'epod'>('corridor');
  const [units, setUnits] = useState<FleetUnit[]>(INITIAL_UNITS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_UNITS[0].id);
  const [portCongestion, setPortCongestion] = useState<boolean>(false);
  const [tempBreach, setTempBreach] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    {
      id: 'aud-init',
      at: '15:02:10',
      unitCode: 'SYSTEM',
      messageEn: 'Corridor telemetry sync active across 4 regional hubs (JKT, SMG, SUB, UPG).',
      messageId: 'Sinkronisasi telemetri koridor aktif di 4 hub regional (JKT, SMG, SUB, UPG).',
      tone: 'neutral',
    },
  ]);

  const appendAudit = (unitCode: string, messageEn: string, messageId: string, tone: AuditEntry['tone']) => {
    const now = new Date();
    const at = now.toTimeString().slice(0, 8);
    setAuditLog((prev) => [
      { id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at, unitCode, messageEn, messageId, tone },
      ...prev.slice(0, 9),
    ]);
  };

  const derivedUnits = useMemo(() => {
    return units.map((u) => {
      const congestionAffected = portCongestion && !u.delivered && (u.toHub === 'SUB' || u.fromHub === 'SUB' || u.toHub === 'SMG');
      const breachAffected = tempBreach && u.isColdChain && !u.delivered && !u.reassigned;

      const delayMin = congestionAffected ? (u.rerouted ? 20 : 90) : 0;
      const effectiveEtaMin = u.delivered ? 0 : Math.max(10, u.baseEtaMin + delayMin - (u.reassigned ? 12 : 0));
      const effectiveSpeed = u.delivered
        ? 0
        : Math.max(12, u.baseSpeedKmh - (congestionAffected && !u.rerouted ? 26 : 0) + (u.reassigned ? 6 : 0));
      const effectiveTempC = breachAffected ? Number((u.targetTempC + 7.4).toFixed(1)) : u.baseTempC;

      let sla: SlaStatus = 'ON_TIME';
      if (u.delivered) {
        sla = 'DELIVERED';
      } else if (breachAffected || (congestionAffected && !u.rerouted)) {
        sla = 'DELAYED';
      } else if (congestionAffected && u.rerouted) {
        sla = 'AT_RISK';
      }

      return {
        ...u,
        congestionAffected,
        breachAffected,
        delayMin,
        effectiveEtaMin,
        effectiveSpeed,
        effectiveTempC,
        sla,
      };
    });
  }, [units, portCongestion, tempBreach]);

  const selectedUnit = useMemo(
    () => derivedUnits.find((u) => u.id === selectedId) ?? derivedUnits[0],
    [derivedUnits, selectedId]
  );

  const kpis = useMemo(() => {
    const total = derivedUnits.length;
    const deliveredCount = derivedUnits.filter((u) => u.delivered).length;
    const activeCount = total - deliveredCount;
    const onTimeCount = derivedUnits.filter((u) => u.sla === 'ON_TIME' || u.sla === 'DELIVERED').length;
    const slaPct = Math.round((onTimeCount / total) * 100);
    const alertCount = derivedUnits.filter((u) => u.sla === 'DELAYED' || u.sla === 'AT_RISK' || u.breachAffected).length;
    return { total, activeCount, deliveredCount, slaPct, alertCount };
  }, [derivedUnits]);

  const injectPortCongestion = () => {
    setPortCongestion(true);
    appendAudit(
      'PORT-SUB',
      'Port Congestion (+90m) injected on Semarang-Surabaya maritime gate corridor.',
      'Kemacetan Pelabuhan (+90m) diinjeksi pada koridor gerbang laut Semarang-Surabaya.',
      'warn'
    );
  };

  const injectTempBreach = () => {
    setTempBreach(true);
    appendAudit(
      'REEFER-MON',
      'Cold-Chain Temp Breach injected (+7.4C thermal drift on active reefer units).',
      'Pelanggaran Suhu Cold-Chain diinjeksi (deviasi termal +7.4C pada unit reefer aktif).',
      'bad'
    );
  };

  const clearDisruptions = () => {
    setPortCongestion(false);
    setTempBreach(false);
    appendAudit(
      'DISPATCH-OPS',
      'All corridor disruptions cleared. Fleet ETAs and cold-chain telemetry normalized.',
      'Semua gangguan koridor dibersihkan. ETA armada dan telemetri cold-chain kembali normal.',
      'ok'
    );
  };

  const reassignBackupUnit = (unitId: string) => {
    const target = derivedUnits.find((u) => u.id === unitId);
    if (!target || target.delivered) return;
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              unitCode: u.backupUnitCode,
              reassigned: true,
              baseTempC: u.targetTempC,
            }
          : u
      )
    );
    appendAudit(
      target.backupUnitCode,
      `Reassigned cargo from ${target.unitCode} to standby unit ${target.backupUnitCode}; thermal seal stabilized.`,
      `Muatan dialihkan dari ${target.unitCode} ke unit cadangan ${target.backupUnitCode}; segel termal stabil.`,
      'ok'
    );
  };

  const rerouteCorridor = (unitId: string) => {
    const target = derivedUnits.find((u) => u.id === unitId);
    if (!target || target.delivered) return;
    const nextRerouted = !target.rerouted;
    setUnits((prev) => prev.map((u) => (u.id === unitId ? { ...u, rerouted: nextRerouted } : u)));
    appendAudit(
      target.unitCode,
      nextRerouted
        ? `Rerouted ${target.unitCode} onto northern bypass corridor (-70m congestion recovery).`
        : `Restored ${target.unitCode} to primary corridor path.`,
      nextRerouted
        ? `Rute ${target.unitCode} dialihkan ke koridor bypass utara (pemulihan kemacetan -70m).`
        : `Rute ${target.unitCode} dikembalikan ke jalur koridor utama.`,
      nextRerouted ? 'ok' : 'neutral'
    );
  };

  const toggleEpodCheck = (unitId: string, key: keyof EpodChecks) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId || u.delivered) return u;
        return {
          ...u,
          checks: {
            ...u.checks,
            [key]: !u.checks[key],
          },
        };
      })
    );
  };

  const signEpodDelivery = (unitId: string) => {
    const target = derivedUnits.find((u) => u.id === unitId);
    if (!target || target.delivered) return;
    const allPassed =
      target.checks.geofenceLock &&
      target.checks.receiverOtp &&
      target.checks.sealIntegrity &&
      target.checks.weighbridgeTicket;
    if (!allPassed) return;

    const signedAt = new Date().toISOString();
    const hash = simpleHash(`${target.unitCode}|${target.gateSlot}|${target.otpCode}|${target.weighbridgeRef}|${signedAt}`);
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              delivered: true,
              progressPct: 100,
              epodHash: `EPOD-${hash.toUpperCase()}`,
              epodSignedAt: signedAt,
            }
          : u
      )
    );
    appendAudit(
      target.unitCode,
      `e-POD signed at ${target.gateSlot}. Status locked to DELIVERED (${hash.slice(0, 10)}).`,
      `e-POD ditandatangani di ${target.gateSlot}. Status dikunci DELIVERED (${hash.slice(0, 10)}).`,
      'ok'
    );
  };

  const exportManifestCsv = () => {
    const header = 'UnitCode,PlateOrVessel,From,To,Cargo,SpeedKmh,TempC,EtaMin,GateSlot,SLA,Rerouted,Reassigned,Delivered,EpodHash';
    const rows = derivedUnits.map((u) => {
      const cargo = isEn ? u.cargoEn : u.cargoId;
      return [
        u.unitCode,
        `"${u.plateOrVessel}"`,
        u.fromHub,
        u.toHub,
        `"${cargo.replace(/"/g, '""')}"`,
        u.effectiveSpeed,
        u.effectiveTempC,
        u.effectiveEtaMin,
        u.gateSlot,
        u.sla,
        u.rerouted,
        u.reassigned,
        u.delivered,
        u.epodHash ?? 'PENDING',
      ].join(',');
    });
    downloadTextFile(`${slugFile(project.name)}-dispatch-manifest.csv`, [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  const checksPassedCount = (c: EpodChecks) =>
    [c.geofenceLock, c.receiverOtp, c.sealIntegrity, c.weighbridgeTicket].filter(Boolean).length;

  const allSelectedChecksPassed = checksPassedCount(selectedUnit.checks) === 4;

  const slaTagClass = (sla: SlaStatus) => {
    if (sla === 'DELIVERED' || sla === 'ON_TIME') return 'tag-ok';
    if (sla === 'AT_RISK') return 'tag-warn';
    return 'tag-bad';
  };

  const slaLabel = (sla: SlaStatus) => {
    if (sla === 'DELIVERED') return isEn ? 'DELIVERED (e-POD Signed)' : 'DELIVERED (e-POD Sah)';
    if (sla === 'ON_TIME') return isEn ? 'ON TIME' : 'TEPAT WAKTU';
    if (sla === 'AT_RISK') return isEn ? 'AT RISK (REROUTED)' : 'BERISIKO (DIALIHKAN)';
    return isEn ? 'DELAYED / BREACH' : 'TERLAMBAT / GANGGUAN';
  };

  const slaStrokeColor = (sla: SlaStatus) => {
    if (sla === 'DELIVERED' || sla === 'ON_TIME') return 'var(--ui-ok)';
    if (sla === 'AT_RISK') return 'var(--ui-warn)';
    return 'var(--ui-bad)';
  };

  return (
    <section className="eng-shell" aria-label={`${project.name} Geo-Dispatch Engine`}>
      <div className="eng-topbar">
        <div>
          <div className="eng-eyebrow">
            <span className={`status-dot ${kpis.alertCount > 0 ? 'warn' : 'ok'}`} />
            <span>{project.id} | {isEn ? 'Corridor Dispatch & e-POD Engine' : 'Engine Dispatch Koridor & e-POD'}</span>
            <span>|</span>
            <span>{project.standards.slice(0, 2).join(' | ')}</span>
          </div>
          <h2 className="eng-title">{project.name}</h2>
        </div>

        <div className="eng-actions">
          <button
            type="button"
            className="btn btn-sm"
            onClick={injectPortCongestion}
            disabled={portCongestion}
          >
            {isEn ? 'Port Congestion (+90m)' : 'Kemacetan Pelabuhan (+90m)'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={injectTempBreach}
            disabled={tempBreach}
          >
            {isEn ? 'Cold-Chain Temp Breach' : 'Pelanggaran Suhu Cold-Chain'}
          </button>
          {(portCongestion || tempBreach) && (
            <button type="button" className="btn btn-sm" onClick={clearDisruptions}>
              {isEn ? 'Clear Disruptions' : 'Hapus Gangguan'}
            </button>
          )}
          <button type="button" className="btn btn-sm btn-primary" onClick={exportManifestCsv}>
            {isEn ? 'Export Dispatch Manifest CSV' : 'Ekspor Manifest Dispatch CSV'}
          </button>
        </div>
      </div>

      <div className="eng-kpi-row">
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Active Fleet Units' : 'Unit Armada Aktif'}</span>
          <span className="eng-kpi-val is-accent">{kpis.activeCount} / {kpis.total}</span>
          <span className="eng-kpi-sub">
            {isEn ? 'JKT - SMG - SUB - UPG corridor' : 'Koridor JKT - SMG - SUB - UPG'}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'On-Time SLA %' : 'SLA Tepat Waktu %'}</span>
          <span className={`eng-kpi-val ${kpis.slaPct >= 75 ? 'is-ok' : kpis.slaPct >= 50 ? 'is-warn' : 'is-bad'}`}>
            {kpis.slaPct}%
          </span>
          <span className="eng-kpi-sub">
            {isEn ? 'Live corridor gate window' : 'Jendela gerbang koridor live'}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Disruption Alerts' : 'Peringatan Gangguan'}</span>
          <span className={`eng-kpi-val ${kpis.alertCount === 0 ? 'is-ok' : 'is-bad'}`}>
            {kpis.alertCount}
          </span>
          <span className="eng-kpi-sub">
            {portCongestion || tempBreach
              ? (isEn ? 'Active incident flags' : 'Flag insiden aktif')
              : (isEn ? 'Corridor nominal' : 'Koridor nominal')}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Signed e-PODs' : 'e-POD Ditandatangani'}</span>
          <span className={`eng-kpi-val ${kpis.deliveredCount > 0 ? 'is-ok' : ''}`}>
            {kpis.deliveredCount} / {kpis.total}
          </span>
          <span className="eng-kpi-sub">
            {isEn ? '4-point gate verification' : 'Verifikasi gerbang 4 titik'}
          </span>
        </div>
      </div>

      {(portCongestion || tempBreach) && (
        <div className={`eng-banner ${tempBreach ? 'is-bad' : 'is-warn'}`}>
          {portCongestion && (
            <div>
              {isEn
                ? 'ACTIVE DISRUPTION: Port Congestion (+90m) impacting Tanjung Emas (SMG) and Tanjung Perak (SUB) approaches. Reroute affected units to bypass corridor.'
                : 'GANGGUAN AKTIF: Kemacetan Pelabuhan (+90m) berdampak pada akses Tanjung Emas (SMG) dan Tanjung Perak (SUB). Alihkan rute unit terdampak ke koridor bypass.'}
            </div>
          )}
          {tempBreach && (
            <div>
              {isEn
                ? 'ACTIVE DISRUPTION: Cold-Chain Temp Breach detected (+7.4C excursion). Reassign backup reefer unit immediately to protect cargo integrity.'
                : 'GANGGUAN AKTIF: Pelanggaran Suhu Cold-Chain terdeteksi (deviasi +7.4C). Alihkan ke unit reefer cadangan segera untuk menjaga integritas muatan.'}
            </div>
          )}
        </div>
      )}

      <div className="eng-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'corridor'}
          className={`lens-chip ${activeTab === 'corridor' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('corridor')}
        >
          {isEn ? '01 Corridor Route & Live Fleet Map' : '01 Rute Koridor & Peta Armada Live'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'epod'}
          className={`lens-chip ${activeTab === 'epod' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('epod')}
        >
          {isEn ? '02 e-POD & Gate Slot Verification' : '02 Verifikasi e-POD & Slot Gerbang'}
        </button>
      </div>

      {activeTab === 'corridor' ? (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Interactive Corridor Schematic (JKT -> SMG -> SUB -> UPG)' : 'Skematik Koridor Interaktif (JKT -> SMG -> SUB -> UPG)'}
              </h3>
              <span className="tag tag-mono">
                {isEn ? 'Click unit to inspect' : 'Klik unit untuk inspeksi'}
              </span>
            </div>
            <div className="eng-card-body">
              <div className="eng-svg-stage">
                <svg viewBox="0 0 760 280" role="img" aria-label={isEn ? 'Corridor Fleet Map' : 'Peta Armada Koridor'}>
                  {/* Subtle coordinate grid */}
                  <defs>
                    <pattern id="geo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--ui-line)" strokeWidth="0.6" opacity="0.55" />
                    </pattern>
                  </defs>
                  <rect width="760" height="280" fill="url(#geo-grid)" rx="4" />

                  {/* Alternate bypass / Ro-Ro reroute arcs */}
                  <path
                    d="M 95 155 Q 195 75 295 155 Q 395 75 495 155 Q 585 60 675 120"
                    fill="none"
                    stroke="var(--ui-accent)"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    opacity="0.55"
                  />
                  <text x="395" y="72" textAnchor="middle" fill="var(--ui-accent-ink)" fontSize="10" fontFamily="var(--ui-mono)">
                    {isEn ? 'BYPASS / RO-RO REROUTE CORRIDOR' : 'KORIDOR BYPASS / RO-RO ALTERNATIF'}
                  </text>

                  {/* Primary arterial corridor */}
                  <path
                    d="M 95 155 L 295 155 L 495 155 L 675 120"
                    fill="none"
                    stroke="var(--ui-line-strong)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Congestion zone ring at SMG / SUB */}
                  {portCongestion && (
                    <g>
                      <circle cx="295" cy="155" r="28" fill="var(--ui-warn-soft)" stroke="var(--ui-warn)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
                      <circle cx="495" cy="155" r="32" fill="var(--ui-bad-soft)" stroke="var(--ui-bad)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
                      <text x="495" y="203" textAnchor="middle" fill="var(--ui-bad)" fontSize="10" fontWeight="600" fontFamily="var(--ui-mono)">
                        {isEn ? 'CONGESTION +90m' : 'MACET +90m'}
                      </text>
                    </g>
                  )}

                  {/* Corridor Hubs */}
                  {HUBS.map((hub) => (
                    <g key={hub.code}>
                      <circle cx={hub.x} cy={hub.y} r="11" fill="var(--ui-surface)" stroke="var(--ui-text)" strokeWidth="2.5" />
                      <circle cx={hub.x} cy={hub.y} r="4" fill="var(--ui-accent)" />
                      <text x={hub.x} y={hub.y + 26} textAnchor="middle" fill="var(--ui-text)" fontSize="11.5" fontWeight="700" fontFamily="var(--ui-mono)">
                        {hub.code} ({hub.name})
                      </text>
                      <text x={hub.x} y={hub.y + 40} textAnchor="middle" fill="var(--ui-text-muted)" fontSize="9.5">
                        {hub.port}
                      </text>
                    </g>
                  ))}

                  {/* Active Fleet Units */}
                  {derivedUnits.map((unit, idx) => {
                    const pos = computeUnitPosition(unit);
                    const isSelected = unit.id === selectedUnit.id;
                    const stroke = slaStrokeColor(unit.sla);
                    const labelOffsetY = idx % 2 === 0 ? -24 : 28;
                    return (
                      <g
                        key={unit.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedId(unit.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${unit.unitCode} ${unit.fromHub} to ${unit.toHub}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedId(unit.id);
                          }
                        }}
                      >
                        {isSelected && (
                          <circle cx={pos.x} cy={pos.y} r="18" fill="none" stroke="var(--ui-accent)" strokeWidth="2" strokeDasharray="3 2" />
                        )}
                        <circle cx={pos.x} cy={pos.y} r="11" fill="var(--ui-surface)" stroke={stroke} strokeWidth="3" />
                        <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fill="var(--ui-text)" fontSize="9" fontWeight="700" fontFamily="var(--ui-mono)">
                          {unit.isColdChain ? 'RF' : 'FL'}
                        </text>
                        <rect
                          x={pos.x - 52}
                          y={pos.y + labelOffsetY - 11}
                          width="104"
                          height="24"
                          rx="4"
                          fill="var(--ui-surface)"
                          stroke={isSelected ? 'var(--ui-accent)' : stroke}
                          strokeWidth={isSelected ? '1.6' : '1'}
                        />
                        <text x={pos.x} y={pos.y + labelOffsetY} textAnchor="middle" fill="var(--ui-text)" fontSize="9.5" fontWeight="700" fontFamily="var(--ui-mono)">
                          {unit.unitCode}
                        </text>
                        <text x={pos.x} y={pos.y + labelOffsetY + 10} textAnchor="middle" fill="var(--ui-text-2)" fontSize="8.5" fontFamily="var(--ui-mono)">
                          {unit.effectiveSpeed}km/h | {unit.effectiveTempC}C | {formatEta(unit.effectiveEtaMin, isEn)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="eng-list" style={{ border: '1px solid var(--ui-line)', borderRadius: 'var(--ui-r-3)' }}>
                {derivedUnits.map((unit) => (
                  <button
                    key={unit.id}
                    type="button"
                    className={`eng-row ${unit.id === selectedUnit.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(unit.id)}
                  >
                    <div className="eng-row-main">
                      <div className="eng-row-title" style={{ fontFamily: 'var(--ui-mono)' }}>
                        {unit.unitCode} ({unit.fromHub} -&gt; {unit.toHub})
                      </div>
                      <div className="eng-row-sub">
                        {isEn ? unit.cargoEn : unit.cargoId} | {unit.effectiveSpeed} km/h | {unit.effectiveTempC}C | ETA {formatEta(unit.effectiveEtaMin, isEn)}
                      </div>
                    </div>
                    <span className={`tag ${slaTagClass(unit.sla)}`}>{slaLabel(unit.sla)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Unit Dispatch Inspector' : 'Inspektor Dispatch Unit'}
              </h3>
              <span className={`tag ${slaTagClass(selectedUnit.sla)}`}>{slaLabel(selectedUnit.sla)}</span>
            </div>
            <div className="eng-card-body">
              <div className="eng-kv-list">
                <span className="eng-kv-k">{isEn ? 'Unit / Asset' : 'Unit / Aset'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>
                  {selectedUnit.unitCode} ({selectedUnit.plateOrVessel})
                </span>
                <span className="eng-kv-k">{isEn ? 'Operator' : 'Pengemudi / Nakhoda'}</span>
                <span className="eng-kv-v">{selectedUnit.driverName}</span>
                <span className="eng-kv-k">{isEn ? 'Cargo Type' : 'Jenis Muatan'}</span>
                <span className="eng-kv-v">{isEn ? selectedUnit.cargoEn : selectedUnit.cargoId}</span>
                <span className="eng-kv-k">{isEn ? 'Corridor Leg' : 'Rute Koridor'}</span>
                <span className="eng-kv-v">
                  {selectedUnit.fromHub} -&gt; {selectedUnit.toHub} ({selectedUnit.rerouted ? (isEn ? 'Bypass Rerouted' : 'Rute Bypass') : (isEn ? 'Primary Arterial' : 'Jalur Utama')})
                </span>
                <span className="eng-kv-k">{isEn ? 'Speed / Temp' : 'Kecepatan / Suhu'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>
                  {selectedUnit.effectiveSpeed} km/h | {selectedUnit.effectiveTempC}C ({isEn ? 'target' : 'target'} {selectedUnit.targetTempC}C)
                </span>
                <span className="eng-kv-k">{isEn ? 'Projected ETA' : 'Estimasi ETA'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>
                  {formatEta(selectedUnit.effectiveEtaMin, isEn)} {selectedUnit.delayMin > 0 ? `(+${selectedUnit.delayMin}m)` : ''}
                </span>
                <span className="eng-kv-k">{isEn ? 'Assigned Gate' : 'Slot Gerbang'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>{selectedUnit.gateSlot}</span>
              </div>

              {selectedUnit.breachAffected && (
                <div className="eng-banner is-bad">
                  {isEn
                    ? `Cold-chain excursion active (${selectedUnit.effectiveTempC}C vs ${selectedUnit.targetTempC}C target). Use Reassign Backup Unit to swap cargo into ${selectedUnit.backupUnitCode}.`
                    : `Deviasi suhu cold-chain aktif (${selectedUnit.effectiveTempC}C vs target ${selectedUnit.targetTempC}C). Gunakan Alihkan Unit Cadangan ke ${selectedUnit.backupUnitCode}.`}
                </div>
              )}

              {selectedUnit.congestionAffected && !selectedUnit.rerouted && (
                <div className="eng-banner is-warn">
                  {isEn
                    ? 'Port gate queue adding +90m delay. Use Reroute Corridor to shift onto bypass Ro-Ro corridor.'
                    : 'Antrean gerbang pelabuhan menambah +90m keterlambatan. Gunakan Alihkan Rute Koridor ke jalur bypass Ro-Ro.'}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={selectedUnit.delivered || selectedUnit.reassigned}
                  onClick={() => reassignBackupUnit(selectedUnit.id)}
                >
                  {selectedUnit.reassigned
                    ? (isEn ? 'Backup Unit Active' : 'Unit Cadangan Aktif')
                    : (isEn ? 'Reassign Backup Unit' : 'Alihkan Unit Cadangan')}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={selectedUnit.delivered}
                  onClick={() => rerouteCorridor(selectedUnit.id)}
                >
                  {selectedUnit.rerouted
                    ? (isEn ? 'Restore Primary Route' : 'Kembalikan Rute Utama')
                    : (isEn ? 'Reroute Corridor' : 'Alihkan Rute Koridor')}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setActiveTab('epod')}
                >
                  {isEn ? 'Verify e-POD & Gate' : 'Verifikasi e-POD & Gerbang'}
                </button>
              </div>

              <div>
                <div className="eng-field-label">{isEn ? 'Live Corridor Event Stream' : 'Aliran Event Koridor Live'}</div>
                <pre className="eng-code">
                  {auditLog
                    .map((entry) => `[${entry.at}] [${entry.unitCode}] ${isEn ? entry.messageEn : entry.messageId}`)
                    .join('\n')}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Gate Slot & Unit Queue' : 'Antrean Slot Gerbang & Unit'}</h3>
              <span className="tag tag-mono">{kpis.deliveredCount}/{kpis.total} {isEn ? 'Signed' : 'Sah'}</span>
            </div>
            <div className="eng-list">
              {derivedUnits.map((unit) => {
                const passed = checksPassedCount(unit.checks);
                return (
                  <button
                    key={unit.id}
                    type="button"
                    className={`eng-row ${unit.id === selectedUnit.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(unit.id)}
                  >
                    <div className="eng-row-main">
                      <div className="eng-row-title" style={{ fontFamily: 'var(--ui-mono)' }}>
                        {unit.unitCode} | {unit.gateSlot}
                      </div>
                      <div className="eng-row-sub">
                        {unit.receiverName} | {isEn ? 'Checks' : 'Cek'}: {passed}/4
                      </div>
                    </div>
                    <span className={`tag ${slaTagClass(unit.sla)}`}>{slaLabel(unit.sla)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Electronic Proof of Delivery (e-POD) Checklist' : 'Daftar Periksa e-POD & Verifikasi Gerbang'}
              </h3>
              <span className="tag tag-mono">{selectedUnit.unitCode}</span>
            </div>
            <div className="eng-card-body">
              <div className="eng-kv-list">
                <span className="eng-kv-k">{isEn ? 'Receiver' : 'Penerima'}</span>
                <span className="eng-kv-v">{selectedUnit.receiverName}</span>
                <span className="eng-kv-k">{isEn ? 'Gate Slot' : 'Slot Gerbang'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>{selectedUnit.gateSlot}</span>
                <span className="eng-kv-k">{isEn ? 'OTP Handshake' : 'Kode OTP'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>{selectedUnit.otpCode}</span>
                <span className="eng-kv-k">{isEn ? 'Weighbridge Ref' : 'Ref Timbangan'}</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>{selectedUnit.weighbridgeRef}</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--ui-text-2)', fontWeight: 600 }}>
                    {isEn ? 'Verification Readiness' : 'Kesiapan Verifikasi'}
                  </span>
                  <span style={{ fontFamily: 'var(--ui-mono)' }}>
                    {checksPassedCount(selectedUnit.checks)} / 4
                  </span>
                </div>
                <div className="eng-bar-track">
                  <div
                    className={`eng-bar-fill ${allSelectedChecksPassed ? 'is-ok' : ''}`}
                    style={{ width: `${(checksPassedCount(selectedUnit.checks) / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="eng-list" style={{ border: '1px solid var(--ui-line)', borderRadius: 'var(--ui-r-3)' }}>
                {(
                  [
                    {
                      key: 'geofenceLock' as const,
                      titleEn: 'GPS Geofence Lock',
                      titleId: 'Kunci Geofence GPS',
                      subEn: 'Unit coordinate verified within 150m of destination port/hub gate',
                      subId: 'Koordinat unit terverifikasi dalam radius 150m dari gerbang hub tujuan',
                    },
                    {
                      key: 'receiverOtp' as const,
                      titleEn: 'Receiver OTP Verified',
                      titleId: 'OTP Penerima Terverifikasi',
                      subEn: `Consignee 6-digit token (${selectedUnit.otpCode}) matched`,
                      subId: `Token 6 digit penerima (${selectedUnit.otpCode}) cocok`,
                    },
                    {
                      key: 'sealIntegrity' as const,
                      titleEn: 'Seal Integrity Check',
                      titleId: 'Pemeriksaan Integritas Segel',
                      subEn: 'Smart e-seal tamper loop intact with zero unauthorized opens',
                      subId: 'Loop tamper e-seal pintar utuh tanpa pembukaan tidak sah',
                    },
                    {
                      key: 'weighbridgeTicket' as const,
                      titleEn: 'Weighbridge Ticket',
                      titleId: 'Tiket Jembatan Timbang',
                      subEn: `Gross/tare ticket ${selectedUnit.weighbridgeRef} within 0.5% tolerance`,
                      subId: `Tiket bruto/tara ${selectedUnit.weighbridgeRef} dalam toleransi 0.5%`,
                    },
                  ]
                ).map((item) => {
                  const checked = selectedUnit.checks[item.key];
                  return (
                    <label
                      key={item.key}
                      className="eng-row"
                      style={{ cursor: selectedUnit.delivered ? 'default' : 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={selectedUnit.delivered}
                          onChange={() => toggleEpodCheck(selectedUnit.id, item.key)}
                        />
                        <div className="eng-row-main">
                          <div className="eng-row-title">{isEn ? item.titleEn : item.titleId}</div>
                          <div className="eng-row-sub">{isEn ? item.subEn : item.subId}</div>
                        </div>
                      </div>
                      <span className={`tag ${checked ? 'tag-ok' : 'tag-warn'}`}>
                        {checked ? (isEn ? 'PASS' : 'LULUS') : (isEn ? 'PENDING' : 'MENUNGGU')}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!allSelectedChecksPassed || selectedUnit.delivered}
                  onClick={() => signEpodDelivery(selectedUnit.id)}
                >
                  {selectedUnit.delivered
                    ? 'DELIVERED (e-POD Signed)'
                    : (isEn ? 'Mark DELIVERED (e-POD Signed)' : 'Tandai DELIVERED (e-POD Signed)')}
                </button>
                {!allSelectedChecksPassed && !selectedUnit.delivered && (
                  <span style={{ fontSize: '12px', color: 'var(--ui-text-muted)' }}>
                    {isEn ? 'Complete all 4 verification checks to sign e-POD.' : 'Selesaikan semua 4 pemeriksaan untuk menandatangani e-POD.'}
                  </span>
                )}
              </div>

              {selectedUnit.delivered && selectedUnit.epodHash && (
                <pre className="eng-code">
                  {JSON.stringify(
                    {
                      status: 'DELIVERED (e-POD Signed)',
                      unitCode: selectedUnit.unitCode,
                      gateSlot: selectedUnit.gateSlot,
                      receiver: selectedUnit.receiverName,
                      weighbridgeRef: selectedUnit.weighbridgeRef,
                      signedAt: selectedUnit.epodSignedAt,
                      signatureHash: selectedUnit.epodHash,
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
