import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export type ToneKey = 
  | "emerald" | "primary" | "amber" | "violet" | "sky" | "rose" | "slate"
  | "blue" | "indigo" | "purple" | "fuchsia" | "pink" | "orange" 
  | "cyan" | "teal" | "lime" | "green";

export const TONE_STYLES: Record<
  ToneKey,
  {
    border: string;
    accent: string;
    iconBg: string;
    iconText: string;
    badge: string;
    bgSoft: string;
    textBold: string;
  }
> = {
  emerald: {
    border: "border-l-emerald-600",
    accent: "#059669",
    iconBg: "bg-emerald-600",
    iconText: "text-white",
    badge: "bg-emerald-600 text-white",
    bgSoft: "bg-emerald-50/80",
    textBold: "text-emerald-900",
  },
  primary: {
    border: "border-l-primary-600",
    accent: "#f97316",
    iconBg: "bg-primary-600",
    iconText: "text-white",
    badge: "bg-primary-600 text-white",
    bgSoft: "bg-primary-50/80",
    textBold: "text-primary-900",
  },
  amber: {
    border: "border-l-amber-500",
    accent: "#f59e0b",
    iconBg: "bg-amber-500",
    iconText: "text-white",
    badge: "bg-amber-500 text-white",
    bgSoft: "bg-amber-50/80",
    textBold: "text-amber-900",
  },
  violet: {
    border: "border-l-violet-600",
    accent: "#7c3aed",
    iconBg: "bg-violet-600",
    iconText: "text-white",
    badge: "bg-violet-600 text-white",
    bgSoft: "bg-violet-50/80",
    textBold: "text-violet-900",
  },
  sky: {
    border: "border-l-sky-600",
    accent: "#0284c7",
    iconBg: "bg-sky-600",
    iconText: "text-white",
    badge: "bg-sky-600 text-white",
    bgSoft: "bg-sky-50/80",
    textBold: "text-sky-900",
  },
  rose: {
    border: "border-l-rose-600",
    accent: "#e11d48",
    iconBg: "bg-rose-600",
    iconText: "text-white",
    badge: "bg-rose-600 text-white",
    bgSoft: "bg-rose-50/80",
    textBold: "text-rose-900",
  },
  slate: {
    border: "border-l-slate-700",
    accent: "#334155",
    iconBg: "bg-slate-700",
    iconText: "text-white",
    badge: "bg-slate-700 text-white",
    bgSoft: "bg-slate-50/80",
    textBold: "text-slate-900",
  },
  blue: {
    border: "border-l-blue-600",
    accent: "#2563eb",
    iconBg: "bg-blue-600",
    iconText: "text-white",
    badge: "bg-blue-600 text-white",
    bgSoft: "bg-blue-50/80",
    textBold: "text-blue-900",
  },
  indigo: {
    border: "border-l-indigo-600",
    accent: "#4f46e5",
    iconBg: "bg-indigo-600",
    iconText: "text-white",
    badge: "bg-indigo-600 text-white",
    bgSoft: "bg-indigo-50/80",
    textBold: "text-indigo-900",
  },
  purple: {
    border: "border-l-purple-600",
    accent: "#9333ea",
    iconBg: "bg-purple-600",
    iconText: "text-white",
    badge: "bg-purple-600 text-white",
    bgSoft: "bg-purple-50/80",
    textBold: "text-purple-900",
  },
  fuchsia: {
    border: "border-l-fuchsia-600",
    accent: "#c026d3",
    iconBg: "bg-fuchsia-600",
    iconText: "text-white",
    badge: "bg-fuchsia-600 text-white",
    bgSoft: "bg-fuchsia-50/80",
    textBold: "text-fuchsia-900",
  },
  pink: {
    border: "border-l-pink-600",
    accent: "#db2777",
    iconBg: "bg-pink-600",
    iconText: "text-white",
    badge: "bg-pink-600 text-white",
    bgSoft: "bg-pink-50/80",
    textBold: "text-pink-900",
  },
  orange: {
    border: "border-l-orange-600",
    accent: "#ea580c",
    iconBg: "bg-orange-600",
    iconText: "text-white",
    badge: "bg-orange-600 text-white",
    bgSoft: "bg-orange-50/80",
    textBold: "text-orange-900",
  },
  cyan: {
    border: "border-l-cyan-600",
    accent: "#0891b2",
    iconBg: "bg-cyan-600",
    iconText: "text-white",
    badge: "bg-cyan-600 text-white",
    bgSoft: "bg-cyan-50/80",
    textBold: "text-cyan-900",
  },
  teal: {
    border: "border-l-teal-600",
    accent: "#0d9488",
    iconBg: "bg-teal-600",
    iconText: "text-white",
    badge: "bg-teal-600 text-white",
    bgSoft: "bg-teal-50/80",
    textBold: "text-teal-900",
  },
  lime: {
    border: "border-l-lime-600",
    accent: "#65a30d",
    iconBg: "bg-lime-600",
    iconText: "text-white",
    badge: "bg-lime-600 text-white",
    bgSoft: "bg-lime-50/80",
    textBold: "text-lime-900",
  },
  green: {
    border: "border-l-green-600",
    accent: "#16a34a",
    iconBg: "bg-green-600",
    iconText: "text-white",
    badge: "bg-green-600 text-white",
    bgSoft: "bg-green-50/80",
    textBold: "text-green-900",
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
      className={`relative overflow-hidden rounded-[32px] border border-slate-200 ${styles.bgSoft} p-6 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
    >
      
      {/* Background Dotted Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

      <div className="relative z-10 flex items-center justify-between gap-4">

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <div className={`mt-2 font-bold tracking-tight ${styles.textBold} ${fontSize} ${loading ? "text-slate-300" : ""}`}>
            {value}
          </div>
          {helper ? <p className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
        </div>
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} shadow-inner ring-1 ring-white/20`}>
          <FontAwesomeIcon icon={icon} className={`text-2xl ${styles.iconText}`} />
        </div>
      </div>
    </div>
  );
}
