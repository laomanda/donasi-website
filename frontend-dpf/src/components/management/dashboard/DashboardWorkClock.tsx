import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { formatTimeHHMM, getJakartaTimeParts } from "./DashboardUtils";

interface WorkClockProps {
  now: Date;
  showStatus: boolean;
  locale: string;
  className?: string;
}

export function DashboardWorkClock({ now, showStatus, locale, className }: WorkClockProps) {
  const { hour, minute } = getJakartaTimeParts(now);
  const minutesTotal = hour * 60 + minute;

  const isWorkHours = minutesTotal >= 9 * 60 && minutesTotal < 18 * 60 + 5;
  const tone = isWorkHours ? "bg-slate-900 text-brandGreen-400 ring-slate-800" : "bg-slate-900 text-rose-400 ring-slate-800";
  const message = isWorkHours ? "Semangat Bekerja" : "Eitss Suda Lembur Yuk Balik";

  const dateStr = now.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl px-4 py-1.5 text-xs font-bold ring-1 shadow-sm transition",
        showStatus ? tone : "bg-brandGreen-600 text-white ring-brandGreen-600 shadow-brandGreen-900/20",
        className,
      ].join(" ")}
    >
      <FontAwesomeIcon icon={faClock} className={showStatus ? "" : "text-white/80"} />
      <div className="flex items-center gap-2.5 whitespace-nowrap">
        <span className="text-xs font-bold tabular-nums tracking-wide text-white">
          {formatTimeHHMM(hour)}:{formatTimeHHMM(minute)} WIB
        </span>
        <span className="h-3 w-px bg-white/20" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/90">{dateStr}</span>
      </div>
      {showStatus && (
        <>
          <span className="h-4 w-px bg-white/20" />
          <span className="min-w-0 max-w-[300px] truncate text-xs font-bold italic opacity-90">{message}</span>
        </>
      )}
    </div>
  );
}
