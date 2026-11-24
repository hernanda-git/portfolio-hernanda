import React, { useState } from 'react';
import { EXPERIENCES, PROFILE } from '../data/profile';
import { IconCheck, IconCopy, IconExternal, IconShield } from './Icons';

interface ArchitectureViewProps {
  totalProjects: number;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ totalProjects }) => {
  const [copied, setCopied] = useState(false);

  const briefText = `# ${PROFILE.name} - Ringkasan Eksekutif Teknis
Peran: ${PROFILE.title}
Lokasi: ${PROFILE.location} (${PROFILE.timezone})
Pengalaman: 10+ Tahun (Sejak ${PROFILE.activeSince}, ${EXPERIENCES.length} pengalaman terverifikasi CV)
Core Stack: .NET 8/9, C#, .NET MAUI, Blazor, React, TypeScript, SQL Server, PostgreSQL, RabbitMQ, Elsa Workflow, Docker, Kubernetes, Custom AI Inference Gateways & RAG Pipelines
Sektor Produksi: Infrastruktur AI, SaaS Kewargaan RT/RW, Workflow Konglomerasi (80+ aplikasi), Asuransi Kesehatan, Pertambangan Batu Bara/Emas/Tembaga, Enkripsi Perbankan (OCBC), Travel Syariah, Distribusi Cold-Chain, Logistik Truk, Pemerintahan & Pemasyarakatan
Kontak: ${PROFILE.email} | ${PROFILE.phone} | ${PROFILE.linkedin}`;

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const dpiReadiness = [
    { standard: 'Bank Indonesia SNAP BI & BI-FAST', scope: 'Signing asimetris RSA-SHA256 / HMAC, rekonsiliasi Virtual Account, switch payout instan, dan kriptografi host-to-host perbankan.' },
    { standard: 'Kemenkes SATUSEHAT & Bridging BPJS', scope: 'Pemetaan HL7 FHIR R4 (Encounter/Condition/MedicationRequest), kode obat KFA, VClaim SEP, serta Antrean Online Task ID 1-7.' },
    { standard: 'DJP CoreTax & Peruri e-Meterai', scope: 'Validasi NPWP-16 / NITKU, tahunanisasi PPh 21 TER, gerbang validasi skema XML, dan pembubuhan meterai elektronik LTV.' },
    { standard: 'UU PDP No. 27/2022 & Sovereign AI', scope: 'Residensi data Jakarta, masking NIK/NPWP sebelum egress di AI Gateway, ledger persetujuan, dan playbook insiden 3x24 jam.' },
    { standard: 'Operasional Tambang & Cold-Chain Industri', scope: 'Aplikasi lapangan .NET MAUI offline-first, Azure AD/B2C, ERP KPI multi-cabang, telemetri SCADA, dan kesiapan RKAB/SIMBARA.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="arch-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h1 className="section-title" style={{ fontSize: '18px' }}>Filosofi Arsitektur &amp; Cara Kerja</h1>
              <p className="section-desc">Bagaimana perangkat lunak dirancang, diverifikasi, dan dirilis di bawah batasan nyata</p>
            </div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--ui-text-2)' }}>
            <div>
              <strong style={{ color: 'var(--ui-text)' }}>1. SOLID &amp; KISS Sebelum Hype</strong>
              <p style={{ margin: '4px 0 0' }}>
                Mulai dari Modular Monolith dengan batas domain yang tegas saat ukuran tim dan anggaran menuntut kecepatan; pecah ke microservices hanya ketika skala, otonomi deployment, atau batas kepatuhan benar-benar memerlukannya.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--ui-text)' }}>2. Pemanfaatan AI Pragmatis (~20%), Kendali Arsitektur Tetap di Engineer</strong>
              <p style={{ margin: '4px 0 0' }}>
                {PROFILE.summary[3]} Setiap sistem produksi wajib melalui verifikasi build, test, dan runtime yang teramati - bukan keluaran generatif tanpa pembuktian.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--ui-text)' }}>3. Tanggung Jawab End-to-End Lintas Peran</strong>
              <p style={{ margin: '4px 0 0' }}>
                Terbiasa berpindah mulus dari perancangan skema di Miro/dbDiagram dan mockup UI di Figma hingga implementasi .NET/React/MAUI, CI/CD Azure/Docker, rilis Apple TestFlight/Google Play, serta pelatihan departemen klien.
              </p>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: '18px' }}>Kontak Langsung &amp; Diskusi Teknis</h2>
              <p className="section-desc">Terbuka untuk diskusi arsitektur secara langsung sebelum tahapan wawancara formal</p>
            </div>
            <span className="tag tag-ok">Jakarta | Remote / Hybrid</span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--ui-text-muted)', fontFamily: 'var(--ui-mono)', fontSize: '11.5px' }}>Email</span>
              <a href={`mailto:${PROFILE.email}`} style={{ fontWeight: 500 }}>{PROFILE.email}</a>

              <span style={{ color: 'var(--ui-text-muted)', fontFamily: 'var(--ui-mono)', fontSize: '11.5px' }}>WhatsApp</span>
              <a href="https://wa.me/6281280031995" target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>
                {PROFILE.phone} <IconExternal size={11} />
              </a>

              <span style={{ color: 'var(--ui-text-muted)', fontFamily: 'var(--ui-mono)', fontSize: '11.5px' }}>LinkedIn</span>
              <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>
                {PROFILE.linkedinLabel} <IconExternal size={11} />
              </a>

              <span style={{ color: 'var(--ui-text-muted)', fontFamily: 'var(--ui-mono)', fontSize: '11.5px' }}>Lokasi</span>
              <span>{PROFILE.location} ({PROFILE.timezone})</span>
            </div>

            <div style={{ borderTop: '1px solid var(--ui-line)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="brief-label" style={{ margin: 0 }}>RINGKASAN SIAP SALIN UNTUK RECRUITER / CTO</span>
                <button type="button" className="btn btn-sm btn-primary" onClick={copyBrief}>
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  {copied ? 'Tersalin (Markdown)' : 'Salin Ringkasan'}
                </button>
              </div>
              <div className="code-block">{briefText}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Indonesian Digital Public Infrastructure Matrix */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="section-title">Kesiapan Infrastruktur Publik Digital (DPI) &amp; Enterprise Indonesia</h2>
            <p className="section-desc">Standar teknis lokal utama yang dimodelkan di seluruh {totalProjects} konsep Atlas Produk</p>
          </div>
          <span className="tag">
            <IconShield size={12} />
            Lanskap Indonesia 2025-2026
          </span>
        </div>

        <div className="matrix-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ width: '280px' }}>Standar / Ekosistem Indonesia</th>
                <th>Cakupan Arsitektur &amp; Fokus Desain</th>
              </tr>
            </thead>
            <tbody>
              {dpiReadiness.map((row) => (
                <tr key={row.standard} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 600 }}>{row.standard}</td>
                  <td style={{ color: 'var(--ui-text-2)' }}>{row.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
