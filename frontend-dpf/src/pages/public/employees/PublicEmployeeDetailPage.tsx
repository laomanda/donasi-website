import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { LandingLayout } from '@/layouts/LandingLayout';
import { usePublicEmployeeDetail } from '@/hooks/employees/usePublicEmployeeDetail';
import Error404 from '@/pages/errors/404';

export function PublicEmployeeDetailPage() {
  const { slug = '' } = useParams();
  const { data, loading, notFound, error } = usePublicEmployeeDetail(slug);
  useEffect(() => {
    document.title = data ? `${data.name} | Direktori Karyawan` : 'Profil Karyawan | DPF';
    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots'); robots.setAttribute('content', 'noindex,nofollow');
    if (!robots.parentElement) document.head.appendChild(robots);
    return () => { if (robots.getAttribute('content') === 'noindex,nofollow') robots.remove(); };
  }, [data]);
  if (notFound) return <LandingLayout><Error404 /></LandingLayout>;
  if (loading) return <LandingLayout><div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">Memuat profil...</div></LandingLayout>;
  if (error || !data) return <LandingLayout><div className="mx-auto max-w-5xl px-4 py-16 text-center"><p className="font-bold text-red-700">Profil belum dapat dimuat.</p><Link to="/karyawan" className="mt-4 inline-block font-bold text-brandGreen-700">← Direktori Karyawan</Link></div></LandingLayout>;
  const inactive = data.employment_status === 'inactive';
  return (
    <LandingLayout>
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex min-h-[360px] items-center justify-center rounded-xl bg-slate-100 p-3 sm:min-h-[560px]">
              <img
                src={data.id_card_image_url || ''}
                alt={`ID card ${data.name}`}
                className="max-h-[700px] w-full object-contain"
              />
            </div>
          </section>
          <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brandGreen-700">Profil karyawan</p>
                <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">{data.name}</h1>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${inactive ? 'bg-slate-700' : 'bg-emerald-600'}`}>
                {inactive ? 'Tidak Aktif' : 'Aktif'}
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info label="ID Pegawai" value={data.employee_code} />
              <Info label="Jabatan" value={data.position} />
              <Info label="Divisi" value={data.division} />
              <Info label="Status" value={data.employment_status_label || (inactive ? 'Tidak Aktif' : 'Aktif')} />
              <Info label="Email" value={data.email} isEmail />
              <Info label="No. Telepon" value={data.phone} isPhone />
            </div>
          </section>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-black">Lihat Karyawan Lain</h2>
          <p className="mt-2 text-sm text-slate-600">Kembali ke direktori untuk menjelajahi profil lainnya.</p>
          <Link to="/karyawan" className="mt-4 inline-flex rounded-xl bg-brandGreen-700 px-5 py-3 font-bold text-white">
            Buka Direktori
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
}

function Info({
  label,
  value,
  isEmail,
  isPhone,
}: {
  label: string;
  value?: string | null;
  isEmail?: boolean;
  isPhone?: boolean;
}) {
  const trimmed = value?.trim();
  const hasValue = Boolean(trimmed && trimmed !== '-' && trimmed !== '—');

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      {isEmail && hasValue ? (
        <a
          href={`mailto:${trimmed}`}
          className="mt-2 flex items-center gap-2 break-all text-base font-bold text-brandGreen-700 hover:text-brandGreen-800 hover:underline"
        >
          <FontAwesomeIcon icon={faEnvelope} className="text-xs text-slate-400 shrink-0" />
          <span>{trimmed}</span>
        </a>
      ) : isPhone && hasValue ? (
        <a
          href={`tel:${trimmed}`}
          className="mt-2 flex items-center gap-2 font-mono text-base font-bold text-brandGreen-700 hover:text-brandGreen-800 hover:underline"
        >
          <FontAwesomeIcon icon={faPhone} className="text-xs text-slate-400 shrink-0" />
          <span>{trimmed}</span>
        </a>
      ) : (
        <p className={`mt-2 break-words text-base font-bold ${hasValue ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasValue ? trimmed : '—'}
        </p>
      )}
    </div>
  );
}

export default PublicEmployeeDetailPage;
