import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faCircleInfo, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { formatWhatsAppLink } from "@/utils/management/adminSuggestionUtils";

interface Suggestion {
  id: number;
  name: string;
  phone: string;
  category: string;
  status: "baru" | "dibalas";
}

interface AdminSuggestionActionSidebarProps {
  item: Suggestion;
  isChangingStatus: boolean;
  onStatusChange: (status: "baru" | "dibalas") => void;
  confirmDelete: boolean;
  onConfirmDelete: (val: boolean) => void;
  deleting: boolean;
  onDelete: () => void;
}

export const AdminSuggestionActionSidebar = ({
  item,
  isChangingStatus,
  onStatusChange,
  confirmDelete,
  onConfirmDelete,
  deleting,
  onDelete,
}: AdminSuggestionActionSidebarProps) => {
  return (
    <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit lg:self-start lg:z-10">
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <FontAwesomeIcon icon={faReply} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tindak Lanjut</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hubungi Donatur</h2>
            <p className="mt-2 text-sm text-slate-600">Sampaikan tanggapan atau terima kasih atas masukannya.</p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href={formatWhatsAppLink(item.phone, item.name, item.category)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#25D366]/20 transition hover:bg-[#128C7E] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#25D366]/20"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
            Balas via WhatsApp
          </a>
        </div>
        
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-start gap-2">
            <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-500" />
            WhatsApp akan otomatis membuka chat dengan template pesan yang telah disiapkan.
          </span>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Pengaturan Status</h3>
          <p className="mt-1 text-sm font-semibold text-slate-800">Ubah status penyelesaian saran</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            disabled={isChangingStatus}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
            value={item.status}
            onChange={(e) => onStatusChange(e.target.value as "baru" | "dibalas")}
          >
            <option value="baru">Baru</option>
            <option value="dibalas">Dibalas</option>
          </select>
          {isChangingStatus && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent" />
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <FontAwesomeIcon icon={faTrash} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Area Berbahaya</h3>
          </div>
        </div>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => onConfirmDelete(true)}
            className="w-full rounded-xl border-2 border-rose-100 bg-white py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-200"
          >
            Hapus Saran Ini
          </button>
        ) : (
          <div className="space-y-3 mt-4">
            <p className="text-xs font-semibold text-rose-600 text-center">Yakin ingin menghapus data permanen?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onConfirmDelete(false)}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSuggestionActionSidebar;
