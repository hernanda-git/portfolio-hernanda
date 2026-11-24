import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { copyToClipboard, downloadTextFile, formatIdr, simpleHash, slugFile } from './engineHelpers';
import type { DomainEngineProps } from './engineTypes';
import './engine-shell.css';

interface PoolNode {
  id: string;
  name: string;
  region: string;
  mode: 'local' | 'cloud';
  latencyMs: number;
  quotaPct: number;
  idrPer1kTok: number;
  status: 'healthy' | 'throttled' | 'down';
}

interface TraceRow {
  id: string;
  at: string;
  routedPool: string;
  redactedTypes: string[];
  tokens: number;
  costIdr: number;
  latencyMs: number;
  promptHash: string;
  policyResult: 'masked_and_routed' | 'clean_routed' | 'blocked_egress';
}

const SAMPLE_PROMPTS = {
  en: [
    'Review vendor contract for PT Nusantara Logistik. Director NIK 3174091508880004, NPWP 01.234.567.8-091.000, payout account 1240008891223, email finance@nusantara.co.id.',
    'Summarize Q3 logistics SLA compliance across 18 branches without customer identifiers and estimate quarterly token allocation.',
  ],
  id: [
    'Tinjau kontrak vendor PT Nusantara Logistik. NIK Direktur 3174091508880004, NPWP 01.234.567.8-091.000, rekening pencairan 1240008891223, email finance@nusantara.co.id.',
    'Ringkas kepatuhan SLA logistik Q3 untuk 18 cabang tanpa data identitas pelanggan dan hitung estimasi alokasi token kuartalan.',
  ],
};

function redactPii(text: string): { masked: string; hits: string[] } {
  const hits: string[] = [];
  let masked = text;

  const rules: Array<[RegExp, string, string]> = [
    [/\b\d{16}\b/g, '[REDACTED:NIK]', 'NIK'],
    [/\b\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}\b/g, '[REDACTED:NPWP]', 'NPWP'],
    [/\b\d{10,15}\b/g, '[REDACTED:BANK_ACC]', 'BANK_ACCOUNT'],
    [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED:EMAIL]', 'EMAIL'],
    [/(\+62|08)\d{8,12}\b/g, '[REDACTED:PHONE]', 'PHONE'],
  ];

  for (const [regex, token, label] of rules) {
    if (regex.test(masked)) {
      hits.push(label);
      masked = masked.replace(regex, token);
    }
  }
  return { masked, hits };
}

export default function AiWorkbenchEngine({ project }: DomainEngineProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'router' | 'pii' | 'audit'>('router');
  const [strictLocalOnPii, setStrictLocalOnPii] = useState<boolean>(true);
  const [prompt, setPrompt] = useState<string>(SAMPLE_PROMPTS[lang][0]);
  const [lastMaskResult, setLastMaskResult] = useState<{
    masked: string;
    hits: string[];
    routedPool: string;
    costIdr: number;
    latencyMs: number;
    hash: string;
    blocked: boolean;
  } | null>(null);
  const [copiedTrace, setCopiedTrace] = useState(false);

  const [pools, setPools] = useState<PoolNode[]>([
    { id: 'POOL-01', name: 'jkt-vllm-qwen72b', region: 'Jakarta Sovereign', mode: 'local', latencyMs: 184, quotaPct: 38, idrPer1kTok: 0, status: 'healthy' },
    { id: 'POOL-02', name: 'anthropic-sonnet-pool', region: 'SG Enterprise Pool', mode: 'cloud', latencyMs: 372, quotaPct: 64, idrPer1kTok: 48, status: 'healthy' },
    { id: 'POOL-03', name: 'openai-responses-pool', region: 'SG Enterprise Pool', mode: 'cloud', latencyMs: 410, quotaPct: 86, idrPer1kTok: 42, status: 'throttled' },
    { id: 'POOL-04', name: 'gemini-flash-batch', region: 'Jakarta Edge', mode: 'cloud', latencyMs: 235, quotaPct: 29, idrPer1kTok: 12, status: 'healthy' },
  ]);

  const [traces, setTraces] = useState<TraceRow[]>([
    {
      id: 'TRC-9041',
      at: '09:41:12',
      routedPool: 'jkt-vllm-qwen72b',
      redactedTypes: ['NIK', 'NPWP'],
      tokens: 1480,
      costIdr: 0,
      latencyMs: 188,
      promptHash: 'a94f21c8e301b77d',
      policyResult: 'masked_and_routed',
    },
    {
      id: 'TRC-9040',
      at: '09:38:04',
      routedPool: 'gemini-flash-batch',
      redactedTypes: [],
      tokens: 3120,
      costIdr: 37,
      latencyMs: 242,
      promptHash: '5c1180fd92a4e612',
      policyResult: 'clean_routed',
    },
  ]);

  const cyclePoolStatus = (id: string) => {
    setPools((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next: PoolNode['status'] =
          p.status === 'healthy' ? 'throttled' : p.status === 'throttled' ? 'down' : 'healthy';
        return {
          ...p,
          status: next,
          latencyMs: next === 'healthy' ? (p.mode === 'local' ? 184 : 310) : next === 'throttled' ? 790 : 0,
        };
      })
    );
  };

  const simulateFailoverDrill = () => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === 'POOL-02' ? { ...p, status: 'down', latencyMs: 0 } : p
      )
    );
  };

  const resetPools = () => {
    setPools((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.id === 'POOL-03' ? 'throttled' : 'healthy',
        latencyMs: p.mode === 'local' ? 184 : p.id === 'POOL-04' ? 235 : 372,
      }))
    );
  };

  const activeRoute = useMemo(() => {
    const healthy = pools.filter((p) => p.status === 'healthy');
    const localHealthy = healthy.find((p) => p.mode === 'local');
    const fastestCloud = [...healthy].filter((p) => p.mode === 'cloud').sort((a, b) => a.latencyMs - b.latencyMs)[0];
    return {
      healthyCount: healthy.length,
      localHealthy,
      fastestCloud,
      fallback: pools.find((p) => p.status === 'throttled') ?? null,
    };
  }, [pools]);

  const runPolicyScanAndRoute = () => {
    const { masked, hits } = redactPii(prompt);
    const estTokens = Math.max(120, Math.round(prompt.length * 1.45));
    const hash = simpleHash(prompt + new Date().toISOString());

    let chosen: PoolNode | undefined;
    let blocked = false;

    if (hits.length > 0 && strictLocalOnPii) {
      chosen = activeRoute.localHealthy;
      if (!chosen) blocked = true;
    } else {
      chosen = activeRoute.fastestCloud ?? activeRoute.localHealthy ?? activeRoute.fallback ?? undefined;
      if (!chosen) blocked = true;
    }

    const costIdr = chosen ? Math.round((estTokens / 1000) * chosen.idrPer1kTok) : 0;
    const latencyMs = chosen ? chosen.latencyMs + Math.round((estTokens % 60) * 0.5) : 0;

    setLastMaskResult({
      masked,
      hits,
      routedPool: chosen ? chosen.name : isEn ? 'BLOCKED (No Compliant Pool)' : 'DIBLOKIR (Tidak Ada Pool Patuh)',
      costIdr,
      latencyMs,
      hash,
      blocked,
    });

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    setTraces((prev) => [
      {
        id: `TRC-${9042 + prev.length}`,
        at: timeStr,
        routedPool: chosen ? chosen.name : 'BLOCKED',
        redactedTypes: hits,
        tokens: estTokens,
        costIdr,
        latencyMs,
        promptHash: hash,
        policyResult: blocked ? 'blocked_egress' : hits.length > 0 ? 'masked_and_routed' : 'clean_routed',
      },
      ...prev,
    ]);
  };

  const totalCostIdr = traces.reduce((acc, t) => acc + t.costIdr, 0);
  const totalMaskedFields = traces.reduce((acc, t) => acc + t.redactedTypes.length, 0);
  const avgLatency = useMemo(() => {
    const valid = traces.filter((t) => t.latencyMs > 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((s, t) => s + t.latencyMs, 0) / valid.length);
  }, [traces]);

  const exportJson = JSON.stringify(
    {
      service: project.name,
      standards: project.standards,
      strictLocalOnPii,
      pools,
      recentTraces: traces,
    },
    null,
    2
  );

  return (
    <section className="eng-shell" aria-label={`${project.name} AI Inference Workbench`}>
      <div className="eng-topbar">
        <div>
          <div className="eng-eyebrow">
            <span className="status-dot ok" />
            <span>{project.id} | {isEn ? 'AI Inference & Policy Engine' : 'Engine Inference AI & Kebijakan'}</span>
            <span>|</span>
            <span>{project.standards.slice(0, 2).join(' | ')}</span>
          </div>
          <h2 className="eng-title">{project.name}</h2>
        </div>
        <div className="eng-actions">
          <button type="button" className="btn btn-sm" onClick={simulateFailoverDrill}>
            {isEn ? 'Simulate Cloud Outage' : 'Simulasi Gangguan Cloud'}
          </button>
          <button type="button" className="btn btn-sm" onClick={resetPools}>
            {isEn ? 'Restore Pools' : 'Pulihkan Pool'}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => downloadTextFile(`${slugFile(project.name)}-audit-trace.json`, exportJson, 'application/json')}
          >
            {isEn ? 'Export Trace JSON' : 'Ekspor Trace JSON'}
          </button>
        </div>
      </div>

      {/* Live KPI Strip */}
      <div className="eng-kpi-row">
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Healthy Pools' : 'Pool Sehat'}</span>
          <span className={`eng-kpi-val ${activeRoute.healthyCount >= 2 ? 'is-ok' : 'is-warn'}`}>
            {activeRoute.healthyCount} / {pools.length}
          </span>
          <span className="eng-kpi-sub">{isEn ? 'Weighted failover ready' : 'Siap failover berbobot'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Avg TTFT Latency' : 'Rata-rata Latensi TTFT'}</span>
          <span className="eng-kpi-val is-accent">{avgLatency} ms</span>
          <span className="eng-kpi-sub">{isEn ? 'Across routed traces' : 'Lintas trace terproses'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'PII Fields Masked' : 'Field PII Tersaring'}</span>
          <span className="eng-kpi-val is-warn">{totalMaskedFields}</span>
          <span className="eng-kpi-sub">{isEn ? 'Pre-egress UU PDP wall' : 'Filter UU PDP sebelum egress'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Session Chargeback' : 'Biaya Sesi'}</span>
          <span className="eng-kpi-val">{formatIdr(totalCostIdr, lang)}</span>
          <span className="eng-kpi-sub">{isEn ? 'Local vLLM = Rp 0 / tok' : 'vLLM lokal = Rp 0 / tok'}</span>
        </div>
      </div>

      {/* Sub-view Switcher */}
      <div className="eng-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={activeTab === 'router'} className={`lens-chip ${activeTab === 'router' ? 'is-active' : ''}`} onClick={() => setActiveTab('router')}>
          {isEn ? '01 Live Pool Router & Failover' : '01 Router Pool & Failover'}
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'pii'} className={`lens-chip ${activeTab === 'pii' ? 'is-active' : ''}`} onClick={() => setActiveTab('pii')}>
          {isEn ? '02 UU PDP PII Concrete Wall Tester' : '02 Uji Filter PII UU PDP'}
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'audit'} className={`lens-chip ${activeTab === 'audit' ? 'is-active' : ''}`} onClick={() => setActiveTab('audit')}>
          {isEn ? `03 Audit Hash Ledger (${traces.length})` : `03 Ledger Hash Audit (${traces.length})`}
        </button>
      </div>

      {activeTab === 'router' && (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Inference Provider Pools (Click status to simulate fault)' : 'Pool Provider Inference (Klik status untuk simulasi gangguan)'}</h3>
              <span className="tag tag-mono">Deterministic Weight</span>
            </div>
            <div className="eng-list">
              {pools.map((pool) => (
                <div key={pool.id} className="eng-row" style={{ cursor: 'default' }}>
                  <div className="eng-row-main">
                    <div className="eng-row-title">
                      <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)', marginRight: '6px' }}>{pool.id}</span>
                      {pool.name}
                    </div>
                    <div className="eng-row-sub">
                      {pool.region} | {pool.latencyMs > 0 ? `${pool.latencyMs} ms` : 'OFFLINE'} | {pool.idrPer1kTok === 0 ? (isEn ? 'Local Sovereign' : 'Lokal Berdaulat') : `${formatIdr(pool.idrPer1kTok, lang)} / 1K tok`}
                    </div>
                    <div style={{ marginTop: '6px', maxWidth: '240px' }}>
                      <div className="eng-bar-track">
                        <div
                          className={`eng-bar-fill ${pool.quotaPct > 80 ? 'is-warn' : 'is-ok'}`}
                          style={{ width: `${pool.quotaPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`tag ${pool.status === 'healthy' ? 'tag-ok' : pool.status === 'throttled' ? 'tag-warn' : 'tag-bad'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => cyclePoolStatus(pool.id)}
                  >
                    {pool.status.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Active Routing Decision' : 'Keputusan Routing Aktif'}</h3>
              <span className="tag tag-accent">Live Policy</span>
            </div>
            <div className="eng-card-body">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={strictLocalOnPii}
                  onChange={(e) => setStrictLocalOnPii(e.target.checked)}
                />
                <span>
                  {isEn
                    ? 'Strict UU PDP: force local Jakarta vLLM whenever PII is detected (block cloud egress if local is down)'
                    : 'Ketat UU PDP: wajibkan vLLM lokal Jakarta saat PII terdeteksi (blokir egress cloud jika lokal down)'}
                </span>
              </label>

              <div className={`eng-banner ${activeRoute.localHealthy ? 'is-ok' : 'is-bad'}`}>
                <strong>{isEn ? 'PII-Bearing Route:' : 'Rute Bermuatan PII:'}</strong>{' '}
                {activeRoute.localHealthy
                  ? `${activeRoute.localHealthy.name} (${activeRoute.localHealthy.latencyMs} ms)`
                  : strictLocalOnPii
                    ? (isEn ? 'EGRESS BLOCKED (Local sovereign node offline)' : 'EGRESS DIBLOKIR (Node lokal sedang offline)')
                    : `${activeRoute.fastestCloud?.name ?? 'NONE'} (Masked before cloud egress)`}
              </div>

              <div className={`eng-banner ${activeRoute.fastestCloud ? 'is-ok' : 'is-warn'}`}>
                <strong>{isEn ? 'General Reasoning Route:' : 'Rute Reasoning Umum:'}</strong>{' '}
                {activeRoute.fastestCloud
                  ? `${activeRoute.fastestCloud.name} (${activeRoute.fastestCloud.latencyMs} ms)`
                  : activeRoute.localHealthy
                    ? `${activeRoute.localHealthy.name} (${isEn ? 'Failover to local' : 'Failover ke lokal'})`
                    : (isEn ? 'All primary pools offline' : 'Semua pool utama offline')}
              </div>

              <div className="eng-kv-list">
                <span className="eng-kv-k">Edge Gateway</span>
                <span className="eng-kv-v">{project.architecture.edge}</span>
                <span className="eng-kv-k">Core Engine</span>
                <span className="eng-kv-v">{project.architecture.core}</span>
                <span className="eng-kv-k">Storage</span>
                <span className="eng-kv-v">{project.architecture.storage}</span>
              </div>

              <button type="button" className="btn btn-primary" onClick={() => setActiveTab('pii')}>
                {isEn ? 'Test Live Prompt Against This Policy' : 'Uji Prompt Langsung ke Kebijakan Ini'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pii' && (
        <div className="eng-grid-equal">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Prompt Payload Input' : 'Input Payload Prompt'}</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" className="btn btn-sm" onClick={() => setPrompt(SAMPLE_PROMPTS[lang][0])}>
                  {isEn ? 'Load PII Sample' : 'Muat Contoh PII'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => setPrompt(SAMPLE_PROMPTS[lang][1])}>
                  {isEn ? 'Load Clean Sample' : 'Muat Contoh Bersih'}
                </button>
              </div>
            </div>
            <div className="eng-card-body">
              <label className="eng-field-label" htmlFor="ai-prompt-box">
                {isEn ? 'Include Indonesian NIK (16 digits), NPWP, Bank Account, Email, or Phone to test live redaction:' : 'Masukkan NIK (16 digit), NPWP, Nomor Rekening, Email, atau HP untuk menguji masking langsung:'}
              </label>
              <textarea
                id="ai-prompt-box"
                className="eng-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={runPolicyScanAndRoute}>
                {isEn ? 'Run Policy Scan & Route Request' : 'Jalankan Pemindaian Kebijakan & Routing'}
              </button>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Redaction & Routing Output' : 'Hasil Redaksi & Routing'}</h3>
              {lastMaskResult && (
                <span className={`tag ${lastMaskResult.blocked ? 'tag-bad' : lastMaskResult.hits.length ? 'tag-warn' : 'tag-ok'}`}>
                  {lastMaskResult.blocked
                    ? (isEn ? 'BLOCKED' : 'DIBLOKIR')
                    : lastMaskResult.hits.length
                      ? `${lastMaskResult.hits.length} PII MASKED`
                      : (isEn ? 'CLEAN PASS' : 'LOLOS BERSIH')}
                </span>
              )}
            </div>
            <div className="eng-card-body">
              {!lastMaskResult ? (
                <div className="eng-banner">
                  {isEn
                    ? 'Click "Run Policy Scan & Route Request" to inspect sanitized outbound text, routing decision, cost attribution, and SHA-style prompt hash.'
                    : 'Klik "Jalankan Pemindaian Kebijakan & Routing" untuk melihat hasil redaksi, keputusan rute, biaya token, dan hash audit prompt.'}
                </div>
              ) : (
                <>
                  <div className={`eng-banner ${lastMaskResult.blocked ? 'is-bad' : 'is-ok'}`}>
                    <strong>{isEn ? 'Decision:' : 'Keputusan:'}</strong> {lastMaskResult.routedPool}
                    {!lastMaskResult.blocked && ` | ${lastMaskResult.latencyMs} ms | ${formatIdr(lastMaskResult.costIdr, lang)}`}
                  </div>
                  <div>
                    <div className="eng-field-label">{isEn ? 'Sanitized Outbound Prompt' : 'Prompt Keluar Setelah Masking'}</div>
                    <pre className="eng-code">{lastMaskResult.masked}</pre>
                  </div>
                  <div className="eng-kv-list">
                    <span className="eng-kv-k">Detected PII</span>
                    <span className="eng-kv-v">{lastMaskResult.hits.length ? lastMaskResult.hits.join(', ') : (isEn ? 'None' : 'Tidak ada')}</span>
                    <span className="eng-kv-k">Audit Hash</span>
                    <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>{lastMaskResult.hash}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="eng-card">
          <div className="eng-card-head">
            <h3 className="eng-card-title">{isEn ? 'Immutable Prompt Hash & Chargeback Ledger (Zero Raw PII Stored)' : 'Ledger Hash Prompt & Chargeback (Tanpa Menyimpan PII Mentah)'}</h3>
            <button
              type="button"
              className="btn btn-sm"
              onClick={async () => {
                if (await copyToClipboard(exportJson)) {
                  setCopiedTrace(true);
                  setTimeout(() => setCopiedTrace(false), 1800);
                }
              }}
            >
              {copiedTrace ? (isEn ? 'Copied JSON' : 'JSON Tersalin') : (isEn ? 'Copy JSON' : 'Salin JSON')}
            </button>
          </div>
          <div className="matrix-wrap" style={{ border: 0, borderRadius: 0 }}>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Trace ID</th>
                  <th>{isEn ? 'Time' : 'Waktu'}</th>
                  <th>{isEn ? 'Routed Pool' : 'Pool Tujuan'}</th>
                  <th>{isEn ? 'Masked PII' : 'PII Disaring'}</th>
                  <th>Tokens</th>
                  <th>{isEn ? 'Cost' : 'Biaya'}</th>
                  <th>{isEn ? 'Prompt Hash' : 'Hash Prompt'}</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--ui-mono)' }}>{t.id}</td>
                    <td style={{ fontFamily: 'var(--ui-mono)' }}>{t.at}</td>
                    <td style={{ fontWeight: 600 }}>{t.routedPool}</td>
                    <td>
                      {t.redactedTypes.length ? (
                        <span className="tag tag-warn">{t.redactedTypes.join(', ')}</span>
                      ) : (
                        <span className="tag tag-ok">{isEn ? 'None' : 'Bersih'}</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--ui-mono)' }}>{t.tokens}</td>
                    <td style={{ fontFamily: 'var(--ui-mono)' }}>{formatIdr(t.costIdr, lang)}</td>
                    <td style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)' }}>{t.promptHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
