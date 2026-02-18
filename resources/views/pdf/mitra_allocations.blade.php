<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Alokasi Dana - {{ $user->name }}</title>
    <style>
        @page {
            margin: 2cm 1.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* ── Kop Surat (table-based for DomPDF) ── */
        .kop-table {
            width: 100%;
            border: none;
            border-bottom: 3px solid #1e293b;
            margin-bottom: 20px;
            padding-bottom: 12px;
        }

        .kop-table td {
            vertical-align: top;
            border: none;
            padding: 0;
        }

        .kop-left h1 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: #1e293b;
            letter-spacing: 1px;
        }

        .kop-left p {
            margin: 0;
            font-size: 10px;
            color: #475569;
            line-height: 1.6;
        }

        .kop-right {
            text-align: right;
        }

        .kop-right h2 {
            margin: 0 0 4px 0;
            font-size: 13px;
            color: #1e293b;
            letter-spacing: 0.5px;
        }

        .kop-right p {
            margin: 0;
            font-size: 10px;
            color: #64748b;
        }

        /* ── Info Section ── */
        .info-table {
            width: 100%;
            border: none;
            margin-bottom: 18px;
        }

        .info-table td {
            padding: 3px 0;
            border: none;
            font-size: 11px;
            vertical-align: top;
        }

        .info-label {
            color: #64748b;
            width: 12%;
        }

        .info-colon {
            width: 2%;
            color: #64748b;
        }

        .info-value {
            font-weight: bold;
            color: #1e293b;
        }

        /* ── Data Table ── */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .data-table th {
            background-color: #1e293b;
            color: #ffffff;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            padding: 10px 8px;
            border: 1px solid #1e293b;
            text-align: left;
        }

        .data-table td {
            padding: 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 11px;
        }

        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .amount {
            text-align: right;
            font-family: 'Courier', monospace;
            font-weight: bold;
            color: #1e293b;
        }

        .program-tag {
            margin-top: 3px;
            font-size: 9px;
            color: #64748b;
            font-style: italic;
        }

        .total-row td {
            background-color: #f1f5f9 !important;
            font-weight: bold;
            border-top: 2px solid #1e293b;
            padding: 10px 8px;
        }

        .empty-row td {
            text-align: center;
            padding: 30px 8px;
            color: #94a3b8;
            font-style: italic;
        }

        /* ── Footer ── */
        .footer-table {
            width: 100%;
            border: none;
            margin-top: 30px;
        }

        .footer-table td {
            border: none;
            vertical-align: top;
            padding: 0;
        }

        .catatan {
            font-size: 10px;
            color: #64748b;
            line-height: 1.6;
        }

        .ttd {
            text-align: center;
            font-size: 11px;
            color: #1e293b;
        }

        .ttd-space {
            height: 60px;
        }

        .printed-at {
            margin-top: 25px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    {{-- ═══════════ KOP SURAT ═══════════ --}}
    <table class="kop-table">
        <tr>
            <td class="kop-left" style="width: 60%;">
                <h1>Djalaludin Pane Foundation</h1>
                <p>
                    Signature Park Grande, Jl. Letjen M.T. Haryono No.Kav. 20, RT.4/RW.1, Cawang, Kec. Kramat jati, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13630.<br>
                    Telp: (021) 789-1234 | Email: info@dpf.or.id<br>
                    Website: www.dpf.or.id
                </p>
            </td>
            <td class="kop-right" style="width: 40%;">
                <h2>{{ __('reports.allocation_report_title') }}</h2>
                <p>No. Dokumen: AD/{{ date('Ymd') }}/{{ str_pad($user->id, 3, '0', STR_PAD_LEFT) }}</p>
                <p>{{ __('reports.printing_time') }}: {{ now()->translatedFormat('d F Y') }}</p>
            </td>
        </tr>
    </table>

    {{-- ═══════════ INFO MITRA ═══════════ --}}
    <table class="info-table">
        <tr>
            <td class="info-label">{{ __('reports.mitra_name') }}</td>
            <td class="info-colon">:</td>
            <td class="info-value" style="width: 36%;">{{ $user->name }}</td>
            <td class="info-label">{{ __('reports.period') }}</td>
            <td class="info-colon">:</td>
            <td style="width: 36%;">
                @if($date_from && $date_to)
                    {{ \Carbon\Carbon::parse($date_from)->translatedFormat('d M Y') }} {{ __('reports.until') }} {{ \Carbon\Carbon::parse($date_to)->translatedFormat('d M Y') }}
                @elseif($date_from)
                    {{ __('reports.since') }} {{ \Carbon\Carbon::parse($date_from)->translatedFormat('d M Y') }}
                @elseif($date_to)
                    {{ __('reports.until') }} {{ \Carbon\Carbon::parse($date_to)->translatedFormat('d M Y') }}
                @else
                    {{ __('reports.all_time') }}
                @endif
            </td>
        </tr>
        <tr>
            <td class="info-label">{{ __('reports.mitra_id') }}</td>
            <td class="info-colon">:</td>
            <td>#MT-{{ str_pad($user->id, 5, '0', STR_PAD_LEFT) }}</td>
            <td class="info-label">{{ __('reports.status') }}</td>
            <td class="info-colon">:</td>
            <td><span style="color: #059669; font-weight: bold;">● {{ __('reports.verified') }}</span></td>
        </tr>
    </table>

    {{-- ═══════════ TABEL DATA ═══════════ --}}
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">{{ __('reports.no') }}</th>
                <th style="width: 14%;">{{ __('reports.date') }}</th>
                <th style="width: 56%;">{{ __('reports.description_program') }}</th>
                <th style="width: 25%; text-align: right;">{{ __('reports.nominal') }} (IDR)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($allocations as $index => $allocation)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($allocation->created_at)->translatedFormat('d/m/Y') }}</td>
                <td>
                    <div style="font-weight: bold; color: #1e293b;">{{ $allocation->description }}</div>
                    <div class="program-tag">Program: {{ $allocation->program->title ?? __('reports.general_dana') }}</div>
                </td>
                <td class="amount">{{ number_format($allocation->amount, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr class="empty-row">
                <td colspan="4">{{ __('reports.no_data_found') }}</td>
            </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" style="text-align: right; text-transform: uppercase; font-size: 11px;">
                    {{ __('reports.total_allocated') }}
                </td>
                <td class="amount" style="font-size: 13px;">
                    Rp {{ number_format($allocations->sum('amount'), 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>

    {{-- ═══════════ FOOTER & TTD ═══════════ --}}
    <table class="footer-table">
        <tr>
            <td style="width: 55%;">
                <div class="catatan">
                    <strong>{{ __('reports.notes') }}:</strong><br>
                    Laporan ini diterbitkan secara otomatis oleh sistem informasi keuangan<br>
                    Dana Peduli Fulan. Segala bentuk perbedaan data dapat dikonfirmasi<br>
                    ke bagian administrasi melalui email info@dpf.or.id.
                </div>
            </td>
            <td style="width: 45%;">
                <div class="ttd">
                    <p>Jakarta, {{ now()->translatedFormat('d F Y') }}</p>
                    <p>{{ __('reports.foundation_treasurer') }},</p>
                    <div class="ttd-space"></div>
                    <p><strong>( ____________________ )</strong></p>
                </div>
            </td>
        </tr>
    </table>

    <div class="printed-at">
        {{ __('reports.footer_note') }}: {{ now()->translatedFormat('d F Y, H:i:s') }} WIB &nbsp;|&nbsp; User ID: {{ auth()->id() ?? 'System' }}
    </div>

</body>
</html>