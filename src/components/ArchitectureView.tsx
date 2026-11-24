import React, { useState } from 'react';
import type { DiagramId } from '../data/caseStudies';
import { EXPERIENCES, PROFILE } from '../data/profile';
import type { SectorId } from '../data/sectors';
import { useLanguage, type Language } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { ArchitectureDiagram } from './ArchitectureDiagrams';
import { IconArrowRight, IconCheck, IconCopy, IconExternal, IconShield } from './Icons';

interface ArchitectureViewProps {
  totalProjects: number;
  onExploreAtlas: (opts?: { sector?: SectorId; query?: string }) => void;
}

interface PipelineStage {
  step: string;
  title: Record<Language, string>;
  shortTitle: Record<Language, string>;
  summary: Record<Language, string>;
  aiAccelerates: Record<Language, string[]>;
  engineerOwns: Record<Language, string[]>;
  tools: string[];
}

interface DecisionPattern {
  id: string;
  tag: Record<Language, string>;
  title: Record<Language, string>;
  rule: Record<Language, string>;
  rationale: Record<Language, string>;
  anchor: Record<Language, string>;
}

interface StandardRow {
  standard: Record<Language, string>;
  scope: Record<Language, string>;
  atlasFilter: { sector?: SectorId; query?: string };
}

const FEATURED_DIAGRAMS: Array<{ id: DiagramId; label: Record<Language, string> }> = [
  {
    id: 'grc-ai-gateway',
    label: { en: '01 Sovereign .NET AI Gateway', id: '01 Sovereign .NET AI Gateway' },
  },
  {
    id: 'trakindo-hub',
    label: { en: '02 80+ App Approval Monolith', id: '02 Approval Monolith 80+ App' },
  },
  {
    id: 'mining-offline-suite',
    label: { en: '03 Offline-First Mining MAUI', id: '03 Mobile Tambang Offline-First' },
  },
];

const PIPELINE_STAGES: PipelineStage[] = [
  {
    step: '01',
    shortTitle: { en: 'Domain Framing', id: 'Pemetaan Domain' },
    title: { en: 'Domain Framing & Operational Constraints', id: 'Pemetaan Domain & Batasan Operasional' },
    summary: {
      en: 'Before writing code, business rules, regulatory requirements, legacy dependencies, and cost limits are laid out in plain language.',
      id: 'Sebelum menulis kode, aturan bisnis, kepatuhan regulasi, ketergantungan sistem lama, dan batasan biaya dipetakan secara lugas.',
    },
    aiAccelerates: {
      en: [
        'Synthesizing stakeholder notes, edge cases, and regulatory checklists into structured requirement drafts.',
        'Cross-checking existing repositories and legacy payloads to surface hidden coupling early.',
      ],
      id: [
        'Merangkum catatan stakeholder, skenario edge case, dan checklist regulasi menjadi draf kebutuhan yang terstruktur.',
        'Memindai repository eksisting dan payload sistem lama untuk menemukan coupling tersembunyi lebih awal.',
      ],
    },
    engineerOwns: {
      en: [
        'Negotiating real project scope, priority boundaries, and non-negotiable compliance rules with stakeholders.',
        'Deciding what should be built versus what should stay simple or out of scope.',
      ],
      id: [
        'Menyepakati ruang lingkup nyata, prioritas rilis, dan aturan kepatuhan yang tidak bisa ditawar bersama stakeholder.',
        'Memutuskan mana yang memang perlu dibangun dan mana yang lebih baik tetap sederhana.',
      ],
    },
    tools: ['Miro', 'Notion', 'SDD / FSD', 'Context Specs'],
  },
  {
    step: '02',
    shortTitle: { en: 'Blueprint & Schema', id: 'Blueprint & Skema' },
    title: { en: 'Architecture Boundaries & Data Contracts', id: 'Batas Arsitektur & Kontrak Data' },
    summary: {
      en: 'Clear module boundaries, relational schemas, API contracts, and failure handling are locked down so implementation stays predictable.',
      id: 'Batas modul, skema relasional, kontrak API, dan penanganan kegagalan dikunci lebih dulu agar implementasi tetap terarah.',
    },
    aiAccelerates: {
      en: [
        'Drafting migration scripts, OpenAPI/DTO contracts, and state transition matrices from approved domain models.',
        'Stress-testing schema options against indexing, multi-tenancy, and audit-trail scenarios.',
      ],
      id: [
        'Menyusun draf skrip migrasi, kontrak OpenAPI/DTO, dan matriks transisi state dari model domain yang disetujui.',
        'Menguji berbagai opsi skema terhadap kebutuhan indexing, multi-tenancy, dan audit trail.',
      ],
    },
    engineerOwns: {
      en: [
        'Choosing Modular Monolith vs. Microservices, messaging topology, and database ownership.',
        'Designing authentication, RBAC boundaries, and sensitive-data isolation rules.',
      ],
      id: [
        'Menentukan Modular Monolith vs. Microservices, topologi messaging, serta kepemilikan database.',
        'Merancang autentikasi, batas RBAC, dan isolasi data sensitif.',
      ],
    },
    tools: ['dbDiagram', 'Figma', 'SQL Server / PostgreSQL', 'API Contracts'],
  },
  {
    step: '03',
    shortTitle: { en: 'AI Build Loop', id: 'AI Build Loop' },
    title: { en: 'AI-Assisted Implementation & Rapid Iteration', id: 'Implementasi Berbasis AI & Iterasi Cepat' },
    summary: {
      en: 'My personal AI workflow handles repetitive scaffolding and parallel exploration so engineering energy stays focused on tricky domain logic.',
      id: 'Workflow AI yang saya bangun sendiri menangani scaffolding berulang dan eksplorasi paralel agar fokus penuh tertuju pada logika domain yang krusial.',
    },
    aiAccelerates: {
      en: [
        'Generating vertical slices across .NET APIs, React or MAUI screens, and integration adapters within strict spec boundaries.',
        'Refactoring legacy syntax, mapping dynamic JSON forms, and iterating UI states quickly.',
      ],
      id: [
        'Membangun vertical slice lintas .NET API, antarmuka React atau MAUI, dan adapter integrasi sesuai spesifikasi yang ketat.',
        'Melakukan refactoring kode legacy, pemetaan dynamic form JSON, dan iterasi komponen UI secara cepat.',
      ],
    },
    engineerOwns: {
      en: [
        'Keeping SOLID and KISS discipline intact so generated code never bloats into unmaintainable abstractions.',
        'Stepping in directly on critical algorithms, cryptography, concurrency, and performance hot paths.',
      ],
      id: [
        'Menjaga disiplin SOLID dan KISS agar kode tidak membengkak menjadi abstraksi yang sulit dirawat.',
        'Menangani langsung bagian kritis seperti algoritma inti, kriptografi, concurrency, dan jalur performa tinggi.',
      ],
    },
    tools: ['Custom AI Pipeline', '.NET 8 / 9', 'React / TypeScript', '.NET MAUI'],
  },
  {
    step: '04',
    shortTitle: { en: 'Verification Gate', id: 'Gerbang Verifikasi' },
    title: { en: 'Automated Verification, Review & Security Gate', id: 'Verifikasi Otomatis, Review & Gerbang Keamanan' },
    summary: {
      en: 'Fast output only matters if it holds up under load, bad inputs, and audits. Every change passes deterministic checks before merge.',
      id: 'Kecepatan produksi hanya bernilai bila sistem tahan terhadap beban nyata, input bermasalah, dan audit. Setiap perubahan wajib melewati gerbang deterministik.',
    },
    aiAccelerates: {
      en: [
        'Expanding negative unit-test cases, boundary checks, and regression test fixtures across edge inputs.',
        'Running first-pass code diffs to catch missing null checks, query N+1 patterns, or exposed secrets.',
      ],
      id: [
        'Memperluas skenario negative unit test, pengecekan batas nilai, dan test fixture untuk regresi.',
        'Menjalankan pemindaian awal diff kode untuk mendeteksi potensi N+1 query, bug null, atau rahasia yang bocor.',
      ],
    },
    engineerOwns: {
      en: [
        'Line-by-line review of security-sensitive paths, SQL execution plans, and transaction boundaries.',
        'Verifying clean builds, passing test suites, SonarQube quality gates, and real browser or device behavior.',
      ],
      id: [
        'Review langsung jalur yang sensitif terhadap keamanan, rencana eksekusi SQL, dan batas transaksi.',
        'Memastikan build bersih, unit test hijau, quality gate SonarQube lolos, serta perilaku nyata di browser maupun perangkat mobile.',
      ],
    },
    tools: ['xUnit / NUnit', 'SonarQube', 'TypeScript Strict', 'Manual Diff Audit'],
  },
  {
    step: '05',
    shortTitle: { en: 'Release & Ops', id: 'Rilis & Operasi' },
    title: { en: 'Controlled Release, Telemetry & Handover', id: 'Rilis Terkendali, Telemetri & Serah Terima' },
    summary: {
      en: 'Shipping is complete only when the team can deploy safely, observe failures immediately, and train users to run the system smoothly.',
      id: 'Delivery baru dianggap tuntas ketika sistem bisa di-deploy dengan aman, mudah dipantau saat ada gangguan, dan dipahami oleh tim pengguna.',
    },
    aiAccelerates: {
      en: [
        'Drafting release changelogs, runbooks, UAT checklists, and onboarding guides directly from verified commits.',
        'Analyzing structured logs and exception spikes to speed up root-cause triage.',
      ],
      id: [
        'Menyusun changelog rilis, runbook operasional, checklist UAT, dan panduan pengguna dari perubahan yang sudah terverifikasi.',
        'Membantu analisa log terstruktur dan lonjakan error untuk mempercepat root-cause triage.',
      ],
    },
    engineerOwns: {
      en: [
        'Managing CI/CD pipelines, Docker/Kubernetes rollouts, environment swaps, TestFlight, and Google Play releases.',
        'Running user training sessions and iterating on backlog priorities from real production metrics.',
      ],
      id: [
        'Mengelola pipeline CI/CD, rollout Docker/Kubernetes, swap environment, serta distribusi TestFlight dan Google Play.',
        'Membawakan pelatihan departemen pengguna dan menyusun prioritas backlog dari metrik produksi nyata.',
      ],
    },
    tools: ['Azure DevOps', 'Docker / K8s', 'Serilog / .NET Aspire', 'TestFlight / Play Console'],
  },
];

const DECISION_PATTERNS: DecisionPattern[] = [
  {
    id: 'modular-monolith',
    tag: { en: 'System Topology', id: 'Topologi Sistem' },
    title: { en: 'Modular Monolith First, Microservices by Proof', id: 'Modular Monolith Dulu, Microservices Saat Terbukti Perlu' },
    rule: {
      en: 'Start with strict in-process domain modules and clear data ownership; split into standalone services only when scaling, team autonomy, or compliance boundaries require it.',
      id: 'Mulai dengan modul domain yang tegas di dalam satu deployment; pecah ke microservices hanya ketika kebutuhan skala, otonomi tim, atau batas kepatuhan benar-benar menuntutnya.',
    },
    rationale: {
      en: 'Avoids premature distributed-systems tax (network hops, split deployments, fragile tracing) while keeping extraction clean once growth justifies it.',
      id: 'Menghindari beban sistem terdistribusi terlalu dini sambil menjaga batas modul tetap bersih untuk diekstrak kapan pun skala bisnis menuntut.',
    },
    anchor: {
      en: 'Centralized approval platform for 80+ applications (Trakindo)',
      id: 'Platform approval terpusat untuk 80+ aplikasi (Trakindo)',
    },
  },
  {
    id: 'event-driven',
    tag: { en: 'Integration & Reliability', id: 'Integrasi & Keandalan' },
    title: { en: 'Event-Driven Workflows & Outbox Guarantees', id: 'Workflow Event-Driven & Keandalan Outbox' },
    rule: {
      en: 'Decouple multi-app workflows through message brokers, idempotent consumers, and persistent workflow state instead of brittle synchronous API chains.',
      id: 'Pisahkan orkestrasi lintas aplikasi lewat message broker, consumer yang idempoten, dan state workflow persisten ketimbang rantai panggilan API sinkron yang rapuh.',
    },
    rationale: {
      en: 'When downstream ERPs or legacy portals stall, messages wait safely in queues with full auditability and controlled retry policies.',
      id: 'Saat ERP atau portal legacy di hilir melambat, pesan tetap aman di antrean dengan audit trail lengkap dan kebijakan retry yang terkendali.',
    },
    anchor: {
      en: 'RabbitMQ + Elsa Workflow orchestration & Mandiri Inhealth services',
      id: 'Orkestrasi RabbitMQ + Elsa Workflow & layanan Mandiri Inhealth',
    },
  },
  {
    id: 'offline-mobile',
    tag: { en: 'Field & Edge Apps', id: 'Aplikasi Lapangan & Edge' },
    title: { en: 'Offline-First Mobile & Dynamic UI Schemas', id: 'Mobile Offline-First & Skema UI Dinamis' },
    rule: {
      en: 'Design field apps around local persistence, optimistic state feedback, and server-driven form definitions so remote sites keep moving without stable signal.',
      id: 'Rancang aplikasi lapangan dengan penyimpanan lokal, umpan balik UI responsif, dan definisi form dari server agar operasional lokasi terpencil tetap jalan meski sinyal tidak stabil.',
    },
    rationale: {
      en: 'Mining camps, survey zones, and multilingual teams cannot afford full app-store rebuilds every time a business checklist changes.',
      id: 'Area tambang, survei lapangan, dan tim multi-bahasa tidak bisa menunggu rilis ulang toko aplikasi setiap kali format formulir berubah.',
    },
    anchor: {
      en: '.NET MAUI apps for Amman Mineral, Adaro/SIS, Delmon RTL & Survee',
      id: 'Aplikasi .NET MAUI untuk Amman Mineral, Adaro/SIS, Delmon RTL & Survee',
    },
  },
  {
    id: 'sovereign-ai',
    tag: { en: 'Security & AI Governance', id: 'Keamanan & Tata Kelola AI' },
    title: { en: 'Strict Data Boundaries & Controlled AI Routing', id: 'Batas Data Ketat & Routing AI Terkendali' },
    rule: {
      en: 'Route enterprise AI traffic through a governed gateway with PII masking, RBAC provider quotas, and auditable logs rather than ad-hoc direct API keys.',
      id: 'Arahkan trafik AI enterprise melalui gateway terkelola dengan masking PII, kuota provider berbasis RBAC, dan log audit ketimbang akses API key langsung yang lepas kontrol.',
    },
    rationale: {
      en: 'Combines multi-model speed and failover resilience with real protection for employee records, customer IDs, and internal financial data.',
      id: 'Menggabungkan kecepatan multi-model dan failover yang stabil dengan perlindungan nyata atas data karyawan, identitas pelanggan, serta data finansial internal.',
    },
    anchor: {
      en: 'GRC Board .NET AI inference gateway, MindSoci RAG & OCBC encryption API',
      id: 'AI inference gateway .NET GRC Board, MindSoci RAG & API enkripsi OCBC',
    },
  },
];

const STANDARDS_MATRIX: StandardRow[] = [
  {
    standard: {
      en: 'Bank Indonesia SNAP BI & BI-FAST',
      id: 'Bank Indonesia SNAP BI & BI-FAST',
    },
    scope: {
      en: 'Asymmetric RSA-SHA256 / HMAC signing, Virtual Account reconciliation, instant payout switches, and host-to-host banking file cryptography.',
      id: 'Signing asimetris RSA-SHA256 / HMAC, rekonsiliasi Virtual Account, switch payout instan, dan kriptografi file host-to-host perbankan.',
    },
    atlasFilter: { sector: 'fintech' },
  },
  {
    standard: {
      en: 'Kemenkes SATUSEHAT & BPJS Bridging',
      id: 'Kemenkes SATUSEHAT & Bridging BPJS',
    },
    scope: {
      en: 'HL7 FHIR R4 resource mapping (Encounter, Condition, MedicationRequest), KFA drug codes, VClaim SEP workflows, and online queue Task IDs 1 to 7.',
      id: 'Pemetaan resource HL7 FHIR R4 (Encounter, Condition, MedicationRequest), kode obat KFA, alur VClaim SEP, dan Antrean Online Task ID 1 sampai 7.',
    },
    atlasFilter: { sector: 'healthcare' },
  },
  {
    standard: {
      en: 'DJP CoreTax & Peruri e-Meterai',
      id: 'DJP CoreTax & Peruri e-Meterai',
    },
    scope: {
      en: 'NPWP-16 / NITKU validation, PPh 21 TER payroll annualization, XML schema validation gates, and long-term electronic stamp signing.',
      id: 'Validasi NPWP-16 / NITKU, tahunanisasi payroll PPh 21 TER, gerbang validasi skema XML, dan pembubuhan meterai elektronik LTV.',
    },
    atlasFilter: { query: 'CoreTax' },
  },
  {
    standard: {
      en: 'UU PDP No. 27/2022 & Sovereign AI',
      id: 'UU PDP No. 27/2022 & Sovereign AI',
    },
    scope: {
      en: 'Jakarta data residency controls, NIK/NPWP redaction prior to external LLM egress, consent ledgers, and 3x24-hour incident notification workflows.',
      id: 'Kontrol residensi data Jakarta, masking NIK/NPWP sebelum egress ke LLM eksternal, ledger persetujuan, dan playbook notifikasi insiden 3x24 jam.',
    },
    atlasFilter: { sector: 'ai' },
  },
  {
    standard: {
      en: 'Mining, Heavy Equipment & Cold-Chain Operations',
      id: 'Operasional Tambang, Alat Berat & Cold-Chain',
    },
    scope: {
      en: 'Offline-first .NET MAUI field apps, Azure AD/B2C identity integration, multi-branch ERP KPI engines, SCADA telemetry, and RKAB/SIMBARA reporting readiness.',
      id: 'Aplikasi lapangan .NET MAUI offline-first, integrasi identitas Azure AD/B2C, KPI ERP multi-cabang, telemetri SCADA, dan kesiapan pelaporan RKAB/SIMBARA.',
    },
    atlasFilter: { sector: 'industrial' },
  },
];

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  totalProjects,
  onExploreAtlas,
}) => {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].architecture;
  const [activeDiagramId, setActiveDiagramId] = useState<DiagramId>('grc-ai-gateway');
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeStage = PIPELINE_STAGES[activeStageIdx];

  const briefText =
    lang === 'en'
      ? `# ${PROFILE.name} - Technical Executive Brief
Role: ${PROFILE.title.en}
Location: ${PROFILE.location} (${PROFILE.timezone})
Experience: 10+ Years (Since ${PROFILE.activeSince}, ${EXPERIENCES.length} production roles)
Core Stack: .NET 8/9, C#, .NET MAUI, Blazor, React, TypeScript, SQL Server, PostgreSQL, RabbitMQ, Elsa Workflow, Docker, Kubernetes, Custom AI Inference Gateways & RAG Pipelines
Delivery Mode: End-to-end AI-assisted engineering workflow with strict engineer ownership over architecture, security boundaries, and verification
Industries Shipped: Internal AI Infrastructure, Civic RT/RW SaaS, Conglomerate Workflow (80+ apps), Health Insurance, Gold/Copper/Coal Mining, Banking Encryption (OCBC), Sharia Travel, Cold-Chain Distribution, Trucking Logistics, Government & Corrections
Contact: ${PROFILE.email} | ${PROFILE.phone} | ${PROFILE.linkedin}`
      : `# ${PROFILE.name} - Ringkasan Eksekutif Teknis
Peran: ${PROFILE.title.id}
Lokasi: ${PROFILE.location} (${PROFILE.timezone})
Pengalaman: 10+ Tahun (Sejak ${PROFILE.activeSince}, ${EXPERIENCES.length} peran produksi)
Core Stack: .NET 8/9, C#, .NET MAUI, Blazor, React, TypeScript, SQL Server, PostgreSQL, RabbitMQ, Elsa Workflow, Docker, Kubernetes, Custom AI Inference Gateway & RAG Pipelines
Cara Kerja: Workflow dan pipeline engineering berbasis AI secara end-to-end dengan kendali penuh engineer atas arsitektur, batas keamanan, dan verifikasi
Sektor Produksi: Infrastruktur AI Internal, SaaS Lingkungan RT/RW, Workflow Konglomerasi (80+ aplikasi), Asuransi Kesehatan, Pertambangan Batubara/Emas/Tembaga, Enkripsi Perbankan (OCBC), Travel Syariah, Distribusi Cold-Chain, Logistik Truk, Pemerintahan & Pemasyarakatan
Kontak: ${PROFILE.email} | ${PROFILE.phone} | ${PROFILE.linkedin}`;

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="arch-stack">
      {/* 1. Playbook Hero Banner */}
      <section className="panel arch-hero">
        <div className="arch-hero-body">
          <div className="hero-kicker">
            <span className="status-dot accent" />
            <span>{copy.kicker}</span>
          </div>
          <h1 className="arch-hero-title">{copy.title}</h1>
          <p className="arch-hero-sub">{copy.subtitle}</p>
        </div>

        <div className="arch-jump-bar">
          <button type="button" className="lens-chip" onClick={() => scrollToSection('arch-diagrams')}>
            01 {lang === 'en' ? 'System Diagrams' : 'Diagram Sistem'}
          </button>
          <button type="button" className="lens-chip" onClick={() => scrollToSection('arch-decisions')}>
            02 {copy.quickJumpDecisions}
          </button>
          <button type="button" className="lens-chip" onClick={() => scrollToSection('arch-pipeline')}>
            03 {copy.quickJumpPipeline}
          </button>
          <button type="button" className="lens-chip" onClick={() => scrollToSection('arch-standards')}>
            04 {copy.quickJumpStandards}
          </button>
          <button type="button" className="lens-chip" onClick={() => scrollToSection('arch-contact')}>
            05 {copy.quickJumpContact}
          </button>
        </div>
      </section>

      {/* 2. Interactive Production Reference Architecture Diagrams */}
      <section className="panel" id="arch-diagrams">
        <div className="panel-header">
          <div>
            <h2 className="section-title">
              {lang === 'en' ? 'Interactive System Architecture Blueprints' : 'Blueprint Arsitektur Sistem Interaktif'}
            </h2>
            <p className="section-desc">
              {lang === 'en'
                ? 'Select a production architecture below and click any node to inspect its protocol, ownership, and failure boundary.'
                : 'Pilih arsitektur produksi di bawah lalu klik node mana saja untuk memeriksa protokol, peran komponen, dan batas kegagalannya.'}
            </p>
          </div>
          <a
            href={PROFILE.githubAiLibrary}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm"
          >
            AI Knowledge Library (GitHub)
            <IconExternal size={11} />
          </a>
        </div>

        <div className="diagram-tab-bar" role="tablist" aria-label="Architecture blueprints">
          {FEATURED_DIAGRAMS.map((d) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeDiagramId === d.id}
              key={d.id}
              className={`lens-chip ${activeDiagramId === d.id ? 'is-active' : ''}`}
              onClick={() => setActiveDiagramId(d.id)}
            >
              {d.label[lang]}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>
          <ArchitectureDiagram key={activeDiagramId} diagramId={activeDiagramId} />
        </div>
      </section>

      {/* 3. Architecture Decision Playbook */}
      <section className="panel" id="arch-decisions">
        <div className="panel-header">
          <div>
            <h2 className="section-title">{copy.decisionsTitle}</h2>
            <p className="section-desc">{copy.decisionsDesc}</p>
          </div>
          <span className="tag tag-mono">{DECISION_PATTERNS.length} Playbook Rules</span>
        </div>

        <div className="decision-grid">
          {DECISION_PATTERNS.map((pat) => (
            <article className="decision-card" key={pat.id}>
              <div className="decision-card-top">
                <span className="tag tag-accent">{pat.tag[lang]}</span>
              </div>
              <h3 className="decision-title">{pat.title[lang]}</h3>
              <div className="decision-rule">
                <div className="brief-label" style={{ marginBottom: '4px' }}>{copy.whenToUseLabel}</div>
                <p style={{ margin: 0 }}>{pat.rule[lang]}</p>
              </div>
              <p className="decision-rationale">{pat.rationale[lang]}</p>
              <div className="decision-anchor">
                <span className="decision-anchor-label">{copy.productionAnchorLabel}:</span>
                <span>{pat.anchor[lang]}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Interactive AI-Native Engineering Pipeline */}
      <section className="panel" id="arch-pipeline">
        <div className="panel-header">
          <div>
            <h2 className="section-title">{copy.pipelineTitle}</h2>
            <p className="section-desc">{copy.pipelineDesc}</p>
          </div>
          <span className="tag tag-accent tag-mono">
            {activeStage.step} / 0{PIPELINE_STAGES.length}
          </span>
        </div>

        <div className="pipeline-stepper" role="tablist" aria-label={copy.pipelineTitle}>
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIdx;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                key={stage.step}
                className={`pipeline-step-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveStageIdx(idx)}
              >
                <span className="pipeline-step-num">{stage.step}</span>
                <span className="pipeline-step-label">{stage.shortTitle[lang]}</span>
              </button>
            );
          })}
        </div>

        <div className="pipeline-detail" role="tabpanel">
          <div className="pipeline-detail-head">
            <h3 className="pipeline-detail-title">
              <span className="tag tag-mono tag-accent">{activeStage.step}</span>
              <span>{activeStage.title[lang]}</span>
            </h3>
            <p className="pipeline-detail-summary">{activeStage.summary[lang]}</p>
          </div>

          <div className="pipeline-split">
            <div className="pipeline-col">
              <div className="pipeline-col-head">
                <span className="status-dot accent" />
                <span>{copy.aiAcceleratesLabel}</span>
              </div>
              <ul className="pipeline-list">
                {activeStage.aiAccelerates[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="pipeline-col">
              <div className="pipeline-col-head">
                <IconShield size={13} />
                <span>{copy.engineerOwnsLabel}</span>
              </div>
              <ul className="pipeline-list">
                {activeStage.engineerOwns[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pipeline-tools">
            <span className="brief-label" style={{ margin: 0 }}>{copy.toolsInUseLabel}:</span>
            <div className="tag-wrap">
              {activeStage.tools.map((tool) => (
                <span className="tag tag-mono" key={tool}>{tool}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Enterprise & Indonesian DPI Standards Matrix */}
      <section className="panel" id="arch-standards">
        <div className="panel-header">
          <div>
            <h2 className="section-title">{copy.standardsTitle}</h2>
            <p className="section-desc">{copy.standardsDesc(totalProjects)}</p>
          </div>
          <span className="tag">
            <IconShield size={12} />
            {copy.standardsBadge}
          </span>
        </div>

        <div className="matrix-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ width: '270px' }}>{copy.standardsColEcosystem}</th>
                <th>{copy.standardsColPattern}</th>
                <th style={{ width: '160px', textAlign: 'right' }}>{copy.standardsColAtlas}</th>
              </tr>
            </thead>
            <tbody>
              {STANDARDS_MATRIX.map((row) => (
                <tr key={row.standard.en} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 600 }}>{row.standard[lang]}</td>
                  <td style={{ color: 'var(--ui-text-2)' }}>{row.scope[lang]}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => onExploreAtlas(row.atlasFilter)}
                    >
                      {copy.exploreInAtlas}
                      <IconArrowRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Direct Contact & Copyable Executive Brief */}
      <section className="panel" id="arch-contact">
        <div className="panel-header">
          <div>
            <h2 className="section-title">{copy.contactTitle}</h2>
            <p className="section-desc">{copy.contactDesc}</p>
          </div>
          <span className="tag tag-ok">{copy.availabilityTag}</span>
        </div>

        <div className="arch-contact-grid">
          <div className="arch-contact-info">
            <div className="contact-kv-grid">
              <span className="contact-k">{copy.contactFields.email}</span>
              <a href={`mailto:${PROFILE.email}`} className="contact-v">{PROFILE.email}</a>

              <span className="contact-k">{copy.contactFields.whatsapp}</span>
              <a href="https://wa.me/6281280031995" target="_blank" rel="noreferrer" className="contact-v">
                {PROFILE.phone} <IconExternal size={11} />
              </a>

              <span className="contact-k">{copy.contactFields.linkedin}</span>
              <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="contact-v">
                {PROFILE.linkedinLabel} <IconExternal size={11} />
              </a>

              <span className="contact-k">{copy.contactFields.location}</span>
              <span className="contact-v">{PROFILE.location} ({PROFILE.timezone})</span>
            </div>
          </div>

          <div className="arch-contact-brief">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
              <span className="brief-label" style={{ margin: 0 }}>{copy.briefLabel}</span>
              <button type="button" className="btn btn-sm btn-primary" onClick={copyBrief}>
                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                {copied ? copy.copiedBriefBtn : copy.copyBriefBtn}
              </button>
            </div>
            <div className="code-block">{briefText}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
