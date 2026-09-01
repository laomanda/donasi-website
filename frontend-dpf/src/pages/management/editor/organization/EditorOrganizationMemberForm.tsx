import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import PhoneInput from "../../../../components/ui/PhoneInput";
import { translateGroupToEn, ORGANIZATION_GROUPS } from "../../../../lib/organizationGroups";

type OrganizationMember = {
  id: number;
  name: string;
  position_title: string;
  position_title_en?: string | null;
  group: string;
  group_en?: string | null;
  email?: string | null;
  phone?: string | null;
  order: number;
  is_active: boolean;
};

type FormState = {
  name: string;
  position_title: string;
  position_title_en: string;
  group: string;
  group_en: string;
  email: string;
  phone: string;
  order: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  position_title: "",
  position_title_en: "",
  group: "",
  group_en: "",
  email: "",
  phone: "",
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dynamicGroups, setDynamicGroups] = useState<string[]>([]);
  const [dynamicGroupTranslations, setDynamicGroupTranslations] = useState<Record<string, string>>({});

  const isEditIdValid = typeof memberId === "number" && Number.isFinite(memberId) && memberId > 0;
  const canSubmit = !loading && !saving && !deleting;
  const canDelete = mode === "edit" && isEditIdValid && !saving && !deleting;

  useEffect(() => {
    // Fetch all members once to get unique group options
    http.get<{ data: OrganizationMember[] }>("/editor/organization-members", { params: { per_page: 500 } })
      .then(res => {
        const list = res.data?.data ?? [];
        const unique = Array.from(new Set(
          list.map(m => {
            const raw = String(m.group ?? "").trim();
            if (!raw) return "";
            return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
          }).filter(Boolean)
        ));

        // Build a dictionary of translations for dynamic groups
        const translations: Record<string, string> = {};
        for (let i = list.length - 1; i >= 0; i--) {
          const m = list[i];
          const rawId = String(m.group ?? "").trim().toLowerCase();
          const rawEn = String(m.group_en ?? "").trim();
          if (rawId && rawEn && !translations[rawId]) {
            translations[rawId] = rawEn;
          }
        }
        
        setDynamicGroups(unique);
        setDynamicGroupTranslations(translations);
      })
      .catch(() => {});
  }, []);

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
          position_title: m.position_title ?? "",
          position_title_en: m.position_title_en ?? "",
          group: m.group ?? "",
          group_en: m.group_en ?? "",
          email: m.email ?? "",
          phone: m.phone ?? "",
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

          const groupOrder = list.length > 0 ? list[0].order : null;
          const groupChanged = mode === "edit" && groupValue !== initialGroupRef.current.trim();
          const shouldAutoSync = mode === "create" || groupChanged;

          if (shouldAutoSync && groupOrder !== null && String(groupOrder) !== String(form.order)) {
            setForm((s) => ({ ...s, order: String(groupOrder) }));
          } else if (shouldAutoSync && groupOrder === null && mode === "create") {
            setForm((s) => ({ ...s, order: "1" }));
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
  }, [form.group, mode, memberId]);

  const payloadForRequest = (state: FormState) => {
    return {
      name: state.name.trim(),
      position_title: state.position_title.trim(),
      position_title_en: state.position_title_en.trim() || null,
      group: state.group.trim(),
      group_en: state.group_en.trim() || null,
      email: state.email.trim() || null,
      phone: state.phone.trim() || null,
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

      const finalOrder = Math.max(0, parseInt(form.order) || 0);

      const payload = { ...basePayload, order: finalOrder };
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Tambahkan anggota struktur dengan nama, jabatan, dan grup organisasi."
                : "Perbarui informasi anggota struktur organisasi."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button
              type="button"
              onClick={() => navigate("/editor/organization-members")}
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

      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          <p className="font-bold">Periksa kembali data berikut:</p>
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
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Informasi Anggota</p>
            <div className="mt-5 grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Nama Lengkap <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Contoh: Budi Santoso"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Jabatan (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.position_title}
                  onChange={(e) => setForm((s) => ({ ...s, position_title: e.target.value }))}
                  placeholder="Mis. Direktur, Ketua, Anggota Pembina."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Jabatan (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  value={form.position_title_en}
                  onChange={(e) => setForm((s) => ({ ...s, position_title_en: e.target.value }))}
                  placeholder="Terjemahan jabatan dalam Bahasa Inggris."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Kontak Internal (Opsional)</p>
              <span className="text-[11px] font-medium text-slate-400">Hanya tersimpan di database internal</span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Email <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="nama@contoh.com"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  No. HP / WhatsApp <span className="text-slate-400">(opsional)</span>
                </span>
                <div className="mt-2">
                  <PhoneInput
                    value={form.phone}
                    onChange={(val) => setForm((s) => ({ ...s, phone: val || "" }))}
                    disabled={loading || saving || deleting}
                  />
                </div>
              </label>
            </div>
          </div>

          {mode === "edit" ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus anggota</h2>
              <p className="mt-2 text-sm text-slate-600">
                Anggota yang dihapus tidak akan tampil di sistem. Pastikan data sudah benar.
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

        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:h-fit">
          <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Grup & Visibilitas</p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Grup (Bahasa Indonesia) <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.group}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((s) => {
                      const next = { ...s, group: val };
                      const en = translateGroupToEn(val);
                      if (en) {
                        next.group_en = en;
                      } else {
                        const dynamicEn = dynamicGroupTranslations[val.trim().toLowerCase()];
                        if (dynamicEn) {
                          next.group_en = dynamicEn;
                        }
                      }
                      return next;
                    });
                  }}
                  placeholder="Mis. pengurus, pembina, pengawas"
                  list="org-group-options"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
                <datalist id="org-group-options">
                  {(() => {
                    const standardLower = ORGANIZATION_GROUPS.map(g => g.toLowerCase());
                    const filteredDynamic = dynamicGroups.filter(g => !standardLower.includes(g.toLowerCase()));
                    const allGroups = [...ORGANIZATION_GROUPS, ...filteredDynamic].sort((a, b) => a.localeCompare(b));
                    return allGroups.map((g) => (
                      <option key={g} value={g} />
                    ));
                  })()}
                </datalist>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Grup (Bahasa Inggris) <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  value={form.group_en}
                  onChange={(e) => setForm((s) => ({ ...s, group_en: e.target.value }))}
                  placeholder="Terjemahan grup (opsional)."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Nomor Urut Posisi Grup</span>
                  
                  {!(groupPeers.length > 0) && (
                    <input
                      type="number"
                      min="0"
                      value={form.order}
                      onChange={(e) => setForm((s) => ({ ...s, order: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none"
                      disabled={loading || saving || deleting || groupPeersLoading}
                    />
                  )}
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Semua anggota dalam grup yang sama akan berada di posisi yang sama. 
                    <br />Nomor lebih kecil (misal: 1) akan tampil lebih tinggi di halaman.
                  </p>
                </label>
                
                {groupPeersLoading ? (
                  <p className="mt-3 text-[10px] font-semibold text-slate-400 animate-pulse">Memeriksa posisi grup...</p>
                ) : groupPeers.length > 0 ? (
                  <div className="mt-3 rounded-xl bg-sky-100/50 p-3 text-xs font-semibold text-sky-800 ring-1 ring-sky-200">
                    <p>Grup <span className="font-bold underline">"{form.group}"</span> sudah terdaftar di posisi: <span className="text-sm font-bold">{groupPeers[0].order}</span></p>
                    <p className="mt-1 text-[10px] font-normal text-sky-600">Nomor urut dikunci untuk menyamakan dengan anggota grup lainnya.</p>
                  </div>
                ) : (
                  <p
                    className={[
                      "mt-3 text-[10px] font-semibold",
                      groupPeersError ? "text-red-700" : "text-slate-500",
                    ].join(" ")}
                  >
                    {groupPeersError || (form.group.trim() ? "Grup baru akan dibuat." : "Pilih grup untuk melihat posisi.") }
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, is_active: !s.is_active }))}
                disabled={loading || saving || deleting}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                  form.is_active
                    ? "border-brandGreen-200 bg-brandGreen-50 text-brandGreen-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>Status Aktif</span>
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
