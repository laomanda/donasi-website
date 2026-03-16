import type { Locale } from "../lib/i18n";

type Dict = Record<string, { id: string; en: string }>;

export const mitraDict: Dict = {
    // Dashboard Header
    "mitra.dashboard_title": { id: "Dashboard Mitra", en: "Partner Dashboard" },
    "mitra.dashboard_subtitle": { id: "Pantau kontribusi dan transparansi penyaluran dana Anda.", en: "Monitor your contributions and fund allocation transparency." },
    "mitra.new_donation": { id: "Donasi Baru", en: "New Donation" },

    // Dashboard Header
    "dashboard.title": { id: "Ringkasan Mitra", en: "Partner Overview" },
    "dashboard.subtitle": { id: "Pantau donasi dan alokasi dana secara real-time.", en: "Monitor donations and fund allocations in real-time." },
    "dashboard.donate_button": { id: "Donasi Sekarang", en: "Donate Now" },

    // Stats Cards
    "stats.total_donations": { id: "Total Donasi", en: "Total Donations" },
    "stats.total_allocations": { id: "Total Alokasi", en: "Total Allocations" },
    "stats.remaining_balance": { id: "Sisa Saldo", en: "Remaining Balance" },
    "stats.donation_count": { id: "Jumlah Donasi", en: "Donation Count" },

    // Legacy Stats (unused, kept for reference)
    "mitra.available_balance": { id: "Saldo Tersedia", en: "Available Balance" },
    "mitra.available_balance_desc": { id: "Belum dialokasikan", en: "Not yet allocated" },
    "mitra.total_contribution": { id: "Total Kontribusi", en: "Total Contribution" },
    "mitra.total_contribution_desc": { id: "Dana yang sudah lunas", en: "Paid funds" },
    "mitra.programs_supported": { id: "Program Didukung", en: "Programs Supported" },
    "mitra.programs_supported_desc": { id: "Variasi dampak sosial", en: "Social impact variety" },
    "mitra.pending_donations": { id: "Donasi Pending", en: "Pending Donations" },
    "mitra.pending_donations_desc": { id: "Menunggu pembayaran", en: "Awaiting payment" },

    // Allocation Table
    "mitra.allocation_transparency": { id: "Transparansi Penyaluran Dana", en: "Fund Allocation Transparency" },
    "mitra.view_all": { id: "Lihat Semua", en: "View All" },
    "mitra.date": { id: "Tanggal", en: "Date" },
    "mitra.program_allocation": { id: "Alokasi / Program", en: "Allocation / Program" },
    "mitra.nominal": { id: "Nominal", en: "Amount" },
    "mitra.proof": { id: "Bukti", en: "Proof" },
    "mitra.no_allocation": { id: "Belum ada dana yang digunakan oleh Admin.", en: "No funds have been used by Admin yet." },
    "mitra.general_program": { id: "Program Umum", en: "General Program" },

    // Recent Donations
    "mitra.recent_donations": { id: "Donasi Terakhir", en: "Recent Donations" },
    "mitra.no_donation_history": { id: "Belum ada riwayat donasi.", en: "No donation history yet." },
    "mitra.general_donation": { id: "Donasi Umum", en: "General Donation" },
    "mitra.invoice": { id: "Invoice", en: "Invoice" },

    // Status Badges
    "status.paid": { id: "Lunas", en: "Paid" },
    "status.pending": { id: "Menunggu", en: "Pending" },
    "status.failed": { id: "Gagal", en: "Failed" },
    "status.expired": { id: "Kadaluwarsa", en: "Expired" },

    // Navigation Sections
    "nav.section.Ringkasan": { id: "Ringkasan", en: "Overview" },
    "nav.section.Transparansi": { id: "Transparansi", en: "Transparency" },
    "nav.section.Dukungan": { id: "Dukungan", en: "Support" },

    // Navigation Items
    "nav.item.Dashboard": { id: "Dashboard", en: "Dashboard" },
    "nav.item.Bukti Alokasi": { id: "Bukti Alokasi", en: "Allocation Proof" },
    "nav.item.Riwayat Donasi": { id: "Riwayat Donasi", en: "Donation History" },
    "nav.item.Item Tersimpan": { id: "Item Tersimpan", en: "Saved Items" },
    "nav.item.Pengaturan": { id: "Pengaturan", en: "Settings" },

    // Saved Items Page
    "mitra.saved_items_title": { id: "Item Tersimpan", en: "Saved Items" },
    "mitra.saved_items_subtitle": { id: "Daftar program dan artikel yang Anda simpan.", en: "Your saved programs and articles." },
    "mitra.saved_programs": { id: "Program Tersimpan", en: "Saved Programs" },
    "mitra.saved_articles": { id: "Artikel Tersimpan", en: "Saved Articles" },
    "mitra.no_saved_programs": { id: "Belum ada program yang disimpan.", en: "No programs saved yet." },
    "mitra.no_saved_articles": { id: "Belum ada artikel yang disimpan.", en: "No articles saved yet." },

    // Layout
    "nav.search": { id: "Cari Cepat...", en: "Quick Search..." },
    "nav.open": { id: "Buka sidebar", en: "Open sidebar" },
    "nav.close": { id: "Tutup sidebar", en: "Close sidebar" },
    "role.mitra": { id: "Mitra", en: "Partner" },
    "app.mitra": { id: "Dashboard Mitra", en: "Partner Dashboard" },

    // Account Menu
    "account.title": { id: "Akun", en: "Account" },
    "account.settings": { id: "Pengaturan", en: "Settings" },
    "account.settings_desc": { id: "Pengaturan akun.", en: "Account settings." },
    "account.refresh": { id: "Muat ulang halaman", en: "Refresh page" },
    "account.refresh_desc": { id: "Muat ulang data terbaru.", en: "Reload latest data." },
    "account.logout": { id: "Keluar", en: "Logout" },
    "account.logout_desc": { id: "Keluar dari dashboard.", en: "Sign out from dashboard." },

    // Charts
    "chart.trend_title": { id: "Tren Donasi", en: "Donation Trends" },
    "chart.trend_subtitle": { id: "Statistik 6 bulan terakhir", en: "Statistics for the last 6 months" },
    "chart.trend_subtitle_monthly": { id: "Statistik 6 bulan terakhir", en: "Statistics for the last 6 months" },
    "chart.trend_subtitle_weekly": { id: "Statistik 4 minggu terakhir", en: "Statistics for the last 4 weeks" },
    "chart.distribution_title": { id: "Alokasi Dana", en: "Fund Allocation" },
    "chart.distribution_subtitle": { id: "Distribusi berdasarkan kategori", en: "Distribution by category" },
    "chart.monthly": { id: "Bulanan", en: "Monthly" },
    "chart.weekly": { id: "Mingguan", en: "Weekly" },
    "chart.total": { id: "TOTAL", en: "TOTAL" },
    "chart.education": { id: "Pendidikan", en: "Education" },
    "chart.health": { id: "Kesehatan", en: "Health" },
    "chart.social": { id: "Sosial", en: "Social" },
    "chart.other": { id: "Lainnya", en: "Others" },

    // Tables Extensions
    "table.recent_donations": { id: "Donasi Terbaru", en: "Recent Donations" },
    "table.recent_donations_desc": { id: "Data transaksi masuk terakhir", en: "Last incoming transaction data" },
    "table.recent_allocations": { id: "Alokasi Pembiayaan", en: "Financing Allocation" },
    "table.recent_allocations_desc": { id: "Penyaluran dana terakhir", en: "Last fund distribution" },
    "table.donatur": { id: "Donatur", en: "Donor" },
    "table.amount": { id: "Nominal", en: "Amount" },
    "table.status": { id: "Status", en: "Status" },
    "table.title": { id: "Keperluan", en: "Purpose" },
    "table.date": { id: "Tanggal", en: "Date" },

    // Common labels
    "common.view_all": { id: "Lihat Semua", en: "View All" },
    "common.id": { id: "ID", en: "ID" },
    "common.date": { id: "Tanggal", en: "Date" },
    "common.amount": { id: "Nominal", en: "Amount" },
    "common.status": { id: "Status", en: "Status" },
    "common.details": { id: "Detail", en: "Details" },

    "mitra.download_report": { id: "Download Laporan PDF", en: "Download PDF Report" },
    "mitra.filter_search": { id: "Filter & Pencarian", en: "Filter & Search" },
    "mitra.search_label": { id: "Cari Program atau Alokasi", en: "Search Program or Allocation" },
    "mitra.search_placeholder": { id: "Cari Sekarang", en: "Search Now" },
    "mitra.date_from": { id: "Dari Tanggal", en: "Date From" },
    "mitra.date_to": { id: "Sampai", en: "To" },
    "mitra.allocation_unit": { id: "Alokasi Dana", en: "Fund Allocation" },
    "mitra.allocation_nominal": { id: "Nominal Alokasi", en: "Allocation Amount" },
    "mitra.allocation_program": { id: "Program Alokasi", en: "Allocation Program" },
    "mitra.purpose": { id: "Keterangan / Tujuan", en: "Purpose / Description" },
    "mitra.allocation_date": { id: "Tanggal Alokasi", en: "Allocation Date" },
    "mitra.transaction_status": { id: "Status Transaksi", en: "Transaction Status" },
    "mitra.verified_success": { id: "Berhasil Terverifikasi", en: "Successfully Verified" },
    "mitra.proof_usage": { id: "Bukti Penggunaan", en: "Proof of Usage" },
    "mitra.full_size": { id: "Buka Ukuran Penuh", en: "Open Full Size" },
    "mitra.no_proof": { id: "Tidak ada bukti foto dilampirkan.", en: "No proof photo attached." },
    "mitra.data_not_found": { id: "Data tidak ditemukan", en: "Data not found" },

    // Donation Specifics
    "mitra.donations_subtitle": { id: "Pantau riwayat donasi yang Anda terima secara transparan.", en: "Monitor your received donation history transparently." },
    "mitra.export_pdf": { id: "Ekspor PDF", en: "Export PDF" },
    "mitra.search_program_placeholder": { id: "Cari nama program...", en: "Search program name..." },
    "mitra.date_to_label": { id: "Sampai Tanggal", en: "To Date" },
    "mitra.donation_code": { id: "Kode Donasi", en: "Donation Code" },
    "mitra.program": { id: "Program", en: "Program" },
    "mitra.showing_info": { id: "Menampilkan {count} dari {total} donasi", en: "Showing {count} of {total} donations" },
};

export function translate(dict: Dict, locale: Locale, key: string, fallback?: string) {
    const found = dict[key];
    if (found) return found[locale];
    return fallback ?? key;
}
