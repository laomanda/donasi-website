import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export type ToneKey = "emerald" | "primary" | "amber" | "violet" | "sky" | "rose" | "slate";

export const TONE_STYLES: Record<
  ToneKey,
  {
    border: string;
    accent: string;
    iconBg: string;
    iconText: string;
    badge: string;
  }
> = {
  emerald: {
    border: "border-l-emerald-600",
    accent: "#059669",
    iconBg: "bg-emerald-600",
    iconText: "text-white",
    badge: "bg-emerald-600 text-white",
  },
  primary: {
    border: "border-l-primary-600",
    accent: "#f97316",
    iconBg: "bg-primary-600",
    iconText: "text-white",
    badge: "bg-primary-600 text-white",
  },
  amber: {
    border: "border-l-amber-500",
    accent: "#f59e0b",
    iconBg: "bg-amber-500",
    iconText: "text-white",
    badge: "bg-amber-500 text-white",
  },
  violet: {
    border: "border-l-violet-600",
    accent: "#7c3aed",
    iconBg: "bg-violet-600",
    iconText: "text-white",
    badge: "bg-violet-600 text-white",
  },
  sky: {
    border: "border-l-sky-600",
    accent: "#0284c7",
    iconBg: "bg-sky-600",
    iconText: "text-white",
    badge: "bg-sky-600 text-white",
  },
  rose: {
    border: "border-l-rose-600",
    accent: "#e11d48",
    iconBg: "bg-rose-600",
    iconText: "text-white",
    badge: "bg-rose-600 text-white",
  },
  slate: {
    border: "border-l-slate-700",
    accent: "#334155",
    iconBg: "bg-slate-700",
    iconText: "text-white",
    badge: "bg-slate-700 text-white",
  },
};

export function StatCard({
  title,
  value,
  icon,
  tone,
  loading,
  helper,
}: {
  title: string;
  value: React.ReactNode;
  icon: any;
  tone: ToneKey;
  loading: boolean;
  helper?: string;
}) {
  const styles = TONE_STYLES[tone];
  
  // Dynamic font size calculation to ensure "ratusan juta" fits neatly
  const getFontSize = (text: string) => {
    if (text.length > 20) return "text-lg"; 
    if (text.length > 13) return "text-xl"; 
    return "text-2xl"; 
  };

  const fontSize = loading ? "text-2xl" : (typeof value === "string" ? getFontSize(value) : "text-2xl");

  return (
    <div
      className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Thick Rounded Accent Bar */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-2 ${styles.iconBg} rounded-l-[32px]`}
      />
      
      {/* Background Dotted Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

      <div className="relative z-10 flex items-center justify-between gap-4">

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <p className={`mt-2 font-bold tracking-tight text-slate-900 ${fontSize} ${loading ? "text-slate-300" : ""}`}>
            {value}
          </p>
          {helper ? <p className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
        </div>
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} shadow-inner ring-1 ring-white/20`}>
          <FontAwesomeIcon icon={icon} className={`text-2xl ${styles.iconText}`} />
        </div>
      </div>
    </div>

  );
}
