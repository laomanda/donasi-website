import { Link } from 'react-router-dom';
import type { PublicEmployee } from '@/types/publicEmployee';
import { imagePlaceholder } from '@/lib/placeholder';

export function PublicEmployeeCard({ employee }: { employee: PublicEmployee }) {
  return <Link to={`/karyawan/${employee.slug}`} className="group block w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-brandGreen-700 focus:outline-none focus:ring-2 focus:ring-brandGreen-700">
    <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 p-4"><img src={employee.id_card_image_url || imagePlaceholder} alt={`ID card ${employee.name}`} width="400" height="300" className="h-full w-full object-contain" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = imagePlaceholder; }} /></div>
    <div className="p-5"><h2 className="truncate text-lg font-extrabold text-slate-900" title={employee.name}>{employee.name}</h2><p className="mt-1 truncate text-sm font-semibold text-brandGreen-700" title={employee.position}>{employee.position}</p></div>
  </Link>;
}

