import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_visible_public: boolean;
  order: number;
  updated_at?: string | null;
  created_at?: string | null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getStatusTone = (isActive: boolean) =>
  isActive
    ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600"
    : "bg-slate-500 text-white shadow-sm ring-1 ring-slate-500";

export function AdminBankAccountsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<BankAccount[]>("/admin/bank-accounts");
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
    } catch {
      setError("Gagal memuat data rekening.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list.filter((acc) => {
      const matchQuery =
        !term ||
        String(acc.bank_name ?? "").toLowerCase().includes(term) ||
        String(acc.account_number ?? "").toLowerCase().includes(term) ||
        String(acc.account_name ?? "").toLowerCase().includes(term);
      const matchStatus =
        status === ""
          ? true
          : status === "active"
            ? acc.is_visible_public === true
            : acc.is_visible_public === false;
      return matchQuery && matchStatus;
    });
  }, [items, q, status]);

  const filteredIds = useMemo(() => filtered.map((acc) => acc.id), [filtered]);

  useEffect(() => {
    selection.keepOnly(filteredIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds.join(",")]);

  const activeCount = useMemo(() => items.filter((acc) => acc.is_visible_public).length, [items]);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/bank-accounts/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} rekening.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchAccounts();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Keuangan
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Rekening Resmi
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola rekening yang tampil di halaman donasi publik.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-50">
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 ring-1 ring-white/10">
                  Total: <span className="font-bold text-white">{items.length}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 ring-1 ring-white/10">
                  Tampil: <span className="font-bold text-white">{activeCount}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/bank-accounts/create")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-emerald-700 px-6 py-4 text-sm font-bold shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tambah Rekening
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Pencarian</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari bank, nomor, atau atas nama..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Status tampil</span>
              <div className="relative mt-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Tampil</option>
                  <option value="inactive">Disembunyikan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="rekening"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(filteredIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={filteredIds.length > 0 && filteredIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(filteredIds)}
                    aria-label="Pilih semua rekening"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Urutan</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Bank</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nomor</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Atas nama</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Diperbarui</th>
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
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-36 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada rekening yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((acc) => {
                  const updated = acc.updated_at ?? acc.created_at;
                  // Status bar color logic
                  const barColor = acc.is_visible_public ? "border-l-emerald-500" : "border-l-slate-300";

                  return (
                    <tr
                      key={acc.id}
                      className={`cursor-pointer transition hover:bg-slate-50 border-l-4 ${barColor}`}
                      onClick={() => navigate(`/admin/bank-accounts/${acc.id}/edit`)}
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selection.isSelected(acc.id)}
                          onChange={() => selection.toggle(acc.id)}
                          aria-label={`Pilih rekening ${acc.bank_name}`}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          #{acc.order ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                            <FontAwesomeIcon icon={faBuildingColumns} />
                          </div>
                          <span className="line-clamp-1 text-sm font-bold text-slate-900">{acc.bank_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900">{acc.account_number}</td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-700">{acc.account_name}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(Boolean(acc.is_visible_public))}`}>
                          {acc.is_visible_public ? "Tampil" : "Disembunyikan"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-500">{formatDate(updated)}</td>
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
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Belum ada rekening yang cocok.
            </div>
          ) : (
            filtered.map((acc) => {
              const updated = acc.updated_at ?? acc.created_at;
              const barColor = acc.is_visible_public ? "border-l-emerald-500" : "border-l-slate-300";

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => navigate(`/admin/bank-accounts/${acc.id}/edit`)}
                  className={`w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
                >
                  <div className="flex items-start gap-3">
                    <span onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(acc.id)}
                        onChange={() => selection.toggle(acc.id)}
                        aria-label={`Pilih rekening ${acc.bank_name}`}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-slate-900">{acc.bank_name}</p>
                      <p className="mt-1 text-sm text-slate-600">{acc.account_number}</p>
                      <p className="mt-1 text-xs text-slate-500">Atas nama: {acc.account_name}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 pl-7">
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                      #{acc.order ?? 0}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(Boolean(acc.is_visible_public))}`}>
                      {acc.is_visible_public ? "Tampil" : "Disembunyikan"}
                    </span>
                  </div>
                  <p className="mt-3 pl-7 text-xs font-semibold text-slate-500">Diperbarui: {formatDate(updated)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBankAccountsPage;



