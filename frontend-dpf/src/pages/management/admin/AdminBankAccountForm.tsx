import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBuildingColumns, faTrash, faImage, faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { resolveStorageBaseUrl } from "../../../lib/urls";

type BankAccount = {
  id: number;
  bank_name: string;
  account_number?: string | null;
  account_name?: string | null;
  image_path?: string | null;
  category?: string;
  type?: string;
  is_visible_public: boolean;
  order: number;
};

type BankAccountFormState = {
  bank_name: string;
  account_number: string;
  account_name: string;
  category: string;
  type: string;
  image: File | null;
  image_preview: string | null;
  is_visible_public: boolean;
  order: string;
};

const emptyForm: BankAccountFormState = {
  bank_name: "",
  account_number: "",
  account_name: "",
  category: "bank_transfer",
  type: "text",
  image: null,
  image_preview: null,
  is_visible_public: true,
  order: "0",
};

const normalizeErrors = (error: any): string[] => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    const message = error?.response?.data?.message ?? error?.message;
    return message ? [String(message)] : ["Terjadi kesalahan."];
  }

  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key];
    if (Array.isArray(value)) value.forEach((msg) => messages.push(String(msg)));
    else if (value) messages.push(String(value));
  }
  return messages.length ? messages : ["Validasi gagal."];
};

const getNextAvailableOrder = (accounts: BankAccount[], excludeId?: number) => {
  const used = new Set<number>();
  accounts.forEach((acc) => {
    if (excludeId && acc.id === excludeId) return;
    const n = Number(acc.order);
    if (!Number.isFinite(n)) return;
    used.add(Math.max(0, Math.floor(n)));
  });

  let candidate = 0;
  while (used.has(candidate)) candidate += 1;
  return candidate;
};

type Mode = "create" | "edit";

export function AdminBankAccountForm({ mode, accountId }: { mode: Mode; accountId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<BankAccountFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [peers, setPeers] = useState<BankAccount[]>([]);
  const [peersLoading, setPeersLoading] = useState(true);
  const [peersError, setPeersError] = useState<string | null>(null);

  const orderTouchedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    // Add existing from peers
    peers.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [peers]);

  const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = resolveStorageBaseUrl();
    return `${base}/${path}`;
  };

  const isEditIdValid = typeof accountId === "number" && Number.isFinite(accountId) && accountId > 0;
  const orderNumber = Number(form.order);
  const orderIsValid = Number.isFinite(orderNumber) && Number.isInteger(orderNumber) && orderNumber >= 0;

  const duplicateOrderOwner = useMemo(() => {
    if (!orderIsValid) return null;
    return peers.find((acc) => acc.order === orderNumber && (mode === "create" || acc.id !== accountId)) ?? null;
  }, [mode, orderIsValid, orderNumber, accountId, peers]);

  const orderError = useMemo(() => {
    if (!orderIsValid) return "Urutan tampil harus berupa angka bulat (>= 0).";
    if (duplicateOrderOwner) return `Urutan #${orderNumber} sudah dipakai oleh "${duplicateOrderOwner.bank_name}".`;
    return null;
  }, [duplicateOrderOwner, orderIsValid, orderNumber]);

  const suggestedOrder = useMemo(() => {
    return getNextAvailableOrder(peers, mode === "edit" ? accountId : undefined);
  }, [mode, accountId, peers]);

  const canSubmit = !loading && !saving && !deleting && !peersLoading && !peersError && !orderError;
  const canDelete = mode === "edit" && isEditIdValid && !loading && !saving && !deleting;

  useEffect(() => {
    let active = true;

    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID rekening tidak valid."]);
      setLoading(false);
      setPeersLoading(false);
      setPeersError("ID rekening tidak valid.");
      return;
    }

    if (mode === "edit") setLoading(true);
    setPeersLoading(true);
    setPeersError(null);
    setErrors([]);

    http
      .get<BankAccount[]>("/admin/bank-accounts")
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setPeers(list);

        const found = list.find((acc) => acc.id === accountId);
        if (mode === "edit") {
          if (!found) {
            setErrors(["Data rekening tidak ditemukan."]);
            setPeersError("Data rekening tidak ditemukan.");
            return;
          }
          setForm({
            bank_name: found.bank_name ?? "",
            account_number: found.account_number ?? "",
            account_name: found.account_name ?? "",
            category: found.category || "bank_transfer",
            type: found.type || "text",
            image: null,
            image_preview: getImageUrl(found.image_path) || null,
            is_visible_public: Boolean(found.is_visible_public),
            order: String(found.order ?? 0),
          });
          return;
        }

        if (!orderTouchedRef.current) {
          const nextOrder = getNextAvailableOrder(list);
          setForm((s) => ({ ...s, order: String(nextOrder) }));
        }
      })
      .catch((err) => {
        if (!active) return;
        setErrors(normalizeErrors(err));
        setPeersError("Gagal memuat data rekening.");
      })
      .finally(() => {
        if (!active) return;
        setPeersLoading(false);
        if (mode === "edit") setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mode, isEditIdValid, accountId]);



  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID rekening tidak valid."]);
      return;
    }
    if (peersLoading) {
      setErrors(["Sedang memverifikasi urutan tampil. Tunggu sebentar."]);
      return;
    }
    if (peersError) {
      setErrors([peersError]);
      return;
    }
    if (orderError) {
      setErrors([orderError]);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      const orderValue = Math.max(0, Number(form.order || 0));
      const payload = new FormData();
      payload.append("bank_name", form.bank_name.trim());
      payload.append("account_number", form.account_number.trim());
      payload.append("account_name", form.account_name.trim());
      payload.append("category", form.category);
      payload.append("type", form.type);
      payload.append("is_visible_public", form.is_visible_public ? "1" : "0");
      payload.append("order", String(Number.isFinite(orderValue) ? Math.floor(orderValue) : 0));

      if (form.image) {
        payload.append("image", form.image);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (mode === "create") {
        await http.post("/admin/bank-accounts", payload, config);
        toast.success("Rekening berhasil dibuat.", { title: "Berhasil" });
      } else {
        payload.append("_method", "PUT");
        await http.post(`/admin/bank-accounts/${accountId}`, payload, config);
        toast.success("Perubahan rekening disimpan.", { title: "Berhasil" });
      }
      navigate("/admin/bank-accounts", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((s) => ({
        ...s,
        image: file,
        image_preview: URL.createObjectURL(file),
      }));
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID rekening tidak valid."]);
      return;
    }

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`/admin/bank-accounts/${accountId}`);
      toast.success("Rekening berhasil dihapus.", { title: "Berhasil" });
      navigate("/admin/bank-accounts", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Tambah Rekening" : "Ubah Rekening";

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
                  Rekening
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola rekening resmi untuk ditampilkan di halaman donasi.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/bank-accounts")}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20"
                disabled={saving || deleting}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>

              <button
                type="button"
                onClick={() => void onSubmit()}
                className="inline-flex items-center justify-center rounded-2xl bg-white text-emerald-700 px-8 py-3 text-sm font-bold shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!canSubmit}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Periksa kembali:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.slice(0, 8).map((msg, idx) => (
              <li key={idx} className="font-semibold">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2 relative">
                  <span className="text-[11px] font-bold tracking-wide text-slate-400">
                    Kategori <span className="text-red-500">*</span>
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                      onFocus={() => setShowCategorySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                      placeholder="Pilih atau ketik kategori baru..."
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      disabled={loading || saving || deleting}
                    />
                    {showCategorySuggestions && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1">
                        {uniqueCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()} // Prevent blur
                            onClick={() => {
                              setForm((s) => ({ ...s, category: cat }));
                              setShowCategorySuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Ketik untuk membuat kategori baru atau pilih dari daftar yang sudah ada.
                  </p>
                </label>
              </div>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Nama Bank / Provider <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.bank_name}
                  onChange={(e) => setForm((s) => ({ ...s, bank_name: e.target.value }))}
                  placeholder="Contoh: Bank Syariah Indonesia"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Nomor rekening <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.account_number}
                  onChange={(e) => setForm((s) => ({ ...s, account_number: e.target.value }))}
                  placeholder="Contoh: 7123456789"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Atas nama <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.account_name}
                  onChange={(e) => setForm((s) => ({ ...s, account_name: e.target.value }))}
                  placeholder="Contoh: Yayasan DPF"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  disabled={loading || saving || deleting}
                />
              </label>

              {/* Image Upload */}
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Logo / Ikon Bank / QRIS
                </span>
                <div className="mt-2 flex items-start gap-4">
                  {form.image_preview ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={form.image_preview}
                        alt="Preview"
                        className="h-full w-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((s) => ({ ...s, image: null, image_preview: null }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                      <FontAwesomeIcon icon={faImage} className="text-2xl" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      disabled={loading || saving || deleting}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      {form.image_preview ? "Ganti Gambar" : "Upload Gambar"}
                    </button>
                    <p className="mt-2 text-xs text-slate-500">
                      Format: JPG, PNG. Maksimal 2MB.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {mode === "edit" ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus rekening</h2>
              <p className="mt-2 text-sm text-slate-600">
                Rekening yang dihapus tidak akan tampil di halaman donasi.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canDelete}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Rekening
                </button>
              ) : (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                  <p className="mt-1 text-sm text-red-700">Klik "Ya, hapus" untuk melanjutkan.</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                      disabled={deleting}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete()}
                      className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={deleting}
                    >
                      {deleting ? "Menghapus..." : "Ya, hapus"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold tracking-wide text-slate-400">Properti</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Urutan tampil <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.order}
                  onChange={(e) => {
                    orderTouchedRef.current = true;
                    setForm((s) => ({ ...s, order: e.target.value }));
                  }}
                  placeholder="0"
                  className={[
                    "mt-2 w-full rounded-xl border px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:ring-4",
                    orderError
                      ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/10",
                  ].join(" ")}
                  disabled={loading || saving || deleting}
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Semakin kecil angkanya, semakin atas posisinya.</p>
                  <button
                    type="button"
                    onClick={() => {
                      orderTouchedRef.current = true;
                      setForm((s) => ({ ...s, order: String(suggestedOrder) }));
                    }}
                    disabled={peersLoading || Boolean(peersError) || loading || saving || deleting}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Gunakan urutan kosong
                  </button>
                </div>
                {peersLoading ? (
                  <p className="mt-2 text-xs font-semibold text-slate-500">Memeriksa urutan yang sudah dipakai...</p>
                ) : peersError ? (
                  <p className="mt-2 text-xs font-semibold text-red-700">{peersError}</p>
                ) : orderError ? (
                  <p className="mt-2 text-xs font-semibold text-red-700">{orderError}</p>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-brandGreen-700">
                    Urutan tersedia. Rekomendasi urutan kosong: #{suggestedOrder}.
                  </p>
                )}
              </label>

              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, is_visible_public: !s.is_visible_public }))}
                disabled={loading || saving || deleting}
                className={[
                  "flex w-full items-center justify-between rounded-xl border px-4 py-4 text-sm font-bold shadow-sm transition",
                  form.is_visible_public
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>Tampilkan di landing</span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg ${form.is_visible_public ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {form.is_visible_public ? "Aktif" : "Nonaktif"}
                </span>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex shrink-0 h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <FontAwesomeIcon icon={faBuildingColumns} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-wide text-slate-400">Catatan</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Rekening nonaktif tidak akan tampil di halaman donasi publik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBankAccountForm;

