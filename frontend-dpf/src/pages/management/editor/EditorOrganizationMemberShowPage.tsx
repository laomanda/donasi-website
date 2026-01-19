import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faEnvelope,
  faPenToSquare,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
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
  long_bio?: string | null;
  email?: string | null;
  phone?: string | null;
  show_contact: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

const normalizeWhatsAppNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
};

const statusTone = (active: boolean) =>
  active ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-red-100 text-red-700 ring-red-200";
const contactTone = (visible: boolean) =>
  visible ? "bg-sky-100 text-sky-700 ring-sky-200" : "bg-slate-100 text-slate-700 ring-slate-200";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="min-w-0 text-right text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function EditorOrganizationMemberShowPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const memberId = useMemo(() => Number(id), [id]);

  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isIdValid = Number.isFinite(memberId) && memberId > 0;

  useEffect(() => {
    if (!isIdValid) {
      setError("ID anggota tidak valid.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    http
      .get<OrganizationMember>(`/editor/organization-members/${memberId}`)
      .then((res) => {
        if (!active) return;
        setMember(res.data);
      })
      .catch(() => {
        if (!active) return;
        setError("Gagal memuat detail struktur.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [isIdValid, memberId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [memberId]);

  const photo = useMemo(() => {
    return resolveStorageUrl(member?.photo_path) ?? imagePlaceholder;
  }, [member?.photo_path]);
  const whatsappLink = useMemo(() => {
    if (!member?.phone) return undefined;
    const normalized = normalizeWhatsAppNumber(member.phone);
    return normalized ? `https://wa.me/${normalized}` : undefined;
  }, [member?.phone]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Organisasi
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              Detail Struktur
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Rincian profil, jabatan, dan informasi kontak anggota.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/organization-members")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>

            {member ? (
              <button
                type="button"
                onClick={() => navigate(`/editor/organization-members/${member.id}/edit`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                Ubah
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-56 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] w-full animate-pulse rounded-[28px] bg-slate-100" />
            </div>
            <div className="space-y-4 lg:col-span-7">
              <div className="h-10 w-3/4 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-600 bg-rose-500 p-4 text-sm font-semibold text-white">{error}</div>
      ) : member ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 border-l-4 border-l-emerald-300 bg-white shadow-sm">
              <div className="relative bg-slate-100">
                <img
                  src={photo}
                  alt={member.name}
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
              </div>
              <div className="p-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">{member.name}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                      {member.position_title}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
                      {member.group}
                    </span>
                  </div>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Ringkasan visibilitas data di halaman publik.</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusTone(Boolean(member.is_active))}`}>
                    {member.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${contactTone(member.show_contact)}`}>
                    {member.show_contact ? "Kontak tampil" : "Kontak disembunyikan"}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-start gap-2">
                    <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                    <span>
                      <span className="font-bold text-slate-700">Aktif</span> akan muncul di halaman publik (Tentang Kami).{" "}
                      <span className="font-bold text-slate-700">Nonaktif</span> hanya tersimpan di dashboard.
                    </span>
                  </span>
                  <span className="mt-2 inline-flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4" aria-hidden="true" />
                    <span>
                      <span className="font-bold text-slate-700">Kontak tampil</span> menampilkan email/telepon ke publik.{" "}
                      <span className="font-bold text-slate-700">Kontak disembunyikan</span> tetap tersimpan, tetapi tidak terlihat di halaman publik.
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-amber-300 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Kontak</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Akses internal. Bisa ditampilkan ke publik sesuai pengaturan.</p>
              <div className="mt-5 space-y-3">
                <a
                  href={member.email ? `mailto:${member.email}` : undefined}
                  className={[
                    "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                    member.email ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50" : "border-slate-100 bg-slate-50 text-slate-500",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        member.email ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    Email
                  </span>
                  <span className="min-w-0 truncate">{member.email || "-"}</span>
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                    member.phone ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50" : "border-slate-100 bg-slate-50 text-slate-500",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        member.phone ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      <FontAwesomeIcon icon={faPhone} />
                    </span>
                    Telepon
                  </span>
                  <span className="min-w-0 truncate">{member.phone || "-"}</span>
                </a>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-start gap-2">
                    <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                    Jika "Kontak disembunyikan", data ini tetap tersimpan tetapi tidak terlihat di halaman publik.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7 lg:sticky lg:top-24 lg:self-start lg:h-fit">
            <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Profil</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-slate-900">Data anggota</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">Ringkasan detail anggota struktur untuk kebutuhan publik dan internal.</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Nama" value={member.name} />
                <InfoRow label="Jabatan" value={member.position_title} />
                <InfoRow label="Grup" value={member.group} />
                <InfoRow label="Slug" value={member.slug ? member.slug : "-"} />
                <InfoRow label="Email" value={member.email ? member.email : "-"} />
                <InfoRow label="Telepon" value={member.phone ? member.phone : "-"} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-start gap-2">
                  <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                  Grup dipakai untuk mengelompokkan struktur di halaman Tentang Kami. Jabatan tampil sebagai keterangan utama di kartu anggota.
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Ringkasan</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{member.short_bio ? member.short_bio : "-"}</p>
              </div>

              {member.long_bio ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Profil lengkap</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{member.long_bio}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-sky-300 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Metadata</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Informasi sistem untuk audit dan jejak perubahan.</p>
              <div className="mt-5 space-y-3">
                <InfoRow label="Slug" value={member.slug ? member.slug : "-"} />
                <InfoRow label="Dibuat" value={formatDateTime(member.created_at)} />
                <InfoRow label="Diperbarui" value={formatDateTime(member.updated_at)} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EditorOrganizationMemberShowPage;

