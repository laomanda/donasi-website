import { formatRupiah } from "@/utils/financeUtils";

export interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  tone?: "debit" | "credit" | "neutral" | "auto";
  prefix?: string;
  showZeroAsDash?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  tone = "neutral",
  prefix,
  showZeroAsDash = false,
  className = "",
}: CurrencyDisplayProps) {
  const num = typeof amount === "string" ? Number(amount) : (amount ?? 0);

  if (showZeroAsDash && (num === 0 || !Number.isFinite(num))) {
    return <span className={`text-slate-300 ${className}`}>-</span>;
  }

  let colorClass = "text-slate-900";
  if (tone === "debit") {
    colorClass = "text-brandGreen-700";
  } else if (tone === "credit") {
    colorClass = "text-rose-600";
  } else if (tone === "auto") {
    if (num > 0) colorClass = "text-brandGreen-700";
    else if (num < 0) colorClass = "text-rose-600";
    else colorClass = "text-slate-500";
  }

  const formatted = formatRupiah(num);
  const displayValue = prefix ? `${prefix} ${formatted}` : formatted;

  return (
    <span className={`font-heading font-bold tabular-nums ${colorClass} ${className}`}>
      {displayValue}
    </span>
  );
}

export default CurrencyDisplay;
