import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type { ImportModule } from "@/types/finance";
import { MODULE_CONFIGS } from "./importTypes";

interface ImportModuleSelectorProps {
  selectedModule: ImportModule;
  onSelectModule: (moduleId: ImportModule) => void;
  disabled?: boolean;
}

export function ImportModuleSelector({ selectedModule, onSelectModule, disabled = false }: ImportModuleSelectorProps) {
  const active = MODULE_CONFIGS.find((item) => item.id === selectedModule) ?? MODULE_CONFIGS[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Modul Impor</p>
          <p className="mt-0.5 text-xs text-slate-600">{active.description}</p>
        </div>
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MODULE_CONFIGS.map((module) => {
            const selected = module.id === selectedModule;
            return (
              <button
                key={module.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectModule(module.id)}
                aria-pressed={selected}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {selected && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                {module.shortName}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ImportModuleSelector;
