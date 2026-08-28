<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Sedang Ditingkatkan (503) - Djalaludin Pane Foundation</title>
    <link rel="icon" type="image/webp" href="/brand/dpf-wakaf.webp">
    <link rel="icon" type="image/png" href="/brand/dpf-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }

        /* Ambient Glow Blurs (Exact match to ErrorLayout.tsx) */
        .ambient-wrap {
            pointer-events: none;
            position: absolute;
            inset: 0;
            z-index: 0;
            overflow: hidden;
        }
        .glow-top {
            position: absolute;
            top: -8rem;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 500px;
            border-radius: 9999px;
            background: linear-gradient(to bottom, rgba(189, 228, 189, 0.4), #ffffff, #ffffff);
            filter: blur(48px);
            opacity: 0.8;
        }
        .glow-bottom-left {
            position: absolute;
            bottom: -12rem;
            left: -8rem;
            width: 450px;
            height: 450px;
            border-radius: 9999px;
            background-color: rgba(225, 244, 225, 0.6);
            filter: blur(80px);
        }
        .glow-bottom-right {
            position: absolute;
            bottom: -12rem;
            right: -8rem;
            width: 400px;
            height: 400px;
            border-radius: 9999px;
            background-color: rgba(239, 246, 255, 0.5);
            filter: blur(80px);
        }

        /* Main Container */
        .main-content {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 42rem; /* max-w-2xl */
            margin: 0 auto;
        }

        /* Card Container (Exact Tailwind radius & soft shadow) */
        .card {
            border-radius: 1.2rem; /* rounded-2xl */
            border: 1px solid rgba(241, 245, 249, 0.8);
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            overflow: hidden;
            animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Card Header */
        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #f1f5f9;
            background-color: rgba(255, 255, 255, 0.6);
            padding: 0.75rem 1.25rem;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .icon-wrap {
            display: flex;
            height: 2.25rem;
            width: 2.25rem;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            background-color: #f3faf3;
            box-shadow: 0 0 0 1px #e1f4e1;
            color: #295a29;
        }
        .icon-wrap svg {
            width: 1rem;
            height: 1rem;
        }
        .header-text p.sub {
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            line-height: 1;
        }
        .header-text p.main {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e293b;
            margin-top: 0.2rem;
            line-height: 1.2;
        }
        .header-right {
            display: flex;
            align-items: center;
            height: 2rem;
        }
        .header-right img {
            height: 100%;
            width: auto;
            object-fit: contain;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05));
        }

        /* Card Body */
        .card-body {
            padding: 1.5rem;
            text-align: center;
        }
        @media (min-width: 640px) {
            .card-body {
                padding: 2rem;
            }
        }

        .pill-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            border-radius: 9999px;
            padding: 0.125rem 0.625rem;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            background-color: #f3faf3;
            color: #295a29;
            box-shadow: 0 0 0 1px #e1f4e1;
        }

        h1 {
            margin-top: 0.75rem;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
        }
        @media (min-width: 640px) {
            h1 {
                font-size: 1.5rem;
            }
        }

        p.description {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            line-height: 1.625;
            color: #475569;
            max-width: 32rem;
            margin-left: auto;
            margin-right: auto;
        }
        @media (min-width: 640px) {
            p.description {
                font-size: 15px;
            }
        }

        p.suggestion {
            margin-top: 0.25rem;
            font-size: 0.75rem;
            color: #94a3b8;
        }

        /* Action Buttons */
        .btn-group {
            margin-top: 1.25rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.75rem;
        }
        @media (min-width: 640px) {
            .btn-group {
                flex-direction: row;
            }
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            padding: 0.5rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.15s ease;
            cursor: pointer;
        }
        .btn:active {
            transform: scale(0.95);
        }

        .btn-primary {
            background-color: #347334; /* brandGreen-600 */
            color: #ffffff;
            border: 1px solid transparent;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .btn-primary:hover {
            background-color: #295a29; /* brandGreen-700 */
        }

        .btn-secondary {
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            color: #334155;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .btn-secondary:hover {
            background-color: #f8fafc;
            color: #0f172a;
        }

        .btn svg {
            margin-right: 0.5rem;
            width: 0.875rem;
            height: 0.875rem;
        }

        /* Troubleshooting Box */
        .troubleshoot-box {
            margin-top: 1.5rem;
            width: 100%;
            border-radius: 0.9rem; /* rounded-xl */
            border: 1px solid #f1f5f9;
            background-color: rgba(248, 250, 252, 0.8);
            padding: 0.875rem;
            text-align: left;
        }
        .troubleshoot-title {
            margin-bottom: 0.5rem;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            color: #64748b;
        }
        .troubleshoot-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
            font-size: 0.75rem;
            color: #475569;
        }
        .troubleshoot-list li {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
        }
        .dot {
            margin-top: 0.375rem;
            height: 0.25rem;
            width: 0.25rem;
            border-radius: 9999px;
            flex-shrink: 0;
        }
        .dot-green {
            background-color: #3f8f3f; /* brandGreen-500 */
        }
        .dot-gray {
            background-color: #94a3b8;
        }

        /* Card Footer */
        .card-footer {
            border-top: 1px solid #f1f5f9;
            background-color: rgba(248, 250, 252, 0.5);
            padding: 0.75rem 1.5rem;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .footer-text {
            font-size: 10px;
            color: #94a3b8;
        }
        .secret-link {
            font-size: 10px;
            color: #64748b;
            text-decoration: none;
            transition: color 0.15s;
        }
        .secret-link:hover {
            color: #347334;
        }
    </style>
</head>
<body>
    <div class="ambient-wrap">
        <div class="glow-top"></div>
        <div class="glow-bottom-left"></div>
        <div class="glow-bottom-right"></div>
    </div>

    <main class="main-content">
        <div class="card">
            <!-- Header (Exact match with ErrorLayout.tsx) -->
            <div class="card-header">
                <div class="header-left">
                    <div class="icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5a2.25 2.25 0 0 0-2.25 2.25v1.5a2.25 2.25 0 0 0 2.25 2.25h1.409l4.5 4.5Z" />
                        </svg>
                    </div>
                    <div class="header-text">
                        <p class="sub">Pusat Bantuan</p>
                        <p class="main">Sistem Pemeliharaan</p>
                    </div>
                </div>
                <div class="header-right">
                    <img src="data:image/png;base64,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" alt="Logo DPF" />
                </div>
            </div>

            <!-- Body -->
            <div class="card-body">
                <div class="pill-badge">
                    <span>Kesalahan:</span>
                    <span>503</span>
                </div>

                <h1>Sistem Sedang Ditingkatkan</h1>

                <p class="description">
                    Layanan website DPF sedang dalam pemeliharaan rutin untuk meningkatkan performa, kecepatan, dan keamanan donasi Anda.
                </p>

                <p class="suggestion">
                    Kembali beberapa saat lagi atau hubungi admin jika butuh bantuan mendesak.
                </p>

                <!-- Actions -->
                <div class="btn-group">
                    <a href="https://wa.me/6285195542022?text=Halo%20Admin%20DPF,%20saya%20ingin%20berdonasi%20/%20konfirmasi%20program%20wakaf." target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.364 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.099-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                        WhatsApp Admin
                    </a>

                    <button type="button" onclick="window.location.reload();" class="btn btn-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Muat Ulang Halaman
                    </button>
                </div>

                <!-- Troubleshooting Info (Exact match to ErrorLayout.tsx) -->
                <div class="troubleshoot-box">
                    <p class="troubleshoot-title">Pemecahan masalah</p>
                    <ul class="troubleshoot-list">
                        <li>
                            <span class="dot dot-green"></span>
                            <span>Muat ulang halaman atau periksa koneksi internet Anda.</span>
                        </li>
                        <li>
                            <span class="dot dot-gray"></span>
                            <span>Jika masalah berlanjut, hubungi admin DPF.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Footer -->
            <div class="card-footer">
                <p class="footer-text">Sistem DPF - Keamanan & Pemantauan</p>
                <a href="javascript:void(0)" onclick="promptSecret()" class="secret-link">Akses Admin</a>
            </div>
        </div>
    </main>

    <script>
        function promptSecret() {
            const secret = prompt("Masukkan kode akses rahasia (Secret Token) untuk bypass mode maintenance:");
            if (secret && secret.trim().length > 0) {
                window.location.href = window.location.origin + '/' + encodeURIComponent(secret.trim());
            }
        }
    </script>
</body>
</html>
