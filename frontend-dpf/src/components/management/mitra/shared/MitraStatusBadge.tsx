interface MitraStatusBadgeProps {
  status: string;
  t: (key: string, fallback?: string) => string;
  variant?: "simple" | "solid";
}

export function MitraStatusBadge({ status, t, variant = "simple" }: MitraStatusBadgeProps) {
  const styles: Record<string, string> = 
    variant === "solid" 
      ? {
          paid: "text-emerald-50 bg-emerald-600 ring-emerald-600",
          pending: "text-amber-50 bg-amber-600 ring-amber-600",
          failed: "text-rose-50 bg-rose-600 ring-rose-600",
          expired: "text-slate-50 bg-slate-600 ring-slate-600",
        }
      : {
          paid: "bg-brandGreen-600 text-white ring-brandGreen-600",
          pending: "bg-amber-500 text-white ring-amber-500",
          failed: "bg-red-500 text-white ring-red-500",
        };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset transition-all",
        variant === "solid" ? "gap-2 px-3 py-1 font-black uppercase tracking-wider" : "",
        styles[status] || "bg-slate-100 text-slate-500 ring-slate-200",
      ].join(" ")}
    >
      {t(`status.${status}`, status)}
    </span>
  );
}
