import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

interface LiterasiEmptyProps {
  onReset: () => void;
  t: (key: string, fallback?: string) => string;
}

export function LiterasiEmpty({ onReset, t }: LiterasiEmptyProps) {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
        <FontAwesomeIcon icon={faNewspaper} className="text-3xl" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{t("literasi.empty.title")}</h3>
      <p className="mt-2 text-slate-500 text-sm">{t("literasi.empty.desc")}</p>
      <button
        onClick={onReset}
        className="mt-6 text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4"
      >
        {t("literasi.empty.reset")}
      </button>
    </div>
  );
}
