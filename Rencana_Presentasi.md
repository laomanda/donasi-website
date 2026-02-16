# Rencana Presentasi: Platform Djalaludin Pane Foundation (DPF)

## 🎯 Tujuan

Menunjukkan kesiapan platform, fitur keamanan yang kuat, dan pengalaman pengguna yang premium kepada Direktur.

## 👥 Audiens

Direktur Yayasan (Fokus: Strategis, Hasil, dan Citra)

## 🗣️ Poin Bicara Utama (Key Talking Points)

### 📊 Perbandingan: Legacy Website vs. New Modern Platform

| Fitur            | Website Lama (dpf.or.id)                                                | Platform Baru (Modern)                                                                       |
| :--------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Donasi**       | **Manual/Transfer**: Harus konfirmasi manual via WA. Rawan human error. | **Otomatis (Midtrans)**: Support QRIS, E-Wallet, VA. Status donasi update real-time.         |
| **Kecepatan**    | **Lambat (MPA)**: Setiap klik menu harus loading ulang seluruh halaman. | **Instan (SPA)**: Pindah halaman tanpa loading (teknologi React.js). Sangat cepat.           |
| **Layanan**      | **Informasi Pasif**: Hanya menampilkan teks nomor telepon/alamat.       | **Interaktif**: Ada form jemput wakaf & konsultasi yang langsung masuk ke dashboard Admin.   |
| **Transparansi** | **Statis**: Laporan donasi harus diinput manual satu-satu.              | **Real-Time**: Progress bar donasi dan daftar donatur otomatis terupdate saat ada transaksi. |
| **Keamanan**     | **Standar CMS**: Rawan terhadap serangan injeksi umum.                  | **Enterprise Security**: Proteksi berlapis (Anti-XSS, Sanctum Auth) standar startup unicorn. |

### 📊 Perbandingan Teknis: Mengapa Pindah dari WordPress?

Direktur mungkin bertanya: _"Kenapa harus repot bikin baru pakai Coding (Laravel/React)? Kenapa tidak pakai WordPress saja?"_

| Aspek            | WordPress (Lama)                                                                                                                                    | Laravel + React (Baru)                                                                                                                     |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **Ibarat Rumah** | **Rumah Kontrakan/Renovasi**: Kita hanya bisa menata ulang perabot. Fondasi tidak bisa diubah seenaknya. Banyak fitur tidak perlu yang memberatkan. | **Bangun Rumah Sendiri (Arsitek)**: Setiap inci ruangan didesain sesuai kebutuhan spesifik yayasan. Tidak ada "ruang kosong" yang mubazir. |
| **Kecepatan**    | **Reload Terus**: Setiap klik menu, layar putih dulu (loading). Server berat karena me-load ratusan plugin.                                         | **Aplikasi Kilat**: Teknologi React membuat website terasa seperti aplikasi HP (tanpa loading). User experience sangat mulus.              |
| **Keamanan**     | **Target Hacker**: WordPress adalah CMS paling banyak di-hack di dunia. Satu plugin bolong, seluruh web kena.                                       | **Benteng Besi**: Laravel memiliki proteksi bawaan (CSRF, SQL Injection). React menyulitkan hacker menyisipkan skrip (XSS).                |
| **Skalabilitas** | **Mentok**: Susah dikembangkan jika mau fitur aneh-aneh (misal: integrasi Bank/Akuntansi custom).                                                   | **Tanpa Batas**: Bisa disambungkan ke mana saja (Mobile App, Payment Gateway, Sistem HR), karena kita pegang "kuncinya".                   |
| **Aset**         | **Ketergantungan**: Sangat bergantung pada update plugin pihak ketiga.                                                                              | **Aset Intelektual**: Source code ini adalah milik penuh yayasan, bernilai investasi tinggi.                                               |

### 1. 🛡️ Keamanan Prioritas Utama (The Trust Factor)

- **Masalah**: Aplikasi web rentan terhadap serangan hacker (seperti inject script/virus).
- **Solusi**: Kita telah menerapkan **Keamanan Standar Enterprise**.
  - **Anti-XSS**: Menggunakan sistem `dompurify` untuk menyaring semua konten yang masuk. Aman dari script jahat.
  - **Akses Terkontrol**: Sistem Role-Based (SuperAdmin, Admin, Editor) memastikan data sensitif hanya bisa diakses orang yang tepat.
  - **Audit Ready**: Telah lolos audit keamanan menyeluruh (API Backend, Upload File, Data User).

### 2. 💎 "Luxury" User Experience (The Wow Factor)

- **Tujuan**: Membuat dashboard yang terasa mahal, profesional, dan tidak membosankan.
- **Elemen Desain**:
  - **White & Clean**: Meninggalkan kesan gelap/kaku, beralih ke estetika "Executive White" yang bersih.
  - **Dotted Patterns**: Tekstur titik halus di background untuk memberikan kedalaman visual yang elegan.
  - **Dynamic Card Sizing**: Layout kartu pintar yang bisa menampung angka donasi miliaran rupiah tanpa berantakan.
  - **Responsif**: Tampilan tetap sempurna baik di Laptop direksi maupun di Tablet/HP.

### 3. 🚀 Keunggulan Teknis (The Reliability Factor)

- **Arsitektur Clean Code**: Codingan rapi dan terstruktur, menjamin aplikasi mudah dirawat jangka panjang.
- **Performa Tinggi**: Fitur pagination ("Load More") membuat aplikasi tetap ringan meski data ribuan.
- **Siap Produksi (Production Ready)**: Halaman Error (404, 500) sudah didesain ramah user, bukan pesan error server yang menakutkan.

## 🎬 Skenario Demo untuk Direktur (Recommended Flow)

**Durasi Estimasi:** 10-15 Menit
**Fokus:** Kualitas Visual (Luxury), Keamanan (Security), dan Kesiapan Sistem (Readiness).

### 1. Kesan Pertama (Landing Page)

- **Mulai di:** `/` (Halaman Depan)
- **Aksi:** Scroll perlahan dari atas ke bawah.
- **Narasi:** "Ini adalah wajah baru yayasan kita, Pak. Desainnya bersih, modern, dan sangat responsif. Tidak ada lagi desain kaku; semuanya _fluid_ dan mencerminkan profesionalisme yayasan."
- **Highlight:** Banner Slider, Navigasi yang halus, dan Footer yang informatif.

#### 2. 🔐 Isu Sensitif: Privasi & Keberlanjutan (Legacy Plan)

Bagian ini untuk menjawab pertanyaan sulit dari Direktur/Auditor.

#### A. "Siapa yang bisa lihat data donatur? Aman nggak?" (Data Privacy)

**Jawaban Strategis:**
_"Kami menerapkan sistem **Role-Based Access Control (RBAC)** yang ketat, Bapak/Ibu."_

- **Analogi "Kasir vs Manajer"**:
  - **Admin Biasa**: Hanya bisa memproses data yang masuk (input). Tidak bisa menghapus sembarangan atau melihat data sensitif keseluruhan.
  - **Super Admin (Direktur)**: Pemegang kunci utama. Hanya level ini yang bisa melihat rekapitulasi total.
- **Keamanan Database**: Password akun tidak disimpan mentah (plain text), tapi di-enkripsi (Bcrypt). Bahkan programmer pun tidak bisa membacanya.
- **Jejak**: Di sistem baru, setiap pintu (API) dijaga oleh "Satpam Digital" (Middleware Sanctum). Di WordPress lama, pintu sering terbuka lebar jika lupa update plugin.

#### B. "Kalau kamu lulus/pergi, siapa yang urus web ini?" (Vendor Lock-in/Sustainability)

**Jawaban Strategis:**
_"Justru karena itu saya pakai **Standar Industri (Laravel & React)**, bukan kodingan asal-asalan."_

- **Bukan "Kode Ajaib"**: Saya tidak membuat bahasa sendiri. Laravel dan React adalah teknologi terpopuler di dunia saat ini.
- **Mudah Digantikan**: Jika nanti saya lulus, Yayasan tinggal cari programmer web mana saja. Asal dia mengerti standar modern (yang diajarkan di hampir semua kampus IT sekarang), dia bisa langsung melanjutkan pekerjaan ini dalam hitungan jam.
- **Dokumentasi**: Kode ini sudah saya rapikan strukturnya. Folder `Backend` dan `Frontend` terpisah jelas. Beda dengan WordPress yang file-nya campur aduk dengan core system yang rumit.
- **Kesimpulan**: Aset ini **Liquid** (mudah diteruskan), tidak mati bergantung pada satu orang.

## 📱 Alur Demo Presentasi (Live Demo Flow)

### 1. Alur Donatur (Donation Flow)

- **Ke:** `/program` -> Pilih satu program -> Klik "Donasi Sekarang".
- **Aksi:** Tunjukkan halaman detail program (`ProgramDetailPage`).
- **Highlight:**
  - "Informasi program tersaji sangat rapi. Progress bar ini transparansi visual."
  - "Daftar donatur (jika ada) membangun kepercayaan publik."
  - "Tombol Share WhatsApp ini krusial untuk viralitas program."

### 3. Faktor "Wow" (Super Admin Dashboard)

- **Ke:** `/login` -> Login sebagai SuperAdmin.
- **Aksi:** Masuk ke `/superadmin/dashboard`.
- **LANGKAH KRUSIAL:** Hover mouse di atas kartu-kartu statistik.
- **Narasi:** "Ini adalah dapur pacu kita. Kami meredesain dashboard ini dengan konsep **'Executive Luxury Dashboard'**."
  - **Visual**: "Perhatikan background pattern titik-titik halus ini. Memberikan kesan premium dan tidak membuat mata lelah."
  - **Data**: "Kartu ini cerdas. Walaupun donasi tembus miliaran, tampilannya tetap rapi."
  - **Kontrol**: "Dari sini, Bapak bisa memantau seluruh denyut nadi yayasan secara _real-time_."

### 4. Demonstrasi Keamanan & Delegasi (Editor & Preview)

- **Strategi:** Tunjukkan ini untuk membuktikan bahwa **staf/bawahan dapat bekerja dengan mudah** tanpa merusak website.
- **Ke:** `/editor/articles/create` (atau edit artikel yang ada).
- **Aksi:** Ketik judul/isi sembarang, lalu klik "Preview".
- **Highlight (Poin Keamanan):**
  - "Satu hal paling penting: Keamanan. Kami baru saja selesai audit total."
  - "Sistem ini sudah **Anti-Hacker**. Jika ada penyusup mencoba memasukkan virus lewat artikel, sistem otomatis memblokirnya."
  - "Preview page persis seperti apa yang akan dilihat user."

### 5. Operasional & Keuangan (Peran Admin)

- **Tujuan:** Menunjukkan bagaimana yayasan menangani "Uang Masuk" dan "Permintaan Layanan" secara teknis.
- **Ke:** `/login` (Login sebagai Admin) -> `/admin/donations` atau `/admin/pickup-requests`.
- **Narasi:** "Sementara SuperAdmin melihat _Big Picture_, Admin inilah yang bekerja di lapangan."
  - **Donasi:** "Setiap rupiah yang masuk diverifikasi di sini. Ada bukti transfer, tanggal, dan status."
  - **Layanan:** "Permintaan Jemput Wakaf dan Konsultasi masuk ke sini. Admin tinggal proses, jadi tidak ada request donatur yang terlewat."
  - **Poin Plus:** "Ini memisahkan tugas Strategis (Direktur) dan Teknis (Admin)."

### 6. Kesiapan Sistem (System Readiness)

- **Aksi:** (Opsional) Tunjukkan halaman 404 dengan mengetik URL asal (misal: `/superadmin/salah-alamat`).
- **Narasi:** "Bahkan jika user tersesat, kita tidak menampilkan error server yang menakutkan. Kita punya halaman error yang ramah. Ini standar aplikasi kelas dunia."
- **Penutup:** "Secara teknis, sistem ini sudah **Siap Tayang (Go Live)**. Aman, Elegan, dan Lengkap."

### 7. Penutup & Masa Depan (The Vision)

- **Tujuan:** Menunjukkan bahwa sistem ini adalah _Investasi Jangka Panjang_, bukan sekadar proyek sekali jalan.
- **Narasi:**
  - **Scalability:** "Sistem ini dibangun dengan fondasi teknologi terbaru (Laravel & React). Mampu menangani lonjakan data donasi hingga ribuan transaksi tanpa melambat."
  - **Integrasi:** "Kedepan, kita bisa sambungkan ini langsung ke sistem akuntansi atau Payment Gateway otomatis."
  - **Closing Statement:** "Pak Direktur, secara sistem kita sudah 100% siap. Keamanan sudah diaudit, fitur sudah lengkap, dan tampilan sudah standar eksekutif."
  - **Call to Action:** "Apakah kita bisa jadwalkan waktu untuk _Go Live_ (peluncuran resmi) minggu ini?"

## ❓ Persiapan Tanya Jawab (Q&A)

1.  **"Apakah ini aman dari peretas?"**
    - _Jawab:_ "Sangat aman, Pak. Kita sudah audit 3 lapis keamanan: Backend, Frontend, dan File Upload. Celah umum seperti XSS sudah ditutup total dengan teknologi terbaru."
2.  **"Apakah servernya kuat menampung banyak data?"**
    - _Jawab:_ "Kodingannya sudah dioptimasi. Asal server hostingnya standar enterprise, aplikasi ini sangat ringan dan cepat."
3.  **"Kenapa tampilannya putih/bersih begini? Tidak terlalu sepi?"**
    - _Jawab:_ "Ini tren desain 'Modern Minimalist' yang dipakai startup besar (Unicorn). Putih memberikan kesan transparan, jujur, dan 'mahal'. Fokus mata jadi langsung ke konten/data, bukan ke hiasan."
