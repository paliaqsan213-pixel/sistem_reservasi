# PROMPT SISTEM: SISTEM RESERVASI LAPANGAN OLAHRAGA BERBASIS WEB DENGAN GREEDY SCHEDULING
**Studi Kasus: Tawang Alun Futsal Arena, Kendari**

---

## MASTER PROMPT — GAMBARAN UMUM SISTEM

```
Kamu adalah senior software engineer Laravel.

Bangun sistem reservasi lapangan olahraga berbasis web bernama "Tawang Alun Futsal Arena" dengan spesifikasi berikut:

STACTK TEKNOLOGI:
Backend : PHP 8.4 + Laravel 13
Frontend : Laravel Starter Kit (React) + React + TypeScript + Tailwind CSS + Inertia.js
Database : MySQL 8
Storage : Laravel Storage (local disk) untuk upload bukti pembayaran
Tools : Visual Studio Code

DUA ROLE PENGGUNA:
1. Pelanggan  — registrasi mandiri, melakukan reservasi, upload bukti bayar, pantau status
2. Admin      — mengelola lapangan & jadwal, monitoring reservasi, verifikasi pembayaran

FITUR UTAMA:
- Manajemen data lapangan (CRUD) oleh admin
- Pengelolaan slot jadwal per lapangan per tanggal oleh admin
- Penjadwalan otomatis menggunakan Algoritma Greedy Scheduling (Earliest Finish Time First / EFTF)
- Proses reservasi multi-langkah (pilih lapangan → pilih waktu → konfirmasi → upload bukti bayar)
- Verifikasi pembayaran oleh admin (konfirmasi / tolak dengan alasan)
- Pencegahan double booking (penguncian slot atomik)
- Riwayat & status reservasi untuk pelanggan
- Dashboard admin dengan statistik real-time

SKEMA STATUS RESERVASI:
pending → menunggu_verifikasi → dikonfirmasi / ditolak

Mulai dari scaffolding, lalu kerjakan modul per modul sesuai instruksi berikutnya.
```

---

## PROMPT 1 — SETUP PROJECT & DATABASE

```
Inisialisasi project Laravel 11 untuk sistem reservasi lapangan futsal.

LANGKAH-LANGKAH:
1. Buat project baru: `composer create-project laravel/laravel reservasi-lapangan`
2. Konfigurasi .env: DB_DATABASE=reservasi_lapangan, APP_NAME="Tawang Alun Futsal Arena"
3. Install package tambahan:
   - `composer require laravel/ui`
   - `npm install -D tailwindcss @tailwindcss/forms alpinejs`

BUAT MIGRATION UNTUK TABEL-TABEL BERIKUT:

Tabel `users`:
- id, name, email (unique), password, phone, address
- role: enum('pelanggan', 'admin'), default 'pelanggan'
- email_verified_at, remember_token, timestamps

Tabel `lapangans`:
- id, nama_lapangan (string), harga_per_jam (decimal 10,2)
- deskripsi (text, nullable), foto (string, nullable)
- status_aktif: enum('aktif', 'tidak_aktif'), default 'aktif'
- timestamps

Tabel `jadwals`:
- id, lapangan_id (FK → lapangans), tanggal (date)
- slot_mulai (time), slot_selesai (time)
- durasi_menit (integer, computed)
- status: enum('tersedia', 'dipesan', 'tidak_tersedia'), default 'tersedia'
- timestamps
- UNIQUE KEY (lapangan_id, tanggal, slot_mulai)

Tabel `reservasis`:
- id, user_id (FK → users), lapangan_id (FK → lapangans)
- jadwal_id (FK → jadwals)
- tanggal_reservasi (date), waktu_mulai (time), waktu_selesai (time)
- total_harga (decimal 10,2)
- status: enum('pending','menunggu_verifikasi','dikonfirmasi','ditolak'), default 'pending'
- kode_booking (string, unique) — format: YYYYMMDD-XXXXXX
- catatan_admin (text, nullable)
- timestamps

Tabel `pembayarans`:
- id, reservasi_id (FK → reservasis, unique)
- bukti_transfer (string) — path file
- tanggal_upload (timestamp)
- status: enum('menunggu','dikonfirmasi','ditolak'), default 'menunggu'
- timestamps

Buat juga Seeder untuk:
- 1 akun admin: admin@tawangalun.com / password
- 3 lapangan futsal aktif dengan harga berbeda (Rp 80.000, Rp 100.000, Rp 120.000)
- Slot jadwal contoh untuk 7 hari ke depan (08:00–22:00, interval 1 jam)
```

---

## PROMPT 2 — MODEL, RELASI & MIDDLEWARE

```
Buat Model Eloquent dan konfigurasi middleware untuk sistem reservasi ini.

MODEL DAN RELASI:

User model:
- fillable: name, email, password, phone, address, role
- hasMany Reservasi
- method: isPelanggan(), isAdmin()

Lapangan model:
- fillable: nama_lapangan, harga_per_jam, deskripsi, foto, status_aktif
- hasMany Jadwal
- hasMany Reservasi
- scope: scopeAktif($query)

Jadwal model:
- fillable: lapangan_id, tanggal, slot_mulai, slot_selesai, durasi_menit, status
- belongsTo Lapangan
- hasOne Reservasi
- scope: scopeTersedia($query)
- accessor: getDurasiLabelAttribute() → "1 jam", "2 jam", dst

Reservasi model:
- fillable: user_id, lapangan_id, jadwal_id, tanggal_reservasi, waktu_mulai,
            waktu_selesai, total_harga, status, kode_booking, catatan_admin
- belongsTo User, Lapangan, Jadwal
- hasOne Pembayaran
- boot(): auto-generate kode_booking saat creating

Pembayaran model:
- fillable: reservasi_id, bukti_transfer, tanggal_upload, status
- belongsTo Reservasi

MIDDLEWARE:
Buat 2 middleware:
1. `PelangganMiddleware` — cek role === 'pelanggan', redirect ke /admin/dashboard jika admin
2. `AdminMiddleware` — cek role === 'admin', redirect ke /dashboard jika bukan admin

Daftarkan di bootstrap/app.php sebagai alias:
- 'pelanggan' → PelangganMiddleware
- 'admin' → AdminMiddleware
```

---

## PROMPT 3 — ALGORITMA GREEDY SCHEDULING

```
Buat Service class untuk Algoritma Greedy Scheduling dengan metode Earliest Finish Time First (EFTF).

Buat file: app/Services/GreedySchedulingService.php

SPESIFIKASI ALGORITMA:
Algoritma ini memilih kombinasi slot waktu yang tidak saling tumpang tindih (conflict-free)
dan memaksimalkan jumlah slot yang dapat diterima dalam satu hari operasional.

IMPLEMENTASI METHOD:

Method 1: getOptimalSlots(array $slots): array
// Input: array of slot objects [{id, slot_mulai, slot_selesai, durasi_menit, status}]
// Output: array slot optimal yang terpilih

Langkah algoritma:
1. Inisialisasi: kumpulkan semua slot dalam bentuk interval (slot_mulai, slot_selesai)
2. Sort ascending berdasarkan slot_selesai (EFTF — Earliest Finish Time First)
3. Pilih slot pertama sebagai solusi awal, catat finish_time = slot_selesai slot pertama
4. Iterasi: untuk setiap slot berikutnya:
   - Jika slot_mulai >= finish_time → TIDAK BENTROK → pilih slot, update finish_time
   - Jika slot_mulai < finish_time → BENTROK → lewati
5. Return array slot yang terpilih

Method 2: getAvailableRecommendations(int $lapanganId, string $tanggal, int $durasiJam): array
// Ambil slot tersedia dari DB, jalankan algoritma, filter sesuai durasi yang diminta
// Return: slot rekomendasi beserta flag 'optimal' = true/false

Method 3: detectConflict(int $jadwalId): bool
// Cek apakah jadwal tertentu konflik dengan reservasi yang sudah ada

Method 4: getFallbackSlot(int $lapanganId, string $tanggal, string $slotMulai): ?object
// Jika slot yang dipilih pelanggan sudah dipesan, cari alternatif terdekat menggunakan greedy

BUAT JUGA unit test sederhana di tests/Unit/GreedySchedulingTest.php:
- Test konsistensi pengurutan EFTF
- Test conflict resolution (kasus R1,R2,R3,R4,R5 dari proposal → hasil R1,R3,R5)
- Test fallback slot
```

---

## PROMPT 4 — AUTENTIKASI (REGISTER & LOGIN)

```
Buat fitur autentikasi untuk sistem reservasi lapangan dengan dua role: pelanggan dan admin.

HALAMAN REGISTER PELANGGAN (/register):
Form fields: Nama Lengkap, Email, No. Telepon, Alamat, Password, Konfirmasi Password
Validasi:
- name: required, string, max:255
- email: required, email, unique:users
- phone: required, digits_between:10,13
- password: required, min:8, confirmed
Setelah register → redirect ke /login dengan flash sukses

HALAMAN LOGIN PELANGGAN (/login):
Form fields: Email, Password, Remember Me
Validasi kredensial + cek role
Setelah login:
- role === 'admin' → redirect /admin/dashboard
- role === 'pelanggan' → redirect /dashboard

HALAMAN LOGIN ADMIN (/admin/login):
Tampilkan warning "Halaman khusus administrator. Akses tidak sah akan tercatat."
Hanya izinkan user dengan role === 'admin'
Setelah login → redirect /admin/dashboard

ROUTE PROTECTION:
- /dashboard dan turunannya → middleware 'auth' + 'pelanggan'
- /admin/* → middleware 'auth' + 'admin'
- /admin/login → guest saja

LOGOUT:
- Invalidate session, regenerate token
- Redirect ke /login (untuk pelanggan) atau /admin/login (untuk admin)
```

---

## PROMPT 5 — MODUL LAPANGAN & JADWAL (ADMIN)

```
Buat modul CRUD lapangan dan manajemen slot jadwal untuk panel admin.

=== KELOLA DATA LAPANGAN ===

Route prefix: /admin/lapangan
Controller: Admin\LapanganController

Index: tampilkan semua lapangan dalam card grid (nama, harga, status, foto thumbnail)
  - Tombol: Tambah Lapangan, Edit, Hapus (soft-delete → ubah status_aktif ke tidak_aktif)

Store/Update Form fields:
- Nama Lapangan (required)
- Harga per Jam dalam Rupiah (required, numeric)
- Deskripsi (opsional, textarea)
- Foto Lapangan (opsional, image, max:2MB)
- Status Aktif (toggle)

Validasi: nama lapangan unique per system

=== KELOLA JADWAL ===

Route: /admin/jadwal
Controller: Admin\JadwalController

Tampilan utama:
- Filter: pilih Lapangan (dropdown) + pilih Tanggal (date picker)
- Setelah filter dipilih, render tabel slot di panel kanan

Form tambah slot:
- Slot Mulai (time picker)
- Slot Selesai (time picker)
- Tombol "+ Tambah Slot"
- Auto-hitung durasi_menit dari selisih waktu

Validasi slot:
- slot_selesai harus > slot_mulai
- Tidak boleh tumpang tindih dengan slot lain pada lapangan + tanggal yang sama
- Jika bentrok dengan reservasi aktif → tampilkan error "Jadwal bentrok dengan reservasi yang sudah ada"

Tabel slot menampilkan: Waktu Mulai, Waktu Selesai, Durasi, Status (badge warna), Aksi (Edit/Hapus)
Hapus slot: hanya boleh jika status === 'tersedia' (belum ada reservasi aktif)
```

---

## PROMPT 6 — ALUR RESERVASI PELANGGAN (MULTI-STEP)

```
Buat alur reservasi multi-langkah untuk pelanggan dengan integrasi Greedy Scheduling.

Gunakan Laravel Session untuk menyimpan data antar step.
Tampilkan stepper UI (Step 1: Pilih Lapangan → Step 2: Pilih Waktu → Step 3: Konfirmasi).

=== STEP 1: PILIH LAPANGAN (/reservasi) ===
Tampilkan card semua lapangan aktif (foto, nama, harga/jam, deskripsi)
Pelanggan klik "Pesan" → simpan lapangan_id ke session → redirect ke Step 2

=== STEP 2: PILIH WAKTU (/reservasi/pilih-waktu) ===
Tampilkan:
- Nama lapangan yang dipilih
- Date picker untuk memilih tanggal
- Input durasi (1 jam, 2 jam, 3 jam — dropdown)

Ketika tanggal + durasi dipilih:
→ AJAX call ke /api/greedy-slots?lapangan_id=X&tanggal=Y&durasi=Z
→ Backend memanggil GreedySchedulingService::getAvailableRecommendations()
→ Return JSON: list slot tersedia, ditandai mana yang "rekomendasi optimal" (badge hijau)

Tampilkan slot dalam bentuk grid tombol waktu:
- Hijau + label "Optimal" → slot rekomendasi greedy
- Biru → slot tersedia lain
- Abu-abu (disabled) → slot sudah dipesan

Pelanggan pilih 1 slot → simpan ke session → lanjut ke Step 3

Jika slot yang dipilih sudah dipesan saat diklik (race condition):
→ Jalankan getFallbackSlot() → tampilkan modal "Slot ini sudah dipesan, ini alternatif terdekat: [slot]"

=== STEP 3: KONFIRMASI (/reservasi/konfirmasi) ===
Tampilkan ringkasan reservasi dalam card:
- Nama Lapangan
- Tanggal
- Waktu Mulai – Waktu Selesai
- Durasi
- Total Harga (harga/jam × durasi)

Tombol: "Kembali" (ke Step 2) | "Ya, Konfirmasi"

Saat konfirmasi diklik:
1. Gunakan DB::transaction() untuk atomik
2. Cek ulang status slot di database (recheck ketersediaan)
3. Jika masih tersedia:
   a. Buat record Reservasi (status: 'pending')
   b. Update status Jadwal → 'dipesan'
   c. Generate kode_booking unik
   d. Clear session reservasi
   e. Redirect ke halaman upload bukti bayar
4. Jika sudah tidak tersedia: kembalikan ke Step 2 dengan pesan error

=== PENCEGAHAN DOUBLE BOOKING ===
Implementasikan SELECT ... FOR UPDATE pada pengecekan slot
agar jika 2 user memesan slot sama secara bersamaan, hanya 1 yang berhasil.
```

---

## PROMPT 7 — UPLOAD BUKTI PEMBAYARAN & RIWAYAT

```
Buat fitur upload bukti pembayaran dan halaman riwayat reservasi pelanggan.

=== HALAMAN UPLOAD BUKTI BAYAR (/reservasi/{id}/upload-bukti) ===

Tampilkan 3 panel:
1. Detail Reservasi: ID Booking, Nama Lapangan, Tanggal, Waktu, Status "pending", Total Tagihan
2. Info Rekening Tujuan:
   - Bank BRI, No. Rek: 1234-5678-9012, A.N. Tawang Alun Futsal Arena
   - Warning: "Transfer tepat nominal yang tertera agar verifikasi tidak tertunda"
3. Area Upload:
   - Drag & Drop zona upload ATAU klik untuk browse file
   - Format diterima: JPG, PNG, PDF
   - Ukuran maksimal: 2 MB
   - Preview thumbnail setelah file dipilih

Validasi:
- file: required, mimes:jpg,jpeg,png,pdf, max:2048
- Jika format tidak valid → pesan: "Format file tidak didukung"
- Jika ukuran melebihi batas → pesan: "Ukuran file terlalu besar (maks 2MB)"

Setelah upload berhasil:
- Simpan file ke storage/app/public/bukti_pembayaran/
- Buat record Pembayaran
- Update status Reservasi → 'menunggu_verifikasi'
- Redirect ke riwayat dengan flash sukses

=== HALAMAN RIWAYAT & STATUS RESERVASI (/riwayat) ===

Tabel dengan kolom: ID Booking, Lapangan, Tanggal, Waktu, Harga, Status, Aksi
Badge status berwarna:
- pending → kuning
- menunggu_verifikasi → biru
- dikonfirmasi → hijau
- ditolak → merah

Fitur:
- Search by kode_booking atau nama lapangan
- Filter dropdown by status
- Pagination (10 per halaman)
- Kolom Aksi: "Lihat Detail" atau "Upload Bukti" (jika masih pending)

=== HALAMAN DETAIL RESERVASI (/riwayat/{id}) ===
Tampilkan:
- Semua info reservasi
- Status dengan badge
- Jika dikonfirmasi: tampilkan instruksi check-in
- Jika ditolak: tampilkan alasan penolakan dari admin
- Preview bukti pembayaran yang sudah diupload (jika ada)
```

---

## PROMPT 8 — DASHBOARD & MONITORING ADMIN

```
Buat dashboard dan halaman monitoring reservasi untuk panel admin.

=== DASHBOARD ADMIN (/admin/dashboard) ===

4 Kartu Statistik (real-time):
1. Total Reservasi (semua status) + tren bulan ini vs bulan lalu (persentase)
2. Menunggu Verifikasi (status: menunggu_verifikasi) — highlight jika > 0
3. Lapangan Aktif (status_aktif: 'aktif')
4. Member Terdaftar (role: 'pelanggan')

Panel kiri — Aktivitas Terbaru:
- Log 10 aktivitas terbaru (reservasi baru, upload bukti, konfirmasi)
- Format: "[Waktu] [Nama Pelanggan] [Aksi]"
- Auto-refresh setiap 60 detik (AJAX polling)

Panel kanan — Perlu Verifikasi:
- Tampilkan reservasi berstatus 'menunggu_verifikasi' (max 5)
- Info: Nama pelanggan, lapangan, tanggal, nominal
- Tombol "Verifikasi Sekarang" → redirect ke halaman verifikasi

Sidebar navigasi: Dashboard, Lapangan, Jadwal, Monitoring Reservasi, Profil

=== MONITORING RESERVASI (/admin/monitoring) ===

Kartu ringkasan: Semua | Pending | Menunggu Verifikasi | Dikonfirmasi
(klik untuk filter otomatis)

Tabel utama (kolom): Pelanggan + Email, Lapangan, Tanggal, Waktu, Harga, Status, Aksi
- Search: by kode_booking / nama pelanggan / lapangan
- Filter dropdown: status
- Sort: tanggal (default: terbaru)
- Pagination: 15 per halaman

Kolom Aksi: ikon mata (👁) → Lihat Detail Reservasi

=== DETAIL RESERVASI ADMIN (/admin/reservasi/{id}) ===
Tampilkan semua informasi reservasi + preview bukti bayar yang diupload pelanggan.
Tombol: "Konfirmasi" (hijau) dan "Tolak" (merah) — muncul hanya jika status menunggu_verifikasi.
```

---

## PROMPT 9 — VERIFIKASI PEMBAYARAN ADMIN

```
Buat fitur verifikasi pembayaran oleh admin dengan layout dua panel.

Route: /admin/verifikasi

=== LAYOUT DUA PANEL ===

Panel KIRI — Antrian Verifikasi:
- List reservasi berstatus 'menunggu_verifikasi'
- Tiap item: ID Booking, Nama Pelanggan, Tanggal, Nominal
- Klik item → load detail di panel kanan (AJAX / Livewire)
- Highlight item yang sedang aktif

Panel KANAN — Detail Verifikasi:
- Info Reservasi: ID, Lapangan, Tanggal, Waktu, Pelanggan, Total
- Preview Bukti Pembayaran:
  - Jika JPG/PNG: tampilkan gambar langsung (img tag)
  - Jika PDF: tampilkan iframe atau link download
- Ringkasan Booking (card)

DUA TOMBOL AKSI:
1. Tombol "Konfirmasi" (hijau):
   - Tampilkan modal konfirmasi: "Yakin ingin mengkonfirmasi pembayaran ini?"
   - Jika ya:
     a. Update status Reservasi → 'dikonfirmasi'
     b. Update status Pembayaran → 'dikonfirmasi'
     c. Update status Jadwal → 'tidak_tersedia' (kunci permanen)
     d. Flash sukses + hapus dari antrian kiri

2. Tombol "Tolak" (merah):
   - Tampilkan modal dengan textarea "Alasan Penolakan" (required)
   - Jika submit:
     a. Update status Reservasi → 'ditolak', simpan catatan_admin
     b. Update status Pembayaran → 'ditolak'
     c. Update status Jadwal → kembali ke 'tersedia' (buka kembali slot)
     d. Flash info + hapus dari antrian kiri

JIKA ANTRIAN KOSONG: tampilkan ilustrasi "Semua pembayaran sudah terverifikasi ✓"
```

---

## PROMPT 10 — JADWAL LAPANGAN & PROFIL PENGGUNA

```
Buat halaman lihat jadwal untuk pelanggan dan halaman profil untuk kedua role.

=== HALAMAN LIHAT JADWAL LAPANGAN (/jadwal) ===

Filter: Lapangan (dropdown) + Tanggal (date picker)
Tombol "Cari Jadwal"

Setelah filter:
Tampilkan tabel atau grid slot dengan keterangan:
- Slot Mulai - Slot Selesai | Durasi | Status (badge warna)
  - Tersedia → hijau
  - Dipesan → merah (disabled)
  - Tidak Tersedia → abu-abu

Tambahkan informasi harga lapangan yang dipilih di atas tabel.
Tombol "Pesan Sekarang" di bawah tabel → redirect ke /reservasi dengan lapangan_id pre-selected.

=== PROFIL PELANGGAN (/profil) ===

Kartu header: Avatar (inisial nama), Nama, Tanggal bergabung, Statistik (total reservasi dikonfirmasi)

Form "Informasi Pribadi":
- Nama Lengkap, Email, No. Telepon, Alamat
- Tombol "Simpan Perubahan"

Form "Ubah Password" (terpisah):
- Password Lama (wajib diisi untuk verifikasi)
- Password Baru (min 8 karakter)
- Konfirmasi Password Baru
- Tombol "Ubah Password"

Validasi: old_password harus cocok dengan hash di DB (Hash::check)

=== PROFIL ADMIN (/admin/profil) ===

Sama dengan profil pelanggan, dengan tambahan:
- Tampilkan badge "Super Administrator" (read-only)
- Tampilkan Status Aktif (read-only)
- Field email tidak dapat diubah (untuk keamanan)
```

---

## PROMPT 11 — UI/UX, LAYOUT & KOMPONEN BLADE

```
Buat layout utama dan komponen Blade yang konsisten untuk seluruh sistem.

=== LAYOUT PELANGGAN (resources/views/layouts/pelanggan.blade.php) ===

Navbar: Logo "Tawang Alun Futsal Arena", menu: Beranda, Jadwal, Reservasi, Riwayat
Navbar kanan: Nama user (dropdown) → Profil, Logout
Warna utama: Hijau (#16a34a) untuk aksi utama pelanggan

Sidebar mobile: hamburger menu, responsive

=== LAYOUT ADMIN (resources/views/layouts/admin.blade.php) ===

Sidebar vertikal: Logo, menu navigasi (Dashboard, Lapangan, Jadwal, Monitoring, Verifikasi, Profil)
Topbar: judul halaman, nama admin, tombol logout
Warna aksen admin: Oranye (#ea580c) untuk membedakan dari portal pelanggan

=== KOMPONEN BLADE ===

Buat komponen reusable di resources/views/components/:

1. <x-alert type="success|error|warning|info" :message="$message" />
   — Alert dengan close button (Alpine.js x-show)

2. <x-badge :status="$status" />
   — Badge status reservasi dengan warna otomatis sesuai enum

3. <x-stat-card title="..." :value="$value" :trend="$trend" icon="..." />
   — Kartu statistik dashboard admin

4. <x-stepper :steps="['Pilih Lapangan','Pilih Waktu','Konfirmasi']" :current="$step" />
   — Stepper indicator untuk alur reservasi

5. <x-slot-button :jadwal="$jadwal" :optimal="$optimal" />
   — Tombol slot waktu dengan warna conditional (optimal/tersedia/dipesan)

6. <x-modal id="..." title="..."> ... </x-modal>
   — Modal dialog dengan overlay (Alpine.js)

=== HALAMAN TAMBAHAN ===
- Beranda (/): hero section, info lapangan, cara reservasi, CTA button
- 404 custom page
- Halaman akses ditolak (403)
```

---

## PROMPT 12 — TESTING & FINALISASI

```
Lakukan pengujian sistem dan finalisasi sebelum deployment.

=== BLACK BOX TESTING ===

Buat test cases menggunakan Laravel Dusk atau manual checklist untuk skenario berikut
(sesuai Tabel 3.4 proposal):

Kategori A — Autentikasi:
- Login valid (pelanggan & admin) → assert redirect ke dashboard yang benar
- Login gagal → assert pesan error muncul
- Role-based access control → pelanggan tidak bisa akses /admin/*
- Register valid → akun tersimpan di DB
- Register email duplikat → assert pesan error

Kategori B — Penjadwalan & Reservasi:
- Tampilkan daftar lapangan aktif
- Filter jadwal by tanggal → tampilkan slot benar
- Greedy Scheduling output → pilih [08:00-10:00, 10:00-12:00, 12:00-14:00] dari 5 input
- Slot bentrok → greedy fallback aktif
- Double booking prevention → transaksi kedua ditolak
- Upload bukti valid → status berubah ke menunggu_verifikasi
- Upload format/ukuran invalid → error ditampilkan

Kategori D — Manajemen Admin:
- CRUD lapangan berfungsi
- Tambah/edit/hapus slot jadwal
- Validasi slot bentrok aktif

Kategori E — Verifikasi:
- Konfirmasi pembayaran → status berubah, slot dikunci
- Tolak pembayaran → slot kembali tersedia

=== PENGUJIAN GREEDY SCHEDULING ===

Jalankan: php artisan test --filter GreedySchedulingTest

Verifikasi 3 skenario:
1. Konsistensi pengurutan EFTF (input acak → output terurut berdasarkan finish time)
2. Conflict resolution optimal: dari R1-R5 → terpilih R1, R3, R5 (3 slot tanpa konflik)
3. Efisiensi: proses 100 slot selesai < 100ms

=== OPTIMASI & KEAMANAN ===

1. Tambahkan database index:
   - jadwals (lapangan_id, tanggal, status)
   - reservasis (user_id, status)
   - reservasis (jadwal_id) — untuk cek ketersediaan cepat

2. Keamanan:
   - CSRF protection aktif di semua form
   - Validasi file upload (MIME type + ukuran)
   - Route model binding dengan policy (user hanya lihat reservasi sendiri)
   - Admin routes dilindungi middleware

3. Storage:
   - `php artisan storage:link` untuk akses file publik
   - File bukti bayar disimpan di storage/app/public/bukti_pembayaran/{tahun}/{bulan}/

=== DEPLOYMENT CHECKLIST ===
- [ ] .env production: APP_ENV=production, APP_DEBUG=false
- [ ] `php artisan config:cache && php artisan route:cache`
- [ ] `php artisan migrate --force`
- [ ] `php artisan db:seed --class=ProductionSeeder` (admin + lapangan awal)
- [ ] Pastikan storage:link aktif
- [ ] Set file permission: storage/ dan bootstrap/cache/ → 775
```

---

## RINGKASAN URUTAN EKSEKUSI PROMPT

| No | Prompt | Output |
|----|--------|--------|
| 1 | Setup Project & Database | Struktur folder + migrasi + seeder |
| 2 | Model, Relasi & Middleware | Eloquent models + auth middleware |
| 3 | Algoritma Greedy Scheduling | GreedySchedulingService + unit test |
| 4 | Autentikasi | Register, Login pelanggan & admin |
| 5 | Modul Lapangan & Jadwal Admin | CRUD lapangan + manajemen slot |
| 6 | Alur Reservasi Multi-Step | Step 1-3 + integrasi greedy |
| 7 | Upload Bukti & Riwayat | Upload pembayaran + riwayat pelanggan |
| 8 | Dashboard & Monitoring Admin | Statistik + monitoring reservasi |
| 9 | Verifikasi Pembayaran Admin | Konfirmasi/tolak dengan dua panel |
| 10 | Jadwal & Profil Pengguna | Lihat jadwal + edit profil |
| 11 | UI/UX Layout & Komponen Blade | Layout + komponen reusable |
| 12 | Testing & Finalisasi | Black box test + optimasi + deploy |

---

*Prompt ini dibuat berdasarkan Proposal Skripsi: "Rancang Bangun Sistem Reservasi Lapangan Olahraga di Kota Kendari Berbasis Web dengan Penjadwalan Otomatis Menggunakan Algoritma Greedy Scheduling" — La Ode Pali Aqsan (E1E122106), Universitas Halu Oleo, 2026.*
