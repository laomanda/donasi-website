<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <title>Laporan Donasi</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; color: #1f2937; margin: 0; }
      h1 { font-size: 20px; margin: 0 0 6px; }
      p { margin: 0 0 4px; }
      .page { padding: 24px; }
      .meta { margin-bottom: 16px; }
      .filters, .summary { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .filters td, .summary td { padding: 6px 8px; border: 1px solid #e5e7eb; }
      .filters td:first-child, .summary td:first-child { width: 160px; font-weight: bold; color: #374151; }
      .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      .table th, .table td { padding: 8px 10px; border: 1px solid #e5e7eb; vertical-align: top; }
      .table th { background: #f9fafb; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; }
      .muted { color: #6b7280; font-size: 11px; }
      .right { text-align: right; }
    </style>
  </head>
  <body>
    @php
      $formatCurrency = function ($value) {
          $amount = is_numeric($value) ? (float) $value : 0;
          return 'Rp ' . number_format($amount, 0, ',', '.');
      };
      $formatDate = function ($value) {
          if (! $value) return '-';
          try {
              return \Carbon\Carbon::parse($value)->format('d M Y H:i');
          } catch (\Throwable $e) {
              return '-';
          }
      };
    @endphp

    <div class="page">
      <div class="meta">
        <h1>Laporan Donasi</h1>
        <p class="muted">Dibuat: {{ $generatedAt->format('d M Y H:i') }}</p>
      </div>

      <table class="filters">
        <tr>
          <td>Periode</td>
          <td>{{ $filters['date_from'] ?: '-' }} s/d {{ $filters['date_to'] ?: '-' }}</td>
        </tr>
        <tr>
          <td>Sumber</td>
          <td>{{ $filters['payment_source_label'] }}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>{{ $filters['status_label'] }}</td>
        </tr>
        <tr>
          <td>Kata kunci</td>
          <td>{{ $filters['q'] ?: '-' }}</td>
        </tr>
      </table>

      <table class="summary">
        <tr>
          <td>Total Donasi</td>
          <td>{{ number_format($summary['total_count'] ?? 0, 0, ',', '.') }} transaksi</td>
        </tr>
        <tr>
          <td>Total Nominal</td>
          <td>{{ $formatCurrency($summary['total_amount'] ?? 0) }}</td>
        </tr>
        <tr>
          <td>Manual</td>
          <td>{{ number_format($summary['manual_count'] ?? 0, 0, ',', '.') }} transaksi - {{ $formatCurrency($summary['manual_amount'] ?? 0) }}</td>
        </tr>
        <tr>
          <td>Midtrans</td>
          <td>{{ number_format($summary['midtrans_count'] ?? 0, 0, ',', '.') }} transaksi - {{ $formatCurrency($summary['midtrans_amount'] ?? 0) }}</td>
        </tr>
      </table>

      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px;">No</th>
            <th>Kode</th>
            <th>Donatur</th>
            <th>Program</th>
            <th>Sumber</th>
            <th>Status</th>
            <th class="right">Nominal</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          @forelse ($donations as $index => $donation)
            @php
              $code = $donation->donation_code ?: sprintf('#%s', $donation->id);
              $donor = $donation->donor_name ?: 'Anonim';
              $program = $donation->program?->title ?: 'Tanpa program';
              $source = $donation->payment_source ?: '-';
              $status = $donation->status ?: '-';
              $amount = $donation->amount ?? 0;
              $when = $donation->paid_at ?: $donation->created_at;
            @endphp
            <tr>
              <td>{{ $index + 1 }}</td>
              <td>{{ $code }}</td>
              <td>{{ $donor }}</td>
              <td>{{ $program }}</td>
              <td>{{ $source }}</td>
              <td>{{ $status }}</td>
              <td class="right">{{ $formatCurrency($amount) }}</td>
              <td>{{ $formatDate($when) }}</td>
            </tr>
          @empty
            <tr>
              <td colspan="8">Tidak ada data donasi.</td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </body>
</html>
