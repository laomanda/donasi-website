<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Arus Kas & Keuangan - {{ $generatedAt->format('d/m/Y') }}</title>
    <style>
        @page {
            margin: 0.8cm 1cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 9px;
            color: #1e293b;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat */
        .kop-table {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .kop-detail h1 {
            margin: 0;
            font-size: 16px;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kop-detail p {
            margin: 2px 0;
            font-size: 8px;
            color: #475569;
        }
        .kop-doc {
            text-align: right;
            vertical-align: middle;
        }
        .kop-doc h2 {
            margin: 0;
            font-size: 13px;
            color: #2b7a9b;
            text-transform: uppercase;
        }
        .kop-doc p {
            margin: 2px 0 0 0;
            font-size: 8px;
            color: #64748b;
        }

        /* Box Ringkasan */
        .stats-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .stats-box {
            padding: 8px 10px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
        }
        .stats-title {
            font-size: 7.5px;
            text-transform: uppercase;
            font-weight: bold;
            color: #64748b;
            margin-bottom: 3px;
        }
        .stats-val {
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
        }
        .inflow-color { color: #059669; }
        .outflow-color { color: #e11d48; }
        .net-color { color: #2563eb; }

        /* Tables */
        .section-title {
            font-size: 10px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            margin: 12px 0 6px 0;
            border-left: 3px solid #3f8f3f;
            padding-left: 6px;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 5px 6px;
            text-align: left;
            border: 1px solid #0f172a;
        }
        table.data-table td {
            padding: 4px 6px;
            border: 1px solid #e2e8f0;
            font-size: 8px;
            vertical-align: top;
        }
        table.data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }

        .badge-in {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 3px;
            background-color: #d1fae5;
            color: #065f46;
            font-size: 7px;
            font-weight: bold;
        }
        .badge-out {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 3px;
            background-color: #ffe4e6;
            color: #9f1239;
            font-size: 7px;
            font-weight: bold;
        }

        /* Tanda Tangan */
        .signature-table {
            width: 100%;
            margin-top: 25px;
            border-collapse: collapse;
            page-break-inside: avoid;
        }
        .signature-cell {
            width: 50%;
            vertical-align: top;
            text-align: center;
        }
        .signature-space {
            height: 50px;
        }
    </style>
</head>
<body>

    <!-- KOP SURAT -->
    <table class="kop-table">
        <tr>
            <td class="kop-detail">
                <h1>DJALALUDIN PANE FOUNDATION</h1>
                <p>Gedung Menara Wakaf, Jl. Terusan Rasuna Said, Jakarta Selatan</p>
                <p>Email: finance@dpf.or.id | Website: www.dpf.or.id | Telp: (021) 7890-1234</p>
            </td>
            <td class="kop-doc">
                <h2>LAPORAN ARUS KAS YAYASAN</h2>
                <p>Periode: 
                    @if(!empty($filters['date_from']) || !empty($filters['date_to']))
                        {{ $filters['date_from'] ?: 'Awal' }} s/d {{ $filters['date_to'] ?: 'Sekarang' }}
                    @else
                        Semua Waktu (Kumulatif)
                    @endif
                </p>
                <p>Dicetak: {{ $generatedAt->translatedFormat('d F Y, H:i') }} WIB</p>
            </td>
        </tr>
    </table>

    <!-- RINGKASAN STATISTIK -->
    <table class="stats-table">
        <tr>
            <td style="width: 25%; padding-right: 4px;">
                <div class="stats-box">
                    <div class="stats-title">Total Kas Masuk (Inflow)</div>
                    <div class="stats-val inflow-color">Rp {{ number_format($summary['total_inflow'] ?? 0, 0, ',', '.') }}</div>
                    <div style="font-size: 7px; color: #64748b; margin-top: 2px;">{{ $summary['total_inflow_count'] ?? 0 }} transaksi donasi lunas</div>
                </div>
            </td>
            <td style="width: 25%; padding: 0 2px;">
                <div class="stats-box">
                    <div class="stats-title">Total Penyaluran (Outflow)</div>
                    <div class="stats-val outflow-color">Rp {{ number_format($summary['total_outflow'] ?? 0, 0, ',', '.') }}</div>
                    <div style="font-size: 7px; color: #64748b; margin-top: 2px;">{{ $summary['total_outflow_count'] ?? 0 }} realisasi alokasi</div>
                </div>
            </td>
            <td style="width: 25%; padding: 0 2px;">
                <div class="stats-box">
                    <div class="stats-title">Net Arus Kas (Surplus)</div>
                    <div class="stats-val net-color">Rp {{ number_format($summary['net_cash_flow'] ?? 0, 0, ',', '.') }}</div>
                    <div style="font-size: 7px; color: #64748b; margin-top: 2px;">Saldo kas berjalan</div>
                </div>
            </td>
            <td style="width: 25%; padding-left: 4px;">
                <div class="stats-box">
                    <div class="stats-title">Rasio Penyaluran</div>
                    <div class="stats-val" style="color: #475569;">{{ number_format($summary['disbursement_ratio'] ?? 0, 1) }}%</div>
                    <div style="font-size: 7px; color: #64748b; margin-top: 2px;">Tingkat serapan donasi</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- RINGKASAN SALDO PER KANTONG PROGRAM -->
    @if(!empty($programBreakdowns))
    <div class="section-title">Rekapitulasi Saldo Kantong Program (Ring-Fenced Funds)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 36%;">Nama Program Wakaf / Donasi</th>
                <th style="width: 15%; text-align: right;">Total Donasi (Rp)</th>
                <th style="width: 15%; text-align: right;">Penyaluran (Rp)</th>
                <th style="width: 15%; text-align: right;">Sisa Saldo (Rp)</th>
                <th style="width: 15%; text-align: center;">Serapan (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($programBreakdowns as $index => $prog)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="font-bold">{{ $prog['program_title'] }}</td>
                <td class="text-right">{{ number_format($prog['inflow_amount'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($prog['outflow_amount'], 0, ',', '.') }}</td>
                <td class="text-right font-bold {{ $prog['remaining_balance'] < 0 ? 'outflow-color' : 'inflow-color' }}">
                    {{ number_format($prog['remaining_balance'], 0, ',', '.') }}
                </td>
                <td class="text-center">{{ number_format($prog['disbursement_ratio'], 1) }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- JURNAL BUKU KAS MUTASI TRANSAKSI -->
    <div class="section-title">Jurnal Rekapitulasi Mutasi Kas Masuk & Keluar</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 11%;">Tanggal</th>
                <th style="width: 8%; text-align: center;">Tipe</th>
                <th style="width: 12%;">Kode Ref</th>
                <th style="width: 25%;">Keterangan / Donatur / Mitra</th>
                <th style="width: 16%;">Program</th>
                <th style="width: 12%; text-align: right;">Masuk (Inflow)</th>
                <th style="width: 12%; text-align: right;">Keluar (Outflow)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($mutations as $i => $item)
            <tr>
                <td class="text-center">{{ $i + 1 }}</td>
                <td>{{ date('d/m/Y H:i', strtotime($item['date'])) }}</td>
                <td class="text-center">
                    @if($item['type'] === 'inflow')
                        <span class="badge-in">MASUK</span>
                    @else
                        <span class="badge-out">KELUAR</span>
                    @endif
                </td>
                <td>{{ $item['code'] }}</td>
                <td>
                    <div class="font-bold">{{ $item['title'] }}</div>
                    <div style="font-size: 7px; color: #64748b;">{{ $item['subtitle'] }}</div>
                </td>
                <td>{{ $item['program_title'] }}</td>
                <td class="text-right font-bold {{ $item['type'] === 'inflow' ? 'inflow-color' : '' }}">
                    {{ $item['type'] === 'inflow' ? number_format($item['amount'], 0, ',', '.') : '-' }}
                </td>
                <td class="text-right font-bold {{ $item['type'] === 'outflow' ? 'outflow-color' : '' }}">
                    {{ $item['type'] === 'outflow' ? number_format($item['amount'], 0, ',', '.') : '-' }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center" style="padding: 15px; color: #94a3b8;">Tidak ada transaksi mutasi kas pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="6" class="text-right font-bold" style="padding: 6px;">TOTAL KUMULATIF</td>
                <td class="text-right inflow-color" style="padding: 6px;">Rp {{ number_format($summary['total_inflow'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right outflow-color" style="padding: 6px;">Rp {{ number_format($summary['total_outflow'] ?? 0, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <!-- TANDA TANGAN & PENGESAHAN -->
    <table class="signature-table">
        <tr>
            <td class="signature-cell">
                <p>Mengetahui,</p>
                <p class="font-bold">Direktur Eksekutif Yayasan</p>
                <div class="signature-space"></div>
                <p class="font-bold"><u>( .................................................. )</u></p>
                <p style="font-size: 7.5px; color: #64748b;">NIP: DPF-DIR-2024</p>
            </td>
            <td class="signature-cell">
                <p>Jakarta, {{ $generatedAt->translatedFormat('d F Y') }}</p>
                <p class="font-bold">Manajer Keuangan & Perbendaharaan</p>
                <div class="signature-space"></div>
                <p class="font-bold"><u>( .................................................. )</u></p>
                <p style="font-size: 7.5px; color: #64748b;">Divisi Keuangan & Akuntansi</p>
            </td>
        </tr>
    </table>

</body>
</html>
