import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AccountPageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  variant?: "brand" | "slate" | "primary" | "teal";
}

export const AccountPageHeader: React.FC<AccountPageHeaderProps> = ({
  title,
  description,
  badge,
  backHref = "/finance/accounts",
  backLabel = "Kembali ke Bagan Akun",
  breadcrumbs,
  actions,
  variant = "brand",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "teal":
        return "bg-gradient-to-r from-brandBlueTeal-600 via-brandBlueTeal-500 to-slate-900 text-white shadow-md";
      case "primary":
        return "bg-gradient-to-r from-primary-600 via-primary-500 to-brandWarmOrange-500 text-white shadow-md";
      case "slate":
        return "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-800";
      case "brand":
      default:
        // Signature DPF dual-brand color: Hijau Wakaf (brandGreen) to Oranye CTA (primary)
        return "bg-gradient-to-r from-brandGreen-700 via-brandGreen-600 to-primary-600 text-white shadow-lg";
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-7 space-y-4 ${getVariantClasses()}`}
    >
      {/* Decorative background light accents */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute right-1/4 -bottom-16 h-36 w-36 rounded-full bg-black/10 blur-xl" />

      {/* Navigation: Breadcrumbs or Back Link */}
      <div className="relative z-10 flex items-center gap-2 text-xs">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-white/80 flex-wrap"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-[10px] text-white/50"
                    />
                  )}
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className="font-medium text-white/80 hover:text-white transition hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={`font-bold ${
                        isLast
                          ? "text-white bg-black/20 px-2 py-0.5 rounded-md"
                          : "text-white/80"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        ) : (
          <Link
            to={backHref}
            className="inline-flex items-center gap-2 font-bold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl border border-white/20 transition backdrop-blur-xs active:scale-95 shadow-2xs"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>{backLabel}</span>
          </Link>
        )}
      </div>

      {/* Main Title & Action Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-xs">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPageHeader;
