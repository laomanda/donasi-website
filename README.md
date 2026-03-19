# DPF - Platform Donasi & Wakaf

Platform pengelolaan donasi, wakaf, dan penyaluran dana untuk Yayasan DPF. Dibangun menggunakan Laravel (Backend) dan React + Vite (Frontend).

## Persyaratan Sistem
- PHP >= 8.2
- Node.js >= 18
- MySQL/MariaDB
- Composer

## Instalasi Lokal (Laravel)
1. Clone repositori.
2. Jalankan `composer install`.
3. Copy `.env.example` ke `.env`.
4. Jalankan `php artisan key:generate`.
5. Konfigurasi Database di `.env`.
6. Jalankan `php artisan migrate --seed`.

## Pengembangan Frontend
1. Masuk ke folder `frontend-dpf`.
2. Jalankan `npm install`.
3. Jalankan `npm run dev`.

## Panduan Deployment (VPS/Hostinger)
Silakan merujuk ke dokumen berikut untuk detail produksi:
- [Instruksi Production .env](file:///C:/Users/jakkob/.gemini/antigravity/brain/6288191f-1b90-4198-a721-cec6f2c64924/env_production_guide.md)
- [Deployment Roadmap](file:///C:/Users/jakkob/.gemini/antigravity/brain/6288191f-1b90-4198-a721-cec6f2c64924/deployment_roadmap.md)

### Langkah Cepat Deployment:
1. Jalankan `./deploy.sh` di server untuk pull data dan build otomatis.
2. Pastikan `VITE_API_URL` di frontend sudah mengarah ke domain backend Anda.
3. Gunakan Nginx untuk serve folder `frontend-dpf/dist` dan arahkan `/api` ke Laravel.

## Lisensi
Proyek ini dikembangkan secara berkelanjutan untuk kebutuhan internal Yayasan DPF.
