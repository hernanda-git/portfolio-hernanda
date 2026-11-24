import type { Language } from './LanguageContext';

export interface UiCopy {
  documentTitle: string;
  notFoundTitle: string;
  notFoundHeading: string;
  backToAtlas: string;
  brandSub: string;
  navAriaLabel: string;
  nav: {
    overview: string;
    atlas: string;
    experience: string;
    architecture: string;
  };
  searchConceptsPlaceholder: (count: number) => string;
  openQuickSearch: string;
  switchToDark: string;
  switchToLight: string;
  switchLanguageAria: string;
  footerSummary: (expCount: number, projCount: number) => string;

  overview: {
    activeSince: (year: number) => string;
    heroDomain: string;
    heroTitle: (count: number) => string;
    exploreAtlasBtn: (count: number) => string;
    viewCareerBtn: string;
    directContactBtn: string;
    stats: {
      prodEngLabel: string;
      prodEngVal: string;
      prodEngDetail: (year: number) => string;
      expLabel: string;
      expVal: (count: number) => string;
      expDetail: string;
      atlasLabel: string;
      atlasVal: (count: number) => string;
      atlasDetail: (screens: number, sectors: number) => string;
      scaleLabel: string;
      scaleVal: string;
      scaleDetail: string;
    };
    credibilityTitle: string;
    verifiedRolesTag: (count: number) => string;
    conceptsNotDeployedTag: (count: number) => string;
    featuredHeading: string;
    viewAllConceptsBtn: (count: number) => string;
    radarHeading: (sectors: number) => string;
    radarDesc: string;
    radarSummaryTag: (projects: number, archetypes: number) => string;
  };

  atlas: {
    searchPlaceholder: (count: number) => string;
    searchAria: string;
    clearSearchAria: string;
    filterBtn: string;
    showingCount: (filtered: number, total: number) => string;
    resetBtn: string;
    viewModeAria: string;
    viewModes: {
      gallery: string;
      matrix: string;
      ecosystem: string;
    };
    lensesAria: string;
    sidebarAria: string;
    sectorTitle: (count: number) => string;
    allSectors: string;
    platformTitle: (count: number) => string;
    allPlatforms: string;
    archetypeTitle: (count: number) => string;
    allArchetypes: string;
    allShort: string;
    emptyTitle: string;
    emptyDesc: (total: number) => string;
    resetAllBtn: string;
    loadingMore: string;
    endOfCatalog: (count: number) => string;
    tableHeaders: {
      id: string;
      concept: string;
      sector: string;
      platform: string;
      archetype: string;
      standards: string;
      stack: string;
    };
    conceptsUnit: (count: number) => string;
    cardPagesUnit: (count: number) => string;
    openCaseStudy: string;
    screenshotAlt: (name: string) => string;
  };

  experience: {
    verifiedCareerTag: string;
    metaSummary: (roles: number, points: number, groups: number) => string;
    copyResumeBtn: string;
    copiedResumeBtn: string;
    downloadResumeBtn: string;
    summaryLabel: string;
    allFilter: string;
    relatedConceptsLabel: string;
    skillsHeading: string;
    skillsDesc: (count: number) => string;
    employmentTypeLabels: Record<string, string>;
  };

  architecture: {
    kicker: string;
    title: string;
    subtitle: string;
    quickJumpPipeline: string;
    quickJumpDecisions: string;
    quickJumpStandards: string;
    quickJumpContact: string;
    pipelineTitle: string;
    pipelineDesc: string;
    aiAcceleratesLabel: string;
    engineerOwnsLabel: string;
    toolsInUseLabel: string;
    decisionsTitle: string;
    decisionsDesc: string;
    whenToUseLabel: string;
    productionAnchorLabel: string;
    standardsTitle: string;
    standardsDesc: (totalProjects: number) => string;
    standardsBadge: string;
    standardsColEcosystem: string;
    standardsColPattern: string;
    standardsColAtlas: string;
    exploreInAtlas: string;
    contactTitle: string;
    contactDesc: string;
    availabilityTag: string;
    contactFields: {
      email: string;
      whatsapp: string;
      linkedin: string;
      location: string;
    };
    briefLabel: string;
    copyBriefBtn: string;
    copiedBriefBtn: string;
  };

  command: {
    dialogAria: string;
    placeholder: (count: number) => string;
    closeAria: string;
    emptyResult: (query: string) => string;
    matchedConcepts: string;
    featuredConcepts: string;
    marketSectors: string;
    filterSectorTag: string;
    careerHistory: string;
    verifiedRoleTag: string;
  };

  prototype: {
    pagesNavAria: string;
    viewModeAria: string;
    enterpriseVerifiedTag: (count: number) => string;
    enterpriseDesignTab: (res: string) => string;
    uiDesignTab: string;
    interactiveProtoTab: string;
    interactiveSimTab: string;
    searchProtoAria: string;
    pageOf: (pos: number, total: number) => string;
    pageBadge: (pos: string, total: string) => string;
    zoomInspectBtn: string;
    zoomHint: (res: string) => string;
    filmstripAria: string;
    previewAlt: (title: string) => string;
    loadingProto: string;
    pagerAria: string;
    aboutPrefix: (name: string) => string;
    problemHeading: string;
    contextHeading: string;
    scopeHeading: string;
    refArchHeading: string;
    archLabels: {
      client: string;
      edge: string;
      core: string;
      integration: string;
      storage: string;
      stack: string;
      standards: string;
    };
    relatedExpBtn: (company: string) => string;
    zoomDialogAria: (name: string, title: string) => string;
    zoomLevelAria: string;
    prevBtn: string;
    nextBtn: string;
    closeEscBtn: string;
    fullResAlt: (name: string, title: string) => string;
  };
}

export const UI_COPY: Record<Language, UiCopy> = {
  en: {
    documentTitle: 'Muhammad Hernanda - Engineering Portfolio & Digital Product Atlas',
    notFoundTitle: 'Page not found - Atlas',
    notFoundHeading: 'Page not found',
    backToAtlas: 'Back to Atlas',
    brandSub: 'Principal .NET, Solution Architect & AI Pipeline | Jakarta',
    navAriaLabel: 'Main navigation',
    nav: {
      overview: 'Overview',
      atlas: 'Product Atlas',
      experience: 'Career',
      architecture: 'Architecture',
    },
    searchConceptsPlaceholder: (count) => `Search ${count} concepts...`,
    openQuickSearch: 'Open quick search',
    switchToDark: 'Switch to dark theme',
    switchToLight: 'Switch to light theme',
    switchLanguageAria: 'Switch language between English and Indonesian',
    footerSummary: (expCount, projCount) =>
      `Production career record (${expCount} roles) kept strictly separate from ${projCount} exploratory digital product concepts.`,

    overview: {
      activeSince: (year) => `Active Since ${year}`,
      heroDomain: '.NET | Solution Architecture | AI Engineering',
      heroTitle: (count) =>
        `Designing resilient enterprise software and mapping ${count} digital product architectures for Indonesia.`,
      exploreAtlasBtn: (count) => `Explore ${count} Product Concepts`,
      viewCareerBtn: 'View Career History (2016 - 2026)',
      directContactBtn: 'Direct Discussion',
      stats: {
        prodEngLabel: 'Production Engineering',
        prodEngVal: '10+ Yrs',
        prodEngDetail: (year) => `${year} to 2026 across enterprises and startups`,
        expLabel: 'Career Track Record',
        expVal: (count) => `${count} Roles`,
        expDetail: 'Fintech, Mining, Insurance, Logistics, AI, GovTech',
        atlasLabel: 'Product Concept Atlas',
        atlasVal: (count) => `${count} Concepts`,
        atlasDetail: (screens, sectors) => `${screens} interactive screens | ${sectors} sectors`,
        scaleLabel: 'Enterprise Scale',
        scaleVal: '80+ Apps',
        scaleDetail: 'Conglomerate approval workflow orchestration',
      },
      credibilityTitle: 'Production Experience vs. Concept Exploration',
      verifiedRolesTag: (count) => `${count} Production Roles`,
      conceptsNotDeployedTag: (count) => `${count} Exploratory Concepts`,
      featuredHeading: 'Featured Prototypes',
      viewAllConceptsBtn: (count) => `View all ${count} concepts`,
      radarHeading: (sectors) => `Indonesian Digital Economy Atlas - ${sectors} Market Sectors`,
      radarDesc:
        'Each sector maps real Indonesian infrastructure and regulatory standards (QRIS Tap, BI-FAST, SATUSEHAT, CoreTax, UU PDP, RKAB/SIMBARA, IDXCarbon, BPJPH, SPBE). Select any sector to filter matching concepts.',
      radarSummaryTag: (projects, archetypes) => `${projects} Concepts | ${archetypes} UI Archetypes`,
    },

    atlas: {
      searchPlaceholder: (count) =>
        `Filter ${count} concepts by name, QRIS, SATUSEHAT, CoreTax, UU PDP, .NET, mining...`,
      searchAria: 'Filter product concepts',
      clearSearchAria: 'Clear search',
      filterBtn: 'Filters',
      showingCount: (filtered, total) => `Showing ${filtered} / ${total}`,
      resetBtn: 'Reset',
      viewModeAria: 'Atlas view mode',
      viewModes: {
        gallery: 'Cards',
        matrix: 'Matrix',
        ecosystem: 'Market Map',
      },
      lensesAria: 'Curated lenses',
      sidebarAria: 'Catalog filters',
      sectorTitle: (count) => `Market Sectors (${count})`,
      allSectors: 'All Indonesian Sectors',
      platformTitle: (count) => `Platform Class (${count})`,
      allPlatforms: 'All Platforms',
      archetypeTitle: (count) => `UI Archetypes (${count})`,
      allArchetypes: 'All UI Archetypes',
      allShort: 'All',
      emptyTitle: 'No product concepts match the current filter combination.',
      emptyDesc: (total) => `Clear one or more active filters to return to all ${total} Atlas concepts.`,
      resetAllBtn: 'Reset all filters',
      loadingMore: 'Loading more concepts...',
      endOfCatalog: (count) => `All ${count} matching concepts loaded`,
      tableHeaders: {
        id: 'ID',
        concept: 'Product Concept',
        sector: 'Sector',
        platform: 'Platform',
        archetype: 'UI Archetype',
        standards: 'Standards / Focus',
        stack: 'Primary Stack',
      },
      conceptsUnit: (count) => `${count} concepts`,
      cardPagesUnit: (count) => `${count} screens`,
      openCaseStudy: 'Open case study',
      screenshotAlt: (name) => `${name} UI/UX preview`,
    },

    experience: {
      verifiedCareerTag: 'Production Track Record',
      metaSummary: (roles, points, groups) => `${roles} Roles | ${points} Highlights | ${groups} Skill Groups`,
      copyResumeBtn: 'Copy Resume (.md)',
      copiedResumeBtn: 'Resume Copied',
      downloadResumeBtn: 'Download .md',
      summaryLabel: 'PROFILE SUMMARY',
      allFilter: 'All',
      relatedConceptsLabel: 'Related concepts:',
      skillsHeading: 'Technical Skills',
      skillsDesc: (count) => `${count} core capability groups`,
      employmentTypeLabels: {
        'Full-Time': 'Full-Time',
        Founder: 'Founder',
        Leadership: 'Leadership',
        'Konsultan / Penempatan': 'Consultant / Placement',
        Freelance: 'Freelance',
      },
    },

    architecture: {
      kicker: 'Engineering Playbook | System Design | AI Pipeline',
      title: 'How I architect, accelerate, and verify production systems.',
      subtitle:
        'A practical look at the AI-assisted delivery workflow, architectural decision patterns, and Indonesian enterprise standards behind my engineering work.',
      quickJumpPipeline: 'AI Pipeline',
      quickJumpDecisions: 'Decision Playbook',
      quickJumpStandards: 'Standards Matrix',
      quickJumpContact: 'Contact & Brief',
      pipelineTitle: 'AI-Native Engineering Pipeline',
      pipelineDesc:
        'AI drives speed across implementation and exploration, while system boundaries, security controls, and release verification stay firmly under engineering ownership.',
      aiAcceleratesLabel: 'Accelerated by AI Pipeline',
      engineerOwnsLabel: 'Owned & Verified by Engineer',
      toolsInUseLabel: 'Working Toolset',
      decisionsTitle: 'Architecture Decision Playbook',
      decisionsDesc: 'Recurring system trade-offs shaped by 10+ years of enterprise, mining, fintech, and AI production delivery.',
      whenToUseLabel: 'Decision Rule',
      productionAnchorLabel: 'Grounded In',
      standardsTitle: 'Enterprise & Indonesian DPI Standards Matrix',
      standardsDesc: (totalProjects) =>
        `Key national protocols and regulated enterprise domains modeled across ${totalProjects} Atlas concepts. Jump straight into filtered blueprints.`,
      standardsBadge: 'Indonesia 2025 - 2026',
      standardsColEcosystem: 'Standard / Domain',
      standardsColPattern: 'Architecture Pattern & Design Focus',
      standardsColAtlas: 'Atlas Blueprints',
      exploreInAtlas: 'Explore in Atlas',
      contactTitle: 'Direct Technical Discussion & Contact',
      contactDesc: 'Open for direct architecture conversations, advisory work, or senior engineering roles.',
      availabilityTag: 'Jakarta | Remote / Hybrid',
      contactFields: {
        email: 'Email',
        whatsapp: 'WhatsApp',
        linkedin: 'LinkedIn',
        location: 'Location',
      },
      briefLabel: 'EXECUTIVE SUMMARY FOR CTO / RECRUITER',
      copyBriefBtn: 'Copy Summary',
      copiedBriefBtn: 'Copied (Markdown)',
    },

    command: {
      dialogAria: 'Quick search',
      placeholder: (count) => `Jump to ${count} concepts, standards (QRIS, SATUSEHAT, CoreTax, UU PDP), stack, or career...`,
      closeAria: 'Close quick search',
      emptyResult: (query) =>
        `No concepts, sectors, or roles matched "${query}". Try "QRIS", "SATUSEHAT", "CoreTax", "Mining", or ".NET MAUI".`,
      matchedConcepts: 'Product Concepts',
      featuredConcepts: 'Featured Concepts',
      marketSectors: 'Market Sectors',
      filterSectorTag: 'Filter Sector',
      careerHistory: 'Career History',
      verifiedRoleTag: 'Production Role',
    },

    prototype: {
      pagesNavAria: 'Prototype screens',
      viewModeAria: 'Case study view mode',
      enterpriseVerifiedTag: (count) => `Enterprise Verified | ${count} Screens`,
      enterpriseDesignTab: (res) => `Enterprise Design (${res})`,
      uiDesignTab: 'UI/UX Design',
      interactiveProtoTab: 'Interactive Prototype',
      interactiveSimTab: 'Interactive Simulation',
      searchProtoAria: 'Search prototypes',
      pageOf: (pos, total) => `Screen ${pos} of ${total}`,
      pageBadge: (pos, total) => `Screen ${pos} / ${total}`,
      zoomInspectBtn: 'Zoom & Inspect',
      zoomHint: (res) => `Click to inspect at Fit / 100% / 150% (${res})`,
      filmstripAria: 'All screen previews',
      previewAlt: (title) => `Preview of ${title}`,
      loadingProto: 'Loading prototype...',
      pagerAria: 'Previous and next screen',
      aboutPrefix: (name) => `About ${name}`,
      problemHeading: 'Problem Statement',
      contextHeading: 'Indonesian Context',
      scopeHeading: 'Product Scope',
      refArchHeading: 'Reference Architecture',
      archLabels: {
        client: 'Client',
        edge: 'Gateway',
        core: 'Domain Core',
        integration: 'Integration',
        storage: 'Storage',
        stack: 'Stack',
        standards: 'Standards',
      },
      relatedExpBtn: (company) => `Related experience: ${company}`,
      zoomDialogAria: (name, title) => `Zoom inspect ${name} - ${title}`,
      zoomLevelAria: 'Zoom level',
      prevBtn: 'Prev',
      nextBtn: 'Next',
      closeEscBtn: 'Close (Esc)',
      fullResAlt: (name, title) => `Full resolution ${name} - ${title}`,
    },
  },

  id: {
    documentTitle: 'Muhammad Hernanda - Portofolio Rekayasa & Atlas Produk Digital',
    notFoundTitle: 'Halaman tidak ditemukan - Atlas',
    notFoundHeading: 'Halaman tidak ditemukan',
    backToAtlas: 'Kembali ke Atlas',
    brandSub: 'Principal .NET, Solution Architect & AI Pipeline | Jakarta',
    navAriaLabel: 'Navigasi utama',
    nav: {
      overview: 'Ringkasan',
      atlas: 'Atlas Konsep',
      experience: 'Karier',
      architecture: 'Arsitektur',
    },
    searchConceptsPlaceholder: (count) => `Cari ${count} konsep...`,
    openQuickSearch: 'Buka pencarian cepat',
    switchToDark: 'Ubah ke tema gelap',
    switchToLight: 'Ubah ke tema terang',
    switchLanguageAria: 'Ganti bahasa antara English dan Bahasa Indonesia',
    footerSummary: (expCount, projCount) =>
      `Rekam jejak karier produksi (${expCount} peran) dipisahkan tegas dari ${projCount} konsep eksplorasi produk digital.`,

    overview: {
      activeSince: (year) => `Aktif Sejak ${year}`,
      heroDomain: '.NET | Solution Architecture | AI Engineering',
      heroTitle: (count) =>
        `Merancang sistem enterprise yang tangguh dan memetakan ${count} arsitektur produk digital untuk ekonomi Indonesia.`,
      exploreAtlasBtn: (count) => `Jelajahi ${count} Konsep Produk`,
      viewCareerBtn: 'Lihat Riwayat Karier (2016 - 2026)',
      directContactBtn: 'Diskusi Langsung',
      stats: {
        prodEngLabel: 'Rekayasa Produksi',
        prodEngVal: '10+ Thn',
        prodEngDetail: (year) => `${year} hingga 2026 lintas enterprise dan startup`,
        expLabel: 'Rekam Jejak Karier',
        expVal: (count) => `${count} Peran`,
        expDetail: 'Fintech, Pertambangan, Asuransi, Logistik, AI, GovTech',
        atlasLabel: 'Atlas Konsep Produk',
        atlasVal: (count) => `${count} Konsep`,
        atlasDetail: (screens, sectors) => `${screens} halaman interaktif | ${sectors} sektor pasar`,
        scaleLabel: 'Skala Enterprise',
        scaleVal: '80+ App',
        scaleDetail: 'Orkestrasi workflow approval konglomerasi',
      },
      credibilityTitle: 'Pengalaman Produksi vs. Eksplorasi Konseptual',
      verifiedRolesTag: (count) => `${count} Peran Produksi`,
      conceptsNotDeployedTag: (count) => `${count} Konsep Eksplorasi`,
      featuredHeading: 'Prototipe Unggulan',
      viewAllConceptsBtn: (count) => `Lihat seluruh ${count} konsep`,
      radarHeading: (sectors) => `Atlas Ekonomi Digital Indonesia - ${sectors} Sektor Pasar`,
      radarDesc:
        'Setiap sektor memetakan standar infrastruktur dan regulasi nyata Indonesia (QRIS Tap, BI-FAST, SATUSEHAT, CoreTax, UU PDP, RKAB/SIMBARA, IDXCarbon, BPJPH, SPBE). Klik sektor mana saja untuk menyaring konsepnya.',
      radarSummaryTag: (projects, archetypes) => `${projects} Konsep | ${archetypes} Arketipe UI`,
    },

    atlas: {
      searchPlaceholder: (count) =>
        `Saring ${count} konsep berdasarkan nama, QRIS, SATUSEHAT, CoreTax, UU PDP, .NET, tambang...`,
      searchAria: 'Saring konsep produk',
      clearSearchAria: 'Hapus pencarian',
      filterBtn: 'Filter',
      showingCount: (filtered, total) => `Menampilkan ${filtered} / ${total}`,
      resetBtn: 'Reset',
      viewModeAria: 'Mode tampilan Atlas',
      viewModes: {
        gallery: 'Kartu',
        matrix: 'Matriks',
        ecosystem: 'Peta Pasar',
      },
      lensesAria: 'Lensa kurasi',
      sidebarAria: 'Filter katalog',
      sectorTitle: (count) => `Sektor Pasar (${count})`,
      allSectors: 'Semua Sektor Indonesia',
      platformTitle: (count) => `Kelas Platform (${count})`,
      allPlatforms: 'Semua Platform',
      archetypeTitle: (count) => `Arketipe UI (${count})`,
      allArchetypes: 'Semua Arketipe UI',
      allShort: 'Semua',
      emptyTitle: 'Tidak ada konsep produk yang cocok dengan kombinasi filter saat ini.',
      emptyDesc: (total) => `Hapus satu atau lebih filter aktif untuk kembali ke seluruh ${total} konsep Atlas.`,
      resetAllBtn: 'Reset semua filter',
      loadingMore: 'Memuat konsep lainnya...',
      endOfCatalog: (count) => `Seluruh ${count} konsep yang cocok sudah ditampilkan`,
      tableHeaders: {
        id: 'ID',
        concept: 'Konsep Produk',
        sector: 'Sektor',
        platform: 'Platform',
        archetype: 'Arketipe UI',
        standards: 'Standar / Fokus',
        stack: 'Stack Utama',
      },
      conceptsUnit: (count) => `${count} konsep`,
      cardPagesUnit: (count) => `${count} halaman`,
      openCaseStudy: 'Buka studi kasus',
      screenshotAlt: (name) => `Tampilan UI/UX ${name}`,
    },

    experience: {
      verifiedCareerTag: 'Rekam Jejak Produksi',
      metaSummary: (roles, points, groups) => `${roles} Peran | ${points} Poin Utama | ${groups} Grup Skill`,
      copyResumeBtn: 'Salin Resume (.md)',
      copiedResumeBtn: 'Resume Tersalin',
      downloadResumeBtn: 'Unduh .md',
      summaryLabel: 'RINGKASAN PROFIL',
      allFilter: 'Semua',
      relatedConceptsLabel: 'Konsep terkait:',
      skillsHeading: 'Technical Skills',
      skillsDesc: (count) => `${count} kelompok kapabilitas teknis`,
      employmentTypeLabels: {
        'Full-Time': 'Full-Time',
        Founder: 'Founder',
        Leadership: 'Leadership',
        'Konsultan / Penempatan': 'Konsultan / Penempatan',
        Freelance: 'Freelance',
      },
    },

    architecture: {
      kicker: 'Engineering Playbook | System Design | AI Pipeline',
      title: 'Cara saya merancang, mempercepat, dan memverifikasi sistem produksi.',
      subtitle:
        'Gambaran nyata mengenai workflow delivery berbasis AI, pola keputusan arsitektur, serta kesiapan standar enterprise dan DPI Indonesia di balik setiap sistem yang saya bangun.',
      quickJumpPipeline: 'AI Pipeline',
      quickJumpDecisions: 'Decision Playbook',
      quickJumpStandards: 'Matriks Standar',
      quickJumpContact: 'Kontak & Brief',
      pipelineTitle: 'AI-Native Engineering Pipeline',
      pipelineDesc:
        'AI menjadi akselerator utama untuk eksplorasi dan implementasi, sementara batas arsitektur, keamanan data, dan verifikasi rilis tetap berada sepenuhnya di kendali engineer.',
      aiAcceleratesLabel: 'Dipercepat oleh AI Pipeline',
      engineerOwnsLabel: 'Dikendalikan & Diverifikasi Engineer',
      toolsInUseLabel: 'Toolset Kerja',
      decisionsTitle: 'Architecture Decision Playbook',
      decisionsDesc: 'Trade-off arsitektur yang terbentuk dari 10+ tahun membangun sistem produksi di enterprise, tambang, fintech, dan infrastruktur AI.',
      whenToUseLabel: 'Aturan Keputusan',
      productionAnchorLabel: 'Berakar dari Produksi',
      standardsTitle: 'Matriks Standar Enterprise & DPI Indonesia',
      standardsDesc: (totalProjects) =>
        `Protokol nasional dan domain teregulasi utama yang dimodelkan di seluruh ${totalProjects} konsep Atlas. Klik untuk langsung menyaring blueprint terkait.`,
      standardsBadge: 'Lanskap Indonesia 2025 - 2026',
      standardsColEcosystem: 'Standar / Ekosistem',
      standardsColPattern: 'Pola Arsitektur & Fokus Desain',
      standardsColAtlas: 'Blueprint Atlas',
      exploreInAtlas: 'Lihat di Atlas',
      contactTitle: 'Diskusi Teknis Langsung & Kontak',
      contactDesc: 'Terbuka untuk diskusi arsitektur secara langsung, kolaborasi konsultasi, maupun peran senior engineering.',
      availabilityTag: 'Jakarta | Remote / Hybrid',
      contactFields: {
        email: 'Email',
        whatsapp: 'WhatsApp',
        linkedin: 'LinkedIn',
        location: 'Lokasi',
      },
      briefLabel: 'RINGKASAN EKSEKUTIF UNTUK CTO / RECRUITER',
      copyBriefBtn: 'Salin Ringkasan',
      copiedBriefBtn: 'Tersalin (Markdown)',
    },

    command: {
      dialogAria: 'Pencarian cepat',
      placeholder: (count) => `Loncat ke ${count} konsep, standar (QRIS, SATUSEHAT, CoreTax, UU PDP), stack, atau karier...`,
      closeAria: 'Tutup pencarian cepat',
      emptyResult: (query) =>
        `Tidak ditemukan konsep, sektor, atau pengalaman untuk "${query}". Coba "QRIS", "SATUSEHAT", "CoreTax", "Tambang", atau ".NET MAUI".`,
      matchedConcepts: 'Konsep Produk',
      featuredConcepts: 'Konsep Unggulan',
      marketSectors: 'Sektor Pasar Indonesia',
      filterSectorTag: 'Filter Sektor',
      careerHistory: 'Riwayat Karier',
      verifiedRoleTag: 'Peran Produksi',
    },

    prototype: {
      pagesNavAria: 'Halaman prototipe',
      viewModeAria: 'Mode tampilan studi kasus',
      enterpriseVerifiedTag: (count) => `Enterprise Verified | ${count} Hal`,
      enterpriseDesignTab: (res) => `Desain Enterprise (${res})`,
      uiDesignTab: 'Desain UI/UX',
      interactiveProtoTab: 'Prototipe Interaktif',
      interactiveSimTab: 'Simulasi Interaktif',
      searchProtoAria: 'Cari prototipe',
      pageOf: (pos, total) => `Halaman ${pos} dari ${total}`,
      pageBadge: (pos, total) => `Halaman ${pos} / ${total}`,
      zoomInspectBtn: 'Zoom & Inspeksi',
      zoomHint: (res) => `Klik untuk inspeksi Zoom Fit / 100% / 150% (${res})`,
      filmstripAria: 'Pratinjau seluruh halaman',
      previewAlt: (title) => `Pratinjau ${title}`,
      loadingProto: 'Memuat prototipe...',
      pagerAria: 'Halaman sebelum dan sesudah',
      aboutPrefix: (name) => `Tentang ${name}`,
      problemHeading: 'Masalah',
      contextHeading: 'Konteks Indonesia',
      scopeHeading: 'Cakupan Produk',
      refArchHeading: 'Arsitektur Rujukan',
      archLabels: {
        client: 'Client',
        edge: 'Gateway',
        core: 'Domain Core',
        integration: 'Integrasi',
        storage: 'Penyimpanan',
        stack: 'Stack',
        standards: 'Standar',
      },
      relatedExpBtn: (company) => `Pengalaman terkait: ${company}`,
      zoomDialogAria: (name, title) => `Inspeksi Zoom ${name} - ${title}`,
      zoomLevelAria: 'Level zoom',
      prevBtn: 'Sebelumnya',
      nextBtn: 'Berikutnya',
      closeEscBtn: 'Tutup (Esc)',
      fullResAlt: (name, title) => `Resolusi penuh ${name} - ${title}`,
    },
  },
};
