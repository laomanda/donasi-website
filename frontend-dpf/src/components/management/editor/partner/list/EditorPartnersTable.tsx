import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import type { Partner } from "../EditorPartnerTypes";
import { resolveStorageUrl } from "../EditorPartnerTypes";

type BulkSelectionType = {
  selectedIds: number[];
  isSelected: (id: number) => boolean;
  toggle: (id: number) => void;
  toggleAll: (ids: number[]) => void;
  clear: () => void;
  setSelected: (set: Set<number>) => void;
  keepOnly: (ids: number[]) => void;
  count: number;
};

type Props = {
  partners: Partner[];
  loading: boolean;
  selection: BulkSelectionType;
  pageIds: number[];
  onEdit: (id: number) => void;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const normalizeUrlLabel = (url?: string | null) => {
  const value = String(url ?? "").trim();
  if (!value) return null;
  return value.replace(/^https?:\/\//, "");
};

const getStatusTone = (isActive: boolean) =>
  isActive
    ? "bg-emerald-600 text-white ring-emerald-700/70"
    : "bg-red-600 text-white ring-red-700/70";

export default function EditorPartnersTable({
  partners,
  loading,
  selection,
  pageIds,
  onEdit,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-100">
            <tr>
              <th className="w-10 px-6 py-4">
                <input
                  type="checkbox"
                  aria-label="Pilih semua mitra di halaman ini"
                  checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                  onChange={() => selection.toggleAll(pageIds)}
                  className="h-4 w-4 accent-brandGreen-600"
                />
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Urutan</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Mitra</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Website</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-6 w-14 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 rounded bg-slate-100" />
                        <div className="h-3 w-56 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" /></td>
                </tr>
              ))
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada mitra yang cocok.
                </td>
              </tr>
            ) : (
              partners.map((partner) => {
                const logo = resolveStorageUrl(partner.logo_path) ?? imagePlaceholder;
                const urlLabel = normalizeUrlLabel(partner.url);
                const updated = partner.updated_at ?? partner.created_at;
                return (
                  <tr key={partner.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selection.isSelected(partner.id)}
                        onChange={() => selection.toggle(partner.id)}
                        aria-label={`Pilih mitra ${partner.name}`}
                        className="h-4 w-4 accent-brandGreen-600"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        #{partner.order ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                          <img
                            src={logo}
                            alt={partner.name}
                            className="h-full w-full object-contain p-2"
                            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-bold text-slate-900">{partner.name}</p>
                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                            {partner.description ? partner.description : "Tanpa deskripsi."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {urlLabel ? (
                        <a
                          href={partner.url ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                        >
                          <FontAwesomeIcon icon={faGlobe} className="text-slate-500" />
                          <span className="max-w-[16rem] truncate">{urlLabel}</span>
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(partner.is_active))}`}>
                        {partner.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDate(updated)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onEdit(partner.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                          aria-label="Ubah"
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
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-6 w-24 rounded-full bg-slate-100" />
                <div className="h-10 w-10 rounded-2xl bg-slate-100" />
              </div>
            </div>
          ))
        ) : partners.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada mitra yang cocok.
          </div>
        ) : (
          partners.map((partner) => {
            const logo = resolveStorageUrl(partner.logo_path) ?? imagePlaceholder;
            const updated = partner.updated_at ?? partner.created_at;
            return (
              <div key={partner.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selection.isSelected(partner.id)}
                      onChange={() => selection.toggle(partner.id)}
                      aria-label={`Pilih mitra ${partner.name}`}
                      className="mt-1 h-4 w-4 accent-brandGreen-600"
                    />
                  </span>
                  <button type="button" onClick={() => onEdit(partner.id)} className="block w-full text-left">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                        <img
                          src={logo}
                          alt={partner.name}
                          className="h-full w-full object-contain p-2"
                          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-slate-900">{partner.name}</p>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                          {partner.description ? partner.description : "Tanpa deskripsi."}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      #{partner.order ?? 0}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(partner.is_active))}`}>
                      {partner.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEdit(partner.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                    aria-label="Ubah"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-500">Diperbarui: {formatDate(updated)}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
