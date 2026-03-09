import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface AdminSuggestionDetailHeroProps {
  loading: boolean;
  onBack: () => void;
}

export const AdminSuggestionDetailHero = ({
  loading,
  onBack,
}: AdminSuggestionDetailHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl transition-colors duration-500">
      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:hidden"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>
            </div>
            <div>
              <h1 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl md:text-5xl text-shadow-sm">
                {loading ? "Memuat..." : "Saran & Kritik"}
              </h1>
              <p className="mt-2 text-sm font-medium text-white/90 sm:text-lg max-w-2xl">
                Pantau detail saran, hubungi donatur, atau kelola saran yang masuk.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="hidden sm:inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSuggestionDetailHero;
