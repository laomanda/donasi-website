import { Link } from "react-router-dom";

interface LoginFooterProps {
  mitraInterestLabel: string;
  registerMitraLabel: string;
}

export function LoginFooter({
  mitraInterestLabel,
  registerMitraLabel,
}: LoginFooterProps) {
  return (
    <div className="mt-8 border-t border-slate-100 pt-6 text-center">
      <p className="text-sm font-medium text-slate-500">
        {mitraInterestLabel}{" "}
        <Link
          to="/register-mitra"
          className="font-bold text-brandGreen-600 hover:text-brandGreen-700"
        >
          {registerMitraLabel}
        </Link>
      </p>
    </div>
  );
}
