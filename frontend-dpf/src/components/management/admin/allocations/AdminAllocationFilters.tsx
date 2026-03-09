import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type AdminAllocationFiltersProps = {
  q: string;
  setQ: (val: string) => void;
};

export default function AdminAllocationFilters({ q, setQ }: AdminAllocationFiltersProps) {
  return (
    <div className="relative group max-w-2xl">
      <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 transition-colors group-focus-within:text-emerald-500">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari Mitra atau Program..."
        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5"
      />
    </div>
  );
}
