import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type BadgeTone = "neutral" | "primary" | "green" | "warning";

const badgeToneTokens = (tone: BadgeTone) => {
  if (tone === "primary") {
    return {
      wrap: "bg-primary-50 text-primary-800 ring-primary-100",
      icon: "text-primary-700",
      dot: "bg-primary-300",
      label: "text-primary-700/80",
    };
  }

  if (tone === "green") {
    return {
      wrap: "bg-brandGreen-50 text-brandGreen-800 ring-brandGreen-100",
      icon: "text-brandGreen-700",
      dot: "bg-brandGreen-300",
      label: "text-brandGreen-700/80",
    };
  }

  if (tone === "warning") {
    return {
      wrap: "bg-amber-50 text-amber-800 ring-amber-100",
      icon: "text-amber-700",
      dot: "bg-amber-300",
      label: "text-amber-700/80",
    };
  }

  return {
    wrap: "bg-slate-50 text-slate-800 ring-slate-200",
    icon: "text-slate-600",
    dot: "bg-slate-300",
    label: "text-slate-500",
  };
};

export function InfoBadge({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: IconDefinition;
  label: string;
  value: string;
  tone?: BadgeTone;
}) {
  const tokens = badgeToneTokens(tone);

  return (
    <span
      className={[
        "inline-flex min-w-0 max-w-full items-center gap-2 rounded-full px-3 py-1.5 font-heading text-xs font-semibold ring-1",
        tokens.wrap,
      ].join(" ")}
      title={`${label}: ${value}`}
    >
      <FontAwesomeIcon icon={icon} className={["text-[11px]", tokens.icon].join(" ")} />
      <span className={["text-[11px] font-semibold", tokens.label].join(" ")}>
        {label}
      </span>
      <span className={["h-1.5 w-1.5 rounded-full", tokens.dot].join(" ")} aria-hidden="true" />
      <span className="min-w-0 truncate font-bold">{value}</span>
    </span>
  );
}

export function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {children}
      </div>
    </section>
  );
}

export function ErrorState({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {title}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
      {label}
    </div>
  );
}
