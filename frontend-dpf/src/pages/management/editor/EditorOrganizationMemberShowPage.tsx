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

const statusTone = (active: boolean) =>
  active ? "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100" : "bg-slate-100 text-slate-700 ring-slate-200";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <p className="text-xs font-bold tracking-wide text-slate-400">{label}</p>
      <p className="min-w-0 text-right text-sm font-semibold text-slate-800">{value}</p>
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-brandGreen-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brandGreen-700 ring-1 ring-brandGreen-100">
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
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>

            {member ? (
              <button
                type="button"
                onClick={() => navigate(`/editor/organization-members/${member.id}/edit`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
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
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : member ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="relative bg-slate-100">
                <img
                  src={photo}
                  alt={member.name}
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Ringkasan visibilitas data di halaman publik.</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusTone(Boolean(member.is_active))}`}>
                    {member.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    {member.show_contact ? "Kontak tampil" : "Kontak disembunyikan"}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-start gap-2">
                    <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                    <span>
                      <span className="font-bold text-slate-700">Aktif</span> akan muncul di landing (Tentang Kami).{" "}
                      <span className="font-bold text-slate-700">Nonaktif</span> hanya tersimpan di dashboard.
                    </span>
                  </span>
                  <span className="mt-2 inline-flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4" aria-hidden="true" />
                    <span>
                      <span className="font-bold text-slate-700">Kontak tampil</span> menampilkan email/telepon ke publik.{" "}
                      <span className="font-bold text-slate-700">Kontak disembunyikan</span> tetap tersimpan, tetapi tidak terlihat di landing.
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kontak</p>
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
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    Email
                  </span>
                  <span className="min-w-0 truncate">{member.email || "-"}</span>
                </a>
                <a
                  href={member.phone ? `tel:${member.phone}` : undefined}
                  className={[
                    "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                    member.phone ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50" : "border-slate-100 bg-slate-50 text-slate-500",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-500" />
                    Telepon
                  </span>
                  <span className="min-w-0 truncate">{member.phone || "-"}</span>
                </a>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-start gap-2">
                    <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                    Jika "Kontak disembunyikan", data ini tetap tersimpan tetapi tidak terlihat di halaman publik.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Profil</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-slate-900">Data anggota</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">Ringkasan detail anggota struktur untuk kebutuhan landing dan internal.</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Nama" value={member.name} />
                <InfoRow label="Jabatan" value={member.position_title} />
                <InfoRow label="Grup" value={member.group} />
                <InfoRow label="Slug" value={member.slug ? member.slug : "-"} />
                <InfoRow label="Status di landing" value={member.is_active ? "Aktif (ditampilkan)" : "Nonaktif (tidak ditampilkan)"} />
                <InfoRow label="Kontak di landing" value={member.show_contact ? "Tampil" : "Disembunyikan"} />
                <InfoRow label="Email" value={member.email ? member.email : "-"} />
                <InfoRow label="Telepon" value={member.phone ? member.phone : "-"} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-start gap-2">
                  <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
                  Grup dipakai untuk mengelompokkan struktur di halaman Tentang Kami. Jabatan tampil sebagai keterangan utama di kartu anggota.
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
                <p className="text-xs font-bold tracking-wide text-slate-400">Bio singkat</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{member.short_bio ? member.short_bio : "-"}</p>
              </div>

              {member.long_bio ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-5">
                  <p className="text-xs font-bold tracking-wide text-slate-400">Bio lengkap</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{member.long_bio}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Metadata</p>
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

