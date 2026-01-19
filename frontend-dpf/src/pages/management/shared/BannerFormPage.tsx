import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";

type Banner = {
  id: number;
  image_path: string;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type BannerFormState = {
  image_path: string;
  display_order: string;
};

const emptyForm: BannerFormState = {
  image_path: "",
  display_order: "0",
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

const getNextAvailableOrder = (banners: Banner[], excludeId?: number) => {
  const used = new Set<number>();
  banners.forEach((banner) => {
    if (excludeId && banner.id === excludeId) return;
    const n = Number(banner.display_order);
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

export function BannerFormPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const bannerId = useMemo(() => Number(id), [id]);
  const roleBase = useMemo(() => resolveRoleBase(location.pathname), [location.pathname]);
  const apiBase = `/${roleBase}`;
  const routeBase = `/${roleBase}`;

  const [form, setForm] = useState<BannerFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [peers, setPeers] = useState<Banner[]>([]);
  const [peersLoading, setPeersLoading] = useState(true);
  const [peersError, setPeersError] = useState<string | null>(null);
  const orderTouchedRef = useRef(false);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditIdValid = typeof bannerId === "number" && Number.isFinite(bannerId) && bannerId > 0;
  const orderNumber = Number(form.display_order);
  const orderIsValid = Number.isFinite(orderNumber) && Number.isInteger(orderNumber) && orderNumber >= 0;
  const imageMissing = !form.image_path.trim();

  const duplicateOrderOwner = useMemo(() => {
    if (!orderIsValid) return null;
    return peers.find((banner) => banner.display_order === orderNumber && (mode === "create" || banner.id !== bannerId)) ?? null;
  }, [mode, orderIsValid, orderNumber, bannerId, peers]);

  const orderError = useMemo(() => {
    if (!orderIsValid) return "Urutan tampil harus berupa angka bulat (>= 0).";
    if (duplicateOrderOwner) return `Urutan #${orderNumber} sudah dipakai oleh banner lain.`;
    return null;
  }, [duplicateOrderOwner, orderIsValid, orderNumber]);

  const suggestedOrder = useMemo(() => {
    return getNextAvailableOrder(peers, mode === "edit" ? bannerId : undefined);
  }, [mode, bannerId, peers]);

  const canSubmit = !loading && !saving && !imageUploading && !deleting && !peersLoading && !peersError && !orderError && !imageMissing;
  const canDelete = mode === "edit" && isEditIdValid && !loading && !saving && !imageUploading && !deleting;

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    let active = true;

    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID banner tidak valid."]);
      setLoading(false);
      setPeersLoading(false);
      setPeersError("ID banner tidak valid.");
      return;
    }

    if (mode === "edit") setLoading(true);
    setPeersLoading(true);
    setPeersError(null);
    setErrors([]);

    http
      .get<Banner[]>(`${apiBase}/banners`)
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setPeers(list);

        const found = list.find((banner) => banner.id === bannerId);
        if (mode === "edit") {
          if (!found) {
            setErrors(["Data banner tidak ditemukan."]);
            setPeersError("Data banner tidak ditemukan.");
            return;
          }
          setForm({
            image_path: found.image_path ?? "",
            display_order: String(found.display_order ?? 0),
          });
          return;
        }

        if (!orderTouchedRef.current) {
          const nextOrder = getNextAvailableOrder(list);
          setForm((s) => ({ ...s, display_order: String(nextOrder) }));
        }
      })
      .catch((err) => {
        if (!active) return;
        setErrors(normalizeErrors(err));
        setPeersError("Gagal memuat data banner.");
      })
      .finally(() => {
        if (!active) return;
        setPeersLoading(false);
        if (mode === "edit") setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [apiBase, mode, isEditIdValid, bannerId]);

  const uploadImage = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await http.post<{ path?: string }>("/editor/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const path = String(res.data?.path ?? "").trim();
    if (!path) throw new Error("Upload gagal: path kosong.");
    return path;
  };

  const onUploadImage = async (file: File) => {
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const path = await uploadImage(file, "uploads/banners");
      setForm((s) => ({ ...s, image_path: path }));
    } catch (err: any) {
      setImageUploadError(normalizeErrors(err).join(" "));
    } finally {
      setImageUploading(false);
    }
  };

  const payloadForRequest = (state: BannerFormState) => {
    const orderValue = Math.max(0, Number(state.display_order || 0));
    return {
      image_path: state.image_path.trim(),
      display_order: Number.isFinite(orderValue) ? Math.floor(orderValue) : 0,
    };
  };

  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID banner tidak valid."]);
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
    if (imageMissing) {
      setErrors(["Gambar banner wajib diisi."]);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      const payload = payloadForRequest(form);
      if (mode === "create") {
        await http.post(`${apiBase}/banners`, payload);
        toast.success("Banner berhasil dibuat.", { title: "Berhasil" });
      } else {
        await http.put(`${apiBase}/banners/${bannerId}`, payload);
        toast.success("Perubahan banner berhasil disimpan.", { title: "Berhasil" });
      }
      navigate(`${routeBase}/banners`, { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID banner tidak valid."]);
      return;
    }

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`${apiBase}/banners/${bannerId}`);
      toast.success("Banner berhasil dihapus.", { title: "Berhasil" });
      navigate(`${routeBase}/banners`, { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Tambah Banner" : "Ubah Banner";
  const storedImageUrl = useMemo(() => resolveStorageUrl(form.image_path), [form.image_path]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Konten
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Banner digunakan untuk slideshow di beranda. Pastikan resolusi dan urutan tampil sudah sesuai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`${routeBase}/banners`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={saving || imageUploading || deleting}
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

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Gambar banner <span className="text-red-500">*</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Upload gambar untuk slideshow beranda.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">jpg/png/webp, max 6MB.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <FontAwesomeIcon icon={faImage} />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={saving || imageUploading || deleting}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Pilih Gambar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                    setImagePreviewUrl(null);
                    setForm((s) => ({ ...s, image_path: "" }));
                    setImageUploadError(null);
                  }}
                  disabled={saving || imageUploading || deleting || (!imagePreviewUrl && !form.image_path)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hapus
                </button>

                {imageUploading ? (
                  <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
                ) : form.image_path ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    Tersimpan
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-600">Belum ada.</span>
                )}
              </div>

              <div className="mt-4">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  <img
                    src={imagePreviewUrl ?? storedImageUrl ?? imagePlaceholder}
                    alt="Preview banner"
                    className="h-64 w-full object-cover"
                    onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                  />
                </div>
              </div>

              {imageUploadError && <p className="mt-3 text-sm font-semibold text-red-700">{imageUploadError}</p>}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                  setImagePreviewUrl(URL.createObjectURL(file));
                  void onUploadImage(file);
                }}
                disabled={saving || imageUploading || deleting}
              />
            </div>
          </div>

          {mode === "edit" ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus banner</h2>
              <p className="mt-2 text-sm text-slate-600">
                Banner yang dihapus tidak akan tampil di beranda.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canDelete}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Banner
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
                  value={form.display_order}
                  onChange={(e) => {
                    orderTouchedRef.current = true;
                    setForm((s) => ({ ...s, display_order: e.target.value }));
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
                  <p className="text-xs text-slate-500">Semakin kecil angkanya, semakin atas posisinya.</p>
                  <button
                    type="button"
                    onClick={() => {
                      orderTouchedRef.current = true;
                      setForm((s) => ({ ...s, display_order: String(suggestedOrder) }));
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Catatan</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Pastikan banner memiliki rasio lebar agar tampil penuh di beranda.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brandGreen-600" />
                    <span>Urutan tampil akan diurutkan dari angka paling kecil.</span>
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

export default BannerFormPage;
