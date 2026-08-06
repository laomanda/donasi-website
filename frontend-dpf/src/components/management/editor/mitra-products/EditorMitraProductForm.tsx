import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowUp,
  faArrowDown,
  faImage,
  faTrash,
  faCheck,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { isValidPhoneNumber } from "libphonenumber-js";
import http from "@/lib/http";
import PhoneInput from "@/components/ui/PhoneInput";
import { useToast } from "@/components/ui/ToastProvider";
import {
  emptyMitraProductForm,
  mitraProductFolder,
  resolveMitraProductImage,
  type MitraProduct,
  type MitraProductFormState,
} from "./MitraProductTypes";

type Props = {
  mode: "create" | "edit";
  productId?: number;
};

type ApiError = {
  response?: {
    data?: {
      errors?: Record<string, string[]>;
      message?: string;
    };
  };
};

const getErrors = (error: unknown, fallback: string): string[] => {
  const payload = (error as ApiError)?.response?.data;
  if (payload?.errors) {
    return Object.values(payload.errors).flat().map(String);
  }
  return [payload?.message ?? fallback];
};

export default function EditorMitraProductForm({ mode, productId }: Props) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<MitraProductFormState>(emptyMitraProductForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleDeleteProduct = async () => {
    if (!productId) return;

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`/editor/mitra-products/${productId}`);
      toast.success("Produk mitra berhasil dihapus.", { title: "Berhasil" });
      navigate("/editor/mitra-products", { replace: true });
    } catch (error) {
      setErrors(getErrors(error, "Gagal menghapus produk mitra."));
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    let active = true;
    http
      .get<MitraProduct>(`/editor/mitra-products/${productId}`)
      .then((response) => {
        if (!active) return;
        const product = response.data;
        setForm({
          slug: product.slug,
          nama_mitra: product.nama_mitra ?? "",
          title_id: product.title_id,
          title_en: product.title_en,
          description_id: product.description_id,
          description_en: product.description_en,
          whatsapp_number: product.whatsapp_number,
          status: product.status,
          images: (product.images ?? []).sort((a, b) => a.sort_order - b.sort_order),
        });
      })
      .catch((error) => {
        if (active) {
          setErrors(getErrors(error, "Gagal memuat detail produk mitra."));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mode, productId]);

  const update = (updates: Partial<MitraProductFormState>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const upload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors(["Format gambar harus berupa JPG, JPEG, PNG, atau WebP."]);
      return;
    }
    if (form.images.length >= 5) {
      setErrors(["Produk dapat memiliki maksimal 5 foto."]);
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", mitraProductFolder);

      const response = await http.post<{ path: string }>("/editor/uploads/image", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      update({
        images: [...form.images, { image: response.data.path, sort_order: form.images.length }],
      });
      toast.success("Foto produk berhasil diunggah.", { title: "Berhasil" });
    } catch (error) {
      setErrors(getErrors(error, "Gagal mengunggah foto produk."));
    } finally {
      setUploading(false);
    }
  };

  const reorder = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;

    const images = [...form.images];
    [images[index], images[target]] = [images[target], images[index]];
    update({
      images: images.map((image, sort_order) => ({ ...image, sort_order })),
    });
  };

  const removeImage = (index: number) => {
    const images = form.images
      .filter((_, i) => i !== index)
      .map((image, sort_order) => ({ ...image, sort_order }));
    update({ images });
  };

  const submit = async () => {
    const validation: string[] = [];
    if (!form.title_id.trim() || !form.title_en.trim()) {
      validation.push("Judul Bahasa Indonesia dan Bahasa Inggris wajib diisi.");
    }
    if (!form.description_id.trim() || !form.description_en.trim()) {
      validation.push("Deskripsi Bahasa Indonesia dan Bahasa Inggris wajib diisi.");
    }
    if (
      !form.whatsapp_number ||
      !isValidPhoneNumber(form.whatsapp_number) ||
      !/^\+[1-9]\d{7,14}$/.test(form.whatsapp_number)
    ) {
      validation.push("Nomor WhatsApp harus dalam format internasional E.164 (contoh: +6281234567890).");
    }
    if (form.images.length > 5) {
      validation.push("Produk dapat memiliki maksimal 5 foto.");
    }

    if (validation.length > 0) {
      setErrors(validation);
      return;
    }

    setSaving(true);
    setErrors([]);

    const payload = {
      ...form,
      slug: form.slug.trim() || null,
      nama_mitra: form.nama_mitra?.trim() || null,
      images: form.images.map((image, sort_order) => ({
        image: image.image,
        sort_order,
      })),
    };

    try {
      if (mode === "create") {
        await http.post("/editor/mitra-products", payload);
      } else {
        await http.put(`/editor/mitra-products/${productId}`, payload);
      }

      toast.success(
        `Produk mitra berhasil ${mode === "create" ? "ditambahkan" : "diperbarui"}.`,
        { title: "Berhasil" }
      );
      navigate("/editor/mitra-products", { replace: true });
    } catch (error) {
      setErrors(getErrors(error, "Gagal menyimpan produk mitra."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-32 animate-pulse rounded-[28px] bg-slate-100" />
        <div className="h-96 animate-pulse rounded-[28px] bg-slate-100" />
      </div>
    );
  }

  const disabled = saving || uploading || deleting;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
                Produk Mitra
              </span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              {mode === "create" ? "Tambah Produk Mitra Baru" : "Edit Produk Mitra"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Publikasikan produk UMKM mitra binaan DPF beserta detail kontak WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/mitra-products")}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:opacity-60 active:scale-95"
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>{saving ? "Menyimpan..." : "Simpan Produk"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Errors Alert */}
      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm">
          <p className="font-bold text-rose-800">Periksa kembali isian formulir:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form Panel */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section: Basic Info */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700">
                <FontAwesomeIcon icon={faStore} />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold text-slate-900">
                  Informasi Utama Produk
                </h2>
                <p className="text-xs text-slate-500">
                  Isi detail nama mitra, judul, serta deskripsi produk.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {/* Nama Mitra */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Nama Mitra Binaan <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.nama_mitra ?? ""}
                  onChange={(event) => update({ nama_mitra: event.target.value })}
                  placeholder="Contoh: RANISA FOOD, KERIPIK BERKAH"
                  disabled={disabled}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Jika dikosongkan, label mitra akan otomatis menggunakan fallback "Mitra Wakaf DPF".
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  URL Slug <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => update({ slug: event.target.value })}
                  placeholder="slug-produk-mitra (Otomatis dibuat dari Judul Indonesia)"
                  disabled={disabled}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
                />
              </div>

              {/* Title ID & EN */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Judul Produk (Bahasa Indonesia) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title_id}
                    onChange={(event) => update({ title_id: event.target.value })}
                    placeholder="Contoh: Crispy Chicken Gurih"
                    disabled={disabled}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={(event) => update({ title_en: event.target.value })}
                    placeholder="Example: Crispy Savory Chicken"
                    disabled={disabled}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
                  />
                </div>
              </div>

              {/* Description ID & EN */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Deskripsi Produk (Bahasa Indonesia) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.description_id}
                  onChange={(event) => update({ description_id: event.target.value })}
                  placeholder="Jelaskan spesifikasi, varian rasa, keunggulan, atau bahan produk..."
                  rows={5}
                  disabled={disabled}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Description (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.description_en}
                  onChange={(event) => update({ description_en: event.target.value })}
                  placeholder="Describe the product specifications, flavor variants, or materials in English..."
                  rows={5}
                  disabled={disabled}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
                />
              </div>
            </div>
          </div>

          {/* Section: Product Images */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-slate-900">
                  Foto Produk
                </h2>
                <p className="text-xs text-slate-500">
                  Unggah hingga 5 gambar produk. Foto pertama akan menjadi cover utama.
                </p>
              </div>

              <label className="inline-flex cursor-pointer shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800">
                <FontAwesomeIcon icon={faImage} />
                <span>{uploading ? "Mengunggah..." : "Tambah Foto"}</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={disabled || form.images.length >= 5}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) upload(file);
                  }}
                />
              </label>
            </div>

            {/* Images Grid */}
            <div className="mt-6">
              {form.images.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                  <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-300" />
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    Belum ada foto produk yang diunggah.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Foto opsional, namun sangat disarankan untuk daya tarik visual halaman publik.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {form.images.map((item, index) => (
                    <div
                      key={`${item.image}-${index}`}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <img
                          src={resolveMitraProductImage(item.image)}
                          alt={`Foto produk ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          {index === 0 ? "★ Cover Utama" : `#${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50/80 border-t border-slate-100">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => reorder(index, -1)}
                            disabled={disabled || index === 0}
                            title="Geser Naik"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-30"
                          >
                            <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reorder(index, 1)}
                            disabled={disabled || index === form.images.length - 1}
                            title="Geser Turun"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-30"
                          >
                            <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={disabled}
                          title="Hapus Foto"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:h-fit">
          <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Pengaturan Kontak & Status
            </h2>

            {/* WhatsApp Contact */}
            <div>
              <PhoneInput
                value={form.whatsapp_number}
                onChange={(value) => update({ whatsapp_number: value || "" })}
                label="Nomor WhatsApp Mitra"
                required
                disabled={disabled}
              />
              <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                <FontAwesomeIcon icon={faWhatsapp} className="mt-0.5 text-emerald-600" />
                <span>
                  Nomor ini digunakan langsung untuk tombol kontak pemesanan pada halaman detail produk.
                </span>
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Status Publikasi <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  update({ status: event.target.value as MitraProductFormState["status"] })
                }
                disabled={disabled}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
              >
                <option value="draft">Draf (Disimpan Internal)</option>
                <option value="published">Terbit (Tampil di Publik)</option>
                <option value="archived">Arsip (Disembunyikan)</option>
              </select>
            </div>

            {/* Information Callout */}
            <div className="rounded-2xl border border-brandGreen-100 bg-brandGreen-50/50 p-4 text-xs text-brandGreen-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-brandGreen-800">
                <FontAwesomeIcon icon={faStore} />
                <span>Etika Katalog Mitra</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Pastikan nama mitra dan kontak WhatsApp terisi dengan benar. Produk yang diterbitkan akan langsung dapat diakses calon pembeli melalui katalog DPF.
              </p>
            </div>
          </div>

          {/* Zona Berbahaya - Hapus Produk Mitra */}
          {mode === "edit" && productId && (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus Produk Mitra</h2>
              <p className="mt-2 text-sm text-slate-600">
                Menghapus produk mitra akan menghilangkan produk beserta seluruh foto-fotonya dari sistem. Tindakan ini tidak bisa dibatalkan.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={disabled}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Produk
                </button>
              ) : (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                  <p className="mt-1 text-sm text-red-700">Klik "Ya, hapus" untuk melanjutkan.</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={deleting}
                      className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {deleting ? "Menghapus..." : "Ya, hapus"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
