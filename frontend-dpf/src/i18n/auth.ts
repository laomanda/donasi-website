import type { Locale } from "../lib/i18n";

type Dict = Record<string, { id: string; en: string }>;

export const authDict: Dict = {
    // Shared
    "auth.email": { id: "Email", en: "Email" },
    "auth.password": { id: "Kata Sandi", en: "Password" },
    "auth.password_placeholder": { id: "********", en: "********" },
    "auth.processing": { id: "Memproses...", en: "Processing..." },
    "auth.google_login": { id: "Gunakan Google", en: "Use Google" },
    "auth.or": { id: "Atau", en: "Or" },

    // Login Page
    "login.title": { id: "Masuk", en: "Login" },
    "login.subtitle": { id: "Gunakan akun internal Anda untuk melanjutkan.", en: "Use your internal account to continue." },
    "login.email_placeholder": { id: "nama@dpf.or.id", en: "name@dpf.or.id" },
    "login.remember_me": { id: "Ingat saya", en: "Remember me" },
    "login.google_success": { id: "Login Google Berhasil!", en: "Google Login Successful!" },
    "login.google_fail": { id: "Gagal melakukan login Google. Pastikan akun belum terdaftar sebagai Admin.", en: "Failed to perform Google login. Ensure the account is not registered as Admin." },
    "login.google_connection_error": { id: "Gagal terhubung dengan layanan Google.", en: "Failed to connect with Google services." },
    "login.mitra_interest": { id: "Tertarik menjadi mitra?", en: "Interested in becoming a partner?" },
    "login.register_mitra": { id: "Daftar Sekarang", en: "Register Now" },
    "login.error_title": { id: "Password Salah", en: "Invalid Password" },
    "login.error_subtitle": { id: "Email atau kata sandi tidak sesuai.", en: "Invalid email or password." },

    // Register Page
    "register.badge": { id: "Registrasi Mitra", en: "Partner Registration" },
    "register.title": { id: "Daftar Akun Mitra", en: "Register Partner Account" },
    "register.subtitle": { id: "Lengkapi data institusi Anda untuk memulai kolaborasi kebaikan.", en: "Complete your institution's data to start a collaboration of goodness." },
    "register.left_panel_title": { id: "Mari Melangkah Bersama", en: "Let's Step Together" },
    "register.left_panel_desc": { id: "Bergabunglah sebagai mitra strategis DPF WAKAF. Bersama, kita perluas jangkauan manfaat bagi umat.", en: "Join as a strategic partner of DPF WAKAF. Together, we expand the reach of benefits for the community." },
    "register.pic_name": { id: "Nama Penanggung Jawab", en: "Person in Charge Name" },
    "register.pic_name_placeholder": { id: "Nama lengkap Anda", en: "Your full name" },
    "register.institution_name": { id: "Nama Institusi / Lembaga", en: "Institution Name" },
    "register.institution_name_placeholder": { id: "Perusahaan atau yayasan", en: "Company or foundation" },
    "register.whatsapp": { id: "Nomor WhatsApp", en: "WhatsApp Number" },
    "register.email_placeholder": { id: "nama@institusi.com", en: "name@institution.com" },
    "register.city": { id: "Kota / Kabupaten", en: "City / Regency" },
    "register.city_placeholder": { id: "Pilih Kota", en: "Select City" },
    "register.confirm_password": { id: "Konfirmasi Kata Sandi", en: "Confirm Password" },
    "register.submit": { id: "Buat Akun Mitra", en: "Create Partner Account" },
    "register.success_title": { id: "Pendaftaran Berhasil!", en: "Registration Successful!" },
    "register.success_subtitle": { id: "Akun Anda telah terdaftar. Silakan masuk untuk melanjutkan.", en: "Your account has been registered. Please login to continue." },
    "register.already_have_account": { id: "Sudah memiliki akun? Masuk di sini", en: "Already have an account? Login here" },

    // Validation
    "validation.required": { id: "Wajib diisi.", en: "This field is required." },
    "validation.email": { id: "Format email tidak valid.", en: "Invalid email format." },
    "validation.password_min": { id: "Kata sandi minimal harus 8 karakter.", en: "The password must be at least 8 characters." },
    "validation.password_confirmed": { id: "Konfirmasi kata sandi tidak cocok.", en: "Password confirmation does not match." },
    "validation.unique_email": { id: "Email sudah terdaftar.", en: "The email has already been taken." },
};

export function translate(dict: Dict, locale: Locale, key: string, fallback?: string) {
    const found = dict[key];
    if (found) return found[locale];
    return fallback ?? key;
}
