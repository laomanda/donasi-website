import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { imagePlaceholder } from "@/lib/placeholder";
import type { Tone } from "@/types/search";
import { toneStyles } from "@/lib/search-utils";

type SearchResultRowProps = {
  title: string;
  subtitle?: string | null;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  imageUrl?: string | null;
  icon?: IconProp;
  tone?: Tone;
  onClick: () => void;
};

export function SearchResultRow({
  title,
  subtitle,
  metaLeft,
  metaRight,
  imageUrl,
  icon,
  tone = "slate",
  onClick,
}: SearchResultRowProps) {
  const toneClass = toneStyles[tone] ?? toneStyles.slate;
  const showIcon = Boolean(icon);

  return (
    <button type="button" onClick={onClick} className="group w-full text-left">
      <div
        className={[
          "flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:bg-slate-50",
          "border-l-4",
          toneClass.border,
        ].join(" ")}
      >
        <div
          className={[
            "h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-1",
            showIcon ? "flex items-center justify-center border" : "bg-slate-100",
            showIcon ? toneClass.icon : toneClass.ring,
          ].join(" ")}
        >
          {showIcon ? (
            <FontAwesomeIcon icon={icon as IconProp} className="text-sm" />
          ) : (
            <img
              src={imageUrl ?? imagePlaceholder}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-bold text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{subtitle}</p> : null}
          {(metaLeft || metaRight) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
              <div className="flex flex-wrap items-center gap-2">{metaLeft}</div>
              {metaRight ? <div className="shrink-0">{metaRight}</div> : null}
            </div>
          )}
        </div>

        <span
          className={[
            "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition",
            "group-hover:opacity-90",
            toneClass.icon,
          ].join(" ")}
        >
          <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
        </span>
      </div>
    </button>
  );
}

export default SearchResultRow;
