<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        /* Pengaturan Halaman */
        @page {
            margin: 1.2cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #334155;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat */
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
            letter-spacing: 0.5px;
        }
        .kop-detail p {
            margin: 2px 0;
            font-size: 9px;
            color: #64748b;
            line-height: 1.3;
        }
        .kop-document-info {
            text-align: right;
            vertical-align: middle;
        }
        .kop-document-info h2 {
            margin: 0;
            font-size: 14px;
            color: #2563eb;
            text-transform: uppercase;
        }
        .kop-document-info p {
            margin: 0;
            font-size: 10px;
            font-weight: bold;
            color: #475569;
        }

        /* Info Mitra Section */
        .info-table {
            width: 100%;
            margin-bottom: 25px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-weight: bold;
            color: #64748b;
            width: 15%;
            padding: 3px 0;
        }
        .info-colon {
            width: 2%;
            text-align: center;
        }
        .info-value {
            width: 33%;
            color: #1e293b;
            font-weight: 600;
        }

        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .data-table th {
            background-color: #1e293b;
            color: #ffffff;
            padding: 10px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            border: 1px solid #1e293b;
        }
        .data-table td {
            padding: 10px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .data-table tr:nth-child(even) {
            background-color: #fcfcfc;
        }
        .program-tag {
            font-size: 9px;
            color: #64748b;
            margin-top: 4px;
            display: block;
            font-style: italic;
        }
        .amount {
            text-align: right;
            font-weight: bold;
            font-family: 'Courier New', monospace;
        }

        /* Total Row */
        .total-row {
            background-color: #f1f5f9 !important;
            font-weight: bold;
        }
        .total-label {
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 10px;
        }

        /* Footer & TTD */
        .footer-table {
            width: 100%;
            margin-top: 30px;
        }
        .catatan-box {
            font-size: 9px;
            color: #64748b;
            border: 1px dashed #cbd5e1;
            padding: 10px;
            width: 90%;
        }
        .ttd-container {
            text-align: center;
        }
        .ttd-space {
            height: 70px;
        }
        .printed-info {
            margin-top: 40px;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 5px;
            text-align: left;
        }
    </style>
</head>
<body>

    {{-- ═══════════ KOP SURAT ═══════════ --}}
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                {{-- Gunakan public_path agar gambar bisa dirender oleh PDF Generator --}}
                <img src="{{ public_path('brand/dpf-wakaf.png') }}" alt="DPF Logo">
            </td>
            <td class="kop-detail">
                <h1>Djalaludin Pane Foundation</h1>
                <p>
                    Signature Park Grande, Jl. Letjen M.T. Haryono No.Kav. 20, Cawang, Jakarta Timur 13630.<br>
                    Telp: (021) 789-1234 | Email: info@dpf.or.id | Website: www.dpf.or.id
                </p>
            </td>
            <td class="kop-document-info">
                <h2>{{ __('reports.allocation_report_title') }}</h2>
                <p>No: AD/{{ date('Ym') }}/{{ str_pad($user->id, 4, '0', STR_PAD_LEFT) }}</p>
                <p style="font-weight: normal; font-size: 9px;">Tgl Cetak: {{ now()->translatedFormat('d F Y') }}</p>
            </td>
        </tr>
    </table>

    {{-- ═══════════ INFO MITRA ═══════════ --}}
    <table class="info-table">
        <tr>
            <td class="info-label">{{ __('reports.mitra_name') }}</td>
            <td class="info-colon">:</td>
            <td class="info-value">{{ $user->name }}</td>
            <td class="info-label">{{ __('reports.period') }}</td>
            <td class="info-colon">:</td>
            <td class="info-value">
                @if($date_from && $date_to)
                    {{ \Carbon\Carbon::parse($date_from)->translatedFormat('d M Y') }} - {{ \Carbon\Carbon::parse($date_to)->translatedFormat('d M Y') }}
                @else
                    {{ __('reports.all_time') }}
                @endif
            </td>
        </tr>
        <tr>
            <td class="info-label">{{ __('reports.mitra_id') }}</td>
            <td class="info-colon">:</td>
            <td class="info-value">#MT-{{ str_pad($user->id, 5, '0', STR_PAD_LEFT) }}</td>
            <td class="info-label">{{ __('reports.status') }}</td>
            <td class="info-colon">:</td>
            <td class="info-value">
                <span style="color: #059669;">● {{ __('reports.verified') }}</span>
            </td>
        </tr>
    </table>

    {{-- ═══════════ TABEL DATA ═══════════ --}}
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">{{ __('reports.no') }}</th>
                <th style="width: 15%;">{{ __('reports.date') }}</th>
                <th style="width: 55%;">{{ __('reports.description_program') }}</th>
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
                    <span class="program-tag">Program: {{ $allocation->program->title ?? __('reports.general_dana') }}</span>
                </td>
                <td class="amount">{{ number_format($allocation->amount, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #94a3b8;">
                    {{ __('reports.no_data_found') }}
                </td>
            </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" class="total-label">
                    {{ __('reports.total_allocated') }}
                </td>
                <td class="amount" style="font-size: 13px; color: #1e40af;">
                    Rp {{ number_format($allocations->sum('amount'), 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>

    {{-- ═══════════ FOOTER & TTD ═══════════ --}}
    <table class="footer-table">
        <tr>
            <td style="width: 60%;">
                <div class="catatan-box">
                    <strong>{{ __('reports.notes') }}:</strong><br>
                    1. Dokumen ini sah dan diterbitkan secara komputerisasi oleh sistem DPF.<br>
                    2. Alokasi dana di atas telah disetujui sesuai dengan ketentuan yayasan.<br>
                    3. Simpan laporan ini sebagai bukti pertanggungjawaban program.
                </div>
            </td>
            <td style="width: 40%;">
                <div class="ttd-container">
                    <p>Jakarta, {{ now()->translatedFormat('d F Y') }}</p>
                    <p><strong>{{ __('reports.foundation_treasurer') }}</strong></p>
                    <div class="ttd-space"></div>
                    <p><strong>( __________________________ )</strong></p>
                    <p style="font-size: 8px; color: #64748b;">Finance & Accounting Dept.</p>
                </div>
            </td>
        </tr>
    </table>

    <div class="printed-info">
        {{ __('reports.footer_note') }}: {{ now()->translatedFormat('d/m/Y H:i:s') }} WIB | ID: {{ auth()->id() ?? 'SYSTEM' }} | Ref: {{ md5(now()) }}
    </div>

</body>
</html>