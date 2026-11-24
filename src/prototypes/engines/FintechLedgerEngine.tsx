import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { downloadTextFile, formatIdr, simpleHash, slugFile } from './engineHelpers';
import type { DomainEngineProps } from './engineTypes';
import './engine-shell.css';

interface LedgerLine {
  id: string;
  ref: string;
  account: string;
  debit: number;
  credit: number;
  rail: 'BI-FAST' | 'SNAP VA' | 'ESCROW' | 'TAX';
  status: 'SETTLED' | 'PENDING_SIGN' | 'DISPUTE_HOLD';
  memo: string;
}

const ACCOUNTS = [
  '1010 - BI-FAST Clearing Account',
  '1020 - Escrow Custodian Sub-Account',
  '2010 - Client Payable / Disbursement',
  '2040 - PPh Final Tax Payable',
  '4010 - Platform Fee Revenue',
];

export default function FintechLedgerEngine({ project }: DomainEngineProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'ledger' | 'snap'>('ledger');
  const [entries, setEntries] = useState<LedgerLine[]>([
    { id: 'JRN-101', ref: 'TRX-8821', account: '1010 - BI-FAST Clearing Account', debit: 125000000, credit: 0, rail: 'BI-FAST', status: 'SETTLED', memo: 'Milestone 1 funding receipt' },
    { id: 'JRN-102', ref: 'TRX-8821', account: '1020 - Escrow Custodian Sub-Account', debit: 0, credit: 123750000, rail: 'ESCROW', status: 'SETTLED', memo: 'Locked in project sub-account' },
    { id: 'JRN-103', ref: 'TRX-8821', account: '4010 - Platform Fee Revenue', debit: 0, credit: 1250000, rail: 'ESCROW', status: 'SETTLED', memo: '1% custodian platform fee' },
    { id: 'JRN-104', ref: 'TRX-8822', account: '1020 - Escrow Custodian Sub-Account', debit: 45000000, credit: 0, rail: 'SNAP VA', status: 'PENDING_SIGN', memo: 'Release tranche BAST approved' },
    { id: 'JRN-105', ref: 'TRX-8822', account: '2010 - Client Payable / Disbursement', debit: 0, credit: 44100000, rail: 'BI-FAST', status: 'PENDING_SIGN', memo: 'Net contractor payout' },
    { id: 'JRN-106', ref: 'TRX-8822', account: '2040 - PPh Final Tax Payable', debit: 0, credit: 900000, rail: 'TAX', status: 'PENDING_SIGN', memo: '2% PPh Final withholding' },
  ]);

  const [debitAccount, setDebitAccount] = useState(ACCOUNTS[0]);
  const [creditAccount, setCreditAccount] = useState(ACCOUNTS[2]);
  const [debitAmt, setDebitAmt] = useState('25000000');
  const [creditAmt, setCreditAmt] = useState('25000000');
  const [memo, setMemo] = useState(isEn ? 'Vendor settlement batch via BI-FAST' : 'Pencairan batch vendor via BI-FAST');
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  const [snapPartnerId, setSnapPartnerId] = useState('PARTNER-ID-00192');
  const [snapState, setSnapState] = useState<'DRAFT' | 'RSA_SIGNED' | 'BIFAST_SETTLED' | 'RECON_MISMATCH'>('RSA_SIGNED');

  const totals = useMemo(() => {
    const debit = entries.reduce((s, e) => s + e.debit, 0);
    const credit = entries.reduce((s, e) => s + e.credit, 0);
    const pendingCount = entries.filter((e) => e.status === 'PENDING_SIGN').length;
    return { debit, credit, diff: debit - credit, pendingCount };
  }, [entries]);

  const postDoubleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const d = Number(debitAmt) || 0;
    const c = Number(creditAmt) || 0;
    if (d <= 0 || c <= 0) {
      setPostError(isEn ? 'Both debit and credit amounts must be greater than zero.' : 'Nilai debit dan kredit harus lebih besar dari nol.');
      setPostSuccess('');
      return;
    }
    if (d !== c) {
      setPostError(
        isEn
          ? `ACID Guard Rejected: Unbalanced journal (variance ${formatIdr(Math.abs(d - c), lang)}). Total Debit must equal Total Credit.`
          : `Ditolak Guard ACID: Jurnal tidak seimbang (selisih ${formatIdr(Math.abs(d - c), lang)}). Total Debit wajib sama dengan Total Kredit.`
      );
      setPostSuccess('');
      return;
    }
    if (debitAccount === creditAccount) {
      setPostError(isEn ? 'Debit and credit accounts must be distinct.' : 'Akun debit dan kredit harus berbeda.');
      setPostSuccess('');
      return;
    }
    const ref = `TRX-${8823 + Math.floor(entries.length / 2)}`;
    const nextIdx = 101 + entries.length;
    setEntries((prev) => [
      { id: `JRN-${nextIdx}`, ref, account: debitAccount, debit: d, credit: 0, rail: 'BI-FAST', status: 'SETTLED', memo },
      { id: `JRN-${nextIdx + 1}`, ref, account: creditAccount, debit: 0, credit: c, rail: 'BI-FAST', status: 'SETTLED', memo },
      ...prev,
    ]);
    setPostError('');
    setPostSuccess(isEn ? `Posted balanced journal ${ref} (${formatIdr(d, lang)}).` : `Jurnal seimbang ${ref} berhasil diposting (${formatIdr(d, lang)}).`);
  };

  const settlePending = () => {
    setEntries((prev) => prev.map((e) => (e.status === 'PENDING_SIGN' ? { ...e, status: 'SETTLED' } : e)));
    setSnapState('BIFAST_SETTLED');
  };

  const exportCsv = () => {
    const header = 'ID,Ref,Account,Debit,Credit,Rail,Status,Memo';
    const rows = entries.map((e) => `${e.id},${e.ref},"${e.account}",${e.debit},${e.credit},${e.rail},${e.status},"${e.memo.replace(/"/g, '""')}"`);
    downloadTextFile(`${slugFile(project.name)}-ledger.csv`, [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  const snapTimestamp = '2026-11-24T15:10:00+07:00';
  const snapPayload = JSON.stringify(
    {
      partnerReferenceNo: `REF-${project.id}-20261124`,
      amount: { value: `${Number(debitAmt || 0).toFixed(2)}`, currency: 'IDR' },
      beneficiaryAccountNo: '001928374612',
      additionalInfo: { rail: 'BI-FAST', project: project.name, state: snapState },
    },
    null,
    2
  );
  const canonicalSig = simpleHash(`${snapPartnerId}|${snapTimestamp}|${snapPayload}`);

  return (
    <section className="eng-shell" aria-label={`${project.name} Financial Ledger Engine`}>
      <div className="eng-topbar">
        <div>
          <div className="eng-eyebrow">
            <span className="status-dot ok" />
            <span>{project.id} | {isEn ? 'Double-Entry Ledger & SNAP BI Engine' : 'Engine Buku Besar Double-Entry & SNAP BI'}</span>
            <span>|</span>
            <span>{project.standards.slice(0, 2).join(' | ')}</span>
          </div>
          <h2 className="eng-title">{project.name}</h2>
        </div>
        <div className="eng-actions">
          {totals.pendingCount > 0 && (
            <button type="button" className="btn btn-sm" onClick={settlePending}>
              {isEn ? `Settle ${totals.pendingCount} Pending Lines` : `Selesaikan ${totals.pendingCount} Baris Pending`}
            </button>
          )}
          <button type="button" className="btn btn-sm btn-primary" onClick={exportCsv}>
            {isEn ? 'Export Ledger CSV' : 'Ekspor CSV Buku Besar'}
          </button>
        </div>
      </div>

      <div className="eng-kpi-row">
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Total Debit' : 'Total Debit'}</span>
          <span className="eng-kpi-val">{formatIdr(totals.debit, lang)}</span>
          <span className="eng-kpi-sub">{entries.length} {isEn ? 'posted lines' : 'baris jurnal'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'Total Credit' : 'Total Kredit'}</span>
          <span className="eng-kpi-val">{formatIdr(totals.credit, lang)}</span>
          <span className="eng-kpi-sub">{isEn ? 'Trial balance sum' : 'Akumulasi neraca'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'ACID Balance Variance' : 'Selisih Neraca ACID'}</span>
          <span className={`eng-kpi-val ${totals.diff === 0 ? 'is-ok' : 'is-bad'}`}>
            {formatIdr(totals.diff, lang)}
          </span>
          <span className="eng-kpi-sub">{totals.diff === 0 ? (isEn ? 'Balanced (0 drift)' : 'Seimbang (0 selisih)') : 'IMBALANCE'}</span>
        </div>
        <div className="eng-kpi">
          <span className="eng-kpi-label">{isEn ? 'SNAP / BI-FAST Rail' : 'Status Rail SNAP / BI-FAST'}</span>
          <span className={`eng-kpi-val ${snapState === 'BIFAST_SETTLED' ? 'is-ok' : snapState === 'RECON_MISMATCH' ? 'is-bad' : 'is-accent'}`}>
            {snapState}
          </span>
          <span className="eng-kpi-sub">RSA-SHA256 / Idempotent</span>
        </div>
      </div>

      <div className="eng-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={activeTab === 'ledger'} className={`lens-chip ${activeTab === 'ledger' ? 'is-active' : ''}`} onClick={() => setActiveTab('ledger')}>
          {isEn ? '01 Double-Entry Posting & Trial Balance' : '01 Posting Double-Entry & Neraca'}
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'snap'} className={`lens-chip ${activeTab === 'snap' ? 'is-active' : ''}`} onClick={() => setActiveTab('snap')}>
          {isEn ? '02 SNAP BI Signature & Settlement Rail' : '02 Signature SNAP BI & Rail Settlement'}
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <div className="eng-grid-2">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'General Ledger Journal' : 'Jurnal Buku Besar'}</h3>
              <span className="tag tag-ok">ACID Enforced</span>
            </div>
            <div className="matrix-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>{isEn ? 'Account' : 'Akun'}</th>
                    <th>Debit</th>
                    <th>{isEn ? 'Credit' : 'Kredit'}</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontFamily: 'var(--ui-mono)' }}>{row.ref}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.account}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{row.memo}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--ui-mono)' }}>{row.debit ? formatIdr(row.debit, lang) : '-'}</td>
                      <td style={{ fontFamily: 'var(--ui-mono)' }}>{row.credit ? formatIdr(row.credit, lang) : '-'}</td>
                      <td>
                        <span className={`tag ${row.status === 'SETTLED' ? 'tag-ok' : 'tag-warn'}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Post Balanced Journal Entry' : 'Posting Entri Jurnal Seimbang'}</h3>
              <span className="tag tag-mono">Debit = Credit</span>
            </div>
            <form className="eng-card-body" onSubmit={postDoubleEntry}>
              <div>
                <label className="eng-field-label" htmlFor="dr-acc">{isEn ? 'Debit Account' : 'Akun Debit'}</label>
                <select id="dr-acc" className="eng-select" value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)}>
                  {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="eng-field-label" htmlFor="cr-acc">{isEn ? 'Credit Account' : 'Akun Kredit'}</label>
                <select id="cr-acc" className="eng-select" value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)}>
                  {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="eng-form-grid">
                <div>
                  <label className="eng-field-label" htmlFor="dr-amt">{isEn ? 'Debit Amount (IDR)' : 'Nominal Debit (IDR)'}</label>
                  <input id="dr-amt" type="number" className="eng-input" value={debitAmt} onChange={(e) => setDebitAmt(e.target.value)} />
                </div>
                <div>
                  <label className="eng-field-label" htmlFor="cr-amt">{isEn ? 'Credit Amount (IDR)' : 'Nominal Kredit (IDR)'}</label>
                  <input id="cr-amt" type="number" className="eng-input" value={creditAmt} onChange={(e) => setCreditAmt(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="eng-field-label" htmlFor="jrn-memo">{isEn ? 'Journal Memo' : 'Catatan Jurnal'}</label>
                <input id="jrn-memo" type="text" className="eng-input" value={memo} onChange={(e) => setMemo(e.target.value)} />
              </div>

              {postError && <div className="eng-banner is-bad">{postError}</div>}
              {postSuccess && <div className="eng-banner is-ok">{postSuccess}</div>}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">
                  {isEn ? 'Validate & Post Entry' : 'Validasi & Posting Jurnal'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setCreditAmt(String(Math.max(0, (Number(debitAmt) || 0) - 500000)))}
                >
                  {isEn ? 'Test Imbalance Guard' : 'Uji Guard Selisih'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="eng-grid-equal">
          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'SNAP BI Settlement State Machine' : 'State Machine Settlement SNAP BI'}</h3>
              <span className="tag tag-mono">{snapState}</span>
            </div>
            <div className="eng-card-body">
              <div>
                <label className="eng-field-label" htmlFor="snap-partner">X-PARTNER-ID</label>
                <input id="snap-partner" className="eng-input" value={snapPartnerId} onChange={(e) => setSnapPartnerId(e.target.value)} />
              </div>
              <div className="eng-kv-list">
                <span className="eng-kv-k">X-TIMESTAMP</span>
                <span className="eng-kv-v">{snapTimestamp}</span>
                <span className="eng-kv-k">X-SIGNATURE</span>
                <span className="eng-kv-v" style={{ fontFamily: 'var(--ui-mono)' }}>RSA-SHA256:{canonicalSig}</span>
                <span className="eng-kv-k">Idempotency</span>
                <span className="eng-kv-v">X-EXTERNAL-ID-{project.id}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-sm" onClick={() => setSnapState('RSA_SIGNED')}>1. Sign Payload</button>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => setSnapState('BIFAST_SETTLED')}>2. Dispatch BI-FAST</button>
                <button type="button" className="btn btn-sm" onClick={() => setSnapState('RECON_MISMATCH')}>3. Simulate Recon Mismatch</button>
              </div>
              <div className={`eng-banner ${snapState === 'RECON_MISMATCH' ? 'is-bad' : snapState === 'BIFAST_SETTLED' ? 'is-ok' : ''}`}>
                {snapState === 'RECON_MISMATCH'
                  ? (isEn ? 'Reconciliation mismatch detected against bank statement. Auto-placed into dispute hold queue.' : 'Selisih rekonsiliasi terdeteksi terhadap mutasi bank. Otomatis masuk antrean sengketa.')
                  : snapState === 'BIFAST_SETTLED'
                    ? (isEn ? 'BI-FAST payout settled with matching clearing hash and immutable ledger posting.' : 'Payout BI-FAST tuntas dengan hash kliring cocok dan jurnal buku besar terkunci.')
                    : (isEn ? 'Canonical payload signed and ready for host-to-host transmission.' : 'Payload kanonis sudah ditandatangani dan siap dikirim host-to-host.')}
              </div>
            </div>
          </div>

          <div className="eng-card">
            <div className="eng-card-head">
              <h3 className="eng-card-title">{isEn ? 'Canonical SNAP BI Request Payload' : 'Payload Request Kanonis SNAP BI'}</h3>
              <span className="tag tag-mono">JSON</span>
            </div>
            <div className="eng-card-body">
              <pre className="eng-code">{snapPayload}</pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
