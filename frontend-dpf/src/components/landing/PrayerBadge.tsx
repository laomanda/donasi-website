import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../../lib/i18n";

export function PrayerBadge({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { locale } = useLang();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const formattedTime = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const isDark = variant === "dark";
  
  // Style configurations
  const containerClass = isDark
    ? "inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 shadow-sm backdrop-blur-sm"
    : "inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-sm backdrop-blur-sm";

  const iconClass = isDark ? "text-white/80" : "text-brandGreen-600";

  return (
    <div className={containerClass}>
      <FontAwesomeIcon icon={faClock} className={iconClass} />
      <span className="tracking-wide font-sans font-semibold tabular-nums">
        {formattedTime}
      </span>
    </div>
  );
}
