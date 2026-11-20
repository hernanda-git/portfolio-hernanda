import React, { useState } from 'react';
import { EXPERIENCES, PROFILE } from '../data/profile';
import { IconCheck, IconCopy, IconExternal, IconShield } from './Icons';

export const ArchitectureView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const briefText = `# ${PROFILE.name} — Executive Technical Dossier
Role: ${PROFILE.title}
Location: ${PROFILE.location} (${PROFILE.timezone})
Experience: 10+ Years (Since ${PROFILE.activeSince}, ${EXPERIENCES.length} verified engagements)
Core Stack: .NET 8/9, C#, .NET MAUI, Blazor, React, TypeScript, SQL Server, PostgreSQL, RabbitMQ, Elsa Workflow, Docker, Kubernetes, Custom AI Inference Gateways & RAG Pipelines
Sectors Delivered: AI Infrastructure, Civic RT/RW SaaS, Conglomerate Workflow (80+ apps), Health Insurance, Coal/Gold/Copper Mining, Banking Encryption (OCBC), Sharia Travel, Cold-Chain Distribution, Trucking Logistics, Government & Corrections
Contact: ${PROFILE.email} | ${PROFILE.phone} | ${PROFILE.linkedin}`;

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
    { standard: 'Bank Indonesia SNAP BI & BI-FAST', scope: 'Asymmetric RSA-SHA256 / HMAC signing, VA recon, instant payout switches, host-to-host banking cryptography.' },
    { standard: 'Kemenkes SATUSEHAT & BPJS Bridging', scope: 'HL7 FHIR R4 Encounter/Condition/MedicationRequest mapping, KFA drug codes, VClaim SEP, and Antrean Task ID 1–7.' },
    { standard: 'DJP CoreTax & Peruri e-Meterai', scope: 'NPWP-16 / NITKU validation, PPh 21 TER annualization, XML schema gates, and LTV digital stamping.' },
    { standard: 'UU PDP No. 27/2022 & Sovereign AI', scope: 'Jakarta data residency, pre-egress NIK/NPWP redaction in LLM gateways, consent ledgers, and 3x24h breach playbooks.' },
    { standard: 'Industrial Mining & Cold-Chain Operations', scope: 'Offline-first .NET MAUI field apps, Azure AD/B2C, multi-branch KPI ERPs, SCADA telemetry, and RKAB/SIMBARA readiness.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="arch-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h1 className="section-title" style={{ fontSize: '18px' }}>Architectural Philosophy &amp; Working Style</h1>
              <p className="section-desc">How software gets designed, verified, and shipped under real constraints</p>
            </div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--ui-text-2)' }}>
            <div>
              <strong style={{ color: 'var(--ui-text)' }}>1. SOLID &amp; KISS Before Hype</strong>
              <p style={{ margin: '4px 0 0' }}>
                Start with a well-bounded Modular Monolith when team size and budget demand speed; extract microservices only when scaling, deployment autonomy, or compliance boundaries truly require it.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--ui-text)' }}>2. Pragmatic AI Leverage (~20%), Human Architectural Ownership</strong>
              <p style={{ margin: '4px 0 0' }}>
                {PROFILE.summary[2]} Every production system requires observed build, test, and runtime verification — never unverified generated output.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--ui-text)' }}>3. End-to-End Ownership Across Roles</strong>
              <p style={{ margin: '4px 0 0' }}>
                Comfortable moving seamlessly from Miro/dbDiagram schema design and Figma UI mockups to .NET/React/MAUI implementation, Azure/Docker CI/CD, Apple TestFlight/Play releases, and client department training.
              </p>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: '18px' }}>Direct Contact &amp; Technical Conversation</h2>
              <p className="section-desc">Open to direct architectural conversations prior to formal interview stages</p>
            </div>
            <span className="tag tag-ok">Jakarta · Remote / Hybrid</span>
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

              <span style={{ color: 'var(--ui-text-muted)', fontFamily: 'var(--ui-mono)', fontSize: '11.5px' }}>Location</span>
              <span>{PROFILE.location} ({PROFILE.timezone})</span>
            </div>

            <div style={{ borderTop: '1px solid var(--ui-line)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="brief-label" style={{ margin: 0 }}>COPYABLE RECRUITER / CTO BRIEF</span>
                <button type="button" className="btn btn-sm btn-primary" onClick={copyBrief}>
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  {copied ? 'Copied Markdown' : 'Copy Brief'}
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
            <h2 className="section-title">Indonesian Digital Public Infrastructure &amp; Enterprise Readiness</h2>
            <p className="section-desc">Key local technical standards modeled across the 108-project Concept Atlas</p>
          </div>
          <span className="tag">
            <IconShield size={12} />
            Indonesia 2025–2026 Landscape
          </span>
        </div>

        <div className="matrix-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ width: '280px' }}>Indonesian Standard / Ecosystem</th>
                <th>Architectural Scope &amp; Design Focus</th>
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
