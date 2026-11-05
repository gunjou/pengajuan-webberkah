# Pengajuan Berkah Angsana

Aplikasi web untuk pegawai Berkah Angsana membuat dan memantau pengajuan pembelian atau pembayaran. Aplikasi ini hanya mencakup peran pegawai dan terhubung ke backend Flask (`api-webberkah`) lewat alamat di `.env`.

## Fitur

- Login pegawai
- Beranda: ringkasan status dan pengajuan terbaru
- Buat pengajuan, termasuk item, data pembayaran, dan unggah lampiran
- Daftar pengajuan dengan pencarian serta filter status, departemen, dan tanggal
- Detail pengajuan: linimasa status, unduh PDF, dan hapus
- Pratinjau lampiran gambar dan PDF
- Riwayat pengajuan yang sudah dibayar
- Pilihan warna tema

## Teknologi

- React 19 dan Vite 8 (JavaScript)
- Tailwind CSS v4, dikonfigurasi di `src/index.css`
- React Router dan TanStack Query
- PDF.js dan lucide-react

## Persiapan

Butuh Node.js 22.13 atau lebih baru.

```bash
npm install
```

Buat file `.env` di root proyek. File ini tidak masuk git, dan dipakai saat development maupun build.

```dotenv
VITE_API_BASE_URL=https://alamat-api
VITE_CDN_URL=https://alamat-cdn

VITE_IMAGE_SERVICE_NAME=
VITE_IMAGE_CATEGORY=
VITE_IMAGE_API_KEY=

VITE_DOCUMENT_CATEGORY=
VITE_DOCUMENT_API_KEY=
```

Aplikasi memanggil alamat di `VITE_API_BASE_URL` secara langsung, jadi `npm run dev` memakai data dari server tersebut.

## Menjalankan

```bash
npm run dev            # server development
npm run dev -- --host  # agar bisa dibuka dari HP di Wi-Fi yang sama
npm run lint           # pemeriksaan kode
npm run build          # build produksi ke dist/
npm run preview        # melihat hasil build
```

## Struktur

```text
src/
  api/         pemanggilan API dan upload CDN
  assets/      logo
  components/  komponen UI
  hooks/       hook data dan filter
  layouts/     tata letak utama
  pages/       halaman
  utils/       format, status, tema, dan validasi form
```

## Catatan deploy

- Semua rute harus diarahkan ke `index.html`, karena aplikasi memakai routing di sisi browser.
- File `.mjs` harus disajikan sebagai JavaScript. Jika tidak, pratinjau PDF gagal.
- Semua nilai `VITE_*` ikut masuk ke kode yang dikirim ke browser, termasuk API key CDN. Pastikan izin key tersebut dibatasi.
