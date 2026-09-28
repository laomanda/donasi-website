import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import type { ImportModule } from "@/types/finance";
import { MODULE_CONFIGS, type ModuleConfig } from "./importTypes";

interface ImportModuleSelectorProps {
  selectedModule: ImportModule;
  onSelectModule: (moduleId: ImportModule) => void;
  disabled?: boolean;
}

export function ImportModuleSelector({
  selectedModule,
  onSelectModule,
  disabled = false,
}: ImportModuleSelectorProps) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-3">
      {MODULE_CONFIGS.map((mod: ModuleConfig) => {
        const isSelected = selectedModule === mod.id;
        return (
          <button
            key={mod.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectModule(mod.id)}
            className={`group relative flex flex-col items-start rounded-2xl border p-4.5 text-left transition-all ${
              isSelected
                ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex w-full items-center justify-between gap-2 mb-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                <FontAwesomeIcon icon={mod.icon} className="text-sm" />
              </div>
              {isSelected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-[9px]" /> Aktif
                </span>
              )}
            </div>
            <p className="font-heading text-sm font-bold text-slate-900">{mod.shortName}</p>
            <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {mod.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default ImportModuleSelector;
