# cPanel Production Deployment

Target utama project ini adalah satu domain:

- Website: `https://laznasdpf.org`
- API: `https://laznasdpf.org/api/v1`
- Storage public: `https://laznasdpf.org/storage`

## Struktur Folder Yang Disarankan

Gunakan document root domain ke folder `public` Laravel.

```txt
/home/u1121903/
  dpf/
    app/
    bootstrap/
    config/
    database/
    frontend-dpf/
      dist/
    public/              <- document root domain
    resources/
    routes/
    storage/
    vendor/
    .env
```

Jika cPanel tidak mengizinkan document root ke `dpf/public`, upload isi folder `public` ke `public_html`, lalu sesuaikan path di `index.php`. Pilihan document root ke `dpf/public` lebih rapi dan lebih aman.

## Build Lokal Sebelum Upload

```bash
composer install --no-dev --optimize-autoloader
cd frontend-dpf
npm ci
npm run build
cd ..
php artisan test
```

Folder `frontend-dpf/dist` harus ikut terupload karena `routes/web.php` melayani React build dari sana.

## Setup Di cPanel

1. Buat database MySQL dan user database.
2. Upload project ke `/home/u1121903/dpf`.
3. Copy `deployment/cpanel/env.production.example` menjadi `.env`.
4. Copy `frontend-dpf/.env.production.example` menjadi `frontend-dpf/.env.production` sebelum build production.
5. Isi `APP_KEY`, credential database, mail, dan Midtrans.
6. Pastikan document root domain mengarah ke `/home/u1121903/dpf/public`.

## Command Production

Jalankan dari folder project:

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Jika hosting tidak menyediakan SSH, jalankan command lewat Terminal cPanel. Jika Terminal tidak tersedia, deployment perlu dilakukan manual dengan bantuan fitur cron/temporary route, tapi itu bukan opsi utama.

## Cron Queue

Karena `QUEUE_CONNECTION=database`, tambahkan cron berikut jika tidak ada worker permanen:

```bash
* * * * * cd /home/u1121903/dpf && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home/u1121903/dpf && php artisan queue:work --stop-when-empty --tries=3 >> /dev/null 2>&1
```

## Checklist Setelah Online

- Buka `https://laznasdpf.org`.
- Cek `https://laznasdpf.org/api/v1/ping`.
- Login superadmin, admin, editor, dan mitra.
- Cek upload gambar dan akses `/storage`.
- Cek halaman program, literasi, donasi, konfirmasi donasi, konsultasi, dan jemput wakaf.
- Cek export PDF/Excel.
- Cek Midtrans production key dan webhook `https://laznasdpf.org/api/v1/midtrans/webhook`.
