import React, { useState } from 'react';
import type { DiagramId } from '../data/caseStudies';
import { useLanguage, type Language } from '../i18n/LanguageContext';
import { IconShield } from './Icons';

interface DiagramNodeSpec {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  tone?: 'default' | 'accent' | 'ok' | 'warn';
  detail: {
    protocol: string;
    ownership: Record<Language, string>;
    resilience: Record<Language, string>;
  };
}

interface DiagramEdgeSpec {
  from: [number, number];
  to: [number, number];
  label?: string;
}

interface DiagramBlueprint {
  id: DiagramId;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  anchor: Record<Language, string>;
  viewBox: string;
  nodes: DiagramNodeSpec[];
  edges: DiagramEdgeSpec[];
}

const BLUEPRINTS: Record<DiagramId, DiagramBlueprint> = {
  'grc-ai-gateway': {
    id: 'grc-ai-gateway',
    title: {
      en: 'Sovereign .NET AI Inference Gateway & PII Concrete Wall',
      id: 'Sovereign .NET AI Inference Gateway & Lapisan Proteksi PII',
    },
    subtitle: {
      en: 'Zero-fork .NET gateway governing multi-provider LLM traffic, RBAC quotas, context compression, and strict pre-egress PII masking.',
      id: 'Gateway .NET dari nol untuk mengelola trafik LLM multi-provider, kuota RBAC, kompresi konteks, dan masking PII ketat sebelum egress.',
    },
    anchor: {
      en: 'Production Pattern: GRC Board Internal AI Infrastructure',
      id: 'Pola Produksi: Infrastruktur AI Internal GRC Board',
    },
    viewBox: '0 0 860 250',
    nodes: [
      {
        id: 'clients',
        x: 18,
        y: 66,
        w: 148,
        h: 92,
        label: 'Internal Surfaces',
        sub: 'Tourmaline / Agents / B2B',
        detail: {
          protocol: 'HTTPS / OpenAI-Compatible REST',
          ownership: {
            en: 'Internal knowledge workspaces, chatbots, and backend workflows authenticate with scoped tokens.',
            id: 'Workspace pengetahuan internal, chatbot, dan workflow backend masuk memakai token terbatas.',
          },
          resilience: {
            en: 'Clients never hold raw vendor API keys; endpoint failover stays completely transparent.',
            id: 'Client tidak pernah memegang API key vendor mentah; failover endpoint berjalan transparan.',
          },
        },
      },
      {
        id: 'rbac',
        x: 204,
        y: 26,
        w: 158,
        h: 74,
        label: 'RBAC & Quota Gate',
        sub: 'Per-role limits & budgets',
        tone: 'accent',
        detail: {
          protocol: '.NET Middleware + Policy Store',
          ownership: {
            en: 'Enforces department quotas, allowed model tiers, and rate limits before inference compute is consumed.',
            id: 'Menegakkan kuota divisi, tier model yang diizinkan, dan rate limit sebelum komputasi inference dipakai.',
          },
          resilience: {
            en: 'Prevents runaway agent loops from exhausting company LLM spend.',
            id: 'Mencegah loop agent tak terkendali menghabiskan anggaran LLM perusahaan.',
          },
        },
      },
      {
        id: 'pii',
        x: 204,
        y: 124,
        w: 158,
        h: 82,
        label: 'PII Concrete Wall',
        sub: 'Redaction & Context Trim',
        tone: 'warn',
        detail: {
          protocol: 'Deterministic Regex + Policy Rules',
          ownership: {
            en: 'Strips sensitive corporate identifiers and compresses redundant context windows prior to egress.',
            id: 'Menyaring identitas korporat sensitif serta memadatkan context window sebelum data keluar.',
          },
          resilience: {
            en: 'Hard-blocks policy violations before external network calls are ever dispatched.',
            id: 'Memblokir pelanggaran kebijakan secara deterministik sebelum panggilan jaringan eksternal dikirim.',
          },
        },
      },
      {
        id: 'router',
        x: 406,
        y: 66,
        w: 168,
        h: 92,
        label: '.NET Pool Router',
        sub: 'Provider Pooling & Mix',
        tone: 'accent',
        detail: {
          protocol: 'Weighted Failover + Vector Cache',
          ownership: {
            en: 'Routes requests across pooled providers, local Qwen/LoRA endpoints, and cached memory layers.',
            id: 'Mengarahkan request lintas pool provider, endpoint lokal Qwen/LoRA, dan lapisan cache memori.',
          },
          resilience: {
            en: 'Automatically shifts traffic when an upstream provider hits 429 throttle or latency spikes.',
            id: 'Otomatis mengalihkan trafik saat provider hulu terkena throttle 429 atau lonjakan latensi.',
          },
        },
      },
      {
        id: 'models',
        x: 620,
        y: 26,
        w: 220,
        h: 74,
        label: 'Local & Cloud Models',
        sub: 'Qwen / LoRA | Cloud SoTA Pools',
        tone: 'ok',
        detail: {
          protocol: 'vLLM Local + Cloud HTTPS Pools',
          ownership: {
            en: 'Sensitive internal tasks stay on local models; complex reasoning routes through governed cloud pools.',
            id: 'Tugas internal sensitif tetap di model lokal; reasoning kompleks lewat pool cloud terkelola.',
          },
          resilience: {
            en: 'Zero single-vendor lock-in with continuous provider health scoring.',
            id: 'Bebas ketergantungan satu vendor berkat pemantauan kesehatan provider berkelanjutan.',
          },
        },
      },
      {
        id: 'audit',
        x: 620,
        y: 124,
        w: 220,
        h: 82,
        label: 'Audit & Cost Ledger',
        sub: 'Hashed Traces + Budget Math',
        detail: {
          protocol: 'Structured Logs + SQL Ledger',
          ownership: {
            en: 'Logs token attribution, latency telemetry, and hashed audit metadata without storing raw secrets.',
            id: 'Mencatat atribusi token, telemetri latensi, dan metadata audit hash tanpa menyimpan rahasia mentah.',
          },
          resilience: {
            en: 'Feeds directly into multi-option budget tracking and linear-algebra spend forecasting.',
            id: 'Terhubung ke pelacakan anggaran multi-opsi dan proyeksi biaya berbasis aljabar linear.',
          },
        },
      },
    ],
    edges: [
      { from: [166, 98], to: [204, 64] },
      { from: [166, 126], to: [204, 162] },
      { from: [362, 64], to: [406, 98] },
      { from: [362, 162], to: [406, 126] },
      { from: [574, 98], to: [620, 64] },
      { from: [574, 126], to: [620, 162] },
    ],
  },

  'trakindo-hub': {
    id: 'trakindo-hub',
    title: {
      en: '80+ App Modular Monolith Approval Hub & Event-Driven Orchestration',
      id: 'Hub Approval Modular Monolith 80+ Aplikasi & Orkestrasi Event-Driven',
    },
    subtitle: {
      en: 'Unified conglomerate approval backbone separating heterogeneous subsidiary ERPs from one adaptive executive inbox.',
      id: 'Tulang punggung approval konglomerasi yang memisahkan keragaman ERP anak perusahaan dari satu inbox eksekutif adaptif.',
    },
    anchor: {
      en: 'Production Pattern: PT. Tiara Marga Trakindo (80+ Applications)',
      id: 'Pola Produksi: PT. Tiara Marga Trakindo (80+ Aplikasi)',
    },
    viewBox: '0 0 860 250',
    nodes: [
      {
        id: 'apps',
        x: 18,
        y: 64,
        w: 150,
        h: 96,
        label: '80+ Source Apps',
        sub: 'ERP / HR / Finance',
        detail: {
          protocol: 'REST + Unified Auth Token',
          ownership: {
            en: 'Subsidiary applications submit arbitrary approval payloads mapped as adaptive key-value dictionaries.',
            id: 'Aplikasi anak perusahaan mengirim payload approval beragam dalam format dictionary key-value adaptif.',
          },
          resilience: {
            en: 'No per-app frontend rebuild required when new subsidiary systems onboard.',
            id: 'Tidak perlu bangun ulang frontend setiap kali aplikasi anak perusahaan baru bergabung.',
          },
        },
      },
      {
        id: 'gateway',
        x: 196,
        y: 64,
        w: 138,
        h: 96,
        label: 'API Gateway',
        sub: 'Auth / Schema / Rate',
        tone: 'accent',
        detail: {
          protocol: 'OAuth2 / JWT + Schema Gate',
          ownership: {
            en: 'Validates caller identity, normalizes envelope headers, and logs correlation IDs at ingress.',
            id: 'Memvalidasi identitas pemanggil, menormalisasi header, dan mencatat correlation ID saat masuk.',
          },
          resilience: {
            en: 'Rejects malformed requests before they enter workflow queues.',
            id: 'Menolak payload tidak valid sebelum masuk ke antrean workflow.',
          },
        },
      },
      {
        id: 'monolith',
        x: 366,
        y: 26,
        w: 164,
        h: 82,
        label: 'Modular Monolith',
        sub: '.NET Core + Outbox DB',
        tone: 'accent',
        detail: {
          protocol: 'ACID SQL Transaction + Outbox',
          ownership: {
            en: 'Owns dynamic form metadata, approval state, and audit trails in isolated domain modules.',
            id: 'Mengelola metadata form dinamis, status persetujuan, dan audit trail dalam modul domain terisolasi.',
          },
          resilience: {
            en: 'Atomic writes guarantee state updates and outbound events stay strictly consistent.',
            id: 'Penulisan atomik menjamin perubahan status dan event keluar selalu konsisten.',
          },
        },
      },
      {
        id: 'mq',
        x: 366,
        y: 132,
        w: 164,
        h: 78,
        label: 'RabbitMQ + Elsa',
        sub: 'Dynamic Flow Engine',
        tone: 'warn',
        detail: {
          protocol: 'AMQP Queues + Elsa Workflow',
          ownership: {
            en: 'Executes multi-step branching approval rules, escalations, and asynchronous callbacks.',
            id: 'Menjalankan aturan persetujuan bercabang, eskalasi SLA, dan callback asinkron.',
          },
          resilience: {
            en: 'Retries safely with dead-letter visibility if any downstream ERP goes temporarily offline.',
            id: 'Melakukan retry aman dengan visibilitas dead-letter jika ERP hilir sempat offline.',
          },
        },
      },
      {
        id: 'inbox',
        x: 572,
        y: 64,
        w: 266,
        h: 96,
        label: 'Adaptive Executive Inbox',
        sub: 'Dynamic Dictionary UI + Audit',
        tone: 'ok',
        detail: {
          protocol: 'Responsive Web + Structured Logs',
          ownership: {
            en: 'Renders clean key-value summaries, attachments, and one-click approve/reject controls across all 80+ apps.',
            id: 'Menampilkan ringkasan key-value yang bersih, lampiran, serta kontrol approve/reject seragam lintas 80+ aplikasi.',
          },
          resilience: {
            en: 'Every decision is idempotent and stamped into centralized compliance logs.',
            id: 'Setiap keputusan bersifat idempoten dan tercatat rapi di log kepatuhan terpusat.',
          },
        },
      },
    ],
    edges: [
      { from: [164, 112], to: [196, 112] },
      { from: [334, 96], to: [366, 68] },
      { from: [448, 108], to: [448, 132] },
      { from: [530, 68], to: [572, 96] },
      { from: [530, 170], to: [572, 130] },
    ],
  },

  'mining-offline-suite': {
    id: 'mining-offline-suite',
    title: {
      en: 'Offline-First .NET MAUI Mining Operations & Enterprise Release Pipeline',
      id: 'Operasional Tambang .NET MAUI Offline-First & Pipeline Rilis Enterprise',
    },
    subtitle: {
      en: 'Field-resilient mobile and web platform spanning remote camp operations, Azure AD/B2C security, and automated store distribution.',
      id: 'Platform mobile dan web tangguh untuk lokasi tambang terpencil, keamanan Azure AD/B2C, serta distribusi otomatis toko aplikasi.',
    },
    anchor: {
      en: 'Production Pattern: Amman Mineral & Saptaindra Sejati (Adaro)',
      id: 'Pola Produksi: Amman Mineral & Saptaindra Sejati (Adaro)',
    },
    viewBox: '0 0 860 250',
    nodes: [
      {
        id: 'field',
        x: 18,
        y: 56,
        w: 162,
        h: 112,
        label: '.NET MAUI Field App',
        sub: 'SQLite Local Queue + Sync',
        tone: 'accent',
        detail: {
          protocol: 'Local SQLite + Delta HTTP Sync',
          ownership: {
            en: 'Captures QC inspections, camp meal orders, and lubricant logs cleanly even with weak site connectivity.',
            id: 'Mencatat inspeksi QC, pesanan katering camp, dan log pelumas secara stabil meski sinyal lokasi lemah.',
          },
          resilience: {
            en: 'Queues writes locally and replays idempotently once network returns.',
            id: 'Menyimpan transaksi secara lokal dan menyinkronkannya secara idempoten saat koneksi pulih.',
          },
        },
      },
      {
        id: 'auth',
        x: 222,
        y: 26,
        w: 160,
        h: 74,
        label: 'Azure AD & B2C',
        sub: 'Enterprise SSO Identity',
        tone: 'warn',
        detail: {
          protocol: 'OIDC / OAuth2 Employee Sync',
          ownership: {
            en: 'Authenticates staff and contractors against corporate employee directories with role-scoped claims.',
            id: 'Mengautentikasi karyawan dan kontraktor terhadap direktori perusahaan dengan klaim berbasis peran.',
          },
          resilience: {
            en: 'Token refresh and clean revocation aligned with corporate IT security.',
            id: 'Refresh token dan pencabutan akses selaras dengan standar keamanan TI korporat.',
          },
        },
      },
      {
        id: 'api',
        x: 222,
        y: 124,
        w: 160,
        h: 82,
        label: '.NET 8 LTS Web & API',
        sub: 'Upgraded from .NET 6',
        tone: 'accent',
        detail: {
          protocol: 'ASP.NET Core 8 + SQL Server',
          ownership: {
            en: 'Serves department portals, reporting dashboards, and mobile sync APIs on Windows Server.',
            id: 'Melayani portal departemen, dashboard laporan, dan API sinkronisasi mobile di Windows Server.',
          },
          resilience: {
            en: 'Controlled Production/Development slot swaps keep legacy and modern modules running safely.',
            id: 'Swap terkendali antara Production dan Development menjaga modul lama dan baru tetap stabil.',
          },
        },
      },
      {
        id: 'cicd',
        x: 430,
        y: 56,
        w: 176,
        h: 112,
        label: 'Azure DevOps CI/CD',
        sub: 'Vuln Scan + Build Gates',
        detail: {
          protocol: 'Automated YAML Pipelines',
          ownership: {
            en: 'Runs automated builds, vulnerability detection, and release packaging for web and mobile binaries.',
            id: 'Menjalankan build otomatis, pemindaian kerentanan, dan pemaketan rilis web maupun mobile.',
          },
          resilience: {
            en: 'Catches dependency vulnerabilities and build regressions before reaching field devices.',
            id: 'Menangkap kerentanan dependensi dan regresi build sebelum mencapai perangkat lapangan.',
          },
        },
      },
      {
        id: 'stores',
        x: 646,
        y: 56,
        w: 194,
        h: 112,
        label: 'Managed Distribution',
        sub: 'TestFlight & Google Play',
        tone: 'ok',
        detail: {
          protocol: 'Apple Signing + Play Console',
          ownership: {
            en: 'Manages client provisioning profiles, signing keys, changelogs, and phased operational rollouts.',
            id: 'Mengelola provisioning profile, signing key klien, changelog, dan rollout operasional bertahap.',
          },
          resilience: {
            en: 'Backed by UAT/FSD documentation and hands-on department training sessions.',
            id: 'Didukung dokumentasi UAT/FSD dan sesi pelatihan langsung ke departemen pengguna.',
          },
        },
      },
    ],
    edges: [
      { from: [180, 90], to: [222, 64] },
      { from: [180, 134], to: [222, 162] },
      { from: [382, 64], to: [430, 96] },
      { from: [382, 162], to: [430, 130] },
      { from: [606, 112], to: [646, 112] },
    ],
  },

  'inhealth-micare': {
    id: 'inhealth-micare',
    title: {
      en: 'Adaptive Insurance Notification & Approval Services with TDD Gate',
      id: 'Layanan Notifikasi & Approval Asuransi Adaptif dengan Gerbang TDD',
    },
    subtitle: {
      en: 'Containerized .NET + React services plugged cleanly into live health insurance production with automated TDD protection.',
      id: 'Layanan .NET + React dalam container Docker yang menyatu dengan produksi asuransi kesehatan lewat perlindungan TDD otomatis.',
    },
    anchor: {
      en: 'Production Pattern: Mandiri Inhealth (New MiCare)',
      id: 'Pola Produksi: Mandiri Inhealth (New MiCare)',
    },
    viewBox: '0 0 860 220',
    nodes: [
      {
        id: 'ui',
        x: 20,
        y: 62,
        w: 170,
        h: 92,
        label: 'New MiCare React UI',
        sub: 'Claims & Approval Portal',
        detail: {
          protocol: 'React + Typed REST API',
          ownership: {
            en: 'Modern web interface for internal operations and request approvals.',
            id: 'Antarmuka web modern untuk operasional internal dan persetujuan permintaan.',
          },
          resilience: {
            en: 'Decoupled frontend deployment via containerized build artifacts.',
            id: 'Deployment frontend terpisah lewat artefak build berbasis container.',
          },
        },
      },
      {
        id: 'svc',
        x: 238,
        y: 62,
        w: 196,
        h: 92,
        label: '.NET Adaptive Services',
        sub: 'Notification & Approvals',
        tone: 'accent',
        detail: {
          protocol: 'ASP.NET Core + Existing Env Bridge',
          ownership: {
            en: 'Handles dynamic approval routing and multi-channel notifications alongside legacy insurance modules.',
            id: 'Menangani routing persetujuan dinamis dan notifikasi lintas kanal berdampingan dengan modul lama.',
          },
          resilience: {
            en: 'Zero disruptive rewrite required on core legacy systems.',
            id: 'Tidak memerlukan penulisan ulang berisiko pada sistem inti legacy.',
          },
        },
      },
      {
        id: 'tdd',
        x: 482,
        y: 62,
        w: 164,
        h: 92,
        label: 'TDD Quality Gate',
        sub: 'Unit Tests + CI Checks',
        tone: 'warn',
        detail: {
          protocol: 'xUnit / Automated CI Pipeline',
          ownership: {
            en: 'Verifies edge-case approval rules and catches regressions automatically as team size grows.',
            id: 'Memverifikasi aturan persetujuan dan menangkap regresi otomatis saat ukuran tim bertambah.',
          },
          resilience: {
            en: 'Blocks failing builds from reaching Docker production images.',
            id: 'Mencegah build bermasalah masuk ke image Docker produksi.',
          },
        },
      },
      {
        id: 'docker',
        x: 690,
        y: 62,
        w: 150,
        h: 92,
        label: 'Docker CI/CD',
        sub: 'Repeatable Releases',
        tone: 'ok',
        detail: {
          protocol: 'Containerized Deployment',
          ownership: {
            en: 'Standardizes runtime environments across staging and production.',
            id: 'Menyeragamkan lingkungan runtime antara staging dan produksi.',
          },
          resilience: {
            en: 'Fast rollback and predictable sprint release cadence.',
            id: 'Rollback cepat dan ritme rilis sprint yang terukur.',
          },
        },
      },
    ],
    edges: [
      { from: [190, 108], to: [238, 108] },
      { from: [434, 108], to: [482, 108] },
      { from: [646, 108], to: [690, 108] },
    ],
  },

  'crossborder-ocbc-delmon': {
    id: 'crossborder-ocbc-delmon',
    title: {
      en: 'Cross-Border Banking Cryptography (OCBC) & Dynamic Arabic RTL Mobile (Delmon)',
      id: 'Kriptografi Perbankan Lintas Negara (OCBC) & Mobile RTL Arab Dinamis (Delmon)',
    },
    subtitle: {
      en: 'Two specialized international architectures: strict SOAP file encryption in Singapore and JSON-driven .NET MAUI 9 RTL in Saudi Arabia.',
      id: 'Dua arsitektur internasional spesialis: enkripsi file SOAP ketat di Singapura dan .NET MAUI 9 RTL berbasis JSON di Arab Saudi.',
    },
    anchor: {
      en: 'Production Pattern: Singapore & Saudi Arabia Engagements',
      id: 'Pola Produksi: Kontrak Singapura & Arab Saudi',
    },
    viewBox: '0 0 860 230',
    nodes: [
      {
        id: 'ocbc-portal',
        x: 20,
        y: 26,
        w: 196,
        h: 76,
        label: 'Client Portal (SG)',
        sub: 'Payment & Batch Files',
        detail: {
          protocol: 'Internal HTTPS -> SOAP Bridge',
          ownership: {
            en: 'Submits financial batch files requiring bank-grade encryption before transmission.',
            id: 'Mengirim file batch finansial yang wajib dienkripsi standar bank sebelum transmisi.',
          },
          resilience: {
            en: 'Keeps cryptographic key handling isolated from web portal code.',
            id: 'Memisahkan penanganan kunci kriptografi dari kode portal web.',
          },
        },
      },
      {
        id: 'ocbc-api',
        x: 268,
        y: 26,
        w: 256,
        h: 76,
        label: '.NET SOAP Encryption API',
        sub: 'OCBC Encrypt / Decrypt Spec',
        tone: 'warn',
        detail: {
          protocol: 'SOAP XML + OCBC Crypto Standards',
          ownership: {
            en: 'Performs deterministic file encryption and response decryption matching OCBC bank specifications.',
            id: 'Menjalankan enkripsi dan dekripsi file secara deterministik sesuai spesifikasi OCBC Bank.',
          },
          resilience: {
            en: 'Strict schema validation prevents rejected bank file batches.',
            id: 'Validasi skema ketat mencegah penolakan file batch oleh bank.',
          },
        },
      },
      {
        id: 'ocbc-bank',
        x: 576,
        y: 26,
        w: 264,
        h: 76,
        label: 'OCBC Bank Host System',
        sub: 'Verified Host-to-Host Rail',
        tone: 'ok',
        detail: {
          protocol: 'Encrypted Host-to-Host Exchange',
          ownership: {
            en: 'Processes verified encrypted payloads from the Singapore client.',
            id: 'Memproses payload terenkripsi terverifikasi dari klien Singapura.',
          },
          resilience: {
            en: 'Zero spec drift across end-to-end encrypted roundtrips.',
            id: 'Nol penyimpangan spesifikasi di seluruh siklus enkripsi-dekripsi.',
          },
        },
      },
      {
        id: 'formio',
        x: 20,
        y: 128,
        w: 196,
        h: 78,
        label: 'Form.io JSON Schema',
        sub: 'Dynamic Metadata API',
        detail: {
          protocol: 'JSON Component Definitions',
          ownership: {
            en: 'Defines field types, defaults, validation rules, and parent-child dependencies remotely.',
            id: 'Mendefinisikan tipe field, default, validasi, dan relasi parent-child dari server.',
          },
          resilience: {
            en: 'Business forms evolve without forcing mobile app-store updates.',
            id: 'Form bisnis dapat diperbarui tanpa menunggu rilis ulang toko aplikasi.',
          },
        },
      },
      {
        id: 'maui-parser',
        x: 268,
        y: 128,
        w: 256,
        h: 78,
        label: '.NET MAUI 9 Parser Engine',
        sub: 'Syncfusion + State Binding',
        tone: 'accent',
        detail: {
          protocol: 'Recursive C# Metadata Mapper',
          ownership: {
            en: 'Renders native mobile controls dynamically with conditional states, skeleton loaders, and real-time validation.',
            id: 'Merender kontrol mobile native secara dinamis lengkap dengan state kondisional, skeleton, dan validasi real-time.',
          },
          resilience: {
            en: 'Layered client security protects sensitive operational fields.',
            id: 'Keamanan berlapis melindungi field operasional yang sensitif.',
          },
        },
      },
      {
        id: 'rtl-app',
        x: 576,
        y: 128,
        w: 264,
        h: 78,
        label: 'Office Anywhere (80% RTL)',
        sub: 'Arabic Task App (Saudi)',
        tone: 'ok',
        detail: {
          protocol: 'Native iOS/Android RTL Layout',
          ownership: {
            en: 'Replaced legacy Flutter app with crisp Right-to-Left Arabic operational UX.',
            id: 'Menggantikan aplikasi Flutter lama dengan UX operasional Arab Right-to-Left yang responsif.',
          },
          resilience: {
            en: 'Synchronizes mapped form metadata cleanly back to backend APIs.',
            id: 'Menyinkronkan metadata form secara akurat kembali ke API backend.',
          },
        },
      },
    ],
    edges: [
      { from: [216, 64], to: [268, 64] },
      { from: [524, 64], to: [576, 64] },
      { from: [216, 167], to: [268, 167] },
      { from: [524, 167], to: [576, 167] },
    ],
  },

  'founder-coldchain-govtech': {
    id: 'founder-coldchain-govtech',
    title: {
      en: '0-to-1 Civic SaaS, 18-Branch Cold-Chain KPI & Hardware-Integrated GovTech',
      id: 'Civic SaaS 0-ke-1, Mesin KPI Cold-Chain 18 Cabang & GovTech Terintegrasi Hardware',
    },
    subtitle: {
      en: 'Three distinct operational stacks demonstrating full-lifecycle range from solo founder SaaS to nationwide warehousing and law enforcement.',
      id: 'Tiga arsitektur operasional berbeda yang membuktikan rentang keahlian dari solo founder SaaS hingga gudang nasional dan kepolisian.',
    },
    anchor: {
      en: 'Production Pattern: Warga Digital | Diamond Cold Storage | POLRI & Nusa Kambangan',
      id: 'Pola Produksi: Warga Digital | Diamond Cold Storage | POLRI & Nusa Kambangan',
    },
    viewBox: '0 0 860 220',
    nodes: [
      {
        id: 'warga',
        x: 20,
        y: 44,
        w: 254,
        h: 132,
        label: 'Warga Digital (Founder)',
        sub: 'Mobile-First RT/RW SaaS',
        tone: 'accent',
        detail: {
          protocol: 'TypeScript + Supabase + Custom JWT',
          ownership: {
            en: 'Solo-owned architecture for resident data, kas RT treasury transparency, and neighborhood MSMEs.',
            id: 'Arsitektur mandiri penuh untuk data warga, transparansi kas RT, dan direktori UMKM lingkungan.',
          },
          resilience: {
            en: 'Custom JWT tenant isolation keeps neighborhood records strictly separated at low cost.',
            id: 'Isolasi tenant custom JWT menjaga data tiap lingkungan terpisah aman dengan biaya rendah.',
          },
        },
      },
      {
        id: 'datagate',
        x: 304,
        y: 44,
        w: 254,
        h: 132,
        label: 'DataGate (18 Branches)',
        sub: 'Diamond Cold Storage KPI',
        tone: 'ok',
        detail: {
          protocol: '.NET + SQL Server + Excel Ingestion',
          ownership: {
            en: 'Consolidates stock-taking, warehouse hygiene audits, stock write-offs, and monthly branch leaderboards.',
            id: 'Mengonsolidasikan stock opname, audit kebersihan gudang, pemusnahan stok, dan ranking cabang bulanan.',
          },
          resilience: {
            en: 'Structured Excel import validation protects nationwide KPI integrity.',
            id: 'Validasi impor Excel terstruktur menjaga integritas data KPI nasional.',
          },
        },
      },
      {
        id: 'gov',
        x: 588,
        y: 44,
        w: 252,
        h: 132,
        label: 'POLRI & Nusa Kambangan',
        sub: 'Biometrics, RFID & Wallet',
        tone: 'warn',
        detail: {
          protocol: '.NET Framework + Hardware SDKs',
          ownership: {
            en: 'Face detection, RFID/KTP visitor check-in (POLDA Metro Jaya) and inmate balance wallet (Iwartelsus).',
            id: 'Deteksi wajah, check-in pengunjung RFID/KTP (POLDA Metro Jaya), dan dompet warga binaan (Iwartelsus).',
          },
          resilience: {
            en: 'Built for continuous physical-facility operation with strict audit trails.',
            id: 'Dirancang untuk operasi fasilitas fisik berkelanjutan dengan jejak audit ketat.',
          },
        },
      },
    ],
    edges: [],
  },
};

export const ArchitectureDiagram: React.FC<{ diagramId: DiagramId; compact?: boolean }> = ({
  diagramId,
  compact = false,
}) => {
  const { lang } = useLanguage();
  const bp = BLUEPRINTS[diagramId];
  const [activeNodeId, setActiveNodeId] = useState<string>(bp.nodes[0].id);

  const activeNode = bp.nodes.find((n) => n.id === activeNodeId) ?? bp.nodes[0];

  const toneStroke = (tone?: DiagramNodeSpec['tone']) => {
    if (tone === 'accent') return 'var(--ui-accent)';
    if (tone === 'ok') return 'var(--ui-ok)';
    if (tone === 'warn') return 'var(--ui-warn)';
    return 'var(--ui-line-strong)';
  };

  const toneFill = (tone?: DiagramNodeSpec['tone'], isActive?: boolean) => {
    if (isActive) return 'var(--ui-accent-soft)';
    if (tone === 'ok') return 'var(--ui-ok-soft)';
    if (tone === 'warn') return 'var(--ui-warn-soft)';
    return 'var(--ui-surface)';
  };

  return (
    <div className={`arch-diagram-card ${compact ? 'is-compact' : ''}`}>
      {!compact && (
        <div className="arch-diagram-head">
          <div>
            <h3 className="arch-diagram-title">{bp.title[lang]}</h3>
            <p className="arch-diagram-sub">{bp.subtitle[lang]}</p>
          </div>
          <span className="tag tag-mono">{bp.anchor[lang]}</span>
        </div>
      )}

      <div className="arch-svg-wrap">
        <svg
          viewBox={bp.viewBox}
          className="arch-svg"
          role="img"
          aria-label={bp.title[lang]}
        >
          <defs>
            <marker
              id={`arrow-${bp.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--ui-text-muted)" />
            </marker>
          </defs>

          {bp.edges.map((edge, idx) => (
            <line
              key={idx}
              x1={edge.from[0]}
              y1={edge.from[1]}
              x2={edge.to[0]}
              y2={edge.to[1]}
              stroke="var(--ui-text-muted)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd={`url(#arrow-${bp.id})`}
            />
          ))}

          {bp.nodes.map((node) => {
            const isActive = node.id === activeNode.id;
            return (
              <g
                key={node.id}
                className={`arch-svg-node ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveNodeId(node.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveNodeId(node.id);
                  }
                }}
                aria-label={node.label}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx={6}
                  fill={toneFill(node.tone, isActive)}
                  stroke={isActive ? 'var(--ui-accent)' : toneStroke(node.tone)}
                  strokeWidth={isActive ? 2.2 : 1.3}
                />
                <text
                  x={node.x + node.w / 2}
                  y={node.y + node.h / 2 - 6}
                  textAnchor="middle"
                  fill="var(--ui-text)"
                  fontSize="12.5"
                  fontWeight="600"
                  fontFamily="var(--ui-font)"
                >
                  {node.label}
                </text>
                <text
                  x={node.x + node.w / 2}
                  y={node.y + node.h / 2 + 13}
                  textAnchor="middle"
                  fill="var(--ui-text-2)"
                  fontSize="10.5"
                  fontFamily="var(--ui-mono)"
                >
                  {node.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="arch-node-inspector">
        <div className="arch-node-inspector-top">
          <span className="tag tag-accent">{activeNode.label}</span>
          <span className="tag tag-mono">{activeNode.detail.protocol}</span>
          <span className="arch-node-hint">
            {lang === 'en' ? 'Click any node above to inspect' : 'Klik node di atas untuk inspeksi'}
          </span>
        </div>
        <div className="arch-node-inspector-grid">
          <div>
            <div className="brief-label" style={{ marginBottom: '3px' }}>
              {lang === 'en' ? 'COMPONENT ROLE' : 'PERAN KOMPONEN'}
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ui-text-2)' }}>
              {activeNode.detail.ownership[lang]}
            </p>
          </div>
          <div>
            <div className="brief-label" style={{ marginBottom: '3px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconShield size={11} />
              {lang === 'en' ? 'FAILURE & SECURITY BOUNDARY' : 'BATAS KEGAGALAN & KEAMANAN'}
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ui-text-2)' }}>
              {activeNode.detail.resilience[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
