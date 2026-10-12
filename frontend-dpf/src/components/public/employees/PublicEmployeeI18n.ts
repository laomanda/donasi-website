import type { Dict } from "@/lib/i18n-utils";

export const publicEmployeeDict: Dict = {
  // Page Directory
  "employees.page.title": { id: "Direktori Karyawan | DPF", en: "Employee Directory | DPF" },
  "employees.header.badge": { id: "Profil publik", en: "Public profile" },
  "employees.header.title": { id: "Direktori Karyawan", en: "Employee Directory" },

  // Filters
  "employees.filter.search.label": { id: "Cari nama karyawan", en: "Search employee name" },
  "employees.filter.search.placeholder": { id: "Cari nama karyawan...", en: "Search employee name..." },
  "employees.filter.position.label": { id: "Jabatan", en: "Position" },
  "employees.filter.position.placeholder": { id: "Semua jabatan", en: "All positions" },
  "employees.filter.division.label": { id: "Divisi", en: "Division" },
  "employees.filter.division.placeholder": { id: "Semua divisi", en: "All divisions" },
  "employees.filter.empty": { id: "Tidak ada pilihan.", en: "No options available." },

  // States
  "employees.state.loading": { id: "Memuat direktori...", en: "Loading directory..." },
  "employees.state.error.title": { id: "Direktori belum dapat dimuat.", en: "Failed to load directory." },
  "employees.state.error.desc": { id: "Periksa koneksi lalu coba lagi.", en: "Please check your connection and try again." },
  "employees.state.empty.title": { id: "Karyawan tidak ditemukan.", en: "No employees found." },
  "employees.state.empty.desc": { id: "Coba ubah kata kunci atau filter.", en: "Try changing your search keywords or filters." },

  // Pagination
  "employees.pagination.showing": { id: "Menampilkan", en: "Showing" },
  "employees.pagination.of": { id: "dari", en: "of" },
  "employees.pagination.employees": { id: "karyawan", en: "employees" },
  "employees.pagination.prev": { id: "Sebelumnya", en: "Previous" },
  "employees.pagination.next": { id: "Berikutnya", en: "Next" },

  // Detail Page
  "employees.detail.page.title": { id: "Profil Karyawan | DPF", en: "Employee Profile | DPF" },
  "employees.detail.directory.title": { id: "Direktori Karyawan", en: "Employee Directory" },
  "employees.detail.loading": { id: "Memuat profil...", en: "Loading profile..." },
  "employees.detail.error.title": { id: "Profil belum dapat dimuat.", en: "Failed to load profile." },
  "employees.detail.error.back": { id: "← Direktori Karyawan", en: "← Employee Directory" },
  "employees.detail.badge": { id: "Profil karyawan", en: "Employee profile" },
  "employees.detail.status.active": { id: "Aktif", en: "Active" },
  "employees.detail.status.inactive": { id: "Tidak Aktif", en: "Inactive" },

  // Detail Fields
  "employees.detail.field.code": { id: "ID Pegawai", en: "Employee ID" },
  "employees.detail.field.gelar": { id: "Gelar", en: "Degree / Title" },
  "employees.detail.field.position": { id: "Jabatan", en: "Position" },
  "employees.detail.field.division": { id: "Divisi", en: "Division" },
  "employees.detail.field.status": { id: "Status", en: "Status" },
  "employees.detail.field.email": { id: "Email", en: "Email" },
  "employees.detail.field.phone": { id: "No. Telepon", en: "Phone Number" },

  // Detail Footer CTA
  "employees.detail.cta.title": { id: "Lihat Karyawan Lain", en: "View Other Employees" },
  "employees.detail.cta.desc": { id: "Kembali ke direktori untuk menjelajahi profil lainnya.", en: "Return to directory to explore other profiles." },
  "employees.detail.cta.button": { id: "Buka Direktori", en: "Open Directory" },
};
