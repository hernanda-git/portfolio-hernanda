# Ruang Bias — Preview

Buka http://127.0.0.1:4186/ dari komputer ini. Versi ini belum dipublikasikan.

- Beranda: seret bidang cahaya dengan mouse atau jari. Penggeser menerima tombol panah, Home, dan End. Tidak ada putaran otomatis. Browser tanpa JavaScript menunjukkan cetak statis.
- Karya: tiga ilustrasi orisinal dan tiga studi kasus pekerjaan produksi. Ilustrasi bukan tangkapan layar sistem klien.
- Atlas: 152 konsep, pencarian dengan filter sektor/platform, halaman tiap konsep, dan tautan ke layar demo yang sudah diterbitkan. Atlas bukan register riset yang divalidasi ulang, dan bukan klaim 152 produk sudah dibangun ulang.

## Menjalankan ulang

Dari `C:/Workspace/portfolio-hernanda-bias`:

    python build.py
    python serve.py 4186

Python standar cukup untuk membangun dan menjalankan preview. `public/` adalah hasil build. Tidak ada bundel aplikasi, CSS, screenshot, atau komponen dari proyek terdahulu. Font Bricolage Grotesque disimpan lokal bersama lisensi OFL.

## Mengubah isi dan ilustrasi

- `data/stories.json`: tulisan dan metadata tiga studi; `tools/prints.py`: ilustrasi setiap studi dan cetak statis Ruang Bias.
- `src/refraction.js`: permukaan cahaya dan kontrol. `src/site.css`: tata letak dan token.
- `data/catalog.json`: metadata konsep dan tujuan demo. `data/profile.json`: identitas, kontak, daftar peran. `tools/export-facts.mjs` hanya untuk mengambil ulang fakta dari checkout; tidak diperlukan saat build.
- `build.py`: markup seluruh halaman, termasuk tulisan ringkas beranda dan bagian Tentang/Kontak.

## Pemeriksaan ulang

    python tools/verify_build.py
    node C:/Workspace/.agents/skills/unslop-ui/audit.mjs src public --strict
    node tools/browser-review.mjs

Untuk uji browser, pasang Playwright Core atau set `PLAYWRIGHT_CORE` ke lokasi paket yang sudah tersedia; set `CHROME_BIN` jika memakai browser terpasang. `PREVIEW_EVIDENCE` memilih direktori bukti, dan `VERIFY_DEMO=1` menambahkan uji satu simulasi pada situs demo publik. `STATUS.md` membedakan hasil uji portofolio dari status program 152 proyek.
