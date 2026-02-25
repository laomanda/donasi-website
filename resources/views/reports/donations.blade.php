<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Donasi - {{ $generatedAt->format('d/m/Y') }}</title>
    <style>
        /* Pengaturan Halaman */
        @page {
            margin: 1cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #334155;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Formal */
        .kop-table {
            width: 100%;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 10px;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .kop-logo {
            width: 60px;
            vertical-align: middle;
        }
        .kop-logo img {
            width: 55px;
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
            letter-spacing: 0.5px;
        }
        .kop-detail p {
            margin: 2px 0;
            font-size: 8px;
            color: #64748b;
            line-height: 1.2;
        }
        .kop-document {
            text-align: right;
            vertical-align: middle;
        }
        .kop-document h2 {
            margin: 0;
            font-size: 14px;
            color: #2563eb;
            text-transform: uppercase;
        }
        .kop-document p {
            margin: 0;
            font-size: 9px;
            font-weight: bold;
            color: #475569;
        }

        /* Parameter Laporan / Filter */
        .filter-section {
            width: 100%;
            margin-bottom: 15px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 6px;
        }
        .filter-table { width: 100%; border-collapse: collapse; }
        .filter-table td { padding: 2px 5px; font-size: 9px; }
        .label { color: #64748b; font-weight: bold; width: 100px; }

        /* Summary KPI Boxes */
        .summary-container {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .summary-box {
            border: 1px solid #e2e8f0;
            padding: 10px;
            background: #ffffff;
        }
        .summary-lbl {
            display: block;
            font-size: 8px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 3px;
            font-weight: bold;
        }
        .summary-val {
            display: block;
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
        }

        /* Tabel Data Utama */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th {
            background-color: #1e293b;
            color: #ffffff;
            text-align: left;
            padding: 8px;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
            border: 1px solid #1e293b;
        }
        .table td {
            padding: 7px 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 9px;
        }
        .table tr:nth-child(even) { background-color: #f8fafc; }

        /* Badge Status */
        .status-badge {
            font-size: 8px;
            padding: 2px 5px;
            border-radius: 3px;
            background: #e2e8f0;
            color: #475569;
            text-transform: uppercase;
            font-weight: bold;
            border: 1px solid #cbd5e1;
        }

        /* Utilities */
        .right { text-align: right; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .amount { font-family: 'Courier', monospace; font-weight: bold; }

        /* Tanda Tangan */
        .signature-table {
            width: 100%;
            margin-top: 30px;
        }
        .signature-space {
            height: 60px;
        }

        .footer-note {
            margin-top: 30px;
            border-top: 1px solid #f1f5f9;
            padding-top: 5px;
            font-size: 8px;
            color: #94a3b8;
            text-align: right;
        }
    </style>
</head>
<body>

    @php
      $formatCurrency = function ($value) {
          return 'Rp ' . number_format((float)$value, 0, ',', '.');
      };
      $formatDate = function ($value) {
          return $value ? \Carbon\Carbon::parse($value)->translatedFormat('d/m/Y H:i') : '-';
      };
    @endphp

    {{-- ═══════════ KOP SURAT ═══════════ --}}
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                <img src="{{ public_path('brand/dpf-wakaf.png') }}" alt="Logo">
            </td>
            <td class="kop-detail">
                <h1>Djalaluddin Pane Foundation</h1>
                <p>
                    Signature Park Grande, Jl. Letjen M.T. Haryono No.Kav. 20, Cawang, Jakarta Timur.<br>
                    Email: layanan@dpf.or.id | Telp: 0813-1176-8254 | Website: www.dpf.or.id
                </p>
            </td>
            <td class="kop-document">
                <h2>{{ __('reports.donation_report_title') }}</h2>
                <p>No: REG/{{ now()->format('Ymd/His') }}</p>
                <p style="font-weight: normal; font-size: 8px; color: #64748b;">Tgl Cetak: {{ $generatedAt->translatedFormat('d F Y H:i') }}</p>
            </td>
        </tr>
    </table>

    {{-- ═══════════ FILTER LAPORAN ═══════════ --}}
    <div class="filter-section">
        <table class="filter-table">
            <tr>
                <td class="label">{{ __('reports.period') }}</td>
                <td>: {{ $filters['date_from'] ?: __('reports.all') }} {{ __('reports.until') }} {{ $filters['date_to'] ?: __('reports.all') }}</td>
                <td class="label">{{ __('reports.payment_method') }}</td>
                <td>: {{ $filters['payment_source_label'] }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('reports.data_status') }}</td>
                <td>: {{ $filters['status_label'] }}</td>
                <td class="label">User Pelapor</td>
                <td>: {{ auth()->user()->name ?? 'System' }}</td>
            </tr>
        </table>
    </div>

    {{-- ═══════════ SUMMARY KPI ═══════════ --}}
    <table class="summary-container">
        <tr>
            <td class="summary-box" style="width: 20%;">
                <span class="summary-lbl">{{ __('reports.total_transactions') }}</span>
                <span class="summary-val">{{ number_format($summary['total_count'] ?? 0, 0, ',', '.') }}</span>
            </td>
            <td class="summary-box" style="width: 35%; background-color: #f1f5f9;">
                <span class="summary-lbl">{{ __('reports.total_donation_amount') }}</span>
                <span class="summary-val" style="color: #059669; font-size: 15px;">
                    {{ $formatCurrency($summary['total_amount'] ?? 0) }}
                </span>
            </td>
            <td class="summary-box" style="width: 45%;">
                <span class="summary-lbl">Rincian Sumber Dana</span>
                <table style="width: 100%; font-size: 8px;">
                    <tr>
                        <td>{{ __('reports.manual') }}</td>
                        <td class="right"><strong>{{ $formatCurrency($summary['manual_amount'] ?? 0) }}</strong> ({{ $summary['manual_count'] }} trx)</td>
                    </tr>
                    <tr>
                        <td>{{ __('reports.digital') }}</td>
                        <td class="right"><strong>{{ $formatCurrency($summary['midtrans_amount'] ?? 0) }}</strong> ({{ $summary['midtrans_count'] }} trx)</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ═══════════ TABEL DATA ═══════════ --}}
    <table class="table">
        <thead>
            <tr>
                <th class="center" style="width: 20px;">No</th>
                <th style="width: 80px;">{{ __('reports.code') }}</th>
                <th>{{ __('reports.donor') }}</th>
                <th>{{ __('reports.program_qualification') }}</th>
                <th style="width: 60px;">{{ __('reports.method') }}</th>
                <th class="center" style="width: 50px;">{{ __('reports.status') }}</th>
                <th class="right" style="width: 90px;">{{ __('reports.nominal') }}</th>
                <th style="width: 85px;">{{ __('reports.success_time') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($donations as $index => $donation)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td class="bold">{{ $donation->donation_code ?: '#' . $donation->id }}</td>
                <td>
                    <div class="bold">{{ $donation->donor_name ?: __('reports.hamba_allah') }}</div>
                    <span style="font-size: 7px; color: #94a3b8;">ID: DON-{{ $donation->id }}</span>
                </td>
                <td>
                    {{ $donation->program?->title ?: __('reports.general_dana') }}
                    <div style="font-size: 7px; color: #64748b; font-style: italic;">Qual: {{ $donation->donor_qualification ?: '-' }}</div>
                </td>
                <td>{{ $donation->payment_source ?: '-' }}</td>
                <td class="center">
                    <span class="status-badge">{{ $donation->status }}</span>
                </td>
                <td class="right amount">{{ $formatCurrency($donation->amount ?? 0) }}</td>
                <td>{{ $formatDate($donation->paid_at ?: $donation->created_at) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="center" style="padding: 30px; color: #94a3b8;">
                    {{ __('reports.no_data_found') }}
                </td>
            </tr>
            @endforelse
        </tbody>
        @if($donations->count() > 0)
        <tfoot>
            <tr>
                <td colspan="6" class="right bold" style="background: #f1f5f9; padding: 10px;">{{ __('reports.total_overall') }}</td>
                <td class="right amount" style="background: #f1f5f9; padding: 10px; font-size: 11px; color: #1e40af;">
                    {{ $formatCurrency($summary['total_amount'] ?? 0) }}
                </td>
                <td style="background: #f1f5f9;"></td>
            </tr>
        </tfoot>
        @endif
    </table>

    {{-- ═══════════ PENGESAHAN ═══════════ --}}
    <table class="signature-table">
        <tr>
            <td style="width: 70%;"></td>
            <td class="center">
                <p>Jakarta, {{ now()->translatedFormat('d F Y') }}</p>
                <p><strong>{{ __('reports.treasurer') }},</strong></p>
                <div class="signature-space"></div>
                <p><strong>( __________________________ )</strong></p>
                <p style="font-size: 8px; color: #64748b;">Finance & Accounting Dept.</p>
            </td>
        </tr>
    </table>

    <div class="footer-note">
        {{ __('reports.footer_note') }} {{ now()->format('d/m/Y H:i:s') }} | Digital Signed by DPF System
    </div>

</body>
</html>