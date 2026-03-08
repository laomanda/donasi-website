import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faFilePdf, faSpinner } from "@fortawesome/free-solid-svg-icons";


interface MitraPageHeaderProps {
  title: string;
  subtitle: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: IconDefinition;
    loading?: boolean;
    disabled?: boolean;
    variant?: "solid" | "blur";
  };
}

export function MitraPageHeader({ title, subtitle, actionButton }: MitraPageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-700 p-8 shadow-xl shadow-emerald-100 md:p-12">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl text-center lg:text-left">
          <h1 className="font-heading text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg font-medium text-emerald-50/90 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            disabled={actionButton.disabled || actionButton.loading}
            className={[
              "group flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50",
              actionButton.variant === "blur"
                ? "bg-white/10 text-white ring-1 ring-white/30 backdrop-blur-md hover:bg-white/20 hover:ring-white/50"
                : "bg-brandGreen-600 text-white shadow-sm hover:bg-brandGreen-700",
            ].join(" ")}
          >
            {actionButton.loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon
                icon={actionButton.icon || faFilePdf}
                className="transition-transform group-hover:scale-110"
              />
            )}
            <span>{actionButton.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
