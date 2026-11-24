# Muhammad Hernanda - Portofolio & Atlas Produk Digital Indonesia

Portofolio rekayasa perangkat lunak dan **Atlas 152 Konsep Produk Digital Indonesia** oleh **Muhammad Hernanda** (Principal Software Engineer, Solution Architect & Inference Engineer, Jakarta).

## Struktur & Batas Kredibilitas

- **Karier Produksi Terverifikasi (2016-2026):** 16 pengalaman kerja nyata dan matriks kapabilitas teknis yang bersumber langsung dari CV (Resume of Muhammad Hernanda (September 2026).pdf).
- **Atlas Konsep Produk Indonesia:** Prototipe interaktif lintas 15 sektor pasar Indonesia, termasuk 32 konsep riset Indonesia 2025-2027 (ID-121-ID-152). Skenario memakai data contoh dan berjalan lokal di browser, bukan di sistem produksi.
- **Filter Faset Dinamis:** Seluruh angka di menu sidebar Atlas (Sektor Pasar, Kelas Platform, Arketipe UI) dan lensa kurasi dihitung secara dinamis lintas faset (*cross-facet*) dan sejajar rapi dengan tabular-nums.

## Perintah

bash
npm install
npm run dev                               # server pengembangan lokal
npm run typecheck                         # pemeriksaan tipe TypeScript
npm run build                             # tsc + build produksi Vite di dist/
npm run preview                           # pratinjau lokal hasil build dist/


## Rute Prototipe & Publikasi

Setiap proyek dan halaman bisa dibuka langsung dengan URL /{nama-proyek}/{nama-halaman}. Coba [rekonsiliasi VA KasirTreasury](https://hernanda-git.github.io/portfolio-hernanda/kasirtreasury-bi/rekonsiliasi-virtual-account-piutang-erp/) atau [pembayaran transit TapNusa](https://hernanda-git.github.io/portfolio-hernanda/tapnusa-qris/pratinjau-aplikasi-mobile-komuter-net-maui-9-kotlin-hce/). Skenario tersimpan per proyek di browser dan dapat di-reset.

Build menyiapkan index.html untuk setiap rute, sehingga tautan langsung dan refresh bekerja di host statis tanpa aturan rewrite. Workflow GitHub Pages meneruskan base path repositori ke PORTFOLIO_BASE; build lokal tanpa variabel itu berjalan di root. Blueprint dan screenshot arsip tetap di repositori, tidak dikirim ke situs.

## Referensi Desain (unslop-ui)

- Referensi: **Stripe Dashboard + Linear**
- Tema Default: Terang (#f4f4f1 kanvas, #ffffff permukaan utama) dengan tombol tema gelap persisten
- Aksen: Jakarta Cobalt (#0f52ba)
- Audit statis: node C:/Workspace/.agents/skills/unslop-ui/audit.mjs C:/Workspace/portfolio-hernanda/src C:/Workspace/portfolio-hernanda/index.html --strict (0 high, 0 medium, 0 low)
