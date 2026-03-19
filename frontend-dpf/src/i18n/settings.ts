import type { Locale } from "../lib/i18n";

type Dict = Record<string, { id: string; en: string }>;

export const settingsDict: Dict = {
    // Hero Section
    "settings.hero.active_session": { id: "Sesi Aktif", en: "Active Session" },
    "settings.hero.back_to_dashboard": { id: "Ke Dashboard", en: "Back to Dashboard" },
    "settings.hero.email_not_available": { id: "Email belum tersedia", en: "Email not available" },

    // Sidebar
    "settings.sidebar.title": { id: "NAVIGASI PENGATURAN", en: "SETTINGS NAVIGATION" },
    "settings.sidebar.account": { id: "Informasi Akun", en: "Account Information" },
    "settings.sidebar.security": { id: "Kata Sandi", en: "Password & Security" },
    "settings.sidebar.info": { id: "SEMUA PERUBAHAN AKAN LANGSUNG DITERAPKAN KE SISTEM.", en: "ALL CHANGES WILL BE IMMEDIATELY APPLIED TO THE SYSTEM." },

    // Account Section
    "settings.account.title": { id: "Informasi Akun", en: "Account Information" },
    "settings.account.subtitle": { id: "Detail identitas dan akses akun Anda.", en: "Your identity details and account access." },
    "settings.account.full_name": { id: "Nama Lengkap", en: "Full Name" },
    "settings.account.email_address": { id: "Alamat Email", en: "Email Address" },
    "settings.account.access_level": { id: "Tingkat Akses / Role", en: "Access Level / Role" },
    "settings.account.session_status": { id: "Status Sesi", en: "Session Status" },
    "settings.account.status_active": { id: "Terverifikasi Aktif", en: "Verified Active" },
    "settings.account.status_inactive": { id: "Tidak Aktif", en: "Inactive" },
    "settings.account.copy_email": { id: "Salin Email Profil", en: "Copy Profile Email" },
    "settings.account.copy_success": { id: "{label} berhasil disalin.", en: "{label} copied successfully." },
    "settings.account.copy_fail": { id: "Tidak bisa menyalin {label}.", en: "Cannot copy {label}." },
    "settings.account.empty_fail": { id: "{label} kosong.", en: "{label} is empty." },

    // Security Section
    "settings.security.title": { id: "Kata Sandi", en: "Password" },
    "settings.security.subtitle": { id: "Ubah kata sandi Anda secara berkala untuk menjaga keamanan akun.", en: "Change your password regularly to keep your account secure." },
    "settings.security.current_password": { id: "Password Saat Ini", en: "Current Password" },
    "settings.security.current_password_placeholder": { id: "Masukkan password lama", en: "Enter current password" },
    "settings.security.new_password": { id: "Password Baru", en: "New Password" },
    "settings.security.new_password_placeholder": { id: "Minimal 8 karakter", en: "Minimum 8 characters" },
    "settings.security.confirm_password": { id: "Konfirmasi Password Baru", en: "Confirm New Password" },
    "settings.security.confirm_password_placeholder": { id: "Ulangi password baru", en: "Repeat new password" },
    "settings.security.show_password": { id: "Tampilkan", en: "Show" },
    "settings.security.hide_password": { id: "Sembunyikan", en: "Hide" },
    "settings.security.reset": { id: "Batal / Reset", en: "Cancel / Reset" },
    "settings.security.save": { id: "Simpan Perubahan", en: "Save Changes" },
    "settings.security.saving": { id: "Menyimpan...", en: "Saving..." },

    // Role Labels
    "role.superadmin": { id: "Super Admin", en: "Super Admin" },
    "role.admin": { id: "Admin", en: "Admin" },
    "role.mitra": { id: "Partner / Mitra", en: "Partner / Mitra" },
    "role.editor": { id: "Editor", en: "Editor" },

    // Validation
    "settings.validation.current_required": { id: "Password saat ini wajib diisi.", en: "Current password is required." },
    "settings.validation.new_required": { id: "Password baru wajib diisi.", en: "New password is required." },
    "settings.validation.min_length": { id: "Password baru minimal 8 karakter.", en: "New password must be at least 8 characters." },
    "settings.validation.confirm_required": { id: "Konfirmasi password wajib diisi.", en: "Password confirmation is required." },
    "settings.validation.mismatch": { id: "Konfirmasi password tidak sama.", en: "Password confirmation does not match." },
    "settings.validation.success": { id: "Password berhasil diperbarui.", en: "Password updated successfully." },
    "settings.validation.fail": { id: "Gagal memperbarui password.", en: "Failed to update password." },
};

export function translate(dict: Dict, locale: Locale, key: string, fallback?: string): string {
    const found = dict[key];
    if (!found) return fallback ?? key;
    return found[locale] ?? found.id;
}
