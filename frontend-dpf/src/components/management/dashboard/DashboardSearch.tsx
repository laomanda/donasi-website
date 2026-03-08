import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface DashboardSearchProps {
  query: string;
  setQuery: (q: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
}

export function DashboardSearch({ query, setQuery, onSubmit, placeholder }: DashboardSearchProps) {
  return (
    <form onSubmit={onSubmit} className="min-w-0 flex-1 lg:max-w-md">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
        />
      </div>
    </form>
  );
}
