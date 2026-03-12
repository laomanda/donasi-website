import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  rightElement?: React.ReactNode;
  fullHeight?: boolean;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  badge,
  title,
  subtitle,
  breadcrumb,
  rightElement,
  fullHeight = false,
  children,
}) => {
  return (
    <section id="hero" className={`relative overflow-hidden bg-slate-50 pb-16 pt-32 lg:pb-24 lg:pt-40 ${fullHeight ? "min-h-screen flex flex-col justify-center" : ""}`}>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            {breadcrumb && (
              <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Link to="/" className="transition hover:text-primary-600">
                  <FontAwesomeIcon icon={faHome} />
                </Link>
                {breadcrumb.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px] opacity-50" />
                    {item.href ? (
                      <Link to={item.href} className="transition hover:text-primary-600">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-primary-700">{item.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            <div className="space-y-4">
              {badge && (
                <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 shadow-sm ring-1 ring-primary-100 backdrop-blur-sm">
                  {badge}
                </span>
              )}
              <h1 className="font-heading text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              {subtitle && (
                <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                  {subtitle}
                </p>
              )}
              {children && <div className="pt-4">{children}</div>}
            </div>
          </div>

          {/* Right Content / Visual */}
          {rightElement && (
            <div className="relative">
              {rightElement}
            </div>
          )}
        </div>
      </div>

      {/* Subtle Bottom Wave or Divider if needed, but for now clean is better */}
    </section>
  );
};
