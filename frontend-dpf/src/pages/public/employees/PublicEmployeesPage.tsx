import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingLayout } from '@/layouts/LandingLayout';
import { PublicEmployeeCard } from '@/components/public/employees/PublicEmployeeCard';
import { PublicEmployeeSearchableSelect } from '@/components/public/employees/PublicEmployeeSearchableSelect';
import { usePublicEmployeeFilters } from '@/hooks/employees/usePublicEmployeeFilters';
import { usePublicEmployees } from '@/hooks/employees/usePublicEmployees';

export function PublicEmployeesPage() {
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
    document.title = 'Direktori Karyawan | DPF';
    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots'); robots.setAttribute('content', 'noindex,nofollow');
    if (!robots.parentElement) document.head.appendChild(robots);
    return () => { if (robots.getAttribute('content') === 'noindex,nofollow') robots.remove(); };
  }, []);
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
  return <LandingLayout><div className="mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6 lg:px-8">
    <div className="mb-6"><p className="text-sm font-bold uppercase tracking-[0.2em] text-brandGreen-700">Profil publik</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Direktori Karyawan</h1></div>
    <section className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.4fr_1fr_1fr]">
      <div><label className="mb-2 block text-sm font-bold text-slate-700">Cari nama karyawan</label><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama karyawan..." className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold outline-none focus:border-brandGreen-700 focus:ring-2 focus:ring-brandGreen-700/20" /></div>
      <PublicEmployeeSearchableSelect label="Jabatan" value={position} options={filters.positions} placeholder="Semua jabatan" onChange={(value) => updateFilter('position', value)} />
      <PublicEmployeeSearchableSelect label="Divisi" value={division} options={filters.divisions} placeholder="Semua divisi" onChange={(value) => updateFilter('division', value)} />
    </section>
    {loading && !data && <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Memuat direktori...</div>}
    {networkError && <div className="rounded-2xl border border-red-200 bg-white p-12 text-center"><p className="font-bold text-red-700">Direktori belum dapat dimuat.</p><p className="mt-2 text-sm text-slate-500">Periksa koneksi lalu coba lagi.</p></div>}
    {!loading && !networkError && data?.data.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><p className="font-bold text-slate-900">Karyawan tidak ditemukan.</p><p className="mt-2 text-sm text-slate-500">Coba ubah kata kunci atau filter.</p></div>}
    {data && data.data.length > 0 && <><div className="grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.data.map((employee) => <PublicEmployeeCard key={employee.slug} employee={employee} />)}</div><div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm"><span className="text-slate-600">Menampilkan {data.meta.from ?? 0}–{data.meta.to ?? 0} dari {data.meta.total} karyawan</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => goPage(page - 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-40">Sebelumnya</button><button disabled={page >= data.meta.last_page} onClick={() => goPage(page + 1)} className="rounded-lg bg-brandGreen-700 px-3 py-2 font-bold text-white disabled:opacity-40">Berikutnya</button></div></div></>}
  </div></LandingLayout>;
}

export default PublicEmployeesPage;

