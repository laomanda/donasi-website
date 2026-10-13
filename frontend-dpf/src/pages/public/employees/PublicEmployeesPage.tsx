import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingLayout } from '@/layouts/LandingLayout';
import { PublicEmployeeCard } from '@/components/public/employees/PublicEmployeeCard';
import { PublicEmployeeSearchableSelect } from '@/components/public/employees/PublicEmployeeSearchableSelect';
import { usePublicEmployeeFilters } from '@/hooks/employees/usePublicEmployeeFilters';
import { usePublicEmployees } from '@/hooks/employees/usePublicEmployees';
import { useLang } from '@/lib/i18n';
import { translate } from '@/lib/i18n-utils';
import { publicEmployeeDict } from '@/components/public/employees/PublicEmployeeI18n';

export function PublicEmployeesPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(publicEmployeeDict, locale, key, fallback);

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [q, setQ] = useState(search);
  const position = params.get('position') ?? '';
  const division = params.get('division') ?? '';
  const page = Number(params.get('page') ?? 1) || 1;
  const { data: filters } = usePublicEmployeeFilters();
  const { data, loading, error } = usePublicEmployees({ q, position, division, page });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(search);
      const next = new URLSearchParams(window.location.search);
      if (search) next.set('q', search); else next.delete('q');
      next.delete('page');
      setParams(next);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, setParams]);

  useEffect(() => {
    document.title = t('employees.page.title', 'Direktori Karyawan | DPF');
    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots'); robots.setAttribute('content', 'noindex,nofollow');
    if (!robots.parentElement) document.head.appendChild(robots);
    return () => { if (robots.getAttribute('content') === 'noindex,nofollow') robots.remove(); };
  }, [locale]);

  const updateFilter = (key: 'position' | 'division', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const goPage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page');
    setParams(next);
  };

  const networkError = Boolean(error);

  return (
    <LandingLayout>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:pt-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brandGreen-700">
            {t('employees.header.badge', 'Profil publik')}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
            {t('employees.header.title', 'Direktori Karyawan')}
          </h1>
        </div>

        <section className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              {t('employees.filter.search.label', 'Cari nama karyawan')}
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('employees.filter.search.placeholder', 'Cari nama karyawan...')}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold outline-none focus:border-brandGreen-700 focus:ring-2 focus:ring-brandGreen-700/20"
            />
          </div>
          <PublicEmployeeSearchableSelect
            label={t('employees.filter.position.label', 'Jabatan')}
            value={position}
            options={filters.positions}
            placeholder={t('employees.filter.position.placeholder', 'Semua jabatan')}
            emptyText={t('employees.filter.empty', 'Tidak ada pilihan.')}
            onChange={(value) => updateFilter('position', value)}
          />
          <PublicEmployeeSearchableSelect
            label={t('employees.filter.division.label', 'Divisi')}
            value={division}
            options={filters.divisions}
            placeholder={t('employees.filter.division.placeholder', 'Semua divisi')}
            emptyText={t('employees.filter.empty', 'Tidak ada pilihan.')}
            onChange={(value) => updateFilter('division', value)}
          />
        </section>

        {loading && !data && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            {t('employees.state.loading', 'Memuat direktori...')}
          </div>
        )}

        {networkError && (
          <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
            <p className="font-bold text-red-700">
              {t('employees.state.error.title', 'Direktori belum dapat dimuat.')}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t('employees.state.error.desc', 'Periksa koneksi lalu coba lagi.')}
            </p>
          </div>
        )}

        {!loading && !networkError && data?.data.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="font-bold text-slate-900">
              {t('employees.state.empty.title', 'Karyawan tidak ditemukan.')}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t('employees.state.empty.desc', 'Coba ubah kata kunci atau filter.')}
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((employee) => (
                <PublicEmployeeCard key={employee.slug} employee={employee} />
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
              <span className="text-center sm:text-left text-xs sm:text-sm text-slate-600">
                {t('employees.pagination.showing', 'Menampilkan')} {data.meta.from ?? 0}–{data.meta.to ?? 0} {t('employees.pagination.of', 'dari')} {data.meta.total} {t('employees.pagination.employees', 'karyawan')}
              </span>
              <div className="flex items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {t('employees.pagination.prev', 'Sebelumnya')}
                </button>
                <button
                  type="button"
                  disabled={page >= data.meta.last_page}
                  onClick={() => goPage(page + 1)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl bg-brandGreen-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-brandGreen-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {t('employees.pagination.next', 'Berikutnya')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </LandingLayout>
  );
}

export default PublicEmployeesPage;

