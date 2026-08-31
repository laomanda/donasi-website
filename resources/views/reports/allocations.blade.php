<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Penyaluran Dana - {{ $generatedAt->format('d/m/Y') }}</title>
    <style>
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
            border-bottom: 2px solid #047857;
            padding-bottom: 10px;
            margin-bottom: 18px;
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
            font-size: 17px;
            color: #065f46;
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
            font-size: 13px;
            color: #047857;
            text-transform: uppercase;
        }
        .kop-document p {
            margin: 0;
            font-size: 8px;
            font-weight: bold;
            color: #475569;
        }

        /* Parameter Laporan / Filter */
        .filter-section {
            width: 100%;
            margin-bottom: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 6px;
        }
        .filter-table { width: 100%; border-collapse: collapse; }
        .filter-table td { padding: 2px 5px; font-size: 8.5px; }
        .label { color: #64748b; font-weight: bold; width: 100px; }

        /* Summary KPI Boxes */
        .summary-container {
            width: 100%;
            margin-bottom: 18px;
            border-collapse: collapse;
        }
        .summary-box {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            background: #f0fdf4;
        }
        .summary-lbl {
            display: block;
            font-size: 7.5px;
            text-transform: uppercase;
            color: #065f46;
            margin-bottom: 2px;
            font-weight: bold;
        }
        .summary-val {
            display: block;
            font-size: 13px;
            font-weight: bold;
            color: #064e3b;
        }

        /* Tabel Data Utama */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th {
            background-color: #065f46;
            color: #ffffff;
            text-align: left;
            padding: 7px 8px;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
            border: 1px solid #065f46;
        }
        .table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
            font-size: 8.5px;
        }
        .table tr:nth-child(even) { background-color: #f8fafc; }

        /* Utilities */
        .right { text-align: right; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .amount { font-family: 'Courier', monospace; font-weight: bold; color: #dc2626; }

        /* Tanda Tangan */
        .signature-table {
            width: 100%;
            margin-top: 25px;
        }
        .signature-space {
            height: 50px;
        }

        .footer-note {
            margin-top: 25px;
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
      $totalAmount = $allocations->sum('amount');
      $totalCount = $allocations->count();
      $average = $totalCount > 0 ? $totalAmount / $totalCount : 0;
    @endphp

    {{-- KOP SURAT --}}
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                <img src="{{ public_path('brand/dpf-wakaf.png') }}" alt="Logo">
            </td>
            <td class="kop-detail">
                <h1>Djalaludin Pane Foundation</h1>
                <p>
                    Signature Park Grande, Jl. Letjen M.T. Haryono No.Kav. 20, Cawang, Jakarta Timur.<br>
                    Email: layanan@dpf.or.id | Telp: 0851-9554-2022 | Website: www.dpf.or.id
                </p>
            </td>
            <td class="kop-document">
                <h2>Laporan Penyaluran Dana</h2>
                <p>No: ALOC/{{ now()->format('Ymd/His') }}</p>
                <p style="font-weight: normal; font-size: 8px; color: #64748b;">Tgl Cetak: {{ $generatedAt->translatedFormat('d F Y H:i') }}</p>
            </td>
        </tr>
    </table>

    {{-- PARAMETER FILTER --}}
    <div class="filter-section">
        <table class="filter-table">
            <tr>
                <td class="label">Program Filter:</td>
                <td>{{ $filters['program_title'] ?? 'Semua Program' }}</td>
                <td class="label">Kata Kunci:</td>
                <td>{{ $filters['q'] ? '"'.$filters['q'].'"' : 'Semua Data' }}</td>
            </tr>
            <tr>
                <td class="label">Rentang Waktu:</td>
                <td colspan="3">
                    @if(!empty($filters['date_from']) || !empty($filters['date_to']))
                        {{ $filters['date_from'] ?: 'Awal' }} s/d {{ $filters['date_to'] ?: 'Sekarang' }}
                    @else
                        Semua Periode Transaksi
                    @endif
                </td>
            </tr>
        </table>
    </div>

    {{-- RINGKASAN KPI --}}
    <table class="summary-container">
        <tr>
            <td class="summary-box" style="width: 33%;">
                <span class="summary-lbl">Total Penyaluran</span>
                <span class="summary-val">{{ number_format($totalCount, 0, ',', '.') }} Transaksi</span>
            </td>
            <td style="width: 10px;"></td>
            <td class="summary-box" style="width: 33%;">
                <span class="summary-lbl">Total Dana Disalurkan</span>
                <span class="summary-val" style="color: #dc2626;">{{ $formatCurrency($totalAmount) }}</span>
            </td>
            <td style="width: 10px;"></td>
            <td class="summary-box" style="width: 33%;">
                <span class="summary-lbl">Rata-rata Penyaluran</span>
                <span class="summary-val">{{ $formatCurrency($average) }}</span>
            </td>
        </tr>
    </table>

    {{-- TABEL DATA PENYALURAN --}}
    <table class="table">
        <thead>
            <tr>
                <th style="width: 30px;" class="center">No</th>
                <th style="width: 90px;">Tgl Penyaluran</th>
                <th style="width: 180px;">Program Donasi</th>
                <th>Keperluan / Kegiatan</th>
                <th style="width: 110px;" class="right">Nominal Penyaluran</th>
            </tr>
        </thead>
        <tbody>
            @forelse($allocations as $index => $alloc)
                @php
                    $progTitle = $alloc->program?->title ?: ($alloc->donation?->program?->title ?: 'Dana Umum / Wakaf Terbuka');
                @endphp
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $formatDate($alloc->allocated_at ?: $alloc->created_at) }}</td>
                    <td class="bold">{{ $progTitle }}</td>
                    <td>{{ $alloc->description ?: 'Penyaluran dana program' }}</td>
                    <td class="right amount">-{{ $formatCurrency($alloc->amount) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="center" style="padding: 20px; color: #94a3b8;">
                        Tidak ada data transaksi penyaluran ditemukan.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if($allocations->isNotEmpty())
        <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="4" class="right" style="padding: 8px;">TOTAL KESELURUHAN</td>
                <td class="right amount" style="font-size: 10px;">-{{ $formatCurrency($totalAmount) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    {{-- TANDA TANGAN & PENGESAHAN --}}
    <table class="signature-table">
        <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%; text-align: center;">
                <p style="margin: 0; font-size: 9px;">Jakarta, {{ $generatedAt->translatedFormat('d F Y') }}</p>
                <p style="margin: 3px 0 0 0; font-size: 9px; font-weight: bold;">Bagian Keuangan & Penyaluran</p>
                <div class="signature-space"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: underline; font-size: 9px;">( Tim Keuangan DPF )</p>
                <p style="margin: 2px 0 0 0; font-size: 8px; color: #64748b;">Djalaludin Pane Foundation</p>
            </td>
        </tr>
    </table>

    <div class="footer-note">
        Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi Manajemen DPF pada {{ $generatedAt->format('d/m/Y H:i:s') }}.
    </div>

</body>
</html>
