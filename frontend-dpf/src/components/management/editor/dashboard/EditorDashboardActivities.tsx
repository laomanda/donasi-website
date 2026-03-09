import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faHeart } from "@fortawesome/free-solid-svg-icons";
import type { ActivityItem } from "./EditorDashboardTypes";
import { Panel, EmptyState } from "./EditorDashboardUI";

type Props = {
  loading: boolean;
  activities: ActivityItem[];
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

function ActivityTimelineRow({ item }: { item: ActivityItem }) {
  const icon = item.type === "program" ? faHeart : faBookOpen;
  const actionRaw = String(item.action ?? "").toLowerCase();
  const actionLabel =
    actionRaw === "created" ? "Dibuat" : actionRaw === "updated" ? "Diperbarui" : actionRaw === "published" ? "Diterbitkan" : "Diperbarui";
  const isCreated = actionRaw === "created";
  const typeLabel = item.type === "program" ? "Program" : "Artikel";

  return (
    <div className="group relative flex gap-4 rounded-r-xl pl-6 pb-2 transition-all hover:bg-slate-200/40">
      {/* Timeline Dot */}
      <div
        className={[
          "absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-slate-300 transition-colors",
          isCreated ? "bg-emerald-600" : "bg-slate-900 group-hover:bg-slate-800",
        ].join(" ")}
      />

      <div className="min-w-0 flex-1 py-1">
        <p className="text-sm font-medium text-slate-700">
          <span className="font-bold text-slate-900">{actionLabel}</span>: "{item.title}"
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <FontAwesomeIcon icon={icon} className="text-slate-400" />
          <span>{typeLabel}</span>
          <span aria-hidden="true" className="opacity-30">•</span>
          <span>{formatDateTime(item.occurred_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default function EditorDashboardActivities({ loading, activities }: Props) {
  return (
    <Panel title="Aktivitas Terbaru" subtitle="Rekam jejak perubahan konten">
      <div className="relative ml-3 space-y-6 border-l-2 border-slate-200 pb-2">
        {loading ? (
          <div className="pl-6 pt-1">
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
          </div>
        ) : activities.length === 0 ? (
          <div className="pl-6">
            <EmptyState label="Belum ada aktivitas tercatat." />
          </div>
        ) : (
          activities.slice(0, 5).map((act, i) => <ActivityTimelineRow key={i} item={act} />)
        )}
      </div>
    </Panel>
  );
}
