import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type OrganizationMember = {
  id: number;
  name: string;
  name_en?: string | null;
  slug?: string | null;
  position_title: string;
  position_title_en?: string | null;
  group: string;
  group_en?: string | null;
  photo_path?: string | null;
  short_bio?: string | null;
  short_bio_en?: string | null;
  long_bio?: string | null;
  long_bio_en?: string | null;
  email?: string | null;
  phone?: string | null;
  show_contact: boolean;
  order: number;
  is_active: boolean;
};

type FormState = {
  name: string;
  name_en: string;
  slug: string;
  position_title: string;
  position_title_en: string;
  group: string;
  group_en: string;
  photo_path: string;
  short_bio: string;
  short_bio_en: string;
  long_bio: string;
  long_bio_en: string;
  email: string;
  phone: string;
  show_contact: boolean;
  order: string;
  is_active: boolean;
};

const GROUP_SUGGESTIONS = ["pembina", "pengawas", "pengurus", "staff", "relawan", "lainnya"];

const emptyForm: FormState = {
  name: "",
  name_en: "",
  slug: "",
  position_title: "",
  position_title_en: "",
  group: "",
  group_en: "",
  photo_path: "",
  short_bio: "",
  short_bio_en: "",
  long_bio: "",
  long_bio_en: "",
  email: "",
  phone: "",
  show_contact: false,
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

const getNextOrderAtEnd = (members: OrganizationMember[], excludeId?: number) => {
  let maxOrder = -1;
  members.forEach((m) => {
    if (excludeId && m.id === excludeId) return;
    const n = Number(m.order);
    if (!Number.isFinite(n)) return;
    maxOrder = Math.max(maxOrder, Math.floor(n));
  });
  return Math.max(0, maxOrder + 1);
};

type Mode = "create" | "edit";

export function EditorOrganizationMemberForm({ mode, memberId }: { mode: Mode; memberId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [groupPeers, setGroupPeers] = useState<OrganizationMember[]>([]);
  const [groupPeersLoading, setGroupPeersLoading] = useState(false);
  const [groupPeersError, setGroupPeersError] = useState<string | null>(null);
  const initialGroupRef = useRef<string>("");

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditIdValid = typeof memberId === "number" && Number.isFinite(memberId) && memberId > 0;
  const canSubmit = !loading && !saving && !photoUploading && !deleting;
  const canDelete = mode === "edit" && isEditIdValid && !saving && !photoUploading && !deleting;

  const orderNumber = useMemo(() => {
    const n = Number(form.order);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }, [form.order]);

  const orderHint = useMemo(() => {
    if (!form.group.trim()) return "Isi grup untuk mengatur urutan otomatis.";
    if (groupPeersLoading) return "Memeriksa urutan dalam grup...";
    if (groupPeersError) return groupPeersError;
    const peersCount = groupPeers.filter((m) => (mode === "edit" ? m.id !== memberId : true)).length;
    return `Urutan otomatis saat ini: #${orderNumber}. Anggota dalam grup: ${peersCount}.`;
  }, [form.group, groupPeers, groupPeersError, groupPeersLoading, memberId, mode, orderNumber]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID anggota tidak valid."]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setErrors([]);
    http
      .get<OrganizationMember>(`/editor/organization-members/${memberId}`)
      .then((res) => {
        if (!active) return;
        const m = res.data;
        initialGroupRef.current = String(m.group ?? "");
        setForm({
          name: m.name ?? "",
          name_en: m.name_en ?? "",
          slug: m.slug ?? "",
          position_title: m.position_title ?? "",
          position_title_en: m.position_title_en ?? "",
          group: m.group ?? "",
          group_en: m.group_en ?? "",
          photo_path: m.photo_path ?? "",
          short_bio: m.short_bio ?? "",
          short_bio_en: m.short_bio_en ?? "",
          long_bio: m.long_bio ?? "",
          long_bio_en: m.long_bio_en ?? "",
          email: m.email ?? "",
          phone: m.phone ?? "",
          show_contact: Boolean(m.show_contact),
          order: String(m.order ?? 0),
          is_active: Boolean(m.is_active),
        });
      })
      .catch((err) => {
        if (!active) return;
        setErrors(normalizeErrors(err));
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [isEditIdValid, memberId, mode]);

  useEffect(() => {
    const groupValue = form.group.trim();
    setGroupPeersError(null);

    if (!groupValue) {
      setGroupPeers([]);
      setGroupPeersLoading(false);
      if (mode === "create") {
        setForm((s) => ({ ...s, order: "0" }));
      }
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setGroupPeersLoading(true);
      http
        .get<{ data: OrganizationMember[] }>("/editor/organization-members", {
          params: { group: groupValue, per_page: 200, page: 1 },
        })
        .then((res) => {
          if (!active) return;
          const list = res.data?.data ?? [];
          setGroupPeers(list);

          const excludeId = mode === "edit" ? memberId : undefined;
          const nextOrder = getNextOrderAtEnd(list, excludeId);
          const currentOrder = Number(form.order);
          const conflict = list.some((m) => m.id !== excludeId && m.order === currentOrder);
          const groupChanged = mode === "edit" && groupValue !== initialGroupRef.current.trim();
          const shouldAutoAssign = mode === "create" || conflict || groupChanged;

          if (shouldAutoAssign && String(nextOrder) !== String(form.order)) {
            setForm((s) => ({ ...s, order: String(nextOrder) }));
          }
        })
        .catch(() => {
          if (!active) return;
          setGroupPeers([]);
          setGroupPeersError("Gagal memuat urutan grup. Coba lagi.");
        })
        .finally(() => {
          if (!active) return;
          setGroupPeersLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.group, mode, memberId]);

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

  const onUploadPhoto = async (file: File) => {
    setPhotoUploadError(null);
    setPhotoUploading(true);
    try {
      const path = await uploadImage(file, "uploads/organization/members");
      setForm((s) => ({ ...s, photo_path: path }));
    } catch (err: any) {
      setPhotoUploadError(normalizeErrors(err).join(" "));
    } finally {
      setPhotoUploading(false);
    }
  };

  const payloadForRequest = (state: FormState) => {
    return {
      name: state.name.trim(),
      name_en: state.name_en.trim() || null,
      slug: state.slug.trim() || null,
      position_title: state.position_title.trim(),
      position_title_en: state.position_title_en.trim() || null,
      group: state.group.trim(),
      group_en: state.group_en.trim() || null,
      photo_path: state.photo_path.trim() || null,
      short_bio: state.short_bio.trim() || null,
      short_bio_en: state.short_bio_en.trim() || null,
      long_bio: state.long_bio.trim() || null,
      long_bio_en: state.long_bio_en.trim() || null,
      email: state.email.trim() || null,
      phone: state.phone.trim() || null,
      show_contact: Boolean(state.show_contact),
      is_active: Boolean(state.is_active),
    };
  };

  const onSubmit = async () => {
    if (mode === "edit" && !isEditIdValid) {
      setErrors(["ID anggota tidak valid."]);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      const basePayload = payloadForRequest(form);
      const groupValue = String(basePayload.group ?? "").trim();
      if (!groupValue) {
        setErrors(["Grup wajib diisi."]);
        return;
      }

      let resolvedOrder = orderNumber;
      try {
        setGroupPeersError(null);
        const res = await http.get<{ data: OrganizationMember[] }>("/editor/organization-members", {
          params: { group: groupValue, per_page: 200, page: 1 },
        });
        const list = res.data?.data ?? [];
        const excludeId = mode === "edit" ? memberId : undefined;

        if (mode === "create") {
          resolvedOrder = getNextOrderAtEnd(list);
        } else {
          const conflict = list.some((m) => m.id !== excludeId && m.order === orderNumber);
          const groupChanged = groupValue !== initialGroupRef.current.trim();
          if (conflict || groupChanged) {
            resolvedOrder = getNextOrderAtEnd(list, excludeId);
          }
        }
      } catch {
        setErrors(["Gagal memverifikasi urutan tampil. Coba lagi."]);
        return;
      }

      setForm((s) => ({ ...s, order: String(resolvedOrder) }));
      const payload = { ...basePayload, order: resolvedOrder };
      if (mode === "create") {
        await http.post("/editor/organization-members", payload);
        toast.success("Anggota struktur berhasil dibuat.", { title: "Berhasil" });
      } else {
        await http.put(`/editor/organization-members/${memberId}`, payload);
        toast.success("Perubahan struktur berhasil disimpan.", { title: "Berhasil" });
      }
      navigate("/editor/organization-members", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID anggota tidak valid."]);
      return;
    }

    setDeleting(true);
    setErrors([]);
    try {
      await http.delete(`/editor/organization-members/${memberId}`);
      toast.success("Anggota struktur berhasil dihapus.", { title: "Berhasil" });
      navigate("/editor/organization-members", { replace: true });
    } catch (err: any) {
      setErrors(normalizeErrors(err));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const title = mode === "create" ? "Tambah Anggota" : "Ubah Anggota";
  const storedPhotoUrl = useMemo(() => resolveStorageUrl(form.photo_path), [form.photo_path]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-brandGreen-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brandGreen-700 ring-1 ring-brandGreen-100">
              Struktur
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Tambahkan anggota struktur dengan jabatan dan grup yang jelas."
                : "Perbarui informasi anggota agar selalu rapi dan akurat."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/organization-members")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={saving || photoUploading || deleting}
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
            {errors.slice(0, 10).map((msg, idx) => (
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
            <p className="text-xs font-bold tracking-wide text-slate-400">Informasi</p>
            <div className="mt-5 grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Nama (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Nama anggota..."
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
                  placeholder="Member name (English)..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Jabatan (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.position_title}
                  onChange={(e) => setForm((s) => ({ ...s, position_title: e.target.value }))}
                  placeholder="Mis. Direktur, Ketua, Staff..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Position Title (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <input
                  value={form.position_title_en}
                  onChange={(e) => setForm((s) => ({ ...s, position_title_en: e.target.value }))}
                  placeholder="e.g. Director, Chairman, Staff..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Bio singkat (Bahasa Indonesia) <span className="text-slate-500">(opsional)</span>
                </span>
                <input
                  value={form.short_bio}
                  onChange={(e) => setForm((s) => ({ ...s, short_bio: e.target.value }))}
                  placeholder="Ringkasan singkat (maks 255 karakter)..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Short Bio (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <input
                  value={form.short_bio_en}
                  onChange={(e) => setForm((s) => ({ ...s, short_bio_en: e.target.value }))}
                  placeholder="Short summary (max 255 characters) (English)..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Bio lengkap (Bahasa Indonesia) <span className="text-slate-500">(opsional)</span>
                </span>
                <textarea
                  value={form.long_bio}
                  onChange={(e) => setForm((s) => ({ ...s, long_bio: e.target.value }))}
                  rows={7}
                  placeholder="Profil lengkap untuk kebutuhan public/internal..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Long Bio (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <textarea
                  value={form.long_bio_en}
                  onChange={(e) => setForm((s) => ({ ...s, long_bio_en: e.target.value }))}
                  rows={7}
                  placeholder="Full profile for public/internal purposes (English)..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold tracking-wide text-slate-400">Kontak</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">Email (opsional)</span>
                <input
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="email@contoh.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">No. HP (opsional)</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, show_contact: !s.show_contact }))}
              disabled={loading || saving || deleting}
              className={[
                "mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                form.show_contact
                  ? "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-800"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              <span>Tampilkan kontak di publik</span>
              <span className="text-xs font-semibold opacity-80">{form.show_contact ? "Tampil" : "Sembunyi"}</span>
            </button>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold tracking-wide text-slate-400">Foto</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Upload foto anggota.</p>
                  <p className="mt-1 text-xs text-slate-500">jpg/png/webp, max 4MB.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <FontAwesomeIcon icon={faImage} />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Pilih Foto
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                    setPhotoPreviewUrl(null);
                    setForm((s) => ({ ...s, photo_path: "" }));
                    setPhotoUploadError(null);
                  }}
                  disabled={!canSubmit || (!photoPreviewUrl && !form.photo_path)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hapus
                </button>

                {photoUploading ? (
                  <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
                ) : form.photo_path ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    Tersimpan
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-600">Belum ada.</span>
                )}
              </div>

              <div className="mt-4">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  {photoPreviewUrl || storedPhotoUrl ? (
                    <img
                      src={photoPreviewUrl ?? storedPhotoUrl ?? undefined}
                      alt=""
                      className="h-[320px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center text-sm font-semibold text-slate-500">
                      Tidak ada pratinjau.
                    </div>
                  )}
                </div>
              </div>

              {photoUploadError && <p className="mt-3 text-sm font-semibold text-red-700">{photoUploadError}</p>}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={photoInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                  setPhotoPreviewUrl(URL.createObjectURL(file));
                  void onUploadPhoto(file);
                }}
                disabled={!canSubmit}
              />
            </div>
          </div>

          {mode === "edit" ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus anggota</h2>
              <p className="mt-2 text-sm text-slate-600">
                Anggota yang dihapus tidak akan tampil di sistem. Pastikan sudah benar.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canDelete}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Hapus Anggota
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
                  Grup (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.group}
                  onChange={(e) => setForm((s) => ({ ...s, group: e.target.value }))}
                  placeholder="Mis. pengurus"
                  list="org-group-options"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
                <datalist id="org-group-options">
                  {GROUP_SUGGESTIONS.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Group (English) <span className="text-slate-400">(Optional)</span>
                </span>
                <input
                  value={form.group_en}
                  onChange={(e) => setForm((s) => ({ ...s, group_en: e.target.value }))}
                  placeholder="e.g. management"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">Slug (opsional)</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
                  placeholder="Otomatis dari nama jika kosong"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving || deleting}
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold tracking-wide text-slate-400">Urutan tampil</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Otomatis</p>
                <p className="mt-1 text-xs text-slate-500">
                  Sistem mengatur urutan dalam grup untuk mencegah duplikasi.
                </p>
                <p
                  className={[
                    "mt-3 text-xs font-semibold",
                    groupPeersError ? "text-red-700" : "text-slate-600",
                  ].join(" ")}
                >
                  {orderHint}
                </p>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorOrganizationMemberForm;


