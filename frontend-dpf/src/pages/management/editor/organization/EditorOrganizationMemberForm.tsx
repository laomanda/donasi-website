import { useEffect, useMemo, useRef, useState } from "react";
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

const STANDARD_POSITION_TRANSLATIONS: Record<string, string> = {
  ketua: "Chairperson",
  "ketua umum": "General Chairperson",
  "wakil ketua": "Vice Chairperson",
  "ketua pembina": "Head of Patrons",
  "anggota pembina": "Member of Patrons",
  "ketua pengawas": "Head of Supervisors",
  "anggota pengawas": "Member of Supervisors",
  "ketua pengurus": "Head of Management",
  "anggota pengurus": "Member of Management",
  "ketua yayasan": "Head of Foundation",
  sekretaris: "Secretary",
  "sekretaris jenderal": "Secretary General",
  bendahara: "Treasurer",
  direktur: "Director",
  "direktur utama": "President Director",
  "direktur eksekutif": "Executive Director",
  manajer: "Manager",
  "manajer operasional": "Operations Manager",
  "kepala divisi": "Head of Division",
  "kepala bagian": "Head of Section",
  staf: "Staff",
  anggota: "Member",
  relawan: "Volunteer",
  penasihat: "Advisor",
  pembina: "Patron",
  pengawas: "Supervisor",
};

const STANDARD_POSITIONS = [
  "Ketua Yayasan",
  "Ketua Pembina",
  "Anggota Pembina",
  "Ketua Pengawas",
  "Anggota Pengawas",
  "Ketua Pengurus",
  "Sekretaris",
  "Bendahara",
  "Direktur",
  "Kepala Divisi",
  "Manajer",
  "Anggota",
  "Staf",
  "Relawan",
];

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
  const [allMembers, setAllMembers] = useState<OrganizationMember[]>([]);

  const initialGroupRef = useRef<string>("");
  const lastSyncedGroupRef = useRef<string>("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch all members once to provide rich suggestions from existing database data
  useEffect(() => {
    http
      .get<{ data: OrganizationMember[] }>("/editor/organization-members", { params: { per_page: 500 } })
      .then((res) => {
        const list = res.data?.data ?? [];
        setAllMembers(list);
      })
      .catch(() => {});
  }, []);

  // 2. Derive unique positions and translations from DB + standard fallback
  const { allAvailablePositions, positionTranslations } = useMemo(() => {
    const translations: Record<string, string> = { ...STANDARD_POSITION_TRANSLATIONS };
    const seen = new Set<string>();
    const positions: string[] = [];

    // Prioritize existing positions from real database records
    for (const m of allMembers) {
      const rawTitle = String(m.position_title ?? "").trim();
      if (!rawTitle) continue;
      const lower = rawTitle.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        positions.push(rawTitle);
      }
      const rawEn = String(m.position_title_en ?? "").trim();
      if (rawEn && !translations[lower]) {
        translations[lower] = rawEn;
      }
    }

    // Add standard positions if not yet included
    for (const std of STANDARD_POSITIONS) {
      const lower = std.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        positions.push(std);
      }
    }

    return { allAvailablePositions: positions, positionTranslations: translations };
  }, [allMembers]);

  // 3. Derive unique groups, translations, and existing group orders
  const { allAvailableGroups, groupTranslations, groupOrders, nextAvailableOrder } = useMemo(() => {
    const translations: Record<string, string> = {};
    const orders: Record<string, number> = {};
    const seen = new Set<string>();
    const groups: string[] = [];
    const usedOrdersList: number[] = [];

    // Prioritize existing groups from real database records
    for (const m of allMembers) {
      const rawGroup = String(m.group ?? "").trim();
      if (!rawGroup) continue;
      const lower = rawGroup.toLowerCase();
      const capitalized = rawGroup.charAt(0).toUpperCase() + rawGroup.slice(1);

      if (!seen.has(lower)) {
        seen.add(lower);
        groups.push(capitalized);
      }

      const rawEn = String(m.group_en ?? "").trim();
      if (rawEn && !translations[lower]) {
        translations[lower] = rawEn;
      }

      const ord = typeof m.order === "number" ? m.order : parseInt(String(m.order));
      if (!isNaN(ord)) {
        usedOrdersList.push(ord);
        if (orders[lower] === undefined || ord < orders[lower]) {
          orders[lower] = ord;
        }
      }
    }

    // Include standard groups
    for (const std of ORGANIZATION_GROUPS) {
      const lower = std.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        groups.push(std);
      }
      const stdEn = translateGroupToEn(std);
      if (stdEn && !translations[lower]) {
        translations[lower] = stdEn;
      }
    }

    // Next order is strictly higher than any currently used order so it NEVER interferes with existing groups!
    let nextOrder = usedOrdersList.length > 0 ? Math.max(...usedOrdersList) + 1 : 1;
    const usedSet = new Set(Object.values(orders));
    while (usedSet.has(nextOrder)) {
      nextOrder++;
    }

    return {
      allAvailableGroups: groups,
      groupTranslations: translations,
      groupOrders: orders,
      nextAvailableOrder: nextOrder,
    };
  }, [allMembers]);

  // Check collision between current group's order and other groups
  const currentGroupNorm = form.group.trim().toLowerCase();
  const currentOrderNum = parseInt(form.order);

  const conflictingGroups = useMemo(() => {
    if (isNaN(currentOrderNum) || !currentGroupNorm) return [];
    return Object.entries(groupOrders)
      .filter(([grp, ord]) => ord === currentOrderNum && grp !== currentGroupNorm)
      .map(([grp]) => grp);
  }, [groupOrders, currentOrderNum, currentGroupNorm]);

  const hasOrderCollision = conflictingGroups.length > 0;

  const isEditIdValid = typeof memberId === "number" && Number.isFinite(memberId) && memberId > 0;
  // Button Simpan disabled if saving, loading, deleting, or if order collides with another group!
  const canSubmit = !loading && !saving && !deleting && !hasOrderCollision;
  const canDelete = mode === "edit" && isEditIdValid && !saving && !deleting;

  // 4. In create mode, sync to safe next available order if current order collides or is not yet set
  useEffect(() => {
    if (mode !== "create") return;
    const currentGroup = form.group.trim().toLowerCase();
    // If group is empty or group has no existing order in DB:
    if (!currentGroup || groupOrders[currentGroup] === undefined) {
      const ordNum = parseInt(form.order);
      const isColliding = !isNaN(ordNum) && Object.entries(groupOrders).some(([grp, ord]) => ord === ordNum && grp !== currentGroup);
      if (form.order === "" || form.order === "0" || isColliding || !lastSyncedGroupRef.current) {
        setForm((s) => ({ ...s, order: String(nextAvailableOrder) }));
      }
    }
  }, [mode, nextAvailableOrder, groupOrders]);

  // 5. In edit mode, load member data
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
        const grp = String(m.group ?? "").trim();
        initialGroupRef.current = grp;
        lastSyncedGroupRef.current = grp;
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

  // Handle position change with auto-translation
  const handlePositionChange = (newPos: string) => {
    const trimmed = newPos.trim();
    const normalized = trimmed.toLowerCase();
    const en = positionTranslations[normalized] || "";

    setForm((s) => {
      const next = { ...s, position_title: newPos };
      const currentEn = s.position_title_en.trim();
      const prevAutoEn = positionTranslations[s.position_title.trim().toLowerCase()] || "";
      if (en && (!currentEn || currentEn === prevAutoEn)) {
        next.position_title_en = en;
      }
      return next;
    });
  };

  // Handle group change with auto-translation and safe order suggestion
  const handleGroupChange = (newGroup: string) => {
    const trimmed = newGroup.trim();
    const normalized = trimmed.toLowerCase();

    // 1. English translation
    let autoEn: string | undefined = undefined;
    const stdEn = translateGroupToEn(trimmed);
    if (stdEn) {
      autoEn = stdEn;
    } else if (groupTranslations[normalized]) {
      autoEn = groupTranslations[normalized];
    }

    // 2. Order suggestion (only auto-updates order when the group changes)
    let suggestedOrder = form.order;
    if (normalized !== lastSyncedGroupRef.current.toLowerCase()) {
      if (groupOrders[normalized] !== undefined) {
        // Existing group: align with the group's registered position
        suggestedOrder = String(groupOrders[normalized]);
      } else if (trimmed !== "") {
        // Brand new group: suggest nextAvailableOrder (safe from collision!)
        suggestedOrder = String(nextAvailableOrder);
      }
      lastSyncedGroupRef.current = trimmed;
    }

    setForm((s) => {
      const next = { ...s, group: newGroup, order: suggestedOrder };
      const currentGroupEn = s.group_en.trim();
      const prevGroupEn = groupTranslations[s.group.trim().toLowerCase()] || translateGroupToEn(s.group.trim()) || "";
      if (autoEn !== undefined && (!currentGroupEn || currentGroupEn === prevGroupEn)) {
        next.group_en = autoEn;
      }
      return next;
    });
  };

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

    if (hasOrderCollision) {
      const names = conflictingGroups.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(", ");
      setErrors([`Nomor urut ${currentOrderNum} sudah digunakan oleh grup "${names}". Silakan ganti nomor urut sebelum menyimpan.`]);
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
              className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-70"
              disabled={!canSubmit}
              title={
                hasOrderCollision
                  ? `Nomor urut ${currentOrderNum} sudah digunakan oleh grup ${conflictingGroups.join(", ")}. Tombol simpan dinonaktifkan.`
                  : undefined
              }
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
                  onChange={(e) => handlePositionChange(e.target.value)}
                  placeholder="Mis. Direktur, Ketua, Anggota Pembina."
                  list="org-position-options"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
                <datalist id="org-position-options">
                  {allAvailablePositions.map((pos) => (
                    <option key={pos} value={pos} />
                  ))}
                </datalist>
              </label>

              {/* Quick suggestion chips for Jabatan from DB */}
              {allAvailablePositions.length > 0 && (
                <div className="-mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                    <span>Pilihan dari data:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {allAvailablePositions.map((pos) => {
                      const isSelected = form.position_title.trim().toLowerCase() === pos.trim().toLowerCase();
                      return (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => handlePositionChange(pos)}
                          className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-brandGreen-100 text-brandGreen-800 ring-1 ring-brandGreen-500 font-bold"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                          }`}
                        >
                          {pos}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  onChange={(e) => handleGroupChange(e.target.value)}
                  placeholder="Mis. pengurus, pembina, pengawas"
                  list="org-group-options"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={loading || saving || deleting}
                />
                <datalist id="org-group-options">
                  {allAvailableGroups.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </label>

              {/* Quick suggestion chips for Grup from DB */}
              {allAvailableGroups.length > 0 && (
                <div className="-mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                    <span>Pilihan dari data:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {allAvailableGroups.map((grp) => {
                      const isSelected = form.group.trim().toLowerCase() === grp.trim().toLowerCase();
                      return (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => handleGroupChange(grp)}
                          className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-brandGreen-100 text-brandGreen-800 ring-1 ring-brandGreen-500 font-bold"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                          }`}
                        >
                          {grp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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

              {/* Nomor Urut Posisi Grup - Always visible and editable */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Nomor Urut Posisi Grup
                    </span>
                  </div>
                  
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm((s) => ({ ...s, order: e.target.value }))}
                    className={`mt-2 w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 ${
                      hasOrderCollision
                        ? "border-rose-300 text-rose-900 focus:border-rose-400 focus:ring-rose-400"
                        : "border-slate-300 text-slate-900 focus:border-slate-400 focus:ring-brandGreen-400"
                    }`}
                    disabled={loading || saving || deleting}
                    placeholder="0"
                  />
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Semua anggota dalam grup yang sama akan berada di posisi yang sama. 
                    <br />Nomor lebih kecil (misal: 0 atau 1) akan tampil lebih tinggi di halaman.
                  </p>
                </label>
                
                {(() => {
                  const currentGroup = form.group.trim();
                  if (!currentGroup) {
                    return (
                      <p className="mt-3 text-[10px] font-semibold text-slate-500">
                        Pilih atau isi nama grup untuk menentukan posisi urutan.
                      </p>
                    );
                  }

                  // 1. If there's an order collision with another group, show warning & disable save
                  if (hasOrderCollision) {
                    return (
                      <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                        <div className="flex items-start gap-2.5">
                          <span className="text-base leading-none">⚠️</span>
                          <div className="flex-1">
                            <p className="font-bold text-rose-900">
                              Nomor urut bentrok dengan grup lain!
                            </p>
                            <p className="mt-1 leading-relaxed text-rose-700">
                              Posisi <strong>{currentOrderNum}</strong> sudah digunakan oleh grup:{" "}
                              <strong className="underline">
                                {conflictingGroups.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(", ")}
                              </strong>.
                              <br />
                              Tombol <strong>Simpan</strong> dinonaktifkan agar urutan grup yang sudah ada tidak terganggu. Silakan gunakan nomor urut yang berbeda.
                            </p>
                            <button
                              type="button"
                              onClick={() => setForm((s) => ({ ...s, order: String(nextAvailableOrder) }))}
                              className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
                            >
                              Gunakan Nomor Urut {nextAvailableOrder} (Bebas Bentrok)
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 2. Existing group matching
                  const normalized = currentGroup.toLowerCase();
                  const existingOrder = groupOrders[normalized];
                  const isExistingGroup = existingOrder !== undefined;

                  if (isExistingGroup) {
                    return (
                      <div className="mt-3 rounded-xl bg-sky-50 border border-sky-200 p-3 text-xs text-sky-800">
                        <p>
                          Grup <span className="font-bold underline">"{currentGroup}"</span> sudah terdaftar di posisi: <span className="text-sm font-bold">{existingOrder}</span>
                        </p>
                        <p className="mt-1 text-[10px] text-sky-600">
                          Nomor urut disesuaikan otomatis dengan anggota grup ini. Anda tetap dapat mengubah nilainya jika diperlukan.
                        </p>
                      </div>
                    );
                  }

                  // 3. New group without collision
                  return (
                    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                      <p>
                        Grup baru terdeteksi. Otomatis disarankan urutan ke-<span className="text-sm font-bold">{form.order}</span> agar tidak bertabrakan dengan grup lain.
                      </p>
                      <p className="mt-1 text-[10px] text-emerald-600">
                        Nomor urut ini dapat Anda ubah sesuai hierarki struktur organisasi.
                      </p>
                    </div>
                  );
                })()}
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
