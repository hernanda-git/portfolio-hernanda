import type { LocalizedList, LocalizedText } from './profile';

export type DiagramId =
  | 'trakindo-hub'
  | 'grc-ai-gateway'
  | 'mining-offline-suite'
  | 'inhealth-micare'
  | 'crossborder-ocbc-delmon'
  | 'founder-coldchain-govtech';

export interface ProductionCaseStudy {
  id: string;
  slug: string;
  diagramId: DiagramId;
  code: string;
  client: string;
  sector: LocalizedText;
  period: LocalizedText;
  commitment: LocalizedText;
  title: LocalizedText;
  headlineMetric: LocalizedText;
  summary: LocalizedText;
  context: LocalizedText;
  constraints: LocalizedList;
  architectureDecisions: LocalizedList;
  outcomes: LocalizedList;
  stack: string[];
  experienceId: string;
  relatedConceptIds: string[];
}

export const PRODUCTION_CASE_STUDIES: ProductionCaseStudy[] = [
  {
    id: 'cs-trakindo',
    slug: 'trakindo-approval-hub',
    diagramId: 'trakindo-hub',
    code: 'PROD-01',
    client: 'PT. Tiara Marga Trakindo (Mitra Solusi Telematika)',
    sector: {
      en: 'Industrial Conglomerate & Enterprise Workflow',
      id: 'Konglomerasi Industri & Enterprise Workflow',
    },
    period: {
      en: 'Jan 2026 - May 2026',
      id: 'Jan 2026 - Mei 2026',
    },
    commitment: {
      en: 'Full-Time Production',
      id: 'Produksi Full-Time',
    },
    title: {
      en: 'Centralized Approval & Workflow Hub Across 80+ Enterprise Applications',
      id: 'Hub Approval & Workflow Terpusat untuk 80+ Aplikasi Enterprise',
    },
    headlineMetric: {
      en: '80+ Subsidiary Apps Unified',
      id: '80+ Aplikasi Anak Perusahaan Terpadu',
    },
    summary: {
      en: 'Engineered a single executive approval platform unifying 80+ disparate internal applications through a .NET Modular Monolith, RabbitMQ messaging, Elsa Workflow orchestration, and adaptive key-value form schemas.',
      id: 'Merancang platform approval eksekutif terpadu yang menyatukan lebih dari 80 aplikasi internal lintas anak perusahaan dengan .NET Modular Monolith, RabbitMQ, Elsa Workflow, dan skema form key-value adaptif.',
    },
    context: {
      en: 'Executives across a major industrial conglomerate had to jump between dozens of siloed ERP, procurement, HR, and finance portals just to approve daily requests. Rewriting 80 legacy apps to share one rigid schema was operationally impossible.',
      id: 'Eksekutif di grup konglomerasi industri harus berpindah-pindah ke puluhan portal ERP, pengadaan, HR, dan keuangan hanya untuk menyetujui permintaan harian. Menulis ulang 80 aplikasi legacy agar memakai satu skema kaku tidak mungkin dilakukan secara operasional.',
    },
    constraints: {
      en: [
        '80+ upstream applications with completely different payload shapes and approval hierarchies.',
        'Downstream ERPs could slow down or go into maintenance windows without dropping approval callbacks.',
        'Strict executive UX requirement: zero clutter even when rendering unfamiliar dynamic request fields.',
      ],
      id: [
        '80+ aplikasi hulu dengan struktur payload dan hierarki persetujuan yang sangat beragam.',
        'Sistem ERP di hilir bisa melambat atau masuk jadwal maintenance tanpa boleh kehilangan callback persetujuan.',
        'Standar UX eksekutif yang ketat: antarmuka harus tetap ringkas meski merender field dinamis yang berbeda-beda.',
      ],
    },
    architectureDecisions: {
      en: [
        'Chose a .NET Modular Monolith over premature microservices to keep transactional consistency and deployment velocity tight while enforcing strict internal domain boundaries.',
        'Decoupled upstream ingestion and downstream callback delivery using RabbitMQ and Elsa Workflow so stalled consumer apps safely queue and retry.',
        'Built an adaptive dictionary and key-value form contract so onboarding new applications required configuration rather than custom frontend releases.',
        'Centralized authentication, API Gateway routing, and structured audit trails for end-to-end compliance traceability.',
      ],
      id: [
        'Memilih .NET Modular Monolith ketimbang memecah microservices terlalu dini agar konsistensi transaksi dan kecepatan delivery terjaga sambil mempertahankan batas modul yang ketat.',
        'Memisahkan proses ingestion hulu dan callback hilir memakai RabbitMQ serta Elsa Workflow agar aplikasi consumer yang lambat tetap aman dalam antrean retry.',
        'Membangun kontrak form key-value dan dictionary adaptif sehingga integrasi aplikasi baru cukup lewat konfigurasi tanpa rilis ulang frontend.',
        'Memusatkan autentikasi, routing API Gateway, dan audit trail terstruktur untuk kebutuhan kepatuhan penuh.',
      ],
    },
    outcomes: {
      en: [
        'Delivered one consistent approval inbox spanning 80+ internal conglomerate applications.',
        'Eliminated bespoke UI engineering per onboarded app via dynamic schema and form rendering.',
        'Established durable asynchronous orchestration with full audit logging across approval states.',
      ],
      id: [
        'Menghadirkan satu inbox persetujuan konsisten yang mencakup lebih dari 80 aplikasi internal konglomerasi.',
        'Menghilangkan kebutuhan bangun UI khusus tiap aplikasi baru berkat skema dan rendering form dinamis.',
        'Menciptakan orkestrasi asinkron yang tahan gangguan lengkap dengan audit trail di setiap status persetujuan.',
      ],
    },
    stack: ['.NET', 'Modular Monolith', 'Elsa Workflow', 'RabbitMQ', 'API Gateway', 'SQL Server'],
    experienceId: 'exp-trakindo',
    relatedConceptIds: ['ID-029', 'ID-033', 'ID-070'],
  },
  {
    id: 'cs-grcboard',
    slug: 'grc-sovereign-ai-gateway',
    diagramId: 'grc-ai-gateway',
    code: 'PROD-02',
    client: 'PT. Mitra Seribu Saudara (GRC Board)',
    sector: {
      en: 'Internal AI Infrastructure & Enterprise Finance',
      id: 'Infrastruktur AI Internal & Keuangan Enterprise',
    },
    period: {
      en: 'May 2026 - Present',
      id: 'Mei 2026 - Sekarang',
    },
    commitment: {
      en: 'Full-Time Production',
      id: 'Produksi Full-Time',
    },
    title: {
      en: 'Sovereign .NET AI Inference Gateway, Knowledge Workspace & Linear-Algebra Budget Forecasting',
      id: 'Sovereign .NET AI Inference Gateway, Knowledge Workspace & Proyeksi Anggaran Aljabar Linear',
    },
    headlineMetric: {
      en: 'Custom .NET Gateway Built From Scratch',
      id: 'Gateway .NET Dibangun dari Nol',
    },
    summary: {
      en: 'Alongside core B2B/B2C backend ownership, designed and built an internal .NET AI inference gateway with multi-provider pooling and PII protection, the Tourmaline web knowledge workspace, and a probability-weighted company budget forecasting system.',
      id: 'Di samping menangani backend B2B/B2C utama, merancang dan membangun AI inference gateway berbasis .NET dengan provider pooling dan proteksi PII, workspace pengetahuan web Tourmaline, serta sistem proyeksi anggaran perusahaan berbasis probabilitas.',
    },
    context: {
      en: 'Uncontrolled direct API keys create cost spikes, vendor lock-in, and severe risk of internal corporate data leaking to external LLM providers. At the same time, company operations needed cleaner facility booking and quantitative multi-option budget forecasting.',
      id: 'Pemakaian API key secara langsung dan tersebar memicu lonjakan biaya, ketergantungan vendor, serta risiko kebocoran data korporat ke penyedia LLM eksternal. Di sisi operasional, perusahaan juga membutuhkan perombakan sistem reservasi dan proyeksi anggaran kuantitatif.',
    },
    constraints: {
      en: [
        'Strict data-loss boundary: sensitive corporate fields had to be filtered before any request left internal infrastructure.',
        'Must support multiple model providers, local benchmarking (Qwen/LoRA), and RBAC usage quotas without breaking client tools.',
        'Financial forecasting required grouping expenses across flexible dimensions and modeling probability-weighted future spend.',
      ],
      id: [
        'Batas perlindungan data ketat: field korporat sensitif wajib disaring sebelum request keluar dari infrastruktur internal.',
        'Harus mendukung banyak provider model, benchmarking lokal (Qwen/LoRA), dan kuota berbasis RBAC tanpa merusak alur kerja tim.',
        'Proyeksi finansial membutuhkan pengelompokan biaya multi-opsi dan pemodelan pengeluaran masa depan berbasis probabilitas.',
      ],
    },
    architectureDecisions: {
      en: [
        'Built the inference gateway natively in .NET from scratch instead of wrapping fragile proxy forks, giving full control over provider pooling, model routing, and context compression.',
        'Placed a deterministic PII/sensitive-data concrete wall and RBAC quota layer ahead of outbound model routing.',
        'Engineered Tourmaline as a web-deployable Obsidian-style knowledge hub paired with customized agent runtimes and vector memory caching.',
        'Applied linear-algebra probability models inside a ground-up budget tracking system to forecast future expense scenarios across business units.',
      ],
      id: [
        'Membangun inference gateway secara native di .NET dari nol ketimbang bergantung pada fork proxy yang rapuh, sehingga kendali atas provider pooling, routing model, dan kompresi konteks penuh di tangan internal.',
        'Menempatkan lapisan filter data sensitif deterministik dan kuota RBAC sebelum request dikirim ke model eksternal.',
        'Mengembangkan Tourmaline sebagai workspace pengetahuan web bergaya Obsidian yang dipadukan dengan runtime agent kustom dan caching memori vektor.',
        'Menerapkan pemodelan probabilitas berbasis aljabar linear dalam sistem pelacakan anggaran untuk memproyeksikan skenario pengeluaran di masa depan.',
      ],
    },
    outcomes: {
      en: [
        'Unified internal AI experimentation and production tooling behind one governed .NET gateway.',
        'Replaced conflict-prone meeting room and vehicle booking workflows with clean rebuilt services.',
        'Delivered probability-based expense forecasting alongside ongoing B2B and B2C backend operations.',
      ],
      id: [
        'Menyatukan eksperimen dan operasional AI internal di balik satu gateway .NET yang terkelola.',
        'Mengganti sistem reservasi ruang rapat dan kendaraan yang rawan bentrok dengan layanan baru yang tertib.',
        'Menghadirkan sistem proyeksi anggaran berbasis probabilitas berdampingan dengan operasional backend B2B dan B2C.',
      ],
    },
    stack: ['.NET', 'C#', 'AI Inference Gateway', 'Tourmaline', 'LoRA / Qwen', 'RBAC', 'Linear Algebra'],
    experienceId: 'exp-grcboard',
    relatedConceptIds: ['ID-001', 'ID-004', 'ID-006'],
  },
  {
    id: 'cs-mining',
    slug: 'mining-field-operations-suite',
    diagramId: 'mining-offline-suite',
    code: 'PROD-03',
    client: 'PT Amman Mineral Nusa Tenggara & PT. Saptaindra Sejati (Adaro Energy)',
    sector: {
      en: 'Gold, Copper & Coal Mining Operations',
      id: 'Operasional Tambang Emas, Tembaga & Batubara',
    },
    period: {
      en: 'Feb 2023 - Apr 2025',
      id: 'Feb 2023 - Apr 2025',
    },
    commitment: {
      en: 'Enterprise Placement (2+ Years)',
      id: 'Penempatan Enterprise (2+ Tahun)',
    },
    title: {
      en: 'End-to-End Mining Field Suite: Meals Online, QC Inspection & Lubricant Management',
      id: 'Suite Operasional Tambang End-to-End: Meals Online, QC Inspection & Lubricant Management',
    },
    headlineMetric: {
      en: '2+ Years Across Top Indonesian Mines',
      id: '2+ Tahun di Tambang Terbesar Indonesia',
    },
    summary: {
      en: 'Architected, delivered, migrated, and operated web and .NET MAUI mobile platforms across two of Indonesia\'s largest mining operations, covering database design, .NET 6 to .NET 8 LTS migration, Azure AD/B2C, CI/CD, and iOS/Android store releases.',
      id: 'Merancang, membangun, memigrasi, dan mengoperasikan aplikasi web serta mobile .NET MAUI di dua operasi tambang terbesar Indonesia, mencakup desain database, migrasi .NET 6 ke .NET 8 LTS, Azure AD/B2C, CI/CD, hingga rilis iOS/Android.',
    },
    context: {
      en: 'Remote mine sites run 24/7 with strict enterprise identity policies, legacy Windows Server hosting, and frontline field teams needing reliable mobile tools for camp meals, quality inspections, and heavy-equipment lubricant tracking.',
      id: 'Area tambang terpencil beroperasi 24/7 dengan kebijakan identitas enterprise ketat, server produksi Windows Server, dan tim lapangan yang membutuhkan aplikasi mobile andal untuk katering camp, inspeksi QC, serta pemantauan pelumas alat berat.',
    },
    constraints: {
      en: [
        'Enterprise security mandates requiring Azure Active Directory and Azure B2C employee directory integration.',
        'Simultaneous maintenance of running legacy systems while migrating core apps from .NET 6 to .NET 8 LTS.',
        'Full mobile release governance across client-owned Apple Developer certificates, TestFlight, and Google Play Console.',
      ],
      id: [
        'Kewajiban keamanan enterprise untuk mengintegrasikan direktori karyawan Azure Active Directory dan Azure B2C.',
        'Pemeliharaan sistem legacy yang tetap beroperasi bersamaan dengan migrasi aplikasi inti dari .NET 6 ke .NET 8 LTS.',
        'Tata kelola rilis mobile penuh menggunakan sertifikat Apple Developer milik klien, TestFlight, dan Google Play Console.',
      ],
    },
    architectureDecisions: {
      en: [
        'Standardized full-stack delivery on .NET 8 LTS + .NET MAUI so web and mobile shared domain contracts and C# engineering velocity.',
        'Produced upfront architecture blueprints, relational schemas (Miro, dbDiagram), Figma UI mockups, and SDD/FSD/UAT specs prior to build sprints.',
        'Automated build, vulnerability scanning, and deployment pipelines in Azure DevOps with controlled Production/Development environment swaps.',
        'Conducted direct training workshops with operational departments to ensure smooth real-world adoption.',
      ],
      id: [
        'Menstandardisasi delivery full-stack pada .NET 8 LTS dan .NET MAUI agar web serta mobile berbagi kontrak domain dan kecepatan tim C#.',
        'Menyusun blueprint arsitektur, skema relasional (Miro, dbDiagram), mockup Figma, dan dokumen SDD/FSD/UAT sebelum sprint implementasi.',
        'Mengotomatiskan build, pemindaian kerentanan, dan deployment di Azure DevOps lengkap dengan manajemen swap Production/Development.',
        'Membawakan sesi pelatihan langsung kepada departemen pengguna agar adopsi di lapangan berjalan lancar.',
      ],
    },
    outcomes: {
      en: [
        'Completed zero-disruption .NET 6 to .NET 8 LTS runtime upgrade across web and mobile apps.',
        'Delivered Meals Online, QC Inspection (Amman Mineral), and Lubricant Management System architecture & delivery (Saptaindra Sejati / Adaro).',
        'Owned end-to-end iOS TestFlight and Android Play Console release lifecycles with documented changelogs and backlogs.',
      ],
      id: [
        'Menuntaskan upgrade runtime .NET 6 ke .NET 8 LTS tanpa mengganggu operasional web dan mobile.',
        'Menghadirkan Meals Online, QC Inspection (Amman Mineral), serta arsitektur dan delivery Lubricant Management System (Saptaindra Sejati / Adaro).',
        'Mengelola siklus rilis penuh iOS TestFlight dan Android Google Play Console beserta changelog dan backlog perbaikan.',
      ],
    },
    stack: ['.NET 8 LTS', '.NET MAUI', 'SQL Server', 'Azure AD / B2C', 'Azure DevOps CI/CD', 'TestFlight', 'Google Play'],
    experienceId: 'exp-amman',
    relatedConceptIds: ['ID-053', 'ID-054', 'ID-057'],
  },
  {
    id: 'cs-inhealth',
    slug: 'mandiri-inhealth-micare',
    diagramId: 'inhealth-micare',
    code: 'PROD-04',
    client: 'PT. Asuransi Jiwa Inhealth Indonesia (Mandiri Inhealth)',
    sector: {
      en: 'Health Insurance & Regulated Healthcare',
      id: 'Asuransi Kesehatan & Healthcare Teregulasi',
    },
    period: {
      en: 'May 2025 - Dec 2025',
      id: 'Mei 2025 - Des 2025',
    },
    commitment: {
      en: 'Full-Time Production',
      id: 'Produksi Full-Time',
    },
    title: {
      en: 'Adaptive Notification, Approval Services & TDD Engineering for New MiCare',
      id: 'Layanan Notifikasi & Approval Adaptif serta Penerapan TDD untuk New MiCare',
    },
    headlineMetric: {
      en: 'Dockerized CI/CD + TDD Safety Net',
      id: 'CI/CD Berbasis Docker + Jaring Pengaman TDD',
    },
    summary: {
      en: 'Proposed and shipped adaptive notification and request-approval services into a live health-insurance production environment while guiding New MiCare full-stack delivery (.NET + React) and institutionalizing TDD unit testing.',
      id: 'Mengusulkan dan merilis layanan notifikasi serta request approval adaptif ke ekosistem produksi asuransi kesehatan yang sedang berjalan, sekaligus mengawal delivery full-stack New MiCare (.NET + React) dan menerapkan unit testing TDD.',
    },
    context: {
      en: 'As developer headcount expanded rapidly to modernize the MiCare insurance platform, manual verification and tightly coupled legacy notification logic increased deployment risk and regression defects.',
      id: 'Seiring bertambahnya personel developer untuk memodernisasi platform asuransi MiCare, verifikasi manual dan logika notifikasi lama yang saling terikat meningkatkan risiko regresi saat deployment.',
    },
    constraints: {
      en: [
        'New services had to plug directly into live insurance production systems without disruptive downtime.',
        'Growing engineering team needed guardrails to prevent human error during frequent sprint deployments.',
      ],
      id: [
        'Layanan baru harus menyatu langsung ke lingkungan produksi asuransi yang hidup tanpa downtime mengganggu.',
        'Tim engineering yang berkembang cepat membutuhkan pagar pengaman untuk menekan human error saat rilis sprint.',
      ],
    },
    architectureDecisions: {
      en: [
        'Designed adaptive Notification and Request Approval services with clean integration boundaries so existing modules could adopt them incrementally.',
        'Containerized the .NET + React stack with Docker and wired automated CI/CD release pipelines.',
        'Established unit-test harnesses and Test-Driven Development workflows to verify critical business logic prior to merge.',
      ],
      id: [
        'Merancang layanan Notification dan Request Approval yang adaptif dengan batas integrasi bersih agar modul lama dapat mengadopsinya bertahap.',
        'Mengemas stack .NET dan React dalam container Docker dengan pipeline CI/CD otomatis.',
        'Membangun fondasi unit test dan alur Test-Driven Development untuk memverifikasi logika bisnis krusial sebelum merge.',
      ],
    },
    outcomes: {
      en: [
        'Delivered production-ready adaptive notification and approval services into the active insurance ecosystem.',
        'Structured sprint timelines and containerized CI/CD delivery for New MiCare.',
        'Reduced deployment risk and manual regression burden as developer headcount scaled.',
      ],
      id: [
        'Merilis layanan notifikasi dan approval adaptif yang siap produksi ke ekosistem asuransi eksisting.',
        'Menyusun timeline sprint dan pipeline CI/CD berbasis Docker untuk pengembangan New MiCare.',
        'Menekan risiko deployment dan beban regresi manual seiring bertambahnya jumlah developer.',
      ],
    },
    stack: ['.NET', 'React', 'Docker', 'CI/CD', 'TDD / xUnit', 'SQL Server'],
    experienceId: 'exp-inhealth',
    relatedConceptIds: ['ID-038', 'ID-039', 'ID-041'],
  },
  {
    id: 'cs-crossborder',
    slug: 'crossborder-ocbc-delmon',
    diagramId: 'crossborder-ocbc-delmon',
    code: 'PROD-05',
    client: 'Total eBiz Solutions / OCBC (Singapore) & Delmon Group (Saudi Arabia)',
    sector: {
      en: 'Cross-Border Banking Security & Enterprise Mobile',
      id: 'Keamanan Perbankan Lintas Negara & Enterprise Mobile',
    },
    period: {
      en: '2023 & 2025 (Focused Engagements)',
      id: '2023 & 2025 (Kontrak Fokus)',
    },
    commitment: {
      en: 'International Short-Term Contracts',
      id: 'Kontrak Singkat Internasional',
    },
    title: {
      en: 'OCBC Bank Host-to-Host File Encryption API & Server-Driven Arabic RTL Mobile App',
      id: 'API Enkripsi File Host-to-Host OCBC Bank & Aplikasi Mobile RTL Arab Server-Driven',
    },
    headlineMetric: {
      en: 'Singapore & Saudi Arabia Remote Delivery',
      id: 'Delivery Remote Singapura & Arab Saudi',
    },
    summary: {
      en: 'Two high-precision international contracts: an OCBC banking file encryption SOAP API in Singapore, and a ground-up .NET MAUI 9 rebuild of Delmon Group\'s Office Anywhere mobile app in Saudi Arabia featuring 80% Arabic RTL layouts and Form.io JSON dynamic UI.',
      id: 'Dua kontrak internasional berpresisi tinggi: SOAP API enkripsi file sesuai standar OCBC Bank di Singapura, serta pembangunan ulang aplikasi mobile Office Anywhere milik Delmon Group di Arab Saudi menggunakan .NET MAUI 9 dengan 80% layout RTL Bahasa Arab dan Form.io JSON dinamis.',
    },
    context: {
      en: 'International enterprise clients brought tight 4-to-8-week windows for specialized engineering tasks that typical agencies struggled with: strict bank cryptographic file protocols and fully dynamic Right-to-Left mobile form engines.',
      id: 'Klien enterprise internasional membawa tenggat singkat 4 hingga 8 minggu untuk kebutuhan teknis spesialis: protokol kriptografi file perbankan yang ketat serta engine form mobile dinamis dengan dukungan penuh Right-to-Left.',
    },
    constraints: {
      en: [
        'Zero tolerance for cryptographic spec drift on OCBC host-to-host XML/SOAP file exchange.',
        'Replacing a legacy Flutter app in .NET MAUI 9 while supporting 80% Arabic RTL rendering and unpredictable Form.io JSON schemas.',
      ],
      id: [
        'Nol toleransi terhadap penyimpangan spesifikasi kriptografi pada pertukaran file XML/SOAP host-to-host OCBC.',
        'Menggantikan aplikasi Flutter lama ke .NET MAUI 9 sekaligus menjaga 80% layout RTL Bahasa Arab dan skema JSON Form.io yang dinamis.',
      ],
    },
    architectureDecisions: {
      en: [
        'Implemented clean .NET SOAP endpoints strictly adhering to OCBC encryption and decryption specifications for seamless portal-to-bank handoff.',
        'Engineered a recursive Form.io JSON parser in .NET MAUI 9 translating input types, defaults, conditional visibility, and parent-child field rules directly into native Syncfusion controls.',
        'Mapped dynamic form metadata cleanly onto backend API models with skeleton states, real-time validation, and layered client-side security.',
      ],
      id: [
        'Mengimplementasikan endpoint SOAP .NET yang mematuhi standar enkripsi dan dekripsi OCBC secara presisi untuk jembatan portal ke bank.',
        'Merancang parser JSON Form.io di .NET MAUI 9 yang menerjemahkan tipe input, nilai default, kondisi visibilitas, dan relasi parent-child langsung menjadi kontrol native Syncfusion.',
        'Memetakan metadata form dinamis langsung ke model payload API backend lengkap dengan skeleton loading, validasi real-time, dan proteksi keamanan berlapis.',
      ],
    },
    outcomes: {
      en: [
        'Delivered production OCBC file encryption bridge on schedule within a 2-month remote engagement.',
        'Replaced Delmon\'s legacy Flutter mobile app with a fast, dynamic RTL .NET MAUI 9 task platform inside 8 weeks.',
      ],
      id: [
        'Menyelesaikan jembatan enkripsi file OCBC tepat waktu dalam kontrak remote 2 bulan.',
        'Mengganti aplikasi Flutter lama milik Delmon dengan platform tugas .NET MAUI 9 RTL dinamis dalam 8 minggu.',
      ],
    },
    stack: ['.NET MAUI 9', 'SOAP / XML Cryptography', 'OCBC Standards', 'Form.io JSON', 'Syncfusion', 'Arabic RTL'],
    experienceId: 'exp-delmon',
    relatedConceptIds: ['ID-012', 'ID-067', 'ID-071'],
  },
  {
    id: 'cs-range',
    slug: 'founder-coldchain-govtech',
    diagramId: 'founder-coldchain-govtech',
    code: 'PROD-06',
    client: 'Warga Digital | Diamond Cold Storage | POLRI & Nusa Kambangan',
    sector: {
      en: 'Civic SaaS, 18-Branch Cold-Chain & High-Security GovTech',
      id: 'Civic SaaS, Cold-Chain 18 Cabang & GovTech Keamanan Tinggi',
    },
    period: {
      en: '2016 - 2018 & 2026',
      id: '2016 - 2018 & 2026',
    },
    commitment: {
      en: 'Founder Venture & Full-Time Production',
      id: 'Usaha Mandiri & Produksi Full-Time',
    },
    title: {
      en: '0-to-1 Civic SaaS, 18-Branch Cold-Chain KPI Engine & Biometric GovTech Systems',
      id: 'Civic SaaS 0-ke-1, Mesin KPI Cold-Chain 18 Cabang & Sistem GovTech Biometrik',
    },
    headlineMetric: {
      en: '18 Branches + Solo SaaS + GovTech',
      id: '18 Cabang + SaaS Mandiri + GovTech',
    },
    summary: {
      en: 'Full-spectrum engineering ownership spanning Warga Digital (solo-built RT/RW SaaS on Supabase + custom JWT), DataGate (18-branch nationwide KPI platform for Diamond Cold Storage), and physical-security systems for POLRI/POLDA Metro Jaya and Nusa Kambangan prison.',
      id: 'Spektrum lengkap rekayasa perangkat lunak mulai dari Warga Digital (SaaS RT/RW mandiri dengan Supabase + custom JWT), DataGate (platform KPI nasional 18 cabang Diamond Cold Storage), hingga sistem keamanan fisik untuk POLRI/POLDA Metro Jaya dan Lapas Nusa Kambangan.',
    },
    context: {
      en: 'Across vastly different environments, from non-technical neighborhood treasurers to 18 nationwide cold-storage warehouses and law-enforcement security checkpoints, software succeeds only when operational reality drives architecture.',
      id: 'Di lingkungan yang sangat beragam, dari pengurus kas RT non-teknis hingga 18 gudang cold-storage nasional dan gerbang keamanan kepolisian, perangkat lunak hanya berhasil jika arsitekturnya mengikuti realitas lapangan.',
    },
    constraints: {
      en: [
        'Warga Digital needed low operating cost, strict neighborhood data isolation, and mobile-first simplicity for non-technical admins.',
        'Diamond Cold Storage needed unified branch KPI rankings, hygiene monitoring, stock-taking, and bulk Excel ingestion across 18 branches.',
        'Law-enforcement and correctional deployments required reliable hardware integration (face detection, RFID, KTP scanners, closed-loop wallets).',
      ],
      id: [
        'Warga Digital menuntut biaya operasional rendah, isolasi data antar-lingkungan yang ketat, dan kesederhanaan mobile-first bagi pengurus non-teknis.',
        'Diamond Cold Storage membutuhkan pemeringkatan KPI bulanan, audit kebersihan gudang, stock opname, dan impor Excel massal dari 18 cabang.',
        'Implementasi kepolisian dan pemasyarakatan menuntut integrasi perangkat keras yang stabil (deteksi wajah, RFID, pemindai KTP, dompet tertutup).',
      ],
    },
    architectureDecisions: {
      en: [
        'Built Warga Digital end-to-end with TypeScript, PostgreSQL/Supabase, and custom JWT authentication for clean tenant isolation.',
        'Engineered DataGate on .NET and SQL Server to consolidate branch stock reports, write-off audits, and monthly branch leaderboards.',
        'Integrated biometric face detection, RFID cards, and KTP scanning into POLRI/POLDA Metro Jaya visitor check-in workflows, plus Iwartelsus balance ledgers at Nusa Kambangan.',
      ],
      id: [
        'Membangun Warga Digital secara end-to-end memakai TypeScript, PostgreSQL/Supabase, dan custom JWT auth untuk isolasi tenant yang bersih.',
        'Mengembangkan DataGate di atas .NET dan SQL Server untuk mengonsolidasikan laporan stok, audit pemusnahan, dan ranking cabang bulanan.',
        'Mengintegrasikan deteksi wajah, kartu RFID, dan pemindai KTP pada check-in pengunjung POLRI/POLDA Metro Jaya serta ledger saldo Iwartelsus di Nusa Kambangan.',
      ],
    },
    outcomes: {
      en: [
        'Launched Warga Digital (warga-digital.com) from zero to live production as sole architect and engineer.',
        'Unified operational KPI visibility and monthly branch rankings across all 18 Diamond Cold Storage branches.',
        'Shipped hardware-integrated visitor security and inmate wallet platforms used in real government facilities.',
      ],
      id: [
        'Meluncurkan Warga Digital (warga-digital.com) dari nol ke produksi sebagai arsitek sekaligus engineer tunggal.',
        'Menyatukan visibilitas KPI operasional dan ranking bulanan untuk seluruh 18 cabang Diamond Cold Storage.',
        'Menghadirkan sistem keamanan pengunjung berbasis perangkat keras dan platform dompet warga binaan di fasilitas pemerintah nyata.',
      ],
    },
    stack: ['Supabase', 'PostgreSQL', 'Custom JWT', '.NET', 'SQL Server', 'RFID / Biometrics'],
    experienceId: 'exp-wargadigital',
    relatedConceptIds: ['ID-060', 'ID-032', 'ID-066'],
  },
];
