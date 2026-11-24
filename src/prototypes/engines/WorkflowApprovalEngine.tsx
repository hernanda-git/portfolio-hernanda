import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { copyToClipboard, downloadTextFile, formatIdr, simpleHash, slugFile } from './engineHelpers';
import type { DomainEngineProps } from './engineTypes';
import './engine-shell.css';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REVISION' | 'ESCALATED' | 'REJECTED';

interface ApprovalRequest {
  id: string;
  sourceApp: string;
  subsidiary: string;
  categoryEn: string;
  categoryId: string;
  titleEn: string;
  titleId: string;
  requester: string;
  costCenter: string;
  amountIdr: number;
  slaHoursRemaining: number;
  status: ApprovalStatus;
  submittedAt: string;
  decisionNote?: string;
  decidedBy?: string;
  decidedAt?: string;
  dictionary: Array<{ key: string; labelEn: string; labelId: string; value: string }>;
}

interface OutboxEvent {
  eventId: string;
  eventType: 'approval.decided.v1';
  exchange: string;
  routingKey: string;
  outboxStatus: 'PUBLISHED' | 'OUTBOX_PENDING';
  idempotencyKey: string;
  occurredAt: string;
  payloadHash: string;
  payload: {
    requestId: string;
    sourceApp: string;
    subsidiary: string;
    decision: ApprovalStatus;
    amountIdr: number;
    effectiveApprover: string;
    doaTier: string;
    vpCeilingIdr: number;
    pjsSubstitutionActive: boolean;
    note: string;
  };
}

interface DoaRouteResult {
  tierCode: 'T1' | 'T2' | 'T3';
  tierLabelEn: string;
  tierLabelId: string;
  standardApprover: string;
  effectiveApprover: string;
  pjsApplied: boolean;
  ceilingEscalated: boolean;
  slaEscalated: boolean;
}

const MANAGER_CEILING_IDR = 100_000_000;
const DEFAULT_VP_CEILING_IDR = 500_000_000;

const INITIAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'APR-2026-8841',
    sourceApp: 'SAP S/4HANA',
    subsidiary: 'PT Nusantara Logistik Tbk',
    categoryEn: 'CAPEX Fleet',
    categoryId: 'CAPEX Armada',
    titleEn: 'Cold-Chain Fleet Renewal (12 Reefer Trucks)',
    titleId: 'Pembaruan Armada Cold-Chain (12 Truk Reefer)',
    requester: 'Dimas Pradipta (Fleet Ops)',
    costCenter: 'CC-LOG-JKT01',
    amountIdr: 420_000_000,
    slaHoursRemaining: 4.5,
    status: 'PENDING',
    submittedAt: '2026-11-24 08:15 WIB',
    dictionary: [
      { key: 'doc_type', labelEn: 'SAP Document Type', labelId: 'Tipe Dokumen SAP', value: 'PR-NB / 4500091822' },
      { key: 'gl_account', labelEn: 'GL Account', labelId: 'Akun GL', value: '1420100 - Heavy Transport Assets' },
      { key: 'vendor_npwp', labelEn: 'Vendor NPWP', labelId: 'NPWP Vendor', value: '01.884.219.4-091.000' },
      { key: 'tkdn_score', labelEn: 'TKDN Verification', labelId: 'Verifikasi TKDN', value: '46.5% (Kemenperin Cert)' },
      { key: 'capex_budget', labelEn: 'Remaining CAPEX Pool', labelId: 'Sisa Pagu CAPEX', value: 'Rp 1.850.000.000' },
      { key: 'payment_rail', labelEn: 'Settlement Rail', labelId: 'Jalur Pembayaran', value: 'BI-FAST Corporate Escrow' },
    ],
  },
  {
    id: 'APR-2026-8842',
    sourceApp: 'eTender BUMN',
    subsidiary: 'PT Energi Karya Persero',
    categoryEn: 'Procurement Award',
    categoryId: 'Penetapan Tender',
    titleEn: '150kV Substation Transformer Award (Batch II)',
    titleId: 'Penetapan Pemenang Trafo Gardu Induk 150kV (Batch II)',
    requester: 'Ir. Wahyu Setiawan (Procurement)',
    costCenter: 'CC-PWR-BDG04',
    amountIdr: 1_250_000_000,
    slaHoursRemaining: 2.0,
    status: 'PENDING',
    submittedAt: '2026-11-24 09:02 WIB',
    dictionary: [
      { key: 'tender_ref', labelEn: 'Tender Reference', labelId: 'Referensi Tender', value: 'TND-BUMN-2026-0419' },
      { key: 'hps_delta', labelEn: 'HPS Variance', labelId: 'Selisih terhadap HPS', value: '-4.2% below Owner Estimate' },
      { key: 'bid_bond', labelEn: 'Bank Guarantee', labelId: 'Jaminan Penawaran', value: 'Bank Mandiri BG-992104' },
      { key: 'tkdn_pct', labelEn: 'Local Content (TKDN)', labelId: 'Capaian TKDN', value: '58.0% Domestic Mfg' },
      { key: 'integrity_pact', labelEn: 'Integrity Pact', labelId: 'Pakta Integritas', value: 'Signed + e-Materai PERURI' },
    ],
  },
  {
    id: 'APR-2026-8843',
    sourceApp: 'InhealthClaim Ops',
    subsidiary: 'Mandiri Inhealth TPA',
    categoryEn: 'Medical Pre-Auth',
    categoryId: 'Pra-Otorisasi Klaim',
    titleEn: 'Inpatient Cardiac Stent Guarantee Letter (GL)',
    titleId: 'Surat Jaminan Rawat Inap Tindakan Ring Jantung',
    requester: 'dr. Ratna Sari (Medical Verifier)',
    costCenter: 'CC-CLM-MED02',
    amountIdr: 85_000_000,
    slaHoursRemaining: 1.5,
    status: 'PENDING',
    submittedAt: '2026-11-24 10:18 WIB',
    dictionary: [
      { key: 'member_card', labelEn: 'Member Policy ID', labelId: 'Nomor Kepesertaan', value: 'INH-9910-4421-08 (Platinum)' },
      { key: 'hospital_provider', labelEn: 'Provider Hospital', labelId: 'RS Pemberi Layanan', value: 'RS Jantung Harapan Kita' },
      { key: 'icd10_primary', labelEn: 'Primary ICD-10', labelId: 'Kode ICD-10 Utama', value: 'I21.4 - Acute Subendocardial MI' },
      { key: 'inacbg_tarif', labelEn: 'INA-CBG Reference', labelId: 'Tarif Acuan INA-CBG', value: 'Rp 81.400.000 (Kelas 1)' },
      { key: 'cob_status', labelEn: 'BPJS CoB Status', labelId: 'Status CoB BPJS', value: 'CoB Active (Split Claim Ready)' },
    ],
  },
  {
    id: 'APR-2026-8844',
    sourceApp: 'Workday HRIS',
    subsidiary: 'Holding Shared Services',
    categoryEn: 'Payroll Batch',
    categoryId: 'Batch Penggajian',
    titleEn: 'Q4 Cross-Entity Shift & Overtime Allowance',
    titleId: 'Tunjangan Shift & Lembur Lintas Entitas Q4',
    requester: 'Nadia Permata (Compensation)',
    costCenter: 'CC-HR-CORP01',
    amountIdr: 145_000_000,
    slaHoursRemaining: 11.0,
    status: 'PENDING',
    submittedAt: '2026-11-24 07:45 WIB',
    dictionary: [
      { key: 'payroll_cycle', labelEn: 'Payroll Cycle', labelId: 'Siklus Gaji', value: '2026-11-CUTOFF-25' },
      { key: 'headcount', labelEn: 'Covered Headcount', labelId: 'Jumlah Karyawan', value: '184 Shift Operators' },
      { key: 'pph21_ter', labelEn: 'Tax Calculation', labelId: 'Metode Pajak PPh 21', value: 'PP 58/2023 TER Category B' },
      { key: 'variance_check', labelEn: 'Budget Variance', labelId: 'Deviasi Anggaran', value: '+3.1% (Within 12% Cap)' },
      { key: 'disbursement_rail', labelEn: 'Payout Rail', labelId: 'Kanal Transfer', value: 'BI-FAST Multi-Bank Payroll' },
    ],
  },
  {
    id: 'APR-2026-8845',
    sourceApp: 'Oracle Fusion ERP',
    subsidiary: 'PT Medika Farma Distribusi',
    categoryEn: 'Emergency OPEX',
    categoryId: 'OPEX Darurat',
    titleEn: 'Vaccine Cold-Room Generator Overhaul (CDOB)',
    titleId: 'Perbaikan Darurat Genset Gudang Vaksin (CDOB)',
    requester: 'Bambang Haryanto (QA Facility)',
    costCenter: 'CC-QA-SBY02',
    amountIdr: 310_000_000,
    slaHoursRemaining: 0.8,
    status: 'ESCALATED',
    submittedAt: '2026-11-24 06:50 WIB',
    dictionary: [
      { key: 'po_reference', labelEn: 'PO Number', labelId: 'Nomor PO', value: 'PO-MF-2026-7712' },
      { key: 'facility_id', labelEn: 'Warehouse Code', labelId: 'Kode Gudang', value: 'WH-CDOB-SBY02 (Surabaya)' },
      { key: 'bpom_risk', labelEn: 'BPOM CDOB Impact', labelId: 'Dampak CDOB BPOM', value: 'Critical (2C-8C Excursion Guard)' },
      { key: 'vendor_sla', labelEn: 'Vendor Response SLA', labelId: 'SLA Teknisi Vendor', value: '4 Hours On-Site Guarantee' },
      { key: 'payment_terms', labelEn: 'Payment Terms', labelId: 'Termin Pembayaran', value: 'NET 14 Post-BAST Signoff' },
    ],
  },
];

const SEED_EVENTS: OutboxEvent[] = [
  {
    eventId: 'EVT-99010',
    eventType: 'approval.decided.v1',
    exchange: 'alur.approval.topic',
    routingKey: 'approval.oracle-fusion.escalated',
    outboxStatus: 'PUBLISHED',
    idempotencyKey: 'idem-APR-2026-8845-esc-01',
    occurredAt: '2026-11-24T09:50:12+07:00',
    payloadHash: simpleHash('APR-2026-8845|ESCALATED|310000000'),
    payload: {
      requestId: 'APR-2026-8845',
      sourceApp: 'Oracle Fusion ERP',
      subsidiary: 'PT Medika Farma Distribusi',
      decision: 'ESCALATED',
      amountIdr: 310_000_000,
      effectiveApprover: 'Budi Santoso, MBA (Finance Director / CFO)',
      doaTier: 'T3',
      vpCeilingIdr: DEFAULT_VP_CEILING_IDR,
      pjsSubstitutionActive: false,
      note: 'Auto-escalated due to SLA below 1.0 hour on CDOB vaccine cold-room facility.',
    },
  },
];

function computeDoaRoute(
  amountIdr: number,
  status: ApprovalStatus,
  vpCeilingIdr: number,
  pjsActive: boolean,
  isEn: boolean
): DoaRouteResult {
  const slaEscalated = status === 'ESCALATED';

  if (amountIdr <= MANAGER_CEILING_IDR && !slaEscalated) {
    return {
      tierCode: 'T1',
      tierLabelEn: 'Tier 1 - Dept Manager (<= Rp 100M)',
      tierLabelId: 'Tier 1 - Manajer Dept (<= Rp 100 Jt)',
      standardApprover: 'Agus Pratama (Dept. Manager)',
      effectiveApprover: 'Agus Pratama (Dept. Manager)',
      pjsApplied: false,
      ceilingEscalated: false,
      slaEscalated: false,
    };
  }

  if (amountIdr <= vpCeilingIdr && !slaEscalated) {
    return {
      tierCode: 'T2',
      tierLabelEn: 'Tier 2 - VP Authority',
      tierLabelId: 'Tier 2 - Otoritas VP',
      standardApprover: 'Hendra Wijaya (VP Operations)',
      effectiveApprover: pjsActive
        ? isEn
          ? 'Rina Kusuma, SE (Pjs. Acting VP)'
          : 'Rina Kusuma, SE (Pjs. VP Sementara)'
        : 'Hendra Wijaya (VP Operations)',
      pjsApplied: pjsActive,
      ceilingEscalated: false,
      slaEscalated: false,
    };
  }

  const ceilingEscalated = amountIdr > vpCeilingIdr;
  return {
    tierCode: 'T3',
    tierLabelEn: 'Tier 3 - Board / CFO Ceiling',
    tierLabelId: 'Tier 3 - Direksi / CFO',
    standardApprover: 'Budi Santoso, MBA (Finance Director / CFO)',
    effectiveApprover: pjsActive
      ? isEn
        ? 'Darmawan Putra (Pjs. Acting CFO)'
        : 'Darmawan Putra (Pjs. Direktur Keuangan)'
      : 'Budi Santoso, MBA (Finance Director / CFO)',
    pjsApplied: pjsActive,
    ceilingEscalated,
    slaEscalated,
  };
}

function statusTagClass(status: ApprovalStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'tag-ok';
    case 'PENDING':
      return 'tag-accent';
    case 'REVISION':
    case 'ESCALATED':
      return 'tag-warn';
    case 'REJECTED':
      return 'tag-bad';
  }
}

export default function WorkflowApprovalEngine({ project }: DomainEngineProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'inbox' | 'doa' | 'outbox'>('inbox');
  const [requests, setRequests] = useState<ApprovalRequest[]>(INITIAL_REQUESTS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_REQUESTS[0].id);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApprovalStatus>('ALL');
  const [decisionNote, setDecisionNote] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [actionBanner, setActionBanner] = useState<string>('');

  const [vpCeilingIdr, setVpCeilingIdr] = useState<number>(DEFAULT_VP_CEILING_IDR);
  const [pjsActive, setPjsActive] = useState<boolean>(false);
  const [pjsReason, setPjsReason] = useState<string>('Cuti Tahunan / Annual Leave (SK-PJS-2026-11)');

  const [outboxEvents, setOutboxEvents] = useState<OutboxEvent[]>(SEED_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(SEED_EVENTS[0].eventId);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? requests[0],
    [requests, selectedId]
  );

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'ALL') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const kpis = useMemo(() => {
    const actionable = requests.filter((r) => r.status === 'PENDING' || r.status === 'ESCALATED');
    const pendingValue = actionable.reduce((sum, r) => sum + r.amountIdr, 0);
    const escalatedCount = requests.filter((r) => r.status === 'ESCALATED').length;
    return {
      pendingCount: actionable.length,
      pendingValue,
      escalatedCount,
      outboxCount: outboxEvents.length,
    };
  }, [requests, outboxEvents]);

  const selectedRoute = useMemo(
    () => computeDoaRoute(selectedRequest.amountIdr, selectedRequest.status, vpCeilingIdr, pjsActive, isEn),
    [selectedRequest, vpCeilingIdr, pjsActive, isEn]
  );

  const selectedEvent = useMemo(
    () => outboxEvents.find((ev) => ev.eventId === selectedEventId) ?? outboxEvents[0],
    [outboxEvents, selectedEventId]
  );

  const executeDecision = (nextStatus: Extract<ApprovalStatus, 'APPROVED' | 'REVISION' | 'ESCALATED' | 'REJECTED'>) => {
    const trimmedNote = decisionNote.trim();
    if ((nextStatus === 'REVISION' || nextStatus === 'REJECTED') && !trimmedNote) {
      setActionError(
        isEn
          ? 'Decision note is mandatory when requesting revision or rejecting a request.'
          : 'Catatan keputusan wajib diisi saat meminta revisi atau menolak pengajuan.'
      );
      setActionBanner('');
      return;
    }

    const routeForEvent = computeDoaRoute(
      selectedRequest.amountIdr,
      nextStatus === 'ESCALATED' ? 'ESCALATED' : selectedRequest.status,
      vpCeilingIdr,
      pjsActive,
      isEn
    );

    const nowIso = new Date().toISOString();
    const noteText =
      trimmedNote ||
      (nextStatus === 'APPROVED'
        ? isEn
          ? 'Approved under active DoA matrix.'
          : 'Disetujui sesuai matriks DoA aktif.'
        : isEn
          ? 'Escalated to next DoA authority tier for SLA protection.'
          : 'Dieskalasikan ke tier otoritas DoA berikutnya untuk menjaga SLA.');

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              status: nextStatus,
              decisionNote: noteText,
              decidedBy: routeForEvent.effectiveApprover,
              decidedAt: nowIso.slice(11, 19) + ' UTC',
            }
          : req
      )
    );

    const nextEventId = `EVT-${99011 + outboxEvents.length}`;
    const appSlug = slugFile(selectedRequest.sourceApp);
    const newEvent: OutboxEvent = {
      eventId: nextEventId,
      eventType: 'approval.decided.v1',
      exchange: 'alur.approval.topic',
      routingKey: `approval.${appSlug}.${nextStatus.toLowerCase()}`,
      outboxStatus: 'PUBLISHED',
      idempotencyKey: `idem-${selectedRequest.id}-${nextStatus.toLowerCase()}-${outboxEvents.length + 1}`,
      occurredAt: nowIso,
      payloadHash: simpleHash(`${selectedRequest.id}|${nextStatus}|${routeForEvent.effectiveApprover}|${nowIso}`),
      payload: {
        requestId: selectedRequest.id,
        sourceApp: selectedRequest.sourceApp,
        subsidiary: selectedRequest.subsidiary,
        decision: nextStatus,
        amountIdr: selectedRequest.amountIdr,
        effectiveApprover: routeForEvent.effectiveApprover,
        doaTier: routeForEvent.tierCode,
        vpCeilingIdr,
        pjsSubstitutionActive: pjsActive,
        note: noteText,
      },
    };

    setOutboxEvents((prev) => [newEvent, ...prev]);
    setSelectedEventId(nextEventId);
    setActionError('');
    setDecisionNote('');
    setActionBanner(
      isEn
        ? `${selectedRequest.id} marked ${nextStatus}. Emitted RabbitMQ outbox event ${nextEventId} (approval.decided.v1).`
        : `${selectedRequest.id} diubah menjadi ${nextStatus}. Event outbox RabbitMQ ${nextEventId} (approval.decided.v1) terkirim.`
    );
  };

  const resetDemo = () => {
    setRequests(INITIAL_REQUESTS);
    setSelectedId(INITIAL_REQUESTS[0].id);
    setOutboxEvents(SEED_EVENTS);
    setSelectedEventId(SEED_EVENTS[0].eventId);
    setVpCeilingIdr(DEFAULT_VP_CEILING_IDR);
    setPjsActive(false);
    setDecisionNote('');
    setActionError('');
    setActionBanner('');
  };

  const exportOutboxJson = () => {
    const bundle = JSON.stringify(
      {
        engine: project.name,
        exportedAt: new Date().toISOString(),
        doaPolicy: {
          managerCeilingIdr: MANAGER_CEILING_IDR,
          vpCeilingIdr,
          pjsSubstitutionActive: pjsActive,
          pjsReason,
        },
        events: outboxEvents,
      },
      null,
      2
    );
    downloadTextFile(`${slugFile(project.name)}-outbox-events.json`, bundle, 'application/json');
  };

  const handleCopyEvent = async () => {
    if (!selectedEvent) return;
    const ok = await copyToClipboard(JSON.stringify(selectedEvent, null, 2));
    if (ok) {
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 1800);
    }
  };

  const selectedEventJson = useMemo(
    () => (selectedEvent ? JSON.stringify(selectedEvent, null, 2) : '{}'),
    [selectedEvent]
  );

  return (
    <section className="eng-shell" aria-label={`${project.name} Workflow Approval Engine`}>
      <div className="eng-topbar">
        <div>
          <div className="eng-eyebrow">
            <span className="status-dot ok" />
            <span>
              {project.id} | {isEn ? 'Unified Approval & DoA Routing Engine' : 'Engine Persetujuan & Routing DoA Terpadu'}
            </span>
            <span>|</span>
            <span>{project.standards.slice(0, 2).join(' | ')}</span>
          </div>
          <h2 className="eng-title">{project.name}</h2>
        </div>
        <div className="eng-actions">
          <button type="button" className="btn btn-sm" onClick={resetDemo}>
            {isEn ? 'Reset Queue' : 'Reset Antrean'}
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={exportOutboxJson}>
            {isEn ? 'Export Outbox JSON' : 'Ekspor Outbox JSON'}
          </button>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="eng-kpi-row">
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Pending Queue' : 'Antrean Menunggu'}</span>
          <span className={`eng-kpi-val ${kpis.pendingCount > 0 ? 'is-warn' : 'is-ok'}`}>
            {kpis.pendingCount} / {requests.length}
          </span>
          <span className="eng-kpi-sub">
            {kpis.escalatedCount} {isEn ? 'SLA escalated' : 'eskalasi SLA'}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Total Value Pending (IDR)' : 'Total Nilai Menunggu (IDR)'}</span>
          <span className="eng-kpi-val is-accent">{formatIdr(kpis.pendingValue, lang)}</span>
          <span className="eng-kpi-sub">{isEn ? 'Across multi-ERP connectors' : 'Lintas konektor multi-ERP'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Active DoA Approver Mode' : 'Mode Approver DoA Aktif'}</span>
          <span className={`eng-kpi-val ${pjsActive ? 'is-warn' : 'is-ok'}`}>
            {pjsActive ? (isEn ? 'Pjs Acting' : 'Pjs Sementara') : isEn ? 'Standard' : 'Standar'}
          </span>
          <span className="eng-kpi-sub">
            {isEn ? `VP Ceiling: ${formatIdr(vpCeilingIdr, lang)}` : `Batas VP: ${formatIdr(vpCeilingIdr, lang)}`}
          </span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Outbox Events Emitted' : 'Event Outbox Terkirim'}</span>
          <span className="eng-kpi-val is-ok">{kpis.outboxCount}</span>
          <span className="eng-kpi-sub">RabbitMQ | approval.decided.v1</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="eng-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inbox'}
          className={`lens-chip ${activeTab === 'inbox' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          {isEn ? '01 Multi-App Approval Inbox & Inspector' : '01 Inbox Persetujuan Multi-Aplikasi'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'doa'}
          className={`lens-chip ${activeTab === 'doa' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('doa')}
        >
          {isEn ? '02 DoA Threshold & Pjs Matrix' : '02 Matriks Batas DoA & Pjs'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'outbox'}
          className={`lens-chip ${activeTab === 'outbox' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('outbox')}
        >
          {isEn ? `03 RabbitMQ Outbox Stream (${outboxEvents.length})` : `03 Stream Outbox RabbitMQ (${outboxEvents.length})`}
        </button>
      </div>

      {/* Tab 01: Executive Multi-App Approval Inbox + Adaptive Key-Value Dictionary Inspector */}
      {activeTab === 'inbox' && (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Unified Multi-App Approval Queue' : 'Antrean Persetujuan Lintas Aplikasi'}</h3>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(['ALL', 'PENDING', 'ESCALATED', 'APPROVED'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`lens-chip ${statusFilter === f ? 'is-active' : ''}`}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="eng-list">
              {filteredRequests.map((req) => {
                const route = computeDoaRoute(req.amountIdr, req.status, vpCeilingIdr, pjsActive, isEn);
                const isSelected = req.id === selectedRequest.id;
                return (
                  <button
                    key={req.id}
                    type="button"
                    className={`eng-row ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedId(req.id);
                      setActionError('');
                      setActionBanner('');
                    }}
                  >
                    <div className="eng-row-main">
                      <div className="eng-row-title">
                        <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)', marginRight: '6px' }}>
                          {req.id}
                        </span>
                        {isEn ? req.titleEn : req.titleId}
                      </div>
                      <div className="eng-row-sub">
                        {req.sourceApp} | {req.subsidiary} | {formatIdr(req.amountIdr, lang)}
                      </div>
                      <div className="eng-row-sub">
                        {isEn ? 'Routed to:' : 'Diarahkan ke:'} <strong>{route.effectiveApprover}</strong> | SLA {req.slaHoursRemaining}h
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span className={`tag ${statusTagClass(req.status)}`}>{req.status}</span>
                      <span className="tag tag-mono">{route.tierCode}</span>
                    </div>
                  </button>
                );
              })}
              {filteredRequests.length === 0 && (
                <div className="eng-card-body">
                  <div className="eng-banner">
                    {isEn ? 'No requests match the active status filter.' : 'Tidak ada pengajuan pada filter status aktif.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Adaptive Dictionary Inspector' : 'Inspektor Kamus Payload Adaptif'}
              </h3>
              <span className={`tag ${statusTagClass(selectedRequest.status)}`}>{selectedRequest.status}</span>
            </div>
            <div className="eng-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)' }}>
                    {selectedRequest.id} | {selectedRequest.sourceApp} | {selectedRequest.costCenter}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                    {isEn ? selectedRequest.titleEn : selectedRequest.titleId}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ui-text-2)', marginTop: '2px' }}>
                    {selectedRequest.subsidiary} | {selectedRequest.requester}
                  </div>
                </div>
                <span className="tag tag-accent" style={{ fontFamily: 'var(--ui-mono)', fontSize: '12px' }}>
                  {formatIdr(selectedRequest.amountIdr, lang)}
                </span>
              </div>

              <div className={`eng-banner ${selectedRoute.pjsApplied || selectedRoute.ceilingEscalated || selectedRoute.slaEscalated ? 'is-warn' : ''}`}>
                <strong>{isEn ? 'Live DoA Route:' : 'Rute DoA Aktif:'}</strong> {selectedRoute.effectiveApprover} ({isEn ? selectedRoute.tierLabelEn : selectedRoute.tierLabelId})
                {selectedRoute.pjsApplied && (
                  <span> | {isEn ? 'Pjs Acting Officer Active' : 'Substitusi Pjs Aktif'}</span>
                )}
                {selectedRoute.ceilingEscalated && (
                  <span> | {isEn ? 'Exceeds VP Ceiling -> CFO' : 'Melebihi Batas VP -> CFO'}</span>
                )}
              </div>

              <div>
                <div className="eng-field-label">
                  {isEn ? 'Source App Key-Value Dictionary' : 'Kamus Key-Value Sumber Aplikasi'}
                </div>
                <div className="eng-kv-list">
                  {selectedRequest.dictionary.map((entry) => (
                    <React.Fragment key={entry.key}>
                      <span className="eng-kv-k">{isEn ? entry.labelEn : entry.labelId}</span>
                      <span className="eng-kv-v">{entry.value}</span>
                    </React.Fragment>
                  ))}
                  {selectedRequest.decisionNote && (
                    <>
                      <span className="eng-kv-k">{isEn ? 'Last Decision Note' : 'Catatan Keputusan'}</span>
                      <span className="eng-kv-v">{selectedRequest.decisionNote}</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="eng-field-label" htmlFor="wf-decision-note">
                  {isEn ? 'Decision Note (Required for Revision / Reject)' : 'Catatan Keputusan (Wajib untuk Revisi / Tolak)'}
                </label>
                <textarea
                  id="wf-decision-note"
                  className="eng-textarea"
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Enter audit note, e.g., Verified TKDN certificate or request revised HPS breakdown...'
                      : 'Masukkan catatan audit, mis. Sertifikat TKDN terverifikasi atau minta rincian HPS...'
                  }
                />
              </div>

              {actionError && <div className="eng-banner is-bad">{actionError}</div>}
              {actionBanner && <div className="eng-banner is-ok">{actionBanner}</div>}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => executeDecision('APPROVED')}>
                  {isEn ? 'Approve' : 'Setujui'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => executeDecision('REVISION')}>
                  {isEn ? 'Request Revision' : 'Minta Revisi'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => executeDecision('ESCALATED')}>
                  {isEn ? 'Escalate SLA' : 'Eskalasi SLA'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => executeDecision('REJECTED')}>
                  {isEn ? 'Reject' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 02: Interactive DoA Threshold & Acting Officer (Pjs) Matrix */}
      {activeTab === 'doa' && (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'DoA Ceiling & Acting Officer (Pjs) Controls' : 'Kontrol Batas DoA & Pejabat Sementara (Pjs)'}
              </h3>
              <span className={`tag ${pjsActive ? 'tag-warn' : 'tag-ok'}`}>
                {pjsActive ? (isEn ? 'Pjs Substitution ON' : 'Substitusi Pjs AKTIF') : (isEn ? 'Standard Hierarchy' : 'Hierarki Standar')}
              </span>
            </div>
            <div className="eng-card-body">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="eng-field-label" htmlFor="vp-ceiling-range" style={{ marginBottom: 0 }}>
                    {isEn ? 'VP Approval Ceiling (IDR)' : 'Batas Wewenang Persetujuan VP (IDR)'}
                  </label>
                  <span style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600, fontSize: '12.5px' }}>
                    {formatIdr(vpCeilingIdr, lang)}
                  </span>
                </div>
                <input
                  id="vp-ceiling-range"
                  type="range"
                  min={100_000_000}
                  max={1_500_000_000}
                  step={50_000_000}
                  value={vpCeilingIdr}
                  onChange={(e) => setVpCeilingIdr(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {[250_000_000, 500_000_000, 1_000_000_000, 1_500_000_000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`lens-chip ${vpCeilingIdr === preset ? 'is-active' : ''}`}
                      onClick={() => setVpCeilingIdr(preset)}
                    >
                      {formatIdr(preset, lang)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="eng-sensor-card" style={{ marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pjsActive}
                    onChange={(e) => setPjsActive(e.target.checked)}
                  />
                  <span>
                    {isEn
                      ? 'Acting Officer (Pjs / Pejabat Sementara) Substitution Active'
                      : 'Aktifkan Substitusi Pejabat Sementara (Pjs)'}
                  </span>
                </label>
                <div>
                  <label className="eng-field-label" htmlFor="pjs-reason">
                    {isEn ? 'Delegation Mandate Basis' : 'Dasar Surat Tugas Delegasi'}
                  </label>
                  <input
                    id="pjs-reason"
                    className="eng-input"
                    value={pjsReason}
                    onChange={(e) => setPjsReason(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="eng-field-label">{isEn ? 'Active Tier Structure' : 'Struktur Tier Wewenang Aktif'}</div>
                <div className="eng-kv-list">
                  <span className="eng-kv-k">Tier 1 (T1)</span>
                  <span className="eng-kv-v">
                    {isEn ? `Up to ${formatIdr(MANAGER_CEILING_IDR, lang)} | Dept. Manager` : `Sampai ${formatIdr(MANAGER_CEILING_IDR, lang)} | Manajer Dept`}
                  </span>
                  <span className="eng-kv-k">Tier 2 (T2)</span>
                  <span className="eng-kv-v">
                    {formatIdr(MANAGER_CEILING_IDR + 1, lang)} - {formatIdr(vpCeilingIdr, lang)} |{' '}
                    {pjsActive ? 'Rina Kusuma, SE (Pjs. VP)' : 'Hendra Wijaya (VP Ops)'}
                  </span>
                  <span className="eng-kv-k">Tier 3 (T3)</span>
                  <span className="eng-kv-v">
                    {isEn ? `Above ${formatIdr(vpCeilingIdr, lang)} or SLA Escalated` : `Di atas ${formatIdr(vpCeilingIdr, lang)} atau Eskalasi SLA`} |{' '}
                    {pjsActive ? 'Darmawan Putra (Pjs. CFO)' : 'Budi Santoso, MBA (CFO)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Live Recomputed Approver Routing' : 'Simulasi Routing Approver Langsung'}
              </h3>
              <span className="tag tag-mono">{requests.length} {isEn ? 'Requests' : 'Pengajuan'}</span>
            </div>
            <div className="eng-list">
              {requests.map((req) => {
                const route = computeDoaRoute(req.amountIdr, req.status, vpCeilingIdr, pjsActive, isEn);
                const defaultRoute = computeDoaRoute(req.amountIdr, req.status, DEFAULT_VP_CEILING_IDR, false, isEn);
                const changed = route.effectiveApprover !== defaultRoute.effectiveApprover || route.tierCode !== defaultRoute.tierCode;
                return (
                  <div key={req.id} className="eng-row" style={{ cursor: 'default' }}>
                    <div className="eng-row-main">
                      <div className="eng-row-title">
                        <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)', marginRight: '6px' }}>
                          {req.id}
                        </span>
                        {req.sourceApp} | {formatIdr(req.amountIdr, lang)}
                      </div>
                      <div className="eng-row-sub">
                        {isEn ? 'Effective Approver:' : 'Approver Efektif:'} <strong>{route.effectiveApprover}</strong>
                      </div>
                      <div className="eng-row-sub">
                        {isEn ? route.tierLabelEn : route.tierLabelId}
                        {route.ceilingEscalated && ` | ${isEn ? 'Rerouted above VP ceiling' : 'Dialihkan di atas batas VP'}`}
                        {route.pjsApplied && ` | ${isEn ? 'Pjs proxy applied' : 'Delegasi Pjs aktif'}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span className={`tag ${changed ? 'tag-warn' : 'tag-ok'}`}>
                        {changed ? (isEn ? 'REROUTED' : 'TERALIH') : 'STANDARD'}
                      </span>
                      <span className="tag tag-mono">{route.tierCode}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 03: RabbitMQ Transactional Outbox Event Stream */}
      {activeTab === 'outbox' && (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'RabbitMQ Transactional Outbox Stream' : 'Stream Transactional Outbox RabbitMQ'}
              </h3>
              <span className="tag tag-ok">approval.decided.v1</span>
            </div>
            <div className="eng-list">
              {outboxEvents.map((ev) => (
                <button
                  key={ev.eventId}
                  type="button"
                  className={`eng-row ${ev.eventId === selectedEvent?.eventId ? 'is-selected' : ''}`}
                  onClick={() => setSelectedEventId(ev.eventId)}
                >
                  <div className="eng-row-main">
                    <div className="eng-row-title">
                      <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)', marginRight: '6px' }}>
                        {ev.eventId}
                      </span>
                      {ev.routingKey}
                    </div>
                    <div className="eng-row-sub">
                      {ev.payload.requestId} | {ev.payload.sourceApp} | {ev.payload.decision} | {formatIdr(ev.payload.amountIdr, lang)}
                    </div>
                    <div className="eng-row-sub">
                      {ev.occurredAt} | sha256:{ev.payloadHash.slice(0, 10)}
                    </div>
                  </div>
                  <span className={`tag ${ev.outboxStatus === 'PUBLISHED' ? 'tag-ok' : 'tag-warn'}`}>
                    {ev.outboxStatus}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">
                {isEn ? 'Event Envelope & JSON Payload' : 'Amplop Event & Payload JSON'}
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn btn-sm" onClick={handleCopyEvent}>
                  {copiedJson ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy JSON' : 'Salin JSON')}
                </button>
                <button type="button" className="btn btn-sm btn-primary" onClick={exportOutboxJson}>
                  {isEn ? 'Download All JSON' : 'Unduh Semua JSON'}
                </button>
              </div>
            </div>
            <div className="eng-card-body">
              {selectedEvent && (
                <>
                  <div className="eng-kv-list">
                    <span className="eng-kv-k">Exchange</span>
                    <span className="eng-kv-v">{selectedEvent.exchange}</span>
                    <span className="eng-kv-k">Idempotency Key</span>
                    <span className="eng-kv-v">{selectedEvent.idempotencyKey}</span>
                    <span className="eng-kv-k">Payload Hash</span>
                    <span className="eng-kv-v">{selectedEvent.payloadHash}</span>
                  </div>
                  <pre className="eng-code">{selectedEventJson}</pre>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
