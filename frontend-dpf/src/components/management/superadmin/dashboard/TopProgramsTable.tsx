import type { TopProgram } from "../../../../types/dashboard";
import { formatCount, normalizeNumber, getProgramStatusLabel, badgeTone } from "../shared/SuperAdminUtils";

interface TopProgramsTableProps {
  topPrograms: TopProgram[];
  loading: boolean;
}

export function TopProgramsTable({ topPrograms, loading }: TopProgramsTableProps) {
  return (
    <div className="flex h-full flex-col rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="font-heading text-xl font-bold text-slate-900">Detail Program Teratas</h2>
        <p className="text-sm font-medium text-slate-500">Analisis status dan performa donasi per program.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Program</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Total Donasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="ml-auto h-4 w-24 rounded bg-slate-100" /></td>
                </tr>
              ))
            ) : topPrograms.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm font-semibold text-slate-500">
                  Tidak ada data program.
                </td>
              </tr>
            ) : (
              topPrograms.map((p) => {
                const status = getProgramStatusLabel(p.status);
                return (
                  <tr key={p.id} className="group transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="line-clamp-1 font-bold text-slate-900 group-hover:text-emerald-700 transition">{p.title}</p>
                      <span className="text-xs font-semibold text-slate-400">ID: {p.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeTone(status.tone)}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 tabular-nums">
                      {formatCount(normalizeNumber(p.donations_paid))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
