export interface FinanceTableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function FinanceTableSkeleton({
  rows = 5,
  cols = 6,
  className = "",
}: FinanceTableSkeletonProps) {
  return (
    <tbody className={`divide-y divide-slate-100 ${className}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => {
            // Vary widths for realistic skeleton look
            const widths = ["w-24", "w-36", "w-28", "w-20", "w-16", "w-32"];
            const selectedWidth = widths[(rIdx + cIdx) % widths.length];

            return (
              <td key={cIdx} className="px-5 py-4">
                <div className={`h-4 ${selectedWidth} rounded bg-slate-100`} />
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}

export default FinanceTableSkeleton;
