# Catatan implementasi — Ruang Bias

- Mulai dari direktori kosong ketika penolakan pengguna menyasar seluruh desain. Ekspor data yang dibutuhkan sebagai JSON saja; pemakaian ulang rute demo tidak memerlukan komponen portal, diagram, screenshot, font, atau aturan layout sebelumnya.
- Pisahkan komposisi galeri dari fungsi katalog. Tiga karya memakai satu ilustrasi asli per kasus; katalog panjang tidak perlu gambar generik pada setiap baris. Status konsep tidak sama dengan hasil audit prototipe.
- Uji canvas dengan hash piksel dan tunggu kondisi animasi benar-benar selesai, bukan ambang waktu tetap. Mendekati nilai akhir belum sama dengan selesai.
- Ukur kontrol dan alur, bukan hanya screenshot: tombol panah dan fokus keyboard yang nyata, sentuhan, reduced motion, browser Back/tautan kembali, filter kosong/reset, dan tampilan tanpa JavaScript.
- Pemeriksaan kontras sRGB: teks utama/kanvas 17,15:1; teks sekunder/kanvas 6,95:1; aksen/kanvas 8,07:1; teks putih/aksen 8,57:1; batas kontrol/putih 3,51:1; teks redup/ruang proyeksi 10,53:1.
- Tinjauan visual mengubah tracking judul agar huruf tidak saling menempel pada ukuran besar, memendekkan pembuka, dan mengganti slider bawaan dengan indikator berlian tanpa menghilangkan input native.
