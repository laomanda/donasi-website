import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFilter, faMagnifyingGlass, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";

type OrganizationMember = {
  id: number;
  name: string;
  slug?: string | null;
  position_title: string;
  group: string;
  photo_path?: string | null;
  short_bio?: string | null;
  email?: string | null;
  phone?: string | null;
  show_contact: boolean;
  order: number;
  is_active: boolean;
  updated_at?: string | null;
  created_at?: string | null;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

const GROUP_SUGGESTIONS = ["Pembina", "Pengawas", "Pengurus", "Staff", "Relawan", "Lainnya"];

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

const getStatusTone = (active: boolean) =>
  active ? "bg-emerald-600 text-white ring-emerald-600" : "bg-red-600 text-white ring-red-600";
const getContactTone = (visible: boolean) =>
  visible ? "bg-sky-600 text-white ring-sky-600" : "bg-amber-500 text-white ring-amber-500";
const groupTone = "bg-slate-800 text-white ring-slate-800";

export function EditorOrganizationMembersPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<OrganizationMember[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = Boolean(q.trim() || group.trim());
  const filterInitializedRef = useRef(false);
  const skipFilterRef = useRef(false);

  const fetchMembers = async (
    nextPage: number,
    overrides?: Partial<{ q: string; group: string; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const groupValue = (overrides?.group ?? group).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<OrganizationMember>>("/editor/organization-members", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          group: groupValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data struktur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  useEffect(() => {
    if (!filterInitializedRef.current) {
      filterInitializedRef.current = true;
      return;
    }
    if (skipFilterRef.current) {
      skipFilterRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void fetchMembers(1, { q, group });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [q, group]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onResetFilters = () => {
    skipFilterRef.current = true;
    setQ("");
    setGroup("");
    void fetchMembers(1, { q: "", group: "" });
  };

  const goShow = (id: number) => navigate(`/editor/organization-members/${id}`);
  const goEdit = (id: number) => navigate(`/editor/organization-members/${id}/edit`);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Organisasi
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Struktur</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kelola anggota struktur organisasi: jabatan, grup, foto, kontak, dan status publik.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-brandGreen-700 ring-1 ring-brandGreen-100">
                Total: <span className="ml-1 font-bold text-slate-900">{total}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/editor/organization-members/create")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            Tambah Anggota
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Cari</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama atau jabatan..."
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Grup</span>
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Mis. pengurus"
                list="org-group-options"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              />
              <datalist id="org-group-options">
                {GROUP_SUGGESTIONS.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-slate-400">
                <FontAwesomeIcon icon={faFilter} />
              </span>
              <span>Per halaman</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
              >
                {[8, 12, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            {hasFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                disabled={loading}
              >
                Atur ulang
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
          <p className="text-xs font-semibold text-slate-500">Klik nama untuk detail.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-600 bg-rose-500 p-4 text-sm font-semibold text-white">{error}</div>
      ) : null}

      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed text-left">
            <thead className="border-b border-slate-200 bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Anggota</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Grup</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                        <div className="space-y-2">
                          <div className="h-4 w-52 rounded bg-slate-100" />
                          <div className="h-3 w-72 rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-28 rounded-full bg-slate-100" />
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada anggota struktur. Klik "Tambah Anggota" untuk mulai.
                  </td>
                </tr>
              ) : (
                items.map((member) => {
                  const photo = resolveStorageUrl(member.photo_path) ?? imagePlaceholder;
                  const updated = member.updated_at ?? member.created_at;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                            <img
                              src={photo}
                              alt={member.name}
                              className="h-full w-full object-cover"
                              onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
                            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{member.position_title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${groupTone}`}>
                          {member.group}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(member.is_active))}`}>
                            {member.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getContactTone(member.show_contact)}`}>
                            {member.show_contact ? "Kontak tampil" : "Kontak sembunyi"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDate(updated)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => goShow(member.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                            aria-label="Detail"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            type="button"
                            onClick={() => goEdit(member.id)}
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
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Belum ada anggota struktur. Klik "Tambah Anggota" untuk mulai.
            </div>
          ) : (
            items.map((member) => {
              const photo = resolveStorageUrl(member.photo_path) ?? imagePlaceholder;
              const updated = member.updated_at ?? member.created_at;
              return (
                <div key={member.id} className="p-5">
                  <button type="button" onClick={() => goShow(member.id)} className="block w-full text-left">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                        <img
                          src={photo}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-slate-900">{member.name}</p>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-600">{member.position_title}</p>
                      </div>
                    </div>
                  </button>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${groupTone}`}>
                        {member.group}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(member.is_active))}`}>
                        {member.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => goShow(member.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                        aria-label="Detail"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        type="button"
                        onClick={() => goEdit(member.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                        aria-label="Ubah"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500">Diperbarui: {formatDate(updated)}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-500">Halaman {page} dari {lastPage}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchMembers(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => void fetchMembers(Math.min(lastPage, page + 1))}
              disabled={loading || page >= lastPage}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorOrganizationMembersPage;




