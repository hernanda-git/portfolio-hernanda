import type { Language } from '../i18n/LanguageContext';

export interface LocalizedText {
  en: string;
  id: string;
}

export interface LocalizedList {
  en: string[];
  id: string[];
}

export type EmploymentType =
  | 'Full-Time'
  | 'Founder'
  | 'Leadership'
  | 'Konsultan / Penempatan'
  | 'Freelance';

export interface ExperienceItem {
  id: string;
  role: LocalizedText;
  company: string;
  clientContext?: LocalizedText;
  period: LocalizedText;
  location: LocalizedText;
  sector: LocalizedText;
  employmentType: EmploymentType;
  highlights: LocalizedList;
  link?: {
    url: string;
    label: LocalizedText;
  };
  stack: string[];
  relatedConceptIds: string[];
}

export interface SkillGroup {
  category: LocalizedText;
  items: string[];
}

export const PROFILE = {
  name: 'Muhammad Hernanda',
  monogram: 'MH',
  title: {
    en: 'IT Consultant & Principal Software Engineer (10+ Years)',
    id: 'IT Consultant & Principal Software Engineer (10+ Tahun)',
  },
  subtitle: {
    en: 'Multi-role software engineer specializing in .NET architecture, enterprise systems, and AI engineering workflows since 2016',
    id: 'Software engineer lintas peran dengan spesialisasi arsitektur .NET, sistem enterprise, dan AI engineering workflow sejak 2016',
  },
  location: 'Jakarta, Indonesia',
  timezone: 'WIB (UTC+7)',
  email: 'm.hernanda95@gmail.com',
  phone: '+62-81280031995',
  linkedin: 'https://linkedin.com/in/m-hernanda',
  linkedinLabel: 'linkedin.com/in/m-hernanda',
  githubAiLibrary: 'https://github.com/hernanda-git/ai-knowledge-library',
  activeSince: 2016,
  summary: {
    en: [
      'I have been building production software since 2016, centered around the Microsoft and .NET ecosystem while regularly stepping across Solution Architecture, DevOps, System Analysis, Data Engineering, and Release Management.',
      'My work spans banking, mining, insurance, logistics, government, cold-chain distribution, civic platforms, and early-stage startups. I care about keeping interfaces clean and fast for end users without cutting corners on architectural discipline like SOLID and KISS, because clean structure saves real money and time later.',
      'Today, most of my delivery runs through a personal AI-assisted engineering workflow and pipeline that speeds up exploration, implementation, and iteration from end to end. Architecture decisions, security boundaries, code review, and runtime verification still stay firmly in my hands, and I stay open to talking through technical problems directly before formal interview rounds.',
    ],
    id: [
      'Saya membangun perangkat lunak produksi sejak 2016 dengan fokus utama di ekosistem Microsoft dan .NET, sambil rutin menangani irisan peran Solution Architect, DevOps, System Analyst, Data Engineer, hingga Release Manager.',
      'Pengalaman saya mencakup perbankan, pertambangan, asuransi, logistik, pemerintahan, distribusi cold-chain, layanan warga, dan startup tahap awal. Saya terbiasa menjaga UI/UX tetap ringan dan mudah dipakai tanpa mengorbankan integritas arsitektur seperti prinsip SOLID dan KISS agar biaya serta waktu pengembangan tetap efisien.',
      'Saat ini sebagian besar proses delivery saya berjalan lewat workflow dan pipeline berbasis AI yang saya racik sendiri untuk mempercepat riset, implementasi, dan iterasi secara menyeluruh. Keputusan arsitektur, batas keamanan, review kode, dan verifikasi sistem tetap saya pegang penuh, dan saya terbuka untuk berdiskusi teknis langsung sebelum masuk ke tahap wawancara formal.',
    ],
  },
  credibilityStatement: {
    en: 'This portfolio keeps verified production experience (2016 to 2026) strictly separate from the Indonesian Digital Product Atlas concepts, which are architecture and UI/UX explorations rather than deployed client systems.',
    id: 'Portofolio ini memisahkan secara tegas rekam jejak karier produksi (2016 hingga 2026) dari seluruh konsep di Atlas Produk Digital Indonesia yang bersifat eksplorasi arsitektur dan UI/UX, bukan sistem klien yang sudah di-deploy.',
  },
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: { en: 'Architecture & System Design', id: 'Arsitektur & System Design' },
    items: ['Monolith', 'Modular Monolith', 'Microservices', 'Event-Driven', 'Offline-First Mobile'],
  },
  {
    category: { en: 'Frameworks & Runtimes', id: 'Framework & Runtime' },
    items: ['.NET 8 / 9', '.NET Core', '.NET Framework', '.NET MAUI', 'Xamarin', 'WPF', 'WinForms', 'Blazor', 'React', 'Next.js', 'AngularJS'],
  },
  {
    category: { en: 'Programming Languages', id: 'Bahasa Pemrograman' },
    items: ['C#', 'TypeScript', 'JavaScript', 'T-SQL', 'Python', 'Go', 'XAML', 'XML', 'jQuery', 'VB', 'C', 'C++'],
  },
  {
    category: { en: 'Backend, Messaging & Workflow', id: 'Backend, Messaging & Workflow' },
    items: ['RabbitMQ', 'Elsa Workflow', 'SignalR', 'Dapper', 'MediatR', 'AutoMapper', 'Refit', 'EPPlus', 'Aspose', 'Firebase', 'Supabase'],
  },
  {
    category: { en: 'AI Engineering & Pipelines', id: 'AI Engineering & Pipeline' },
    items: ['Custom Inference Gateway', 'RAG Pipelines', 'MLOps', 'Provider Pooling', 'LoRA Fine-Tuning', 'Agentic Workflows'],
  },
  {
    category: { en: 'UI & Component Libraries', id: 'UI & Component Library' },
    items: ['Tailwind CSS', 'Bootstrap', 'Telerik', 'DevExpress', 'Syncfusion', 'Community Toolkit', 'Bunifu', 'Uranium'],
  },
  {
    category: { en: 'Databases & Data Modeling', id: 'Database & Data Modeling' },
    items: ['SQL Server', 'PostgreSQL', 'MongoDB', 'SQLite', 'Supabase', 'Neon', 'dbDiagram'],
  },
  {
    category: { en: 'Cloud, DevOps & Observability', id: 'Cloud, DevOps & Observability' },
    items: ['Azure App Service', 'Azure Functions', 'Azure Cosmos DB', 'Azure DevOps', 'Azure AD / B2C', 'Docker', 'Kubernetes', '.NET Aspire', 'Serilog', 'Log4Net'],
  },
  {
    category: { en: 'API, Testing & Quality', id: 'API, Testing & Quality' },
    items: ['REST', 'gRPC', 'SOAP', 'OAuth2 / JWT', 'xUnit', 'NUnit', 'SonarQube'],
  },
  {
    category: { en: 'Design, Planning & Delivery', id: 'Desain, Perencanaan & Delivery' },
    items: ['Figma', 'Miro', 'Notion', 'Draw.io', 'Visio', 'Visual Paradigm', 'Balsamiq', 'Jira', 'Trello', 'Power BI', 'Tableau'],
  },
  {
    category: { en: 'Version Control & Mobile Release', id: 'Version Control & Mobile Release' },
    items: ['Git', 'GitLab', 'Bitbucket', 'Azure TFS', 'Apple TestFlight', 'Google Play Console'],
  },
  {
    category: { en: 'Additional Ecosystems', id: 'Ekosistem Tambahan' },
    items: ['Laravel', 'CodeIgniter', 'Flutter', 'React Native', 'Ionic', 'Android Studio', 'Xcode', 'WordPress'],
  },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-grcboard',
    role: {
      en: 'Senior Backend Engineer',
      id: 'Senior Backend Engineer',
    },
    company: 'PT. Mitra Seribu Saudara (GRC Board)',
    period: {
      en: 'May 2026 - Present',
      id: 'Mei 2026 - Sekarang',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Enterprise Distribution & Internal AI Infrastructure',
      id: 'Distribusi Enterprise & Infrastruktur AI Internal',
    },
    employmentType: 'Full-Time',
    link: {
      url: 'https://github.com/hernanda-git/ai-knowledge-library',
      label: {
        en: 'Open AI Knowledge Library on GitHub',
        id: 'Buka AI Knowledge Library di GitHub',
      },
    },
    highlights: {
      en: [
        'Handle backend engineering for the company B2B and B2C products while driving internal AI infrastructure initiatives backed by leadership.',
        'Built an internal .NET AI inference gateway from scratch with multi-provider pooling, model routing, context compression, RBAC usage governance, and strict sensitive-data filtering.',
        'Created Tourmaline, an internal web-deployable knowledge workspace modeled after Obsidian, alongside a customized agent runtime supporting continuous updates, vision capabilities, browser automation, and concurrent multi-branch agent workspaces.',
        'Experimented with Qwen benchmarking, custom LoRA training, vector memory caching, internal company chatbots, and continuous blue-team security monitoring workflows.',
        'Rebuilt the company meeting room and vehicle reservation platforms to clean up legacy booking conflicts.',
        'Engineered a company-wide budget management and expense tracking system from scratch, incorporating probability-weighted forecasting using linear algebra across flexible cost groupings.',
      ],
      id: [
        'Menangani pengembangan backend untuk produk B2B dan B2C perusahaan sekaligus memimpin inisiatif infrastruktur AI internal dengan dukungan penuh manajemen.',
        'Membangun AI inference gateway berbasis .NET dari nol dengan provider pooling, model routing, kompresi konteks, tata kelola kuota RBAC, serta filter ketat untuk mencegah kebocoran data sensitif.',
        'Mengembangkan Tourmaline, workspace pengetahuan internal berbasis web yang terinspirasi dari Obsidian, berdampingan dengan runtime agent kustom yang mendukung pembaruan berkelanjutan, agent vision, otomasi browser, serta workspace multi-branch paralel.',
        'Mengerjakan benchmarking Qwen, pelatihan LoRA mandiri, caching memori vektor, chatbot internal perusahaan, serta workflow pemantauan keamanan blue-team berkelanjutan.',
        'Merombak ulang sistem reservasi ruang rapat dan kendaraan operasional perusahaan agar lebih tertib dan bebas bentrok jadwal.',
        'Membangun sistem manajemen dan pelacakan anggaran perusahaan dari nol, dilengkapi proyeksi pengeluaran berbasis probabilitas menggunakan aljabar linear untuk berbagai skenario pengelompokan biaya.',
      ],
    },
    stack: ['.NET', 'C#', 'B2B/B2C Backend', 'AI Inference Gateway', 'Hermes Agent', 'Tourmaline', 'LoRA', 'Linear Algebra Forecasting'],
    relatedConceptIds: ['ID-001', 'ID-004', 'ID-006', 'ID-077'],
  },
  {
    id: 'exp-wargadigital',
    role: {
      en: 'Founder & Sole Engineer',
      id: 'Founder & Sole Engineer',
    },
    company: 'Warga Digital (warga-digital.com)',
    period: {
      en: 'May 2026 - Present',
      id: 'Mei 2026 - Sekarang',
    },
    location: {
      en: 'Indonesia',
      id: 'Indonesia',
    },
    sector: {
      en: 'Civic Tech & Neighborhood SaaS',
      id: 'Civic Tech & SaaS Lingkungan RT/RW',
    },
    employmentType: 'Founder',
    highlights: {
      en: [
        'Conceived, built, and shipped a mobile-first RT/RW neighborhood management platform from scratch.',
        'Owned every layer of the product across system architecture, database modeling, backend APIs, frontend UX, and production deployment.',
        'Built resident directory workflows and transparent neighborhood treasury tracking (kas RT) tailored for everyday community admins.',
        'Implemented Supabase with custom JWT authentication to balance data isolation, security, and low operational overhead.',
        'Opened a neighborhood directory for local MSMEs and household services while keeping the interface straightforward for non-technical residents.',
      ],
      id: [
        'Merancang, membangun, dan meluncurkan platform manajemen lingkungan RT/RW berbasis mobile-first dari nol.',
        'Menangani seluruh lapisan codebase secara mandiri, mulai dari arsitektur sistem, skema database, backend, frontend, hingga deployment produksi.',
        'Membangun fitur inti pendataan warga dan transparansi kas RT yang praktis dipakai pengurus lingkungan sehari-hari.',
        'Menggunakan Supabase dan custom JWT auth untuk menjaga keamanan akses sekaligus efisiensi operasional.',
        'Menghadirkan direktori UMKM dan jasa rumah tangga warga dengan alur UI/UX yang sederhana bagi pengguna non-teknis.',
      ],
    },
    stack: ['Supabase', 'Custom JWT', 'Mobile-First Web', 'PostgreSQL', 'TypeScript'],
    relatedConceptIds: ['ID-060', 'ID-062', 'ID-024', 'ID-107'],
  },
  {
    id: 'exp-trakindo',
    role: {
      en: 'Software Engineer',
      id: 'Software Engineer',
    },
    company: 'PT. Tiara Marga Trakindo (Mitra Solusi Telematika)',
    period: {
      en: 'January 2026 - May 2026',
      id: 'Januari 2026 - Mei 2026',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Industrial Conglomerate & Enterprise Workflow',
      id: 'Konglomerasi Industri & Enterprise Workflow',
    },
    employmentType: 'Full-Time',
    highlights: {
      en: [
        'Designed and delivered a centralized approval platform spanning 80+ internal applications with configurable approval flows and adaptive key-value form layouts.',
        'Worked inside a modular monolith enterprise architecture combining RabbitMQ messaging, Elsa Workflow orchestration, API Gateway routing, dynamic schemas, structured audit logging, and unified authentication.',
        'Kept executive approval screens clean and predictable even when underlying request payloads differed widely across subsidiaries.',
      ],
      id: [
        'Merancang dan menghadirkan sistem approval terpusat untuk lebih dari 80 aplikasi internal dengan alur persetujuan dinamis dan kontrol form key-value yang adaptif.',
        'Bekerja pada arsitektur Modular Monolith enterprise dengan orkestrasi RabbitMQ, Elsa Workflow, API Gateway, skema data dan form dinamis, audit logging terpusat, serta autentikasi terintegrasi.',
        'Menjaga pengalaman persetujuan eksekutif tetap ringkas dan konsisten meskipun struktur payload setiap aplikasi anak perusahaan berbeda jauh.',
      ],
    },
    stack: ['.NET', 'Modular Monolith', 'Elsa Workflow', 'RabbitMQ', 'API Gateway', 'SQL Server'],
    relatedConceptIds: ['ID-029', 'ID-033', 'ID-070', 'ID-071'],
  },
  {
    id: 'exp-mindsoci',
    role: {
      en: 'AI Tech Lead',
      id: 'AI Tech Lead',
    },
    company: 'MindSoci Singapore',
    period: {
      en: 'January 2026 - Present',
      id: 'Januari 2026 - Sekarang',
    },
    location: {
      en: 'Singapore (Remote)',
      id: 'Singapura (Remote)',
    },
    sector: {
      en: 'AI Engineering & MLOps Advisory',
      id: 'Konsultansi AI & MLOps',
    },
    employmentType: 'Leadership',
    highlights: {
      en: [
        'Co-built an AI-focused engineering practice in Singapore focused on shipping practical client systems rather than throwaway demos.',
        'Led end-to-end delivery of client-facing RAG pipelines and LLM applications, translating messy operational requirements into maintainable services.',
        'Established MLOps standards covering CI/CD model deployment, prompt and model versioning, and runtime performance monitoring.',
        'Guided stack and cloud infrastructure choices based on reliability, latency, and realistic operating budgets.',
        'Mentored new engineers through architecture reviews, code reviews, and sprint planning while acting as the technical bridge between leadership, product, and clients.',
      ],
      id: [
        'Ikut membangun perusahaan rekayasa AI di Singapura yang berfokus pada sistem produksi yang benar-benar dipakai klien, bukan sekadar demo.',
        'Memimpin siklus lengkap solusi AI untuk klien, menerjemahkan kebutuhan bisnis yang kompleks menjadi RAG pipeline dan aplikasi LLM yang terukur.',
        'Menetapkan praktik MLOps di tim, termasuk CI/CD deployment, manajemen versi model dan prompt, serta pemantauan performa di produksi.',
        'Mengarahkan pemilihan framework, tools, dan layanan cloud agar selaras dengan kebutuhan produk dan efisiensi operasional.',
        'Membimbing engineer baru lewat diskusi desain, code review, dan sprint planning, sekaligus menjadi penghubung teknis antara CEO, produk, dan klien.',
      ],
    },
    stack: ['RAG Pipelines', 'MLOps', 'Python', 'CI/CD', 'Cloud Infrastructure'],
    relatedConceptIds: ['ID-002', 'ID-003', 'ID-007', 'ID-085'],
  },
  {
    id: 'exp-inhealth',
    role: {
      en: 'Software Engineer',
      id: 'Software Engineer',
    },
    company: 'PT. Asuransi Jiwa Inhealth Indonesia (Mandiri Inhealth)',
    period: {
      en: 'May 2025 - December 2025',
      id: 'Mei 2025 - Desember 2025',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Health Insurance & Healthcare',
      id: 'Asuransi Kesehatan & Healthcare',
    },
    employmentType: 'Full-Time',
    highlights: {
      en: [
        'Proposed, designed, and shipped an adaptive notification and request-approval service that plugged cleanly into the existing insurance platform.',
        'Mapped out sprint milestones and technical delivery plans for the New MiCare platform.',
        'Built full-stack features with .NET and React, containerized with Docker and wired into automated CI/CD deployment pipelines.',
        'Introduced unit testing and Test-Driven Development practices to cut down regression bugs and release friction as the engineering team grew.',
      ],
      id: [
        'Mengusulkan, merancang, dan merilis layanan notifikasi serta request approval yang adaptif agar dapat langsung menyatu dengan ekosistem produksi yang sudah berjalan.',
        'Menyusun rencana sprint dan tahapan delivery teknis untuk pengembangan sistem New MiCare.',
        'Mengembangkan modul full-stack menggunakan .NET dan React dengan containerisasi Docker serta otomasi pipeline CI/CD.',
        'Menerapkan unit testing dan praktik Test-Driven Development untuk menekan human error dan risiko deployment seiring bertambahnya jumlah developer.',
      ],
    },
    stack: ['.NET', 'React', 'Docker', 'CI/CD', 'TDD / Unit Tests'],
    relatedConceptIds: ['ID-041', 'ID-038', 'ID-039', 'ID-073'],
  },
  {
    id: 'exp-delmon',
    role: {
      en: 'Freelance Mobile Engineer (Digital Task Management)',
      id: 'Freelance Mobile Engineer (Digital Task Management)',
    },
    company: 'Delmon Group of Companies (Saudi Arabia)',
    period: {
      en: 'May 2025 - June 2025',
      id: 'Mei 2025 - Juni 2025',
    },
    location: {
      en: 'Saudi Arabia (Remote)',
      id: 'Arab Saudi (Remote)',
    },
    sector: {
      en: 'Enterprise Mobile & Field Productivity',
      id: 'Enterprise Mobile & Produktivitas Lapangan',
    },
    employmentType: 'Freelance',
    highlights: {
      en: [
        'Rebuilt the Office Anywhere (o-anywhere) mobile app from scratch in .NET MAUI 9, replacing a legacy Flutter codebase.',
        'Delivered full Right-to-Left (RTL) layout behavior with 80% Arabic interface coverage for daily operational task tracking.',
        'Engineered a Form.io JSON parser that dynamically renders .NET MAUI controls with parent-child field dependencies, defaults, and backend API model synchronization.',
        'Polished usability with smooth transitions, skeleton loading, conditional field states, real-time validation, layered security checks, and Syncfusion native controls.',
      ],
      id: [
        'Membangun ulang aplikasi mobile Office Anywhere (o-anywhere) dari nol menggunakan .NET MAUI 9 untuk menggantikan aplikasi Flutter lama.',
        'Menerapkan konfigurasi layout Right-to-Left (RTL) secara menyeluruh dengan cakupan antarmuka 80% Bahasa Arab untuk manajemen tugas operasional.',
        'Mengintegrasikan parser JSON Form.io untuk merender komponen UI .NET MAUI secara dinamis lengkap dengan relasi parent-child, nilai default, dan sinkronisasi payload API backend.',
        'Meningkatkan kualitas UX lewat transisi halaman halus, skeleton loading, validasi real-time, proteksi keamanan berlapis, serta komponen kustom Syncfusion .NET MAUI Toolkit.',
      ],
    },
    stack: ['.NET MAUI 9', 'C#', 'Form.io JSON', 'Syncfusion', 'Arabic RTL'],
    relatedConceptIds: ['ID-071', 'ID-054', 'ID-036', 'ID-084'],
  },
  {
    id: 'exp-360adaro',
    role: {
      en: 'Software Architect',
      id: 'Software Architect',
    },
    company: 'PT. 360 Consulting',
    clientContext: {
      en: 'Client: PT. Saptaindra Sejati (Adaro Energy)',
      id: 'Klien: PT. Saptaindra Sejati (PT. Adaro Energy Tbk)',
    },
    period: {
      en: 'January 2025 - April 2025',
      id: 'Januari 2025 - April 2025',
    },
    location: {
      en: 'Indonesia',
      id: 'Indonesia',
    },
    sector: {
      en: 'Coal Mining & Heavy Equipment',
      id: 'Pertambangan Batubara & Alat Berat',
    },
    employmentType: 'Konsultan / Penempatan',
    highlights: {
      en: [
        'Placed at coal mining contractor PT. Saptaindra Sejati (Adaro Energy Group) to architect the Lubricant Management System.',
        'Designed the system architecture and relational database schema in Miro and dbDiagram, then presented stack and framework recommendations to the Project Owner.',
        'Defined project scope, delivery boundaries, and execution timelines before leading implementation on .NET 8 for web and .NET MAUI for mobile.',
        'Produced weekly and monthly progress reports alongside formal System Design (SDD) and Functional Specification (FSD) documentation.',
      ],
      id: [
        'Ditempatkan di kontraktor tambang batubara PT. Saptaindra Sejati (Grup Adaro Energy) untuk merancang Lubricant Management System.',
        'Menyusun arsitektur sistem dan skema database menggunakan Miro dan dbDiagram, lalu mempresentasikan rekomendasi teknologi dan framework kepada Project Owner.',
        'Merancang timeline, batasan ruang lingkup proyek, serta mengawal implementasi web berbasis .NET 8 dan aplikasi mobile berbasis .NET MAUI.',
        'Menyusun laporan progres mingguan dan bulanan serta dokumen teknis SDD dan FSD.',
      ],
    },
    stack: ['.NET 8', '.NET MAUI', 'SQL Server', 'Miro', 'dbDiagram', 'SDD / FSD'],
    relatedConceptIds: ['ID-053', 'ID-057', 'ID-058', 'ID-034'],
  },
  {
    id: 'exp-amman',
    role: {
      en: 'Senior .NET Engineer',
      id: 'Senior .NET Engineer',
    },
    company: 'PT. Akal Karya Indonesia & PT. MSBU Konsultan Indonesia',
    clientContext: {
      en: 'Client: PT Amman Mineral Nusa Tenggara',
      id: 'Klien: PT Amman Mineral Nusa Tenggara',
    },
    period: {
      en: 'February 2023 - January 2025',
      id: 'Februari 2023 - Januari 2025',
    },
    location: {
      en: 'Indonesia',
      id: 'Indonesia',
    },
    sector: {
      en: 'Gold & Copper Mining Operations',
      id: 'Pertambangan Emas & Tembaga',
    },
    employmentType: 'Konsultan / Penempatan',
    highlights: {
      en: [
        'Placed at PT Amman Mineral Nusa Tenggara, Indonesia second-largest gold and copper mining operation, across nearly two years of continuous delivery.',
        'Architected database schemas, Figma UI mockups, and full web/mobile solutions for Meals Online and QC Inspection while also stabilizing legacy production systems.',
        'Delivered production web apps on .NET 6 and migrated them to .NET 8 LTS alongside .NET MAUI mobile apps, speeding up UI delivery with a curated frontend template.',
        'Configured Azure DevOps CI/CD with vulnerability scanning, integrated Azure AD and Azure B2C employee authentication, and managed Production/Development environment swaps on Windows Server.',
        'Handled end-to-end mobile release operations including Apple Developer signing keys, provisioning profiles, TestFlight builds, and Google Play Console rollouts.',
        'Authored UAT and FSD documents, ran hands-on department training sessions, and maintained improvement backlogs with stakeholders.',
      ],
      id: [
        'Ditempatkan hampir dua tahun di PT Amman Mineral Nusa Tenggara, salah satu tambang emas dan tembaga terbesar di Indonesia.',
        'Merancang arsitektur, skema database, dan mockup Figma untuk sistem Meals Online dan QC Inspection, sekaligus memelihara dan memperbaiki aplikasi legacy yang masih aktif.',
        'Membangun aplikasi web dengan .NET 6 lalu memigrasikannya ke .NET 8 LTS bersama aplikasi mobile .NET MAUI, serta mempercepat produksi UI lewat template frontend yang terkurasi.',
        'Mengatur pipeline Azure DevOps CI/CD dengan pemindaian kerentanan, mengintegrasikan autentikasi Azure AD dan Azure B2C, serta mengelola rilis dan swap environment di Windows Server.',
        'Menangani rilis mobile secara penuh mulai dari signing key dan provisioning profile Apple Developer, distribusi TestFlight iOS, hingga rilis Android di Google Play Console.',
        'Menyusun dokumentasi UAT dan FSD, membawakan sesi pelatihan untuk departemen pengguna, serta mengelola backlog pengembangan lanjutan.',
      ],
    },
    stack: ['.NET 6 / .NET 8', '.NET MAUI', 'Azure AD / B2C', 'Azure DevOps CI/CD', 'TestFlight', 'Google Play', 'Figma'],
    relatedConceptIds: ['ID-054', 'ID-056', 'ID-094', 'ID-081'],
  },
  {
    id: 'exp-ocbc',
    role: {
      en: 'Freelance Integration Engineer (Banking Encryption API)',
      id: 'Freelance Integration Engineer (Banking Encryption API)',
    },
    company: 'Total eBiz Solutions (Singapore)',
    period: {
      en: 'January 2023 - February 2023',
      id: 'Januari 2023 - Februari 2023',
    },
    location: {
      en: 'Singapore (Remote)',
      id: 'Singapura (Remote)',
    },
    sector: {
      en: 'Banking & Financial Security',
      id: 'Perbankan & Keamanan Finansial',
    },
    employmentType: 'Freelance',
    highlights: {
      en: [
        'Built an integrated .NET SOAP API implementing OCBC Bank file encryption and decryption standards to connect the client portal directly with OCBC banking infrastructure.',
      ],
      id: [
        'Membangun SOAP API terintegrasi di .NET untuk enkripsi dan dekripsi file sesuai standar keamanan OCBC Bank guna menghubungkan portal klien dengan sistem perbankan OCBC.',
      ],
    },
    stack: ['.NET', 'SOAP API', 'OCBC Encryption Standards', 'XML'],
    relatedConceptIds: ['ID-012', 'ID-017', 'ID-067', 'ID-015'],
  },
  {
    id: 'exp-sipatuh',
    role: {
      en: 'Freelance Full-Stack Developer',
      id: 'Freelance Full-Stack Developer',
    },
    company: 'Sipatuh Gelang Indonesia (Hajj & Umrah Platform)',
    period: {
      en: 'August 2022 - November 2022',
      id: 'Agustus 2022 - November 2022',
    },
    location: {
      en: 'Indonesia',
      id: 'Indonesia',
    },
    sector: {
      en: 'Hajj & Umrah Travel + Gold Savings',
      id: 'Travel Haji & Umrah + Tabungan Emas',
    },
    employmentType: 'Freelance',
    highlights: {
      en: [
        'Built a Hajj and Umrah travel agency platform from scratch incorporating gold-backed savings management so customers could accumulate travel funds progressively.',
        'Delivered the full stack with MongoDB, Express.js, React, Node.js, Next.js, and TypeScript, focusing on type safety, SEO, and clean REST API design.',
        'Wrote System Design (SDD) and User Acceptance Testing (UAT) documentation and carried out security and reliability testing prior to handoff.',
      ],
      id: [
        'Membangun sistem manajemen agen perjalanan Haji dan Umrah dari nol yang terintegrasi dengan pengelolaan tabungan emas untuk pembiayaan keberangkatan jamaah.',
        'Mengembangkan arsitektur full-stack menggunakan MongoDB, Express.js, React, Node.js, Next.js, dan TypeScript dengan fokus pada type safety, performa, dan SEO.',
        'Menyusun dokumen SDD dan UAT serta melaksanakan pengujian keandalan dan keamanan sistem sebelum serah terima.',
      ],
    },
    stack: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Next.js', 'TypeScript', 'SDD / UAT'],
    relatedConceptIds: ['ID-016', 'ID-100', 'ID-013', 'ID-099'],
  },
  {
    id: 'exp-traxia',
    role: {
      en: 'Senior .NET Developer',
      id: 'Senior .NET Developer',
    },
    company: 'PT Digitalinstincts Teknologi (Traxia)',
    period: {
      en: 'September 2021 - February 2023',
      id: 'September 2021 - Februari 2023',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Multi-Product Software Studio & AI',
      id: 'Software Studio Multi-Produk & AI',
    },
    employmentType: 'Full-Time',
    highlights: {
      en: [
        'Led a three-person team delivering TheSocialClub Indonesia (influencer marketplace) on .NET 6 and Xamarin while working directly with the client CTO on product bottlenecks.',
        'Built and maintained Survee (field data collection with offline-online sync and Google subscriptions) and RoadTek (GPS fleet tracking and dashcam management).',
        'Extended Traxia-6 public microservices for media processing and integrated a Python AI worker (PyTorch, NumPy, Matplotlib) for text and voice sentiment analysis.',
        'Introduced the company first adoption of Docker Compose containerization and Kubernetes orchestration, created shared internal NuGet packages, and brought in TDD unit testing.',
        'Mentored junior developers, refactored legacy modules to modern .NET syntax, and maintained client-facing web platforms.',
      ],
      id: [
        'Memimpin tim beranggotakan tiga orang untuk membangun TheSocialClub Indonesia (platform influencer broker) dengan .NET 6 dan Xamarin sambil berdiskusi langsung dengan CTO klien.',
        'Mengembangkan dan memelihara Survee (sistem pengumpulan data lapangan dengan sinkronisasi offline-online dan integrasi langganan Google) serta RoadTek (pelacakan GPS dan dashcam).',
        'Menyempurnakan microservice publik Traxia-6 untuk pemrosesan media serta mengintegrasikan AI worker Python (PyTorch, NumPy, Matplotlib) untuk analisis sentimen teks dan suara.',
        'Memelopori adopsi pertama Docker Compose dan orkestrasi Kubernetes di perusahaan, membuat paket NuGet internal, serta menerapkan unit testing berbasis TDD.',
        'Membimbing programmer junior, melakukan refactoring modul lama ke runtime modern, dan menyusun dokumen UAT.',
      ],
    },
    stack: ['.NET 6', 'Xamarin', 'Docker Compose', 'Kubernetes', 'Python', 'PyTorch', 'Azure DevOps', 'NuGet'],
    relatedConceptIds: ['ID-084', 'ID-104', 'ID-050', 'ID-085', 'ID-072'],
  },
  {
    id: 'exp-trop',
    role: {
      en: '.NET Developer',
      id: '.NET Developer',
    },
    company: 'PT Solusi Teknologi Transportasi (TROP Indonesia)',
    period: {
      en: 'August 2019 - September 2021',
      id: 'Agustus 2019 - September 2021',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Logistics & Trucking Marketplace',
      id: 'Logistik & Marketplace Trucking',
    },
    employmentType: 'Full-Time',
    highlights: {
      en: [
        'Joined a four-person startup team to build a freight trucking marketplace connecting shippers with available fleet capacity.',
        'Delivered three web portals and one cross-platform mobile app using .NET 5 and Xamarin Forms, integrating Google Geocoding API for live shipment tracking.',
        'Implemented OAuth2 authentication, managed Azure deployments and source control, conducted code reviews, and mentored fresh-graduate developers on SOLID practices.',
        'Created UI animation assets in Figma and Adobe Illustrator while coordinating delivery timelines with the CTO in Azure DevOps.',
      ],
      id: [
        'Bergabung dalam tim startup inti beranggotakan empat orang untuk membangun platform marketplace truk yang menghubungkan pemilik barang dengan armada tersedia.',
        'Membangun tiga portal web dan satu aplikasi mobile lintas platform menggunakan .NET 5 dan Xamarin Forms dengan integrasi Google Geocoding API untuk pelacakan lokasi.',
        'Mengimplementasikan autentikasi OAuth2, mengelola deployment di Azure Portal, memimpin code review, serta membimbing developer junior mengenai prinsip SOLID.',
        'Membuat aset visual UI di Figma dan Adobe Illustrator sambil menyusun timeline proyek bersama CTO di Azure DevOps.',
      ],
    },
    stack: ['.NET 5', 'Xamarin Forms', 'Google Geocoding API', 'OAuth2', 'Azure DevOps', 'Figma'],
    relatedConceptIds: ['ID-045', 'ID-046', 'ID-051', 'ID-052'],
  },
  {
    id: 'exp-reycom',
    role: {
      en: 'Freelance Software Developer',
      id: 'Freelance Software Developer',
    },
    company: 'PT Reycom Document Solusi',
    period: {
      en: 'January 2019 - February 2019',
      id: 'Januari 2019 - Februari 2019',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Document Automation & Printing',
      id: 'Otomasi Dokumen & Percetakan',
    },
    employmentType: 'Freelance',
    highlights: {
      en: [
        'Built a database-driven printing management tool that merges live client records into formatted document templates with dynamic branding logos and signatures.',
      ],
      id: [
        'Mengembangkan sistem manajemen pencetakan dokumen untuk mengekstrak data database secara otomatis ke template cetak kustom lengkap dengan logo dan tanda tangan.',
      ],
    },
    stack: ['.NET', 'SQL Server', 'Print Template Engine'],
    relatedConceptIds: ['ID-037', 'ID-030', 'ID-108'],
  },
  {
    id: 'exp-codelabs',
    role: {
      en: 'Freelance Software Developer',
      id: 'Freelance Software Developer',
    },
    company: 'PT Digital Angkasa Indonesia (CodeLabs Indonesia)',
    period: {
      en: 'September 2018 - December 2018',
      id: 'September 2018 - Desember 2018',
    },
    location: {
      en: 'Indonesia',
      id: 'Indonesia',
    },
    sector: {
      en: 'Healthcare & Automotive Digital',
      id: 'Kesehatan & Otomotif Digital',
    },
    employmentType: 'Freelance',
    highlights: {
      en: [
        'Delivered feature upgrades and stability improvements across Siloam Hospitals website, Astra Otoparts web and mobile apps, and the Shop & Drive web platform.',
      ],
      id: [
        'Mengerjakan peningkatan fitur dan perbaikan stabilitas pada website Siloam Hospitals, website dan aplikasi mobile Astra Otoparts, serta website Shop & Drive.',
      ],
    },
    stack: ['.NET', 'Web & Mobile Apps'],
    relatedConceptIds: ['ID-039', 'ID-106', 'ID-021'],
  },
  {
    id: 'exp-sukanda',
    role: {
      en: 'Senior Staff Software Engineer',
      id: 'Senior Staff Software Engineer',
    },
    company: 'PT Sukanda Djaya (Diamond Cold Storage)',
    period: {
      en: 'February 2018 - September 2018',
      id: 'Februari 2018 - September 2018',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'FMCG Cold-Chain Distribution',
      id: 'Distribusi FMCG Cold-Chain',
    },
    employmentType: 'Full-Time',
    highlights: {
      en: [
        'Built and maintained DataGate, a nationwide branch operations and KPI platform spanning 18 distribution branches across Indonesia.',
        'Implemented stock-taking reports, warehouse hygiene audits, stock write-off tracking, monthly branch performance rankings, and bulk Excel data imports.',
      ],
      id: [
        'Mengembangkan dan memelihara DataGate, sistem manajemen data inti dan KPI pimpinan cabang untuk 18 cabang distribusi di seluruh Indonesia.',
        'Menghadirkan laporan stock opname, pemantauan kebersihan gudang, laporan pemusnahan stok, pemeringkatan cabang terbaik bulanan, serta fitur impor massal Excel.',
      ],
    },
    stack: ['.NET', 'SQL Server', 'Excel Import', 'Enterprise KPI Reporting'],
    relatedConceptIds: ['ID-032', 'ID-047', 'ID-087', 'ID-049'],
  },
  {
    id: 'exp-inet',
    role: {
      en: '.NET Developer',
      id: '.NET Developer',
    },
    company: 'PT Inet Global Indo',
    period: {
      en: 'May 2016 - January 2018',
      id: 'Mei 2016 - Januari 2018',
    },
    location: {
      en: 'Jakarta, Indonesia',
      id: 'Jakarta, Indonesia',
    },
    sector: {
      en: 'Government, Law Enforcement, ERP & POS',
      id: 'Pemerintahan, Kepolisian, ERP & POS',
    },
    employmentType: 'Full-Time',
    highlights: {
      en: [
        'Built a visitor management system for POLRI and POLDA Metro Jaya (Reskrimsus) integrating face detection, RFID cards, KTP scanning, and mandatory building check-in surveys.',
        'Developed and maintained Iwartelsus for Nusa Kambangan correctional facility, managing inmate wallet balances for canteen purchases and family communication.',
        'Delivered multiple business platforms including Simplified Integrated Platform (ERP with HR, finance, legal, sales, and RDLC reports), SFMCS (sales force field tracking), and fingerprint-linked attendance KPI software.',
        'Built eForeignWorkers and SolusiPembantu agency portals plus a retail cafe POS system supporting laser receipt printing, promotions, and employee subsidies.',
        'Evaluated rapid-prototyping tools including MIT App Inventor and PHPMaker to speed up client PoC turnaround.',
      ],
      id: [
        'Membangun sistem pelacakan pengunjung untuk POLRI dan POLDA Metro Jaya (subdit Reskrimsus) dengan deteksi wajah, pemindaian kartu RFID, pemindaian KTP, dan survei wajib check-in.',
        'Mengembangkan dan memelihara Iwartelsus di Lapas Nusa Kambangan untuk manajemen saldo dompet warga binaan terkait kebutuhan kantin dan komunikasi keluarga.',
        'Menghadirkan berbagai sistem bisnis termasuk Simplified Integrated Platform (ERP untuk HR, keuangan, legal, penjualan, dan laporan RDLC), SFMCS untuk pemantauan tim sales lapangan, serta sistem absensi KPI terintegrasi mesin fingerprint.',
        'Membangun portal agen eForeignWorkers dan SolusiPembantu serta sistem POS kafe dengan cetak struk printer laser, manajemen diskon, dan subsidi karyawan.',
        'Melakukan riset alat rapid prototyping seperti MIT App Inventor dan PHPMaker untuk mempercepat pembuatan PoC klien.',
      ],
    },
    stack: ['.NET Framework', 'C#', 'RDLC', 'RFID / Face Detection', 'Fingerprint', 'SQL Server'],
    relatedConceptIds: ['ID-066', 'ID-022', 'ID-031', 'ID-083'],
  },
];

export function buildResumeMarkdown(lang: Language): string {
  const isEn = lang === 'en';
  const lines: string[] = [
    `# ${PROFILE.name.toUpperCase()}`,
    PROFILE.title[lang],
    '',
    `${PROFILE.location} | ${PROFILE.phone} | ${PROFILE.email} | ${PROFILE.linkedinLabel}`,
    '',
    isEn ? '## Profile Summary' : '## Ringkasan Profil',
    '',
    ...PROFILE.summary[lang].flatMap((p) => [p, '']),
    isEn ? '## Technical Skills' : '## Technical Skills',
    '',
    ...SKILL_GROUPS.map((grp) => `**${grp.category[lang]}:** ${grp.items.join(', ')}`),
    '',
    isEn ? '## Career & Project Experience' : '## Pengalaman Karier & Proyek',
    '',
  ];

  for (const exp of EXPERIENCES) {
    const clientPart = exp.clientContext ? ` (${exp.clientContext[lang]})` : '';
    lines.push(`### ${exp.role[lang]} - ${exp.company}${clientPart}`);
    lines.push(`${exp.period[lang]} | ${exp.location[lang]}`);
    lines.push('');
    for (const h of exp.highlights[lang]) {
      lines.push(`- ${h}`);
    }
    if (exp.link) {
      lines.push(`- ${exp.link.label[lang]}: ${exp.link.url}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim() + '\n';
}
