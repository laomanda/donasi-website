import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faUser, faPhone, faCalendarAlt, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { formatDateTime, getCategoryLabel, getCategoryToneAlt } from "@/utils/management/adminSuggestionUtils";

interface Suggestion {
  id: number;
  name: string;
  phone: string;
  category: string;
  message: string;
  status: "baru" | "dibalas";
  is_anonymous: boolean;
  created_at: string;
}

interface AdminSuggestionInfoCardProps {
  item: Suggestion;
}

export const AdminSuggestionInfoCard = ({ item }: AdminSuggestionInfoCardProps) => {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900">Informasi Donatur</h2>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.status === 'baru' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'}`}>
              {item.status === 'baru' ? 'Baru' : 'Dibalas'}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600">Data kontak dan detail saran yang diberikan.</p>
        </div>
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold leading-none shadow-sm border uppercase tracking-wider self-start",
            getCategoryToneAlt(item.category),
          ].join(" ")}
        >
          <FontAwesomeIcon icon={faTag} className="text-[10px]" />
          {getCategoryLabel(item.category)}
        </span>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faUser} className="text-emerald-500" />
            Nama
          </p>
          <div className="mt-2 flex items-center gap-2">
            <dd className="text-sm font-bold text-slate-900 truncate">{item.name}</dd>
            {!!item.is_anonymous && (
              <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Anonim</span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faPhone} className="text-emerald-500" />
            No. Telepon
          </p>
          <dd className="mt-2 text-sm font-bold text-slate-900">{item.phone}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-500" />
            Dikirim Pada
          </p>
          <dd className="mt-2 text-sm font-bold text-slate-900">{formatDateTime(item.created_at, true)}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 ring-1 ring-slate-100">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
          <FontAwesomeIcon icon={faCommentDots} className="text-emerald-500" />
          Isi Saran / Kritik
        </p>
        <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap italic">
          "{item.message}"
        </div>
      </div>
    </div>
  );
};

export default AdminSuggestionInfoCard;
