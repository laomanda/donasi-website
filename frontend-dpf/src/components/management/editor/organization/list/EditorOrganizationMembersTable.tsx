import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import type { OrganizationMember } from "../EditorOrganizationMemberTypes";
import { resolveStorageUrl, formatDate, getStatusTone, groupTone } from "../EditorOrganizationMemberTypes";

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
  items: OrganizationMember[];
  loading: boolean;
  selection: BulkSelectionType;
  pageIds: number[];
  onEdit: (id: number) => void;
};

export default function EditorOrganizationMembersTable({
  items,
  loading,
  selection,
  pageIds,
  onEdit,
}: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-200 bg-white shadow-sm overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full table-fixed text-left">
          <thead className="border-b border-slate-200 bg-slate-100">
            <tr>
              <th className="w-16 px-6 py-4 text-center">
                <input
                  type="checkbox"
                  checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                  onChange={() => selection.toggleAll(pageIds)}
                  aria-label="Pilih semua anggota di halaman"
                  className="h-4 w-4 accent-brandGreen-600"
                />
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Anggota</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Grup</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5 text-center">
                    <div className="h-4 w-4 mx-auto rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-4 w-52 rounded bg-slate-100" />
                        <div className="h-3 w-72 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><div className="h-6 w-28 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada anggota struktur. Klik "Tambah Anggota" untuk mulai.
                </td>
              </tr>
            ) : (
              items.map((member) => {
                const photo = resolveStorageUrl(member.photo_path) ?? imagePlaceholder;
                const updated = member.updated_at ?? member.created_at;
                return (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selection.isSelected(member.id)}
                        onChange={() => selection.toggle(member.id)}
                        aria-label={`Pilih anggota ${member.name}`}
                        className="h-4 w-4 accent-brandGreen-600"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                          <img
                            src={photo}
                            alt={member.name}
                            className="h-full w-full object-cover"
                            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-bold text-slate-900">{member.name}</p>
                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{member.position_title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${groupTone}`}>
                        {member.group}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(member.is_active))}`}>
                          {member.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDate(updated)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(member.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
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
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada anggota struktur. Klik "Tambah Anggota" untuk mulai.
          </div>
        ) : (
          items.map((member) => {
            const photo = resolveStorageUrl(member.photo_path) ?? imagePlaceholder;
            const updated = member.updated_at ?? member.created_at;
            return (
              <div key={member.id} className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selection.isSelected(member.id)}
                      onChange={() => selection.toggle(member.id)}
                      aria-label={`Pilih anggota ${member.name}`}
                      className="h-4 w-4 accent-brandGreen-600"
                    />
                  </span>
                  <span className="text-xs font-bold text-slate-500">Pilih</span>
                </div>
                <div className="block w-full text-left">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                      <img
                        src={photo}
                        alt={member.name}
                        className="h-full w-full object-cover"
                        onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-slate-900">{member.name}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-600">{member.position_title}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${groupTone}`}>
                      {member.group}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(Boolean(member.is_active))}`}>
                      {member.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(member.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                      aria-label="Ubah"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                  </div>
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
