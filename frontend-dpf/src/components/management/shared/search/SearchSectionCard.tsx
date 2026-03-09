import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { toneStyles, sectionBadgeTone } from "@/lib/search-utils";
import type { Tone } from "@/types/search";

type SearchSectionCardProps = {
  category: string;
  title: string;
  description: string;
  count: number;
  icon: IconProp;
  tone: Tone;
  children: React.ReactNode;
};

export function SearchSectionCard({
  category,
  title,
  description,
  count,
  icon,
  tone,
  children,
}: SearchSectionCardProps) {
  const toneClass = toneStyles[tone] ?? toneStyles.slate;
  return (
    <div className={["rounded-[28px] border border-slate-200 border-l-4 bg-white p-6 shadow-sm", toneClass.border].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{category}</p>
          <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
            <span className={["flex h-9 w-9 items-center justify-center rounded-2xl border", toneClass.icon].join(" ")}>
              <FontAwesomeIcon icon={icon} className="text-sm" />
            </span>
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <span className={["inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1", sectionBadgeTone(tone)].join(" ")}>
          {count} hasil
        </span>
      </div>

      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}

export default SearchSectionCard;
