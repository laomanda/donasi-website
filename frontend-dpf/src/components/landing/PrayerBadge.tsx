import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import http from "../../lib/http";
import { useLang } from "../../lib/i18n";

type Timings = {
  Subuh: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
};
type PrayerKey = keyof Timings;

type PrayerResponse = {
  city: string;
  country: string;
  method: number;
  timezone: string;
  date: string;
  timings: Timings;
};

const ORDER: PrayerKey[] = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
const STORAGE_KEY = "prayer-times-cache";

let memoryCache: PrayerResponse | null = null;
let inFlight: Promise<PrayerResponse> | null = null;

const COPY: Record<"id" | "en", {
  now: string;
  nextPrayer: string;
  prayerNames: Record<keyof Timings, string>;
}> = {
  id: {
    now: "Sekarang",
    nextPrayer: "Sholat berikutnya",
    prayerNames: {
      Subuh: "Subuh",
      Dzuhur: "Dzuhur",
      Ashar: "Ashar",
      Maghrib: "Maghrib",
      Isya: "Isya",
    },
  },
  en: {
    now: "Now",
    nextPrayer: "Next prayer",
    prayerNames: {
      Subuh: "Fajr",
      Dzuhur: "Dhuhr",
      Ashar: "Asr",
      Maghrib: "Maghrib",
      Isya: "Isha",
    },
  },
};

const toDateInTz = (time: string, tz: string) => {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  const nowTz = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  nowTz.setHours(h || 0, m || 0, 0, 0);
  return nowTz;
};

const getNextPrayer = (timings: Timings, tz: string, now: Date): { label: PrayerKey; target: Date } => {
  const nowTz = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  for (const label of ORDER) {
    const target = toDateInTz(timings[label], tz);
    if (target > nowTz) return { label, target };
  }
  const tomorrowSubuh = toDateInTz(timings.Subuh, tz);
  tomorrowSubuh.setDate(tomorrowSubuh.getDate() + 1);
  return { label: "Subuh", target: tomorrowSubuh };
};

const formatShortCountdown = (deltaMs: number) => {
  const totalSec = Math.max(0, Math.floor(deltaMs / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours >= 1) return `${hours}j ${minutes}m`;
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

export function PrayerBadge({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { locale } = useLang();
  const [data, setData] = useState<PrayerResponse | null>(() => {
    if (memoryCache && memoryCache.date === new Date().toISOString().slice(0, 10)) {
      return memoryCache;
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PrayerResponse;
      if (parsed?.date === new Date().toISOString().slice(0, 10)) {
        memoryCache = parsed;
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchOnce = () => {
      if (memoryCache && memoryCache.date === new Date().toISOString().slice(0, 10)) {
        setData(memoryCache);
        setError(null);
        return;
      }
      if (!inFlight) {
        inFlight = http
          .get<PrayerResponse>("/prayer-times", { params: { city: "Jakarta", country: "ID", method: 20 } })
          .then((res) => {
            memoryCache = res.data;
            try {
              sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
            } catch {
              /* ignore */
            }
            return res.data;
          })
          .finally(() => {
            setTimeout(() => {
              inFlight = null;
            }, 0);
          });
      }

      inFlight
        .then((payload) => {
          if (!mounted) return;
          setData(payload);
          setError(null);
        })
        .catch(() => mounted && setError("failed"));
    };

    fetchOnce();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const computed = useMemo<{
    label: PrayerKey;
    delta: number;
    nextTimeStr: string;
    tz: string;
  } | null>(() => {
    if (!data) return null;
    const tz = data.timezone || "Asia/Jakarta";
    const { label, target } = getNextPrayer(data.timings, tz, now);
    const delta = target.getTime() - new Date(now.toLocaleString("en-US", { timeZone: tz })).getTime();
    const nextTimeStr = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    }).format(target);
    return { label, delta, nextTimeStr, tz };
  }, [data, now, locale]);

  const nowLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now) + " WIB",
    [now, locale]
  );

  if (!data || !computed || error) return null;

  const t = COPY[locale] ?? COPY.id;
  const countdown = formatShortCountdown(computed.delta);
  const labelText = t.prayerNames[computed.label] ?? computed.label;
  const badgeLabel = `${nowLabel} | ${countdown} | ${labelText}`;
  const isDark = variant === "dark";
  const buttonClass = isDark
    ? "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.8)] transition hover:bg-white/20"
    : "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 shadow-[0_10px_25px_-18px_rgba(16,185,129,0.65)] transition hover:from-white hover:to-emerald-50";
  const iconWrapClass = isDark
    ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 shadow-sm"
    : "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-emerald-100 shadow-sm";
  const iconClass = isDark ? "text-white" : "text-emerald-600";
  const labelClass = isDark ? "text-white/90" : "text-slate-800";
  const dropdownClass = isDark
    ? "border border-white/10 bg-slate-900/35 text-white ring-1 ring-white/15 backdrop-blur"
    : "border border-slate-100 bg-white/95 text-slate-700 ring-1 ring-slate-100 backdrop-blur";
  const dropdownLabelClass = isDark ? "text-white/70" : "text-slate-500";
  const dropdownValueClass = isDark ? "text-white" : "text-slate-900";
  const dropdownHeadingClass = isDark ? "text-white" : "text-slate-900";
  const dropdownCountdownClass = isDark ? "text-emerald-200" : "text-emerald-700";
  const dropdownDividerClass = isDark ? "border-white/10" : "border-slate-100";
  const dropdownRowLabelClass = isDark ? "text-white/80" : "text-slate-600";
  const dropdownRowValueClass = isDark ? "text-white" : "text-slate-900";

  return (
    <div className="relative z-[120]" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClass}
        aria-label="Lihat jadwal sholat"
      >
        <span className={iconWrapClass}>
          <FontAwesomeIcon icon={faClock} className={iconClass} />
        </span>
        <span className={`truncate ${labelClass}`}>{badgeLabel}</span>
      </button>

      {open && (
        <div className={`absolute right-0 mt-3 w-72 max-w-xs rounded-2xl p-4 text-xs shadow-xl z-[200] space-y-3 ${dropdownClass}`}>
          <div className={`flex items-center justify-between gap-4 text-[11px] font-semibold ${dropdownLabelClass}`}>
            <span className={dropdownLabelClass}>{t.now}</span>
            <span className={dropdownValueClass}>{nowLabel}</span>
          </div>
          <div className={`flex items-center justify-between gap-4 text-[11px] font-semibold ${dropdownLabelClass}`}>
            <span className={dropdownLabelClass}>{t.nextPrayer}</span>
            <span className={dropdownValueClass}>{computed.nextTimeStr}</span>
          </div>

          <div className="space-y-1">
            <p className={`text-sm font-bold ${dropdownHeadingClass}`}>{labelText}</p>
            <p className={`text-xs font-semibold ${dropdownCountdownClass}`}>{countdown}</p>
          </div>

          <div className={`border-t pt-3 space-y-1.5 ${dropdownDividerClass}`}>
            {ORDER.map((lbl) => (
              <div key={lbl} className={`flex items-center justify-between ${dropdownRowLabelClass}`}>
                <span>{t.prayerNames[lbl] ?? lbl}</span>
                <span className={`font-semibold ${dropdownRowValueClass}`}>{data.timings[lbl]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
