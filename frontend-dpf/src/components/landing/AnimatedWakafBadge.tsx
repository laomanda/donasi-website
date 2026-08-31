import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";

interface AnimatedWakafBadgeProps {
  stats?: {
    total_programs?: number;
    total_donations?: number;
    amount_collected?: string | number;
  } | null;
  locale?: "id" | "en";
}

export function AnimatedWakafBadge({ stats, locale = "id" }: AnimatedWakafBadgeProps) {
  const targetAmount = Math.max(0, Number(stats?.amount_collected ?? 0));
  const [currentValue, setCurrentValue] = useState<number>(0);
  const animationRef = useRef<number | null>(null);

  // Smooth easeOutExpo formula for natural counting
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const startCountAnimation = useCallback((fromVal = 0, toVal = targetAmount, duration = 1800) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (toVal <= 0) {
      setCurrentValue(0);
      return;
    }

    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const nextVal = Math.round(fromVal + (toVal - fromVal) * easedProgress);
      setCurrentValue(nextVal);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        setCurrentValue(toVal);
      }
    };

    animationRef.current = requestAnimationFrame(frame);
  }, [targetAmount]);

  useEffect(() => {
    startCountAnimation(0, targetAmount, 1800);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetAmount, startCountAnimation]);

  const formatLiveCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
      maximumFractionDigits: 0,
    }).format(val);
    return `Rp ${formatted}`;
  };

  return (
    <div className="flex items-center gap-3.5 rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-50 text-brandGreen-600 shadow-inner ring-1 ring-emerald-100 shrink-0">
        <FontAwesomeIcon icon={faCoins} className="text-lg sm:text-xl text-brandGreen-600" />
      </div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            {locale === "en" ? "Total Wakaf Collected" : "Total Wakaf Terhimpun"}
          </p>
        </div>
        <p className="text-sm sm:text-lg font-heading font-extrabold text-slate-900 tabular-nums">
          {formatLiveCurrency(currentValue)}
        </p>
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
          {locale === "en" ? "From all active programs" : "Dari seluruh program wakaf"}
        </p>
      </div>
    </div>
  );
}
