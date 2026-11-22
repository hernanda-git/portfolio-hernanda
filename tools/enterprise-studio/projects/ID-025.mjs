import {
  esc,
  fmtNum,
  fmtIdr,
  fmtPct,
  ic,
  badge,
  wrapEnterpriseHtml,
  renderStatusFooter,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgSparkline,
  svgStackedBarChart,
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-025',
  name: 'KatalogLive Studio',
  reference: 'Databricks Lakehouse BI + Tableau Enterprise',
  persona: 'R. Kusuma · Head of Live Broadcast & BI · Nusantara MCN',
  pages: [
    { slug: 'p1', title: 'Kokpit Siaran & Analitik GMV Real-Time' },
    { slug: 'p2', title: 'Workbench Etalase, Stok Flash & Konversi' },
    { slug: 'p3', title: 'Lineage Medallion ClickHouse & Kontrak SQL/dbt' },
    { slug: 'p4', title: 'Penjaga ROAS GMV Max, Waterfall & What-If' },
    { slug: 'p5', title: 'Jadwal Shift 12 Jam, Peringkat Host & Retensi' },
    { slug: 'p6', title: 'Settlement Bonus, Affiliate & CoreTax XML' },
    { slug: 'p7', title: 'Persetujuan DoA, UU PDP & Audit WORM SHA-256' },
    { slug: 'p8', title: 'Teleprompter Host, Mobile Produser & SignalR API' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P8)
// ============================================================================

// 18 Etalase SKUs in Studio 2 — Maraton Payday (Total GMV = Rp 64.200.000, 641 unit terjual dari 312 pesanan lunas, CVR 4,9%)
const ETALASE = [
  { code: 'ET-01', name: 'Gamis Linen Sage (M/L)', cat: 'Gamis', channel: 'TikTok Shop', price: 155000, units: 160, clicks: 2580, stock: 67, sizes: { S: 28, M: 19, L: 6, XL: 14 }, marginPct: 36, status: 'Size Tipis', tone: 'warn', selected: true },
  { code: 'ET-04', name: 'Hijab Voal Laser Cut 3s', cat: 'Bundle', channel: 'TikTok Shop', price: 95500, units: 200, clicks: 3704, stock: 412, sizes: { S: 0, M: 210, L: 202, XL: 0 }, marginPct: 48, status: 'Laris', tone: 'ok' },
  { code: 'ET-02', name: 'Tunik Katun Rayon Olive', cat: 'Tunik', channel: 'Shopee Live', price: 125000, units: 28, clicks: 610, stock: 84, sizes: { S: 20, M: 26, L: 22, XL: 16 }, marginPct: 38, status: 'Aktif', tone: 'ok' },
  { code: 'ET-03', name: 'Pashmina Silk Premium Nude', cat: 'Hijab', channel: 'TikTok Shop', price: 65000, units: 44, clicks: 820, stock: 215, sizes: { S: 0, M: 115, L: 100, XL: 0 }, marginPct: 52, status: 'Laris', tone: 'ok' },
  { code: 'ET-05', name: 'Rok Plisket Hyget Mocca', cat: 'Bawahan', channel: 'Shopee Live', price: 80000, units: 30, clicks: 680, stock: 142, sizes: { S: 32, M: 46, L: 40, XL: 24 }, marginPct: 42, status: 'Aktif', tone: 'ok' },
  { code: 'ET-06', name: 'Inner Ciput Rajut Anti-Pusing', cat: 'Add-on', channel: 'TikTok Shop', price: 35000, units: 56, clicks: 1090, stock: 520, sizes: { S: 0, M: 520, L: 0, XL: 0 }, marginPct: 58, status: 'Add-on', tone: 'info' },
  { code: 'ET-07', name: 'Kemeja Linen Oversize Putih', cat: 'Atasan', channel: 'TikTok Shop', price: 140000, units: 13, clicks: 410, stock: 19, sizes: { S: 5, M: 3, L: 6, XL: 5 }, marginPct: 35, status: 'Size Tipis', tone: 'warn' },
  { code: 'ET-08', name: 'Setelan Kulot Crinkle Cream', cat: 'Setelan', channel: 'Shopee Live', price: 160000, units: 10, clicks: 380, stock: 58, sizes: { S: 14, M: 18, L: 16, XL: 10 }, marginPct: 34, status: 'Stabil', tone: 'neutral' },
  { code: 'ET-09', name: 'Cardigan Rajut Cable Oat', cat: 'Outer', channel: 'TikTok Shop', price: 130000, units: 10, clicks: 340, stock: 44, sizes: { S: 10, M: 14, L: 12, XL: 8 }, marginPct: 37, status: 'Stabil', tone: 'neutral' },
  { code: 'ET-10', name: 'Mukena Travel Parasut Mini', cat: 'Ibadah', channel: 'Shopee Live', price: 145000, units: 8, clicks: 290, stock: 92, sizes: { S: 0, M: 92, L: 0, XL: 0 }, marginPct: 41, status: 'Stabil', tone: 'neutral' },
  { code: 'ET-11', name: 'Manset Rayon Spandex Hitam', cat: 'Add-on', channel: 'TikTok Shop', price: 45000, units: 20, clicks: 450, stock: 310, sizes: { S: 70, M: 100, L: 90, XL: 50 }, marginPct: 55, status: 'Add-on', tone: 'info' },
  { code: 'ET-12', name: 'Tas Selempang Kanvas Tote', cat: 'Aksesori', channel: 'Shopee Live', price: 95000, units: 8, clicks: 280, stock: 66, sizes: { S: 0, M: 66, L: 0, XL: 0 }, marginPct: 40, status: 'Antre Pin', tone: 'neutral' },
  { code: 'ET-13', name: 'Bros Magnet Hijab Mutiara 6s', cat: 'Add-on', channel: 'TikTok Shop', price: 30000, units: 22, clicks: 490, stock: 480, sizes: { S: 0, M: 480, L: 0, XL: 0 }, marginPct: 62, status: 'Add-on', tone: 'info' },
  { code: 'ET-14', name: 'Vest Rajut V-Neck Charcoal', cat: 'Outer', channel: 'TikTok Shop', price: 110000, units: 4, clicks: 210, stock: 11, sizes: { S: 4, M: 3, L: 2, XL: 2 }, marginPct: 33, status: 'Kritis', tone: 'bad' },
  { code: 'ET-15', name: 'Kaus Kaki Wudhu Jempol 3psg', cat: 'Add-on', channel: 'Shopee Live', price: 32000, units: 10, clicks: 260, stock: 290, sizes: { S: 0, M: 290, L: 0, XL: 0 }, marginPct: 56, status: 'Antre Pin', tone: 'neutral' },
  { code: 'ET-16', name: 'Scrunchie Satin Jumbo Set 4', cat: 'Aksesori', channel: 'TikTok Shop', price: 25000, units: 10, clicks: 230, stock: 340, sizes: { S: 0, M: 340, L: 0, XL: 0 }, marginPct: 64, status: 'Antre Pin', tone: 'neutral' },
  { code: 'ET-17', name: 'Belt Obi Tenun Etnik', cat: 'Aksesori', channel: 'Shopee Live', price: 75000, units: 3, clicks: 145, stock: 27, sizes: { S: 0, M: 27, L: 0, XL: 0 }, marginPct: 44, status: 'Low CVR', tone: 'warn' },
  { code: 'ET-18', name: 'Parfum Hijab Mist 60ml', cat: 'Add-on', channel: 'TikTok Shop', price: 29000, units: 5, clicks: 112, stock: 125, sizes: { S: 0, M: 125, L: 0, XL: 0 }, marginPct: 51, status: 'Antre Pin', tone: 'neutral' },
].map((x) => ({
  ...x,
  gmv: x.price * x.units,
  cvr: (x.units / x.clicks) * 100,
}));

// Regional Indonesia Province / Hub GMV & COD Cancel Breakdown (Exact Sum = Rp 64.200.000, 312 checkout orders, 6,4% COD cancel = Rp 4.108.800)
const REGIONS = [
  { prov: 'DKI Jakarta', hub: 'WH-JKT-01', gmv: 16050000, orders: 78, codSharePct: 18, codCancelIdr: 609900 },
  { prov: 'Jawa Barat', hub: 'WH-BDG-02', gmv: 14124000, orders: 70, codSharePct: 26, codCancelIdr: 734448 },
  { prov: 'Jawa Timur', hub: 'WH-SBY-01', gmv: 10272000, orders: 50, codSharePct: 34, codCancelIdr: 729312 },
  { prov: 'Jawa Tengah', hub: 'WH-SMG-01', gmv: 7704000, orders: 38, codSharePct: 31, codCancelIdr: 485352 },
  { prov: 'Banten', hub: 'WH-JKT-01', gmv: 5778000, orders: 28, codSharePct: 24, codCancelIdr: 329346 },
  { prov: 'Sumatera Utara', hub: 'WH-MDN-01', gmv: 4494000, orders: 21, codSharePct: 54, codCancelIdr: 557256, alert: true },
  { prov: 'Sulawesi Selatan', hub: 'WH-MKS-01', gmv: 3210000, orders: 15, codSharePct: 58, codCancelIdr: 449400, alert: true },
  { prov: 'Bali, Kaltim & Lainnya', hub: '3PL-NAS', gmv: 2568000, orders: 12, codSharePct: 36, codCancelIdr: 213786 },
];

// 8 Active Ad Campaigns (TikTok GMV Max & Shopee Live Ads — Total Spend Rp 9.440.000 -> Blended ROAS 6,80x)
const AD_CAMPAIGNS = [
  { id: 'AD-01', name: 'GMV Max — Gamis Linen Hero', platform: 'TikTok Ads', mode: 'GMV Max Auto', spend: 2450000, attrGmv: 19600000, orders: 96, imprK: 184, status: 'Optimal', tone: 'ok' },
  { id: 'AD-02', name: 'Live Shopping — Hijab Bundle 3s', platform: 'TikTok Ads', mode: 'ROI Target 6.5x', spend: 1780000, attrGmv: 13528000, orders: 74, imprK: 142, status: 'Optimal', tone: 'ok' },
  { id: 'AD-03', name: 'Kampanye Boost — Payday Broad', platform: 'TikTok Ads', mode: 'Manual Bid', spend: 1640000, attrGmv: 3444000, orders: 48, imprK: 218, status: 'Kurangi Bid', tone: 'bad', bad: true },
  { id: 'AD-04', name: 'Shopee Live Boost — Tunik Payday', platform: 'Shopee Ads', mode: 'Auto ROAS', spend: 1120000, attrGmv: 6496000, orders: 36, imprK: 96, status: 'Sehat', tone: 'ok' },
  { id: 'AD-05', name: 'Retarget Keranjang 24 Jam', platform: 'TikTok Ads', mode: 'DPA Retarget', spend: 840000, attrGmv: 7896000, orders: 41, imprK: 52, status: 'Top ROAS', tone: 'ok' },
  { id: 'AD-06', name: 'Lookalike Pembeli COD Lunas', platform: 'TikTok Ads', mode: 'Cost Cap', spend: 680000, attrGmv: 3740000, orders: 26, imprK: 64, status: 'Pantau CPA', tone: 'warn' },
  { id: 'AD-07', name: 'Shopee Flash Slot Prime 20:00', platform: 'Shopee Ads', mode: 'Slot Fixed', spend: 540000, attrGmv: 3348000, orders: 19, imprK: 48, status: 'Sehat', tone: 'ok' },
  { id: 'AD-08', name: 'Affiliate Spark Ads — Clip Nadya', platform: 'TikTok Ads', mode: 'Spark Boost', spend: 390000, attrGmv: 2808000, orders: 16, imprK: 39, status: 'Optimal', tone: 'ok' },
].map((c) => ({
  ...c,
  roas: c.attrGmv / c.spend,
  cpa: Math.round(c.spend / c.orders),
}));

// Host Leaderboard (10 Active MCN Hosts across 4 Studios — HST-02 Nadya = #1 Rp 21,4 jt/j, 2m 14d, 312 pesanan lunas, Bonus +3%)
const HOSTS = [
  { code: 'HST-02', name: 'Nadya Larasati', studio: 'Studio 2', shift: '18:00–21:00', gmvHr: 21400000, gpm: 482000, avgWatch: '2m 14d', orders: 312, cvr: 5.4, scriptScore: 96, bonus: 'Bonus +3%', status: 'Top Host', tone: 'ok', selected: true },
  { code: 'HST-05', name: 'Sinta Dewi P.', studio: 'Studio 1', shift: '18:00–21:00', gmvHr: 18600000, gpm: 438000, avgWatch: '2m 02d', orders: 268, cvr: 4.9, scriptScore: 94, bonus: 'Bonus +2,5%', status: 'On Target', tone: 'ok' },
  { code: 'HST-01', name: 'Raka Mahendra', studio: 'Studio 2', shift: '15:00–18:00', gmvHr: 15800000, gpm: 392000, avgWatch: '1m 54d', orders: 224, cvr: 4.5, scriptScore: 91, bonus: 'Bonus +2%', status: 'Selesai', tone: 'ok' },
  { code: 'HST-08', name: 'Putri Wulandari', studio: 'Studio 3', shift: '18:00–21:00', gmvHr: 14900000, gpm: 376000, avgWatch: '1m 48d', orders: 211, cvr: 4.3, scriptScore: 92, bonus: 'Bonus +2%', status: 'Live', tone: 'ok' },
  { code: 'HST-11', name: 'Fajar Nugroho', studio: 'Studio 1', shift: '15:00–18:00', gmvHr: 14100000, gpm: 358000, avgWatch: '1m 44d', orders: 198, cvr: 4.2, scriptScore: 90, bonus: 'Bonus +1,5%', status: 'Selesai', tone: 'ok' },
  { code: 'HST-03', name: 'Bima Prakoso', studio: 'Studio 1', shift: '12:00–15:00', gmvHr: 13200000, gpm: 344000, avgWatch: '1m 41d', orders: 189, cvr: 4.1, scriptScore: 89, bonus: 'Bonus +1,5%', status: 'Selesai', tone: 'neutral' },
  { code: 'HST-04', name: 'Dina Kartika', studio: 'Studio 4', shift: '18:00–21:00', gmvHr: 12400000, gpm: 318000, avgWatch: '1m 36d', orders: 172, cvr: 3.8, scriptScore: 88, bonus: 'Bonus +1,5%', status: 'Live', tone: 'ok' },
  { code: 'HST-06', name: 'Farhan Alfarizi', studio: 'Studio 2', shift: '12:00–15:00', gmvHr: 11100000, gpm: 294000, avgWatch: '1m 28d', orders: 156, cvr: 3.5, scriptScore: 85, bonus: 'Bonus +1%', status: 'Selesai', tone: 'neutral' },
  { code: 'HST-12', name: 'Bagas Pratama', studio: 'Studio 4', shift: '15:00–18:00', gmvHr: 10600000, gpm: 282000, avgWatch: '1m 25d', orders: 148, cvr: 3.4, scriptScore: 84, bonus: 'Bonus +1%', status: 'Selesai', tone: 'neutral' },
  { code: 'HST-13', name: 'Clara Wijaya', studio: 'Studio 2', shift: '09:00–12:00', gmvHr: 10400000, gpm: 276000, avgWatch: '1m 22d', orders: 142, cvr: 3.3, scriptScore: 84, bonus: 'Bonus +1%', status: 'Selesai', tone: 'neutral' },
  { code: 'HST-14', name: 'Reza Pahlevi', studio: 'Studio 3', shift: '12:00–15:00', gmvHr: 10200000, gpm: 271000, avgWatch: '1m 20d', orders: 140, cvr: 3.2, scriptScore: 83, bonus: 'Standar', tone: 'neutral' },
  { code: 'HST-07', name: 'Aulia Rahma', studio: 'Studio 3', shift: '15:00–18:00', gmvHr: 9800000, gpm: 268000, avgWatch: '1m 19d', orders: 138, cvr: 3.1, scriptScore: 82, bonus: 'Standar', tone: 'warn' },
  { code: 'HST-09', name: 'Arif Budiman', studio: 'Studio 4', shift: '12:00–15:00', gmvHr: 8400000, gpm: 235000, avgWatch: '1m 08d', orders: 118, cvr: 2.7, scriptScore: 79, bonus: 'Coaching', tone: 'warn' },
  { code: 'HST-10', name: 'Melisa Tan', studio: 'Studio 1', shift: '09:00–12:00', gmvHr: 7600000, gpm: 212000, avgWatch: '0m 58d', orders: 104, cvr: 2.4, scriptScore: 76, bonus: 'Coaching', tone: 'bad' },
];

// Settlement Payouts for Studio 2 Session (Exact reconciliation: Host Bonus Rp 2.860.000 + Affiliate Rp 3.605.472 = Rp 6.465.472)
const PAYOUTS = [
  { id: 'STL-2611-01', name: 'Nadya Larasati', npwp: '31.74.***.***-012.000', role: 'Host Utama', basisGmv: 60091200, rate: '3,0% + KPI', bruto: 1850000, pph: 92500, bank: 'BCA BI-FAST', taxType: 'PPh 21 TER', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-02', name: 'Raka Mahendra', npwp: '32.73.***.***-421.000', role: 'Co-Host & Floor', basisGmv: 60091200, rate: '0,9% Shift', bruto: 540000, pph: 27000, bank: 'Mandiri BI-FAST', taxType: 'PPh 21 TER', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-03', name: 'Dimas Setiawan', npwp: '31.71.***.***-028.000', role: 'Operator Cue/OBS', basisGmv: 60091200, rate: 'Flat + SLA', bruto: 270000, pph: 13500, bank: 'BNI BI-FAST', taxType: 'PPh 21 TER', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-04', name: 'Sinta Amalia', npwp: '36.71.***.***-416.000', role: 'Moderator Chat', basisGmv: 60091200, rate: 'Flat + CVR', bruto: 200000, pph: 10000, bank: 'BRI BI-FAST', taxType: 'PPh 21 TER', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-05', name: '@hijabdaily.id (CV Kreasi)', npwp: '09.42.***.***-009.000', role: 'Affiliate Tier-1', basisGmv: 14200000, rate: '7,0% Net', bruto: 994000, pph: 19880, bank: 'BCA BI-FAST', taxType: 'PPh 23 2%', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-06', name: '@gamisreview.jkt', npwp: '31.75.***.***-005.000', role: 'Affiliate Tier-1', basisGmv: 10850000, rate: '6,5% Net', bruto: 705250, pph: 17631, bank: 'Mandiri BI-FAST', taxType: 'PPh 21 OP', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-07', name: '@modestlook.bdg', npwp: '32.73.***.***-428.000', role: 'Affiliate Tier-2', basisGmv: 8640000, rate: '6,0% Net', bruto: 518400, pph: 12960, bank: 'BCA BI-FAST', taxType: 'PPh 21 OP', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-08', name: '@ootdmuslimah.sby', npwp: '35.78.***.***-606.000', role: 'Affiliate Tier-2', basisGmv: 7120000, rate: '6,0% Net', bruto: 427200, pph: 10680, bank: 'BRI BI-FAST', taxType: 'PPh 21 OP', status: 'Verifikasi NPWP', tone: 'warn' },
  { id: 'STL-2611-09', name: '@paydayfinds.id (PT Media)', npwp: '08.91.***.***-011.000', role: 'Affiliate MCN', basisGmv: 5400000, rate: '6,0% Net', bruto: 324000, pph: 6480, bank: 'CIMB BI-FAST', taxType: 'PPh 23 2%', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-10', name: '@linencatalog.id', npwp: '33.74.***.***-504.000', role: 'Affiliate Clip', basisGmv: 4620000, rate: '5,5% Net', bruto: 254100, pph: 6353, bank: 'BNI BI-FAST', taxType: 'PPh 21 OP', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-11', name: '@rekomendasivoal', npwp: '31.73.***.***-034.000', role: 'Affiliate Clip', basisGmv: 4180000, rate: '5,0% Net', bruto: 209000, pph: 5225, bank: 'BCA BI-FAST', taxType: 'PPh 21 OP', status: 'Siap Cair', tone: 'ok' },
  { id: 'STL-2611-12', name: '@koleksisage.id', npwp: '34.71.***.***-541.000', role: 'Affiliate Micro', basisGmv: 3470440, rate: '5,0% Net', bruto: 173522, pph: 4338, bank: 'Mandiri BI-FAST', taxType: 'PPh 21 OP', status: 'Tahan COD 7h', tone: 'info' },
].map((p) => ({
  ...p,
  netto: p.bruto - p.pph,
}));

// Derived Aggregates
const TOTAL_GMV = ETALASE.reduce((a, x) => a + x.gmv, 0);
const TOTAL_UNITS = ETALASE.reduce((a, x) => a + x.units, 0);
const TOTAL_CLICKS = ETALASE.reduce((a, x) => a + x.clicks, 0);
const TOTAL_ORDERS = REGIONS.reduce((a, r) => a + r.orders, 0);
const TOTAL_COD_CANCEL = REGIONS.reduce((a, r) => a + r.codCancelIdr, 0);
const NET_GMV = TOTAL_GMV - TOTAL_COD_CANCEL;
const TOTAL_AD_SPEND = AD_CAMPAIGNS.reduce((a, c) => a + c.spend, 0);
const TOTAL_AD_ATTR_GMV = AD_CAMPAIGNS.reduce((a, c) => a + c.attrGmv, 0);
const BLENDED_ROAS = TOTAL_GMV / TOTAL_AD_SPEND;
const OVERALL_CVR = (TOTAL_UNITS / TOTAL_CLICKS) * 100;
const COD_CANCEL_PCT = (TOTAL_COD_CANCEL / TOTAL_GMV) * 100;

// Profit Waterfall exact components
const COGS_IDR = Math.round(NET_GMV * 0.44);
const PLATFORM_FEE_IDR = Math.round(NET_GMV * 0.065);
const HOST_BONUS_IDR = PAYOUTS.slice(0, 4).reduce((a, p) => a + p.bruto, 0);
const AFFILIATE_IDR = PAYOUTS.slice(4).reduce((a, p) => a + p.bruto, 0);
const TOTAL_PAYOUT_BRUTO = HOST_BONUS_IDR + AFFILIATE_IDR;
const TOTAL_PAYOUT_PPH = PAYOUTS.reduce((a, p) => a + p.pph, 0);
const TOTAL_PAYOUT_NETTO = PAYOUTS.reduce((a, p) => a + p.netto, 0);
const NET_CONTRIBUTION_IDR =
  NET_GMV - COGS_IDR - PLATFORM_FEE_IDR - TOTAL_AD_SPEND - TOTAL_PAYOUT_BRUTO;
const NET_MARGIN_PCT = (NET_CONTRIBUTION_IDR / TOTAL_GMV) * 100;

export function verifyMath() {
  if (TOTAL_GMV !== 64200000) throw new Error(`TOTAL_GMV mismatch: ${TOTAL_GMV}`);
  const regGmv = REGIONS.reduce((a, r) => a + r.gmv, 0);
  if (regGmv !== TOTAL_GMV) throw new Error(`Region GMV mismatch: ${regGmv} vs ${TOTAL_GMV}`);
  if (TOTAL_ORDERS !== 312) throw new Error(`TOTAL_ORDERS mismatch: ${TOTAL_ORDERS}`);
  if (TOTAL_UNITS !== 641) throw new Error(`TOTAL_UNITS mismatch: ${TOTAL_UNITS}`);
  if (Math.abs(OVERALL_CVR - 4.9) > 0.05) throw new Error(`CVR mismatch: ${OVERALL_CVR}`);
  if (TOTAL_AD_SPEND !== 9440000) throw new Error(`AD_SPEND mismatch: ${TOTAL_AD_SPEND}`);
  if (Math.abs(BLENDED_ROAS - 6.8) > 0.02) throw new Error(`ROAS mismatch: ${BLENDED_ROAS}`);
  if (TOTAL_COD_CANCEL !== 4108800) throw new Error(`COD_CANCEL mismatch: ${TOTAL_COD_CANCEL}`);
  if (HOST_BONUS_IDR !== 2860000) throw new Error(`HOST_BONUS mismatch: ${HOST_BONUS_IDR}`);
  if (AFFILIATE_IDR !== 3605472) throw new Error(`AFFILIATE mismatch: ${AFFILIATE_IDR}`);
  if (TOTAL_PAYOUT_BRUTO !== 6465472) throw new Error(`PAYOUT_BRUTO mismatch: ${TOTAL_PAYOUT_BRUTO}`);
  if (TOTAL_PAYOUT_NETTO !== TOTAL_PAYOUT_BRUTO - TOTAL_PAYOUT_PPH) {
    throw new Error(`PAYOUT_NETTO mismatch`);
  }
  const ad03 = AD_CAMPAIGNS.find((c) => c.id === 'AD-03');
  if (Math.abs(ad03.roas - 2.1) > 0.01) throw new Error(`AD-03 ROAS mismatch: ${ad03.roas}`);
  if (NET_CONTRIBUTION_IDR <= 0) throw new Error(`Negative margin: ${NET_CONTRIBUTION_IDR}`);
}

// ============================================================================
// EXTRA LAKEHOUSE / ENTERPRISE BI CSS (DISTINCT FROM ID-001)
// ============================================================================
const EXTRA_CSS = `
  /* Databricks / Snowflake / Tableau Enterprise Shell */
  .kl-topbar {
    height: 36px;
    background: #1b1016;
    color: #faf5f8;
    border-top: 2px solid #be185d;
    border-bottom: 1px solid #35212d;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .kl-topbar-grp {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .kl-brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #be185d;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .kl-live-pill {
    background: #4c0519;
    color: #fecdd3;
    border: 1px solid #9f1239;
    padding: 2px 7px;
    border-radius: 3px;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .kl-pill-dark {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #2b1a24;
    border: 1px solid #442b3a;
    color: #f1e6ec;
    font-size: 10.4px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .kl-search {
    height: 23px;
    width: 295px;
    padding: 0 8px;
    border-radius: 3px;
    background: #261620;
    border: 1px solid #442b3a;
    color: #c2aeb9;
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .kl-kbd {
    font-family: var(--e-mono);
    font-size: 8.8px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #1b1016;
    border: 1px solid #593a4d;
    color: #e2d3dc;
  }
  .kl-avatar {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #9d174d;
    color: #fff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Slim Databricks-Style Left Icon Rail (68px) -> 1532px wide BI canvas */
  .kl-rail {
    width: 68px;
    background: #ffffff;
    border-right: 1px solid var(--e-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6px 0;
    flex-shrink: 0;
  }
  .kl-rail-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 4px;
  }
  .kl-rail-item {
    height: 46px;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #5c4f5f;
    font-size: 9px;
    font-weight: 600;
    position: relative;
    text-align: center;
    padding: 0 2px;
    line-height: 1.1;
  }
  .kl-rail-item.is-active {
    background: #fdf2f8;
    color: #831843;
    font-weight: 700;
    box-shadow: inset 3px 0 0 #be185d;
  }
  .kl-rail-badge {
    position: absolute;
    top: 4px;
    right: 6px;
    font-family: var(--e-mono);
    font-size: 8px;
    font-weight: 700;
    padding: 0 3.5px;
    border-radius: 2px;
    background: #be123c;
    color: #fff;
    line-height: 1.35;
  }
  .kl-rail-foot {
    padding: 6px 4px 2px;
    border-top: 1px solid #ece6ee;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-family: var(--e-mono);
    font-size: 8.5px;
    color: #645866;
  }

  /* Subbar with Lakehouse Tab Pills */
  .kl-subbar {
    height: 35px;
    padding: 0 12px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .kl-content {
    flex: 1;
    min-height: 0;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* Custom BI Cards & Utility */
  .kl-kpi {
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-radius: 4px;
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .kl-kpi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.8px;
    color: var(--e-muted);
    font-weight: 600;
  }
  .kl-kpi-val {
    font-family: var(--e-mono);
    font-size: 16px;
    font-weight: 700;
    color: var(--e-text);
    letter-spacing: -0.02em;
    line-height: 1.15;
    white-space: nowrap;
  }
  .kl-kpi-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.5px;
    color: var(--e-muted);
    gap: 4px;
    white-space: nowrap;
  }
  .kl-cue-banner {
    background: #fdf2f8;
    border: 1px solid #f5b4d3;
    border-left: 3px solid #be185d;
    border-radius: 3px;
    padding: 7px 9px;
    color: #500724;
    font-size: 11px;
    line-height: 1.35;
  }
  .kl-sql {
    background: #1a1218;
    color: #f3e8ee;
    font-family: var(--e-mono);
    font-size: 10.3px;
    line-height: 1.45;
    padding: 9px 11px;
    border-radius: 3px;
    overflow: hidden;
    white-space: pre;
  }
  .sql-kw { color: #f472b6; font-weight: 700; }
  .sql-fn { color: #38bdf8; }
  .sql-str { color: #86efac; }
  .sql-num { color: #fcd34d; }
  .sql-cm { color: #9c8894; }

  .kl-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid var(--e-border-strong);
    background: #ffffff;
    font-size: 10px;
    font-weight: 600;
    color: #3f3442;
    white-space: nowrap;
  }
  .kl-chip.is-on {
    background: #fdf2f8;
    border-color: #db7ea8;
    color: #831843;
  }
  .kl-kv {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid #efeaf0;
    font-size: 10.5px;
    gap: 8px;
  }
  .kl-kv:last-child { border-bottom: 0; }
  .kl-kv-k { color: #645866; }
  .kl-kv-v { font-weight: 700; color: #18131a; text-align: right; white-space: nowrap; }

  /* Compact table override for ultra-clean zero-overflow fit */
  table.e-table.kl-dense th { padding: 4.5px 6px; font-size: 9.5px; background: #f6f2f7; color: #544658; }
  table.e-table.kl-dense td { padding: 4px 6px; font-size: 10.4px; border-bottom-color: #ece6ef; }
  table.e-table.kl-dense tbody tr:nth-child(even) { background: #fcfafd; }
  table.e-table.kl-dense tfoot td { padding: 5px 6px; font-size: 10.4px; background: #f3edf5; }

  .e-badge-accent { background: #fdf2f8; color: #831843; border-color: #f5b4d3; }
  .e-statusbar { background: #f3eff5; border-top-color: #d6ccd9; color: #524656; }
`;

const RAIL_ITEMS = [
  { id: 'p1', label: 'Kokpit', icon: 'activity' },
  { id: 'p2', label: 'Etalase', icon: 'layers', badge: '3' },
  { id: 'p3', label: 'Lakehouse', icon: 'database' },
  { id: 'p4', label: 'ROAS Iklan', icon: 'sliders', badge: '1' },
  { id: 'p5', label: 'Shift Host', icon: 'users' },
  { id: 'p6', label: 'Settlement', icon: 'fileText' },
  { id: 'p7', label: 'DoA & Audit', icon: 'shield' },
  { id: 'p8', label: 'Teleprompter', icon: 'eye' },
];

function renderShell({ activeId, pageTitle, crumbGroup, rightActions = '', contentHtml }) {
  const topbar = `<header class="kl-topbar">
    <div class="kl-topbar-grp">
      <div class="e-brand">
        <span class="kl-brand-mark">KL</span>
        <span>KatalogLive Studio</span>
      </div>
      <span class="kl-live-pill">
        <span class="dot dot-bad"></span>
        <span>LIVE 03:42:18 · 4.280 PENONTON</span>
      </span>
      <div class="kl-pill-dark">
        ${ic('layers', 11, '#f472b6')}
        <span>Studio 2 — Maraton Payday (TikTok + Shopee)</span>
        ${ic('chevronDown', 11, '#b89fb0')}
      </div>
      <div class="kl-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 11, '#a08c99')}
          <span class="trunc">Cari etalase, SKU, host, kampanye, atau SQL ClickHouse...</span>
        </span>
        <span class="kl-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="kl-topbar-grp">
      <div class="kl-pill-dark" style="background:#063426;border-color:#0f5c43;color:#86efac;">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">SignalR 18ms · ClickHouse OK</span>
      </div>
      <div class="e-user-chip" style="border-left-color:#3f2937;">
        <span class="kl-avatar">RK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.4px;font-weight:700;color:#faf5f8;">R. Kusuma</div>
          <div style="font-size:8.8px;color:#b89fb0;">Produser Live &amp; BI</div>
        </div>
      </div>
    </div>
  </header>`;

  const rail = `<aside class="kl-rail">
    <div class="kl-rail-list">
      ${RAIL_ITEMS.map((item) => {
        const active = item.id === activeId;
        return `<div class="kl-rail-item ${active ? 'is-active' : ''}">
          ${ic(item.icon, 15, active ? '#be185d' : '#645866')}
          <span>${esc(item.label)}</span>
          ${item.badge ? `<span class="kl-rail-badge">${esc(item.badge)}</span>` : ''}
        </div>`;
      }).join('')}
    </div>
    <div class="kl-rail-foot">
      <span class="dot dot-ok"></span>
      <span>CH 24.8</span>
      <span>.NET 9</span>
    </div>
  </aside>`;

  const subbar = `<div class="kl-subbar">
    <div class="e-crumb">
      <span>Nusantara MCN</span>
      ${ic('chevronRight', 12, '#9a8b9e')}
      <span>${esc(crumbGroup)}</span>
      ${ic('chevronRight', 12, '#9a8b9e')}
      <strong>${esc(pageTitle)}</strong>
      <span class="e-badge e-badge-accent mono" style="margin-left:4px;">SESI: STD2-PAYDAY-2611</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
      ${rightActions}
    </div>
  </div>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><span>SignalR Hub: ws-jkt1-02 (14.820 evt/dtk · p95 18 ms)</span>`,
      `<span>ClickHouse Lakehouse: 24.8.4-lts (ID-JKT-01/02)</span>`,
      `<span>Sinkronisasi API: TikTok Shop v2 + Shopee Live v2</span>`,
    ],
    rightItems: [
      `<span>Atribusi: 15m Last-Pin Touchpoint</span>`,
      `<span>UU PDP PP 33/2026: Masking Aktif</span>`,
      `<span>22 Nov 2026 · 20:42:18 WIB</span>`,
    ],
  });

  const bodyHtml = `${topbar}
    <div class="e-shell-body">
      ${rail}
      <main class="e-main">
        ${subbar}
        <div class="kl-content">${contentHtml}</div>
      </main>
    </div>
    ${footer}`;

  return wrapEnterpriseHtml({
    title: `KatalogLive Studio — ${pageTitle}`,
    accent: '#be185d',
    accentSoft: '#fdf2f8',
    accentInk: '#831843',
    bg: '#f4f1f5',
    surface: '#ffffff',
    surface2: '#faf8fb',
    border: '#dfd8e2',
    borderStrong: '#c8becd',
    text: '#18131a',
    text2: '#4b3f4e',
    muted: '#695c6c',
    extraCss: EXTRA_CSS,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 1: KOKPIT SIARAN & ANALITIK GMV REAL-TIME (Executive BI + Regional + Cue)
// ============================================================================
function renderPage1() {
  const kpis = [
    {
      label: 'GMV Sesi Ini (Studio 2)',
      val: 'Rp 64,2 jt',
      badgeTxt: '+24,6% vs target',
      badgeTone: 'ok',
      footL: '312 pesanan · 641 unit',
      footR: 'Net Rp 60,1 jt',
      spark: [4.2, 8.8, 14.1, 21.5, 29.8, 38.4, 47.6, 56.2, 64.2],
      color: '#be185d',
    },
    {
      label: 'ROAS Live (Blended)',
      val: '6,8x',
      badgeTxt: 'Target >= 5,0x',
      badgeTone: 'ok',
      footL: 'Belanja Rp 9,44 jt',
      footR: 'AD-03: 2,1x alert',
      spark: [5.4, 6.1, 7.2, 7.6, 7.1, 6.4, 6.9, 6.7, 6.8],
      color: '#047857',
    },
    {
      label: 'CVR Etalase Tersemat',
      val: '4,9%',
      badgeTxt: 'ET-01: 6,2%',
      badgeTone: 'ok',
      footL: '13.081 klik keranjang',
      footR: 'AOV Rp 205,8 rb',
      spark: [3.4, 3.8, 4.2, 4.5, 4.8, 5.1, 4.7, 4.9, 4.9],
      color: '#0369a1',
    },
    {
      label: 'Penonton Aktif Serentak',
      val: '4.280',
      badgeTxt: 'Puncak 4.610',
      badgeTone: 'accent',
      footL: 'TikTok 3.190 · Shopee 1.090',
      footR: 'Retensi 2m 14d',
      spark: [1240, 1890, 2640, 3120, 3840, 4120, 4610, 4390, 4280],
      color: '#be185d',
    },
    {
      label: 'Rasio Batal COD (Estimasi)',
      val: '6,4%',
      badgeTxt: '2 Prov. Tinggi',
      badgeTone: 'warn',
      footL: 'Batal Rp 4,11 jt',
      footR: 'Sumut · Sulsel',
      spark: [5.1, 5.4, 5.8, 6.0, 6.3, 6.8, 6.6, 6.5, 6.4],
      color: '#b45309',
    },
    {
      label: 'Laba Kontribusi Bersih',
      val: 'Rp 13,84 jt',
      badgeTxt: 'Margin 21,6%',
      badgeTone: 'ok',
      footL: 'Usai HPP, Iklan & Komisi',
      footR: 'Host Nadya +3%',
      spark: [1.1, 2.3, 3.8, 5.6, 7.4, 9.2, 10.9, 12.4, 13.8],
      color: '#047857',
    },
  ];

  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
    ${kpis
      .map(
        (k) => `<div class="kl-kpi">
        <div class="kl-kpi-top">
          <span class="trunc">${esc(k.label)}</span>
          ${badge(k.badgeTxt, k.badgeTone)}
        </div>
        <div class="e-kpi-mid">
          <span class="kl-kpi-val">${esc(k.val)}</span>
          ${svgSparkline({ points: k.spark, width: 62, height: 20, color: k.color })}
        </div>
        <div class="kl-kpi-foot">
          <span class="trunc">${esc(k.footL)}</span>
          <span class="mono" style="color:#4b3f4e;font-weight:600;">${esc(k.footR)}</span>
        </div>
      </div>`
      )
      .join('')}
  </section>`;

  // Multi-series live chart: GMV / 15-min window (jt Rp) vs Viewer Index (rb) & Target Velocity
  const chartSvg = svgMultiLineChart({
    width: 900,
    height: 235,
    xLabels: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:15', '20:30', '20:42'],
    yMin: 0,
    yMax: 12,
    yTicks: 4,
    yFormat: (v) => `Rp ${v.toFixed(0)} jt`,
    series: [
      {
        label: 'GMV per Slot 30m (Rp jt)',
        color: '#be185d',
        values: [2.4, 3.8, 5.6, 7.2, 8.9, 9.6, 11.2, 8.4, 7.1, 9.4],
        area: true,
        dots: true,
        width: 2.1,
      },
      {
        label: 'Penonton Aktif (x500 org)',
        color: '#0369a1',
        values: [2.5, 3.8, 5.3, 6.4, 7.7, 8.2, 9.2, 8.8, 8.6, 8.56],
        width: 1.7,
      },
      {
        label: 'ROAS Sesi (skala x1)',
        color: '#047857',
        values: [5.4, 6.1, 7.2, 7.6, 7.1, 6.4, 6.9, 6.2, 6.7, 6.8],
        dashed: true,
        width: 1.6,
      },
    ],
    threshold: { value: 4.5, label: 'SLA GMV Min Rp 4,5 jt/slot', color: '#be123c' },
    annotations: [
      { index: 2, seriesIdx: 0, label: 'Shift Nadya Masuk (18:00)', color: '#be185d', dy: -26 },
      { index: 6, seriesIdx: 0, label: 'Flash Pin ET-01 · Puncak 4.610', color: '#047857', dy: -20 },
      { index: 7, seriesIdx: 2, label: 'Alert AD-03 ROAS 2,1x', color: '#b45309', dy: -34 },
    ],
  });

  // Regional Indonesia Breakdown table + proportional visual bars
  const maxProvGmv = REGIONS[0].gmv;
  const regRows = REGIONS.map((r) => {
    const pctGmv = (r.gmv / TOTAL_GMV) * 100;
    const codCancelPct = (r.codCancelIdr / r.gmv) * 100;
    const barW = Math.round((r.gmv / maxProvGmv) * 100);
    return `<tr class="${r.alert ? 'is-warn' : ''}">
      <td style="font-weight:600;">${esc(r.prov)}</td>
      <td class="mono" style="color:#695c6c;">${esc(r.hub)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="flex:1;height:6px;background:#ece6ef;border-radius:2px;overflow:hidden;">
            <div style="width:${barW}%;height:100%;background:${r.alert ? '#b45309' : '#be185d'};"></div>
          </div>
          <span class="mono" style="font-size:9.5px;width:34px;text-align:right;">${fmtPct(pctGmv)}</span>
        </div>
      </td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(r.gmv)}</td>
      <td class="num mono">${r.orders}</td>
      <td class="num mono">${r.codSharePct}%</td>
      <td class="num mono" style="color:${r.alert ? '#be123c' : '#3f3442'};font-weight:${r.alert ? '700' : '500'};">${fmtPct(codCancelPct)}</td>
      <td>${r.alert ? badge('Verifikasi WA COD', 'warn') : badge('Normal', 'ok')}</td>
    </tr>`;
  }).join('');

  // Right Column: Live Producer Cue Console + 4 Priority Watch Cards from spec + SignalR Event Stream
  const watchItems = [
    { code: 'ET-01', title: 'Etalase #1 — Gamis Linen Sage (M/L)', sub: 'Ukuran L tinggal 6 pcs -> Arahkan host ganti', val: 'Rp 24,8 jt', status: 'Size Tipis', tone: 'warn', meta: '6,2% CVR' },
    { code: 'ET-04', title: 'Etalase #4 — Hijab Voal Laser Cut 3s', sub: 'Bundle add-on terlaris · Margin sehat 48%', val: 'Rp 19,1 jt', status: 'Laris', tone: 'ok', meta: '5,4% CVR' },
    { code: 'HST-02', title: 'Shift Host: Nadya (18:00–21:00)', sub: 'Rata tonton 2m 14d · 312 pesanan lunas', val: 'Rp 21,4 jt/j', status: 'Top Host', tone: 'ok', meta: 'Bonus +3%' },
    { code: 'AD-03', title: 'Kampanye Boost — Payday Broad', sub: 'CPA Rp 34.167 melampaui batas Rp 28.000', val: 'ROAS 2,1x', status: 'Kurangi Bid', tone: 'bad', meta: 'Alert' },
  ];

  const signalEvents = [
    { t: '20:42:16', src: 'CueHub', msg: 'Cue terkirim ke Teleprompter Studio-2 (ACK 14 ms)', tone: 'accent' },
    { t: '20:42:09', src: 'WMS-JKT', msg: 'ET-01 varian L turun ke 6 pcs (ambang peringatan <= 10)', tone: 'warn' },
    { t: '20:41:54', src: 'AdGuard', msg: 'AD-03 Payday Broad menyentuh CPA Rp 34.167 (ROAS 2,1x)', tone: 'bad' },
    { t: '20:41:41', src: 'TikTokAPI', msg: 'Checkout batch +14 pesanan (ET-04 bundle x9, ET-01 x5)', tone: 'ok' },
    { t: '20:41:18', src: 'ClickHouse', msg: 'Materialized view mart_gmv_attribution_host refresh 48 ms', tone: 'info' },
  ];

  const mainGrid = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.58fr 1fr;gap:8px;">
    <!-- Left analytical column -->
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
      <div class="e-panel" style="flex:0 0 284px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#be185d')}
            <span>Kecepatan GMV, Retensi Penonton &amp; ROAS Maraton 12 Jam</span>
            <span class="e-panel-sub">ClickHouse 10-detik rollup · Studio 2</span>
          </div>
          <div style="display:flex;gap:5px;">
            <span class="kl-chip is-on">Semua Kanal</span>
            <span class="kl-chip">TikTok 74%</span>
            <span class="kl-chip">Shopee 26%</span>
          </div>
        </div>
        <div class="e-panel-body" style="padding:6px 10px;">
          ${chartSvg}
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('globe', 13, '#be185d')}
            <span>Distribusi GMV Regional Indonesia, Hub Gudang &amp; Risiko Batal COD</span>
          </div>
          <span class="e-panel-sub">8 Wilayah · Total Terverifikasi Rp 64.200.000</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table kl-dense">
            <colgroup>
              <col style="width:18%;" />
              <col style="width:10%;" />
              <col style="width:20%;" />
              <col style="width:14%;" />
              <col style="width:8%;" />
              <col style="width:8%;" />
              <col style="width:9%;" />
              <col style="width:13%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Provinsi / Klaster</th>
                <th>Hub WMS</th>
                <th>Porsi GMV</th>
                <th class="num">GMV Sesi</th>
                <th class="num">Order</th>
                <th class="num">COD %</th>
                <th class="num">Batal COD</th>
                <th>Kontrol COD</th>
              </tr>
            </thead>
            <tbody>${regRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL NASIONAL (8 WILAYAH)</td>
                <td class="mono">100,0%</td>
                <td class="num mono">${fmtIdr(TOTAL_GMV)}</td>
                <td class="num mono">${TOTAL_ORDERS}</td>
                <td class="num mono">29,4%</td>
                <td class="num mono">${fmtPct(COD_CANCEL_PCT)}</td>
                <td>${badge('Rp 4,11 jt risiko', 'warn')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:auto;padding:8px 10px;background:#faf8fb;border-top:1px solid #e5dee8;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#695c6c;font-weight:600;">Porsi Kanal Live (Studio 2)</div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px;">
                <span class="mono" style="font-size:11.5px;font-weight:700;color:#18131a;">TikTok 74,2%</span>
                <span class="mono" style="font-size:10.5px;color:#b45309;font-weight:700;">Shopee 25,8%</span>
              </div>
              <div style="height:5px;background:#fde68a;border-radius:2px;overflow:hidden;margin-top:4px;"><div style="width:74.2%;height:100%;background:#1b1016;"></div></div>
            </div>
            <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#695c6c;font-weight:600;">Mitigasi Auto-WA COD (Sumut &amp; Sulsel)</div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px;">
                <span class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">28 / 36 terkonfirmasi</span>
                <span class="mono" style="font-size:9.8px;color:#b45309;">8 antre</span>
              </div>
              <div style="font-size:9.2px;color:#524656;margin-top:3px;">Menekan batal COD luar Jawa -4,2 poin</div>
            </div>
            <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#695c6c;font-weight:600;">SLA Kirim Same-Day Hub WMS</div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px;">
                <span class="mono" style="font-size:11.5px;font-weight:700;color:#be185d;">98,4% On-Time</span>
                <span class="mono" style="font-size:9.8px;color:#695c6c;">Cut-off 21:30</span>
              </div>
              <div style="font-size:9.2px;color:#524656;margin-top:3px;">WH-JKT-01 &amp; WH-BDG-02 kapasitas 72%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right producer cue & live watch column -->
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
      <div class="e-panel" style="flex:0 0 auto;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('zap', 13, '#be185d')}
            <span>Konsol Cue Teleprompter Host — Studio 2</span>
          </div>
          ${badge('ACK 14 ms', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          <div class="kl-cue-banner">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
              <span class="mono" style="font-size:9.5px;font-weight:700;color:#9d174d;">CUE AKTIF DI LAYAR HOST (20:42:16 WIB)</span>
              ${badge('PRIORITAS TINGGI', 'bad')}
            </div>
            <strong>"Ukuran L Etalase #1 tinggal 6 pcs! Arahkan checkout ke bundle Etalase #4."</strong>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:nowrap;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('play', 11, '#fff')} Tampilkan SKU Flash (ET-04)</span>
            <span class="e-btn e-btn-danger" style="flex:1;justify-content:center;">${ic('alert', 11, '#be123c')} Jeda Iklan ROAS Rendah</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('bell', 13, '#be185d')}
            <span>Pantauan Prioritas Produser (Etalase · Host · Iklan)</span>
          </div>
          <span class="e-panel-sub">4 objek aktif</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div style="display:flex;flex-direction:column;gap:6px;">
          ${watchItems
            .map(
              (w) => `<div style="border:1px solid ${w.tone === 'bad' ? '#fecdd3' : w.tone === 'warn' ? '#fde68a' : '#e5dee8'};background:${w.tone === 'bad' ? '#fff7f8' : w.tone === 'warn' ? '#fffdf5' : '#fcfafd'};border-radius:3px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <div style="min-width:0;flex:1;">
                <div style="display:flex;align-items:center;gap:5px;">
                  <span class="mono" style="font-size:9.5px;font-weight:700;color:#831843;background:#fdf2f8;padding:0.5px 4px;border:1px solid #f5b4d3;border-radius:2px;">${esc(w.code)}</span>
                  <span class="trunc" style="font-weight:700;font-size:10.8px;">${esc(w.title)}</span>
                </div>
                <div class="trunc" style="font-size:9.8px;color:#5f5263;margin-top:2px;">${esc(w.sub)}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="mono" style="font-weight:700;font-size:11.5px;color:#18131a;">${esc(w.val)}</div>
                <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:2px;">
                  <span class="mono" style="font-size:9px;color:#695c6c;">${esc(w.meta)}</span>
                  ${badge(w.status, w.tone)}
                </div>
              </div>
            </div>`
            )
            .join('')}
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;margin-bottom:4px;">
              <span style="font-weight:700;color:#18131a;">Pencapaian Target Shift Puncak (18:00–21:00)</span>
              <span class="mono" style="font-weight:700;color:#be185d;">Rp 64,2 jt / Rp 70,0 jt (91,7%)</span>
            </div>
            <div style="height:6px;background:#e6dfe9;border-radius:2px;overflow:hidden;">
              <div style="width:91.7%;height:100%;background:#be185d;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.4px;color:#695c6c;margin-top:4px;">
              <span>Sisa waktu: <strong class="mono" style="color:#18131a;">18 menit</strong></span>
              <span>Proyeksi tutup shift: <strong class="mono" style="color:#047857;">Rp 71,4 jt (Lulus Bonus +3%)</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:0 0 184px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('terminal', 13, '#be185d')}
            <span>Aliran Event .NET 9 SignalR</span>
          </div>
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">STREAMING</span>
        </div>
        <div class="e-panel-body" style="padding:6px 9px;display:flex;flex-direction:column;gap:4px;">
          ${signalEvents
            .map(
              (ev) => `<div style="display:flex;align-items:center;gap:6px;font-size:10px;border-bottom:1px solid #f1ebf3;padding-bottom:3.5px;">
              <span class="mono" style="color:#695c6c;font-size:9.2px;flex-shrink:0;">${ev.t}</span>
              ${badge(ev.src, ev.tone)}
              <span class="trunc" style="color:#2b212e;">${esc(ev.msg)}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p1',
    crumbGroup: 'Operasi Live BI',
    pageTitle: 'Kokpit Siaran & Analitik GMV Real-Time',
    rightActions: `
      <span class="e-btn">${ic('download', 11)} Ekspor Snapshot BI</span>
      <span class="e-btn e-btn-danger">${ic('alert', 11, '#be123c')} Jeda Iklan ROAS Rendah</span>
      <span class="e-btn e-btn-primary">${ic('zap', 11, '#fff')} Tampilkan SKU Flash</span>
    `,
    contentHtml: `${kpiHtml}${mainGrid}`,
  });
}

// ============================================================================
// PAGE 2: WORKBENCH ETALASE, STOK FLASH & KECEPATAN KONVERSI (18-Row Grid + Inspector)
// ============================================================================
function renderPage2() {
  const facetBar = `<div class="e-panel" style="flex:0 0 auto;">
    <div style="padding:6px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
      <div style="display:flex;align-items:center;gap:6px;">
        ${ic('filter', 12, '#be185d')}
        <span style="font-weight:700;font-size:10.5px;color:#4b3f4e;">Filter Etalase:</span>
        <span class="kl-chip is-on">Semua SKU (18)</span>
        <span class="kl-chip">TikTok Shop (11)</span>
        <span class="kl-chip">Shopee Live (7)</span>
        <span class="kl-chip" style="border-color:#fde68a;background:#fffbeb;color:#b45309;">Stok Tipis / Kritis (3)</span>
        <span class="kl-chip">Margin &gt;= 45% (8)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:10.2px;color:#695c6c;">
        <span>Urut: <strong style="color:#18131a;">GMV Tertinggi</strong></span>
        <span class="mono">|</span>
        <span>Sinkron WMS: <strong class="mono" style="color:#047857;">2 detik lalu</strong></span>
      </div>
    </div>
  </div>`;

  const rowsHtml = ETALASE.map((e) => {
    const rowCls = e.selected ? 'is-selected' : e.tone === 'bad' ? 'is-bad' : e.tone === 'warn' ? 'is-warn' : '';
    const sizeSummary = e.sizes.S || e.sizes.XL
      ? `S:${e.sizes.S} M:${e.sizes.M} L:${e.sizes.L} XL:${e.sizes.XL}`
      : `All-Size: ${e.stock}`;
    return `<tr class="${rowCls}">
      <td class="mono" style="font-weight:700;color:#831843;">${esc(e.code)}</td>
      <td style="font-weight:${e.selected ? '700' : '600'};">${esc(e.name)}</td>
      <td>${badge(e.channel === 'TikTok Shop' ? 'TikTok' : 'Shopee', e.channel === 'TikTok Shop' ? 'dark' : 'warn')}</td>
      <td class="num mono">${fmtIdr(e.price)}</td>
      <td class="num mono">${fmtNum(e.clicks)}</td>
      <td class="num mono" style="font-weight:700;">${e.units}</td>
      <td class="num mono" style="color:${e.cvr >= 5 ? '#047857' : e.cvr < 2.5 ? '#be123c' : '#18131a'};font-weight:600;">${fmtPct(e.cvr)}</td>
      <td class="mono" style="font-size:9.6px;color:${e.stock < 25 || e.code === 'ET-01' ? '#b45309' : '#524656'};font-weight:${e.code === 'ET-01' ? '700' : '500'};">${esc(sizeSummary)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(e.gmv)}</td>
      <td class="num mono">${e.marginPct}%</td>
      <td>${badge(e.status, e.tone)}</td>
    </tr>`;
  }).join('');

  const avgMarginWeighted =
    ETALASE.reduce((a, x) => a + x.gmv * x.marginPct, 0) / TOTAL_GMV;

  // Right Inspector for Selected ET-01
  const sel = ETALASE[0];
  const sizeRows = [
    { sz: 'Ukuran S', qty: 28, init: 60, vel: '6 pcs/jam', eta: '4j 40m', tone: 'ok' },
    { sz: 'Ukuran M', qty: 19, init: 75, vel: '14 pcs/jam', eta: '1j 21m', tone: 'ok' },
    { sz: 'Ukuran L (KRITIS)', qty: 6, init: 90, vel: '22 pcs/jam', eta: '16 menit', tone: 'bad' },
    { sz: 'Ukuran XL', qty: 14, init: 45, vel: '7 pcs/jam', eta: '2j 00m', tone: 'warn' },
  ];

  const mainSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.85fr 1fr;gap:8px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('layers', 13, '#be185d')}
          <span>Matriks Etalase Studio 2 (18 SKU Aktif &amp; Antrean Pin)</span>
        </div>
        <span class="e-panel-sub">Total Terverifikasi: 641 Unit · CVR Rata-Rata 4,9%</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table kl-dense">
          <colgroup>
            <col style="width:6%;" />
            <col style="width:18.5%;" />
            <col style="width:7.5%;" />
            <col style="width:9.5%;" />
            <col style="width:7%;" />
            <col style="width:5.5%;" />
            <col style="width:6.5%;" />
            <col style="width:14.5%;" />
            <col style="width:10.5%;" />
            <col style="width:5.5%;" />
            <col style="width:9%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Produk &amp; Varian</th>
              <th>Kanal</th>
              <th class="num">Harga</th>
              <th class="num">Klik</th>
              <th class="num">Unit</th>
              <th class="num">CVR</th>
              <th>Stok Ukuran (WMS)</th>
              <th class="num">GMV Sesi</th>
              <th class="num">Mrg</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="4">TOTAL 18 ETALASE (STUDIO 2)</td>
              <td class="num mono">${fmtNum(TOTAL_CLICKS)}</td>
              <td class="num mono">${TOTAL_UNITS}</td>
              <td class="num mono">${fmtPct(OVERALL_CVR)}</td>
              <td class="mono">3.307 pcs sisa</td>
              <td class="num mono">${fmtIdr(TOTAL_GMV)}</td>
              <td class="num mono">${fmtPct(avgMarginWeighted)}</td>
              <td>${badge('3 Alert', 'warn')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Right Inspector -->
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
      <div class="e-panel" style="flex:0 0 auto;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('eye', 13, '#be185d')}
            <span>Inspektor Etalase Terpilih: ET-01</span>
          </div>
          ${badge('SEDANG TERSEMAT', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div>
              <div style="font-size:13px;font-weight:700;color:#18131a;">${esc(sel.name)}</div>
              <div class="mono" style="font-size:9.8px;color:#695c6c;">SKU-NMD-GLS-2026 · TikTok Shop ID #8841209</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:14px;font-weight:700;color:#be185d;">${fmtIdr(sel.gmv)}</div>
              <div style="font-size:9.5px;color:#047857;font-weight:600;">38,6% dari GMV Sesi</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:5px 7px;">
              <div style="font-size:9.2px;color:#695c6c;">Kecepatan Jual</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;">49 pcs/jam</div>
            </div>
            <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:5px 7px;">
              <div style="font-size:9.2px;color:#695c6c;">CVR Keranjang</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#047857;">6,20%</div>
            </div>
            <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;padding:5px 7px;">
              <div style="font-size:9.2px;color:#be123c;">ETA Habis (L)</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#be123c;">16 menit</div>
            </div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('sliders', 13, '#be185d')}
            <span>Matriks Stok Varian Ukuran &amp; Kecepatan Habis</span>
          </div>
          <span class="e-panel-sub">WMS Jakarta + Bandung</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          ${sizeRows
            .map((sr) => {
              const remPct = Math.round((sr.qty / sr.init) * 100);
              const barColor = sr.tone === 'bad' ? '#be123c' : sr.tone === 'warn' ? '#b45309' : '#047857';
              return `<div style="border:1px solid ${sr.tone === 'bad' ? '#fecdd3' : '#e6dfe9'};background:${sr.tone === 'bad' ? '#fff7f8' : '#ffffff'};border-radius:3px;padding:7px 8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <span style="font-weight:700;font-size:10.8px;color:${sr.tone === 'bad' ? '#be123c' : '#18131a'};">${esc(sr.sz)}</span>
                  <span class="mono" style="font-size:10.5px;font-weight:700;">${sr.qty} / ${sr.init} pcs (${remPct}%)</span>
                </div>
                <div style="height:6px;background:#ece6ef;border-radius:2px;overflow:hidden;margin-bottom:4px;">
                  <div style="width:${remPct}%;height:100%;background:${barColor};"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9.6px;color:#695c6c;">
                  <span>Laju: <strong class="mono" style="color:#18131a;">${sr.vel}</strong></span>
                  <span>Estimasi habis: <strong class="mono" style="color:${barColor};">${sr.eta}</strong></span>
                </div>
              </div>`;
            })
            .join('')}

          <div class="kl-cue-banner" style="margin-top:2px;">
            <div style="font-size:9.5px;font-weight:700;color:#831843;margin-bottom:2px;">REKOMENDASI OTOMATIS ENGINE ATRIBUSI</div>
            Alihkan pin utama ke <strong>ET-04 (Hijab Voal 3s, margin 48%, stok 412)</strong> dalam 10 menit dan tawarkan cross-sell <strong>ET-06 Ciput Rajut</strong> untuk menjaga AOV &gt; Rp 200 rb.
          </div>
          <div style="margin-top:auto;border-top:1px solid #ece6ef;padding-top:6px;display:flex;justify-content:space-between;font-size:9.8px;color:#524656;">
            <span>Puncak transaksi ET-01: <strong class="mono" style="color:#18131a;">20:04 WIB (19 pcs / 5 mnt)</strong></span>
            <span>Retur historis SKU: <strong class="mono" style="color:#047857;">1,4% (Sangat Baik)</strong></span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:0 0 156px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('zap', 13, '#be185d')}
            <span>Aksi Cepat Produser ke Studio-2</span>
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div class="kl-kv"><span class="kl-kv-k">Stok Cadangan Buffer WH-BDG</span><span class="kl-kv-v mono">L: 18 pcs (Siap Transfer)</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Skor Kanibalisasi ET-01 -> ET-04</span><span class="kl-kv-v mono" style="color:#047857;">Rendah (0,12 · Komplementer)</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:2px;">
            <span class="e-btn e-btn-primary" style="justify-content:center;">${ic('play', 11, '#fff')} Pin ET-04 Sekarang</span>
            <span class="e-btn" style="justify-content:center;">${ic('refresh', 11)} Tarik Buffer WH-BDG</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p2',
    crumbGroup: 'Operasi Live BI',
    pageTitle: 'Workbench Etalase, Stok Flash & Kecepatan Konversi',
    rightActions: `
      <span class="e-btn">${ic('refresh', 11)} Sinkron Stok WMS</span>
      <span class="e-btn e-btn-primary">${ic('zap', 11, '#fff')} Kirim Peringatan Size L</span>
    `,
    contentHtml: `${facetBar}${mainSplit}`,
  });
}

// ============================================================================
// PAGE 3: LINEAGE MEDALLION CLICKHOUSE & INSPEKTOR KONTRAK SQL/dbt
// (Databricks / Snowflake Enterprise Signature Surface)
// ============================================================================
function renderPage3() {
  const clusterStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Throughput Ingest SignalR</span>${badge('LIVE', 'ok')}</div>
      <div class="kl-kpi-val">14.820 evt/dtk</div>
      <div class="kl-kpi-foot"><span>4.280 sesi WebSocket</span><span class="mono">p95 18 ms</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Baris Event Hari Ini (ClickHouse)</span>${badge('SHARD x2', 'info')}</div>
      <div class="kl-kpi-val">48,6 jt baris</div>
      <div class="kl-kpi-foot"><span>Kompresi ZSTD 9,4x</span><span class="mono">4,12 GB/hari</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Kesegaran Mart Gold (SLA)</span>${badge('99,98%', 'ok')}</div>
      <div class="kl-kpi-val">8,4 detik</div>
      <div class="kl-kpi-foot"><span>Ambang SLA &lt;= 15 dtk</span><span class="mono">0 delay</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Uji Kontrak Data (dbt test)</span>${badge('42/42 PASS', 'ok')}</div>
      <div class="kl-kpi-val">100,0%</div>
      <div class="kl-kpi-foot"><span>Selisih GMV API vs CH</span><span class="mono">Rp 0 (0,00%)</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Masking PII UU PDP (Silver)</span>${badge('ENFORCED', 'accent')}</div>
      <div class="kl-kpi-val">SHA-256 + Salt</div>
      <div class="kl-kpi-foot"><span>HP &amp; Alamat Pembeli</span><span class="mono">0 kebocoran</span></div>
    </div>
  </div>`;

  // Custom Medallion Bronze -> Silver -> Gold -> Serving SVG DAG (1480 x 320 viewBox)
  const dagSvg = `<svg viewBox="0 0 1480 315" width="100%" height="315" style="display:block;background:#fcfafd;">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b768f" />
      </marker>
      <marker id="arrPink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#be185d" />
      </marker>
    </defs>

    <!-- Medallion Zone Columns -->
    <rect x="10" y="8" width="320" height="298" rx="4" fill="#fffaf5" stroke="#edd8c4" stroke-width="1" />
    <rect x="10" y="8" width="320" height="24" rx="4" fill="#fef3e6" />
    <text x="22" y="24" font-size="10.5" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#9a3412">BRONZE · RAW EVENT STREAM (KAFKA / SIGNALR)</text>

    <rect x="366" y="8" width="340" height="298" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <rect x="366" y="8" width="340" height="24" rx="4" fill="#eef2f7" />
    <text x="378" y="24" font-size="10.5" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#334155">SILVER · CLEANSED, DEDUP &amp; UU PDP MASKED</text>

    <rect x="742" y="8" width="360" height="298" rx="4" fill="#fdf8fb" stroke="#f0c8dc" stroke-width="1" />
    <rect x="742" y="8" width="360" height="24" rx="4" fill="#fce7f3" />
    <text x="754" y="24" font-size="10.5" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#831843">GOLD · MATERIALIZED BI MARTS (CLICKHOUSE)</text>

    <rect x="1138" y="8" width="332" height="298" rx="4" fill="#f5fbf8" stroke="#bde5d2" stroke-width="1" />
    <rect x="1138" y="8" width="332" height="24" rx="4" fill="#e6f7ef" />
    <text x="1150" y="24" font-size="10.5" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#065f46">SERVING · KOKPIT, TELEPROMPTER &amp; CORETAX</text>

    <!-- Connector Paths Bronze -> Silver -->
    <path d="M 314 72 C 345 72, 345 72, 382 72" fill="none" stroke="#8b768f" stroke-width="1.4" marker-end="url(#arr)" />
    <path d="M 314 72 C 345 72, 345 140, 382 140" fill="none" stroke="#8b768f" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#arr)" />
    <path d="M 314 140 C 345 140, 345 72, 382 72" fill="none" stroke="#be185d" stroke-width="1.6" marker-end="url(#arrPink)" />
    <path d="M 314 208 C 345 208, 345 208, 382 208" fill="none" stroke="#8b768f" stroke-width="1.4" marker-end="url(#arr)" />
    <path d="M 314 274 C 345 274, 345 274, 382 274" fill="none" stroke="#8b768f" stroke-width="1.4" marker-end="url(#arr)" />

    <!-- Connector Paths Silver -> Gold -->
    <path d="M 690 72 C 722 72, 722 72, 758 72" fill="none" stroke="#be185d" stroke-width="1.8" marker-end="url(#arrPink)" />
    <path d="M 690 72 C 722 72, 722 140, 758 140" fill="none" stroke="#8b768f" stroke-width="1.3" marker-end="url(#arr)" />
    <path d="M 690 140 C 722 140, 722 72, 758 72" fill="none" stroke="#be185d" stroke-width="1.5" marker-end="url(#arrPink)" />
    <path d="M 690 208 C 722 208, 722 208, 758 208" fill="none" stroke="#8b768f" stroke-width="1.4" marker-end="url(#arr)" />
    <path d="M 690 274 C 722 274, 722 140, 758 140" fill="none" stroke="#8b768f" stroke-width="1.3" marker-end="url(#arr)" />
    <path d="M 690 72 C 725 72, 725 274, 758 274" fill="none" stroke="#8b768f" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#arr)" />

    <!-- Connector Paths Gold -> Serving -->
    <path d="M 1086 72 C 1118 72, 1118 78, 1154 78" fill="none" stroke="#be185d" stroke-width="1.8" marker-end="url(#arrPink)" />
    <path d="M 1086 140 C 1118 140, 1118 158, 1154 158" fill="none" stroke="#be185d" stroke-width="1.5" marker-end="url(#arrPink)" />
    <path d="M 1086 208 C 1118 208, 1118 158, 1154 158" fill="none" stroke="#8b768f" stroke-width="1.4" marker-end="url(#arr)" />
    <path d="M 1086 274 C 1118 274, 1118 242, 1154 242" fill="none" stroke="#047857" stroke-width="1.5" marker-end="url(#arr)" />

    <!-- BRONZE NODES -->
    ${[
      { y: 46, name: 'raw_tiktok_live_events', meta: '9.410 evt/dtk · MergeTree', tag: 'JSON' },
      { y: 114, name: 'raw_shopee_order_webhook', meta: '3.120 evt/dtk · Webhook v2', tag: 'HMAC' },
      { y: 182, name: 'raw_gmv_max_ad_spend', meta: '860 evt/dtk · Ad API 60s', tag: 'POLL' },
      { y: 248, name: 'raw_wms_stock_delta', meta: '1.430 evt/dtk · CDC Binlog', tag: 'CDC' },
    ]
      .map(
        (n) => `<g>
        <rect x="24" y="${n.y}" width="290" height="50" rx="3" fill="#ffffff" stroke="#d9b493" stroke-width="1.1" />
        <rect x="24" y="${n.y}" width="4" height="50" rx="1" fill="#c2410c" />
        <text x="36" y="${n.y + 19}" font-size="10.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#18131a">${n.name}</text>
        <text x="36" y="${n.y + 36}" font-size="9.5" font-family="system-ui,Segoe UI,sans-serif" fill="#695c6c">${n.meta}</text>
        <rect x="266" y="${n.y + 8}" width="40" height="16" rx="2" fill="#fff7ed" stroke="#fdba74" />
        <text x="286" y="${n.y + 19}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#9a3412">${n.tag}</text>
      </g>`
      )
      .join('')}

    <!-- SILVER NODES -->
    ${[
      { y: 46, name: 'stg_live_orders_dedup', meta: 'ReplacingMergeTree · PII Masked', tag: 'OK' },
      { y: 114, name: 'stg_viewer_retention_10s', meta: 'AggregatingMergeTree · 4.280 sesi', tag: 'OK' },
      { y: 182, name: 'stg_ad_spend_minute', meta: 'Window 1m · TikTok + Shopee', tag: 'OK' },
      { y: 248, name: 'stg_sku_inventory_snapshot', meta: 'argMax(qty) · WH-JKT & WH-BDG', tag: 'OK' },
    ]
      .map(
        (n) => `<g>
        <rect x="382" y="${n.y}" width="308" height="50" rx="3" fill="#ffffff" stroke="#b6c2d1" stroke-width="1.1" />
        <rect x="382" y="${n.y}" width="4" height="50" rx="1" fill="#475569" />
        <text x="394" y="${n.y + 19}" font-size="10.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#18131a">${n.name}</text>
        <text x="394" y="${n.y + 36}" font-size="9.5" font-family="system-ui,Segoe UI,sans-serif" fill="#695c6c">${n.meta}</text>
        <rect x="652" y="${n.y + 8}" width="30" height="16" rx="2" fill="#ecfdf5" stroke="#a7f3d0" />
        <text x="667" y="${n.y + 19}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">${n.tag}</text>
      </g>`
      )
      .join('')}

    <!-- GOLD NODES -->
    ${[
      { y: 46, name: 'mart_gmv_attribution_host', meta: 'SELECTED · 15m Last-Pin · 62 ms', tag: 'ACTIVE', active: true },
      { y: 114, name: 'mart_etalase_cvr_velocity', meta: '18 SKU · ETA Stok Habis Real-Time', tag: '8,4s' },
      { y: 182, name: 'mart_roas_margin_guard', meta: '8 Kampanye · Auto-Alert CPA > 28rb', tag: 'WARN' },
      { y: 248, name: 'mart_affiliate_settlement', meta: '12 Penerima · PPh 21/23 + CoreTax', tag: 'SYNC' },
    ]
      .map(
        (n) => `<g>
        <rect x="758" y="${n.y}" width="328" height="50" rx="3" fill="${n.active ? '#fdf2f8' : '#ffffff'}" stroke="${n.active ? '#be185d' : '#dfb6cc'}" stroke-width="${n.active ? '1.8' : '1.1'}" />
        <rect x="758" y="${n.y}" width="4.5" height="50" rx="1" fill="#be185d" />
        <text x="770" y="${n.y + 19}" font-size="10.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${n.active ? '#831843' : '#18131a'}">${n.name}</text>
        <text x="770" y="${n.y + 36}" font-size="9.5" font-family="system-ui,Segoe UI,sans-serif" fill="#695c6c">${n.meta}</text>
        <rect x="1030" y="${n.y + 8}" width="48" height="16" rx="2" fill="${n.tag === 'WARN' ? '#fffbeb' : n.active ? '#be185d' : '#fdf2f8'}" stroke="${n.tag === 'WARN' ? '#fde68a' : '#f5b4d3'}" />
        <text x="1054" y="${n.y + 19}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${n.tag === 'WARN' ? '#b45309' : n.active ? '#ffffff' : '#831843'}">${n.tag}</text>
      </g>`
      )
      .join('')}

    <!-- SERVING NODES -->
    ${[
      { y: 48, name: 'Kokpit Produser & BI Lakehouse', meta: 'React Query · Refresh 5 dtk · 64,2 jt', tag: '200 OK' },
      { y: 128, name: 'SignalR Cue & Teleprompter Hub', meta: '.NET 9 Backplane · Studio 1–4 (14 ms)', tag: 'LIVE' },
      { y: 212, name: 'CoreTax XML & BI-FAST Exporter', meta: 'WORM SHA-256 Signed · PSAK Balanced', tag: 'READY' },
    ]
      .map(
        (n) => `<g>
        <rect x="1154" y="${n.y}" width="302" height="62" rx="3" fill="#ffffff" stroke="#8fd1b4" stroke-width="1.1" />
        <rect x="1154" y="${n.y}" width="4" height="62" rx="1" fill="#047857" />
        <text x="1166" y="${n.y + 22}" font-size="10.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#18131a">${n.name}</text>
        <text x="1166" y="${n.y + 41}" font-size="9.5" font-family="system-ui,Segoe UI,sans-serif" fill="#524656">${n.meta}</text>
        <rect x="1400" y="${n.y + 10}" width="48" height="16" rx="2" fill="#ecfdf5" stroke="#a7f3d0" />
        <text x="1424" y="${n.y + 21}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">${n.tag}</text>
      </g>`
      )
      .join('')}
  </svg>`;

  const sqlCode = `<span class="sql-cm">-- dbt model: models/gold/mart_gmv_attribution_host.sql (ClickHouse 24.8)</span>
<span class="sql-cm">-- Kontrak: Atribusi 15-menit Last-Pin Touchpoint | SLA &lt;= 15 dtk | Zero PII</span>
<span class="sql-kw">SELECT</span>
  o.session_id,
  h.host_code,
  o.etalase_code,
  o.province_code,
  <span class="sql-fn">countDistinct</span>(o.order_id)                                   <span class="sql-kw">AS</span> orders_paid,
  <span class="sql-fn">sum</span>(o.item_qty)                                             <span class="sql-kw">AS</span> units_sold,
  <span class="sql-fn">sum</span>(o.gross_gmv_idr)                                        <span class="sql-kw">AS</span> gmv_gross_idr,
  <span class="sql-fn">sumIf</span>(o.gross_gmv_idr, o.cod_risk_flag = <span class="sql-num">1</span>) * <span class="sql-num">0.214</span>         <span class="sql-kw">AS</span> est_cod_cancel_idr,
  <span class="sql-fn">round</span>(units_sold / <span class="sql-fn">nullIf</span>(<span class="sql-fn">sum</span>(c.cart_clicks), <span class="sql-num">0</span>) * <span class="sql-num">100</span>, <span class="sql-num">2</span>)  <span class="sql-kw">AS</span> cvr_pct,
  <span class="sql-fn">argMax</span>(s.stock_remaining, s.event_ts)                       <span class="sql-kw">AS</span> latest_wms_stock
<span class="sql-kw">FROM</span> silver.stg_live_orders_dedup <span class="sql-kw">AS</span> o <span class="sql-kw">FINAL</span>
<span class="sql-kw">ASOF LEFT JOIN</span> silver.stg_host_shift_pins <span class="sql-kw">AS</span> h
  <span class="sql-kw">ON</span> o.session_id = h.session_id <span class="sql-kw">AND</span> o.order_ts &gt;= h.pin_ts
<span class="sql-kw">LEFT JOIN</span> silver.stg_etalase_clicks_10s <span class="sql-kw">AS</span> c <span class="sql-kw">USING</span> (session_id, etalase_code)
<span class="sql-kw">LEFT JOIN</span> silver.stg_sku_inventory_snapshot <span class="sql-kw">AS</span> s <span class="sql-kw">USING</span> (sku_id)
<span class="sql-kw">WHERE</span> o.session_id = <span class="sql-str">'STD2-PAYDAY-2611'</span>
  <span class="sql-kw">AND</span> <span class="sql-fn">dateDiff</span>(<span class="sql-str">'minute'</span>, h.pin_ts, o.order_ts) &lt;= <span class="sql-num">15</span>
<span class="sql-kw">GROUP BY</span> o.session_id, h.host_code, o.etalase_code, o.province_code;`;

  const dbtTests = [
    { name: 'unique_order_id_dedup', layer: 'Silver', rule: '0 duplikat webhook TikTok/Shopee', rows: '312 / 312', dur: '14 ms', status: 'PASS' },
    { name: 'gmv_reconciliation_api_vs_ch', layer: 'Gold', rule: 'Selisih GMV API vs Lakehouse < 0,01%', rows: 'Rp 64,2 jt', dur: '38 ms', status: 'PASS' },
    { name: 'uupdp_buyer_phone_sha256', layer: 'Silver', rule: 'Tidak ada nomor +62 mentah di tabel', rows: '100% Hash', dur: '19 ms', status: 'PASS' },
    { name: 'accepted_values_channel_id', layer: 'Bronze', rule: 'Enum IN (TIKTOK_SHOP, SHOPEE_LIVE)', rows: '48,6 jt', dur: '24 ms', status: 'PASS' },
    { name: 'referential_sku_to_wms', layer: 'Gold', rule: 'Semua 18 etalase punya kunci WMS valid', rows: '18 / 18', dur: '11 ms', status: 'PASS' },
    { name: 'freshness_signalr_15s_sla', layer: 'Serving', rule: 'Umur partisi terakhir <= 15 detik', rows: '8,4 dtk', dur: '6 ms', status: 'PASS' },
    { name: 'roas_guardrail_non_negative', layer: 'Gold', rule: 'spend > 0 dan attr_gmv >= 0', rows: '8 / 8', dur: '9 ms', status: 'PASS' },
    { name: 'cod_cancel_rate_bounds', layer: 'Gold', rule: '0% <= cod_cancel_pct <= 40%', rows: '8 Prov.', dur: '12 ms', status: 'PASS' },
    { name: 'settlement_psak_zero_drift', layer: 'Gold', rule: 'Total Debit == Total Kredit PSAK', rows: 'Rp 6,46 jt', dur: '16 ms', status: 'PASS' },
    { name: 'not_null_host_shift_id', layer: 'Silver', rule: 'Semua transaksi punya host_code valid', rows: '312 / 312', dur: '8 ms', status: 'PASS' },
    { name: 'valid_coretax_npwp_16digit', layer: 'Gold', rule: 'Format NPWP / NIK 16-digit CoreTax', rows: '12 / 12', dur: '15 ms', status: 'PASS' },
    { name: 'signalr_ack_p95_under_50ms', layer: 'Serving', rule: 'ACK Teleprompter Studio 1–4 <= 50 ms', rows: '14 ms', dur: '5 ms', status: 'PASS' },
  ];

  const lowerSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.18fr 1fr;gap:8px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('code', 13, '#be185d')}
          <span>Inspektor Kontrak SQL / dbt — mart_gmv_attribution_host.sql</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">Query 62 ms · 4,82 jt baris dipindai</span>
          ${badge('v2.14.0', 'accent')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:8px;display:flex;flex-direction:column;gap:7px;">
        <div class="kl-sql" style="flex:1;">${sqlCode}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#695c6c;">Engine ClickHouse</div>
            <div class="mono" style="font-size:10.5px;font-weight:700;">ReplacingMergeTree</div>
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#695c6c;">Partition Key</div>
            <div class="mono" style="font-size:10.5px;font-weight:700;">toYYYYMM(order_ts)</div>
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#695c6c;">Pemilik Kontrak</div>
            <div class="mono" style="font-size:10.5px;font-weight:700;">BI-DataEng-JKT</div>
          </div>
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#047857;">Hash Skema YAML</div>
            <div class="mono" style="font-size:10.5px;font-weight:700;color:#047857;">sha256:9d4a..e21f</div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('checkCircle', 13, '#047857')}
          <span>Validasi Kontrak Data &amp; Kualitas dbt Test</span>
        </div>
        ${badge('12/12 Kritis Lulus', 'ok')}
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table kl-dense">
          <colgroup>
            <col style="width:31%;" />
            <col style="width:11%;" />
            <col style="width:30%;" />
            <col style="width:12%;" />
            <col style="width:8%;" />
            <col style="width:8%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Nama Uji Kontrak (dbt)</th>
              <th>Lapisan</th>
              <th>Aturan Integritas</th>
              <th class="num">Cakupan</th>
              <th class="num">Durasi</th>
              <th>Hasil</th>
            </tr>
          </thead>
          <tbody>
            ${dbtTests
              .map(
                (t) => `<tr>
                <td class="mono" style="font-weight:600;font-size:9.8px;">${esc(t.name)}</td>
                <td>${badge(t.layer, t.layer === 'Gold' ? 'accent' : t.layer === 'Silver' ? 'info' : 'neutral')}</td>
                <td style="font-size:10px;color:#4b3f4e;">${esc(t.rule)}</td>
                <td class="num mono" style="font-size:9.8px;">${esc(t.rows)}</td>
                <td class="num mono" style="font-size:9.6px;color:#695c6c;">${t.dur}</td>
                <td>${badge(t.status, 'ok')}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p3',
    crumbGroup: 'Lakehouse & Rekayasa Data',
    pageTitle: 'Lineage Medallion ClickHouse & Inspektor Kontrak SQL/dbt',
    rightActions: `
      <span class="e-btn">${ic('gitBranch', 11)} dbt Docs v2.14</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#fff')} Jalankan Uji Kontrak</span>
    `,
    contentHtml: `${clusterStrip}
      <div class="e-panel" style="flex:0 0 350px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('database', 13, '#be185d')}
            <span>DAG Lineage Medallion (Bronze -&gt; Silver -&gt; Gold -&gt; Serving)</span>
            <span class="e-panel-sub">Klik simpul untuk inspeksi skema SQL &amp; SLA kesegaran</span>
          </div>
          <div style="display:flex;gap:5px;">
            ${badge('4 Sumber Stream', 'neutral')}
            ${badge('12 Model dbt', 'accent')}
            ${badge('Zero Drift', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush">${dagSvg}</div>
      </div>
      ${lowerSplit}`,
  });
}

// ============================================================================
// PAGE 4: PENJAGA ROAS GMV MAX, WATERFALL MARGIN & SIMULATOR WHAT-IF
// ============================================================================
function renderPage4() {
  // Custom SVG Profit Waterfall Bridge (Rp 64,2 jt -> Rp 13,84 jt exact)
  const wfSteps = [
    { label: 'GMV Bruto', val: TOTAL_GMV, start: 0, end: TOTAL_GMV, color: '#be185d', isTotal: true },
    { label: 'Batal COD', val: -TOTAL_COD_CANCEL, start: NET_GMV, end: TOTAL_GMV, color: '#b45309' },
    { label: 'HPP (44%)', val: -COGS_IDR, start: NET_GMV - COGS_IDR, end: NET_GMV, color: '#64748b' },
    { label: 'Biaya Platform', val: -PLATFORM_FEE_IDR, start: NET_GMV - COGS_IDR - PLATFORM_FEE_IDR, end: NET_GMV - COGS_IDR, color: '#475569' },
    { label: 'Iklan GMV Max', val: -TOTAL_AD_SPEND, start: NET_CONTRIBUTION_IDR + TOTAL_PAYOUT_BRUTO, end: NET_GMV - COGS_IDR - PLATFORM_FEE_IDR, color: '#be123c' },
    { label: 'Bonus & Aff.', val: -TOTAL_PAYOUT_BRUTO, start: NET_CONTRIBUTION_IDR, end: NET_CONTRIBUTION_IDR + TOTAL_PAYOUT_BRUTO, color: '#0369a1' },
    { label: 'Laba Bersih', val: NET_CONTRIBUTION_IDR, start: 0, end: NET_CONTRIBUTION_IDR, color: '#047857', isTotal: true },
  ];

  const wfW = 810, wfH = 264, pL = 64, pR = 16, pT = 24, pB = 34;
  const plotW = wfW - pL - pR;
  const plotH = wfH - pT - pB;
  const maxVal = 70000000;
  const yOf = (v) => pT + plotH - (v / maxVal) * plotH;
  const slotW = plotW / wfSteps.length;
  const barW = slotW * 0.56;

  let wfSvg = '';
  for (let i = 0; i <= 4; i++) {
    const gv = (maxVal / 4) * i;
    const gy = yOf(gv);
    wfSvg += `<line x1="${pL}" y1="${gy.toFixed(1)}" x2="${wfW - pR}" y2="${gy.toFixed(1)}" stroke="#e6dfe9" stroke-width="1" ${i > 0 ? 'stroke-dasharray="2,3"' : ''} />`;
    wfSvg += `<text x="${pL - 7}" y="${(gy + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#695c6c">${(gv / 1e6).toFixed(1).replace('.', ',')} jt</text>`;
  }

  wfSteps.forEach((st, idx) => {
    const x = pL + idx * slotW + (slotW - barW) / 2;
    const yTop = yOf(st.end);
    const yBot = yOf(st.start);
    const h = Math.max(2, yBot - yTop);
    wfSvg += `<rect x="${x.toFixed(1)}" y="${yTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${st.color}" />`;
    if (idx < wfSteps.length - 1) {
      const connY = st.isTotal ? yTop : yBot;
      const nextX = pL + (idx + 1) * slotW + (slotW - barW) / 2;
      wfSvg += `<line x1="${(x + barW).toFixed(1)}" y1="${connY.toFixed(1)}" x2="${nextX.toFixed(1)}" y2="${connY.toFixed(1)}" stroke="#9f90a4" stroke-width="1" stroke-dasharray="2,2" />`;
    }
    const valLbl = `${st.val < 0 ? '-' : ''}${(Math.abs(st.val) / 1e6).toFixed(2).replace('.', ',')} jt`;
    wfSvg += `<text x="${(x + barW / 2).toFixed(1)}" y="${(yTop - 5).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${st.color}">${valLbl}</text>`;
    wfSvg += `<text x="${(x + barW / 2).toFixed(1)}" y="${wfH - 12}" text-anchor="middle" font-size="9.8" font-weight="600" font-family="system-ui,Segoe UI,sans-serif" fill="#2b212e">${esc(st.label)}</text>`;
  });

  const waterfallHtml = `<svg viewBox="0 0 ${wfW} ${wfH}" width="100%" height="${wfH}" style="display:block;">${wfSvg}</svg>`;

  // What-If Simulation Cards
  const scenarios = [
    {
      name: 'Skenario A · Kondisi Aktual (Berjalan)',
      spend: 'Rp 9,44 jt',
      roas: '6,8x',
      gmv: 'Rp 64,20 jt',
      net: 'Rp 13,84 jt',
      margin: '21,6%',
      note: 'AD-03 membakar Rp 1,64 jt pada ROAS 2,1x',
      active: false,
      tone: 'neutral',
    },
    {
      name: 'Skenario B · Jeda AD-03 & Geser ke AD-01/05',
      spend: 'Rp 8,60 jt',
      roas: '8,1x',
      gmv: 'Rp 69,66 jt',
      net: 'Rp 16,92 jt',
      margin: '24,3%',
      note: '+Rp 3,08 jt laba bersih · CPA turun ke Rp 21.400',
      active: true,
      tone: 'ok',
    },
    {
      name: 'Skenario C · Agresif Boost Payday (+30% Spend)',
      spend: 'Rp 12,27 jt',
      roas: '5,2x',
      gmv: 'Rp 63,80 jt',
      net: 'Rp 10,88 jt',
      margin: '17,1%',
      note: 'Risiko boncos: kejenuhan audiens & stok L habis',
      active: false,
      tone: 'bad',
    },
  ];

  // Stacked hourly spend chart
  const hourlySpendSvg = svgStackedBarChart({
    width: 470,
    height: 278,
    categories: ['17:00', '18:00', '19:00', '20:00'],
    yFormat: (v) => `${(v / 1e6).toFixed(1)}jt`,
    series: [
      { label: 'TikTok GMV Max', color: '#be185d', values: [1100000, 1750000, 1980000, 1610000] },
      { label: 'TikTok Broad (AD-03)', color: '#be123c', values: [220000, 380000, 520000, 520000] },
      { label: 'Shopee Live Ads', color: '#0369a1', values: [260000, 390000, 440000, 270000] },
    ],
  });

  const campRows = AD_CAMPAIGNS.map((c) => {
    const cpaOver = c.cpa > 28000;
    return `<tr class="${c.bad ? 'is-bad' : c.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#831843;">${esc(c.id)}</td>
      <td style="font-weight:600;">${esc(c.name)}</td>
      <td>${badge(c.platform, c.platform === 'TikTok Ads' ? 'dark' : 'warn')}</td>
      <td style="color:#524656;">${esc(c.mode)}</td>
      <td class="num mono">${fmtIdr(c.spend)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(c.attrGmv)}</td>
      <td class="num mono">${c.orders}</td>
      <td class="num mono" style="color:${cpaOver ? '#be123c' : '#18131a'};font-weight:${cpaOver ? '700' : '500'};">${fmtIdr(c.cpa)}</td>
      <td class="num mono" style="color:${c.roas < 3.5 ? '#be123c' : c.roas >= 6.5 ? '#047857' : '#18131a'};font-weight:700;">${c.roas.toFixed(1).replace('.', ',')}x</td>
      <td>${badge(c.status, c.tone)}</td>
    </tr>`;
  }).join('');

  const topGrid = `<div style="flex:0 0 364px;display:grid;grid-template-columns:1.38fr 1fr;gap:8px;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('activity', 13, '#be185d')}
          <span>Waterfall Laba Kontribusi Sesi Studio 2 (Anti-Boncos)</span>
        </div>
        <div style="display:flex;gap:5px;align-items:center;">
          <span class="e-panel-sub">Margin Bersih:</span>
          ${badge(`${fmtPct(NET_MARGIN_PCT)} (${fmtIdr(NET_CONTRIBUTION_IDR)})`, 'ok')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;">
        ${waterfallHtml}
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ece6ef;padding-top:6px;font-size:10px;color:#524656;">
          <span>Break-Even ROAS Minimum (Margin Produk 44%): <strong class="mono" style="color:#be185d;">3,45x</strong></span>
          <span>ROAS Aktual Sesi: <strong class="mono" style="color:#047857;">6,80x (+3,35x di atas BEP)</strong></span>
          <span>Anggaran Iklan Tersisa: <strong class="mono">Rp 5,56 jt / Rp 15 jt</strong></span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('sliders', 13, '#be185d')}
          <span>Simulator What-If Alokasi Bid &amp; Guardrail Margin</span>
        </div>
        ${badge('REKOMENDASI B', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
        ${scenarios
          .map(
            (s) => `<div style="border:1px solid ${s.active ? '#be185d' : '#e2dae6'};background:${s.active ? '#fdf2f8' : '#ffffff'};border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-weight:700;font-size:10.8px;color:${s.active ? '#831843' : '#18131a'};">${esc(s.name)}</span>
              ${badge(`Margin ${s.margin}`, s.tone)}
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:4px;">
              <div><div style="font-size:9px;color:#695c6c;">Spend</div><div class="mono" style="font-weight:700;">${s.spend}</div></div>
              <div><div style="font-size:9px;color:#695c6c;">Est. ROAS</div><div class="mono" style="font-weight:700;color:${s.active ? '#047857' : '#18131a'};">${s.roas}</div></div>
              <div><div style="font-size:9px;color:#695c6c;">Est. GMV</div><div class="mono" style="font-weight:700;">${s.gmv}</div></div>
              <div><div style="font-size:9px;color:#695c6c;">Laba Bersih</div><div class="mono" style="font-weight:700;color:${s.tone === 'bad' ? '#be123c' : '#047857'};">${s.net}</div></div>
            </div>
            <div style="font-size:9.6px;color:#524656;">${esc(s.note)}</div>
          </div>`
          )
          .join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;padding:6px 8px;">
          <span style="font-size:10px;color:#881337;"><strong>Guardrail Aktif:</strong> Auto-Throttle 40% bila CPA &gt; Rp 28.000 selama 10 mnt</span>
          <span class="e-btn e-btn-primary" style="height:22px;">Terapkan Skenario B</span>
        </div>
      </div>
    </div>
  </div>`;

  const botGrid = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.85fr 1fr;gap:8px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('zap', 13, '#be185d')}
          <span>Daftar Kampanye Iklan Aktif (TikTok GMV Max &amp; Shopee Live Ads)</span>
        </div>
        <span class="e-panel-sub">Batas CPA: Rp 28.000 · 8 Kampanye · Total Spend Rp 9,44 jt</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table kl-dense">
          <colgroup>
            <col style="width:6.5%;" />
            <col style="width:20.5%;" />
            <col style="width:9.5%;" />
            <col style="width:10.5%;" />
            <col style="width:10.5%;" />
            <col style="width:11%;" />
            <col style="width:5.5%;" />
            <col style="width:9.5%;" />
            <col style="width:6.5%;" />
            <col style="width:10%;" />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Kampanye</th>
              <th>Platform</th>
              <th>Strategi Bid</th>
              <th class="num">Belanja</th>
              <th class="num">GMV Teratribusi</th>
              <th class="num">Order</th>
              <th class="num">CPA</th>
              <th class="num">ROAS</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${campRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="4">TOTAL 8 KAMPANYE (BLENDED SESI: 6,8x)</td>
              <td class="num mono">${fmtIdr(TOTAL_AD_SPEND)}</td>
              <td class="num mono">${fmtIdr(TOTAL_AD_ATTR_GMV)}</td>
              <td class="num mono">356</td>
              <td class="num mono">${fmtIdr(Math.round(TOTAL_AD_SPEND / 356))}</td>
              <td class="num mono">${(TOTAL_AD_ATTR_GMV / TOTAL_AD_SPEND).toFixed(1).replace('.', ',')}x</td>
              <td>${badge('1 Alert', 'bad')}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:auto;padding:8px 10px;background:#faf8fb;border-top:1px solid #e5dee8;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:10px;font-weight:700;color:#18131a;">Log Eksekusi Auto-Guardrail Margin (TikTok GMV Max &amp; Shopee Ad API)</span>
            <span class="mono" style="font-size:9.4px;color:#047857;font-weight:700;">4 intervensi aktif · Rp 2,18 jt dicegah boncos</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:9.8px;">
            <div style="background:#fff7f8;border:1px solid #fecdd3;border-radius:3px;padding:5px 7px;display:flex;justify-content:space-between;gap:6px;">
              <span><strong class="mono" style="color:#be123c;">20:41</strong> · AD-03 CPA Rp 34.167 (&gt; 28rb) -&gt; Rekomendasi Jeda</span>
              ${badge('Action', 'bad')}
            </div>
            <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:5px 7px;display:flex;justify-content:space-between;gap:6px;">
              <span><strong class="mono" style="color:#047857;">20:12</strong> · AD-05 Retarget ROAS 9,4x -&gt; Auto-Boost +Rp 250rb</span>
              ${badge('Auto +25%', 'ok')}
            </div>
            <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:5px 7px;display:flex;justify-content:space-between;gap:6px;">
              <span><strong class="mono" style="color:#b45309;">19:48</strong> · AD-06 Lookalike CPA Rp 26.154 -&gt; Cap Bid Rp 26rb</span>
              ${badge('Capped', 'warn')}
            </div>
            <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:5px 7px;display:flex;justify-content:space-between;gap:6px;">
              <span><strong class="mono" style="color:#047857;">19:05</strong> · AD-01 Gamis Hero ROAS 8,0x -&gt; Skala Pagu +Rp 500rb</span>
              ${badge('Scaled', 'ok')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('clock', 13, '#be185d')}
          <span>Laju Belanja Iklan per Jam (WIB)</span>
        </div>
        <span class="e-panel-sub">Pacing 62,9%</span>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
        ${hourlySpendSvg}
        <div style="border-top:1px solid #ece6ef;padding-top:6px;">
          <div class="kl-kv"><span class="kl-kv-k">TikTok GMV Max (Direct + Halo)</span><span class="kl-kv-v mono">Rp 7.780.000 (82,4%)</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Shopee Live Boost</span><span class="kl-kv-v mono">Rp 1.660.000 (17,6%)</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Penghematan Guardrail Hari Ini</span><span class="kl-kv-v mono" style="color:#047857;">Rp 2.180.000 dicegah</span></div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p4',
    crumbGroup: 'Optimasi Margin & Iklan',
    pageTitle: 'Penjaga Rasio Iklan (GMV Max), Waterfall Margin & What-If',
    rightActions: `
      <span class="e-btn">${ic('sliders', 11)} Atur Ambang CPA</span>
      <span class="e-btn e-btn-danger">${ic('alert', 11, '#be123c')} Jeda AD-03 (ROAS 2,1x)</span>
    `,
    contentHtml: `${topGrid}${botGrid}`,
  });
}

// ============================================================================
// PAGE 5: JADWAL MARATON SHIFT HOST 12 JAM, PERINGKAT GPM & RETENSI PENONTON
// ============================================================================
function renderPage5() {
  // Custom SVG 12-Hour Multi-Studio Shift Tape Chart (09:00 - 21:00 WIB)
  const gW = 1480, gH = 222, lW = 165, rPad = 48, tPad = 30, rowH = 44;
  const chartW = gW - lW - rPad;
  const xHour = (h) => lW + ((h - 9) / 12) * chartW;
  const nowX = xHour(20.7); // 20:42 WIB

  const studioSchedule = [
    {
      studio: 'Studio 1 · Flagship',
      blocks: [
        { s: 9, e: 12, host: 'Melisa Tan', gmv: '7,6 jt/j', tone: 'bad' },
        { s: 12, e: 15, host: 'Bima Prakoso', gmv: '13,2 jt/j', tone: 'neutral' },
        { s: 15, e: 18, host: 'Fajar Nugroho', gmv: '14,1 jt/j', tone: 'ok' },
        { s: 18, e: 21, host: 'Sinta Dewi P.', gmv: '18,6 jt/j', tone: 'ok', live: true },
      ],
    },
    {
      studio: 'Studio 2 · Payday',
      blocks: [
        { s: 9, e: 12, host: 'Clara Wijaya', gmv: '10,4 jt/j', tone: 'neutral' },
        { s: 12, e: 15, host: 'Farhan Alfarizi', gmv: '11,1 jt/j', tone: 'neutral' },
        { s: 15, e: 18, host: 'Raka Mahendra', gmv: '15,8 jt/j', tone: 'ok' },
        { s: 18, e: 21, host: 'Nadya Larasati (TOP)', gmv: '21,4 jt/j · +3%', tone: 'accent', live: true },
      ],
    },
    {
      studio: 'Studio 3 · Shopee',
      blocks: [
        { s: 9, e: 12, host: 'Tania Putri', gmv: '8,9 jt/j', tone: 'neutral' },
        { s: 12, e: 15, host: 'Reza Pahlevi', gmv: '10,2 jt/j', tone: 'neutral' },
        { s: 15, e: 18, host: 'Aulia Rahma', gmv: '9,8 jt/j', tone: 'warn' },
        { s: 18, e: 21, host: 'Putri Wulandari', gmv: '14,9 jt/j', tone: 'ok', live: true },
      ],
    },
    {
      studio: 'Studio 4 · Bundle',
      blocks: [
        { s: 9, e: 12, host: 'Nadia Safitri', gmv: '7,9 jt/j', tone: 'neutral' },
        { s: 12, e: 15, host: 'Arif Budiman', gmv: '8,4 jt/j', tone: 'warn' },
        { s: 15, e: 18, host: 'Bagas Pratama', gmv: '10,6 jt/j', tone: 'neutral' },
        { s: 18, e: 21, host: 'Dina Kartika', gmv: '12,4 jt/j', tone: 'ok', live: true },
      ],
    },
  ];

  const toneColors = {
    accent: { fill: '#fdf2f8', stroke: '#be185d', text: '#831843', bar: '#be185d' },
    ok: { fill: '#ecfdf5', stroke: '#6ee7b7', text: '#065f46', bar: '#047857' },
    warn: { fill: '#fffbeb', stroke: '#fcd34d', text: '#92400e', bar: '#b45309' },
    bad: { fill: '#fff1f2', stroke: '#fda4af', text: '#9f1239', bar: '#be123c' },
    neutral: { fill: '#f8fafc', stroke: '#cbd5e1', text: '#334155', bar: '#64748b' },
  };

  let ganttSvg = '';
  for (let h = 9; h <= 21; h++) {
    const x = xHour(h);
    ganttSvg += `<line x1="${x.toFixed(1)}" y1="${tPad}" x2="${x.toFixed(1)}" y2="${gH - 12}" stroke="#e7e0ea" stroke-width="1" ${h % 3 !== 0 ? 'stroke-dasharray="2,3"' : ''} />`;
    ganttSvg += `<text x="${x.toFixed(1)}" y="19" text-anchor="middle" font-size="9.8" font-weight="${h % 3 === 0 ? '700' : '500'}" font-family="ui-monospace,Consolas,monospace" fill="#524656">${String(h).padStart(2, '0')}:00</text>`;
  }

  studioSchedule.forEach((row, rIdx) => {
    const y = tPad + rIdx * rowH;
    ganttSvg += `<rect x="0" y="${y}" width="${gW}" height="${rowH}" fill="${rIdx === 1 ? '#fdf7fa' : rIdx % 2 === 0 ? '#ffffff' : '#faf8fb'}" />`;
    ganttSvg += `<line x1="0" y1="${y + rowH}" x2="${gW}" y2="${y + rowH}" stroke="#ece6ef" stroke-width="1" />`;
    ganttSvg += `<text x="14" y="${y + 26}" font-size="10.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="${rIdx === 1 ? '#831843' : '#18131a'}">${esc(row.studio)}</text>`;

    row.blocks.forEach((b) => {
      const bx = xHour(b.s) + 3;
      const bw = xHour(b.e) - xHour(b.s) - 6;
      const tc = toneColors[b.tone];
      ganttSvg += `<rect x="${bx.toFixed(1)}" y="${y + 6}" width="${bw.toFixed(1)}" height="${rowH - 12}" rx="3" fill="${tc.fill}" stroke="${tc.stroke}" stroke-width="${b.tone === 'accent' ? '1.6' : '1'}" />`;
      ganttSvg += `<rect x="${bx.toFixed(1)}" y="${y + 6}" width="4" height="${rowH - 12}" rx="1" fill="${tc.bar}" />`;
      ganttSvg += `<text x="${(bx + 10).toFixed(1)}" y="${y + 19}" font-size="10.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="${tc.text}">${esc(b.host)}</text>`;
      ganttSvg += `<text x="${(bx + 10).toFixed(1)}" y="${y + 32}" font-size="9.4" font-family="ui-monospace,Consolas,monospace" fill="#524656">${esc(b.gmv)}</text>`;
      if (b.live) {
        ganttSvg += `<rect x="${(bx + bw - 96).toFixed(1)}" y="${y + 11}" width="32" height="14" rx="2" fill="#be185d" />`;
        ganttSvg += `<text x="${(bx + bw - 80).toFixed(1)}" y="${y + 21}" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fff">LIVE</text>`;
      }
    });
  });

  // Live current time cursor at 20:42 WIB (pill at bottom avoids overlapping 20:00/21:00 axis ticks)
  ganttSvg += `<line x1="${nowX.toFixed(1)}" y1="${tPad - 4}" x2="${nowX.toFixed(1)}" y2="${gH - 18}" stroke="#be123c" stroke-width="1.8" />`;
  ganttSvg += `<circle cx="${nowX.toFixed(1)}" cy="${tPad - 4}" r="3" fill="#be123c" />`;
  ganttSvg += `<rect x="${(nowX - 35).toFixed(1)}" y="${gH - 18}" width="70" height="16" rx="2" fill="#be123c" />`;
  ganttSvg += `<text x="${nowX.toFixed(1)}" y="${gH - 7}" text-anchor="middle" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">20:42 WIB</text>`;

  const ganttHtml = `<svg viewBox="0 0 ${gW} ${gH}" width="100%" height="${gH}" style="display:block;">${ganttSvg}</svg>`;

  // Host Leaderboard Table (10 rows)
  const hostRows = HOSTS.map(
    (h, i) => `<tr class="${h.selected ? 'is-selected' : h.tone === 'bad' ? 'is-bad' : h.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#695c6c;">#${i + 1}</td>
      <td class="mono" style="font-weight:700;color:#831843;">${esc(h.code)}</td>
      <td style="font-weight:700;">${esc(h.name)}</td>
      <td>${esc(h.studio)}</td>
      <td class="mono" style="font-size:9.8px;">${esc(h.shift)}</td>
      <td class="num mono" style="font-weight:700;color:${i === 0 ? '#be185d' : '#18131a'};">${fmtIdr(h.gmvHr)}</td>
      <td class="num mono">${fmtIdr(h.gpm)}</td>
      <td class="num mono">${esc(h.avgWatch)}</td>
      <td class="num mono">${h.orders}</td>
      <td class="num mono">${fmtPct(h.cvr)}</td>
      <td>${badge(h.bonus, h.tone)}</td>
    </tr>`
  ).join('');

  // Viewer Retention Curve Chart
  const retentionSvg = svgMultiLineChart({
    width: 560,
    height: 230,
    xLabels: ['0d', '15d', '30d', '45d', '60d', '90d', '120d', '150d', '180d'],
    yMin: 0,
    yMax: 100,
    yTicks: 4,
    yFormat: (v) => `${v}%`,
    series: [
      { label: 'Nadya (Studio 2 · 2m 14d)', color: '#be185d', values: [100, 86, 76, 68, 61, 52, 44, 38, 32], area: true, dots: true, width: 2.1 },
      { label: 'Rata-rata 4 Studio MCN', color: '#0369a1', values: [100, 74, 59, 49, 41, 33, 26, 21, 17], width: 1.7 },
      { label: 'Host Coaching (< 1m 10d)', color: '#b45309', values: [100, 58, 42, 31, 23, 17, 12, 9, 6], dashed: true, width: 1.5 },
    ],
    threshold: { value: 45, label: 'Target Retensi 60d (45%)', color: '#047857' },
  });

  const bottomGrid = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.52fr 1fr;gap:8px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('users', 13, '#be185d')}
          <span>Peringkat Kinerja Shift Host (GMV/Jam, GPM &amp; Durasi Tonton)</span>
        </div>
        <span class="e-panel-sub">14 Host Maraton Payday · Diperbarui Real-Time</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table kl-dense">
          <colgroup>
            <col style="width:4.5%;" />
            <col style="width:7.5%;" />
            <col style="width:15%;" />
            <col style="width:8.5%;" />
            <col style="width:10.5%;" />
            <col style="width:13%;" />
            <col style="width:10.5%;" />
            <col style="width:7.5%;" />
            <col style="width:6.5%;" />
            <col style="width:6.5%;" />
            <col style="width:10%;" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>Kode</th>
              <th>Nama Host</th>
              <th>Studio</th>
              <th>Shift WIB</th>
              <th class="num">GMV / Jam</th>
              <th class="num">GPM</th>
              <th class="num">Tonton</th>
              <th class="num">Order</th>
              <th class="num">CVR</th>
              <th>Tier Bonus</th>
            </tr>
          </thead>
          <tbody>${hostRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="5">RATA-RATA 14 HOST MCN (MARATON 12 JAM)</td>
              <td class="num mono">${fmtIdr(HOSTS.reduce((a, h) => a + h.gmvHr, 0) / HOSTS.length)}</td>
              <td class="num mono">${fmtIdr(HOSTS.reduce((a, h) => a + h.gpm, 0) / HOSTS.length)}</td>
              <td class="num mono">1m 37d</td>
              <td class="num mono">${fmtNum(HOSTS.reduce((a, h) => a + h.orders, 0))}</td>
              <td class="num mono">3,8%</td>
              <td>${badge('Top: Nadya', 'ok')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#be185d')}
            <span>Kurva Retensi Penonton (0–180 Detik)</span>
          </div>
          <span class="e-panel-sub">Hook 15 detik pertama</span>
        </div>
        <div class="e-panel-body" style="padding:6px 10px;">
          ${retentionSvg}
        </div>
      </div>

      <div class="e-panel" style="flex:0 0 186px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('checkCircle', 13, '#047857')}
            <span>Diagnosis Skrip &amp; Pelatihan Host Otomatis</span>
          </div>
          ${badge('HST-02: 96/100', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
          <div class="kl-kv"><span class="kl-kv-k">Frekuensi CTA Keranjang Kuning (Nadya)</span><span class="kl-kv-v mono" style="color:#047857;">Setiap 42 detik (Ideal)</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Respon Komentar Size/Bahan &lt; 10 dtk</span><span class="kl-kv-v mono">92,4% terjawab</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Drop-off Terbesar HST-10 (Melisa)</span><span class="kl-kv-v mono" style="color:#be123c;">Detik 15–30 (-42% penonton)</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Rekomendasi Rotasi Shift 21:00–24:00</span><span class="kl-kv-v">Pasangkan Sinta + Raka (Studio 2)</span></div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p5',
    crumbGroup: 'Manajemen Talenta & Shift',
    pageTitle: 'Jadwal Maraton Shift 12 Jam, Peringkat GPM & Retensi Penonton',
    rightActions: `
      <span class="e-btn">${ic('clock', 11)} Atur Rotasi 21:00</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#fff')} Ekspor Rapor Host</span>
    `,
    contentHtml: `<div class="e-panel" style="flex:0 0 258px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('clock', 13, '#be185d')}
            <span>Pita Jadwal Shift Maraton 12 Jam (4 Studio Paralel · 09:00–21:00 WIB)</span>
          </div>
          <div style="display:flex;gap:5px;">
            ${badge('4 Studio On-Air', 'accent')}
            ${badge('Handover 18 menit lagi', 'warn')}
          </div>
        </div>
        <div class="e-panel-body-flush">${ganttHtml}</div>
      </div>
      ${bottomGrid}`,
  });
}

// ============================================================================
// PAGE 6: REKAP BONUS SHIFT, KOMISI AFFILIATE & CORETAX XML / BI-FAST
// ============================================================================
function renderPage6() {
  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>GMV Bruto Sesi</span>${badge('VERIFIED', 'ok')}</div>
      <div class="kl-kpi-val">${fmtIdr(TOTAL_GMV)}</div>
      <div class="kl-kpi-foot"><span>Studio 2 Payday</span><span class="mono">312 order</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Basis GMV Net Lunas</span>${badge('-6,4% COD', 'warn')}</div>
      <div class="kl-kpi-val">${fmtIdr(NET_GMV)}</div>
      <div class="kl-kpi-foot"><span>Pasca cadangan batal</span><span class="mono">93,6% net</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Pool Bonus Shift Kru</span>${badge('4 KRU', 'accent')}</div>
      <div class="kl-kpi-val">${fmtIdr(HOST_BONUS_IDR)}</div>
      <div class="kl-kpi-foot"><span>Nadya Rp 1,85 jt</span><span class="mono">4,45% GMV</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Pool Komisi Affiliate</span>${badge('8 KREATOR', 'info')}</div>
      <div class="kl-kpi-val">${fmtIdr(AFFILIATE_IDR)}</div>
      <div class="kl-kpi-foot"><span>Tier 5,0%–7,0%</span><span class="mono">5,62% GMV</span></div>
    </div>
    <div class="kl-kpi">
      <div class="kl-kpi-top"><span>Potongan PPh 21 / 23</span>${badge('PMK 168', 'neutral')}</div>
      <div class="kl-kpi-val">${fmtIdr(TOTAL_PAYOUT_PPH)}</div>
      <div class="kl-kpi-foot"><span>e-Bupot CoreTax XML</span><span class="mono">12 bukti ptg</span></div>
    </div>
    <div class="kl-kpi" style="background:#f5fbf8;border-color:#a7f3d0;">
      <div class="kl-kpi-top"><span style="color:#065f46;">Netto Cair BI-FAST</span>${badge('SIAP BATCH', 'ok')}</div>
      <div class="kl-kpi-val" style="color:#047857;">${fmtIdr(TOTAL_PAYOUT_NETTO)}</div>
      <div class="kl-kpi-foot"><span>Biaya BI-FAST Rp 2.500/tx</span><span class="mono">12 rekening</span></div>
    </div>
  </section>`;

  const payRows = PAYOUTS.map(
    (p, idx) => `<tr class="${idx === 0 ? 'is-selected' : p.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-size:9.6px;color:#831843;font-weight:700;">S-${String(idx + 1).padStart(2, '0')}</td>
      <td style="font-weight:600;">${esc(p.name)}</td>
      <td style="font-size:9.8px;color:#524656;">${esc(p.role)}</td>
      <td class="num mono">${fmtIdr(p.basisGmv)}</td>
      <td class="mono" style="font-size:9.6px;">${esc(p.rate)}</td>
      <td class="num mono">${fmtIdr(p.bruto)}</td>
      <td class="num mono" style="color:#b45309;">${fmtIdr(p.pph)}</td>
      <td class="num mono" style="font-weight:700;color:#047857;">${fmtIdr(p.netto)}</td>
      <td style="font-size:9.6px;color:#524656;">${esc(p.bank.replace(' BI-FAST', ''))}</td>
      <td>${badge(p.status === 'Verifikasi NPWP' ? 'Cek NPWP' : p.status === 'Tahan COD 7h' ? 'Hold COD' : p.status, p.tone)}</td>
    </tr>`
  ).join('');

  const pph21Total = PAYOUTS.filter((p) => p.taxType.startsWith('PPh 21')).reduce((a, p) => a + p.pph, 0);
  const pph23Total = PAYOUTS.filter((p) => p.taxType.startsWith('PPh 23')).reduce((a, p) => a + p.pph, 0);
  const journalRows = [
    { acc: '5210-01', name: 'Beban Bonus Shift Host & Kru Live', dr: HOST_BONUS_IDR, cr: 0 },
    { acc: '5210-02', name: 'Beban Komisi Affiliate & MCN Kreator', dr: AFFILIATE_IDR, cr: 0 },
    { acc: '2140-21', name: 'Utang Pajak PPh Pasal 21 (TER & OP)', dr: 0, cr: pph21Total },
    { acc: '2140-23', name: 'Utang Pajak PPh Pasal 23 (Badan 2%)', dr: 0, cr: pph23Total },
    { acc: '1110-04', name: 'Kas Bank Escrow BI-FAST (Pencairan)', dr: 0, cr: TOTAL_PAYOUT_NETTO },
  ];
  const jDr = journalRows.reduce((a, r) => a + r.dr, 0);
  const jCr = journalRows.reduce((a, r) => a + r.cr, 0);
  if (jDr !== jCr || jDr !== TOTAL_PAYOUT_BRUTO) {
    throw new Error(`PSAK journal imbalance: Dr=${jDr} Cr=${jCr} vs ${TOTAL_PAYOUT_BRUTO}`);
  }

  const coretaxXml = `<span class="sql-cm">&lt;!-- DJP CoreTax XML v2.0 — e-Bupot PPh 21/23 Batch STD2-PAYDAY-2611 --&gt;</span>
&lt;<span class="sql-kw">CoreTaxEbupotBatch</span> <span class="sql-fn">npwpPemotong</span>=<span class="sql-str">"01.842.910.4-012.000"</span> <span class="sql-fn">masaPajak</span>=<span class="sql-str">"11-2026"</span>&gt;
  &lt;<span class="sql-kw">Header</span>&gt;
    &lt;Entity&gt;PT Nusantara Moda Digital (MCN)&lt;/Entity&gt;
    &lt;SessionRef&gt;STD2-PAYDAY-2611&lt;/SessionRef&gt;
    &lt;JumlahBuktiPotong&gt;<span class="sql-num">${PAYOUTS.length}</span>&lt;/JumlahBuktiPotong&gt;
    &lt;TotalBrutoIDR&gt;<span class="sql-num">${TOTAL_PAYOUT_BRUTO}</span>&lt;/TotalBrutoIDR&gt;
    &lt;TotalPPhDipungutIDR&gt;<span class="sql-num">${TOTAL_PAYOUT_PPH}</span>&lt;/TotalPPhDipungutIDR&gt;
    &lt;TotalNettoBIFAST&gt;<span class="sql-num">${TOTAL_PAYOUT_NETTO}</span>&lt;/TotalNettoBIFAST&gt;
  &lt;/<span class="sql-kw">Header</span>&gt;
  &lt;<span class="sql-kw">BuktiPotong</span> <span class="sql-fn">kodeObjek</span>=<span class="sql-str">"21-100-01"</span> <span class="sql-fn">id</span>=<span class="sql-str">"STL-2611-01"</span>&gt;
    &lt;Nama&gt;Nadya Larasati&lt;/Nama&gt; &lt;Bruto&gt;<span class="sql-num">1850000</span>&lt;/Bruto&gt; &lt;PPh&gt;<span class="sql-num">92500</span>&lt;/PPh&gt;
  &lt;/<span class="sql-kw">BuktiPotong</span>&gt;
  &lt;<span class="sql-kw">BuktiPotong</span> <span class="sql-fn">kodeObjek</span>=<span class="sql-str">"24-104-02"</span> <span class="sql-fn">id</span>=<span class="sql-str">"STL-2611-05"</span>&gt;
    &lt;Nama&gt;CV Kreasi (@hijabdaily.id)&lt;/Nama&gt; &lt;Bruto&gt;<span class="sql-num">994000</span>&lt;/Bruto&gt; &lt;PPh&gt;<span class="sql-num">19880</span>&lt;/PPh&gt;
  &lt;/<span class="sql-kw">BuktiPotong</span>&gt;
  &lt;<span class="sql-kw">BuktiPotong</span> <span class="sql-fn">kodeObjek</span>=<span class="sql-str">"21-100-07"</span> <span class="sql-fn">id</span>=<span class="sql-str">"STL-2611-06"</span>&gt;
    &lt;Nama&gt;@gamisreview.jkt&lt;/Nama&gt; &lt;Bruto&gt;<span class="sql-num">705250</span>&lt;/Bruto&gt; &lt;PPh&gt;<span class="sql-num">17631</span>&lt;/PPh&gt;
  &lt;/<span class="sql-kw">BuktiPotong</span>&gt;
  &lt;<span class="sql-kw">Integrity</span> <span class="sql-fn">alg</span>=<span class="sql-str">"SHA-256"</span>&gt;7f9c4b2e88a014d9..d108a94c&lt;/<span class="sql-kw">Integrity</span>&gt;
&lt;/<span class="sql-kw">CoreTaxEbupotBatch</span>&gt;`;

  const mainSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.76fr 1fr;gap:8px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('fileText', 13, '#be185d')}
          <span>Rekap Pencairan Bonus Shift Host &amp; Komisi Affiliate Selesai Siaran</span>
        </div>
        <span class="e-panel-sub">12 Penerima · Terverifikasi Otomatis dari Gold Mart ClickHouse</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table kl-dense">
          <colgroup>
            <col style="width:5.5%;" />
            <col style="width:16.5%;" />
            <col style="width:11%;" />
            <col style="width:12%;" />
            <col style="width:8.5%;" />
            <col style="width:11%;" />
            <col style="width:9.5%;" />
            <col style="width:11%;" />
            <col style="width:6.5%;" />
            <col style="width:8.5%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Seq</th>
              <th>Penerima / Akun</th>
              <th>Peran</th>
              <th class="num">Basis GMV</th>
              <th>Skema</th>
              <th class="num">Bruto</th>
              <th class="num">PPh</th>
              <th class="num">Netto Cair</th>
              <th>Bank</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${payRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="5">TOTAL PENYELESAIAN STUDIO 2 (12 PENERIMA · BI-FAST)</td>
              <td class="num mono">${fmtIdr(TOTAL_PAYOUT_BRUTO)}</td>
              <td class="num mono">${fmtIdr(TOTAL_PAYOUT_PPH)}</td>
              <td class="num mono" style="color:#047857;">${fmtIdr(TOTAL_PAYOUT_NETTO)}</td>
              <td class="mono">12 tx</td>
              <td>${badge('Valid', 'ok')}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:auto;padding:9px 10px;background:#faf8fb;border-top:1px solid #e5dee8;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:7px 9px;">
            <div style="font-size:9.3px;color:#695c6c;font-weight:600;">Rekening Escrow BI-FAST (BCA Corporate)</div>
            <div class="mono" style="font-size:12.5px;font-weight:700;color:#18131a;margin-top:2px;">Rp 148.420.000</div>
            <div style="font-size:9.2px;color:#047857;margin-top:2px;">Cukup untuk 23x batch · Biaya BI-FAST Rp 30.000</div>
          </div>
          <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:7px 9px;">
            <div style="font-size:9.3px;color:#695c6c;font-weight:600;">Rincian Pemotongan Pajak (CoreTax DJP)</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#b45309;margin-top:2px;">PPh 21: ${fmtIdr(pph21Total)} · PPh 23: ${fmtIdr(pph23Total)}</div>
            <div style="font-size:9.2px;color:#524656;margin-top:2px;">11 NPWP tervalidasi DJP · 1 antre (@ootdmuslimah.sby)</div>
          </div>
          <div style="background:#ffffff;border:1px solid #e5dee8;border-radius:3px;padding:7px 9px;">
            <div style="font-size:9.3px;color:#695c6c;font-weight:600;">Kebijakan Tahan COD (Clawback Guard)</div>
            <div class="mono" style="font-size:12.5px;font-weight:700;color:#0369a1;margin-top:2px;">1 Kreator (Rp 169.184)</div>
            <div style="font-size:9.2px;color:#524656;margin-top:2px;">Auto-release H+7 saat status resi COD = Diterima</div>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
      <div class="e-panel" style="flex:0 0 248px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('layers', 13, '#be185d')}
            <span>Jurnal Akuntansi PSAK Otomatis (Double-Entry)</span>
          </div>
          ${badge('DR = CR BALANCED', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table kl-dense">
            <colgroup>
              <col style="width:16%;" />
              <col style="width:44%;" />
              <col style="width:20%;" />
              <col style="width:20%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Akun COA</th>
                <th>Nama Akun PSAK</th>
                <th class="num">Debit (Rp)</th>
                <th class="num">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${journalRows
                .map(
                  (j) => `<tr>
                  <td class="mono" style="font-weight:700;color:#831843;">${j.acc}</td>
                  <td>${esc(j.name)}</td>
                  <td class="num mono">${j.dr ? fmtIdr(j.dr) : '—'}</td>
                  <td class="num mono">${j.cr ? fmtIdr(j.cr) : '—'}</td>
                </tr>`
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL JURNAL (ZERO DRIFT)</td>
                <td class="num mono">${fmtIdr(jDr)}</td>
                <td class="num mono">${fmtIdr(jCr)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('code', 13, '#be185d')}
            <span>Payload DJP CoreTax XML (e-Bupot 21/23)</span>
          </div>
          ${badge('XSD VALID', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:8px;display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          <div class="kl-sql" style="flex:1;font-size:9.8px;line-height:1.42;">${coretaxXml}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <span class="e-btn" style="justify-content:center;">${ic('download', 11)} Unduh CoreTax XML</span>
            <span class="e-btn e-btn-primary" style="justify-content:center;">${ic('check', 11, '#fff')} Kirim Batch BI-FAST</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p6',
    crumbGroup: 'Keuangan, Pajak & Settlement',
    pageTitle: 'Rekap Bonus Shift, Komisi Affiliate & Penyelesaian CoreTax XML / BI-FAST',
    rightActions: `
      <span class="e-btn">${ic('download', 11)} CSV Rekonsiliasi</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 11, '#fff')} Setujui Pencairan BI-FAST</span>
    `,
    contentHtml: `${kpiHtml}${mainSplit}`,
  });
}

// ============================================================================
// PAGE 7: PERSETUJUAN DoA (MAKER-CHECKER-APPROVER), UU PDP & AUDIT WORM SHA-256
// ============================================================================
function renderPage7() {
  const doaQueue = [
    { id: 'DOA-8841', req: 'Pencairan Batch Bonus & Affiliate Studio-2', val: 'Rp 6.465.472', maker: 'R. Kusuma (Produser)', checker: 'A. Wibowo (Finance)', sla: '12 mnt', step: 'Tunggu Approver', tone: 'warn' },
    { id: 'DOA-8842', req: 'Realokasi Anggaran GMV Max AD-03 -> AD-01', val: 'Rp 2.400.000', maker: 'B. Haryanto (Perf Ads)', checker: 'R. Kusuma (Produser)', sla: '4 mnt', step: 'Tunggu Checker', tone: 'accent' },
    { id: 'DOA-8843', req: 'Flash Discount Tambahan 38% SKU ET-14', val: 'Margin 18,2%', maker: 'M. Sari (Merch)', checker: 'R. Kusuma (Produser)', sla: '25 mnt', step: 'Ditolak (<20%)', tone: 'bad' },
    { id: 'DOA-8844', req: 'Transfer Buffer Stok ET-01 (L: 18 pcs) WH-BDG', val: '18 unit', maker: 'R. Kusuma (Produser)', checker: 'H. Putra (WMS Lead)', sla: 'Selesai', step: 'Disetujui', tone: 'ok' },
    { id: 'DOA-8845', req: 'Aktifkan Filter Verifikasi WA COD (Sumut/Sulsel)', val: '2 Provinsi', maker: 'Risk Engine v3', checker: 'T. Wijaya (Risk Ops)', sla: '8 mnt', step: 'Tunggu Approver', tone: 'warn' },
    { id: 'DOA-8846', req: 'Tambah Pagu Harian TikTok GMV Max Studio-1', val: 'Rp 10.000.000', maker: 'B. Haryanto (Perf Ads)', checker: 'D. Santoso (VP Ops)', sla: 'Selesai', step: 'Disetujui', tone: 'ok' },
    { id: 'DOA-8847', req: 'Ekspor XML e-Bupot CoreTax Masa Nov-2026', val: '12 bukti ptg', maker: 'A. Wibowo (Finance)', checker: 'L. Hartono (Tax Mgr)', sla: 'Selesai', step: 'Disetujui', tone: 'ok' },
  ];

  const complianceMatrix = [
    { reg: 'UU PDP PP 33/2026', scope: 'Masking Nomor HP & Alamat Pembeli di ClickHouse', control: 'SHA-256 + Rotating Salt di Silver Layer', cov: '100%', status: 'Patuh', tone: 'ok' },
    { reg: 'Permendag 31/2023', scope: 'Kewajiban Keterbukaan Harga, Stok & Izin PPMSE', control: 'Sinkronisasi Stok WMS Real-Time + Log Harga', cov: '100%', status: 'Patuh', tone: 'ok' },
    { reg: 'PMK 168/2023 & CoreTax', scope: 'Pemotongan PPh 21 TER Host & PPh 23 Affiliate', control: 'Generator e-Bupot XML Otomatis + Validasi NPWP', cov: '91,7%', status: '1 NPWP Cek', tone: 'warn' },
    { reg: 'ISO 27001 / RBAC Studio', scope: 'Pemisahan Hak Produser vs Finance vs Data Eng', control: 'OIDC SSO + MFA + DoA Maker-Checker-Approver', cov: '100%', status: 'Patuh', tone: 'ok' },
  ];

  const wormLogs = [
    { seq: '#49108', ts: '20:42:16.412', actor: 'R. Kusuma (Produser)', role: 'LIVE_PRODUCER', action: 'SEND_TELEPROMPTER_CUE', target: 'STD2 / ET-01 -> ET-04', prev: 'a84f..19c2', hash: 'e31b94f0..77d4a1', status: 'TERVERIFIKASI' },
    { seq: '#49107', ts: '20:41:55.108', actor: 'AdGuard-Engine (Sys)', role: 'SYSTEM_POLICY', action: 'FLAG_LOW_ROAS_ALERT', target: 'AD-03 (ROAS 2,1x · CPA 34rb)', prev: '71c0..5be8', hash: 'a84f22d1..19c28b', status: 'TERVERIFIKASI' },
    { seq: '#49106', ts: '20:39:42.890', actor: 'A. Wibowo (Finance)', role: 'FINANCE_CHECKER', action: 'CHECK_PAYOUT_BATCH', target: 'STD2-PAYDAY-2611 (Rp 6,46 jt)', prev: '94de..41f0', hash: '71c08a33..5be801', status: 'TERVERIFIKASI' },
    { seq: '#49105', ts: '20:35:19.044', actor: 'R. Kusuma (Produser)', role: 'LIVE_PRODUCER', action: 'REQUEST_WMS_BUFFER', target: 'WH-BDG -> WH-JKT (ET-01 L:18)', prev: '20ab..9c31', hash: '94de5c12..41f0aa', status: 'TERVERIFIKASI' },
    { seq: '#49104', ts: '20:28:04.772', actor: 'D. Santoso (VP Ops)', role: 'DOA_APPROVER', action: 'REJECT_EXCESS_DISCOUNT', target: 'DOA-8843 (ET-14 Disc 38%)', prev: 'f512..60e4', hash: '20ab71e9..9c312d', status: 'TERVERIFIKASI' },
    { seq: '#49103', ts: '20:15:00.019', actor: 'dbt-Runner (CI/CD)', role: 'DATA_CONTRACT', action: 'ASSERT_42_DBT_TESTS', target: 'gold.mart_gmv_attribution_host', prev: '4c88..01a7', hash: 'f51290b4..60e411', status: 'TERVERIFIKASI' },
    { seq: '#49102', ts: '20:00:02.311', actor: 'R. Kusuma (Produser)', role: 'LIVE_PRODUCER', action: 'TRIGGER_FLASH_SLOT', target: 'ET-01 Gamis Linen (20:00 WIB)', prev: 'b291..88d3', hash: '4c881a02..01a77e', status: 'TERVERIFIKASI' },
    { seq: '#49101', ts: '19:45:11.655', actor: 'PII-Vault-Masker', role: 'UUPDP_GUARD', action: 'ROTATE_SALT_HASH_KEY', target: 'silver.stg_live_orders_dedup', prev: '0d64..32f9', hash: 'b2914e77..88d3c0', status: 'TERVERIFIKASI' },
    { seq: '#49100', ts: '19:32:48.204', actor: 'B. Haryanto (Perf Ads)', role: 'ADS_OPERATOR', action: 'CAP_BID_CAMPAIGN', target: 'AD-06 Lookalike (CPA <= 26rb)', prev: '6e19..a401', hash: '0d6491cc..32f9b2', status: 'TERVERIFIKASI' },
    { seq: '#49099', ts: '19:05:14.918', actor: 'AdGuard-Engine (Sys)', role: 'SYSTEM_POLICY', action: 'SCALE_GMV_MAX_BUDGET', target: 'AD-01 Gamis Hero (+Rp 500rb)', prev: 'c37a..55e0', hash: '6e190b4f..a4019d', status: 'TERVERIFIKASI' },
    { seq: '#49098', ts: '18:01:03.502', actor: 'Nadya Larasati (Host)', role: 'STUDIO_HOST', action: 'SHIFT_CHECKIN_BIOMETRIC', target: 'Studio 2 · Shift 18:00–21:00', prev: '1f8b..77c2', hash: 'c37a8e10..55e044', status: 'TERVERIFIKASI' },
    { seq: '#49097', ts: '17:58:22.119', actor: 'L. Hartono (Tax Mgr)', role: 'TAX_APPROVER', action: 'SIGN_CORETAX_XML_KEY', target: 'DJP Cert #01842-2026 (Valid)', prev: '89d2..0e15', hash: '1f8b33a9..77c208', status: 'TERVERIFIKASI' },
  ];

  const topGrid = `<div style="flex:0 0 385px;display:grid;grid-template-columns:1.34fr 1fr;gap:8px;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('users', 13, '#be185d')}
          <span>Antrean Persetujuan Berjenjang DoA (Maker · Checker · Approver)</span>
        </div>
        <div style="display:flex;gap:5px;">
          ${badge('3 Menunggu', 'warn')}
          ${badge('SLA <= 15 mnt', 'info')}
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table kl-dense">
          <colgroup>
            <col style="width:9.5%;" />
            <col style="width:27%;" />
            <col style="width:12%;" />
            <col style="width:14.5%;" />
            <col style="width:14.5%;" />
            <col style="width:7%;" />
            <col style="width:15.5%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Tiket</th>
              <th>Permintaan Aksi Operasional</th>
              <th class="num">Nilai / Dampak</th>
              <th>Maker</th>
              <th>Checker / Approver</th>
              <th class="num">SLA</th>
              <th>Tahap DoA</th>
            </tr>
          </thead>
          <tbody>
            ${doaQueue
              .map(
                (d, i) => `<tr class="${i === 0 ? 'is-selected' : d.tone === 'bad' ? 'is-bad' : ''}">
                <td class="mono" style="font-weight:700;color:#831843;">${d.id}</td>
                <td style="font-weight:600;">${esc(d.req)}</td>
                <td class="num mono" style="font-weight:700;">${esc(d.val)}</td>
                <td style="font-size:9.8px;">${esc(d.maker)}</td>
                <td style="font-size:9.8px;">${esc(d.checker)}</td>
                <td class="num mono">${esc(d.sla)}</td>
                <td>${badge(d.step, d.tone)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top:auto;padding:8px 10px;background:#faf8fb;border-top:1px solid #e5dee8;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:10px;color:#4b3f4e;">
            <strong>Matriks Ambang DoA Aktif:</strong> Iklan &gt; Rp 5 jt (VP Ops) · Diskon &gt; 35% (Wajib Margin &gt;= 20%) · Payout &gt; Rp 5 jt (Finance + VP Ops)
          </div>
          <div style="display:flex;gap:5px;">
            <span class="e-btn e-btn-danger" style="height:22px;">Tolak</span>
            <span class="e-btn e-btn-primary" style="height:22px;">Setujui DOA-8841</span>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('shield', 13, '#be185d')}
          <span>Kepatuhan Regulasi Indonesia &amp; Kontrol RBAC</span>
        </div>
        ${badge('UU PDP PP 33/2026', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${complianceMatrix
            .map(
              (c) => `<div style="border:1px solid #e4dce8;border-radius:3px;padding:6px 8px;background:#fcfafd;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                <span style="font-weight:700;font-size:10.6px;color:#18131a;">${esc(c.reg)}</span>
                <div style="display:flex;align-items:center;gap:5px;">
                  <span class="mono" style="font-size:9.8px;font-weight:700;">${c.cov}</span>
                  ${badge(c.status, c.tone)}
                </div>
              </div>
              <div style="font-size:9.8px;color:#4b3f4e;">${esc(c.scope)}</div>
              <div class="mono" style="font-size:9.2px;color:#695c6c;margin-top:2px;">Kontrol: ${esc(c.control)}</div>
            </div>`
            )
            .join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;border-top:1px solid #ece6ef;padding-top:6px;">
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#695c6c;">Peran RBAC Aktif</div>
            <div class="mono" style="font-weight:700;font-size:11px;">6 Peran · 28 User</div>
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#695c6c;">Sesi MFA Wajib</div>
            <div class="mono" style="font-weight:700;font-size:11px;color:#047857;">100% Enforced</div>
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9px;color:#695c6c;">Retensi WORM</div>
            <div class="mono" style="font-weight:700;font-size:11px;">7 Tahun (ObjectLock)</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  const wormPanel = `<div class="e-panel" style="flex:1;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${ic('lock', 13, '#be185d')}
        <span>Log Audit Imutabel WORM SHA-256 (Rantai Hash Kriptografis)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">Verifikasi Rantai #49000..#49108: UTUH (0 Modifikasi)</span>
        ${badge('WORM LOCKED', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table kl-dense">
        <colgroup>
          <col style="width:6.5%;" />
          <col style="width:10.5%;" />
          <col style="width:14%;" />
          <col style="width:11.5%;" />
          <col style="width:16.5%;" />
          <col style="width:18%;" />
          <col style="width:7.5%;" />
          <col style="width:9%;" />
          <col style="width:6.5%;" />
        </colgroup>
        <thead>
          <tr>
            <th>Seq</th>
            <th>Timestamp WIB</th>
            <th>Aktor</th>
            <th>Peran RBAC</th>
            <th>Aksi Tercatat</th>
            <th>Objek Target</th>
            <th>Prev Hash</th>
            <th>Curr SHA-256</th>
            <th>Integritas</th>
          </tr>
        </thead>
        <tbody>
          ${wormLogs
            .map(
              (l) => `<tr>
              <td class="mono" style="font-weight:700;color:#831843;">${l.seq}</td>
              <td class="mono" style="font-size:9.8px;">${l.ts}</td>
              <td style="font-weight:600;">${esc(l.actor)}</td>
              <td class="mono" style="font-size:9.4px;color:#524656;">${esc(l.role)}</td>
              <td class="mono" style="font-size:9.6px;font-weight:700;">${esc(l.action)}</td>
              <td>${esc(l.target)}</td>
              <td class="mono" style="font-size:9.4px;color:#695c6c;">${l.prev}</td>
              <td class="mono" style="font-size:9.4px;color:#047857;font-weight:600;">${l.hash}</td>
              <td>${badge('VALID', 'ok')}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p7',
    crumbGroup: 'Tata Kelola, DoA & Kepatuhan',
    pageTitle: 'Alur Persetujuan DoA, Kepatuhan UU PDP PP 33/2026 & Audit WORM SHA-256',
    rightActions: `
      <span class="e-btn">${ic('key', 11)} Verifikasi Rantai SHA-256</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#fff')} Paket Bukti Audit</span>
    `,
    contentHtml: `${topGrid}${wormPanel}`,
  });
}

// ============================================================================
// PAGE 8: TELEPROMPTER HOST STUDIO, PENDAMPING MOBILE & TELEMETRI API/SIGNALR
// ============================================================================
function renderPage8() {
  const waterfallSvg = svgSpanWaterfall({
    width: 440,
    totalMs: 120,
    spans: [
      { label: 'TikTok Webhook Ingest', start: 0, dur: 14, color: '#0369a1' },
      { label: 'HMAC-SHA256 Verify', start: 14, dur: 4, color: '#047857' },
      { label: 'ClickHouse Insert', start: 18, dur: 22, color: '#be185d' },
      { label: 'Attribution Rollup', start: 40, dur: 28, color: '#9d174d' },
      { label: 'Alert Guardrail Eval', start: 68, dur: 11, color: '#b45309' },
      { label: '.NET 9 SignalR Push', start: 79, dur: 14, color: '#047857' },
      { label: 'Host Screen Render', start: 93, dur: 9, color: '#475569' },
    ],
  });

  const connectors = [
    { name: 'TikTok Shop Live Partner API v2', proto: 'REST + Webhook', lat: '142 ms', quota: 62, status: 'Sehat', tone: 'ok' },
    { name: 'Shopee Open Platform Live v2', proto: 'REST + Push', lat: '188 ms', quota: 48, status: 'Sehat', tone: 'ok' },
    { name: 'TikTok GMV Max Ad Engine API', proto: 'Poll 60s + Bid', lat: '214 ms', quota: 78, status: 'Rate 78%', tone: 'warn' },
    { name: '.NET 9 SignalR Redis Backplane', proto: 'WebSocket WSS', lat: '18 ms', quota: 34, status: 'Low-Latency', tone: 'ok' },
    { name: 'ClickHouse Cluster ID-JKT-01/02', proto: 'Native TCP 9000', lat: '62 ms', quota: 41, status: 'Replicated', tone: 'ok' },
  ];

  const html = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 0.78fr 1.04fr;gap:10px;">
    <!-- Column 1: High-Contrast Studio Teleprompter Monitor (16:9 Live Display) -->
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
      <div class="e-panel" style="flex:1;background:#140e12;border-color:#3a2733;color:#faf5f8;">
        <div class="e-panel-head" style="background:#1f141b;border-bottom-color:#3a2733;">
          <div class="e-panel-title" style="color:#faf5f8;">
            <span class="dot dot-bad"></span>
            <span>PRATINJAU LAYAR TELEPROMPTER HOST — STUDIO 2 (65" 4K)</span>
          </div>
          <span class="mono" style="font-size:10px;color:#fda4af;font-weight:700;">TALLY: ON AIR · 03:42:18</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:10px;padding:14px;">
          <!-- Giant Tally & Ticker Row -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            <div style="background:#241620;border:1px solid #492b3f;border-radius:4px;padding:10px 12px;">
              <div style="font-size:10px;color:#d6b8c9;font-weight:600;">GMV SESI NADYA</div>
              <div class="mono" style="font-size:24px;font-weight:800;color:#ffffff;margin-top:2px;">Rp 64,2 jt</div>
              <div style="font-size:10px;color:#6ee7b7;margin-top:2px;">Rp 21,4 jt/jam · Bonus +3%</div>
            </div>
            <div style="background:#241620;border:1px solid #492b3f;border-radius:4px;padding:10px 12px;">
              <div style="font-size:10px;color:#d6b8c9;font-weight:600;">PENONTON AKTIF</div>
              <div class="mono" style="font-size:24px;font-weight:800;color:#38bdf8;margin-top:2px;">4.280</div>
              <div style="font-size:10px;color:#d6b8c9;margin-top:2px;">Rata tonton 2m 14d</div>
            </div>
            <div style="background:#3b0a1f;border:1px solid #be185d;border-radius:4px;padding:10px 12px;">
              <div style="font-size:10px;color:#fbcfe8;font-weight:600;">HITUNG MUNDUR FLASH</div>
              <div class="mono" style="font-size:24px;font-weight:800;color:#fda4af;margin-top:2px;">04:18</div>
              <div style="font-size:10px;color:#fbcfe8;margin-top:2px;">Slot Pin Berikut: ET-04</div>
            </div>
          </div>

          <!-- Primary Teleprompter Cue Box (High-Readability) -->
          <div style="background:#2d0a1a;border:2px solid #f43f5e;border-radius:4px;padding:16px 18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span class="mono" style="font-size:11px;font-weight:800;color:#fda4af;letter-spacing:0.04em;">INSTRUKSI PRODUSER (TERKIRIM 20:42:16 WIB)</span>
              <span class="mono" style="font-size:10px;background:#be123c;color:#fff;padding:2px 7px;border-radius:2px;font-weight:700;">SEGERA BACA</span>
            </div>
            <div style="font-size:22px;font-weight:800;line-height:1.32;color:#ffffff;">
              "Ukuran L Etalase #1 tinggal 6 pcs! Arahkan checkout ke bundle Etalase #4 — Hijab Voal Laser Cut 3s sekarang."
            </div>
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid #6b1d3a;font-size:12px;color:#fbcfe8;">
              Poin Kunci Skrip: Sebutkan <strong>gratis ongkir payday</strong> + <strong>bundle 3 pcs Rp 95.500 (hemat Rp 24 rb)</strong> · Hindari promo COD luar Jawa.
            </div>
          </div>

          <!-- Giant Stock Run Matrix for Host Glance -->
          <div>
            <div style="font-size:10.5px;font-weight:700;color:#d6b8c9;margin-bottom:6px;">STOK ETALASE #1 — GAMIS LINEN SAGE (REAL-TIME WMS)</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
              <div style="background:#1c2a24;border:1px solid #047857;border-radius:4px;padding:10px;text-align:center;">
                <div style="font-size:11px;color:#a7f3d0;font-weight:700;">SIZE S</div>
                <div class="mono" style="font-size:24px;font-weight:800;color:#ffffff;">28</div>
                <div style="font-size:9.5px;color:#6ee7b7;">AMAN</div>
              </div>
              <div style="background:#1c2a24;border:1px solid #047857;border-radius:4px;padding:10px;text-align:center;">
                <div style="font-size:11px;color:#a7f3d0;font-weight:700;">SIZE M</div>
                <div class="mono" style="font-size:24px;font-weight:800;color:#ffffff;">19</div>
                <div style="font-size:9.5px;color:#6ee7b7;">AMAN</div>
              </div>
              <div style="background:#4c0519;border:2px solid #fb7185;border-radius:4px;padding:10px;text-align:center;">
                <div style="font-size:11px;color:#fecdd3;font-weight:700;">SIZE L</div>
                <div class="mono" style="font-size:24px;font-weight:800;color:#fda4af;">6</div>
                <div style="font-size:9.5px;color:#fecdd3;font-weight:700;">HAMPIR HABIS</div>
              </div>
              <div style="background:#33240d;border:1px solid #d97706;border-radius:4px;padding:10px;text-align:center;">
                <div style="font-size:11px;color:#fde68a;font-weight:700;">SIZE XL</div>
                <div class="mono" style="font-size:24px;font-weight:800;color:#ffffff;">14</div>
                <div style="font-size:9.5px;color:#fcd34d;">TIPIS</div>
              </div>
            </div>
          </div>

          <!-- Next Queue Strip -->
          <div style="background:#21161e;border:1px solid #3a2733;border-radius:4px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:9.8px;color:#c2aeb9;">ETALASE BERIKUTNYA (SIAP ANGKAT SAMPLE)</div>
              <div style="font-size:13.5px;font-weight:700;color:#ffffff;margin-top:2px;">ET-04 · Hijab Voal Laser Cut 3s (Stok 412 · CVR 5,4%)</div>
            </div>
            <span class="mono" style="font-size:11px;background:#047857;color:#fff;padding:4px 9px;border-radius:3px;font-weight:700;">SAMPLE DI MEJA KANAN</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:0 0 112px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#be185d')}<span>Kontrol Cepat Teleprompter &amp; Audio Cue</span></div>
          <span class="e-panel-sub">Koneksi HDMI + WSS Dual-Redundant</span>
        </div>
        <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:center;">
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.2px;color:#695c6c;">Ukuran Font Layar</div>
            <div class="mono" style="font-weight:700;font-size:12px;">44 pt · Kontras</div>
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.2px;color:#695c6c;">Latensi Dorong Cue</div>
            <div class="mono" style="font-weight:700;font-size:12px;color:#047857;">14 ms (LAN Studio)</div>
          </div>
          <div style="background:#faf8fb;border:1px solid #e5dee8;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.2px;color:#695c6c;">Konfirmasi Host</div>
            <div class="mono" style="font-weight:700;font-size:12px;">Pedal Kaki ACK</div>
          </div>
          <span class="e-btn e-btn-primary" style="height:34px;justify-content:center;">${ic('zap', 12, '#fff')} Dorong Cue Baru</span>
        </div>
      </div>
    </div>

    <!-- Column 2: Realistic Mobile Companion App Frame (Floor Producer / Gudang Studio) -->
    <div class="e-panel" style="background:#ede8ef;border-color:#d4c9d8;padding:12px;display:flex;align-items:center;justify-content:center;">
      <div style="width:100%;height:100%;background:#ffffff;border:5px solid #1b1016;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;">
        <!-- Phone Status Bar -->
        <div style="height:26px;background:#1b1016;color:#faf5f8;padding:0 12px;display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:9.5px;flex-shrink:0;">
          <span>20:42 WIB</span>
          <span style="font-weight:700;color:#f472b6;">KatalogLive Mobile</span>
          <span>5G · 92%</span>
        </div>
        <!-- App Header -->
        <div style="padding:10px 12px;border-bottom:1px solid #ece6ef;background:#fdf2f8;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;font-size:12px;color:#831843;">Studio 2 · Floor Companion</span>
            ${badge('LIVE', 'bad')}
          </div>
          <div style="font-size:9.8px;color:#695c6c;margin-top:2px;">Offline-first Queue · Sinkron SignalR</div>
        </div>
        <!-- Mobile Content -->
        <div style="flex:1;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">
          <!-- Urgent Alert Card -->
          <div style="background:#fff1f2;border:1px solid #fecdd3;border-left:3px solid #be123c;border-radius:4px;padding:8px 9px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="mono" style="font-size:9.2px;font-weight:700;color:#be123c;">ALERT ROAS · AD-03</span>
              <span class="mono" style="font-size:9px;color:#881337;">1 mnt lalu</span>
            </div>
            <div style="font-size:11px;font-weight:700;color:#18131a;margin-top:3px;">Payday Broad turun ke ROAS 2,1x</div>
            <div style="font-size:9.8px;color:#524656;margin-top:2px;">CPA Rp 34.167 (&gt; batas Rp 28 rb)</div>
            <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:5px;">
              <span class="e-btn e-btn-danger" style="height:24px;justify-content:center;font-size:10px;">Jeda AD-03</span>
              <span class="e-btn" style="height:24px;justify-content:center;font-size:10px;">Turun Bid 30%</span>
            </div>
          </div>

          <!-- Quick Metric Pair -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            <div style="border:1px solid #e5dee8;border-radius:4px;padding:7px 8px;background:#faf8fb;">
              <div style="font-size:9.2px;color:#695c6c;">GMV Sesi</div>
              <div class="mono" style="font-size:14px;font-weight:700;color:#be185d;">Rp 64,2 jt</div>
              <div style="font-size:9px;color:#047857;">ROAS 6,8x</div>
            </div>
            <div style="border:1px solid #e5dee8;border-radius:4px;padding:7px 8px;background:#faf8fb;">
              <div style="font-size:9.2px;color:#695c6c;">CVR / Order</div>
              <div class="mono" style="font-size:14px;font-weight:700;color:#18131a;">4,9%</div>
              <div style="font-size:9px;color:#524656;">312 pesanan</div>
            </div>
          </div>

          <!-- Floor Stock Runner Checklist -->
          <div style="border:1px solid #e5dee8;border-radius:4px;padding:8px 9px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-weight:700;font-size:10.5px;color:#18131a;border-bottom:1px solid #efeaf0;padding-bottom:4px;">Tugas Floor Runner &amp; Gudang</div>
            <div class="kl-kv"><span class="kl-kv-k">1. Siapkan sample ET-04 (Voal)</span>${badge('Siap', 'ok')}</div>
            <div class="kl-kv"><span class="kl-kv-k">2. Tarik 18 pcs L ET-01 (WH-BDG)</span>${badge('Proses', 'warn')}</div>
            <div class="kl-kv"><span class="kl-kv-k">3. Cek mic wireless Cadangan B</span>${badge('94%', 'ok')}</div>
            <div class="kl-kv"><span class="kl-kv-k">4. Briefing shift 21:00 (Sinta)</span>${badge('18 mnt', 'info')}</div>
            <div class="kl-kv"><span class="kl-kv-k">5. Verifikasi WA 36 order COD</span>${badge('Antre', 'warn')}</div>
          </div>

          <!-- Broadcast Encoder Telemetry Strip -->
          <div style="background:#1b1016;color:#faf5f8;border-radius:4px;padding:7px 9px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;">
            <div><div style="font-size:8.4px;color:#c2aeb9;">OBS ENCODER</div><div class="mono" style="font-size:10.5px;font-weight:700;color:#6ee7b7;">60 fps</div></div>
            <div><div style="font-size:8.4px;color:#c2aeb9;">BITRATE RTMP</div><div class="mono" style="font-size:10.5px;font-weight:700;color:#ffffff;">6,2 Mbps</div></div>
            <div><div style="font-size:8.4px;color:#c2aeb9;">AUDIO MIX</div><div class="mono" style="font-size:10.5px;font-weight:700;color:#38bdf8;">-14 LUFS</div></div>
          </div>

          <!-- One-tap Cue Button -->
          <div style="background:#be185d;color:#ffffff;border-radius:4px;padding:9px;text-align:center;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${ic('zap', 12, '#fff')}
            <span>Kirim Cue Cepat ke Teleprompter</span>
          </div>
        </div>
        <!-- Mobile Bottom Nav -->
        <div style="height:36px;border-top:1px solid #e5dee8;background:#faf8fb;display:grid;grid-template-columns:repeat(4,1fr);align-items:center;text-align:center;font-size:9px;font-weight:600;color:#695c6c;flex-shrink:0;">
          <div style="color:#be185d;font-weight:700;">Live</div>
          <div>Stok</div>
          <div>Iklan</div>
          <div>Shift</div>
        </div>
      </div>
    </div>

    <!-- Column 3: API Integration & SignalR Latency Waterfall -->
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
      <div class="e-panel" style="flex:0 0 286px;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#be185d')}
            <span>Trace Latensi End-to-End (Order -&gt; Layar Host)</span>
          </div>
          ${badge('Total 102 ms', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;">
          ${waterfallSvg}
          <div style="border-top:1px solid #ece6ef;padding-top:6px;display:flex;justify-content:space-between;font-size:9.8px;color:#524656;">
            <span>SLA End-to-End: <strong class="mono">&lt;= 250 ms</strong></span>
            <span>P95 Aktual: <strong class="mono" style="color:#047857;">102 ms (59% headroom)</strong></span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('server', 13, '#be185d')}
            <span>Kesehatan Konektor API, Rate Limit &amp; SignalR Hub</span>
          </div>
          ${badge('5/5 UP', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          ${connectors
            .map(
              (cn) => `<div style="border:1px solid #e5dee8;border-radius:3px;padding:7px 8px;background:#fcfafd;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                <span style="font-weight:700;font-size:10.5px;color:#18131a;">${esc(cn.name)}</span>
                ${badge(cn.status, cn.tone)}
              </div>
              <div style="display:flex;justify-content:space-between;font-size:9.4px;color:#695c6c;margin-bottom:4px;">
                <span class="mono">${esc(cn.proto)}</span>
                <span class="mono">p95: <strong style="color:#18131a;">${cn.lat}</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:9.2px;color:#695c6c;width:62px;flex-shrink:0;">Kuota API</span>
                <div style="flex:1;">${renderCapacityBar(cn.quota, { warnAt: 75, critAt: 90 })}</div>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="e-panel" style="flex:0 0 112px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('terminal', 13, '#be185d')}<span>Antrean Webhook &amp; Retry Dead-Letter</span></div>
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">DLQ: 0</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div class="kl-kv"><span class="kl-kv-k">Webhook Diterima (24 Jam)</span><span class="kl-kv-v mono">1.284.910 (99,99% sukses)</span></div>
          <div class="kl-kv"><span class="kl-kv-k">Auto-Retry Sukses (&lt; 3 dtk)</span><span class="kl-kv-v mono">118 event · 0 hilang</span></div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeId: 'p8',
    crumbGroup: 'Perangkat Studio & Integrasi',
    pageTitle: 'Layar Teleprompter Host, Pendamping Mobile & Telemetri SignalR/API',
    rightActions: `
      <span class="e-btn">${ic('refresh', 11)} Uji Latensi SignalR</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#fff')} Mode Layar Penuh Studio-2</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// EXPORT ALL 8 PAGES
// ============================================================================
export function renderPages() {
  verifyMath();
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderPage1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderPage2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderPage3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderPage4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderPage5() },
    { slug: 'p6', title: meta.pages[5].title, html: renderPage6() },
    { slug: 'p7', title: meta.pages[6].title, html: renderPage7() },
    { slug: 'p8', title: meta.pages[7].title, html: renderPage8() },
  ];
}
