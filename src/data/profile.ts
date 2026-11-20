export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  clientContext?: string;
  period: string;
  location: string;
  sector: string;
  employmentType: 'Full-Time' | 'Founder' | 'Leadership' | 'Konsultan / Penempatan' | 'Freelance';
  summary: string;
  highlights: string[];
  stack: string[];
  relatedConceptIds: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export const PROFILE = {
  name: 'Muhammad Hernanda',
  monogram: 'MH',
  title: 'Principal Software Engineer, Solution Architect & Inference Engineer',
  subtitle: 'IT Consultant — 10+ Tahun Membangun Sistem Produksi di Indonesia, Singapura & Arab Saudi',
  location: 'Jakarta, Indonesia',
  timezone: 'WIB (UTC+7)',
  email: 'm.hernanda95@gmail.com',
  phone: '+62-81280031995',
  linkedin: 'https://linkedin.com/in/m-hernanda',
  linkedinLabel: 'linkedin.com/in/m-hernanda',
  activeSince: 2016,
  summary: [
    'Software Engineer multi-peran yang berpengalaman di persimpangan Solution Architect, DevOps, System Analyst, Data Engineer, Release Manager, dan Inference Engineer — membangun sistem produksi berbasis teknologi Microsoft .NET dan lintas platform sejak 2016.',
    'Terlibat langsung di berbagai sektor kritikal: perbankan, pertambangan, asuransi kesehatan, logistik cold-chain, kepolisian, lembaga pemasyarakatan, pemerintahan, hingga startup — mengutamakan kualitas UI/UX dan performa tanpa mengorbankan integritas arsitektur (SOLID & KISS).',
    'Memanfaatkan AI secara pragmatis (sekitar 20% akselerasi kerja harian) agar keputusan arsitektur, verifikasi kualitas, dan akuntabilitas teknis tetap dipegang penuh oleh engineer.',
  ],
  credibilityStatement:
    'Portofolio ini memisahkan secara tegas riwayat karier produksi yang terverifikasi (2016–2026, langsung dari CV) dengan 120 konsep produk di Atlas Pasar Indonesia yang bersifat eksplorasi desain & arsitektur (belum di-deploy ke produksi).',
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Architectural Design',
    items: ['Monolith', 'Modular Monolith', 'Microservices', 'API Gateway', 'Dynamic Workflows', 'Multi-Tenant SaaS'],
  },
  {
    category: 'Frameworks & Platforms',
    items: ['.NET Core / .NET 8–9', '.NET Framework', '.NET MAUI', 'Blazor', 'Xamarin', 'WPF', 'WinForms', 'React', 'Next.js', 'AngularJS'],
  },
  {
    category: 'Languages',
    items: ['C#', 'TypeScript / JavaScript', 'T-SQL', 'Python', 'Go', 'XAML', 'C / C++', 'VB', 'XML'],
  },
  {
    category: 'Backend & Messaging',
    items: ['RabbitMQ', 'Elsa Workflow', 'SignalR', 'Dapper', 'MediatR', 'Refit', 'AutoMapper', 'EPPlus', 'Aspose', 'Supabase', 'Firebase'],
  },
  {
    category: 'Database & Storage',
    items: ['SQL Server', 'PostgreSQL', 'MongoDB', 'SQLite', 'Azure CosmosDB', 'Supabase', 'Neon', 'DbDiagram'],
  },
  {
    category: 'AI & Inference Engineering',
    items: ['Custom .NET Inference Gateways', 'Provider Pooling', 'OpenAI / Anthropic Protocols', 'RAG Pipelines', 'MLOps CI/CD', 'Agent Swarms', 'PyTorch Sentiment'],
  },
  {
    category: 'Cloud, DevOps & Quality',
    items: ['Docker', 'Kubernetes', 'Azure DevOps', 'Azure AppService', 'Azure Functions', 'Azure AD / B2C', 'SonarQube', 'xUnit / NUnit', '.NET Aspire', 'Serilog'],
  },
  {
    category: 'UI Libraries & Design',
    items: ['Syncfusion', 'Telerik', 'DevExpress', 'Tailwind CSS', 'Figma', 'Miro', 'Draw.io', 'Power BI', 'Tableau'],
  },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-grcboard',
    role: 'Inference Engineer',
    company: 'PT. Mitra Seribu Saudara (GRC Board)',
    period: 'Mei 2026 – Sekarang',
    location: 'Jakarta, Indonesia',
    sector: 'Infrastruktur AI & Distribusi Enterprise',
    employmentType: 'Full-Time',
    summary:
      'Merancang dan membangun AI inference gateway, provider pooler, serta lapisan tata kelola agentic dari nol di .NET untuk seluruh perusahaan dalam grup GRC Board.',
    highlights: [
      'Membangun custom inference harness dan multi-provider router dari nol di .NET (tanpa fork) yang mendukung mode OpenAI-compatible, OpenAI Responses, dan Anthropic.',
      'Memodifikasi agent Hermes milik perusahaan (fork dari NousResearch) agar mendukung pembaruan berkelanjutan, sekaligus membangun integrasi Obsidian secara reverse-engineered.',
      'Mengimplementasikan provider pooling, model mixtures, bot profile management, skill curation, rate/request limiting, serta 24/7 agentic red-team defenders.',
      'Merancang tata kelola workspace Git lokal-remote untuk mendukung parallel multi-session swarms dan architect loops secara aman.',
    ],
    stack: ['.NET', 'C#', 'AI Gateway', 'OpenAI / Anthropic API', 'Docker', 'Git Governance'],
    relatedConceptIds: ['ID-001', 'ID-004', 'ID-006', 'ID-077'],
  },
  {
    id: 'exp-wargadigital',
    role: 'Founder',
    company: 'Warga Digital (warga-digital.com)',
    period: 'Mei 2026 – Sekarang',
    location: 'Indonesia',
    sector: 'Civic Tech & SaaS Lingkungan RT/RW',
    employmentType: 'Founder',
    summary:
      'Mendirikan dan meluncurkan platform manajemen RT mobile-first dari nol dengan kepemilikan penuh atas arsitektur, backend, frontend, hingga deployment.',
    highlights: [
      'Mengembangkan fitur inti pengelolaan data warga dan transparansi kas RT.',
      'Menggunakan Supabase dan custom JWT authentication untuk sistem yang aman dan terukur.',
      'Menghubungkan UMKM serta penyedia jasa rumah tangga di dalam ekosistem lingkungan warga.',
      'Berfokus pada UX yang sederhana dan mudah dipahami oleh pengurus RT maupun warga non-teknis.',
    ],
    stack: ['Supabase', 'Custom JWT', 'Mobile-First Web', 'PostgreSQL', 'TypeScript'],
    relatedConceptIds: ['ID-060', 'ID-062', 'ID-024', 'ID-107'],
  },
  {
    id: 'exp-trakindo',
    role: 'Software Engineer',
    company: 'PT. Tiara Marga Trakindo (Mitra Solusi Telematika)',
    period: 'Januari 2026 – Mei 2026',
    location: 'Jakarta, Indonesia',
    sector: 'Konglomerasi Enterprise & Industri',
    employmentType: 'Full-Time',
    summary:
      'Merancang sistem approval terpusat lintas 80+ aplikasi enterprise serta orkestrasi Modular Monolith modern.',
    highlights: [
      'Merancang dan menyerahkan sistem approval terpusat untuk 80+ aplikasi dengan dynamic custom workflow serta kontrol key-value pair & dictionary yang adaptif.',
      'Mengembangkan arsitektur Modular Monolith enterprise menggunakan RabbitMQ, Elsa Workflow, API Gateway, dynamic schema, dynamic forms, structured logging, dan sistem autentikasi terintegrasi.',
    ],
    stack: ['.NET', 'Modular Monolith', 'Elsa Workflow', 'RabbitMQ', 'API Gateway', 'SQL Server'],
    relatedConceptIds: ['ID-029', 'ID-033', 'ID-070', 'ID-071'],
  },
  {
    id: 'exp-mindsoci',
    role: 'AI Tech Lead',
    company: 'MindSoci Singapore',
    period: 'Januari 2026 – Sekarang',
    location: 'Singapura (Remote)',
    sector: 'Konsultansi AI & MLOps',
    employmentType: 'Leadership',
    summary:
      'Membangun perusahaan fokus AI bersama rekan di Singapura, memimpin arsitektur hingga rilis produksi RAG pipelines dan aplikasi LLM bagi klien regional.',
    highlights: [
      'Memimpin siklus hidup penuh solusi AI klien dari perancangan arsitektur hingga RAG pipelines dan aplikasi LLM siap produksi.',
      'Menetapkan praktik MLOps CI/CD untuk deployment model, versioning, dan monitoring performa secara konsisten.',
      'Membimbing engineer baru lewat design discussion, code review, dan sprint planning, sekaligus menjadi jembatan teknis antara CEO, tim produk, dan klien.',
    ],
    stack: ['RAG Pipelines', 'MLOps', 'Python', 'CI/CD', 'Cloud Infrastructure'],
    relatedConceptIds: ['ID-002', 'ID-003', 'ID-007', 'ID-085'],
  },
  {
    id: 'exp-inhealth',
    role: 'Software Engineer',
    company: 'PT. Asuransi Jiwa Inhealth Indonesia (Mandiri Inhealth)',
    period: 'Mei 2025 – Desember 2025',
    location: 'Jakarta, Indonesia',
    sector: 'Asuransi Kesehatan & Healthcare',
    employmentType: 'Full-Time',
    summary:
      'Membangun layanan Notification dan Request Approval yang adaptif serta pengembangan full-stack sistem New MiCare.',
    highlights: [
      'Mengusulkan, merancang, dan menyerahkan layanan Notification dan Request Approval adaptif untuk lingkungan enterprise yang sudah berjalan.',
      'Menyusun sprint timeline dan pengembangan full-stack New MiCare menggunakan .NET, ReactJS, Docker, dan otomasi CI/CD.',
      'Menerapkan unit test dan TDD untuk menekan human error dan masalah deployment seiring bertambahnya anggota tim developer.',
    ],
    stack: ['.NET', 'ReactJS', 'Docker', 'CI/CD', 'xUnit / TDD'],
    relatedConceptIds: ['ID-041', 'ID-038', 'ID-039', 'ID-073'],
  },
  {
    id: 'exp-delmon',
    role: 'Freelance Mobile Developer (Digital Task Management)',
    company: 'Delmon Group of Companies',
    period: 'Mei 2025 – Juni 2025',
    location: 'Arab Saudi (Remote)',
    sector: 'Enterprise Mobile & Produktivitas Lapangan',
    employmentType: 'Freelance',
    summary:
      'Membangun ulang aplikasi mobile Office Anywhere (o-anywhere) dari nol menggunakan .NET MAUI 9 dengan dukungan 80% bahasa Arab (RTL) dan dynamic form Form.io.',
    highlights: [
      'Menggantikan aplikasi legacy Flutter dengan .NET MAUI 9 dan Syncfusion Toolkit dengan konfigurasi tata letak Right-to-Left (RTL).',
      'Mengintegrasikan parser JSON Form.io untuk merender komponen UI secara dinamis (parent-child, conditional state, dan validasi real-time).',
      'Menghadirkan transisi halus, skeleton loading, dan perlindungan berlapis untuk data sensitif.',
    ],
    stack: ['.NET MAUI 9', 'C#', 'Form.io JSON', 'Syncfusion', 'Arabic RTL'],
    relatedConceptIds: ['ID-071', 'ID-054', 'ID-036', 'ID-084'],
  },
  {
    id: 'exp-360adaro',
    role: 'Software Architect',
    company: 'PT. 360 Consulting',
    clientContext: 'Penempatan di PT. Saptaindra Sejati (PT. Adaro Energy Tbk)',
    period: 'Januari 2025 – April 2025',
    location: 'Indonesia',
    sector: 'Pertambangan Batubara & Alat Berat',
    employmentType: 'Konsultan / Penempatan',
    summary:
      'Merancang arsitektur Lubricant Management System (.NET 8 Web + .NET MAUI Mobile) untuk kontraktor tambang batubara PT. Saptaindra Sejati di bawah PT. Adaro Energy Tbk.',
    highlights: [
      'Merancang arsitektur sistem dan skema database menggunakan Miro dan dbDiagram lalu mempresentasikannya ke Project Owner.',
      'Menyusun rekomendasi teknologi, batas ruang lingkup, timeline proyek, serta dokumentasi resmi SDD dan FSD.',
    ],
    stack: ['.NET 8', '.NET MAUI', 'SQL Server', 'Miro', 'dbDiagram', 'SDD / FSD'],
    relatedConceptIds: ['ID-053', 'ID-057', 'ID-058', 'ID-034'],
  },
  {
    id: 'exp-amman',
    role: 'Senior .NET Engineer',
    company: 'PT. Akal Karya Indonesia & PT. MSBU Konsultan Indonesia',
    clientContext: 'Penempatan di PT Amman Mineral Nusa Tenggara',
    period: 'Februari 2023 – Januari 2025',
    location: 'Indonesia',
    sector: 'Pertambangan Emas & Tembaga',
    employmentType: 'Konsultan / Penempatan',
    summary:
      'Memimpin pengembangan penuh sistem Meals Online dan QC Inspection (.NET 6 ke .NET 8 Web + .NET MAUI Mobile) di perusahaan tambang emas & tembaga terbesar kedua di Indonesia.',
    highlights: [
      'Merancang arsitektur, skema database, dan mockup Figma untuk sistem Meals Online dan QC Inspection.',
      'Melakukan migrasi runtime dari .NET 6 ke .NET 8 LTS untuk web dan .NET MAUI mobile, terintegrasi dengan Azure AD & Azure B2C.',
      'Menyiapkan pipeline Azure CI/CD dengan deteksi kerentanan, deployment swap Windows Server, rilis Apple TestFlight/App Store, dan Google Play Console.',
      'Menyusun dokumentasi UAT/FSD serta memimpin sesi pelatihan pengguna di departemen terkait.',
    ],
    stack: ['.NET 8', '.NET MAUI', 'Azure AD / B2C', 'Azure DevOps CI/CD', 'TestFlight', 'Google Play', 'Figma'],
    relatedConceptIds: ['ID-054', 'ID-056', 'ID-094', 'ID-081'],
  },
  {
    id: 'exp-ocbc',
    role: 'Freelance API Developer (OCBC File Encryption)',
    company: 'Total eBiz Solutions',
    period: 'Januari 2023 – Februari 2023',
    location: 'Singapura (Remote)',
    sector: 'Perbankan & Keamanan Finansial',
    employmentType: 'Freelance',
    summary:
      'Membangun SOAP API terintegrasi untuk enkripsi dan dekripsi file sesuai standar OCBC Bank yang menghubungkan portal klien ke sistem OCBC.',
    highlights: [
      'Mengimplementasikan alur enkripsi dan dekripsi file perbankan yang mematuhi spesifikasi keamanan ketat OCBC Bank.',
    ],
    stack: ['.NET', 'SOAP API', 'Banking Cryptography', 'XML'],
    relatedConceptIds: ['ID-012', 'ID-017', 'ID-067', 'ID-015'],
  },
  {
    id: 'exp-sipatuh',
    role: 'Freelance Software Developer',
    company: 'Sipatuh Gelang Indonesia',
    period: 'Agustus 2022 – November 2022',
    location: 'Indonesia',
    sector: 'Travel Haji & Umrah + Investasi Emas',
    employmentType: 'Freelance',
    summary:
      'Membangun sistem manajemen travel Haji & Umrah berbasis tabungan investasi emas dari nol menggunakan MERN stack + Next.js + TypeScript.',
    highlights: [
      'Merancang arsitektur, skema database, RESTful API, antarmuka Next.js ramah SEO, serta dokumentasi SDD & UAT.',
      'Memungkinkan calon jamaah mendanai keberangkatan Haji dan Umrah melalui skema tabungan emas terstruktur.',
    ],
    stack: ['Next.js', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    relatedConceptIds: ['ID-016', 'ID-100', 'ID-013', 'ID-099'],
  },
  {
    id: 'exp-traxia',
    role: 'Senior .NET Developer',
    company: 'PT Digitalinstincts Teknologi (Traxia)',
    period: 'September 2021 – Februari 2023',
    location: 'Jakarta, Indonesia',
    sector: 'Software Studio Multi-Produk & AI',
    employmentType: 'Full-Time',
    summary:
      'Mengembangkan Survee (sinkronisasi data offline-online), TheSocialClub Indonesia (influencer broker), RoadTek (GPS/dashcam), microservices Traxia-6, dan AI worker sentimen berbasis Python.',
    highlights: [
      'Memimpin tim beranggotakan 3 orang dalam merilis platform broker influencer TheSocialClub Indonesia dengan Xamarin dan .NET 6.',
      'Mengintegrasikan AI worker Python (PyTorch, NumPy, Matplotlib) ke microservices untuk analisis sentimen manusia dari teks dan suara.',
      'Memelopori adopsi pertama Docker Compose dan Kubernetes perusahaan, membuat internal NuGet packages, serta menerapkan TDD.',
    ],
    stack: ['.NET 6', 'Xamarin', 'Docker', 'Kubernetes', 'Python', 'PyTorch', 'Azure DevOps'],
    relatedConceptIds: ['ID-084', 'ID-104', 'ID-050', 'ID-085', 'ID-072'],
  },
  {
    id: 'exp-trop',
    role: '.NET Developer',
    company: 'PT Solusi Teknologi Transportasi (TROP Indonesia)',
    period: 'Agustus 2019 – September 2021',
    location: 'Jakarta, Indonesia',
    sector: 'Logistik & Marketplace Trucking',
    employmentType: 'Full-Time',
    summary:
      'Engineer inti dalam startup logistik beranggotakan 4 orang yang membangun 3 web portal dan 1 aplikasi mobile multi-platform untuk mempertemukan pengirim barang dengan armada truk.',
    highlights: [
      'Merilis backend .NET 5, 3 portal web, dan aplikasi Xamarin Forms dengan pelacakan lokasi langsung via Google Geocoding API serta autentikasi OAuth2.',
      'Mengelola Azure Portal, server deployment, code review, timeline untuk CTO, dan membimbing developer junior menerapkan prinsip SOLID.',
    ],
    stack: ['.NET 5', 'Xamarin Forms', 'Google Geocoding API', 'OAuth2', 'Azure'],
    relatedConceptIds: ['ID-045', 'ID-046', 'ID-051', 'ID-052'],
  },
  {
    id: 'exp-reycom',
    role: 'Freelance Software Developer',
    company: 'PT Reycom Document Solusi',
    period: 'Januari 2019 – Februari 2019',
    location: 'Jakarta, Indonesia',
    sector: 'Otomasi Dokumen & Percetakan',
    employmentType: 'Freelance',
    summary:
      'Membangun sistem manajemen cetak berbasis database yang mengekstrak data langsung ke template dokumen korporat lengkap dengan logo dan tanda tangan.',
    highlights: [
      'Mengotomasi ekstraksi data dari SQL database ke format template cetak perusahaan dengan tata letak presisi.',
    ],
    stack: ['.NET', 'SQL Server', 'Template Engine', 'Document Automation'],
    relatedConceptIds: ['ID-037', 'ID-030', 'ID-108'],
  },
  {
    id: 'exp-codelabs',
    role: 'Freelance Software Developer',
    company: 'PT Digital Angkasa Indonesia (CodeLabs Indonesia)',
    period: 'September 2018 – Desember 2018',
    location: 'Indonesia',
    sector: 'Kesehatan & Otomotif Digital',
    employmentType: 'Freelance',
    summary:
      'Mengerjakan peningkatan fitur pada platform konsumen berskala besar: website Siloam Hospital, website & aplikasi mobile Astra Otoparts, serta website Shop & Drive.',
    highlights: [
      'Menyerahkan penyempurnaan fungsionalitas dan stabilitas di properti digital rumah sakit dan ritel otomotif nasional.',
    ],
    stack: ['.NET', 'Web & Mobile Enhancements', 'REST APIs'],
    relatedConceptIds: ['ID-039', 'ID-106', 'ID-021'],
  },
  {
    id: 'exp-sukanda',
    role: 'Senior Staff Software Engineer',
    company: 'PT Sukanda Djaya (Diamond Cold Storage)',
    period: 'Februari 2018 – September 2018',
    location: 'Jakarta, Indonesia',
    sector: 'Distribusi FMCG Cold-Chain',
    employmentType: 'Full-Time',
    summary:
      'Mengembangkan dan memelihara DataGate, sistem manajemen data inti yang mengukur KPI pimpinan cabang di 18 cabang seluruh Indonesia.',
    highlights: [
      'Mengembangkan laporan stock-taking, pemantauan kebersihan gudang, laporan pemusnahan stok, pemeringkatan cabang terbaik bulanan, serta fitur impor data Excel.',
    ],
    stack: ['.NET', 'SQL Server', 'Excel / EPPlus', 'Enterprise Reporting'],
    relatedConceptIds: ['ID-032', 'ID-047', 'ID-087', 'ID-049'],
  },
  {
    id: 'exp-inet',
    role: '.NET Developer',
    company: 'PT Inet Global Indo',
    period: 'Mei 2016 – Januari 2018',
    location: 'Jakarta, Indonesia',
    sector: 'Pemerintahan, Kepolisian, ERP & POS',
    employmentType: 'Full-Time',
    summary:
      'Membangun beragam sistem produksi dari pemerintahan, lapas, ERP, sales force, hingga POS ritel pada fondasi awal karier.',
    highlights: [
      'Membangun sistem pelacakan pengunjung untuk POLRI dan POLDA Metro Jaya (Subdit Reskrimsus) dengan face detection, scan kartu RFID, scan KTP, dan survei wajib.',
      'Mengembangkan Iwartelsus untuk Lapas Nusa Kambangan — platform saldo dompet warga binaan untuk kebutuhan makanan, minuman, dan komunikasi keluarga.',
      'Membangun Simplified Integrated ERP (HR, finance, legal, sales + RDLC), Employee Management System terintegrasi Fingerprint, SFMCS sales force, Cafe POS, serta eForeignWorkers / SolusiPembantu.',
    ],
    stack: ['.NET Framework', 'C#', 'WPF / WinForms', 'RDLC', 'RFID / Face Detection', 'SQL Server'],
    relatedConceptIds: ['ID-066', 'ID-022', 'ID-031', 'ID-083'],
  },
];
