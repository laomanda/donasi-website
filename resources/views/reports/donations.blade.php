<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Donasi - {{ $generatedAt->format('d/m/Y') }}</title>
    <style>
        /* Pengaturan Halaman */
        @page {
            margin: 1.2cm;
            footer: html_footer;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #334155;
            line-height: 1.4;
            margin: 0;
        }

        /* Kop Surat */
        .header-table {
            width: 100%;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header-table td { border: none; }

        .brand-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            text-transform: uppercase;
            margin: 0;
        }

        .report-label {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            color: #64748b;
        }

        /* Informasi Filter */
        .filter-section {
            width: 100%;
            margin-bottom: 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 4px;
        }

        .filter-table { width: 100%; }
        .filter-table td { padding: 2px 5px; border: none; }
        .label { color: #64748b; width: 100px; font-weight: bold; }

        /* Ringkasan (KPI) */
        .summary-container {
            margin-bottom: 20px;
            overflow: hidden;
        }

        .summary-box {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-box td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            background: #ffffff;
        }

        .summary-val {
            display: block;
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
        }

        .summary-lbl {
            display: block;
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
        }

        /* Tabel Data Utama */
        .table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
        }

        .table thead {
            display: table-header-group;
        }

        .table th {
            background-color: #1e293b;
            color: #ffffff;
            text-align: left;
            padding: 10px 8px;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            border: 1px solid #1e293b;
        }

        .table td {
            padding: 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Utilitas Teks */
        .right { text-align: right; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .amount { 
            font-family: 'Courier', monospace; 
            font-weight: bold;
            white-space: nowrap;
        }
        .status-badge {
            font-size: 8px;
            padding: 2px 5px;
            border-radius: 3px;
            background: #e2e8f0;
            text-transform: uppercase;
            font-weight: bold;
        }

        .footer {
            text-align: right;
            font-size: 9px;
            color: #94a3b8;
            margin-top: 30px;
            border-top: 1px solid #f1f5f9;
            padding-top: 5px;
        }

        /* Mencegah row terpotong */
        tr { page-break-inside: avoid; page-break-after: auto; }
    </style>
</head>
<body>

    @php
      $formatCurrency = function ($value) {
          return 'Rp ' . number_format((float)$value, 0, ',', '.');
      };
      $formatDate = function ($value) {
          return $value ? \Carbon\Carbon::parse($value)->translatedFormat('d M Y H:i') : '-';
      };
    @endphp

    <!-- Header / Kop -->
    <table class="header-table">
        <tr>
            <td>
                <h1 class="brand-title">Djalaludin Pane Foundation </h1>
                <p style="margin: 0; font-size: 9px; color: #64748b;">
                    Signature Park Grande, Jl. Letjen M.T. Haryono No.Kav. 20, RT.4/RW.1, Cawang, Kec. Kramat jati, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13630.<br>
                    Email: layanan@dpf.or.id | Telp: 0813-1176-8254
                </p>
            </td>
            <td class="report-label">
                {{ __('reports.donation_report_title') }}
                <div style="font-size: 10px; font-weight: normal; margin-top: 5px;">
                    {{ __('reports.document_id') }}: REG/{{ now()->format('Ymd/His') }}
                </div>
            </td>
        </tr>
    </table>

    <!-- Parameter Laporan -->
    <div class="filter-section">
        <table class="filter-table">
            <tr>
                <td class="label">{{ __('reports.period') }}</td>
                <td>: {{ $filters['date_from'] ?: __('reports.all') }} {{ __('reports.until') }} {{ $filters['date_to'] ?: __('reports.all') }}</td>
                <td class="label">{{ __('reports.printing_time') }}</td>
                <td>: {{ $generatedAt->translatedFormat('d F Y H:i') }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('reports.payment_method') }}</td>
                <td>: {{ $filters['payment_source_label'] }}</td>
                <td class="label">{{ __('reports.data_status') }}</td>
                <td>: {{ $filters['status_label'] }}</td>
            </tr>
        </table>
    </div>

    <!-- Summary KPI -->
    <div class="summary-container">
        <table class="summary-box">
            <tr>
                <td style="width: 25%;">
                    <span class="summary-lbl">{{ __('reports.total_transactions') }}</span>
                    <span class="summary-val">{{ number_format($summary['total_count'] ?? 0, 0, ',', '.') }}</span>
                </td>
                <td style="width: 35%; background-color: #f1f5f9;">
                    <span class="summary-lbl">{{ __('reports.total_donation_amount') }}</span>
                    <span class="summary-val" style="color: #059669; font-size: 16px;">
                        {{ $formatCurrency($summary['total_amount'] ?? 0) }}
                    </span>
                </td>
                <td style="width: 40%;">
                    <span class="summary-lbl">{{ __('reports.source_details') }}</span>
                    <div style="font-size: 9px;">
                        {{ __('reports.manual') }}: <strong>{{ $formatCurrency($summary['manual_amount'] ?? 0) }}</strong> 
                        ({{ $summary['manual_count'] }} trx)<br>
                        {{ __('reports.digital') }}: <strong>{{ $formatCurrency($summary['midtrans_amount'] ?? 0) }}</strong> 
                        ({{ $summary['midtrans_count'] }} trx)
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Table Data -->
    <table class="table">
        <thead>
            <tr>
                <th style="width: 30px;" class="center">{{ __('reports.no') }}</th>
                <th style="width: 80px;">{{ __('reports.code') }}</th>
                <th>{{ __('reports.donor') }}</th>
                <th>{{ __('reports.program_qualification') }}</th>
                <th style="width: 70px;">{{ __('reports.method') }}</th>
                <th style="width: 70px;" class="center">{{ __('reports.status') }}</th>
                <th style="width: 100px;" class="right">{{ __('reports.nominal') }}</th>
                <th style="width: 90px;">{{ __('reports.success_time') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($donations as $index => $donation)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td class="bold">{{ $donation->donation_code ?: '#' . $donation->id }}</td>
                <td>
                    <div class="bold">{{ $donation->donor_name ?: __('reports.hamba_allah') }}</div>
                    <div style="font-size: 8px; color: #64748b;">ID: DON-{{ $donation->id }}</div>
                </td>
                <td>
                    {{ $donation->program?->title ?: __('reports.general_dana') }}
                    <br><small><i>Kualifikasi: {{ $donation->donor_qualification ?: '-' }}</i></small>
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
                <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    {{ __('reports.no_data_found') }}
                </td>
            </tr>
            @endforelse
        </tbody>
        @if($donations->count() > 0)
        <tfoot>
            <tr>
                <td colspan="6" class="right bold" style="background: #f1f5f9;">{{ __('reports.total_overall') }}</td>
                <td class="right amount" style="background: #f1f5f9; font-size: 11px;">
                    {{ $formatCurrency($summary['total_amount'] ?? 0) }}
                </td>
                <td style="background: #f1f5f9;"></td>
            </tr>
        </tfoot>
        @endif
    </table>

    <!-- Tanda Tangan (Opsional) -->
    <div style="margin-top: 40px; width: 100%;">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="border: none; width: 70%;"></td>
                <td style="border: none; text-align: center;">
                    {{ now()->translatedFormat('d F Y') }}<br>
                    {{ __('reports.treasurer') }},<br><br><br><br>
                    <strong>( __________________________ )</strong>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        {{ __('reports.footer_note') }} {{ now()->format('d/m/Y H:i:s') }}
    </div>

</body>
</html>