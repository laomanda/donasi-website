import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faCircleCheck,
  faCircleInfo,
  faKey,
  faMagnifyingGlass,
  faShieldHalved,
  faToggleOff,
  faToggleOn,
  faUserGroup,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";
import http from "../../../lib/http";

/* --- Types --- */

type Permission = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
  guard_name?: string | null;
  users_count?: number;
  permissions?: Permission[];
  created_at?: string | null;
  updated_at?: string | null;
};

/* --- Helpers --- */

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const titleCase = (value: string) => {
  const clean = String(value ?? "").trim();
  if (!clean) return "-";
  // Menghilangkan underscore/dash dan kapitalisasi awal kata
  return clean
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
};

// Logika warna badge yang lebih soft & premium
const permissionTone = (name: string) => {
  const key = String(name ?? "").toLowerCase();
  if (key.includes("donation") || key.includes("transaction")) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (key.includes("program") || key.includes("campaign")) return "bg-sky-50 text-sky-700 ring-sky-100";
  if (key.includes("user") || key.includes("member")) return "bg-violet-50 text-violet-700 ring-violet-100";
  if (key.includes("delete") || key.includes("destroy")) return "bg-rose-50 text-rose-700 ring-rose-100";
  if (key.includes("create") || key.includes("store")) return "bg-indigo-50 text-indigo-700 ring-indigo-100";
  return "bg-slate-50 text-slate-600 ring-slate-200";
};

/* --- Component --- */

export function SuperAdminRolesPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routeQ = useMemo(() => (params.get("q") ?? "").trim(), [params]);
  const [q, setQ] = useState(routeQ);
  const [showPermissions, setShowPermissions] = useState(true);

  // Fetch Data
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Role[]>("/superadmin/roles");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
      setError("Gagal memuat data peran dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
  }, []);

  useEffect(() => {
    setQ(routeQ);
  }, [routeQ]);

  // Data Transformation
  const normalized = useMemo(() => {
    return items
      .filter((r) => r && typeof r === "object" && typeof r.id === "number")
      .map((r) => ({
        id: r.id,
        name: String(r.name ?? ""),
        guardName: String(r.guard_name ?? ""),
        usersCount: normalizeNumber(r.users_count),
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
        createdAt: r.created_at ?? null,
        updatedAt: r.updated_at ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const allPermissionsCount = useMemo(() => {
    const set = new Set<string>();
    normalized.forEach((role) => {
      role.permissions.forEach((p) => set.add(String(p?.name ?? "").trim()));
    });
    return set.size;
  }, [normalized]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return normalized;
    return normalized.filter((role) => {
      if (role.name.toLowerCase().includes(term)) return true;
      return role.permissions.some((p) => String(p?.name ?? "").toLowerCase().includes(term));
    });
  }, [normalized, q]);

  // Calculate totals for Hero Stats
  const totalUsersInRoles = normalized.reduce((acc, curr) => acc + curr.usersCount, 0);

  return (
    <div className="relative min-h-screen pb-12 font-sans">

      {/* Decorative Background Blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] right-0 h-[600px] w-[600px] rounded-full bg-brandGreen-50/50 blur-[100px]" />
        <div className="absolute top-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary-50/40 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-1 space-y-8">

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-100 text-brandGreen-700">
                <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-brandGreen-700">Akses Sistem</p>
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 md:text-4xl">Manajemen Peran</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Kelola peran dan izin untuk mengatur akses fitur aplikasi.
            </p>
          </div>

          <div className="flex items-center gap-4  bg-primary-200/50 px-2 py-3 rounded-xl">
             <div className="text-right hidden sm:block">
                <p className="text-xs text-black font-bold uppercase tracking-wider">Total Peran</p>
                <p className="font-heading text-2xl font-bold text-slate-900 text-center">{normalized.length}</p>
             </div>
             <div className="h-8 w-px bg-black hidden sm:block" />
             <div className="text-right hidden sm:block">
                <p className="text-xs text-black font-bold uppercase tracking-wider">Penugasan</p>
                <p className="font-heading text-2xl font-bold text-slate-900 text-center">{totalUsersInRoles}</p>
             </div>
          </div>
        </div>

        {/* --- SEARCH & CONTROL BAR --- */}
        <div className="sticky top-4 z-10 rounded-[24px] border border-white/60 bg-white/80 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl ring-1 ring-slate-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">

            {/* Search Field */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari peran (contoh: Admin, Keuangan) atau izin..."
                className="block w-full rounded-2xl border-0 bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brandGreen-500 sm:leading-6 transition-all"
              />
            </div>

            {/* Separator Mobile Hidden */}
            <div className="hidden h-6 w-px bg-slate-200 md:block" />

            {/* Toggle Button */}
            <button
              onClick={() => setShowPermissions((prev) => !prev)}
              className={`flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-95
                ${showPermissions
                  ? "bg-brandGreen-50 text-brandGreen-700 hover:bg-brandGreen-100"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <span>{showPermissions ? "Sembunyikan izin" : "Lihat izin"}</span>
              <FontAwesomeIcon
                icon={showPermissions ? faToggleOn : faToggleOff}
                className={showPermissions ? "text-xl text-brandGreen-600" : "text-xl text-slate-400"}
              />
            </button>
          </div>
        </div>

        {/* --- ERROR ALERT --- */}
        {error && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
            <p className="font-semibold text-red-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-bold text-red-700 hover:underline">
              Coba Muat Ulang
            </button>
          </div>
        )}

        {/* --- CONTENT GRID --- */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {/* STATS CARD (Mobile/Tablet Friendly Summary) */}
          <div className="col-span-full md:col-span-2 xl:col-span-3 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
             <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                   <h3 className="text-xl font-heading font-bold mb-1">Akses Sistem</h3>
                   <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                      Peran menentukan apa yang bisa dilakukan pengguna di dalam aplikasi.
                      Pastikan peran "SuperAdmin" hanya diberikan kepada penanggung jawab utama TI.
                   </p>
                </div>
                <div className="flex gap-6">
                   <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur">
                      <FontAwesomeIcon icon={faKey} className="text-brandGreen-400 text-xl" />
                      <div>
                         <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Izin Unik</p>
                         <p className="text-2xl font-bold">{loading ? "..." : allPermissionsCount}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur">
                      <FontAwesomeIcon icon={faChartPie} className="text-primary-400 text-xl" />
                      <div>
                         <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Peran Aktif</p>
                         <p className="text-2xl font-bold">{loading ? "..." : normalized.length}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* SKELETON LOADING */}
          {loading && Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-32 rounded-full bg-slate-100" />
                  <div className="h-3 w-20 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-3 w-full rounded-full bg-slate-100" />
                <div className="h-3 w-2/3 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <FontAwesomeIcon icon={faUserShield} className="text-2xl text-slate-300" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-700">Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500">Coba kata kunci pencarian lain.</p>
            </div>
          )}

          {/* ROLE CARDS */}
          {!loading && filtered.map((role) => (
            <div
              key={role.id}
              className="group relative flex flex-col rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brandGreen-100 hover:shadow-xl hover:shadow-slate-200/50"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-slate-50 text-slate-600 ring-1 ring-slate-100 transition-colors group-hover:bg-brandGreen-50 group-hover:text-brandGreen-600">
                    <FontAwesomeIcon icon={faUserShield} className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900 line-clamp-1">{titleCase(role.name)}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                           {role.guardName || "web"}
                        </span>
                        {role.name === 'Super Admin' && (
                           <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                              Akses Utama
                           </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 flex divide-x divide-slate-100 border-y border-slate-50 py-3">
                 <div className="flex-1 px-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Terpasang</p>
                    <p className="font-bold text-slate-700 flex items-center justify-center gap-1.5">
                       <FontAwesomeIcon icon={faUserGroup} className="text-xs text-slate-400" />
                       {normalizeNumber(role.usersCount)} Pengguna
                    </p>
                 </div>
                 <div className="flex-1 px-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Akses</p>
                    <p className="font-bold text-brandGreen-700 flex items-center justify-center gap-1.5">
                       <FontAwesomeIcon icon={faCircleCheck} className="text-xs text-brandGreen-500" />
                       {role.permissions?.length ?? 0} Izin
                    </p>
                 </div>
              </div>

              {/* Permissions Area */}
              <div className="mt-5 flex-1">
                {role.permissions && role.permissions.length > 0 ? (
                  <div className={`space-y-3 transition-all duration-500 ${showPermissions ? 'opacity-100' : 'opacity-40 grayscale blur-[2px]'}`}>
                    <p className="text-xs font-semibold text-slate-400">Izin yang termasuk:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(showPermissions ? role.permissions.slice(0, 8) : role.permissions.slice(0, 3)).map((perm) => (
                        <span
                          key={perm.id}
                          className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold shadow-sm ring-1 ring-inset ${permissionTone(perm.name)}`}
                        >
                          {titleCase(perm.name)}
                        </span>
                      ))}
                      {(role.permissions.length > (showPermissions ? 8 : 3)) && (
                        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
                          +{role.permissions.length - (showPermissions ? 8 : 3)} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <span className="text-xs font-medium text-slate-400">Tidak ada izin khusus</span>
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                 <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <FontAwesomeIcon icon={faCircleInfo} />
                    <span>Diperbarui {formatDate(role.updatedAt ?? role.createdAt)}</span>
                 </div>
                 {role.usersCount !== undefined && role.usersCount > 0 && (
                    <div className="flex -space-x-1.5">
                       {[...Array(Math.min(role.usersCount, 3))].map((_, i) => (
                          <div key={i} className="h-5 w-5 rounded-full border border-white bg-slate-200 shadow-sm" />
                       ))}
                       {role.usersCount > 3 && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-slate-100 text-[8px] font-bold text-slate-500 shadow-sm">
                             +
                          </div>
                       )}
                    </div>
                 )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default SuperAdminRolesPage;

