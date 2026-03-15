import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import type { QuickAction } from "../dashboard/DashboardUtils";
import { faCheck, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { TONE_STYLES } from "../StatCard";
import type { ToneKey } from "../StatCard";

type QuickActionCardProps = {
  action: QuickAction;
  tone?: ToneKey;
};

export default function QuickActionCard({ action, tone = "slate" }: QuickActionCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Link
      to={action.href}
      className={`group flex items-center gap-4 rounded-[24px] border border-slate-100 ${styles.bgSoft} p-4 sm:p-5 transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-500/5 active:scale-[0.98]`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} ${styles.iconText} transition-transform group-hover:scale-110`}>
        <FontAwesomeIcon icon={faCheck} className="text-sm" />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5 text-left">
        <h3 className={`truncate font-heading text-[15px] font-bold ${styles.textBold}`}>
          {action.label}
        </h3>
        <p className={`truncate text-[10px] font-black uppercase tracking-widest text-slate-500/70`}>
          {action.description}
        </p>
      </div>

      {/* Solid CTA Button */}
      <div className={`shrink-0 flex items-center gap-2.5 rounded-full ${styles.iconBg} px-5 py-2.5 text-[11px] font-black uppercase tracking-widest ${styles.iconText} shadow-sm transition-all group-hover:translate-x-1 group-hover:shadow-md active:scale-95`}>
        <span>Buka</span>
        <FontAwesomeIcon icon={faArrowRight} className="text-[12px] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
