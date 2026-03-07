import React from "react";

interface AuthFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function AuthField({
  label,
  required,
  children,
  error,
  className = "",
}: AuthFieldProps) {
  return (
    <label className={`block space-y-1.5 text-sm font-semibold text-slate-700 ${className}`}>
      <span className="inline-flex items-center gap-1">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
      {error && (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}
