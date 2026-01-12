import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faMagnifyingGlass, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type Partner = {
  id: number;
  name: string;
  logo_path?: string | null;
  url?: string | null;
  description?: string | null;
  order: number;
  is_active: boolean;
  updated_at?: string | null;
  created_at?: string | null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getBackendBaseUrl = () => {
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

const normalizeUrlLabel = (url?: string | null) => {
  const value = String(url ?? "").trim();
  if (!value) return null;
  return value.replace(/^https?:\/\//, "");
};

const getStatusTone = (isActive: boolean) =>
  isActive
    ? "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100"
    : "bg-slate-100 text-slate-700 ring-slate-200";

export function AdminPartnersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Partner[]>("/admin/partners");
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
    } catch {
      setError("Gagal memuat data mitra.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const statusValue = status;

    const list = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list.filter((p) => {
      const matchQuery =
        !term ||
        String(p.name ?? "").toLowerCase().includes(term) ||
        String(p.url ?? "").toLowerCase().includes(term);
      const matchStatus =
        statusValue === ""
          ? true
          : statusValue === "active"
            ? p.is_active === true
            : p.is_active === false;
      return matchQuery && matchStatus;
    });
  }, [items, q, status]);

  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

  useEffect(() => {
    selection.keepOnly(filteredIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds.join(",")]);

  const activeCount = useMemo(() => items.filter((p) => p.is_active).length, [items]);

  const goEdit = (id: number) => navigate(`/admin/partners/${id}/edit`);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/partners/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} mitra.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchPartners();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Organisasi
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Mitra</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kelola mitra yang tampil di landing page: logo, tautan, urutan, dan status aktif.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-primary-700 ring-1 ring-primary-100">
                Total: <span className="ml-1 font-bold text-slate-900">{items.length}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-brandGreen-700 ring-1 ring-brandGreen-100">
                Aktif: <span className="ml-1 font-bold">{activeCount}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/partners/create")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            Tambah Mitra
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Pencarian</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama mitra atau URL..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("");
            }}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Atur ulang
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="mitra"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(filteredIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="border-b border-primary-100 bg-primary-50">
              <tr className="text-xs font-bold tracking-wide text-slate-500">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={filteredIds.length > 0 && filteredIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(filteredIds)}
                    aria-label="Pilih semua mitra yang ditampilkan"
                    className="h-4 w-4"
                  />
                </th>
                <th className="px-6 py-4">Urutan</th>
                <th className="px-6 py-4">Mitra</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Diperbarui</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-4 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-14 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                        <div className="space-y-2">
                          <div className="h-4 w-40 rounded bg-slate-100" />
                          <div className="h-3 w-56 rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-40 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada mitra yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((partner) => {
                  const logo = resolveStorageUrl(partner.logo_path) ?? imagePlaceholder;
                  const urlLabel = normalizeUrlLabel(partner.url);
                  const updated = partner.updated_at ?? partner.created_at;
                  return (
                    <tr key={partner.id} className="hover:bg-primary-50">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selection.isSelected(partner.id)}
                          onChange={() => selection.toggle(partner.id)}
                          aria-label={`Pilih mitra ${partner.name}`}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          #{partner.order ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                            <img
                              src={logo}
                              alt={partner.name}
                              className="h-full w-full object-contain p-2"
                              onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{partner.name}</p>
                            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                              {partner.description ? partner.description : "Tanpa deskripsi."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {urlLabel ? (
                          <a
                            href={partner.url ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                          >
                            <FontAwesomeIcon icon={faGlobe} className="text-slate-500" />
                            <span className="max-w-[16rem] truncate">{urlLabel}</span>
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(partner.is_active))}`}>
                          {partner.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDate(updated)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => goEdit(partner.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                            aria-label="Ubah"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-24 rounded-full bg-slate-100" />
                  <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Belum ada mitra yang cocok.
            </div>
          ) : (
            filtered.map((partner) => {
              const logo = resolveStorageUrl(partner.logo_path) ?? imagePlaceholder;
              const updated = partner.updated_at ?? partner.created_at;
              return (
                <div key={partner.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(partner.id)}
                        onChange={() => selection.toggle(partner.id)}
                        aria-label={`Pilih mitra ${partner.name}`}
                        className="mt-1 h-4 w-4"
                      />
                    </span>
                    <button type="button" onClick={() => goEdit(partner.id)} className="block w-full text-left">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                        <img
                          src={logo}
                          alt={partner.name}
                          className="h-full w-full object-contain p-2"
                          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-slate-900">{partner.name}</p>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                          {partner.description ? partner.description : "Tanpa deskripsi."}
                        </p>
                      </div>
                    </div>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        #{partner.order ?? 0}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(partner.is_active))}`}>
                        {partner.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => goEdit(partner.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                      aria-label="Ubah"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500">Diperbarui: {formatDate(updated)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPartnersPage;



