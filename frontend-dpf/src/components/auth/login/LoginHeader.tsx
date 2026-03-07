import { Link } from "react-router-dom";
import { dpfIcon } from "@/assets/brand";

export function LoginHeader() {
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <img src={dpfIcon} alt="DPF" className="h-7 w-7 object-contain" />
          </span>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-slate-900">DPF WAKAF</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Amanah | Profesional
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}
