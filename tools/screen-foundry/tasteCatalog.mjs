// Unique per-project art direction across all 108 projects:
// { shell, theme, font, widget, persona, nav } — NO two adjacent projects share the same taste!

export const TASTE_CATALOG = {
  // SECTOR 1: AI & AGENTS (10 distinct tastes)
  'ID-001': { shell: 'icon-rail-narrow', theme: 'blueprint-cobalt', font: 'swiss-geometric', widget: 'latency-dual', persona: 'Inference Lead · GRC Group', nav: ['Pools', 'Routing', 'UU PDP', 'Quotas', 'Audit'] },
  'ID-002': { shell: 'top-nav-editorial', theme: 'paper-editorial', font: 'editorial-serif', widget: 'bilingual-redline', persona: 'Corporate Counsel · SCBD', nav: ['Matters', 'Redlines', 'UU PDP', 'JDIH Corpus'] },
  'ID-003': { shell: 'floating-topbar-cards', theme: 'clinical-mint', font: 'humanist-friendly', widget: 'audio-waveform', persona: 'QA Supervisor · BPO JKT', nav: ['Audit Stream', 'OJK Rubric', 'Escalations', 'Coaching'] },
  'ID-004': { shell: 'mac-window-studio', theme: 'nord-dev', font: 'technical-mono', widget: 'code-diff', persona: 'Principal .NET · Migration', nav: ['Worktrees', 'Roslyn Diff', 'Build Gate', 'xUnit'] },
  'ID-005': { shell: 'split-sidebar-brand', theme: 'clinical-mint', font: 'humanist-friendly', widget: 'ecg-soap', persona: 'dr. Hendra, Sp.PD · Poli', nav: ['Poli Queue', 'SOAP Scribe', 'ICD-10', 'KFA e-Resep', 'SATUSEHAT'] },
  'ID-006': { shell: 'dark-command-hud', theme: 'cyber-noir', font: 'technical-mono', widget: 'radar-spider', persona: 'AI Red-Team · SecOps', nav: ['Blocks', 'ID Probes', 'Tool ACL', 'RAG Guard'] },
  'ID-007': { shell: 'bento-executive', theme: 'swiss-mono', font: 'swiss-geometric', widget: 'bar-regional', persona: 'Tax Manager · KKP JKT', nav: ['Classifier', 'PMK Corpus', 'PPh 23/26', 'Treaty DGT'] },
  'ID-008': { shell: 'dark-command-hud', theme: 'industrial-steel', font: 'industrial-condensed', widget: 'cctv-wall', persona: 'Plant K3 Lead · Cikarang', nav: ['Live Wall', 'PPE Zones', 'Line QA', 'PLC Alert'] },
  'ID-009': { shell: 'floating-topbar-cards', theme: 'retail-coral', font: 'swiss-geometric', widget: 'truck-load', persona: 'Brand Merch · NusaKopi', nav: ['Catalog', 'BPOM Lint', 'Margins', 'Sync Feeds'] },
  'ID-010': { shell: 'split-sidebar-brand', theme: 'agro-forest', font: 'industrial-condensed', widget: 'map-ndvi', persona: 'Agronomist · Kalteng', nav: ['Estate GIS', 'NDVI Stress', 'BMKG Rain', 'EUDR Plots'] },

  // SECTOR 2: FINTECH & BANKING (10 distinct tastes)
  'ID-011': { shell: 'mobile-asymmetric', theme: 'blueprint-cobalt', font: 'swiss-geometric', widget: 'latency-dual', persona: 'Commuter · MRT Dukuh Atas', nav: ['Beranda', 'QRIS Tap', 'ASEAN QR'] },
  'ID-012': { shell: 'bento-executive', theme: 'swiss-mono', font: 'swiss-geometric', widget: 'bar-regional', persona: 'Group Treasurer · 5 Banks', nav: ['Cash Position', 'VA Recon', 'BI-FAST', 'OCBC H2H'] },
  'ID-013': { shell: 'top-nav-editorial', theme: 'sharia-sand', font: 'editorial-serif', widget: 'milestone-vault', persona: 'Escrow Officer · BSI VA', nav: ['Custody Vault', 'Milestones', 'BAST Proofs', 'Arbitration'] },
  'ID-014': { shell: 'windows-ribbon-erp', theme: 'studio-daylight', font: 'swiss-geometric', widget: 'branch-heatmap', persona: 'Kepala Cabang · BPR Bekasi', nav: ['Teller', 'Kredit Kol 1-5', 'Deposito', 'OJK SLIK', 'EOD'] },
  'ID-015': { shell: 'dark-command-hud', theme: 'bloomberg-obsidian', font: 'technical-mono', widget: 'mule-network', persona: 'Fraud Ops · BI TIKMI', nav: ['Fraud Radar', 'Mule Ring', 'Holds', 'PPATK STR'] },
  'ID-016': { shell: 'mobile-asymmetric', theme: 'sharia-sand', font: 'editorial-serif', widget: 'radial-gauge', persona: 'Jamaah · Vault Emas JKT', nav: ['Tabungan', 'Porsi Haji', 'Kustodian'] },
  'ID-017': { shell: 'mac-window-studio', theme: 'sovereign-indigo', font: 'technical-mono', widget: 'code-diff', persona: 'Payment Arch · ASPI SNAP', nav: ['Token 73', 'VA 24', 'BI-FAST 18', 'HMAC'] },
  'ID-018': { shell: 'mobile-asymmetric', theme: 'clinical-mint', font: 'humanist-friendly', widget: 'radial-gauge', persona: 'Staff · PT Karya Mandiri', nav: ['Gaji Aktif', 'Tarik Dana', 'Slip Potong'] },
  'ID-019': { shell: 'icon-rail-narrow', theme: 'paper-editorial', font: 'swiss-geometric', widget: 'radial-gauge', persona: 'Credit Analyst · UMKM SBY', nav: ['Scoring', 'QRIS Flow', 'e-Faktur', 'SLIK'] },
  'ID-020': { shell: 'floating-topbar-cards', theme: 'maritime-navy', font: 'swiss-geometric', widget: 'corridor-hub', persona: 'FX Corridor Desk · ASEAN', nav: ['Corridors', 'FX Quote', 'BI-FAST', 'PPATK IFTI'] },

  // SECTOR 3: E-COMMERCE & RETAIL (8 distinct tastes)
  'ID-021': { shell: 'icon-rail-narrow', theme: 'retail-coral', font: 'swiss-geometric', widget: 'bar-regional', persona: 'Fulfillment Ops · 3 Gudang', nav: ['Stock', 'Waves', '3PL AWB', 'Escrow'] },
  'ID-022': { shell: 'split-sidebar-brand', theme: 'coffee-roast', font: 'humanist-friendly', widget: 'milestone-vault', persona: 'Kasir #1 · Outlet Kemang', nav: ['Kopi & Espresso', 'Non-Coffee', 'Pastry', 'QRIS', 'BOM'] },
  'ID-023': { shell: 'top-nav-editorial', theme: 'paper-editorial', font: 'industrial-condensed', widget: 'truck-load', persona: 'Site Buyer · Karawang', nav: ['SNI Catalog', 'RFQ', 'Truck Load', 'TOP Credit'] },
  'ID-024': { shell: 'mobile-asymmetric', theme: 'coffee-roast', font: 'humanist-friendly', widget: 'bar-regional', persona: 'Toko Sumber Rejeki · Depok', nav: ['Katalog', 'Scan Rak', 'Tempo 7H'] },
  'ID-025': { shell: 'dark-command-hud', theme: 'sovereign-indigo', font: 'swiss-geometric', widget: 'latency-dual', persona: 'Live Producer · Studio 2', nav: ['Live GMV', 'Etalase', 'Host Shift', 'Ads ROAS'] },
  'ID-026': { shell: 'split-sidebar-brand', theme: 'clinical-mint', font: 'humanist-friendly', widget: 'lab-ranges', persona: 'apt. Lestari · Meja Resep', nav: ['Resep', 'FEFO Batch', 'Racikan', 'SIPNAP'] },
  'ID-027': { shell: 'floating-topbar-cards', theme: 'bali-linen', font: 'swiss-geometric', widget: 'milestone-vault', persona: 'RMA Lead · COD Guard', nav: ['COD Hold', 'WA Confirm', 'RTS Reverse', 'Disputes'] },
  'ID-028': { shell: 'mobile-asymmetric', theme: 'sovereign-indigo', font: 'swiss-geometric', widget: 'radial-gauge', persona: 'Gold Pass · Grand Sudirman', nav: ['Member', 'Scan Struk', 'Parkir QRIS'] },

  // SECTOR 4: ENTERPRISE ERP, HRIS & TAX (9 distinct tastes)
  'ID-029': { shell: 'mac-window-studio', theme: 'swiss-mono', font: 'swiss-geometric', widget: 'milestone-vault', persona: 'Director Inbox · 84 Apps', nav: ['Pending 12', '84 Apps', 'Elsa Flows', 'DoA Matrix'] },
  'ID-030': { shell: 'top-nav-editorial', theme: 'blueprint-cobalt', font: 'technical-mono', widget: 'code-diff', persona: 'Tax Compliance · PKP JKT', nav: ['e-Faktur', 'NITKU Check', 'Unifikasi', 'SPT XML'] },
  'ID-031': { shell: 'bento-executive', theme: 'clinical-mint', font: 'swiss-geometric', widget: 'bar-regional', persona: 'Payroll Dir · 3 Entities', nav: ['Run Nov', 'PPh 21 TER', 'BPJS Caps', 'Variance'] },
  'ID-032': { shell: 'windows-ribbon-erp', theme: 'maritime-navy', font: 'industrial-condensed', widget: 'branch-heatmap', persona: 'National Ops · 18 Cabang', nav: ['18 Branches', 'Stock-Take', 'Hygiene', 'Pemusnahan'] },
  'ID-033': { shell: 'top-nav-editorial', theme: 'civic-crimson', font: 'editorial-serif', widget: 'milestone-vault', persona: 'Komite Tender · BUMN', nav: ['Sealed Bids', 'TKDN 40%', 'Collusion', 'BPK Audit'] },
  'ID-034': { shell: 'windows-ribbon-erp', theme: 'paper-editorial', font: 'swiss-geometric', widget: 'latency-dual', persona: 'GA Controller · 4,820 Aset', nav: ['Asset Grid', 'PSAK 16', 'QR Opname', 'BAST'] },
  'ID-035': { shell: 'windows-ribbon-erp', theme: 'industrial-steel', font: 'industrial-condensed', widget: 'oee-rings', persona: 'PPIC Plant · Karawang', nav: ['Work Orders', 'Multi-BOM', 'OEE Live', 'Kaw. Berikat'] },
  'ID-036': { shell: 'floating-topbar-cards', theme: 'blueprint-cobalt', font: 'humanist-friendly', widget: 'branch-heatmap', persona: 'Ops Roster · 148 Crew', nav: ['Shift Grid', 'OT Cap 18h', 'ZKTeco', 'Export'] },
  'ID-037': { shell: 'top-nav-editorial', theme: 'paper-editorial', font: 'editorial-serif', widget: 'bilingual-redline', persona: 'Legal Ops · Peruri Vault', nav: ['Signing Room', 'e-Meterai', 'Bulk PKWT', 'WORM Audit'] },

  // SECTOR 5: HEALTHCARE & SATUSEHAT (7 distinct tastes)
  'ID-038': { shell: 'icon-rail-narrow', theme: 'clinical-mint', font: 'humanist-friendly', widget: 'ecg-soap', persona: 'Poli Jantung · RM-008412', nav: ['Triage', 'SOAP', 'e-Resep', 'VClaim', 'FHIR'] },
  'ID-039': { shell: 'floating-topbar-cards', theme: 'blueprint-cobalt', font: 'humanist-friendly', widget: 'branch-heatmap', persona: 'Admisi RS · Mobile JKN', nav: ['Poli Slots', 'Task 1-7', 'Kamar OK', 'Farmasi'] },
  'ID-040': { shell: 'split-sidebar-brand', theme: 'maritime-navy', font: 'technical-mono', widget: 'lab-ranges', persona: 'dr. Patologi · LabNet LIS', nav: ['Validation', 'Panic K+', 'Analyzers', 'Westgard QC'] },
  'ID-041': { shell: 'bento-executive', theme: 'studio-daylight', font: 'swiss-geometric', widget: 'milestone-vault', persona: 'Medical Adjudicator · COB', nav: ['GL Queue', 'COB BPJS', 'Tariff Audit', 'Issued GL'] },
  'ID-042': { shell: 'dark-command-hud', theme: 'cyber-noir', font: 'technical-mono', widget: 'dicom-scan', persona: 'dr. Sari, Sp.Rad · 12 RSUD', nav: ['CITO STAT', 'DICOM', 'TB Triage', 'Expertise'] },
  'ID-043': { shell: 'mobile-asymmetric', theme: 'agro-forest', font: 'humanist-friendly', widget: 'ecg-soap', persona: 'Bidan Desa · Garut 3T', nav: ['Balita', 'Z-Score', 'Imunisasi'] },
  'ID-044': { shell: 'dark-command-hud', theme: 'nord-dev', font: 'technical-mono', widget: 'scada-cold', persona: 'APJ QA · PBF Pulogadung', nav: ['32 Probes', 'Excursion', 'MKT Calc', 'CDOB Cert'] },

  // SECTOR 6: LOGISTICS & MARITIME (8 distinct tastes)
  'ID-045': { shell: 'icon-rail-narrow', theme: 'maritime-navy', font: 'industrial-condensed', widget: 'map-java', persona: 'Fleet Dispatch · Trans-Jawa', nav: ['Corridor', 'Backhaul', 'Uang Jalan', 'e-POD'] },
  'ID-046': { shell: 'bento-executive', theme: 'maritime-navy', font: 'industrial-condensed', widget: 'container-yard', persona: 'Terminal 3 · Tanjung Priok', nav: ['Yard Bays', 'Dual-Tx', 'SP2 Expiry', 'Vessels'] },
  'ID-047': { shell: 'dark-command-hud', theme: 'industrial-steel', font: 'industrial-condensed', widget: 'scada-cold', persona: 'Cold-Chain NOC · 24 Reefers', nav: ['Reefers', 'Tamper', 'Blast Frz', 'HACCP'] },
  'ID-048': { shell: 'top-nav-editorial', theme: 'maritime-navy', font: 'technical-mono', widget: 'code-diff', persona: 'PPJK Customs · CEISA 4.0', nav: ['PIB / PEB', 'BTKI HS', 'Lartas', 'MPN-G3'] },
  'ID-049': { shell: 'windows-ribbon-erp', theme: 'studio-daylight', font: 'industrial-condensed', widget: 'branch-heatmap', persona: 'WMS Hub · Cikarang 12k', nav: ['Bin Slots', 'Wave #22', 'ASN In', '3PL Bill'] },
  'ID-050': { shell: 'dark-command-hud', theme: 'mining-ochre', font: 'industrial-condensed', widget: 'fuel-siphon', persona: 'Fleet Safety · 112 Units', nav: ['Fuel Guard', 'Dashcam', 'Fatigue', 'PM Due'] },
  'ID-051': { shell: 'mobile-asymmetric', theme: 'industrial-steel', font: 'swiss-geometric', widget: 'map-java', persona: 'Kurir Zona Tebet · 46 Stop', nav: ['Rute Stop', 'QRIS COD', 'Setor Hub'] },
  'ID-052': { shell: 'split-sidebar-brand', theme: 'maritime-navy', font: 'industrial-condensed', widget: 'container-yard', persona: 'Voyage Ops · Tol Laut Timur', nav: ['Voyages', 'TEU Cap', 'Reefer', 'Manifest'] },

  // SECTOR 7: MINING, ENERGY & INDUSTRIAL (7 distinct tastes)
  'ID-053': { shell: 'windows-ribbon-erp', theme: 'mining-ochre', font: 'industrial-condensed', widget: 'bar-regional', persona: 'Plant Maint · Pit Kaltim', nav: ['184 Units', 'Oil SOS', 'HM PM WO', 'Lube Truck'] },
  'ID-054': { shell: 'mobile-asymmetric', theme: 'mining-ochre', font: 'humanist-friendly', widget: 'radial-gauge', persona: 'Camp Mess · Townsite Mine', nav: ['Meal Box', 'QC Dapur', 'Badge'] },
  'ID-055': { shell: 'dark-command-hud', theme: 'industrial-steel', font: 'industrial-condensed', widget: 'scada-smelter', persona: 'Control Room · Morowali L3', nav: ['RKEF L3', 'Furnace', 'SISPEK', 'Power'] },
  'ID-056': { shell: 'bento-executive', theme: 'paper-editorial', font: 'editorial-serif', widget: 'radial-gauge', persona: 'Commercial IUP · SIMBARA', nav: ['RKAB Cap', 'Barges', 'e-PNBP', 'Blending'] },
  'ID-057': { shell: 'floating-topbar-cards', theme: 'mining-ochre', font: 'industrial-condensed', widget: 'radar-spider', persona: 'KTT Safety · SMKP Minerba', nav: ['Active PTW', 'SIMOPS', 'KTA/TTA', 'KIMPER'] },
  'ID-058': { shell: 'dark-command-hud', theme: 'mining-ochre', font: 'industrial-condensed', widget: 'map-pit', persona: 'Pit Tower · 32 HD Trucks', nav: ['Bench Map', 'Queue', 'Haul Road', 'BCM'] },
  'ID-059': { shell: 'split-sidebar-brand', theme: 'agro-forest', font: 'industrial-condensed', widget: 'scada-mill', persona: 'PKS Manager · Riau 60 TPH', nav: ['Weighbridge', 'Grading', 'Sterilizer', 'EUDR'] },

  // SECTOR 8: GOVTECH & CIVIC (7 distinct tastes)
  'ID-060': { shell: 'floating-topbar-cards', theme: 'agro-forest', font: 'humanist-friendly', widget: 'bar-regional', persona: 'Pengurus RT 004 · Melati', nav: ['Kas RT', 'Warga 118', 'Surat', 'UMKM'] },
  'ID-061': { shell: 'top-nav-editorial', theme: 'civic-crimson', font: 'editorial-serif', widget: 'milestone-vault', persona: 'Warga IKD · INA Digital', nav: ['Layanan', 'Izin UU PDP', 'Kredensial', 'Audit Log'] },
  'ID-062': { shell: 'bento-executive', theme: 'paper-editorial', font: 'editorial-serif', widget: 'bar-regional', persona: 'BPD Pengawas · Desa Sukamaju', nav: ['APBDes', 'Proyek', 'BLT Desa', 'Aspirasi'] },
  'ID-063': { shell: 'dark-command-hud', theme: 'cyber-noir', font: 'technical-mono', widget: 'ciliwung-profile', persona: 'BPBD Command · DKI Jakarta', nav: ['Ciliwung', 'Pompa SDA', 'Surge ETA', 'Alert RT'] },
  'ID-064': { shell: 'top-nav-editorial', theme: 'blueprint-cobalt', font: 'swiss-geometric', widget: 'milestone-vault', persona: 'Perizinan · PT Bumi Pangan', nav: ['KBLI 2020', 'RDTR', 'PB-UMKU', 'LKPM Q4'] },
  'ID-065': { shell: 'icon-rail-narrow', theme: 'civic-crimson', font: 'humanist-friendly', widget: 'branch-heatmap', persona: 'Smart City · Pemkot Bandung', nav: ['Triage', 'Dedup', 'Dinas Crew', 'SLA'] },
  'ID-066': { shell: 'mac-window-studio', theme: 'civic-crimson', font: 'industrial-condensed', widget: 'radial-gauge', persona: 'Gate Officer · Lobby Kiosk', nav: ['e-KTP Scan', 'RFID Pass', 'Wallet Cap', 'Audit'] },

  // SECTOR 9: DEVTOOLS & MIDDLEWARE (8 distinct tastes)
  'ID-067': { shell: 'mac-window-studio', theme: 'nord-dev', font: 'technical-mono', widget: 'code-diff', persona: 'Integration Arch · YARP', nav: ['OCBC SOAP', 'Core WCF', 'SAP BAPI', 'Canary'] },
  'ID-068': { shell: 'dark-command-hud', theme: 'bloomberg-obsidian', font: 'technical-mono', widget: 'code-diff', persona: 'DBA Gate · SQL 48M Rows', nav: ['Lock Lint', 'Indexes', 'UU PDP', 'Drift'] },
  'ID-069': { shell: 'mac-window-studio', theme: 'clinical-mint', font: 'technical-mono', widget: 'code-diff', persona: 'SIMRS Eng · Firely FHIR', nav: ['Encounter', 'Condition', 'KFA Drug', 'DTO Gen'] },
  'ID-070': { shell: 'dark-command-hud', theme: 'sovereign-indigo', font: 'technical-mono', widget: 'medallion-dag', persona: 'SRE Bus · Prod RabbitMQ', nav: ['DLQ 142', 'Outbox', 'Replay 20/s', 'Audit'] },
  'ID-071': { shell: 'mac-window-studio', theme: 'blueprint-cobalt', font: 'technical-mono', widget: 'rtl-maui-preview', persona: 'MAUI 9 Eng · BiDi Studio', nav: ['JSON Schema', 'RTL Arabic', 'DTO Map', 'OTA'] },
  'ID-072': { shell: 'icon-rail-narrow', theme: 'nord-dev', font: 'technical-mono', widget: 'radar-spider', persona: 'Platform Eng · 34 Feeds', nav: ['NuGet v3', 'CVE Block', 'SBOM', 'Lagging'] },
  'ID-073': { shell: 'floating-topbar-cards', theme: 'swiss-mono', font: 'technical-mono', widget: 'latency-dual', persona: 'API Ops · 84.2k Events', nav: ['Midtrans', 'Xendit VA', '3PL Hooks', 'Replay'] },
  'ID-074': { shell: 'dark-command-hud', theme: 'cyber-noir', font: 'technical-mono', widget: 'latency-dual', persona: 'SRE Stress · 12.12 25k VU', nav: ['Spike 00:00', 'P99 SQL', 'Pool Cap', 'Go/No-Go'] },

  // SECTOR 10: CLOUD, DEVOPS & SECOPS (7 distinct tastes)
  'ID-075': { shell: 'top-nav-editorial', theme: 'sovereign-indigo', font: 'swiss-geometric', widget: 'radar-spider', persona: 'DPO Desk · UU PDP 27/2022', nav: ['PII Scan', 'DSAR 3x24h', 'RoPA', 'Breach'] },
  'ID-076': { shell: 'bento-executive', theme: 'blueprint-cobalt', font: 'swiss-geometric', widget: 'bar-regional', persona: 'Cloud FinOps · Jakarta IDR', nav: ['Multi-Cloud', 'Night Off', 'SQL Tier', 'GPU Pool'] },
  'ID-077': { shell: 'mac-window-studio', theme: 'industrial-steel', font: 'technical-mono', widget: 'medallion-dag', persona: 'DevSecOps · Harbor OCI', nav: ['Cosign', 'Trivy 0', 'Air-Gap', 'Readback'] },
  'ID-078': { shell: 'dark-command-hud', theme: 'cyber-noir', font: 'technical-mono', widget: 'mule-network', persona: 'SOC Analyst · 184 Wazuh', nav: ['P1 Active', 'MITRE', 'Contain', 'BSSN'] },
  'ID-079': { shell: 'dark-command-hud', theme: 'nord-dev', font: 'industrial-condensed', widget: 'dcim-racks', persona: 'NOC DCIM · Hall B Cikarang', nav: ['PUE 1.38', 'GPU Racks', 'UPS A/B', 'Genset'] },
  'ID-080': { shell: 'mac-window-studio', theme: 'bloomberg-obsidian', font: 'technical-mono', widget: 'code-diff', persona: 'PAM Admin · 0 Standing Keys', nav: ['Active JIT', 'SQL Guard', 'Kill Switch', 'ISO 27001'] },
  'ID-081': { shell: 'floating-topbar-cards', theme: 'studio-daylight', font: 'swiss-geometric', widget: 'milestone-vault', persona: 'Release Mgr · Train 26.11', nav: ['Train Gates', 'TestFlight', 'Play 20%', 'Certs'] },

  // SECTOR 11: DATA PLATFORMS & BI (6 distinct tastes)
  'ID-082': { shell: 'icon-rail-narrow', theme: 'studio-daylight', font: 'technical-mono', widget: 'medallion-dag', persona: 'Data Lead · 48 dbt Models', nav: ['Lineage', '07:00 SLA', 'DuckDB', 'Contracts'] },
  'ID-083': { shell: 'bento-executive', theme: 'agro-forest', font: 'swiss-geometric', widget: 'branch-heatmap', persona: 'Sales Dir · 38 Provinces', nav: ['Sell-Out', 'EC 74%', 'DOH Map', 'Promo ROI'] },
  'ID-084': { shell: 'mobile-asymmetric', theme: 'blueprint-cobalt', font: 'humanist-friendly', widget: 'map-java', persona: 'Enumerator · Audit Jateng', nav: ['Survei', 'Sync (4)', 'Kuota'] },
  'ID-085': { shell: 'floating-topbar-cards', theme: 'retail-coral', font: 'editorial-serif', widget: 'latency-dual', persona: 'Brand PR · IndoBERT v3', nav: ['Crisis Alert', 'Sarcasm', 'Bot Filter', 'Digest'] },
  'ID-086': { shell: 'mac-window-studio', theme: 'nord-dev', font: 'technical-mono', widget: 'code-diff', persona: 'Data Eng · 32 Contracts', nav: ['YAML Rules', 'Rp Parity', 'WIB Check', 'Breaker'] },
  'ID-087': { shell: 'split-sidebar-brand', theme: 'agro-forest', font: 'swiss-geometric', widget: 'branch-heatmap', persona: 'Regional Dir · 24 Cabang', nav: ['Leaderboard', '4 Pillars', 'Coaching', 'Bonus'] },

  // SECTOR 12: CLIMATE, EV & CARBON (6 distinct tastes)
  'ID-088': { shell: 'dark-command-hud', theme: 'nord-dev', font: 'industrial-condensed', widget: 'ev-battery-slots', persona: 'Swap NOC · 148 Cabinets', nav: ['12-Bay SoC', 'BMS Lock', 'Ojol Rush', 'CO2e'] },
  'ID-089': { shell: 'top-nav-editorial', theme: 'agro-forest', font: 'editorial-serif', widget: 'bar-regional', persona: 'ESG Officer · IDX Tbk', nav: ['Scope 1-2-3', 'ESDM Grid', 'IDXCarbon', 'CBAM'] },
  'ID-090': { shell: 'dark-command-hud', theme: 'mining-ochre', font: 'industrial-condensed', widget: 'solar-strings', persona: 'Solar EPC · 1.8 MWp Roof', nav: ['16 Strings', 'Soiling PR', 'Zero-Exp', 'PPA Bill'] },
  'ID-091': { shell: 'mobile-asymmetric', theme: 'agro-forest', font: 'humanist-friendly', widget: 'radial-gauge', persona: 'Bank Sampah Induk · Bekasi', nav: ['Timbang BLE', 'Saldo', 'EPR P.75'] },
  'ID-092': { shell: 'split-sidebar-brand', theme: 'clinical-mint', font: 'editorial-serif', widget: 'map-mangrove', persona: 'MRV Lead · Delta Mahakam', nav: ['Drone Plots', '12m Live', 'Soil C', 'Village Pay'] },
  'ID-093': { shell: 'bento-executive', theme: 'blueprint-cobalt', font: 'industrial-condensed', widget: 'latency-dual', persona: 'Depot Cawang · 36 EV Bus', nav: ['OCPP 2.0.1', 'LWBP Night', '05:00 Pull', 'Bay Fault'] },

  // SECTOR 13: AGRITECH & FOOD SECURITY (5 distinct tastes)
  'ID-094': { shell: 'floating-topbar-cards', theme: 'agro-forest', font: 'humanist-friendly', widget: 'oee-rings', persona: 'SPPG Cibinong · 3,200 Box', nav: ['Menu Macro', 'BUMDes', 'HACCP QA', '14 Sekolah'] },
  'ID-095': { shell: 'dark-command-hud', theme: 'cyber-noir', font: 'industrial-condensed', widget: 'shrimp-ponds', persona: 'Tambak Mgr · Lampung DOC68', nav: ['12 Ponds', 'DO/pH', 'Auto-Kincir', 'FCR 1.28'] },
  'ID-096': { shell: 'top-nav-editorial', theme: 'coffee-roast', font: 'editorial-serif', widget: 'radar-spider', persona: 'Koperasi Gayo · 1,650m', nav: ['Lot #041', '64 Farms', 'SCA 86.75', 'EUDR DDS'] },
  'ID-097': { shell: 'split-sidebar-brand', theme: 'maritime-navy', font: 'industrial-condensed', widget: 'bar-regional', persona: 'TPI Bitung · Lelang Pagi', nav: ['Tuna Grade A', 'Pelagic', 'Es Balok', 'KKP SHTI'] },
  'ID-098': { shell: 'top-nav-editorial', theme: 'agro-forest', font: 'humanist-friendly', widget: 'milestone-vault', persona: 'Kios Tani · Karawang', nav: ['NIK e-RDKK', 'Kunci HET', 'Stok Kios', 'Anti-Leak'] },

  // SECTOR 14: SHARIA, EDTECH & HOSPITALITY (5 distinct tastes)
  'ID-099': { shell: 'icon-rail-narrow', theme: 'sharia-sand', font: 'editorial-serif', widget: 'radar-spider', persona: 'Penyelia Halal · 42 SKUs', nav: ['SJPH 5', '118 Bahan', 'Expiry', 'SIHALAL'] },
  'ID-100': { shell: 'split-sidebar-brand', theme: 'sharia-sand', font: 'editorial-serif', widget: 'milestone-vault', persona: 'Ust. Fadhil · Kloter #14', nav: ['45 Jamaah', 'Visa Nusuk', 'Rooming', 'SAR Margin'] },
  'ID-101': { shell: 'mobile-asymmetric', theme: 'sharia-sand', font: 'humanist-friendly', widget: 'radial-gauge', persona: 'Wali Santri · Kelas 8B', nav: ['Kartu RFID', 'SPP VA', 'Tahfidz'] },
  'ID-102': { shell: 'floating-topbar-cards', theme: 'blueprint-cobalt', font: 'swiss-geometric', widget: 'oee-rings', persona: 'Mentor Cohort · Batch #14', nav: ['Sprint 6', 'Rubrics', 'Git PRs', 'Hiring'] },
  'ID-103': { shell: 'top-nav-editorial', theme: 'bali-linen', font: 'editorial-serif', widget: 'branch-heatmap', persona: 'Cluster Mgr · 18 Villas Bali', nav: ['Tape Chart', '4 OTAs', 'Housekeep', 'Owner P&L'] },

  // SECTOR 15: CREATOR, COMM & EMERGING (5 distinct tastes)
  'ID-104': { shell: 'bento-executive', theme: 'retail-coral', font: 'swiss-geometric', widget: 'latency-dual', persona: 'Campaign Dir · 28 KOL', nav: ['Escrow', 'Draft QA', '2.48M View', 'PPh 21'] },
  'ID-105': { shell: 'mac-window-studio', theme: 'clinical-mint', font: 'swiss-geometric', widget: 'medallion-dag', persona: 'Meta Cloud · Official API', nav: ['Flow DAG', 'Templates', 'QRIS Pay', 'Opt-Out'] },
  'ID-106': { shell: 'icon-rail-narrow', theme: 'coffee-roast', font: 'industrial-condensed', widget: 'bengkel-bays', persona: 'Service Adv · 8 Lift Bays', nav: ['8 Bays', 'PKB Jasa', 'Parts', 'WA Quote'] },
  'ID-107': { shell: 'top-nav-editorial', theme: 'sharia-sand', font: 'editorial-serif', widget: 'radial-gauge', persona: 'Nazhir Audit · PSAK 112', nav: ['Pokok Wakaf', 'Produktif', '8 Asnaf', 'BSZ Pajak'] },
  'ID-108': { shell: 'mac-window-studio', theme: 'paper-editorial', font: 'editorial-serif', widget: 'bilingual-redline', persona: 'PPAT Notaris · Tangsel', nav: ['Deal Room', 'BPN e-Cert', 'BPHTB', 'AJB Draft'] },
};
