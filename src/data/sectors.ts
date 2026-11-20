export type SectorId =
  | 'ai'
  | 'fintech'
  | 'commerce'
  | 'enterprise'
  | 'healthcare'
  | 'logistics'
  | 'industrial'
  | 'govtech'
  | 'devtools'
  | 'cloudsec'
  | 'data'
  | 'climate'
  | 'agritech'
  | 'lifestyle'
  | 'emerging';

export type PlatformType =
  | 'Web SaaS'
  | 'Mobile App'
  | 'Desktop / WPF'
  | 'API / Middleware'
  | 'AI / Agentic'
  | 'IoT / Edge';

export type ArchetypeId =
  | 'mobile-superapp'
  | 'terminal-cli'
  | 'fintech-ledger'
  | 'clinical-emr'
  | 'geo-dispatch'
  | 'marketplace-store'
  | 'kanban-workflow'
  | 'ai-agent-workbench'
  | 'pos-kiosk'
  | 'iot-scada'
  | 'gov-portal'
  | 'bi-analytics'
  | 'ide-code-diff'
  | 'calendar-booking'
  | 'document-vault'
  | 'desktop-erp'
  | 'social-community'
  | 'security-soc';

export interface SectorMeta {
  id: SectorId;
  name: string;
  shortName: string;
  indonesiaThesis: string;
  standards: string[];
}

export const SECTORS: SectorMeta[] = [
  {
    id: 'ai',
    name: 'AI, Agentic & Sovereign Inference',
    shortName: 'AI & Agents',
    indonesiaThesis: 'Enterprise LLM router, audit suara/NLP Bahasa Indonesia, RAG regulasi, dan tata kelola AI patuh UU PDP.',
    standards: ['Sovereign AI', 'UU PDP', 'OpenAI / Anthropic'],
  },
  {
    id: 'fintech',
    name: 'Fintech, Pembayaran & Digital Banking',
    shortName: 'Fintech & BI',
    indonesiaThesis: 'QRIS Tap NFC, SNAP BI Open API, BI-FAST lintas negara Nexus, keuangan syariah, KSP, KPR, dan kontrol risiko OJK.',
    standards: ['QRIS / BI-FAST', 'SNAP BI', 'OJK SLIK'],
  },
  {
    id: 'commerce',
    name: 'E-Commerce, Omnichannel & Retail Tech',
    shortName: 'Commerce & POS',
    indonesiaThesis: 'Sinkronisasi stok Tokopedia-TikTok-Shopee, pengadaan bahan bangunan B2B, restock warung, tiket anti-calo, dan POS offline-first.',
    standards: ['QRIS Dynamic', 'BPOM', 'COD Risk'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise ERP, HRIS, Pajak & Operasional',
    shortName: 'Enterprise ERP',
    indonesiaThesis: 'Integrasi CoreTax DJP, payroll PPh 21 TER, orkestrasi approval 80+ aplikasi, dan desktop ERP multi-cabang.',
    standards: ['CoreTax DJP', 'Peruri e-Meterai', 'BPJS / Tapera'],
  },
  {
    id: 'healthcare',
    name: 'Kesehatan, Rumah Sakit & SATUSEHAT',
    shortName: 'Kesehatan & RS',
    indonesiaThesis: 'Interoperabilitas wajib SATUSEHAT HL7 FHIR, bridging BPJS VClaim/Antrean, PACS teleradiologi, hingga klinik hewan.',
    standards: ['SATUSEHAT FHIR', 'BPJS VClaim', 'DICOM / LIS'],
  },
  {
    id: 'logistics',
    name: 'Logistik, Maritim & Rantai Pasok Nusantara',
    shortName: 'Logistik',
    indonesiaThesis: 'Optimasi angkutan antar-pulau, slot Pelindo, bea cukai CEISA 4.0, cold-chain reefer, telematika armada, dan tiket intermoda.',
    standards: ['CEISA 4.0', 'e-POD', 'Cold-Chain HACCP'],
  },
  {
    id: 'industrial',
    name: 'Pertambangan, Energi, Industri & ESG',
    shortName: 'Tambang & Industri',
    indonesiaThesis: 'SCADA smelter nikel hilirisasi, pemeliharaan pelumas alat berat, camp tambang terpencil, dan kepatuhan ESDM RKAB/SIMBARA.',
    standards: ['RKAB / SIMBARA', 'EUDR Traceability', 'K3 HSE'],
  },
  {
    id: 'govtech',
    name: 'GovTech, Layanan Publik & Smart City',
    shortName: 'GovTech & Publik',
    indonesiaThesis: 'Konsolidasi INA Digital DPI, perizinan OSS-RBA, transparansi APBDes, telemetri banjir, audit SPBE, dan aplikasi warga RT/RW.',
    standards: ['INA Digital', 'OSS-RBA', 'SPBE / BSrE'],
  },
  {
    id: 'devtools',
    name: 'Developer Tools, API & Middleware',
    shortName: 'DevTools & API',
    indonesiaThesis: 'Adapter SOAP/AS400 ke REST/gRPC, linter migrasi SQL zero-downtime, validator FHIR, replay DLQ, dan dynamic form mobile.',
    standards: ['OpenAPI / gRPC', 'HL7 FHIR', 'Outbox / AMQP'],
  },
  {
    id: 'cloudsec',
    name: 'Cloud, DevOps, Observability & Cybersecurity',
    shortName: 'Cloud & SecOps',
    indonesiaThesis: 'Vault persetujuan & PII UU PDP, FinOps multi-cloud Jakarta, telemetri PUE data center, dan deployment CI/CD air-gapped.',
    standards: ['UU PDP', 'ISO 27001 / BSSN', 'Air-Gapped K8s'],
  },
  {
    id: 'data',
    name: 'Data Platform, Analytics & BI',
    shortName: 'Data & BI',
    indonesiaThesis: 'BI sell-out general trade 38 provinsi, sinkronisasi survei lapangan offline, sentimen NLP Bahasa Indonesia, dan KPI cabang.',
    standards: ['Medallion SQL', 'Offline Sync', 'Data Contracts'],
  },
  {
    id: 'climate',
    name: 'Climate Tech, Mobilitas EV & Karbon',
    shortName: 'Iklim & EV',
    indonesiaThesis: 'Jaringan tukar baterai motor listrik, ledger kredit IDXCarbon, solar atap industri, digital twin IKN, dan MRV mangrove.',
    standards: ['IDXCarbon', 'PLN Net-Meter', 'OCPP 2.0.1'],
  },
  {
    id: 'agritech',
    name: 'Agritech, Ketahanan Pangan & Perikanan',
    shortName: 'Pangan & Agri',
    indonesiaThesis: 'Rantai pasok dapur MBG, IoT tambak udang vannamei, ketertelusuran kopi Arabika ekspor, lelang ikan TPI, dan katering korporat.',
    standards: ['MBG Nutrition QA', 'EUDR Origin', 'Cold-Chain Fish'],
  },
  {
    id: 'lifestyle',
    name: 'EdTech, Ekosistem Syariah & Hospitality',
    shortName: 'Syariah, Ed & Travel',
    indonesiaThesis: 'Sertifikasi Halal wajib BPJPH, operasional Umrah, OS pesantren cashless, tryout adaptif UTBK, bootcamp vokasi, dan PMS vila Bali.',
    standards: ['BPJPH SJPH', 'SISKOPATUH', 'IRT / SKKNI'],
  },
  {
    id: 'emerging',
    name: 'Ekonomi Kreator, Komunikasi & Emerging Tech',
    shortName: 'Kreator & Emerging',
    indonesiaThesis: 'Otomasi WhatsApp Business API, escrow kreator, bengkel digital, wakaf teraudit, sertipikat tanah elektronik, game LiveOps, dan royalti buku.',
    standards: ['WA Business API', 'ATR/BPN e-Deed', 'BAZNAS / BWI'],
  },
];

export const ARCHETYPE_LABELS: Record<ArchetypeId, string> = {
  'mobile-superapp': 'Mobile App',
  'terminal-cli': 'CLI & Runtime',
  'fintech-ledger': 'Financial Ledger',
  'clinical-emr': 'Clinical EMR',
  'geo-dispatch': 'Geo & Fleet Map',
  'marketplace-store': 'Commerce & Catalog',
  'kanban-workflow': 'Approval & Workflow',
  'ai-agent-workbench': 'AI Console & DAG',
  'pos-kiosk': 'POS & Kiosk',
  'iot-scada': 'Industrial SCADA',
  'gov-portal': 'Portal Layanan Publik',
  'bi-analytics': 'BI & Telemetry',
  'ide-code-diff': 'API & Schema IDE',
  'calendar-booking': 'Scheduler & Roster',
  'document-vault': 'Compliance & Vault',
  'desktop-erp': 'Desktop ERP Grid',
  'social-community': 'Komunitas & Cohort',
  'security-soc': 'SecOps & Fraud Desk',
};

export interface CuratedLens {
  id: string;
  label: string;
  description: string;
  filter: (p: { sector: SectorId; platform: PlatformType; standards: string[]; cvLink?: string }) => boolean;
}

export const CURATED_LENSES: CuratedLens[] = [
  {
    id: 'all',
    label: 'Semua Konsep',
    description: 'Eksplorasi lengkap ekosistem teknologi Indonesia',
    filter: () => true,
  },
  {
    id: 'dpi',
    label: 'DPI Nasional & Regulasi',
    description: 'QRIS, BI-FAST, SNAP, SATUSEHAT, CoreTax, OSS-RBA, UU PDP, SPBE',
    filter: (p) =>
      p.standards.some((s) =>
        /QRIS|BI-FAST|SNAP|SATUSEHAT|CoreTax|UU PDP|OSS-RBA|INA Digital|CEISA|BPJS|BPJPH|IDXCarbon|SPBE/i.test(s)
      ),
  },
  {
    id: 'ai-agentic',
    label: 'AI & Sistem Agentic',
    description: 'Inference router, RAG, voice QA, red-team, dan edge vision',
    filter: (p) => p.sector === 'ai' || p.platform === 'AI / Agentic',
  },
  {
    id: 'industrial-ent',
    label: 'Enterprise, Tambang & Logistik',
    description: 'Industri berat, ERP multi-cabang, cold-chain, dan maritim',
    filter: (p) => ['enterprise', 'industrial', 'logistics'].includes(p.sector),
  },
  {
    id: 'mobile-id',
    label: 'Mobile-First Indonesia',
    description: 'Aplikasi Android/iOS lapangan, ritel, civic, dan konsumen',
    filter: (p) => p.platform === 'Mobile App',
  },
  {
    id: 'cv-adjacent',
    label: 'Selaras Domain CV',
    description: 'Konsep yang terinspirasi langsung dari sektor pengalaman nyata di CV',
    filter: (p) => Boolean(p.cvLink),
  },
];
