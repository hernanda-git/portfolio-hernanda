import type { Language } from '../i18n/LanguageContext';

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
  nameEn: string;
  shortName: string;
  shortNameEn: string;
  indonesiaThesis: string;
  indonesiaThesisEn: string;
  standards: string[];
}

export const SECTORS: SectorMeta[] = [
  {
    id: 'ai',
    name: 'AI, Agentic & Sovereign Inference',
    nameEn: 'AI, Agentic & Sovereign Inference',
    shortName: 'AI & Agents',
    shortNameEn: 'AI & Agents',
    indonesiaThesis: 'Enterprise LLM router, audit suara dan NLP Bahasa Indonesia, RAG regulasi, serta tata kelola AI yang patuh UU PDP.',
    indonesiaThesisEn: 'Enterprise LLM routers, Indonesian voice and NLP audits, regulatory RAG pipelines, and UU PDP compliant AI governance.',
    standards: ['Sovereign AI', 'UU PDP', 'OpenAI / Anthropic'],
  },
  {
    id: 'fintech',
    name: 'Fintech, Pembayaran & Digital Banking',
    nameEn: 'Fintech, Payments & Digital Banking',
    shortName: 'Fintech & BI',
    shortNameEn: 'Fintech & BI',
    indonesiaThesis: 'QRIS Tap NFC, SNAP BI Open API, BI-FAST lintas negara Nexus, keuangan syariah, KSP, KPR, dan kontrol risiko OJK.',
    indonesiaThesisEn: 'QRIS Tap NFC, SNAP BI Open API, cross-border BI-FAST Nexus, Islamic finance, cooperatives, mortgages, and OJK risk controls.',
    standards: ['QRIS / BI-FAST', 'SNAP BI', 'OJK SLIK'],
  },
  {
    id: 'commerce',
    name: 'E-Commerce, Omnichannel & Retail Tech',
    nameEn: 'E-Commerce, Omnichannel & Retail Tech',
    shortName: 'Commerce & POS',
    shortNameEn: 'Commerce & POS',
    indonesiaThesis: 'Sinkronisasi stok Tokopedia, TikTok, dan Shopee, pengadaan bahan bangunan B2B, restock warung, tiket anti-calo, dan POS offline-first.',
    indonesiaThesisEn: 'Multi-channel stock sync across Tokopedia, TikTok, and Shopee, B2B building materials, micro-retail restocking, anti-scalper ticketing, and offline-first POS.',
    standards: ['QRIS Dynamic', 'BPOM', 'COD Risk'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise ERP, HRIS, Pajak & Operasional',
    nameEn: 'Enterprise ERP, HRIS, Tax & Operations',
    shortName: 'Enterprise ERP',
    shortNameEn: 'Enterprise ERP',
    indonesiaThesis: 'Integrasi CoreTax DJP, payroll PPh 21 TER, orkestrasi approval 80+ aplikasi, dan desktop ERP multi-cabang.',
    indonesiaThesisEn: 'DJP CoreTax integration, PPh 21 TER payroll automation, 80+ app approval orchestration, and multi-branch desktop ERP.',
    standards: ['CoreTax DJP', 'Peruri e-Meterai', 'BPJS / Tapera'],
  },
  {
    id: 'healthcare',
    name: 'Kesehatan, Rumah Sakit & SATUSEHAT',
    nameEn: 'Healthcare, Hospitals & SATUSEHAT',
    shortName: 'Kesehatan & RS',
    shortNameEn: 'Healthcare',
    indonesiaThesis: 'Interoperabilitas wajib SATUSEHAT HL7 FHIR, bridging BPJS VClaim dan Antrean, PACS teleradiologi, hingga klinik hewan.',
    indonesiaThesisEn: 'Mandatory SATUSEHAT HL7 FHIR interoperability, BPJS VClaim and queue bridging, teleradiology PACS, and veterinary clinics.',
    standards: ['SATUSEHAT FHIR', 'BPJS VClaim', 'DICOM / LIS'],
  },
  {
    id: 'logistics',
    name: 'Logistik, Maritim & Rantai Pasok Nusantara',
    nameEn: 'Logistics, Maritime & Archipelago Supply Chain',
    shortName: 'Logistik',
    shortNameEn: 'Logistics',
    indonesiaThesis: 'Optimasi angkutan antar-pulau, slot Pelindo, bea cukai CEISA 4.0, cold-chain reefer, telematika armada, dan tiket intermoda.',
    indonesiaThesisEn: 'Inter-island freight optimization, Pelindo port slots, CEISA 4.0 customs, cold-chain reefers, fleet telematics, and intermodal ticketing.',
    standards: ['CEISA 4.0', 'e-POD', 'Cold-Chain HACCP'],
  },
  {
    id: 'industrial',
    name: 'Pertambangan, Energi, Industri & ESG',
    nameEn: 'Mining, Energy, Industrial & ESG',
    shortName: 'Tambang & Industri',
    shortNameEn: 'Mining & Industrial',
    indonesiaThesis: 'SCADA smelter nikel hilirisasi, pemeliharaan pelumas alat berat, camp tambang terpencil, dan kepatuhan ESDM RKAB/SIMBARA.',
    indonesiaThesisEn: 'Nickel smelter SCADA, heavy equipment lubricant maintenance, remote mining camp ops, and ESDM RKAB/SIMBARA compliance.',
    standards: ['RKAB / SIMBARA', 'EUDR Traceability', 'K3 HSE'],
  },
  {
    id: 'govtech',
    name: 'GovTech, Layanan Publik & Smart City',
    nameEn: 'GovTech, Public Services & Smart City',
    shortName: 'GovTech & Publik',
    shortNameEn: 'GovTech & Civic',
    indonesiaThesis: 'Konsolidasi INA Digital DPI, perizinan OSS-RBA, transparansi APBDes, telemetri banjir, audit SPBE, dan aplikasi warga RT/RW.',
    indonesiaThesisEn: 'INA Digital DPI consolidation, OSS-RBA licensing, village budget transparency, flood telemetry, SPBE audits, and RT/RW neighborhood apps.',
    standards: ['INA Digital', 'OSS-RBA', 'SPBE / BSrE'],
  },
  {
    id: 'devtools',
    name: 'Developer Tools, API & Middleware',
    nameEn: 'Developer Tools, API & Middleware',
    shortName: 'DevTools & API',
    shortNameEn: 'DevTools & API',
    indonesiaThesis: 'Adapter SOAP/AS400 ke REST/gRPC, linter migrasi SQL zero-downtime, validator FHIR, replay DLQ, dan dynamic form mobile.',
    indonesiaThesisEn: 'SOAP/AS400 to REST/gRPC adapters, zero-downtime SQL migration linters, FHIR validators, DLQ replay tools, and dynamic mobile forms.',
    standards: ['OpenAPI / gRPC', 'HL7 FHIR', 'Outbox / AMQP'],
  },
  {
    id: 'cloudsec',
    name: 'Cloud, DevOps, Observability & Cybersecurity',
    nameEn: 'Cloud, DevOps, Observability & Cybersecurity',
    shortName: 'Cloud & SecOps',
    shortNameEn: 'Cloud & SecOps',
    indonesiaThesis: 'Vault persetujuan dan PII UU PDP, FinOps multi-cloud Jakarta, telemetri PUE data center, dan deployment CI/CD air-gapped.',
    indonesiaThesisEn: 'UU PDP consent and PII vaults, Jakarta multi-cloud FinOps, data center PUE telemetry, and air-gapped CI/CD deployments.',
    standards: ['UU PDP', 'ISO 27001 / BSSN', 'Air-Gapped K8s'],
  },
  {
    id: 'data',
    name: 'Data Platform, Analytics & BI',
    nameEn: 'Data Platform, Analytics & BI',
    shortName: 'Data & BI',
    shortNameEn: 'Data & BI',
    indonesiaThesis: 'BI sell-out general trade 38 provinsi, sinkronisasi survei lapangan offline, sentimen NLP Bahasa Indonesia, dan KPI cabang.',
    indonesiaThesisEn: 'General-trade sell-out BI across 38 provinces, offline field survey sync, Indonesian NLP sentiment analysis, and branch KPI tracking.',
    standards: ['Medallion SQL', 'Offline Sync', 'Data Contracts'],
  },
  {
    id: 'climate',
    name: 'Climate Tech, Mobilitas EV & Karbon',
    nameEn: 'Climate Tech, EV Mobility & Carbon',
    shortName: 'Iklim & EV',
    shortNameEn: 'Climate & EV',
    indonesiaThesis: 'Jaringan tukar baterai motor listrik, ledger kredit IDXCarbon, solar atap industri, digital twin IKN, dan MRV mangrove.',
    indonesiaThesisEn: 'EV motorbike battery-swap networks, IDXCarbon credit ledgers, industrial rooftop solar, IKN digital twins, and mangrove MRV.',
    standards: ['IDXCarbon', 'PLN Net-Meter', 'OCPP 2.0.1'],
  },
  {
    id: 'agritech',
    name: 'Agritech, Ketahanan Pangan & Perikanan',
    nameEn: 'Agritech, Food Security & Fisheries',
    shortName: 'Pangan & Agri',
    shortNameEn: 'Food & Agri',
    indonesiaThesis: 'Rantai pasok dapur MBG, IoT tambak udang vannamei, ketertelusuran kopi Arabika ekspor, lelang ikan TPI, dan katering korporat.',
    indonesiaThesisEn: 'MBG school-meal supply chains, vannamei shrimp pond IoT, export Arabica coffee traceability, TPI fish auctions, and corporate catering.',
    standards: ['MBG Nutrition QA', 'EUDR Origin', 'Cold-Chain Fish'],
  },
  {
    id: 'lifestyle',
    name: 'EdTech, Ekosistem Syariah & Hospitality',
    nameEn: 'EdTech, Sharia Ecosystem & Hospitality',
    shortName: 'Syariah, Ed & Travel',
    shortNameEn: 'Sharia, Ed & Travel',
    indonesiaThesis: 'Sertifikasi Halal wajib BPJPH, operasional Umrah, OS pesantren cashless, tryout adaptif UTBK, bootcamp vokasi, dan PMS vila Bali.',
    indonesiaThesisEn: 'Mandatory BPJPH Halal certification, Umrah operations, cashless boarding school OS, adaptive UTBK prep, vocational bootcamps, and Bali villa PMS.',
    standards: ['BPJPH SJPH', 'SISKOPATUH', 'IRT / SKKNI'],
  },
  {
    id: 'emerging',
    name: 'Ekonomi Kreator, Komunikasi & Emerging Tech',
    nameEn: 'Creator Economy, Comms & Emerging Tech',
    shortName: 'Kreator & Emerging',
    shortNameEn: 'Creator & Emerging',
    indonesiaThesis: 'Otomasi WhatsApp Business API, escrow kreator, bengkel digital, wakaf teraudit, sertipikat tanah elektronik, game LiveOps, dan royalti buku.',
    indonesiaThesisEn: 'WhatsApp Business API automation, creator escrow, digital workshops, audited waqf, electronic land deeds, game LiveOps, and book royalties.',
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

export const ARCHETYPE_LABELS_EN: Record<ArchetypeId, string> = {
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
  'gov-portal': 'Public Service Portal',
  'bi-analytics': 'BI & Telemetry',
  'ide-code-diff': 'API & Schema IDE',
  'calendar-booking': 'Scheduler & Roster',
  'document-vault': 'Compliance & Vault',
  'desktop-erp': 'Desktop ERP Grid',
  'social-community': 'Community & Cohort',
  'security-soc': 'SecOps & Fraud Desk',
};

export function getArchetypeLabel(id: ArchetypeId, lang: Language): string {
  return lang === 'en' ? ARCHETYPE_LABELS_EN[id] : ARCHETYPE_LABELS[id];
}

export function getSectorName(sector: SectorMeta, lang: Language): string {
  return lang === 'en' ? sector.nameEn : sector.name;
}

export function getSectorShortName(sector: SectorMeta, lang: Language): string {
  return lang === 'en' ? sector.shortNameEn : sector.shortName;
}

export function getSectorThesis(sector: SectorMeta, lang: Language): string {
  return lang === 'en' ? sector.indonesiaThesisEn : sector.indonesiaThesis;
}

export interface CuratedLens {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  filter: (p: { sector: SectorId; platform: PlatformType; standards: string[]; cvLink?: string }) => boolean;
}

export const CURATED_LENSES: CuratedLens[] = [
  {
    id: 'all',
    label: 'Semua Konsep',
    labelEn: 'All Concepts',
    description: 'Eksplorasi lengkap ekosistem teknologi Indonesia',
    descriptionEn: 'Complete exploration of the Indonesian digital product landscape',
    filter: () => true,
  },
  {
    id: 'dpi',
    label: 'DPI Nasional & Regulasi',
    labelEn: 'National DPI & Regulation',
    description: 'QRIS, BI-FAST, SNAP, SATUSEHAT, CoreTax, OSS-RBA, UU PDP, SPBE',
    descriptionEn: 'QRIS, BI-FAST, SNAP, SATUSEHAT, CoreTax, OSS-RBA, UU PDP, SPBE',
    filter: (p) =>
      p.standards.some((s) =>
        /QRIS|BI-FAST|SNAP|SATUSEHAT|CoreTax|UU PDP|OSS-RBA|INA Digital|CEISA|BPJS|BPJPH|IDXCarbon|SPBE/i.test(s)
      ),
  },
  {
    id: 'ai-agentic',
    label: 'AI & Sistem Agentic',
    labelEn: 'AI & Agentic Systems',
    description: 'Inference router, RAG, voice QA, red-team, dan edge vision',
    descriptionEn: 'Inference routers, RAG pipelines, voice QA, red-teaming, and edge vision',
    filter: (p) => p.sector === 'ai' || p.platform === 'AI / Agentic',
  },
  {
    id: 'industrial-ent',
    label: 'Enterprise, Tambang & Logistik',
    labelEn: 'Enterprise, Mining & Logistics',
    description: 'Industri berat, ERP multi-cabang, cold-chain, dan maritim',
    descriptionEn: 'Heavy industry, multi-branch ERP, cold-chain distribution, and maritime ops',
    filter: (p) => ['enterprise', 'industrial', 'logistics'].includes(p.sector),
  },
  {
    id: 'mobile-id',
    label: 'Mobile-First Indonesia',
    labelEn: 'Mobile-First Indonesia',
    description: 'Aplikasi Android/iOS lapangan, ritel, civic, dan konsumen',
    descriptionEn: 'Field, retail, civic, and consumer Android/iOS applications',
    filter: (p) => p.platform === 'Mobile App',
  },
  {
    id: 'cv-adjacent',
    label: 'Selaras Domain Karier',
    labelEn: 'Career-Aligned Domains',
    description: 'Konsep yang beririsan langsung dengan sektor pengalaman produksi saya',
    descriptionEn: 'Concepts directly aligned with industries from my production track record',
    filter: (p) => Boolean(p.cvLink),
  },
];

export function getLensLabel(lens: CuratedLens, lang: Language): string {
  return lang === 'en' ? lens.labelEn : lens.label;
}

export function getLensDescription(lens: CuratedLens, lang: Language): string {
  return lang === 'en' ? lens.descriptionEn : lens.description;
}
