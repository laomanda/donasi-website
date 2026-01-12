import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type Partner = {
  id: number;
  name: string;
  name_en?: string | null;
  logo_path?: string | null;
  url?: string | null;
  description?: string | null;
  description_en?: string | null;
  order: number;
  is_active: boolean;
};

type PartnerFormState = {
  name: string;
  name_en: string;
  logo_path: string;
  url: string;
  description: string;
  description_en: string;
  order: string;
  is_active: boolean;
};

const emptyForm: PartnerFormState = {
  name: "",
  name_en: "",
  logo_path: "",
  url: "",
  description: "",
  description_en: "",
  order: "0",
  is_active: true,
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

const getBackendBaseUrl = () => {
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

const getNextAvailableOrder = (partners: Partner[], excludeId?: number) => {
  const used = new Set<number>();
  partners.forEach((p) => {
    if (excludeId && p.id === excludeId) return;
    const n = Number(p.order);
    if (!Number.isFinite(n)) return;
    used.add(Math.max(0, Math.floor(n)));
  });

  let candidate = 0;
  while (used.has(candidate)) candidate += 1;
  return candidate;
};

type Mode = "create" | "edit";

export function EditorPartnerForm({ mode, partnerId }: { mode: Mode; partnerId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<PartnerFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [partnerPeers, setPartnerPeers] = useState<Partner[]>([]);
  const [peersLoading, setPeersLoading] = useState(true);
  const [peersError, setPeersError] = useState<string | null>(null);
  const orderTouchedRef = useRef(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditIdValid = typeof partnerId === "number" && Number.isFinite(partnerId) && partnerId > 0;

  const orderNumber = Number(form.order);
  const orderIsValid = Number.isFinite(orderNumber) && Number.isInteger(orderNumber) && orderNumber >= 0;

  const duplicateOrderOwner = useMemo(() => {
    if (!orderIsValid) return null;
    return partnerPeers.find((p) => p.order === orderNumber && (mode === "create" || p.id !== partnerId)) ?? null;
  }, [mode, orderIsValid, orderNumber, partnerId, partnerPeers]);

  const orderError = useMemo(() => {
    if (!orderIsValid) return "Urutan tampil harus berupa angka bulat (>= 0).";
    if (duplicateOrderOwner) return `Urutan #${orderNumber} sudah dipakai oleh "${duplicateOrderOwner.name}".`;
    return null;
  }, [duplicateOrderOwner, orderIsValid, orderNumber]);

  const suggestedOrder = useMemo(() => {
    return getNextAvailableOrder(partnerPeers, mode === "edit" ? partnerId : undefined);
  }, [mode, partnerId, partnerPeers]);

  const canSubmit = !loading && !saving && !logoUploading && !deleting && !peersLoading && !peersError && !orderError;
  const canDelete = mode === "edit" && isEditIdValid && !loading && !saving && !logoUploading && !deleting;

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    let active = true;

    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID mitra tidak valid."]);
      setLoading(false);
      setPeersLoading(false);
      setPeersError("ID mitra tidak valid.");
      return;
    }

    if (mode === "edit") setLoading(true);
    setPeersLoading(true);
    setPeersError(null);
    setErrors([]);
    http
      .get<Partner[]>("/editor/partners")
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setPartnerPeers(list);

        const found = list.find((p) => p.id === partnerId);
        if (mode === "edit") {
          if (!found) {
            setErrors(["Data mitra tidak ditemukan."]);
            setPeersError("Data mitra tidak ditemukan.");
            return;
          }
          setForm({
            name: found.name ?? "",
            name_en: found.name_en ?? "",
            logo_path: found.logo_path ?? "",
            url: found.url ?? "",
            description: found.description ?? "",
            description_en: found.description_en ?? "",
            order: String(found.order ?? 0),
            is_active: Boolean(found.is_active),
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
        setPeersError("Gagal memuat data mitra untuk memverifikasi urutan tampil.");
      })
      .finally(() => {
        if (!active) return;
        setPeersLoading(false);
        if (mode === "edit") setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mode, isEditIdValid, partnerId]);

  const uploadImage = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await http.post<{ path?: string; url?: string }>("/editor/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const path = String(res.data?.path ?? "").trim();
    if (!path) throw new Error("Upload gagal: path kosong.");
    return path;
  };

  const onUploadLogo = async (file: File) => {
    setLogoUploadError(null);
    setLogoUploading(true);
    try {
      const path = await uploadImage(file, "uploads/partners/logos");
      setForm((s) => ({ ...s, logo_path: path }));
    } catch (err: any) {
      setLogoUploadError(normalizeErrors(err).join(" "));
    } finally {
      setLogoUploading(false);
    }
  };

  const payloadForRequest = (state: PartnerFormState) => {
    const orderValue = Math.max(0, Number(state.order || 0));
    return {
      name: state.name.trim(),
      name_en: state.name_en.trim() || null,
      logo_path: state.logo_path.trim() || null,
      url: state.url.trim() || null,
      description: state.description.trim() || null,
      description_en: state.description_en.trim() || null,
      order: Number.isFinite(orderValue) ? Math.floor(orderValue) : 0,
      is_active: Boolean(state.is_active),
    };
  };

  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID mitra tidak valid."]);
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
      const payload = payloadForRequest(form);
      if (mode === "create") {
        await http.post("/editor/partners", payload);
        toast.success("Mitra berhasil dibuat.", { title: "Berhasil" });
      } else {
        await http.put(`/editor/partners/${partnerId}`, payload);
        toast.success("Perubahan mitra berhasil disimpan.", { title: "Berhasil" });
      }
      navigate("/editor/partners", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID mitra tidak valid."]);
      return;
    }

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`/editor/partners/${partnerId}`);
      toast.success("Mitra berhasil dihapus.", { title: "Berhasil" });
      navigate("/editor/partners", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Tambah Mitra" : "Ubah Mitra";
  const storedLogoUrl = useMemo(() => resolveStorageUrl(form.logo_path), [form.logo_path]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Mitra
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Tambahkan mitra untuk ditampilkan di landing page."
                : "Perbarui detail mitra agar selalu rapi dan akurat."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/partners")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={saving || logoUploading || deleting}
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
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Nama mitra (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Nama mitra..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Name (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <input
                  value={form.name_en}
                  onChange={(e) => setForm((s) => ({ ...s, name_en: e.target.value }))}
                  placeholder="Partner name (English)..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">URL (opsional)</span>
                <input
                  value={form.url}
                  onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
                  placeholder="https://mitra.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">Deskripsi (Bahasa Indonesia) <span className="text-slate-400">(Optional)</span></span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  rows={5}
                  placeholder="Deskripsi singkat untuk kebutuhan internal..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">Description (English) <span className="text-slate-400">(Optional)</span></span>
                <textarea
                  value={form.description_en}
                  onChange={(e) => setForm((s) => ({ ...s, description_en: e.target.value }))}
                  rows={5}
                  placeholder="Short description for internal purposes (English)..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-wide text-slate-400">Logo (opsional)</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Upload logo untuk kartu mitra di landing.</p>
                    <p className="mt-1 text-xs text-slate-500">jpg/png/webp, max 4MB.</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Pilih Logo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
                      setLogoPreviewUrl(null);
                      setForm((s) => ({ ...s, logo_path: "" }));
                      setLogoUploadError(null);
                    }}
                        disabled={!canSubmit || (!logoPreviewUrl && !form.logo_path)}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Hapus
                  </button>

                  {logoUploading ? (
                    <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
                  ) : form.logo_path ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Tersimpan
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">Belum ada.</span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    {logoPreviewUrl || storedLogoUrl ? (
                      <img
                        src={logoPreviewUrl ?? storedLogoUrl ?? undefined}
                        alt=""
                        className="h-44 w-full object-contain bg-white p-6"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-sm font-semibold text-slate-500">
                        Tidak ada pratinjau.
                      </div>
                    )}
                  </div>
                </div>

                {logoUploadError && <p className="mt-3 text-sm font-semibold text-red-700">{logoUploadError}</p>}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={logoInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
                    setLogoPreviewUrl(URL.createObjectURL(file));
                    void onUploadLogo(file);
                  }}
                  disabled={!canSubmit}
                />
              </div>
            </div>
          </div>

          {mode === "edit" ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus mitra</h2>
              <p className="mt-2 text-sm text-slate-600">
                Mitra yang dihapus tidak akan tampil di sistem. Pastikan sudah benar.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canDelete}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Mitra
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
                    "mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2",
                    orderError ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:border-slate-300 focus:bg-white focus:ring-slate-200",
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
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Gunakan Urutan Kosong
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
                onClick={() => setForm((s) => ({ ...s, is_active: !s.is_active }))}
                disabled={loading || saving || deleting}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                  form.is_active
                    ? "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-800"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>Tampilkan di landing</span>
                <span className="text-xs font-semibold opacity-80">{form.is_active ? "Aktif" : "Nonaktif"}</span>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold tracking-wide text-slate-400">Catatan</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Logo akan tampil dengan mode contain agar tidak terpotong.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Pastikan URL lengkap agar tombol website berfungsi.</span>
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

export default EditorPartnerForm;


