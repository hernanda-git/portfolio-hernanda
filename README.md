# Muhammad Hernanda — Portofolio & Atlas Produk Digital Indonesia

Portofolio rekayasa perangkat lunak dan **Atlas 120 Konsep Produk Digital Indonesia** untuk **Muhammad Hernanda** (Principal Software Engineer, Solution Architect & Inference Engineer, Jakarta) dalam Bahasa Indonesia dengan istilah teknis, standar, dan protokol tetap utuh.

## Struktur & Batas Kredibilitas

- **Karier Produksi Terverifikasi (2016–2026):** 16 pengalaman kerja nyata dan matriks kapabilitas teknis yang bersumber langsung dari CV (`Resume of Muhammad Hernanda (September 2026).pdf`).
- **Atlas Konsep Produk Indonesia (120 Konsep):** Eksplorasi konseptual berlabel jelas (`Konsep Desain · Belum Deploy`) lintas **15 sektor pasar Indonesia**, **6 kelas platform**, dan **18 arketipe UI**. Setiap proyek memiliki tangkapan layar UI/UX beresolusi tinggi `1280×800` WebP yang dirender melalui `tools/screen-foundry/` dengan kombinasi 10 shell aplikasi, 18 tema visual, 5 sistem tipografi, dan 28 komponen visual domain.
- **Filter Faset Dinamis:** Seluruh angka di menu sidebar Atlas (`Sektor Pasar`, `Kelas Platform`, `Arketipe UI`) dan lensa kurasi dihitung secara dinamis lintas faset (*cross-facet*) dan sejajar rapi dengan `tabular-nums`.

## Perintah

```bash
npm install
npm run dev                               # server pengembangan lokal
node tools/screen-foundry/renderAll.mjs   # render ulang 120 screenshot WebP 1280x800
npm run build                             # tsc + build produksi Vite di dist/
npm run preview                           # pratinjau lokal hasil build dist/
```

## Referensi Desain (`unslop-ui`)

- Referensi: **Stripe Dashboard + Linear**
- Tema Default: Terang (`#f4f4f1` kanvas, `#ffffff` permukaan utama) dengan tombol tema gelap persisten
- Aksen: Jakarta Cobalt (`#0f52ba`)
- Audit statis: `node C:/Workspace/.agents/skills/unslop-ui/audit.mjs C:/Workspace/portfolio-hernanda/src C:/Workspace/portfolio-hernanda/index.html --strict` (`0 high, 0 medium, 0 low`)
