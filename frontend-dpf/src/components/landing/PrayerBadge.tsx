import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../../lib/i18n";

interface PrayerBadgeProps {
  variant?: "light" | "dark";
  className?: string;
  iconClass?: string;
}

export function PrayerBadge({
  variant = "light",
  className = "",
  iconClass,
}: PrayerBadgeProps) {
  const { locale } = useLang();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(now);

  const formattedTime = `${formattedDate} • ${hours}:${minutes}:${seconds}${locale === "en" ? "" : " WIB"}`;

  const isDark = variant === "dark";
  const defaultContainerClass = isDark
    ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm"
    : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm";

  const resolvedIconClass = iconClass ?? (isDark ? "text-white/80" : "text-brandGreen-600");

  return (
    <div className={className ? `inline-flex items-center gap-2 ${className}` : defaultContainerClass}>
      <FontAwesomeIcon icon={faClock} className={resolvedIconClass} />
      <span className="tracking-wide font-sans font-semibold tabular-nums">
        {formattedTime}
      </span>
    </div>
  );
}



