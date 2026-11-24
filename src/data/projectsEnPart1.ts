import type { ProjectTranslationMap } from './projectTranslationTypes';

export const PROJECTS_EN_PART_1: ProjectTranslationMap = {
  'ID-001': {
    tagline: 'Enterprise multi-provider LLM inference gateway & token governance',
    audience: 'Indonesian conglomerates, banks, and multi-subsidiary enterprises',
    summary:
      'Unified .NET inference broker combining OpenAI, Anthropic, Gemini, and local Jakarta vLLM endpoints under one divisional quota control, PII redaction, and failover plane.',
    problem:
      'Individual divisions subscribe to AI APIs separately without cost attribution, consistent rate limits, or safeguards against employee data leaking abroad.',
    indonesiaContext:
      'Enforces NIK, NPWP, and bank account redaction aligned with UU PDP before outbound requests leave, while translating between OpenAI Responses and Anthropic Messages protocols.',
    features: [
      'Deterministic cross-provider failover weighted by latency and remaining pool quota',
      'Pipeline masking NIK, NPWP, and sensitive fields prior to external model egress',
      'Business-unit token quotas with Rupiah cost chargeback reporting',
      'Centralized audit logs storing prompt hashes without retaining raw PII',
    ],
  },
  'ID-002': {
    tagline: 'Indonesian regulation & UU PDP contract review workbench',
    audience: 'Corporate legal teams, law firms, and BUMN compliance officers',
    summary:
      'Clause-by-clause commercial contract auditor grounded in KUHPerdata, UU Cipta Kerja, UU PDP No. 27/2022, and POJK regulations with verified statutory citations.',
    problem:
      'Legal teams spend days checking vendor contracts against evolving Indonesian regulations and semantic discrepancies across bilingual ID/EN clauses.',
    indonesiaContext:
      'Detects prevailing language requirements under UU No. 24/2009 alongside UU PDP Data Processing Agreement (DPA) completeness.',
    features: [
      'Bilingual EN-ID clause discrepancy detector with side-by-side redline view',
      'Verified citation links directly to articles in UU, PP, POJK, and Permenkominfo',
      'DPA completeness checklist and UU PDP 3x24-hour breach notification deadline check',
      'Legal risk memo export ready for partner or board sign-off',
    ],
  },
  'ID-003': {
    tagline: 'AI call center quality auditor for Indonesian & regional dialects',
    audience: 'Banks, telecom operators, e-commerce BPOs, and insurance contact centers',
    summary:
      'Automated post-call transcription and compliance scoring trained on conversational Indonesian, Javanese/Sundanese dialects, and English code-switching.',
    problem:
      'QA supervisors manually sample under 2% of phone recordings, causing OJK script violations and customer complaints to go unnoticed.',
    indonesiaContext:
      'Understands local banking terminology (BI-FAST, credit cards, installments, insurance policies), conversational particles, and mandatory OJK verbal disclaimers.',
    features: [
      '100% call audit coverage with diarized Indonesian ASR and sentiment curves',
      'Automated scoring of OJK verbal disclaimers and customer identity verification steps',
      'Supervisor coaching queue surfacing escalation-risk calls within 5 minutes',
      'Automated audio bleeping to mask CVV, OTP, and mother\'s maiden name',
    ],
  },
  'ID-004': {
    tagline: 'Multi-agent orchestrator for code migration & legacy .NET upgrades',
    audience: 'Engineering leads modernizing legacy .NET Framework, Java, or PHP systems',
    summary:
      'Per-git-worktree isolated agent swarm harness executing legacy migrations (.NET Framework 4.8 to .NET 9) behind mandatory build, test, and diff gates.',
    problem:
      'Ungoverned coding agents frequently pollute shared branches, claim tests pass without proof, and break multi-repo enterprise workspaces.',
    indonesiaContext:
      'Built for Indonesian bank and corporate IT teams maintaining hundreds of WCF, WebForms, and SQL applications inside private Gitea or Azure DevOps repositories.',
    features: [
      'Strict one-git-worktree isolation per agent without cross-branch file contamination',
      'Mandatory compiler zero-warning, xUnit regression, and static analyzer gates',
      'Deterministic audit transcripts per migration PR for Tech Lead review',
      'Supports on-prem Gitea, private Azure DevOps, and local vLLM models',
    ],
  },
  'ID-005': {
    tagline: 'Clinical consultation dictation assistant for SOAP notes & ICD-10 codes',
    audience: 'Outpatient clinic physicians, hospital specialists, and medical record coders',
    summary:
      'Listens to doctor-patient consultations in Indonesian, drafts structured SOAP notes, suggests ICD-10 and INA-CBGs codes, and maps records to SATUSEHAT FHIR.',
    problem:
      'Outpatient doctors see 40-70 BPJS patients per shift and spend overtime hours typing EMR entries and performing manual medical coding.',
    indonesiaContext:
      'Trained on Indonesian clinical abbreviations (OS, KU, TD, RPD, chief complaints) and aligned with Kemenkes SATUSEHAT Condition, Observation, and MedicationRequest schemas.',
    features: [
      'Real-time Indonesian medical transcription directly structured into S-O-A-P notes',
      'ICD-10 diagnosis and ICD-9-CM procedure code suggestions with clinical rationale',
      'One-click physician approval to dispatch FHIR Bundles to hospital SIMRS',
      'Zero audio retention once notes are signed to protect patient privacy',
    ],
  },
  'ID-006': {
    tagline: '24/7 Indonesian LLM security firewall & agentic red-team suite',
    audience: 'CISOs, fintech security teams, and enterprise AI platform owners',
    summary:
      'Runtime guardrail proxy and automated red-teaming probing chatbots and AI agents against Indonesian jailbreaks, data exfiltration, and tool-call abuse.',
    problem:
      'English-centric safety filters routinely miss Indonesian slang, Javanese/Sundanese obfuscation, and indirect prompt injections hidden inside PDFs.',
    indonesiaContext:
      'Maintains a continuously updated Indonesian adversarial attack corpus covering banking social engineering, NIK KTP extraction, and unauthorized refund escalation.',
    features: [
      'Scheduled red-team probing in conversational Indonesian and regional dialects',
      'Inline tool-call firewall blocking unauthorized SQL or HTTP execution',
      'Indirect prompt-injection scanner across RAG documents and email attachments',
      'Incident triage queue complete with reproducible attack transcripts',
    ],
  },
  'ID-007': {
    tagline: 'CoreTax DJP regulatory advisory agent for PPh & PPN classification',
    audience: 'Tax managers, Tax Consulting Firms (KKP), and CFO finance teams',
    summary:
      'PMK-cited tax research and transaction classification agent mapping vendor invoices to PPh 21/23/4(2) withholding objects, PPN DPP Nilai Lain, and CoreTax XML codes.',
    problem:
      'The 2025-2026 CoreTax DJP transition and shifting PMK rules frequently cause withholding misclassification and correction penalties during SPT Masa filing.',
    indonesiaContext:
      'Indexes UU HPP, PMK PPh 21 TER, and CoreTax object codes so finance teams verify withholding rates before posting journal entries.',
    features: [
      'Deterministic tax object code calculator backed by PMK article citations',
      'Automated vendor invoice classifier distinguishing PPh 23 services vs PPh 4(2) rentals',
      'Cross-border PPh 26 and Form DGT tax treaty utilization simulator',
      'Tax position workpaper export ready for external auditor review',
    ],
  },
  'ID-008': {
    tagline: 'On-premise edge CCTV inference for K3 PPE safety & factory defects',
    audience: 'Manufacturing plants, logistics warehouses, and smelter K3 safety teams',
    summary:
      'On-premise computer vision console turning RTSP CCTV feeds into PPE helmet/vest detectors, forklift proximity alerts, and conveyor packaging inspection.',
    problem:
      'Industrial sites operate hundreds of passive CCTV cameras that are only reviewed after workplace accidents or customer quality complaints.',
    indonesiaContext:
      'Runs fully on local GPU boxes inside Cikarang, Karawang, or Morowali industrial estates without cloud bandwidth reliance while keeping internal plant footage private.',
    features: [
      'Real-time RTSP stream inference for helmet, safety vest, and restricted-zone compliance',
      'Automated counter for skewed labels and carton seal defects on conveyor lines',
      'Instant PLC siren, WhatsApp, and Telegram alerts for shift supervisors',
      'Per-shift K3 compliance scorecard accompanied by anonymized snapshot clips',
    ],
  },
  'ID-009': {
    tagline: 'BPOM/Halal compliance linter, copywriting & UMKM marketplace SKU margins',
    audience: 'Local D2C brands, distributors, and marketplace enabler agencies',
    summary:
      'Prepares SKU listings simultaneously for Tokopedia, TikTok Shop, and Shopee, checking BPOM/Halal claims, SEO keywords, and net margin thresholds.',
    problem:
      'Local products often face automated takedowns over prohibited health claims, incomplete distribution permit attributes, or margins eroded by marketplace admin fees.',
    indonesiaContext:
      'Includes validators for BPOM NIE numbers, BPJPH Halal certificates, and TikTok Shop live-commerce restricted keyword lists.',
    features: [
      'Bulk title and description optimization tailored to Indonesian buyer search patterns',
      'Mandatory BPOM, SNI, and Halal attribute validator prior to channel publishing',
      'Per-SKU net margin calculator factoring admin fees, shipping, and promo subsidies',
      'One-click catalog export to Tokopedia, Shopee, and TikTok Shop feeds',
    ],
  },
  'ID-010': {
    tagline: 'Plantation yield forecasting using Sentinel NDVI, BMKG & EUDR polygons',
    audience: 'Palm oil and coffee estates, plasma cooperatives, and agri-financiers',
    summary:
      'Combines Sentinel-2 vegetation imagery, BMKG rainfall forecasts, and field agronomy logs to predict per-block harvest tonnage across Sumatra and Kalimantan.',
    problem:
      'Processing mills struggle with daily FFB arrival swings and delayed detection of drought-stressed blocks across tens of thousands of hectares.',
    indonesiaContext:
      'Integrates BMKG weather feeds and HGU/SHM polygon boundaries for mill capacity planning alongside EUDR deforestation-free verification.',
    features: [
      'Per-block NDVI canopy health heatmap with early anomaly alerts',
      '30-day harvest tonnage forecast linked directly to mill processing capacity',
      'Offline agronomist inspection pins with photos of pest or leaf disease symptoms',
      'Post-2020 deforestation-free polygon verification for European export buyers',
    ],
  },
  'ID-011': {
    tagline: 'NFC QRIS Tap commuter wallet & ASEAN cross-border QR payments',
    audience: 'Greater Jakarta commuters, retail merchants, and ASEAN business travelers',
    summary:
      'Sub-second NFC QRIS Tap commuter wallet for KRL, MRT Jakarta, and TransJakarta gates alongside cross-border QR payments across Thailand, Malaysia, and Singapore.',
    problem:
      'Commuters still juggle multiple physical e-money cards with manual top-ups while camera-based QR scanning slows down rush-hour transit gates.',
    indonesiaContext:
      'Built to Bank Indonesia QRIS Tap NFC standards and Cross-Border QR links with transparent IDR exchange rates shown before PIN confirmation.',
    features: [
      'Sub-300ms NFC HCE transit gate checkout without opening the camera',
      'Instant BI-FAST auto-top-up when balance drops below commuter thresholds',
      'Cross-border QR scanner showing live IDR-to-MYR/THB/SGD conversion',
      'Exportable monthly travel receipt summary for corporate transport claims',
    ],
  },
  'ID-012': {
    tagline: 'Multi-bank SNAP BI corporate treasury hub, VA recon & BI-FAST payouts',
    audience: 'Corporate treasury teams, multi-PT holding groups, and Indonesian CFOs',
    summary:
      'Unifies BCA, Mandiri, BNI, BRI, and OCBC corporate accounts via SNAP BI for real-time cash visibility, automated VA reconciliation, and maker-checker BI-FAST payouts.',
    problem:
      'Finance teams log into five separate bank hardware tokens daily, download CSV statements manually, and match thousands of VA payments in Excel.',
    indonesiaContext:
      'Implements SNAP BI asymmetric signatures, OCBC-style host-to-host encrypted file relays, and bulk vendor disbursement over BI-FAST.',
    features: [
      'Real-time consolidated IDR and USD cash position across 5+ Indonesian corporate banks',
      'Automated Virtual Account statement matching directly against ERP AR receivables',
      'Multi-tier Maker-Checker-Releaser approval for BI-FAST disbursement batches',
      'Cryptographic host-to-host file encryption fallback for legacy banking channels',
    ],
  },
  'ID-013': {
    tagline: 'Wakalah Sharia milestone escrow for B2B & property contracts',
    audience: 'Property developers, construction contractors, and Sharia commodity traders',
    summary:
      'Sharia-compliant joint escrow platform (Wakalah/Wadiah) releasing milestone funds only after BAST progress proof or notarial deeds are co-signed by both parties.',
    problem:
      'High-value construction and commodity deals stall due to payment defaults or abandoned work when no neutral milestone custodian exists.',
    indonesiaContext:
      'Structured around DSN-MUI Wakalah fatwas using segregated Sharia bank escrow accounts free of riba interest.',
    features: [
      'Staged fund disbursement tied to field photo verification and signed BAST records',
      'Segregated Sharia bank Virtual Accounts with transparent audit mutations',
      'Dispute freeze workflow with an independent mediator evidence room',
      'Automatic separation of Final PPh construction withholding into tax sub-accounts',
    ],
  },
  'ID-014': {
    tagline: 'Modular core banking & OJK SLIK/APOLO reporting for BPR/BPRS',
    audience: '1,400+ regional BPR and BPRS institutions modernizing legacy desktop systems',
    summary:
      'High-density teller suite, loan origination, general ledger, and automated OJK APOLO/SLIK reporting for multi-branch BPR operations.',
    problem:
      'Many regional BPRs still run 20-year-old desktop software that complicates monthly SLIK submissions, QRIS connectivity, and branch consolidation.',
    indonesiaContext:
      'Generates upload-ready official OJK SLIK and APOLO reporting files, computes Collectibility 1-5 and PPAP reserves automatically, and stays resilient over unstable branch links.',
    features: [
      'Keyboard-first teller interface for savings, time deposits, and loan servicing',
      'Automated Collectibility 1-5 aging, NPL ratio, and PPAP provisioning engine',
      'One-click OJK SLIK and APOLO report package validator and generator',
      'End-of-Day (EOD) accrual batch posting immutable double-entry GL journals',
    ],
  },
  'ID-015': {
    tagline: 'Real-time payment fraud radar, mule accounts & velocity anomalies',
    audience: 'Payment gateways, e-wallets, and digital banks under BI TIKMI supervision',
    summary:
      'Sub-50ms transaction risk scoring engine detecting fake QRIS sticker swaps, mule account syndicates, and device emulator farms.',
    problem:
      'Instant BI-FAST and QRIS settlement leaves less than a second to intercept fraud rings and money-laundering flows.',
    indonesiaContext:
      'Aligned with BI TIKMI risk management assessments and PPATK STR/CTR suspicious transaction reporting workflows.',
    features: [
      'Sub-50ms velocity, device graph, and impossible-travel location scoring',
      'Network graph analysis exposing fan-in and fan-out mule account clusters',
      'One-click merchant settlement hold with full PPATK case dossier export',
      'Shadow-mode rule backtesting against 30 days of historical transactions',
    ],
  },
  'ID-016': {
    tagline: 'Sharia gold savings app for Hajj quota deposits & Umrah departures',
    audience: 'Indonesian Muslim families planning long-term Hajj and Umrah journeys',
    summary:
      'Combines fractional physical gold accumulation with a Hajj initial deposit readiness tracker (Rp 25 million) and licensed Umrah PPIU package locking.',
    problem:
      'Long Hajj waitlists and Rupiah inflation erode conventional cash savings for families saving 3 to 10 years ahead.',
    indonesiaContext:
      'Tracks the Hajj quota deposit threshold in Antam/UBS gold gram equivalents with transparent spreads and links to Kemenag-licensed PPIU travel operators.',
    features: [
      'Fractional gram gold savings with transparent daily buy and buyback pricing',
      'Target calculator for Hajj quota (Rp 25M) and Umrah packages measured in grams',
      'Monthly auto-debit via Virtual Account or QRIS with zero hidden fees',
      'Direct redemption toward BPS-BPIH Hajj registration, Umrah packages, or physical minting',
    ],
  },
  'ID-017': {
    tagline: 'Bank Indonesia SNAP API sandbox & ISO-20022 signature debugger',
    audience: 'Fintech backend engineers, bank integration teams, and payment architects',
    summary:
      'Developer workbench to construct, validate, and replay SNAP BI RSA-SHA256 and HMAC-SHA512 signatures along with Virtual Account and BI-FAST payloads.',
    problem:
      'Integrating SNAP BI across BCA, Mandiri, BNI, and BRI often burns weeks on header casing quirks, SHA-256 minification edge cases, and bank-specific error codes.',
    indonesiaContext:
      'Includes official ASPI SNAP BI v1/v2 service codes (73, 24, 17, 18) plus simulators replicating partner-bank behavioral quirks.',
    features: [
      'Step-by-step RSA-SHA256 and HMAC-SHA512 signature construction inspector',
      'Mock bank responder simulating timeouts, duplicate X-EXTERNAL-IDs, and 4017300 errors',
      'C# (.NET), Go, and TypeScript client code generators with exact signing headers',
      'Automated test suite exporting ASPI SNAP BI certification evidence packs',
    ],
  },
  'ID-018': {
    tagline: 'Earned Wage Access (EWA) linked directly to HRIS attendance logs',
    audience: 'Factory workers, retail staff, and enterprise HR departments',
    summary:
      'Lets employees withdraw accrued mid-month wages via BI-FAST for a flat admin fee, shielding workers from predatory illegal online lenders.',
    problem:
      'Urgent mid-month cash needs often push factory workers toward predatory high-interest loans, hurting productivity and driving staff turnover.',
    indonesiaContext:
      'Zero-interest model wired directly to company attendance/HRIS terminals so payroll deductions settle automatically on payday without straining company cashflow.',
    features: [
      'Daily accrued wage balance synchronized directly from HRIS attendance logs',
      'Configurable company safety caps (e.g. max 30% accrued wages, flat fee)',
      'Instant BI-FAST disbursement straight to the employee payroll bank account',
      'Automated payroll deduction file delivered to HRIS before monthly cut-off',
    ],
  },
  'ID-019': {
    tagline: 'UMKM credit underwriting powered by QRIS, POS & e-Faktur cashflows',
    audience: 'Regional development banks (BPD), multifinance firms, and licensed productive P2P lenders',
    summary:
      'Combines QRIS settlement history, e-Faktur revenue, and marketplace payouts with OJK SLIK checks to underwrite UMKM working capital limits.',
    problem:
      'Productive UMKMs rarely have audited financial statements or property collateral, stretching conventional credit surveys over several weeks.',
    indonesiaContext:
      'Uses consented cashflow signals (QRIS, POS, CoreTax XML) paired with OJK SLIK debt-service ratios under UU PDP consent controls.',
    features: [
      'Cashflow stability analysis across consented QRIS, POS, and e-Faktur records',
      'Automated DSCR and existing credit facility reconciliation from OJK SLIK',
      'Explainable credit memos detailing positive and negative score drivers',
      'Portfolio early-warning alerts when borrower daily revenue drops sharply',
    ],
  },
  'ID-020': {
    tagline: 'Low-cost cross-border remittance switch for PMI workers into BI-FAST',
    audience: 'Remittance operators serving Indonesian migrant workers (PMI) in SG, MY, HK, TW, and JP',
    summary:
      'Real-time cross-border corridor switch connecting overseas payout partners straight into Indonesia\'s BI-FAST rails with instant AML screening and transparent FX spreads.',
    problem:
      'Migrant workers lose 3-6% of their earnings to hidden exchange-rate markups and sluggish correspondent-bank clearing windows.',
    indonesiaContext:
      'Designed around BI-FAST and BIS Nexus principles, instant beneficiary account-name lookup, and automated PPATK IFTI reporting.',
    features: [
      'Real-time corridor FX quoting across SGD, MYR, HKD, TWD, and JPY into IDR',
      'Instant beneficiary account-name verification before sender funds are debited',
      'Automated OFAC/PPATK sanctions screening and structuring pattern detection',
      'Partner pre-funding balance alerts with an instant reconciliation ledger',
    ],
  },
  'ID-021': {
    tagline: 'Stock, order & payout recon hub for Tokopedia, TikTok Shop, Shopee & Lazada',
    audience: 'Indonesian omnichannel brands, distributors, and high-volume sellers',
    summary:
      'Sub-second master inventory reservation, courier-grouped bulk AWB printing, and payout escrow auditing across major Indonesian marketplaces and brand webstores.',
    problem:
      'During TikTok Shop flash sales, physical stock oversells before Tokopedia and Shopee update quantities, triggering seller penalty points.',
    indonesiaContext:
      'Supports Tokopedia-TikTok Shop Seller Center flows, JNE/J&T/SiCepat/Instant thermal labels, and audits admin fee and voucher subsidy deductions.',
    features: [
      'Sub-second atomic stock reservation with per-channel safety buffers',
      'Bulk wave-picking and thermal AWB printing grouped by courier cut-off times',
      'Automated detector for marketplace escrow payout shortfalls against order value',
      'Multi-warehouse routing (Jabodetabek, Surabaya, Medan) to cut shipping costs',
    ],
  },
  'ID-022': {
    tagline: 'Offline-first multi-outlet F&B POS, kitchen display & COGS recipe deduction',
    audience: 'Coffee shop chains, cloud kitchens, and multi-outlet Indonesian cafes',
    summary:
      'Local SQLite offline-first touchscreen POS with instant dynamic QRIS, separate barista/kitchen displays, and automated Bill-of-Materials (BOM) ingredient deduction down to the gram.',
    problem:
      'Cafe cashiers stall when mall internet drops, while generic POS apps fail to reconcile GoFood/GrabFood promos with actual coffee bean and milk usage.',
    indonesiaContext:
      'Supports 10% PB1 restaurant tax, service charges, per-receipt dynamic QRIS, ESC/POS thermal printers, and employee meal subsidy vouchers.',
    features: [
      '100% offline-capable cashier terminal with automatic cloud sync on reconnect',
      'Customer-facing dynamic QRIS display with instant settlement confirmation',
      'Per-modifier BOM recipe deduction (grams of beans, ml of oat milk, cups)',
      'Split routing to Barista and Kitchen Display screens with live SLA timers',
    ],
  },
  'ID-023': {
    tagline: 'Direct B2B construction material & building supply procurement marketplace',
    audience: 'Civil contractors, building supply stores, and cement/rebar/GRC principals',
    summary:
      'B2B procurement portal connecting contractors directly with rebar, cement, and GRC board principals featuring volume pricing, TOP credit terms, and truckload optimization.',
    problem:
      'Project contractors deal with multi-layered middlemen, sudden rebar price swings, and uncoordinated material deliveries that halt site work.',
    indonesiaContext:
      'Built around Indonesian project workflows: Surat Jalan (SJ), PPN tax invoices, 30/45-day TOP credit terms, and Tronton/Colt Diesel payload calculators.',
    features: [
      'Tiered pricing by order volume and delivery zone truck payload capacity',
      'Instant RFQ negotiation directly with principal or authorized distributor sales teams',
      '30-day TOP credit limit management with Giro and VA due-date tracking',
      'Digital Surat Jalan and real-time site foreman photo proof of delivery',
    ],
  },
  'ID-024': {
    tagline: 'Warung grocery restock app & sub-distributor sales route manager',
    audience: 'General-trade warung owners and regional FMCG sub-distributors',
    summary:
      'Lightweight Android app enabling warung owners to scan shelves for restocking, browse distributor promo bundles, and use 7-day payment terms upon next delivery.',
    problem:
      'Traditional warungs wait passively for weekly sales reps, leaving fast-moving staples out of stock and missing principal promo discounts.',
    indonesiaContext:
      'Engineered for entry-level Android phones on patchy 4G with carton/dus/renceng unit conversions and COD or QRIS settlement.',
    features: [
      'Multi-unit pricing (carton, dus, renceng, pcs) matching local warung habits',
      'Shelf barcode scanning to reorder low-stock items in under 60 seconds',
      'Next-day delivery slots aligned with distributor milk-run truck routes',
      'Transparent tracking of trade promo rebates and 7-day invoice due dates',
    ],
  },
  'ID-025': {
    tagline: 'Live-commerce host cue console, flash stock & real-time GMV attribution',
    audience: 'TikTok Shop & Shopee Live studio operators, MCNs, and consumer brands',
    summary:
      'Real-time producer console tracking viewer retention, pinned showcase conversion, per-shift host GMV, and ad spend efficiency during 12-hour live marathons.',
    problem:
      'Live hosts often talk blind without knowing which pinned product converts best, which sizes are nearly sold out, or when ad ROAS burns margin.',
    indonesiaContext:
      'Tailored for Indonesia\'s TikTok Shop and Shopee Live ecosystem, tracking hourly host GMV, COD cancellation rates, and affiliate commission splits.',
    features: [
      'Real-time showcase conversion velocity with low-size alerts pushed to hosts',
      'Host shift leaderboard comparing GMV/hour, GPM, and average watch duration',
      'Ad spend (GMV Max) to net margin guardrails preventing unprofitable scaling',
      'Automated host shift bonus and affiliate commission summary after broadcast',
    ],
  },
  'ID-026': {
    tagline: 'Pharmacy POS with FEFO batch control, BPOM KFA codes & SIPNAP ledger',
    audience: 'Independent Indonesian pharmacies, clinic dispensaries, and pharmacy chains',
    summary:
      'Pharmacy POS enforcing First-Expired-First-Out (FEFO) batch picking, drug interaction alerts, e-Prescription verification, and Kemenkes SIPNAP psychotropic reporting.',
    problem:
      'Generic retail cashiers do not track per-batch expiry dates, physician SIP validity, or monthly OOT/psychotropic drug reports.',
    indonesiaContext:
      'Follows Apoteker Penanggung Jawab (APJ) workflows: per-batch Kartu Stok, compounded medicine tuslah/embalase calculation, dosage label printing, and SIPNAP export.',
    features: [
      'Automated FEFO batch selection with alerts for stock expiring under 90 days',
      'Compounded medicine (racikan) pricing calculator with dosage sticker printing',
      'Mandatory physician SIP and patient NIK capture for psychotropic/OOT dispensing',
      'One-click Kemenkes SIPNAP monthly report and Kartu Stok export',
    ],
  },
  'ID-027': {
    tagline: 'COD fake-order risk filter & reverse logistics RMA workflow',
    audience: 'D2C brands and social-commerce sellers with high COD shipment volumes',
    summary:
      'Scores COD order risk prior to dispatch, sends automated WhatsApp address confirmations for suspicious orders, and tracks returned parcels back into sellable stock.',
    problem:
      '15-30% COD Return-to-Sender (RTS) rates on outer-island shipments wipe out seller profits through round-trip postage and damaged packaging.',
    indonesiaContext:
      'Detects Indonesian COD patterns: addresses missing RT/RW, phone numbers with repeat RTS history, courier failure codes, and unboxing video dispute evidence.',
    features: [
      'Pre-dispatch COD risk scoring based on address completeness and RTS history',
      'Automated WhatsApp confirmation flow for medium- and high-risk COD orders',
      'Reverse-logistics Kanban board tracking RTS parcels back to sellable inventory',
      'Warehouse packing camera vs unboxing video matching for claim disputes',
    ],
  },
  'ID-028': {
    tagline: 'Multi-tenant mall loyalty app with receipt OCR, points & QRIS parking',
    audience: 'Shopping mall operators, mixed-use superblocks, and retail tenants',
    summary:
      'Mall visitor app combining 3-second receipt OCR point earning, license-plate QRIS parking payments, and tenant voucher redemption.',
    problem:
      'Shoppers skip loyalty redemptions due to long queues at customer service desks for paper receipt stamping and manual parking ticket validation.',
    indonesiaContext:
      'Supports mall groups in Jakarta, Surabaya, and Bandung with pay-in-app ANPR parking gates and cross-tenant shopping analytics.',
    features: [
      'Sub-3-second tenant receipt OCR extracting merchant NPWP, date, and total',
      'License-plate-linked parking timer payable via QRIS or loyalty points',
      'Member tier privileges covering VIP valet, lounge access, and birthday vouchers',
      'Cross-tenant footfall and spending pattern analytics for mall leasing teams',
    ],
  },
  'ID-029': {
    tagline: 'Dynamic approval orchestrator across 80+ apps powered by Elsa Workflow',
    audience: 'Indonesian conglomerates running 50-100+ disconnected ERP, HR, and IT apps',
    summary:
      'Unified executive inbox and dynamic approval engine ingesting requests from 80+ internal apps via RabbitMQ with adaptive key-value forms and DoA matrices.',
    problem:
      'Directors and VPs waste hours logging into dozens of separate systems to approve POs, capex, leave, and IT access, stalling operations for days.',
    indonesiaContext:
      'Reflects Indonesian enterprise Modular Monolith architecture: Delegation of Authority (DoA) matrices, acting-officer (Pjs) substitution, and WhatsApp/Teams notifications.',
    features: [
      'Single executive inbox rendering dynamic schemas and adaptive key-value forms',
      'Visual Elsa Workflow routing supporting parallel rules, value thresholds, and escalations',
      'Guaranteed source-app callbacks via the RabbitMQ Transactional Outbox pattern',
      'Complete Delegation of Authority (DoA) audit trail for internal and ISO audits',
    ],
  },
  'ID-030': {
    tagline: 'ERP-to-CoreTax DJP XML studio for e-Faktur & Bukti Potong',
    audience: 'Indonesian PKP companies, distributors, and tax compliance departments',
    summary:
      'Transforms ERP sales and purchase ledgers into XSD-validated CoreTax DJP XML batches for Output Tax Invoices, Returns, and Unified Withholding Slips with NITKU checks.',
    problem:
      'Manual re-keying into the CoreTax portal causes XML upload rejections, NPWP-16/NITKU formatting errors, and late SPT Masa filing penalties.',
    indonesiaContext:
      'Enforces 16-digit NPWP, 22-digit branch NITKU codes, CoreTax 11/12 DPP Nilai Lain formulas, and automated reconciliation against SPT Masa.',
    features: [
      'Direct connectors from ERPs (SAP, Accurate, SQL Server) to CoreTax XML generators',
      'Pre-upload XSD validator catching NPWP-16, NITKU, and item code errors early',
      'Automated DPP Nilai Lain and 12% PPN rounding parity verification',
      'Input Tax Invoice QR scanner with 3-month crediting deadline reminders',
    ],
  },
  'ID-031': {
    tagline: 'Multi-PT Indonesian payroll with PPh 21 TER, BPJS & Tapera engine',
    audience: 'Indonesian multi-PT holding groups, outsourcing firms, and mid-market HR teams',
    summary:
      'Deterministic Indonesian payroll engine handling PPh 21 TER Categories A/B/C, December Article 17 reconciliation, BPJS wage caps, THR, and multi-PT bank files.',
    problem:
      'Spreadsheet payroll breaks every December during annual PPh 21 true-ups, provincial UMK revisions, and inter-entity employee transfers.',
    indonesiaContext:
      'Includes 38-province UMP/UMK tables, BPJS JHT/JP/JKK/JKM contribution ceilings, tax gross-up formulas, and BCA/Mandiri/BNI payroll upload formats.',
    features: [
      'Monthly PPh 21 TER (A/B/C) engine paired with December Article 17 annual true-up',
      'Automated BPJS Kesehatan, JHT, JP, JKK, JKM, and Tapera deductions with wage caps',
      'Multi-PT cost-center journal export to ERP GL plus password-protected PDF payslips',
      'Variance alerts flagging >5% pay swings before CFO payroll release sign-off',
    ],
  },
  'ID-032': {
    tagline: 'Cold-chain stock, hygiene audit & branch KPI desktop ERP for 18 branches',
    audience: 'National frozen food distributors and multi-branch FMCG operators',
    summary:
      'National branch governance suite managing monthly branch rankings, stock-take variances, cold-storage hygiene audits, and central stock write-off approvals across 18+ branches.',
    problem:
      'Inter-island cold-storage depots risk silent stock shrinkage, expired frozen goods, and inconsistent warehouse sanitation standards across branches.',
    indonesiaContext:
      'Directly inspired by national cold-chain distribution (Jakarta, Surabaya, Bali, Makassar, Medan, Balikpapan) with bulk Excel imports and branch manager scorecards.',
    features: [
      'Monthly 18-branch leaderboard combining stock accuracy, hygiene, and sales KPIs',
      'Per-batch stock-taking and HQ-approved Berita Acara stock destruction workflows',
      'Warehouse sanitation and cold-room temperature audits with field photo evidence',
      'High-speed Excel bulk import and export validated against the master SKU catalog',
    ],
  },
  'ID-033': {
    tagline: 'Transparent vendor prequalification & sealed-bid e-procurement portal',
    audience: 'BUMN enterprises, mining contractors, and large corporations',
    summary:
      'End-to-end procurement governance covering vendor KYC/TKDN verification, time-locked encrypted bid opening, technical-commercial scoring, and anti-collusion audits.',
    problem:
      'Email-based manual tenders expose bid prices to leaks, inconsistent TKDN preference math, and internal or BPK audit findings.',
    indonesiaContext:
      'Verifies TKDN (Domestic Component Level) certificates, OSS-RBA NIB validity, PKP status, and owner HPS budget ceilings.',
    features: [
      'Time-locked encrypted bids that only decrypt during scheduled committee sessions',
      'Weighted evaluation matrix combining Technical, Commercial, and TKDN preferences',
      'Automated screening for blacklisted vendors, expired NIBs, and affiliation signals',
      'Immutable tender timestamp trail ready for BPK and internal audit export',
    ],
  },
  'ID-034': {
    tagline: 'Fixed asset management, PSAK/Fiscal depreciation & QR/RFID stock-opname',
    audience: 'General Affairs (GA) teams, hospitals, universities, and multi-site enterprises',
    summary:
      'Tracks physical fixed assets from Capex PO and QR/RFID tagging through custodian BAST handovers, dual commercial vs fiscal depreciation, and annual stock-opname reconciliation.',
    problem:
      'Companies face financial audit findings when IT laptops, heavy tools, or medical equipment go missing or fiscal depreciation schedules drift out of sync.',
    indonesiaContext:
      'Maintains Indonesian Income Tax Law (UU PPh Groups 1-4) fiscal depreciation schedules side by side with PSAK 16 commercial depreciation.',
    features: [
      'Dual depreciation engine for commercial (PSAK 16) and Indonesian fiscal Groups 1-4',
      'Mobile QR/RFID opname scanner flagging missing or relocated assets',
      'Digital Berita Acara Serah Terima (BAST) custody records for laptops and equipment',
      'Automated monthly GL depreciation journals and disposal gain/loss calculations',
    ],
  },
  'ID-035': {
    tagline: 'Discrete manufacturing MRP desktop suite, multi-BOM, work orders & OEE',
    audience: 'Tier-1/2 automotive parts, injection molding, and packaging plants in Karawang/Cikarang',
    summary:
      'Material Requirements Planning (MRP), multi-level Bill of Materials (BOM), shop-floor work order routing, and live machine OEE monitoring.',
    problem:
      'Mid-sized factories outgrow spreadsheets long before they can justify multi-billion-Rupiah SAP rollouts, leaving raw material shortages and machine downtime undetected.',
    indonesiaContext:
      'Supports industrial estate subcontracting (makloon), Shift 1/2/3 tracking, and Kawasan Berikat IT Inventory reporting for Bea Cukai customs audits.',
    features: [
      'Multi-level BOM explosion calculating net raw material purchase requirements automatically',
      'Shop-floor work order cards logging scrap and rework reason codes per shift',
      'Real-time OEE (Availability x Performance x Quality) tracking per machine',
      'Kawasan Berikat IT Inventory ledger ready for Bea Cukai customs inspection',
    ],
  },
  'ID-036': {
    tagline: 'Multi-site shift roster planner, geofence attendance & statutory overtime guard',
    audience: 'Hospital chains, security outsourcing, retail, and mining sites',
    summary:
      'Visual shift roster planner enforcing Labor Law overtime ceilings, anti-mock-GPS attendance check-ins, and employee shift-swap approvals.',
    problem:
      '24/7 operations suffer from buddy punching, non-compliant consecutive night shifts, and overtime calculation disputes before payday.',
    indonesiaContext:
      'Implements official Indonesian overtime multipliers (1.5x first hour, 2x subsequent hours, 3x/4x public holidays) and the SKB 3 Menteri holiday calendar.',
    features: [
      'Conflict-free roster grid across shifts, sites, and competency certifications',
      'Anti-mock-GPS and liveness check-in synced with ZKTeco fingerprint terminals',
      'Automated guardrail enforcing PP 35/2021 weekly overtime caps and rest periods',
      'Verified work hours and overtime export straight into payroll systems',
    ],
  },
};
