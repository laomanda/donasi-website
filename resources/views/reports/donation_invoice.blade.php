<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Tanda Terima Donasi - {{ $donation->donation_code }}</title>
    <style>
        /* Pengaturan Dasar & Halaman */
        @page { 
            margin: 1cm; 
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #334155;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Formal */
        .kop-table {
            width: 100%;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .kop-logo {
            width: 70px;
            vertical-align: middle;
        }
        .kop-logo img {
            width: 65px;
            height: auto;
        }
        .kop-detail {
            padding-left: 15px;
            vertical-align: middle;
        }
        .kop-detail h1 {
            margin: 0;
            font-size: 18px;
            color: #0f172a;
            text-transform: uppercase;
        }
        .kop-detail p {
            margin: 2px 0;
            font-size: 9px;
            color: #64748b;
        }
        .kop-document {
            text-align: right;
            vertical-align: middle;
        }
        .kop-document h2 {
            margin: 0;
            font-size: 20px;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .kop-document p {
            margin: 0;
            font-size: 10px;
            font-weight: bold;
            color: #475569;
        }

        /* Informasi Transaksi */
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .meta-table td {
            vertical-align: top;
            padding: 5px 0;
        }
        .label {
            font-size: 9px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .value {
            font-size: 11px;
            font-weight: 600;
            color: #1e293b;
        }

        /* Status Badge (Paid Stamp Look) */
        .status-badge {
            display: inline-block;
            padding: 6px 15px;
            border: 3px double #059669;
            color: #059669;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 14px;
            transform: rotate(-5deg);
            opacity: 0.8;
            text-align: center;
        }

        /* Kuintansi Body (Kotak Nominal) */
        .receipt-body {
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 8px;
        }
        .amount-big {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
        }
        .terbilang {
            font-style: italic;
            background: #ffffff;
            padding: 10px;
            border: 1px dashed #cbd5e1;
            margin-top: 10px;
            font-size: 11px;
            color: #475569;
        }

        /* Tabel Detail Program */
        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .table-items th {
            background: #1e293b;
            color: #ffffff;
            text-align: left;
            padding: 10px;
            font-size: 10px;
            text-transform: uppercase;
        }
        .table-items td {
            padding: 12px 10px;
            border-bottom: 1px solid #e2e8f0;
        }

        /* Bagian Tanda Tangan */
        .signature-section {
            width: 100%;
            margin-top: 30px;
        }
        .signature-box {
            width: 200px;
            text-align: center;
        }
        .signature-space {
            height: 60px;
        }

        /* Footer */
        .footer-note {
            margin-top: 50px;
            padding-top: 10px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
        }
        .text-right { text-align: right; }
        .text-bold { font-weight: bold; }
    </style>
</head>
<body>

    {{-- ═══════════ KOP SURAT ═══════════ --}}
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                <img src="{{ public_path('brand/dpf-wakaf.png') }}" alt="Logo DPF">
            </td>
            <td class="kop-detail">
                <h1>Djalaluddin Pane Foundation</h1>
                <p>Signature Park Grande, Jl. Letjen M.T. Haryono No.Kav. 20, Jakarta Timur.</p>
                <p>Telp: 0813-1176-8254 | Email: layanan@dpf.or.id | Website: www.dpf.or.id</p>
            </td>
            <td class="kop-document">
                <h2>{{ __('reports.receipt_title') }}</h2>
                <p>No: {{ $donation->donation_code }}</p>
            </td>
        </tr>
    </table>

    {{-- ═══════════ INFORMASI TRANSAKSI ═══════════ --}}
    <table class="meta-table">
        <tr>
            <td width="40%">
                <div class="label">{{ __('reports.received_from') }}</div>
                <div class="value" style="font-size: 13px;">{{ $donation->donor_name ?: __('reports.hamba_allah') }}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
                    Email: {{ $donation->donor_email ?: '-' }}<br>
                    Telp: {{ $donation->donor_phone ?: '-' }}
                </div>
            </td>
            <td width="35%">
                <div class="label">{{ __('reports.donation_date') }}</div>
                <div class="value">{{ \Carbon\Carbon::parse($donation->created_at)->translatedFormat('d F Y') }}</div>
                
                <div class="label" style="margin-top: 10px;">{{ __('reports.method') }}</div>
                <div class="value">{{ $donation->payment_method ?: 'Transfer' }} ({{ ucfirst($donation->payment_source) }})</div>
            </td>
            <td width="25%" class="text-right">
                @if($donation->status === 'paid')
                    <div class="status-badge">{{ __('reports.paid_status') }}</div>
                @else
                    <div class="status-badge" style="border-color: #e67e22; color: #e67e22;">{{ strtoupper($donation->status) }}</div>
                @endif
            </td>
        </tr>
    </table>

    {{-- ═══════════ RINGKASAN PEMBAYARAN ═══════════ --}}
    <div class="receipt-body">
        <div class="label">{{ __('reports.received_amount') }}</div>
        <div class="amount-big">Rp {{ number_format($donation->amount, 0, ',', '.') }}</div>
        
        <div class="terbilang">
            <strong>Terbilang:</strong> 
            @if(App::getLocale() === 'id')
               "# {{ \App\Helpers\Terbilang::make($donation->amount) }} Rupiah #"
            @else
               "# {{ ucwords((new \NumberFormatter('en', \NumberFormatter::SPELLOUT))->format($donation->amount)) }} Dollars #"
            @endif
        </div>
    </div>

    {{-- ═══════════ DETAIL PROGRAM ═══════════ --}}
    <table class="table-items">
        <thead>
            <tr>
                <th>{{ __('reports.program_description') }}</th>
                <th class="text-right" style="width: 30%;">{{ __('reports.subtotal') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="text-bold" style="font-size: 12px;">{{ $donation->program ? $donation->program->title : __('reports.general_dana') }}</div>
                    @if($donation->notes)
                        <div style="font-size: 9px; color: #64748b; margin-top: 4px;"><strong>Catatan:</strong> {{ $donation->notes }}</div>
                    @endif
                </td>
                <td class="text-right text-bold" style="font-size: 12px; font-family: 'Courier New', monospace;">
                    Rp {{ number_format($donation->amount, 0, ',', '.') }}
                </td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td class="text-right" style="padding-top: 15px; border: none;"><strong>TOTAL AKHIR</strong></td>
                <td class="text-right" style="padding-top: 15px; border: none;">
                    <span class="amount-big" style="font-size: 18px; color: #1e40af;">Rp {{ number_format($donation->amount, 0, ',', '.') }}</span>
                </td>
            </tr>
        </tfoot>
    </table>

    {{-- ═══════════ PENGESAHAN ═══════════ --}}
    <div class="signature-section">
        <table width="100%">
            <tr>
                <td width="65%"></td>
                <td width="35%">
                    <div class="signature-box">
                        <div class="label">Jakarta, {{ \Carbon\Carbon::parse($donation->paid_at ?: now())->translatedFormat('d F Y') }}</div>
                        <div class="label" style="margin-top: 5px;">{{ __('reports.foundation_treasurer') }},</div>
                        <div class="signature-space">
                            {{-- Ruang untuk stempel digital atau tanda tangan --}}
                        </div>
                        <div class="value" style="text-decoration: underline;">Sistem Keuangan DPF</div>
                        <div style="font-size: 8px; color: #94a3b8; margin-top: 2px;">{{ __('reports.automation_note') }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- ═══════════ FOOTER ═══════════ --}}
    <div class="footer-note">
        <p>{{ __('reports.thanks_note') }}</p>
        <p style="font-weight: bold; color: #1e293b;">Djalaluddin Pane Foundation - www.dpf.or.id</p>
        <p style="font-size: 7px;">Ref ID: {{ md5($donation->donation_code) }} | Dicetak pada: {{ now()->translatedFormat('d/m/Y H:i') }} WIB</p>
    </div>

</body>
</html>