import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { LandingLayout } from '@/layouts/LandingLayout';
import { usePublicEmployeeDetail } from '@/hooks/employees/usePublicEmployeeDetail';
import Error404 from '@/pages/errors/404';
import { useLang } from '@/lib/i18n';
import { translate } from '@/lib/i18n-utils';
import { publicEmployeeDict } from '@/components/public/employees/PublicEmployeeI18n';

export function PublicEmployeeDetailPage() {
  const { slug = '' } = useParams();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(publicEmployeeDict, locale, key, fallback);

  const { data, loading, notFound, error } = usePublicEmployeeDetail(slug);

  useEffect(() => {
    document.title = data
      ? `${data.name} | ${t('employees.detail.directory.title', 'Direktori Karyawan')}`
      : t('employees.detail.page.title', 'Profil Karyawan | DPF');
    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots'); robots.setAttribute('content', 'noindex,nofollow');
    if (!robots.parentElement) document.head.appendChild(robots);
    return () => { if (robots.getAttribute('content') === 'noindex,nofollow') robots.remove(); };
  }, [data, locale]);

  if (notFound) return <LandingLayout><Error404 /></LandingLayout>;
  if (loading) return <LandingLayout><div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">{t('employees.detail.loading', 'Memuat profil...')}</div></LandingLayout>;
  if (error || !data) return <LandingLayout><div className="mx-auto max-w-5xl px-4 py-16 text-center"><p className="font-bold text-red-700">{t('employees.detail.error.title', 'Profil belum dapat dimuat.')}</p><Link to="/karyawan" className="mt-4 inline-block font-bold text-brandGreen-700">{t('employees.detail.error.back', '← Direktori Karyawan')}</Link></div></LandingLayout>;

  const inactive = data.employment_status === 'inactive';
  const statusLabel = inactive
    ? t('employees.detail.status.inactive', 'Tidak Aktif')
    : t('employees.detail.status.active', 'Aktif');

  const gelarTrimmed = data.gelar?.trim();
  const displayName = gelarTrimmed ? `${data.name}, ${gelarTrimmed}` : data.name;

  return (
    <LandingLayout>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[410px_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex min-h-[360px] items-center justify-center rounded-xl bg-slate-100 p-3 sm:min-h-[520px]">
              <img
                src={data.id_card_image_url || ''}
                alt={`ID card ${displayName}`}
                className="max-h-[640px] w-full object-contain"
              />
            </div>
          </section>
          <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brandGreen-700">
                  {t('employees.detail.badge', 'Profil karyawan')}
                </p>
                <h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">{displayName}</h1>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs sm:text-sm font-bold text-white shrink-0 ${inactive ? 'bg-rose-600' : 'bg-brandGreen-600'}`}>
                {statusLabel}
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info label={t('employees.detail.field.code', 'ID Pegawai')} value={data.employee_code} />
              {gelarTrimmed && (
                <Info label={t('employees.detail.field.gelar', 'Gelar')} value={gelarTrimmed} />
              )}
              <Info label={t('employees.detail.field.position', 'Jabatan')} value={data.position} />
              <Info label={t('employees.detail.field.division', 'Divisi')} value={data.division} />
              <Info label={t('employees.detail.field.status', 'Status')} value={statusLabel} />
              <Info label={t('employees.detail.field.email', 'Email')} value={data.email} isEmail />
              <Info label={t('employees.detail.field.phone', 'No. Telepon')} value={data.phone} isPhone />
            </div>
          </section>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-black">{t('employees.detail.cta.title', 'Lihat Karyawan Lain')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('employees.detail.cta.desc', 'Kembali ke direktori untuk menjelajahi profil lainnya.')}</p>
          <Link to="/karyawan" className="mt-4 inline-flex rounded-xl bg-brandGreen-700 px-5 py-3 font-bold text-white">
            {t('employees.detail.cta.button', 'Buka Direktori')}
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
  const trimmed = value?.trim() || '';
  const hasValue = Boolean(trimmed && trimmed !== '-' && trimmed !== '—');

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      {isEmail && hasValue ? (
        <a
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(trimmed)}`}
          target="_blank"
          rel="noopener noreferrer"
          title={trimmed}
          className="mt-2 flex items-center gap-2 min-w-0 text-sm sm:text-base font-bold text-slate-900 hover:text-slate-700 hover:underline"
        >
          <FontAwesomeIcon icon={faEnvelope} className="text-xs text-slate-400 shrink-0" />
          <span className="truncate whitespace-nowrap">{trimmed}</span>
        </a>
      ) : isPhone && hasValue ? (
        <a
          href={`tel:${trimmed}`}
          title={trimmed}
          className="mt-2 flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-slate-900 hover:text-slate-700 hover:underline min-w-0"
        >
          <FontAwesomeIcon icon={faPhone} className="text-xs text-slate-400 shrink-0" />
          <span className="truncate whitespace-nowrap">{trimmed}</span>
        </a>
      ) : (
        <p className={`mt-2 break-words text-sm sm:text-base font-bold ${hasValue ? 'text-slate-900' : 'text-slate-400'}`}>
          {hasValue ? trimmed : '—'}
        </p>
      )}
    </div>
  );
}

export default PublicEmployeeDetailPage;
