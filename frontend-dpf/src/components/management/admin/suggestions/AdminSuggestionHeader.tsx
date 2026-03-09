import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

interface AdminSuggestionHeaderProps {
  total: number;
}

export const AdminSuggestionHeader = ({ total }: AdminSuggestionHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                <FontAwesomeIcon icon={faCommentDots} />
                Feedback
              </span>
              <h1 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl md:text-5xl text-shadow-sm">
                Saran Wakaf
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-emerald-100/90 sm:text-lg">
                Dengarkan suara donatur untuk pengembangan layanan DPF yang lebih baik.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-emerald-50 backdrop-blur-sm sm:text-sm">
              Total Masukan
              <span className="font-bold text-white">{new Intl.NumberFormat("id-ID").format(total)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuggestionHeader;
