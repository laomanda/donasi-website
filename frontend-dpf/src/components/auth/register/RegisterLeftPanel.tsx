import { Link } from "react-router-dom";
import { dpfIcon } from "@/assets/brand";

interface RegisterLeftPanelProps {
  title: string;
  description: string;
  alreadyHaveAccountLabel: string;
  loginLabel: string;
}

export function RegisterLeftPanel({
  title,
  description,
  alreadyHaveAccountLabel,
  loginLabel,
}: RegisterLeftPanelProps) {
  // Logic to split title for styling as in original
  const titleParts = title.split(" ");
  const mainTitle = titleParts.slice(0, -1).join(" ");
  const highlightWord = titleParts.slice(-1);

  return (
    <div className="relative w-full bg-primary-700 p-8 text-white md:w-[320px] lg:w-[380px]">
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full object-cover">
              <img src={dpfIcon} alt="DPF" className="h-7 w-7 object-contain rounded-lg" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-sm font-bold tracking-tight text-white">DPF WAKAF</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                Amanah | Profesional
              </p>
            </div>
          </Link>

          <div className="mt-12 space-y-4">
            <h1 className="font-heading text-3xl font-bold leading-tight lg:text-4xl text-white">
              {mainTitle} <br />
              <span className="text-white">{highlightWord}</span>
            </h1>
            <p className="text-sm leading-relaxed text-white">
              {description}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <p className="text-xs font-medium text-white/60">
            {alreadyHaveAccountLabel}?{" "}
            <Link to="/login" className="font-bold text-white hover:text-slate-200 transition">
              {loginLabel}
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative background elements for left panel */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brandGreen-500/10 blur-[80px]" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-brandGreen-600/10 blur-[80px]" />
    </div>
  );
}
