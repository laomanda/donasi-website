<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Tanda Terima Donasi - {{ $donation->donation_code }}</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px; /* Reduced font size */
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px; /* Reduced padding */
        }
        
        .header-table {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .org-info h1 {
            margin: 0;
            font-size: 18px; /* Reduced font size */
            text-transform: uppercase;
        }
        .org-info p {
            margin: 0;
            font-size: 9px;
            color: #666;
        }
        .document-type {
            text-align: right;
            vertical-align: bottom;
        }
        .document-type h2 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .meta-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .meta-table td {
            vertical-align: top;
            padding: 2px 0;
        }
        .label {
            font-size: 9px;
            color: #888;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
        }
        .value {
            font-size: 11px;
            font-weight: 600;
        }

        .receipt-body {
            border: 1px solid #ccc;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #fafafa;
        }
        .amount-big { font-size: 18px; font-weight: 800; }
        .terbilang {
            font-style: italic;
            background: #fff;
            padding: 8px;
            border: 1px dashed #ccc;
            margin-top: 8px;
            font-size: 11px;
        }

        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table-items th {
            background: #f0f0f0;
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #000;
            font-size: 10px;
            text-transform: uppercase;
        }
        .table-items td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border: 2px solid #27ae60;
            color: #27ae60;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
            transform: rotate(-5deg);
        }

        .signature-section {
            width: 100%;
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 200px;
            text-align: center;
            float: right;
        }
        .signature-space { height: 60px; }
        
        .footer-note {
            clear: both;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 9px;
            color: #999;
        }

        .text-right { text-align: right; }
        .text-bold { font-weight: bold; }
    </style>
</head>
<body>
    <!-- Header -->
    <table class="header-table">
        <tr>
            <td class="org-info">
                <h1>Djalaludin Pane Foundation</h1>
                <p>Signature Park Grande, Jl. Letjen M.T. Haryono</p>
                <p>Telp: 0813-1176-8254 | Email: layanan@dpf.or.id</p>
            </td>
            <td class="document-type">
                <h2>KUITANSI</h2>
                <div style="font-size: 10px; color: #666;">No: {{ $donation->donation_code }}</div>
            </td>
        </tr>
    </table>

    <!-- Informasi Transaksi -->
    <table class="meta-table">
        <tr>
            <td width="35%">
                <div class="label">Diterima Dari</div>
                <div class="value">{{ $donation->donor_name ?: 'Hamba Allah' }}</div>
                <div style="font-size: 10px; color: #666; margin-top:2px">
                    {{ $donation->donor_email ?: '-' }} <br>
                    {{ $donation->donor_phone ?: '-' }}
                </div>
            </td>
            <td width="35%">
                <div class="label">Tanggal Donasi</div>
                <div class="value">{{ \Carbon\Carbon::parse($donation->created_at)->translatedFormat('d F Y') }}</div>
                
                <div class="label" style="margin-top:8px">Metode</div>
                <div class="value">{{ $donation->payment_method ?: 'Transfer' }} ({{ ucfirst($donation->payment_source) }})</div>
            </td>
            <td width="30%" class="text-right" style="vertical-align: middle;">
                @if($donation->status === 'paid')
                    <div class="status-badge">LUNAS / PAID</div>
                @else
                    <div class="status-badge" style="border-color: #e67e22; color: #e67e22;">{{ strtoupper($donation->status) }}</div>
                @endif
            </td>
        </tr>
    </table>

    <!-- Body / Ringkasan Pembayaran -->
    <div class="receipt-body">
        <table width="100%">
            <tr>
                <td style="vertical-align: middle;">
                    <div class="label">Telah Diterima Sejumlah</div>
                    <div class="amount-big">Rp {{ number_format($donation->amount, 0, ',', '.') }}</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="terbilang">
                        "# {{ \App\Helpers\Terbilang::make($donation->amount) }} Rupiah #"
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Detail Program -->
    <table class="table-items">
        <thead>
            <tr>
                <th>Deskripsi Program / Peruntukan</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="text-bold">{{ $donation->program ? $donation->program->title : 'Donasi Umum' }}</div>
                    @if($donation->notes)
                        <div style="font-size: 10px; color: #777; margin-top: 3px;">Catatan: {{ $donation->notes }}</div>
                    @endif
                </td>
                <td class="text-right text-bold">Rp {{ number_format($donation->amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td class="text-right" style="padding-top: 10px; border: none;"><strong>TOTAL AKHIR</strong></td>
                <td class="text-right" style="padding-top: 10px; border: none;"><span class="amount-big" style="font-size: 16px;">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span></td>
            </tr>
        </tfoot>
    </table>

    <!-- Bagian Pengesahan -->
    <div class="signature-section">
        <table width="100%">
            <tr>
                <td width="60%"></td>
                <td width="40%">
                    <div class="signature-box">
                        <div class="label">Jakarta, {{ \Carbon\Carbon::parse($donation->paid_at ?: now())->translatedFormat('d F Y') }}</div>
                        <div class="label" style="margin-top: 5px;">Bendahara Yayasan,</div>
                        <div class="signature-space">
                            
                        </div>
                        <div class="value" style="text-decoration: underline;">Sistem DPF</div>
                        <div style="font-size: 9px;">Otomatisasi Dokumen</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer-note">
        <p>Terima kasih atas donasi Anda. "Satu Donasi, Berjuta Harapan"</p>
        <p style="font-weight: bold;">www.dpf.or.id</p>
    </div>
</body>
</html>