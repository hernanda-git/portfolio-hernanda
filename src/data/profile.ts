export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  clientContext?: string;
  period: string;
  location: string;
  sector: string;
  employmentType: 'Full-Time' | 'Founder' | 'Leadership' | 'Consultant / Placement' | 'Freelance';
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
  subtitle: 'IT Consultant — 10+ Years Shipping Production Systems Across Indonesia, Singapore & Saudi Arabia',
  location: 'Jakarta, Indonesia',
  timezone: 'WIB (UTC+7)',
  email: 'm.hernanda95@gmail.com',
  phone: '+62-81280031995',
  linkedin: 'https://linkedin.com/in/m-hernanda',
  linkedinLabel: 'linkedin.com/in/m-hernanda',
  activeSince: 2016,
  summary: [
    'Multi-role Software Engineer whose work spans Solution Architecture, DevOps, System Analysis, Data Engineering, Release Management, and AI Inference Engineering — building production Microsoft .NET and cross-platform systems since 2016.',
    'Delivered systems across banking, mining, insurance, cold-chain logistics, law enforcement, correctional facilities, government, and high-growth startups — balancing responsive UI/UX with SOLID, KISS, and cost-effective architecture.',
    'Applies AI pragmatically (roughly 20% leverage in daily engineering) while keeping architectural judgment, verification, and direct technical accountability human-led.',
  ],
  credibilityStatement:
    'This site separates verified production career history (2016–2026, sourced strictly from CV) from the 108 interactive product prototypes in the Indonesian Market Atlas, which are undeployed architectural concepts built to demonstrate breadth, visual design range, and local market fluency.',
  verifiedStats: [
    { label: 'Production tenure', value: '10+ yrs', detail: '2016 – Present' },
    { label: 'Verified engagements', value: '16', detail: 'Enterprise, startup & freelance' },
    { label: 'Real-world sectors', value: '10+', detail: 'Mining, banking, health, gov, AI' },
    { label: 'Concept prototypes', value: '108', detail: '15 sectors · 18 UI archetypes' },
  ],
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
    category: 'Data & Storage',
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
    period: 'May 2026 – Present',
    location: 'Jakarta, Indonesia',
    sector: 'AI Infrastructure & Enterprise Distribution',
    employmentType: 'Full-Time',
    summary:
      'Architecting a company-wide AI inference gateway, provider pooler, and agentic governance layer built from scratch in .NET across all GRC Board Group companies.',
    highlights: [
      'Built a custom inference harness and multi-provider router from scratch in .NET (no fork) supporting OpenAI-compatible, OpenAI Responses, and Anthropic response modes.',
      'Reworked a company-owned Hermes agent (forked from NousResearch) for continuous updates, alongside a reverse-engineered Obsidian integration.',
      'Implemented provider pooling, model mixtures, bot profile management, skill curation, rate/request limiting, and 24/7 agentic red-team security defenders.',
      'Designed local-remote Git workspace governance supporting concurrent multi-session parallel swarms and architect loops.',
    ],
    stack: ['.NET', 'C#', 'AI Gateway', 'OpenAI / Anthropic API', 'Docker', 'Git Governance'],
    relatedConceptIds: ['ID-001', 'ID-004', 'ID-006', 'ID-077'],
  },
  {
    id: 'exp-wargadigital',
    role: 'Founder',
    company: 'Warga Digital (warga-digital.com)',
    period: 'May 2026 – Present',
    location: 'Indonesia',
    sector: 'Civic Tech & Neighborhood SaaS',
    employmentType: 'Founder',
    summary:
      'Founded and shipped a mobile-first RT/RW neighborhood management platform from scratch with full ownership of architecture, backend, frontend, and deployment.',
    highlights: [
      'Built core neighborhood workflows including resident registry management and transparent kas RT (treasury) accounting.',
      'Architected secure, scalable backend with Supabase and custom JWT authentication.',
      'Enabled local MSMEs (UMKM) and household service providers within the neighborhood ecosystem.',
      'Prioritized accessible, intuitive mobile UX tailored for non-technical RT administrators and residents.',
    ],
    stack: ['Supabase', 'Custom JWT', 'Mobile-First Web', 'PostgreSQL', 'TypeScript'],
    relatedConceptIds: ['ID-060', 'ID-062', 'ID-024', 'ID-107'],
  },
  {
    id: 'exp-trakindo',
    role: 'Software Engineer',
    company: 'PT. Tiara Marga Trakindo (Mitra Solusi Telematika)',
    period: 'Jan 2026 – May 2026',
    location: 'Jakarta, Indonesia',
    sector: 'Enterprise Conglomerate & Industrial',
    employmentType: 'Full-Time',
    summary:
      'Engineered centralized cross-application approval workflows and modular-monolith orchestration spanning 80+ enterprise applications.',
    highlights: [
      'Designed and delivered a centralized approval system unifying 80+ applications with dynamic custom workflows and adaptive key-value dictionary controls.',
      'Worked deeply in modular monolith enterprise architecture with RabbitMQ, Elsa Workflow, API Gateway, dynamic schemas, dynamic forms, structured logging, and unified auth.',
    ],
    stack: ['.NET', 'Modular Monolith', 'Elsa Workflow', 'RabbitMQ', 'API Gateway', 'SQL Server'],
    relatedConceptIds: ['ID-029', 'ID-033', 'ID-070', 'ID-071'],
  },
  {
    id: 'exp-mindsoci',
    role: 'AI Tech Lead',
    company: 'MindSoci Singapore',
    period: 'Jan 2026 – Present',
    location: 'Singapore (Remote)',
    sector: 'AI Consulting & MLOps',
    employmentType: 'Leadership',
    summary:
      'Co-built an AI-focused engineering company delivering production RAG pipelines, LLM applications, and MLOps discipline for regional clients.',
    highlights: [
      'Led full lifecycle of client-facing AI products from architecture to production RAG pipelines and LLM systems.',
      'Established MLOps CI/CD practices for model deployment, versioning, and performance monitoring.',
      'Mentored junior engineers through design reviews, code reviews, and sprint planning while bridging CEO, product, and client expectations.',
    ],
    stack: ['RAG Pipelines', 'LLM Ops', 'Python', 'CI/CD', 'Cloud Infrastructure'],
    relatedConceptIds: ['ID-002', 'ID-003', 'ID-007', 'ID-085'],
  },
  {
    id: 'exp-inhealth',
    role: 'Software Engineer',
    company: 'PT. Asuransi Jiwa Inhealth Indonesia (Mandiri Inhealth)',
    period: 'May 2025 – Dec 2025',
    location: 'Jakarta, Indonesia',
    sector: 'Health Insurance & Healthcare',
    employmentType: 'Full-Time',
    summary:
      'Delivered adaptive notification and request-approval microservices and full-stack modules for the New MiCare managed-care platform.',
    highlights: [
      'Proposed, designed, and delivered adaptive Notification and Request Approval services integrated into existing enterprise environments.',
      'Planned sprint delivery timelines for the New MiCare system using .NET, ReactJS, Docker, and automated CI/CD.',
      'Introduced unit testing and TDD practices to cut deployment regressions across a growing engineering team.',
    ],
    stack: ['.NET', 'ReactJS', 'Docker', 'CI/CD', 'xUnit / TDD'],
    relatedConceptIds: ['ID-041', 'ID-038', 'ID-039', 'ID-073'],
  },
  {
    id: 'exp-delmon',
    role: 'Freelance Mobile Developer (Digital Task Management)',
    company: 'Delmon Group of Companies',
    period: 'May 2025 – Jun 2025',
    location: 'Saudi Arabia (Remote)',
    sector: 'Enterprise Mobile & Field Productivity',
    employmentType: 'Freelance',
    summary:
      'Rebuilt the Office Anywhere (o-anywhere) mobile app from scratch in .NET MAUI 9 with 80% Arabic RTL support and dynamic Form.io rendering.',
    highlights: [
      'Replaced legacy Flutter app with native .NET MAUI 9 and Syncfusion controls, supporting Right-to-Left (RTL) Arabic layouts.',
      'Engineered dynamic JSON form parser for Form.io schemas mapping parent-child relationships, conditional states, and real-time validation.',
      'Delivered skeleton loading, animated transitions, and multi-layered sensitive data protection.',
    ],
    stack: ['.NET MAUI 9', 'C#', 'Form.io JSON', 'Syncfusion', 'Arabic RTL'],
    relatedConceptIds: ['ID-071', 'ID-054', 'ID-036', 'ID-084'],
  },
  {
    id: 'exp-360adaro',
    role: 'Software Architect',
    company: 'PT. 360 Consulting',
    clientContext: 'Placed at PT. Saptaindra Sejati (PT. Adaro Energy Tbk)',
    period: 'Jan 2025 – Apr 2025',
    location: 'Indonesia',
    sector: 'Coal Mining & Heavy Equipment',
    employmentType: 'Consultant / Placement',
    summary:
      'Architected the Lubricant Management System (.NET 8 Web + .NET MAUI Mobile) for coal mining contractor PT. Saptaindra Sejati under Adaro Energy.',
    highlights: [
      'Designed system architecture and relational database schema using Miro and dbDiagram and presented technical proposals to Project Owners.',
      'Defined project scope, delivery timelines, technology stack (.NET 8 + .NET MAUI), and formal SDD/FSD documentation.',
    ],
    stack: ['.NET 8', '.NET MAUI', 'SQL Server', 'Miro', 'dbDiagram', 'SDD / FSD'],
    relatedConceptIds: ['ID-053', 'ID-057', 'ID-058', 'ID-034'],
  },
  {
    id: 'exp-amman',
    role: 'Senior .NET Engineer',
    company: 'PT. Akal Karya Indonesia & PT. MSBU Konsultan Indonesia',
    clientContext: 'Placed at PT Amman Mineral Nusa Tenggara',
    period: 'Feb 2023 – Jan 2025',
    location: 'Indonesia',
    sector: 'Gold & Copper Mining',
    employmentType: 'Consultant / Placement',
    summary:
      'Led full-lifecycle delivery of Meals Online and QC Inspection (.NET 6 to .NET 8 Web + .NET MAUI Mobile) for Indonesia’s second-largest gold and copper mine.',
    highlights: [
      'Designed architecture, database schemas, and Figma mockups for Meals Online and QC Inspection systems.',
      'Migrated runtime from .NET 6 to .NET 8 LTS across web and .NET MAUI mobile, integrating Azure AD & Azure B2C.',
      'Configured Azure CI/CD pipelines with vulnerability scanning, Windows Server environment swaps, Apple TestFlight/App Store signing, and Google Play releases.',
      'Authored UAT/FSD documentation and delivered end-user department training.',
    ],
    stack: ['.NET 8', '.NET MAUI', 'Azure AD / B2C', 'Azure DevOps CI/CD', 'TestFlight', 'Google Play', 'Figma'],
    relatedConceptIds: ['ID-054', 'ID-056', 'ID-094', 'ID-081'],
  },
  {
    id: 'exp-ocbc',
    role: 'Freelance API Developer (OCBC File Encryption)',
    company: 'Total eBiz Solutions',
    period: 'Jan 2023 – Feb 2023',
    location: 'Singapore (Remote)',
    sector: 'Banking & Financial Security',
    employmentType: 'Freelance',
    summary:
      'Built an integrated SOAP API implementing OCBC banking encryption/decryption standards bridging client portals with OCBC Bank.',
    highlights: [
      'Engineered compliant file encryption and decryption workflows adhering strictly to OCBC Bank security specifications.',
    ],
    stack: ['.NET', 'SOAP API', 'Banking Cryptography', 'XML'],
    relatedConceptIds: ['ID-012', 'ID-017', 'ID-067', 'ID-015'],
  },
  {
    id: 'exp-sipatuh',
    role: 'Freelance Software Developer',
    company: 'Sipatuh Gelang Indonesia',
    period: 'Aug 2022 – Nov 2022',
    location: 'Indonesia',
    sector: 'Sharia Travel & Gold Investment',
    employmentType: 'Freelance',
    summary:
      'Built a Hajj & Umrah travel management and gold-investment savings platform from scratch using MERN + Next.js + TypeScript.',
    highlights: [
      'Architected database schema, RESTful APIs, SEO-optimized Next.js frontend, and full SDD/UAT documentation.',
      'Enabled pilgrims to fund Hajj and Umrah departures through structured gold-saving plans.',
    ],
    stack: ['Next.js', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    relatedConceptIds: ['ID-016', 'ID-100', 'ID-013', 'ID-099'],
  },
  {
    id: 'exp-traxia',
    role: 'Senior .NET Developer',
    company: 'PT Digitalinstincts Teknologi (Traxia)',
    period: 'Sep 2021 – Feb 2023',
    location: 'Jakarta, Indonesia',
    sector: 'Multi-Product Software Studio & AI',
    employmentType: 'Full-Time',
    summary:
      'Shipped Survee (offline-online field data), TheSocialClub (influencer broker), RoadTek (GPS/dashcam), Traxia-6 microservices, and Python sentiment AI workers.',
    highlights: [
      'Led a 3-person team delivering TheSocialClub Indonesia influencer broker platform in Xamarin and .NET 6.',
      'Integrated a Python AI worker (PyTorch, NumPy, Matplotlib) for text and voice human sentiment analysis into .NET microservices.',
      'Spearheaded the company’s first Docker Compose containerization and Kubernetes orchestration rollout, plus internal NuGet libraries and TDD.',
    ],
    stack: ['.NET 6', 'Xamarin', 'Docker', 'Kubernetes', 'Python', 'PyTorch', 'Azure DevOps'],
    relatedConceptIds: ['ID-084', 'ID-104', 'ID-050', 'ID-085', 'ID-072'],
  },
  {
    id: 'exp-trop',
    role: '.NET Developer',
    company: 'PT Solusi Teknologi Transportasi (TROP Indonesia)',
    period: 'Aug 2019 – Sep 2021',
    location: 'Jakarta, Indonesia',
    sector: 'Logistics & Trucking Marketplace',
    employmentType: 'Full-Time',
    summary:
      'Core engineer in a 4-person logistics startup delivering 3 web portals and 1 multi-platform Xamarin mobile app connecting shippers with available trucks.',
    highlights: [
      'Delivered .NET 5 backend, 3 web portals, and Xamarin Forms app with Google Geocoding live location tracking and OAuth2.',
      'Managed Azure infrastructure, code reviews, CTO timelines, and mentored junior developers in SOLID engineering.',
    ],
    stack: ['.NET 5', 'Xamarin Forms', 'Google Geocoding API', 'OAuth2', 'Azure'],
    relatedConceptIds: ['ID-045', 'ID-046', 'ID-051', 'ID-052'],
  },
  {
    id: 'exp-reycom',
    role: 'Freelance Software Developer',
    company: 'PT Reycom Document Solusi',
    period: 'Jan 2019 – Feb 2019',
    location: 'Jakarta, Indonesia',
    sector: 'Document & Print Automation',
    employmentType: 'Freelance',
    summary:
      'Built a database-driven document printing management system generating templated outputs with corporate logos and digital signatures.',
    highlights: [
      'Extracted structured database records directly into customizable corporate print templates with embedded signatures.',
    ],
    stack: ['.NET', 'SQL Server', 'Template Engine', 'Document Automation'],
    relatedConceptIds: ['ID-037', 'ID-030', 'ID-108'],
  },
  {
    id: 'exp-codelabs',
    role: 'Freelance Software Developer',
    company: 'PT Digital Angkasa Indonesia (CodeLabs Indonesia)',
    period: 'Sep 2018 – Dec 2018',
    location: 'Indonesia',
    sector: 'Healthcare & Automotive Digital',
    employmentType: 'Freelance',
    summary:
      'Delivered enhancements across high-traffic consumer platforms including Siloam Hospital website, Astra Otoparts web/mobile, and Shop & Drive.',
    highlights: [
      'Shipped feature improvements across enterprise healthcare and automotive retail properties.',
    ],
    stack: ['.NET', 'Web & Mobile Enhancements', 'REST APIs'],
    relatedConceptIds: ['ID-039', 'ID-106', 'ID-021'],
  },
  {
    id: 'exp-sukanda',
    role: 'Senior Staff Software Engineer',
    company: 'PT Sukanda Djaya (Diamond Cold Storage)',
    period: 'Feb 2018 – Sep 2018',
    location: 'Jakarta, Indonesia',
    sector: 'Cold-Chain FMCG Distribution',
    employmentType: 'Full-Time',
    summary:
      'Developed and maintained DataGate, the national branch KPI and cold-storage operations system serving 18 branches across Indonesia.',
    highlights: [
      'Implemented branch leader KPI scoring, stock-taking reports, warehouse cleanliness monitoring, stock extermination tracking, monthly branch rankings, and Excel ingestion.',
    ],
    stack: ['.NET', 'SQL Server', 'Excel / EPPlus', 'Enterprise Reporting'],
    relatedConceptIds: ['ID-032', 'ID-047', 'ID-087', 'ID-049'],
  },
  {
    id: 'exp-inet',
    role: '.NET Developer',
    company: 'PT Inet Global Indo',
    period: 'May 2016 – Jan 2018',
    location: 'Jakarta, Indonesia',
    sector: 'Government, Law Enforcement, ERP & POS',
    employmentType: 'Full-Time',
    summary:
      'Built mission-critical platforms across government, corrections, retail POS, ERP, and workforce marketplaces during foundational career years.',
    highlights: [
      'Built visitor tracking for POLRI & POLDA Metro Jaya (Reskrimsus) featuring face detection, RFID scanning, KTP scanning, and mandatory check-in forms.',
      'Developed Iwartelsus for Nusa Kambangan prison — an inmate wallet balance, canteen, and family communication platform.',
      'Delivered Simplified Integrated ERP (HR, finance, legal, sales + RDLC), Fingerprint-integrated EMS, SFMCS sales-force system, Cafe POS, and eForeignWorkers / SolusiPembantu.',
    ],
    stack: ['.NET Framework', 'C#', 'WPF / WinForms', 'RDLC', 'RFID / Face Detection', 'SQL Server'],
    relatedConceptIds: ['ID-066', 'ID-022', 'ID-031', 'ID-083'],
  },
];
