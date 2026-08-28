import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import type { BankAccount } from "../EditorBankTypes";
import { getStatusTone } from "../EditorBankTypes";

interface EditorBanksTableProps {
  items: BankAccount[];
  loading: boolean;
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  onEdit: (id: number) => void;
}

export function EditorBanksTable({
  items,
  loading,
  isSelected,
  onToggle,
  onToggleAll,
  allSelected,
  onEdit,
}: EditorBanksTableProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left table-fixed">
          <thead className="border-b border-slate-200 bg-slate-100">
            <tr>
              <th className="w-[5%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Pilih semua rekening"
                  className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500 accent-brandGreen-600"
                />
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Urutan
              </th>
              <th className="w-[28%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Bank
              </th>
              <th className="w-[22%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Nomor Rekening
              </th>
              <th className="w-[15%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Kategori
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Status
              </th>
              <th className="w-[8%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5">
                    <div className="h-4 w-4 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-14 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-32 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-36 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-24 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada rekening yang cocok.
                </td>
              </tr>
            ) : (
              items.map((acc) => {
                const barColor = acc.is_visible_public ? "border-l-brandGreen-500" : "border-l-slate-300";

                return (
                  <tr
                    key={acc.id}
                    className={`transition hover:bg-slate-50 border-l-4 ${barColor}`}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected(acc.id)}
                        onChange={() => onToggle(acc.id)}
                        aria-label={`Pilih rekening ${acc.bank_name}`}
                        className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500 accent-brandGreen-600"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        #{acc.order ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => onEdit(acc.id)}
                        className="group block w-full text-left"
                      >
                        <p className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-brandGreen-700 transition-colors">
                          {acc.bank_name}
                        </p>
                      </button>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-900 font-mono">
                      {acc.account_number}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-start gap-1.5">
                        <span
                          className={`whitespace-nowrap inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            acc.type === "international"
                              ? "bg-blue-600 text-white ring-1 ring-blue-600/20"
                              : "bg-brandGreen-500 text-white ring-1 ring-brandGreen-600/20"
                          }`}
                        >
                          {acc.type === "international" ? "Luar Negeri" : "Dalam Negeri"}
                        </span>
                        {acc.category && (
                          <span className="text-xs font-semibold bg-primary-600 text-white px-2 py-1 rounded-lg ring-1 ring-primary-600/20">
                            {acc.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(
                          Boolean(acc.is_visible_public)
                        )}`}
                      >
                        {acc.is_visible_public ? "Tampil" : "Disembunyikan"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onEdit(acc.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                          title="Ubah Rekening"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-5 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada rekening yang cocok.
          </div>
        ) : (
          items.map((acc) => {
            const barColor = acc.is_visible_public ? "border-l-brandGreen-500" : "border-l-slate-300";

            return (
              <div
                key={acc.id}
                className={`w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
              >
                <div className="flex items-start gap-3">
                  <span onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected(acc.id)}
                      onChange={() => onToggle(acc.id)}
                      aria-label={`Pilih rekening ${acc.bank_name}`}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-slate-900">{acc.bank_name}</p>
                    <p className="mt-1 text-sm text-slate-600 font-mono">{acc.account_number}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`whitespace-nowrap inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          acc.type === "international"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                            : "bg-brandGreen-50 text-brandGreen-700 ring-1 ring-brandGreen-600/20"
                        }`}
                      >
                        {acc.type === "international" ? "Luar Negeri" : "Dalam Negeri"}
                      </span>
                      {acc.category && (
                        <span className="text-xs font-semibold text-slate-600 line-clamp-1">{acc.category}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 pl-7">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      #{acc.order ?? 0}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(
                        Boolean(acc.is_visible_public)
                      )}`}
                    >
                      {acc.is_visible_public ? "Tampil" : "Disembunyikan"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEdit(acc.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                    title="Ubah Rekening"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
