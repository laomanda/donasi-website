import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type Tag = {
  id: number;
  name: string;
  url: string | null;
  is_active: boolean;
  sort_order: number;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
};

type TagFormState = {
  name: string;
  url: string;
  is_active: boolean;
  sort_order: string;
  open_in_new_tab: boolean;
};

const emptyForm: TagFormState = {
  name: "",
  url: "",
  is_active: true,
  sort_order: "0",
  open_in_new_tab: true,
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

const getNextAvailableOrder = (tags: Tag[], excludeId?: number) => {
  const used = new Set<number>();
  tags.forEach((t) => {
    if (excludeId && t.id === excludeId) return;
    const n = Number(t.sort_order);
    if (!Number.isFinite(n)) return;
    used.add(Math.max(0, Math.floor(n)));
  });

  let candidate = 0;
  while (used.has(candidate)) candidate += 1;
  return candidate;
};

const resolveRoleBase = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "admin" || segment === "editor") return segment;
  return "editor";
};

type Mode = "create" | "edit";

export function TagFormPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const tagId = useMemo(() => Number(id), [id]);
  const roleBase = useMemo(() => resolveRoleBase(location.pathname), [location.pathname]);
  const apiBase = `/${roleBase}`;
  const routeBase = `/${roleBase}`;

  const [form, setForm] = useState<TagFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [tagPeers, setTagPeers] = useState<Tag[]>([]);
  const [peersLoading, setPeersLoading] = useState(true);
  const [peersError, setPeersError] = useState<string | null>(null);
  const orderTouchedRef = useRef(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditIdValid = typeof tagId === "number" && Number.isFinite(tagId) && tagId > 0;

  const orderNumber = Number(form.sort_order);
  const orderIsValid = Number.isFinite(orderNumber) && Number.isInteger(orderNumber) && orderNumber >= 0;

  const duplicateOrderOwner = useMemo(() => {
    if (!orderIsValid) return null;
    return tagPeers.find((t) => t.sort_order === orderNumber && (mode === "create" || t.id !== tagId)) ?? null;
  }, [mode, orderIsValid, orderNumber, tagId, tagPeers]);

  const orderError = useMemo(() => {
    if (!orderIsValid) return "Urutan tampil harus berupa angka bulat (>= 0).";
    if (duplicateOrderOwner) return `Urutan #${orderNumber} sudah dipakai oleh "${duplicateOrderOwner.name}".`;
    return null;
  }, [duplicateOrderOwner, orderIsValid, orderNumber]);

  const suggestedOrder = useMemo(() => {
    return getNextAvailableOrder(tagPeers, mode === "edit" ? tagId : undefined);
  }, [mode, tagId, tagPeers]);

  const canSubmit = !loading && !saving && !deleting && !peersLoading && !peersError && !orderError && form.name.trim().length > 0;
  const canDelete = mode === "edit" && isEditIdValid && !loading && !saving && !deleting;

  useEffect(() => {
    let active = true;

    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID tag tidak valid."]);
      setLoading(false);
      setPeersLoading(false);
      setPeersError("ID tag tidak valid.");
      return;
    }

    if (mode === "edit") setLoading(true);
    setPeersLoading(true);
    setPeersError(null);
    setErrors([]);

    http
      .get<Tag[]>(`${apiBase}/tags`)
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setTagPeers(list);

        if (mode === "edit") {
          const found = list.find((t) => t.id === tagId);
          if (!found) {
            setErrors(["Data tag tidak ditemukan."]);
            setPeersError("Data tag tidak ditemukan.");
            return;
          }
          setForm({
            name: found.name ?? "",
            url: found.url ?? "",
            is_active: Boolean(found.is_active),
            sort_order: String(found.sort_order ?? 0),
            open_in_new_tab: Boolean(found.open_in_new_tab),
          });
          return;
        }

        // Auto-assign next available order for create mode
        if (!orderTouchedRef.current) {
          const nextOrder = getNextAvailableOrder(list);
          setForm((s) => ({ ...s, sort_order: String(nextOrder) }));
        }
      })
      .catch((err) => {
        if (!active) return;
        setErrors(normalizeErrors(err));
        setPeersError("Gagal memuat data tag untuk memverifikasi urutan.");
      })
      .finally(() => {
        if (!active) return;
        setPeersLoading(false);
        if (mode === "edit") setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [apiBase, mode, isEditIdValid, tagId]);

  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID tag tidak valid."]);
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

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setErrors(["Nama tag wajib diisi."]);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        url: form.url.trim() || null,
        is_active: form.is_active,
        sort_order: Math.max(0, Number(form.sort_order || 0)),
        open_in_new_tab: form.open_in_new_tab,
      };

      if (mode === "create") {
        await http.post(`${apiBase}/tags`, payload);
        toast.success("Tag berhasil dibuat.", { title: "Berhasil" });
      } else {
        await http.put(`${apiBase}/tags/${tagId}`, payload);
        toast.success("Perubahan tag berhasil disimpan.", { title: "Berhasil" });
      }
      navigate(`${routeBase}/tags`, { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID tag tidak valid."]);
      return;
    }

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`${apiBase}/tags/${tagId}`);
      toast.success("Tag berhasil dihapus.", { title: "Berhasil" });
      navigate(`${routeBase}/tags`, { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Tambah Tag" : "Ubah Tag";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Footer
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Tambahkan tag baru untuk ditampilkan di footer website."
                : "Perbarui detail tag agar selalu rapi dan akurat."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`${routeBase}/tags`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={saving || deleting}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>

            <button
              type="button"
              onClick={() => void onSubmit()}
              className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!canSubmit}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {/* ERRORS */}
      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          <p className="font-bold">Periksa kembali data berikut:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.slice(0, 8).map((msg, idx) => (
              <li key={idx} className="font-semibold">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FORM CONTENT */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* MAIN FORM (left 8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Nama Tag <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Contoh: Donasi, Wakaf, Zakat"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  URL <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  value={form.url}
                  onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
                  placeholder="https://contoh.co.id/program"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>
            </div>
          </div>

          {/* DELETE ZONE (edit only) */}
          {mode === "edit" ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus tag</h2>
              <p className="mt-2 text-sm text-slate-600">
                Tag yang dihapus tidak akan tampil di footer website. Pastikan sudah benar.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canDelete}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Tag
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

        {/* SIDEBAR (right 4 cols) */}
        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:h-fit">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Properti</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Urutan tampil <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.sort_order}
                  onChange={(e) => {
                    orderTouchedRef.current = true;
                    setForm((s) => ({ ...s, sort_order: e.target.value }));
                  }}
                  placeholder="0"
                  className={[
                    "mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2",
                    orderError
                      ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-300 bg-white focus:border-slate-400 focus:ring-brandGreen-400",
                  ].join(" ")}
                  disabled={loading || saving || deleting}
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Semakin kecil angkanya, semakin kiri posisinya di footer.</p>
                  <button
                    type="button"
                    onClick={() => {
                      orderTouchedRef.current = true;
                      setForm((s) => ({ ...s, sort_order: String(suggestedOrder) }));
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

              {/* Toggle: aktif */}
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, is_active: !s.is_active }))}
                disabled={loading || saving || deleting}
                aria-pressed={form.is_active}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                  form.is_active
                    ? "border-brandGreen-200 bg-brandGreen-50 text-brandGreen-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>Tampilkan di footer</span>
                <span
                  className={[
                    "inline-flex h-6 w-11 items-center rounded-full p-1 transition",
                    form.is_active ? "bg-brandGreen-600" : "bg-slate-200",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span
                    className={[
                      "h-4 w-4 rounded-full bg-white shadow-sm transition",
                      form.is_active ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </span>
              </button>

              {/* Toggle: open in new tab */}
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, open_in_new_tab: !s.open_in_new_tab }))}
                disabled={loading || saving || deleting}
                aria-pressed={form.open_in_new_tab}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                  form.open_in_new_tab
                    ? "border-sky-200 bg-sky-50 text-sky-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>Buka di tab baru</span>
                <span
                  className={[
                    "inline-flex h-6 w-11 items-center rounded-full p-1 transition",
                    form.open_in_new_tab ? "bg-sky-600" : "bg-slate-200",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span
                    className={[
                      "h-4 w-4 rounded-full bg-white shadow-sm transition",
                      form.open_in_new_tab ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </span>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Catatan</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Tag akan muncul di bagian footer website publik.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Pastikan URL lengkap agar link berfungsi dengan benar.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Tag yang tidak aktif tidak akan ditampilkan.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TagFormPage;
