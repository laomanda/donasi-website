import { useMemo, useState } from 'react';

type Props = { label: string; value: string; options: string[]; placeholder: string; onChange: (value: string) => void };

export function PublicEmployeeSearchableSelect({ label, value, options, placeholder, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => options.filter((option) => option.toLowerCase().includes(query.toLowerCase())), [options, query]);
  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      <input value={open ? query : value} onFocus={() => { setOpen(true); setQuery(''); }} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder={value || placeholder} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-brandGreen-700 focus:ring-2 focus:ring-brandGreen-700/20" aria-expanded={open} />
      {open && <>
        <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Tutup pilihan" onClick={() => setOpen(false)} />
        <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100" onClick={() => { onChange(''); setOpen(false); setQuery(''); }}>{placeholder}</button>
          {filtered.map((option) => <button key={option} type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-brandGreen-700 hover:text-white" onClick={() => { onChange(option); setOpen(false); setQuery(''); }}>{option}</button>)}
          {!filtered.length && <p className="px-3 py-2 text-sm text-slate-500">Tidak ada pilihan.</p>}
        </div>
      </>}
    </div>
  );
}

