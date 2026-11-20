// Maps every single one of the 108 projects to its bespoke high-craft layout,
// custom visual variant, product sidebar navigation, and chart/telemetry series.

export const PROJECT_VISUAL_SPECS = {
  // SECTOR 1: AI & AGENTS
  'ID-001': { layout: 'saas-gateway', variant: 'gateway', nav: ['Provider Pools', 'Model Routing', 'UU PDP Masking', 'Token Quotas', 'Failover Rules', 'Audit Ledger'], seriesA: [340, 315, 290, 312, 268, 245, 212], seriesB: [420, 410, 398, 405, 380, 360, 355] },
  'ID-002': { layout: 'legal-document-review', variant: 'bilingual', nav: ['Active Matters', 'Redline Viewer', 'UU PDP Clauses', 'Statutory Corpus', 'Sign-Off Queue'] },
  'ID-003': { layout: 'audio-waveform-qa', variant: 'voice', nav: ['Live Audit Stream', 'OJK Rubric', 'Escalations', 'Coaching Queue', 'PII Masking'] },
  'ID-004': { layout: 'code-ide-diff', variant: 'dotnet', nav: ['Worktrees', 'Roslyn Diffs', 'Build Gates', 'xUnit Runner', 'PR Queue'] },
  'ID-005': { layout: 'clinical-emr-workstation', variant: 'ambient', nav: ['Poli Queue', 'SOAP Scribe', 'ICD-10 Coder', 'e-Resep KFA', 'SATUSEHAT'] },
  'ID-006': { layout: 'soc-threat-ops', variant: 'llm-sec', nav: ['Live Blocks', 'ID Probe Suite', 'Tool Firewall', 'RAG Scanner', 'Policy Rules'] },
  'ID-007': { layout: 'tax-customs-workbench', variant: 'pajak-ai', nav: ['Classifier', 'PMK Corpus', 'PPh 23/26', 'Treaty DGT', 'Kertas Kerja'] },
  'ID-008': { layout: 'cctv-vision-grid', variant: 'factory', nav: ['Live Wall (16)', 'PPE Zones', 'Line QA', 'PLC Triggers', 'Shift Score'] },
  'ID-009': { layout: 'ecommerce-pim-store', variant: 'pim-ai', nav: ['SKU Catalog', 'BPOM Linter', 'Channel Sync', 'Margin Calc', 'Bulk Export'] },
  'ID-010': { layout: 'gis-satellite-map', variant: 'ndvi', nav: ['Estate Map', 'NDVI Stress', 'BMKG Rain', 'Yield 30d', 'EUDR Plots'] },

  // SECTOR 2: FINTECH & BANKING
  'ID-011': { layout: 'mobile-trio', variant: 'qris-tap', nav: ['Beranda', 'QRIS Tap', 'ASEAN QR'] },
  'ID-012': { layout: 'banking-treasury-desk', variant: 'treasury', nav: ['Cash Position', 'VA Recon', 'BI-FAST Batch', 'OCBC H2H', 'Maker-Checker'] },
  'ID-013': { layout: 'banking-treasury-desk', variant: 'sharia-escrow', nav: ['Escrow Vaults', 'Milestones', 'BAST Proofs', 'Tax Splits', 'Arbitration'] },
  'ID-014': { layout: 'desktop-win-erp', variant: 'bpr', nav: ['Teller Desk', 'Kredit Kol 1-5', 'Deposito', 'OJK SLIK', 'EOD Accrual'] },
  'ID-015': { layout: 'soc-threat-ops', variant: 'fraud', nav: ['Fraud Radar', 'Mule Graphs', 'Held Payouts', 'PPATK STR', 'Shadow Rules'] },
  'ID-016': { layout: 'mobile-trio', variant: 'gold-haji', nav: ['Tabungan', 'Porsi Haji', 'Kustodian'] },
  'ID-017': { layout: 'api-sandbox-studio', variant: 'snap-bi', nav: ['Service 73 Token', 'Service 24 VA', 'Service 18 BI-FAST', 'HMAC Inspector', 'ASPI Cert'] },
  'ID-018': { layout: 'mobile-trio', variant: 'ewa', nav: ['Gaji Berjalan', 'Tarik Dana', 'Slip Potong'] },
  'ID-019': { layout: 'bi-executive-suite', variant: 'credit', nav: ['Underwriting', 'QRIS Cashflow', 'e-Faktur', 'SLIK Exposure', 'Portfolio Risk'] },
  'ID-020': { layout: 'banking-treasury-desk', variant: 'remit', nav: ['ASEAN Corridors', 'FX Quoting', 'BI-FAST Rail', 'AML Hold', 'Prefund Pools'] },

  // SECTOR 3: E-COMMERCE & RETAIL
  'ID-021': { layout: 'ecommerce-pim-store', variant: 'omnichannel', nav: ['Master Stock', 'Order Waves', '3PL AWBs', 'Escrow Audit', 'Warehouses'] },
  'ID-022': { layout: 'pos-retail-terminal', variant: 'cafe', nav: ['Kopi & Espresso', 'Non-Coffee', 'Pastry', 'Bundle'] },
  'ID-023': { layout: 'ecommerce-pim-store', variant: 'b2b-materials', nav: ['Catalog SNI', 'RFQ Quotes', 'Truck Loads', 'TOP Credit', 'Surat Jalan'] },
  'ID-024': { layout: 'mobile-trio', variant: 'warung', nav: ['Katalog Grosir', 'Scan Rak', 'Tagihan Tempo'] },
  'ID-025': { layout: 'bi-executive-suite', variant: 'live-commerce', nav: ['Live Studio', 'Etalase CVR', 'Host Shift', 'GMV Max Ads', 'Affiliates'] },
  'ID-026': { layout: 'pos-retail-terminal', variant: 'pharmacy', nav: ['Resep Dokter', 'OTC Bebas', 'Racikan', 'SIPNAP OOT'] },
  'ID-027': { layout: 'kanban-enterprise-board', variant: 'cod-rma', nav: ['COD Hold', 'WA Confirm', 'Reverse RTS', 'Video Disputes', 'Restock QC'] },
  'ID-028': { layout: 'mobile-trio', variant: 'mall-pass', nav: ['Member Pass', 'Scan Struk', 'Parkir QRIS'] },

  // SECTOR 4: ENTERPRISE ERP, HRIS & TAX
  'ID-029': { layout: 'kanban-enterprise-board', variant: 'approval80', nav: ['Executive Inbox', '84 Connected Apps', 'Elsa Flows', 'DoA Matrix', 'RabbitMQ Outbox'] },
  'ID-030': { layout: 'tax-customs-workbench', variant: 'coretax', nav: ['Faktur Keluaran', 'NITKU Check', 'Unifikasi PPh', 'Faktur Masukan', 'SPT XML'] },
  'ID-031': { layout: 'banking-treasury-desk', variant: 'payroll', nav: ['Payroll Run', 'PPh 21 TER', 'BPJS Caps', 'Variance >5%', 'Bank H2H'] },
  'ID-032': { layout: 'desktop-win-erp', variant: 'coldgate', nav: ['18 Branches', 'Stock Opname', 'Hygiene Audit', 'Pemusnahan', 'Excel Import'] },
  'ID-033': { layout: 'kanban-enterprise-board', variant: 'etender', nav: ['Active Tenders', 'Sealed Bids', 'TKDN Matrix', 'Collusion Guard', 'BPK Audit'] },
  'ID-034': { layout: 'desktop-win-erp', variant: 'assets', nav: ['Asset Register', 'PSAK vs Fiscal', 'QR Opname', 'BAST Custody', 'GL Journal'] },
  'ID-035': { layout: 'desktop-win-erp', variant: 'mrp', nav: ['Work Orders', 'Multi-BOM', 'Machine OEE', 'MRP Netting', 'Kawasan Berikat'] },
  'ID-036': { layout: 'scheduler-tape-chart', variant: 'shifts', nav: ['Roster Grid', 'Overtime Caps', 'ZKTeco Sync', 'Open Slots', 'Payroll Export'] },
  'ID-037': { layout: 'legal-document-review', variant: 'emeterai', nav: ['Signing Vault', 'Peruri Quota', 'Bulk PKWT', 'Renewals', 'WORM Audit'] },

  // SECTOR 5: HEALTHCARE & SATUSEHAT
  'ID-038': { layout: 'clinical-emr-workstation', variant: 'emr', nav: ['Poli Registration', 'Triage & SOAP', 'e-Resep KFA', 'BPJS VClaim', 'SATUSEHAT'] },
  'ID-039': { layout: 'scheduler-tape-chart', variant: 'hospital', nav: ['Poli Slots', 'Mobile JKN', 'Operating Room', 'Pharmacy Queue', 'WA Alerts'] },
  'ID-040': { layout: 'clinic-lab-lis', variant: 'pathology', nav: ['Validation Desk', 'Panic Alerts', 'Analyzers (4)', 'Westgard QC', 'LOINC FHIR'] },
  'ID-041': { layout: 'kanban-enterprise-board', variant: 'claims', nav: ['GL Intake', 'COB BPJS', 'Tariff Audit', 'Medical Dir', 'Issued GL'] },
  'ID-042': { layout: 'radiology-pacs-viewer', variant: 'pacs', nav: ['CITO Worklist', 'DICOM Reader', 'TB Triage', 'Expertise', 'RSUD Sync'] },
  'ID-043': { layout: 'mobile-trio', variant: 'posyandu', nav: ['Data Balita', 'Kurva WHO', 'Imunisasi'] },
  'ID-044': { layout: 'scada-industrial-plant', variant: 'cold', nav: ['32 Cold Probes', 'Excursions', 'MKT Calc', 'GS1 Lots', 'CDOB Certs'] },

  // SECTOR 6: LOGISTICS & MARITIME
  'ID-045': { layout: 'gis-satellite-map', variant: 'java', nav: ['Corridor Map', 'Backhaul Match', 'Uang Jalan', 'e-POD Billing', 'Fleet SLA'] },
  'ID-046': { layout: 'gis-satellite-map', variant: 'port', nav: ['Terminal Slots', 'Dual-Tx Pair', 'SP2 Expiry', 'Yard Density', 'Vessels'] },
  'ID-047': { layout: 'scada-industrial-plant', variant: 'cold', nav: ['24 Reefers', 'Tamper Guard', 'Blast Freezers', 'HACCP Strips', 'Alerts'] },
  'ID-048': { layout: 'tax-customs-workbench', variant: 'beacukai', nav: ['PIB / PEB', 'BTKI HS-Code', 'INSW Lartas', 'CEISA 4.0', 'MPN Billing'] },
  'ID-049': { layout: 'desktop-win-erp', variant: 'wms', nav: ['Pallet Slots', 'Wave Picking', 'Inbound ASN', 'Cycle Count', '3PL Billing'] },
  'ID-050': { layout: 'gis-satellite-map', variant: 'java', nav: ['Live Fleet', 'Fuel Siphon', '4G Dashcam', 'DMS Fatigue', 'PM Service'] },
  'ID-051': { layout: 'mobile-trio', variant: 'courier', nav: ['Daftar Stop', 'QRIS COD', 'Setor Hub'] },
  'ID-052': { layout: 'scheduler-tape-chart', variant: 'maritime', nav: ['Voyage Grid', 'TEU Capacity', 'Reefer Plugs', 'IMDG Hazmat', 'Manifest'] },

  // SECTOR 7: MINING, ENERGY & INDUSTRIAL
  'ID-053': { layout: 'desktop-win-erp', variant: 'mining-lube', nav: ['184 Heavy Units', 'Oil Lab SOS', 'HM PM Orders', 'Lube Trucks', 'Mine Sync'] },
  'ID-054': { layout: 'mobile-trio', variant: 'mine-meal', nav: ['Pesan Meal', 'QC Dapur', 'Badge Mess'] },
  'ID-055': { layout: 'scada-industrial-plant', variant: 'smelter', nav: ['RKEF Line 3', 'Kiln & Furnace', 'SISPEK CEMS', 'Captive Power', 'Shift Log'] },
  'ID-056': { layout: 'legal-document-review', variant: 'rkab', nav: ['RKAB Quotas', 'Barge Clear', 'e-PNBP Royalty', 'Stockpile Blend', 'SIMBARA'] },
  'ID-057': { layout: 'kanban-enterprise-board', variant: 'hse', nav: ['Active PTW', 'SIMOPS Guard', 'KTA/TTA Cards', 'KIMPER / SIO', 'SMKP Report'] },
  'ID-058': { layout: 'gis-satellite-map', variant: 'pit', nav: ['Pit Bench Map', 'Shovel Queue', 'Haul Resistance', 'BCM Target', 'Grader Ops'] },
  'ID-059': { layout: 'scada-industrial-plant', variant: 'mill', nav: ['Weighbridge', 'Ramp Grading', 'Sterilizer', 'OER Yield', 'EUDR Chain'] },

  // SECTOR 8: GOVTECH & CIVIC
  'ID-060': { layout: 'community-civic-hub', variant: 'warga-rt', nav: ['Kas RT Ledger', 'Data Warga', 'Surat Pengantar', 'UMKM Lokal', 'Pengumuman'] },
  'ID-061': { layout: 'gov-dpi-portal', variant: 'inapass', nav: ['Layanan Aktif', 'Izin UU PDP', 'Kredensial IKD', 'Log Verifikasi'] },
  'ID-062': { layout: 'gov-dpi-portal', variant: 'danadesa', nav: ['Pagu APBDes', 'Proyek Fisik', 'BLT Desa', 'Pengawasan BPD'] },
  'ID-063': { layout: 'gis-satellite-map', variant: 'watershed', nav: ['Ciliwung Gauges', 'Pompa SDA', 'Surge ETA', 'Alert RT/RW'] },
  'ID-064': { layout: 'gov-dpi-portal', variant: 'oss-rba', nav: ['KBLI 2020', 'PKKPR RDTR', 'PB-UMKU', 'Laporan LKPM'] },
  'ID-065': { layout: 'kanban-enterprise-board', variant: 'civic311', nav: ['Triage Masuk', 'Spatial Dedup', 'Dinas Crew', 'SLA Terpantau', 'Foto Selesai'] },
  'ID-066': { layout: 'pos-retail-terminal', variant: 'lapas-kiosk', nav: ['Check-In KTP', 'RFID Pass', 'Saldo Kantin', 'Audit Log'] },

  // SECTOR 9: DEVTOOLS & MIDDLEWARE
  'ID-067': { layout: 'api-sandbox-studio', variant: 'soap-bridge', nav: ['OCBC SOAP', 'Core WCF', 'SAP BAPI', 'WSDL Drift', 'YARP Canary'] },
  'ID-068': { layout: 'code-ide-diff', variant: 'sql-guard', nav: ['Migrations', 'Lock Analyzer', 'Index Check', 'UU PDP Tags', 'Drift Parity'] },
  'ID-069': { layout: 'api-sandbox-studio', variant: 'fhir-lint', nav: ['Encounter R4', 'Condition ICD', 'MedRequest KFA', 'Observation', 'C# DTO Gen'] },
  'ID-070': { layout: 'code-ide-diff', variant: 'eventmesh', nav: ['RabbitMQ DLQ', 'SQL Outbox', 'Poison JSON', 'Throttle Replay', 'Audit Log'] },
  'ID-071': { layout: 'api-sandbox-studio', variant: 'form-maui', nav: ['JSON Schema', 'MAUI Controls', 'RTL Arabic', 'DTO Parity', 'OTA Publish'] },
  'ID-072': { layout: 'code-ide-diff', variant: 'nuget-vault', nav: ['Internal Feeds', 'CVE Quarantine', 'SBOM Export', 'Repo Lag', 'Signing Keys'] },
  'ID-073': { layout: 'api-sandbox-studio', variant: 'webhooks', nav: ['Midtrans', 'Xendit VA', 'J&T 3PL', 'Retry Queue', 'HMAC Guard'] },
  'ID-074': { layout: 'bi-executive-suite', variant: 'loadtest', nav: ['Spike Profile', 'Latency P99', 'SQL Locks', 'Redis CPU', 'Go/No-Go'] },

  // SECTOR 10: CLOUD, DEVOPS & SECOPS
  'ID-075': { layout: 'soc-threat-ops', variant: 'uu-pdp', nav: ['PII Discovery', 'DSAR 3x24h', 'RoPA Registry', 'Cross-Border', 'Breach Desk'] },
  'ID-076': { layout: 'bi-executive-suite', variant: 'finops', nav: ['Multi-Cloud IDR', 'Idle Schedule', 'SQL Right-Size', 'Colocation GPU', 'Unit Cost'] },
  'ID-077': { layout: 'code-ide-diff', variant: 'harbor', nav: ['Signed Digests', 'Trivy Gate', 'Air-Gap Bundle', 'Pod Readback', 'Policies'] },
  'ID-078': { layout: 'soc-threat-ops', variant: 'siem', nav: ['Incident Queue', 'Wazuh Agents', 'MITRE Matrix', 'Containment', 'BSSN Export'] },
  'ID-079': { layout: 'scada-industrial-plant', variant: 'dcim', nav: ['Hall B PUE', 'AI GPU Racks', 'UPS Bus A/B', 'CRAC Cooling', 'Genset Fuel'] },
  'ID-080': { layout: 'soc-threat-ops', variant: 'bastion', nav: ['Active JIT', 'Access Queue', 'SQL Guard', 'Session Replay', 'ISO 27001'] },
  'ID-081': { layout: 'kanban-enterprise-board', variant: 'release', nav: ['Train 2026.11', 'CI/CD Gates', 'TestFlight/Play', 'Cert Radar', 'Prod Swap'] },

  // SECTOR 11: DATA PLATFORMS & BI
  'ID-082': { layout: 'saas-gateway', variant: 'lakehouse', nav: ['Gold Models', 'Lineage DAG', '07:00 WIB SLA', 'dbt Tests', 'DuckDB Cost'], seriesA: [96, 98, 99, 97, 99, 100, 99], seriesB: [95, 95, 95, 95, 95, 95, 95] },
  'ID-083': { layout: 'bi-executive-suite', variant: 'fmcg', nav: ['38 Provinces', 'Sell-In vs Out', 'Effective Call', 'OOS Heatmap', 'Promo ROI'] },
  'ID-084': { layout: 'mobile-trio', variant: 'survey', nav: ['Form Survei', 'Antrean Sync', 'Kuota Wilayah'] },
  'ID-085': { layout: 'bi-executive-suite', variant: 'sentiment', nav: ['Brand Radar', 'Crisis Spikes', 'Sarcasm NLP', 'Bot Filter', 'Media Digest'] },
  'ID-086': { layout: 'code-ide-diff', variant: 'dqgate', nav: ['YAML Contracts', 'GL Parity', 'Uniqueness', 'WIB TZ Check', 'BI Breaker'] },
  'ID-087': { layout: 'bi-executive-suite', variant: 'branch-kpi', nav: ['24 Branches', 'Weighted Pillars', 'Peer Groups', 'Coaching List', 'Bonus Export'] },

  // SECTOR 12: CLIMATE, EV & CARBON
  'ID-088': { layout: 'gis-satellite-map', variant: 'urban', nav: ['148 Cabinets', 'SoC Depletion', 'BMS Safety', 'Ojol Swaps', 'CO2 Saved'] },
  'ID-089': { layout: 'bi-executive-suite', variant: 'carbon', nav: ['Scope 1-2-3', 'ESDM Factors', 'IDXCarbon SPE', 'POJK 51', 'EU CBAM'] },
  'ID-090': { layout: 'scada-industrial-plant', variant: 'solar', nav: ['1.8 MWp Array', 'DC Strings', 'Soiling PR', 'Zero-Export', 'PPA Billing'] },
  'ID-091': { layout: 'mobile-trio', variant: 'waste-epr', nav: ['Timbang BLE', 'Saldo Warga', 'Sertifikat EPR'] },
  'ID-092': { layout: 'gis-satellite-map', variant: 'mangrove', nav: ['Delta Plots', 'Drone 12m', 'Soil Carbon', 'Village Bonus', 'VM0033 MRV'] },
  'ID-093': { layout: 'scheduler-tape-chart', variant: 'ev-depot', nav: ['36 EV Buses', 'OCPP 2.0.1', 'LWBP Night Plan', '05:00 Pull-Out', 'Bay Faults'] },

  // SECTOR 13: AGRITECH & FOOD SECURITY
  'ID-094': { layout: 'kanban-enterprise-board', variant: 'mbg', nav: ['Daily Menus', 'BUMDes Supply', 'HACCP QA Gate', 'School Drops', 'Retention 72h'] },
  'ID-095': { layout: 'scada-industrial-plant', variant: 'pond', nav: ['12 Ponds DOC', 'DO / pH Guard', 'Auto-Kincir', 'FCR Feed', 'Genset'] },
  'ID-096': { layout: 'legal-document-review', variant: 'coffee-eudr', nav: ['Micro-Lots', '64 Farm Polygons', 'SCA Cupping', 'EUDR DDS', 'Roaster QR'] },
  'ID-097': { layout: 'pos-retail-terminal', variant: 'fish-auction', nav: ['Tuna Sashimi', 'Pelagic', 'Ice & Solar', 'KKP SHTI'] },
  'ID-098': { layout: 'gov-dpi-portal', variant: 'pupuk', nav: ['Verifikasi NIK', 'Kuota e-RDKK', 'Kunci HET', 'Stok Kios'] },

  // SECTOR 14: SHARIA, EDTECH & HOSPITALITY
  'ID-099': { layout: 'legal-document-review', variant: 'halal-bpjph', nav: ['42 SKUs Matrix', '118 Bahan', 'SJPH Criteria', 'LPH Audit', 'SIHALAL Pack'] },
  'ID-100': { layout: 'scheduler-tape-chart', variant: 'umrah', nav: ['Kloter #14', 'Visa Nusuk', 'Rooming List', 'Muthawwif', 'SAR Margin'] },
  'ID-101': { layout: 'mobile-trio', variant: 'pesantren', nav: ['Kartu Santri', 'SPP Virtual', 'Tahfidz'] },
  'ID-102': { layout: 'community-civic-hub', variant: 'vokasi', nav: ['Cohort Sprints', 'Mentor Rubrics', 'Verified PRs', 'Hiring Partners', 'SKKNI Map'] },
  'ID-103': { layout: 'scheduler-tape-chart', variant: 'villa-pms', nav: ['18 Villas Tape', '4 OTAs Sync', 'Housekeeping', 'Owner P&L', 'APOA / PB1'] },

  // SECTOR 15: CREATOR, COMM & EMERGING
  'ID-104': { layout: 'community-civic-hub', variant: 'creator', nav: ['28 KOL Active', 'Escrow Vault', 'Draft QA', 'Live Metrics', 'PPh 21 Slips'] },
  'ID-105': { layout: 'whatsapp-flow-studio', variant: 'wa-flow', nav: ['Flow Canvas', 'Meta Templates', 'QRIS Checkout', 'CS Escalation', 'UU PDP Opt-Out'] },
  'ID-106': { layout: 'pos-retail-terminal', variant: 'bengkel', nav: ['8 Lift Bays', 'PKB Jasa', 'Genuine Parts', 'WA Quote'] },
  'ID-107': { layout: 'gov-dpi-portal', variant: 'wakaf', nav: ['Pokok Wakaf', 'Aset Produktif', '8 Asnaf Zakat', 'BSZ Pajak'] },
  'ID-108': { layout: 'legal-document-review', variant: 'notaris', nav: ['Deal Room', 'Sertipikat-el', 'PPh & BPHTB', 'Draft AJB', 'Minuta Vault'] },
};
