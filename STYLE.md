# Panduan Style dan Tema

Panduan ini merangkum sistem visual aplikasi Pengajuan Berkah Angsana: tema warna, material kaca, tipografi, komponen, dan gerak. Baca ini sebelum membuat atau mengubah tampilan.

Stack: Tailwind CSS v4 (dikonfigurasi lewat CSS, tanpa `tailwind.config.js`) dan ikon `lucide-react`.

| File                             | Isi                                                     |
| -------------------------------- | ------------------------------------------------------- |
| `src/index.css`                  | Token warna, font, radius, latar, utility kaca, animasi |
| `src/utils/theme.js`             | Warna default, daftar preset, simpan dan terapkan tema  |
| `src/components/ThemePicker.jsx` | Dialog pemilih warna                                    |
| `src/utils/status.js`            | Warna status dan prioritas                              |

## Prinsip

- **Satu warna menentukan semuanya.** Tema hanya menyimpan satu warna; palet, latar, dan bayangan diturunkan darinya.
- **Kaca untuk permukaan.** Kartu, dialog, navigasi, dan tombol ikon memakai material kaca di atas latar bergradasi.
- **Bentuk membulat.** Kartu memakai radius besar, sedangkan tombol dan navigasi berbentuk pil atau lingkaran.
- **Mobile lebih dulu.** Rancang untuk layar HP, lalu tambahkan varian `md:` dan `lg:`.
- **Gerak secukupnya.** Animasi berulang harus punya tujuan dan memakai `motion-safe:`.

## Tema warna

### Cara kerja

```text
theme_color (localStorage)
   -> getTheme()     pakai warna tersimpan, atau DEFAULT_THEME jika kosong/tidak valid
   -> applyTheme()   mengisi --brand dan --brand-on di <html>
   -> index.css      primary-50..900, latar, bayangan, dan kaca ikut berubah
```

`main.jsx` memanggil `applyTheme(getTheme())` saat aplikasi dimuat. `ThemePicker` memanggil `saveTheme()`, yang langsung menerapkan warna lalu menyimpannya, jadi perubahan tampil tanpa reload.

Tema tersimpan per browser, bukan per akun, dan tidak ikut terhapus saat logout.

### Variabel dasar

| Variabel     | Fungsi                        | Nilai                                                                              |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| `--brand`    | Warna tema                    | Default `#141416` (Hitam)                                                          |
| `--brand-on` | Warna teks di atas warna tema | Dihitung otomatis: `#141416` jika luminans warna di atas 0,4, selain itu `#ffffff` |

### Preset

Warna default dan preset ada di `DEFAULT_THEME` dan `THEME_PRESETS` (`src/utils/theme.js`). Pengguna juga bisa memilih warna apa pun lewat "Warna lain".

| Nama            | Nilai     |
| --------------- | --------- |
| Hitam (default) | `#141416` |
| Merah           | `#ff0000` |
| Violet          | `#a43cff` |
| Biru            | `#2f6bff` |
| Teal            | `#00a389` |
| Oranye          | `#ff6a00` |
| Pink            | `#f0359a` |

Untuk mengganti warna default, ubah `DEFAULT_THEME` dan `--brand` di `:root` pada `src/index.css` supaya keduanya tetap sama.

### Palet turunan

Gunakan token ini, bukan warna hex, untuk apa pun yang mengikuti tema.

| Token         | Rumus             | Penggunaan umum            |
| ------------- | ----------------- | -------------------------- |
| `primary-50`  | 6% brand + putih  | Latar sangat lembut        |
| `primary-100` | 12% brand + putih | Latar badge                |
| `primary-200` | 22% brand + putih | Gradasi `card-highlight`   |
| `primary-300` | 38% brand + putih | Tepi `glass-primary`       |
| `primary-400` | 62% brand + putih | Aksen terang               |
| `primary-500` | 84% brand + putih | Aksen                      |
| `primary-600` | brand             | Warna utama, outline fokus |
| `primary-700` | 85% brand + hitam | Teks dan ikon aksen        |
| `primary-800` | 70% brand + hitam | Teks di atas `primary-100` |
| `primary-900` | 55% brand + hitam | Warna bayangan kaca        |

Warna tetap, yang tidak mengikuti tema:

- `ink` (`#141416`) untuk teks utama.
- Skala `neutral` Tailwind untuk teks sekunder: `neutral-600` paling sering dipakai.
- Warna status (lihat [Status dan prioritas](#status-dan-prioritas)).

### Latar halaman

Latar dibuat di `@layer base` pada `src/index.css`:

- `body` memakai `color-mix(brand 6%, #fafafa)`.
- `body::before` memasang tiga gradasi radial dengan posisi tetap dan warna tema 22-30%. Gradasi ini memberi efek blur kaca sesuatu untuk dibiaskan, jadi jangan dihapus.

## Material kaca

Semua utility ada di `src/index.css`.

| Utility          | Tampilan                                   | Blur                | Dipakai untuk                       |
| ---------------- | ------------------------------------------ | ------------------- | ----------------------------------- |
| `glass`          | Kaca terang dengan kilau dan tepi berkilau | 30px, saturasi 190% | Dialog, tombol ikon, navigasi bawah |
| `card-glass`     | `glass` + `rounded-card`                   | 30px                | Kartu standar                       |
| `card-highlight` | `card-glass` dengan rona warna tema        | 30px                | Kartu yang ditonjolkan              |
| `glass-button`   | Putih buram dengan tepi terang             | 20px, saturasi 190% | Tombol sekunder                     |
| `glass-primary`  | Warna tema 80%, teks `--brand-on`          | 16px, saturasi 170% | Tombol utama                        |

Kesan kaca pada `glass` dibentuk oleh tiga lapisan:

1. **Isi:** gradasi radial putih di kiri atas (kilau), di atas gradasi diagonal putih 38% ke 16%.
2. **Biasan:** `backdrop-filter` blur dan saturasi. Selalu sertakan juga `-webkit-backdrop-filter` untuk Safari.
3. **Tepi dan kedalaman:** `box-shadow` berlapis berisi garis luar warna tema, tepi dalam putih, rona tema di bagian bawah, dan bayangan `primary-900`.

### Aturan pemakaian

- Pakai utility yang ada; jangan menyusun ulang `backdrop-filter` di komponen.
- Pakai kartu lewat komponen `Card`, atau `<Card highlight>` untuk versi yang ditonjolkan.
- Untuk elemen di dalam kaca, cukup pakai `bg-white/50` dan `ring-1 ring-ink/5`, bukan kaca di atas kaca.
- Setiap utility kaca baru harus ditambahkan ke blok `prefers-reduced-transparency: reduce`. Di blok itu kaca terang menjadi putih solid dan `glass-primary` menjadi `primary-700`.

## Tipografi

Font: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, lalu `Plus Jakarta Sans` (dimuat dari Google Fonts di `index.html`). Perangkat Apple memakai font sistem.

| Peran                  | Kelas                                               |
| ---------------------- | --------------------------------------------------- |
| Judul halaman          | `text-2xl font-semibold tracking-tight lg:text-3xl` |
| Judul dialog           | `text-lg font-semibold`                             |
| Isi                    | `text-sm`                                           |
| Teks sekunder          | `text-sm text-neutral-600`                          |
| Keterangan             | `text-xs`                                           |
| Tombol                 | `text-[15px] font-semibold`                         |
| Badge                  | `text-[11px] font-semibold`                         |
| Nominal uang dan angka | Tambahkan `tabular-nums`                            |

## Bentuk dan ukuran

| Elemen                       | Nilai                                  |
| ---------------------------- | -------------------------------------- |
| Kartu dan dialog             | `rounded-card` (1,75rem)               |
| Elemen dalam kartu           | `rounded-2xl`                          |
| Tombol, tab, badge, navigasi | `rounded-full`                         |
| Tombol utama                 | Tinggi `h-13`                          |
| Tombol ikon                  | `size-11` (target sentuh minimal 44px) |
| Ikon                         | `size-5` dengan `strokeWidth={1.5}`    |

## Komponen

| Komponen               | Catatan                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`               | `variant="primary"` (`glass-primary`) atau `"light"` (`glass-button`). `chevrons` menampilkan tiga panah beranimasi untuk aksi kirim/lanjut                                       |
| `IconButton`           | Tombol bulat `glass`. Wajib mengisi `label` untuk pembaca layar                                                                                                                   |
| `Card`                 | `card-glass`, atau `card-highlight` lewat prop `highlight`                                                                                                                        |
| Input form             | `INPUT_CLASS` di `FormPengajuan.jsx`: `h-12 rounded-2xl bg-white/70 text-base ring-1 ring-ink/8`, dengan ring `primary-500` saat fokus. `text-base` mencegah zoom otomatis di iOS |
| `Dialog`               | `<dialog>` native dengan kaca dan backdrop blur. Lebar standar: `w-[calc(100%-2rem)] max-w-sm p-6`                                                                                |
| `Tabs`                 | Segmented control ala iOS: wadah `bg-ink/6`, item aktif `bg-white`                                                                                                                |
| `Badge`, `StatusBadge` | Pil kecil. Warna status berasal dari `src/utils/status.js`                                                                                                                        |
| `BottomNav`            | Navigasi pil mengambang untuk HP, disembunyikan mulai `md:`                                                                                                                       |
| `Sidebar`              | Panel `card-glass` tetap untuk desktop, tampil mulai `md:`                                                                                                                        |
| `PullToRefresh`        | Ikon tarik-untuk-refresh; mengambil ulang data tanpa reload halaman                                                                                                               |

Pola dialog konfirmasi: judul berupa pertanyaan, satu kalimat penjelasan, lalu dua tombol dalam `grid grid-cols-2 gap-2` dengan `variant="light"` untuk batal dan `primary` untuk aksi. Contohnya ada di `src/layouts/AppLayout.jsx`.

Item navigasi aktif: `bg-white/80 text-primary-700 shadow-sm`.

## Status dan prioritas

Sebagian besar warna status tidak mengikuti tema, supaya artinya tetap sama di semua pilihan warna. Pengecualiannya `Ditolak` dan `Top Urgent`, yang saat ini memakai warna tema.

| Status      | Label     | Warna                                    |
| ----------- | --------- | ---------------------------------------- |
| `REQUESTED` | Diajukan  | Oranye                                   |
| `REVIEWED`  | Ditinjau  | Kuning                                   |
| `APPROVED`  | Disetujui | Hijau                                    |
| `PAID`      | Dibayar   | Biru muda                                |
| `REJECTED`  | Ditolak   | Warna tema (`primary-100`/`primary-800`) |

| Prioritas    | Warna                                        |
| ------------ | -------------------------------------------- |
| `NORMAL`     | Netral                                       |
| `URGENT`     | Oranye                                       |
| `TOP_URGENT` | Warna tema (`primary-600`) dengan teks putih |

## Gerak

| Animasi                                      | Durasi              | Dipakai untuk                     |
| -------------------------------------------- | ------------------- | --------------------------------- |
| `animate-tube-fill`                          | 700ms, sekali       | Tabung status saat halaman dibuka |
| `animate-chevron-walk`                       | 1,4 detik, berulang | Panah pada `Button`               |
| `animate-spin`                               | Berulang            | Indikator memuat                  |
| `active:scale-[0.98]` atau `active:scale-95` | Sesaat              | Umpan balik tekan tombol          |

Bungkus animasi otomatis dengan `motion-safe:` supaya menghormati pengaturan kurangi gerak.

## Layout dan aksesibilitas

- Konten dibatasi `max-w-6xl`. Di HP, `pb-28` memberi ruang untuk `BottomNav`; di desktop, `md:pl-72` memberi ruang untuk `Sidebar`.
- Outline fokus: `focus-visible:outline-2 focus-visible:outline-primary-600`.
- Hormati `prefers-reduced-transparency` dan `prefers-reduced-motion`.
- Ikon dekoratif memakai `aria-hidden="true"`; tombol tanpa teks wajib punya `aria-label`.
- Tarik-untuk-refresh bawaan browser dimatikan dengan `overscroll-behavior-y: none`.

## Menambah tampilan baru

1. Pakai komponen yang sudah ada.
2. Pakai `primary-*`, `ink`, dan `neutral-*`, bukan warna hex.
3. Untuk teks di atas warna tema, pakai `glass-primary` atau `var(--brand-on)`, bukan `text-white`.
4. Uji minimal dengan tema Hitam, tema Merah, dan warna terang lewat "Warna lain".
5. Uji di lebar 320px dan 390px.

## Hal yang perlu diperhatikan

Masalah berikut ada di kode saat ini dan belum diperbaiki:

| Masalah                                       | Lokasi                                                                                            | Dampak                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Pesan error memakai warna tema                | `text-primary-700`, juga di `Login`, `FormPengajuan`, `RequestFilters`, dan `DetailPengajuan`     | Pada tema Hitam, error terlihat hitam dan kurang menonjol |
| `Ditolak` dan `Top Urgent` memakai warna tema | `src/utils/status.js`, juga titik timeline di `DetailPengajuan.jsx`                               | Pada tema Hitam, keduanya tidak lagi terlihat merah       |
| `text-white` di atas warna tema               | `TOP_URGENT` di `status.js`, tombol **Buka file** di `AttachmentModal.jsx`                        | Teks sulit terbaca pada warna tema terang                 |
| File sisa                                     | `src/App.css` tidak diimpor; token `--shadow-soft` tidak dipakai komponen                         | Bisa dihapus                                              |
| Komentar usang                                | Komentar utility `glass` menyebut "latar polos"; komentar `StatusTracker` menyebut "terisi merah" | Tidak sesuai dengan kode saat ini                         |
