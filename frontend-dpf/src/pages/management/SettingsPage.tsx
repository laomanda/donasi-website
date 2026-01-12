import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faArrowUpRightFromSquare,
  faCircleInfo,
  faGear,
  faGlobe,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../lib/http";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import type { DashboardRole } from "../../layouts/dashboard/DashboardLayout";
import dpfLogo from "../../brand/dpf-icon.png";
import { useToast } from "../../components/ui/ToastProvider";
import { SETTINGS_EVENT, readSearchLimit, readShowClock, setSearchLimit, setShowClock } from "../../lib/settings";

const roleLabel = (role: DashboardRole) => {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Editor";
};

type BackendSetting = {
  id?: number;
  key: string;
  value: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const toSettingValueString = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left shadow-sm transition",
        checked
          ? "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-900"
          : "border-slate-200 bg-white text-slate-900 hover:border-brandGreen-200 hover:bg-brandGreen-50",
      ].join(" ")}
    >
      <span className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-1 text-xs font-semibold text-slate-600">{description}</p>
      </span>
      <span
        aria-hidden="true"
        className={[
          "relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 ring-inset transition",
          checked ? "bg-brandGreen-600 ring-brandGreen-500" : "bg-slate-200 ring-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
            checked ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export function SettingsPage({ role }: { role: DashboardRole }) {
  const navigate = useNavigate();
  const toast = useToast();

  const user = useMemo(() => getAuthUser(), []);
  const tokenExists = useMemo(() => Boolean(getAuthToken()), []);
  const canManageBackendSettings = role === "admin" || role === "superadmin";

  const displayName = useMemo(() => {
    const value = String(user?.name ?? roleLabel(role)).trim();
    return value || roleLabel(role);
  }, [role, user?.name]);

  const displayEmail = useMemo(() => {
    const value = String(user?.email ?? "").trim();
    return value || "Email belum tersedia";
  }, [user?.email]);

  const [searchLimit, setSearchLimitState] = useState(() => readSearchLimit());
  const [showClock, setShowClockState] = useState(() => readShowClock());

  const [backendSettings, setBackendSettings] = useState<BackendSetting[]>([]);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendQuery, setBackendQuery] = useState("");
  const [backendKey, setBackendKey] = useState("");
  const [backendValue, setBackendValue] = useState("");
  const [backendSaving, setBackendSaving] = useState(false);

  useEffect(() => {
    const onSync = () => {
      setSearchLimitState(readSearchLimit());
      setShowClockState(readShowClock());
    };
    window.addEventListener(SETTINGS_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  useEffect(() => {
    if (!canManageBackendSettings) return;

    let active = true;
    setBackendLoading(true);
    setBackendError(null);
    http
      .get<BackendSetting[]>("/admin/settings")
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setBackendSettings(
          list
            .filter((item) => item && typeof item === "object" && typeof (item as any).key === "string")
            .map((item) => ({
              id: typeof (item as any).id === "number" ? (item as any).id : undefined,
              key: String((item as any).key),
              value:
                (item as any).value === null || (item as any).value === undefined
                  ? null
                  : String((item as any).value),
              created_at: typeof (item as any).created_at === "string" ? (item as any).created_at : undefined,
              updated_at: typeof (item as any).updated_at === "string" ? (item as any).updated_at : undefined,
            }))
        );
      })
      .catch(() => {
        if (!active) return;
        setBackendSettings([]);
        setBackendError("Gagal memuat pengaturan backend.");
      })
      .finally(() => active && setBackendLoading(false));

    return () => {
      active = false;
    };
  }, [canManageBackendSettings]);

  const filteredBackendSettings = useMemo(() => {
    const term = backendQuery.trim().toLowerCase();
    const list = [...backendSettings].sort((a, b) => a.key.localeCompare(b.key));
    if (!term) return list;
    return list.filter((item) => item.key.toLowerCase().includes(term));
  }, [backendQuery, backendSettings]);

  const onPickBackendSetting = (item: BackendSetting) => {
    setBackendKey(item.key);
    setBackendValue(toSettingValueString(item.value));
  };

  const onSaveBackendSetting = async () => {
    const key = backendKey.trim();
    if (!key) {
      toast.error("Key wajib diisi.", { title: "Gagal" });
      return;
    }

    setBackendSaving(true);
    try {
      const value = backendValue.trim();
      await http.put("/admin/settings", {
        settings: [{ key, value: value ? value : null }],
      });

      setBackendSettings((prev) => {
        const existingIndex = prev.findIndex((s) => s.key === key);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], value: value ? value : null };
          return next;
        }
        return [...prev, { key, value: value ? value : null }];
      });

      toast.success("Pengaturan berhasil disimpan.", { title: "Berhasil" });
    } catch {
      toast.error("Gagal menyimpan pengaturan.", { title: "Gagal" });
    } finally {
      setBackendSaving(false);
    }
  };

  const onCopy = async (value: string, label: string) => {
    const text = String(value ?? "");
    if (!text.trim()) {
      toast.error(`${label} kosong.`, { title: "Gagal" });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin.`, { title: "Berhasil" });
    } catch {
      toast.error(`Tidak bisa menyalin ${label}.`, { title: "Gagal" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-primary-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-primary-100 bg-primary-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
              <img src={dpfLogo} alt="DPF" className="h-8 w-8 object-contain" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.18em] text-primary-700">Pengaturan</p>
              <h1 className="mt-1 truncate font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Pengaturan {roleLabel(role)}
              </h1>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-600">
                Panel pengaturan untuk akun, preferensi kerja, dan konfigurasi backend.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/${role}/dashboard`)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-5 py-3 text-sm font-bold text-primary-600 shadow-sm transition hover:bg-primary-600 hover:text-white"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              Ke dashboard
            </button>
            <button
              type="button"
              onClick={() => window.open("/", "_blank", "noopener,noreferrer")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-800"
            >
              <FontAwesomeIcon icon={faGlobe} />
              Buka website
            </button>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Peran</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{roleLabel(role)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Sesi</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{tokenExists ? "Aktif" : "Tidak ada"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Jam kerja</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{showClock ? "Ditampilkan" : "Disembunyikan"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Limit pencarian</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{searchLimit} item</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          <section
            id="account"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-primary-100 bg-white shadow-sm"
          >
            <div className="border-b border-primary-100 bg-primary-50 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-primary-700">Akun</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Identitas akun</h2>
                  <p className="mt-2 text-sm text-slate-600">Detail akun dan informasi sesi.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Nama</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{displayName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Email</p>
                  <p className="mt-2 truncate text-sm font-bold text-slate-900">{displayEmail}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Peran</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{roleLabel(role)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Sesi</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{tokenExists ? "Aktif" : "Tidak ada"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => void onCopy(displayEmail === "Email belum tersedia" ? "" : displayEmail, "Email")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Salin email
                </button>
              </div>
            </div>
          </section>

          <section
            id="preferences"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-brandGreen-800 bg-brandGreen-700 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brandGreen-800 shadow-sm">
                  <FontAwesomeIcon icon={faGear} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-brandGreen-50">Preferensi</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-white">Pengaturan tampilan</h2>
                  <p className="mt-2 text-sm text-brandGreen-50">Sesuaikan tampilan agar kerja lebih nyaman.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-brandGreen-100 bg-brandGreen-50 p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-brandGreen-700">Pencarian</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">Jumlah item per kategori</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">Berlaku untuk halaman pencarian.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select
                      value={searchLimit}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setSearchLimitState(next);
                        setSearchLimit(next);
                        toast.success("Preferensi pencarian diperbarui.", { title: "Berhasil" });
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100 sm:w-60"
                    >
                      {[5, 8, 10, 12, 15].map((n) => (
                        <option key={n} value={n}>
                          {n} item
                        </option>
                      ))}
                    </select>
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Aktif: {searchLimit} item
                    </span>
                  </div>
                </div>

                <Toggle
                  label="Tampilkan jam kerja"
                  description="Jam kerja muncul di header (sebelah kolom pencarian)."
                  checked={showClock}
                  onChange={(next) => {
                    setShowClockState(next);
                    setShowClock(next);
                    toast.success("Preferensi tampilan diperbarui.", { title: "Berhasil" });
                  }}
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchLimitState(5);
                      setSearchLimit(5);
                      setShowClockState(true);
                      setShowClock(true);
                      toast.success("Preferensi dikembalikan ke default.", { title: "Berhasil" });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faArrowRotateRight} />
                    Atur ulang preferensi
                  </button>
                </div>
              </div>
            </div>
          </section>

          {canManageBackendSettings ? (
            <section
              id="backend"
              className="scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-brandGreen-50 px-6 py-5 sm:px-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brandGreen-700 shadow-sm ring-1 ring-brandGreen-100">
                    <FontAwesomeIcon icon={faShieldHalved} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-[0.18em] text-brandGreen-700">Backend</p>
                    <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Pengaturan server</h2>
                    <p className="mt-2 text-sm text-slate-700">
                      Kelola kunci-nilai pengaturan dari server (endpoint <span className="font-bold">/admin/settings</span>).
                    </p>
                  </div>
                </div>
              </div>

              {backendError ? (
                <div className="px-6 pt-6 sm:px-8">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {backendError}
                  </div>
                </div>
              ) : null}

              <div className="px-6 py-6 sm:px-8">
                <div className="grid gap-4 xl:grid-cols-12">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 xl:col-span-5">
                    <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Ubah pengaturan</p>
                    <div className="mt-4 grid gap-3">
                      <label className="block">
                        <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Key</span>
                        <input
                          value={backendKey}
                          onChange={(e) => setBackendKey(e.target.value)}
                          placeholder="Mis. site_name"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                          disabled={backendLoading || backendSaving}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Value</span>
                        <textarea
                          value={backendValue}
                          onChange={(e) => setBackendValue(e.target.value)}
                          placeholder="Isi value (kosong = null)."
                          rows={6}
                          className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                          disabled={backendLoading || backendSaving}
                        />
                      </label>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setBackendKey("");
                            setBackendValue("");
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          disabled={backendLoading || backendSaving}
                        >
                          Atur ulang
                        </button>
                        <button
                          type="button"
                          onClick={() => void onSaveBackendSetting()}
                          className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={backendLoading || backendSaving}
                        >
                          {backendSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-start gap-2">
                        <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                        Value disimpan sebagai string. Jika ingin menyimpan JSON, paste string JSON apa adanya.
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <label className="block w-full sm:max-w-sm">
                        <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Saring kunci</span>
                        <input
                          value={backendQuery}
                          onChange={(e) => setBackendQuery(e.target.value)}
                          placeholder="Cari kunci..."
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                          disabled={backendLoading}
                        />
                      </label>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 whitespace-nowrap">
                        {backendLoading ? (
                          "Memuat..."
                        ) : (
                          <>
                            <span className="tabular-nums">{filteredBackendSettings.length}</span>
                            <span>kunci</span>
                          </>
                        )}
                      </span>
                    </div>

                  <div className="mt-4 space-y-2">
                    {backendLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 animate-pulse">
                          <div className="h-4 w-2/3 rounded bg-slate-100" />
                          <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                        </div>
                      ))
                    ) : filteredBackendSettings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                        Tidak ada kunci yang cocok.
                      </div>
                    ) : (
                      filteredBackendSettings.slice(0, 30).map((item) => {
                        const selected = backendKey.trim() === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => onPickBackendSetting(item)}
                            className={[
                              "w-full rounded-2xl border p-4 text-left shadow-sm transition",
                              selected
                                ? "border-brandGreen-100 bg-brandGreen-50"
                                : "border-slate-100 bg-white hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">{item.key}</p>
                                <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-600">
                                  {toSettingValueString(item.value) || "-"}
                                </p>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brandGreen-700 ring-1 ring-brandGreen-100">
                                Pilih
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {filteredBackendSettings.length > 30 ? (
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Menampilkan 30 kunci pertama. Gunakan kolom pencarian untuk mempersempit.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            </section>
          ) : null}
      </div>
    </div>
  );
}

export default SettingsPage;

