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
    indonesiaThesis: 'Enterprise LLM routers, Bahasa Indonesia voice/NLP QA, statutory RAG, and compliant AI governance.',
    standards: ['Sovereign AI', 'UU PDP', 'OpenAI / Anthropic'],
  },
  {
    id: 'fintech',
    name: 'Fintech, Payments & Digital Banking',
    shortName: 'Fintech & BI',
    indonesiaThesis: 'QRIS Tap NFC, SNAP BI Open APIs, BI-FAST cross-border Nexus, Sharia finance, and OJK-compliant risk controls.',
    standards: ['QRIS / BI-FAST', 'SNAP BI', 'OJK SLIK'],
  },
  {
    id: 'commerce',
    name: 'E-Commerce, Omnichannel & Retail Tech',
    shortName: 'Commerce & POS',
    indonesiaThesis: 'Tokopedia-TikTok-Shopee stock sync, B2B building materials, micro-retail warung replenishment, and offline-first POS.',
    standards: ['QRIS Dynamic', 'BPOM', 'COD Risk'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise ERP, HRIS, Tax & Operations',
    shortName: 'Enterprise ERP',
    indonesiaThesis: 'CoreTax DJP integration, PPh 21 TER payroll, 80+ app approval orchestration, and multi-branch desktop ERPs.',
    standards: ['CoreTax DJP', 'Peruri e-Meterai', 'BPJS / Tapera'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare, Hospitals & SATUSEHAT',
    shortName: 'Healthcare',
    indonesiaThesis: 'Mandatory SATUSEHAT HL7 FHIR interoperability, BPJS VClaim/Antrean bridging, and tier-2/3 hospital digitization.',
    standards: ['SATUSEHAT FHIR', 'BPJS VClaim', 'DICOM / LIS'],
  },
  {
    id: 'logistics',
    name: 'Logistics, Maritime & Supply Chain',
    shortName: 'Logistics',
    indonesiaThesis: 'Archipelagic freight optimization, Pelindo port slots, CEISA 4.0 customs, cold-chain reefers, and fleet telematics.',
    standards: ['CEISA 4.0', 'e-POD', 'Cold-Chain HACCP'],
  },
  {
    id: 'industrial',
    name: 'Mining, Energy, Industrial & ESG',
    shortName: 'Mining & Industry',
    indonesiaThesis: 'Nickel downstream smelter SCADA, heavy-equipment lube/PM, remote mine camp ops, and ESDM RKAB/SIMBARA compliance.',
    standards: ['RKAB / SIMBARA', 'EUDR Traceability', 'K3 HSE'],
  },
  {
    id: 'govtech',
    name: 'GovTech, Civic & Smart City',
    shortName: 'GovTech & Civic',
    indonesiaThesis: 'INA Digital DPI consolidation, OSS-RBA licensing, transparent village funds, urban flood telemetry, and RT/RW civic apps.',
    standards: ['INA Digital', 'OSS-RBA', 'BSrE / Dukcapil'],
  },
  {
    id: 'devtools',
    name: 'Developer Tools, APIs & Middleware',
    shortName: 'DevTools & API',
    indonesiaThesis: 'Legacy SOAP/AS400 adapters, zero-downtime SQL guards, FHIR linters, event replay consoles, and dynamic mobile form engines.',
    standards: ['OpenAPI / gRPC', 'HL7 FHIR', 'Outbox / AMQP'],
  },
  {
    id: 'cloudsec',
    name: 'Cloud, DevOps, Observability & Security',
    shortName: 'Cloud & SecOps',
    indonesiaThesis: 'UU PDP consent & PII vaults, Jakarta multi-region cloud FinOps, data center PUE telemetry, and air-gapped CI/CD security.',
    standards: ['UU PDP', 'ISO 27001 / BSSN', 'Air-Gapped K8s'],
  },
  {
    id: 'data',
    name: 'Data Platforms, Analytics & BI',
    shortName: 'Data & BI',
    indonesiaThesis: '38-province general trade sell-out BI, offline field census sync, Indonesian NLP sentiment, and branch KPI scorecards.',
    standards: ['Medallion SQL', 'Offline Sync', 'Data Contracts'],
  },
  {
    id: 'climate',
    name: 'Climate Tech, EV Mobility & Carbon',
    shortName: 'Climate & EV',
    indonesiaThesis: 'Electric motorbike battery-swap grids, IDXCarbon credit ledgers, commercial rooftop solar, and coastal mangrove MRV.',
    standards: ['IDXCarbon', 'PLN Net-Meter', 'EPR Waste'],
  },
  {
    id: 'agritech',
    name: 'Agritech, Food Security & Fisheries',
    shortName: 'Agri & Food',
    indonesiaThesis: 'MBG school-meal supply QA, vannamei shrimp pond IoT, Arabica export traceability, and geo-verified fertilizer distribution.',
    standards: ['MBG Nutrition QA', 'EUDR Origin', 'Cold-Chain Fish'],
  },
  {
    id: 'lifestyle',
    name: 'EdTech, Sharia Ecosystem & Hospitality',
    shortName: 'Sharia, Ed & Travel',
    indonesiaThesis: 'BPJPH mandatory Halal certification, Umrah operations, cashless pesantren OS, vocational bootcamps, and Bali villa PMS.',
    standards: ['BPJPH SJPH', 'SISKOPATUH', 'PHRI Tax'],
  },
  {
    id: 'emerging',
    name: 'Creator Economy, Comm & Emerging Tech',
    shortName: 'Comm & Emerging',
    indonesiaThesis: 'WhatsApp Business automation, influencer campaign escrow, digital workshop bays, audited waqf, and electronic land deeds.',
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
  'gov-portal': 'Public Service Portal',
  'bi-analytics': 'BI & Telemetry',
  'ide-code-diff': 'API & Schema IDE',
  'calendar-booking': 'Scheduler & Roster',
  'document-vault': 'Compliance & Vault',
  'desktop-erp': 'Desktop ERP Grid',
  'social-community': 'Community & Cohort',
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
    label: 'All 108 Concepts',
    description: 'Complete Indonesian digital economy exploration',
    filter: () => true,
  },
  {
    id: 'dpi',
    label: 'National DPI & Compliance',
    description: 'QRIS, BI-FAST, SATUSEHAT, CoreTax, OSS-RBA, UU PDP',
    filter: (p) =>
      p.standards.some((s) =>
        /QRIS|BI-FAST|SNAP|SATUSEHAT|CoreTax|UU PDP|OSS-RBA|INA Digital|CEISA|BPJS|BPJPH|IDXCarbon/i.test(s)
      ),
  },
  {
    id: 'ai-agentic',
    label: 'AI & Agentic Systems',
    description: 'Inference routers, RAG, voice QA, red-team & edge vision',
    filter: (p) => p.sector === 'ai' || p.platform === 'AI / Agentic',
  },
  {
    id: 'industrial-ent',
    label: 'Enterprise, Mining & Logistics',
    description: 'Heavy industry, multi-branch ERP, cold-chain, maritime',
    filter: (p) => ['enterprise', 'industrial', 'logistics'].includes(p.sector),
  },
  {
    id: 'mobile-id',
    label: 'Mobile-First Indonesia',
    description: 'Android/iOS field, retail, civic & consumer products',
    filter: (p) => p.platform === 'Mobile App',
  },
  {
    id: 'cv-adjacent',
    label: 'Direct CV Domain Match',
    description: 'Concepts directly informed by Hernanda’s verified career sectors',
    filter: (p) => Boolean(p.cvLink),
  },
];
