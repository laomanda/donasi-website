# 📝 Latar Belakang & Rumusan Masalah (Untuk Laporan PKL/Skripsi)

Dokumen ini berisi poin-poin akademis/formal yang bisa Anda gunakan untuk Bab 1 Laporan PKL.

---

## A. Identifikasi Masalah (Kondisi Website Lama/WordPress)

Sebelum membangun sistem baru (Laravel + React), ditemukan beberapa kendala pada website lama Djalaludin Pane Foundation (DPF):

1.  **Inefisiensi Alur Donasi (Manual Process)**:
    - Sistem lama mengharuskan donatur melakukan transfer bank manual lalu konfirmasi via WhatsApp.
    - Proses verifikasi oleh admin memakan waktu dan rentan kesalahan pencatatan (_human error_).
2.  **Keterbatasan User Experience (UX)**:
    - Website lama berbasis CMS standar yang kurang responsif (loading setiap pindah halaman/MPA).
    - Tampilan visual kurang merepresentasikan citra profesional yayasan ("Luxury" & Modern).
3.  **Kurangnya Transparencies Real-Time**:
    - Laporan donasi tidak terupdate secara _real-time_. Admin harus merekap ulang data manual ke website, sehingga donatur tidak langsung melihat dampak donasinya.
4.  **Keamanan & Skalabilitas (Security Issues)**:
    - CMS _Open Source_ (WordPress) tanpa kustomisasi keamanan mendalam rentan terhadap serangan siber.
    - Sulit dikembangkan lebih lanjut (skalabilitas terbatas) untuk fitur kompleks seperti Payment Gateway otomatis.

---

## B. Rumusan Masalah

Berdasarkan latar belakang di atas, maka rumusan masalah dalam pengembangan sistem ini adalah:

1.  **Efisiensi Donasi**:
    - _"Bagaimana merancang sistem donasi yang terintegrasi pengelola pembayaran otomatis (Payment Gateway) guna meminimalisir intervensi manual admin?"_
2.  **Modernisasi Platform**:
    - _"Bagaimana membangun antarmuka web (UI/UX) berbasis Single Page Application (SPA) yang responsif dan modern untuk meningkatkan kepercayaan donatur?"_
3.  **Transparansi Data**:
    - _"Bagaimana mengimplementasikan fitur pelaporan donasi real-time yang dapat diakses publik secara transparan dan akurat?"_
4.  **Keamanan Sistem**:
    - _"Bagaimana menerapkan standar keamanan data (Role-Based Access Control & Anti-XSS) pada arsitektur website yayasan untuk melindungi privasi donatur?"_

---

## C. Tujuan Pengembangan

1.  Membangun sistem informasi donasi yang **otomatis, cepat, dan transparan**.
2.  Meningkatkan citra digital Djalaludin Pane Foundation melalui **redesign UI/UX modern**.
3.  Mengamankan data yayasan dan donatur dengan **teknologi framework enterprise (Laravel & React)**.
