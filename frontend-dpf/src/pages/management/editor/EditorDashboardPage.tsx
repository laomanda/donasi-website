import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { getAuthUser } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";

// Dashboard Components
import type { EditorDashboardPayload, EditorTaskItem } from "../../../components/management/editor/dashboard/EditorDashboardTypes";
import EditorDashboardHeader from "../../../components/management/editor/dashboard/EditorDashboardHeader";
import EditorDashboardStats from "../../../components/management/editor/dashboard/EditorDashboardStats";
import EditorDashboardTasks from "../../../components/management/editor/dashboard/EditorDashboardTasks";
import EditorDashboardActivities from "../../../components/management/editor/dashboard/EditorDashboardActivities";

/* --- Helpers --- */

const formatTaskStatus = (status?: string | null) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "done") return "Selesai";
  if (s === "in_progress") return "Dikerjakan";
  if (s === "open") return "Baru";
  if (s === "cancelled") return "Dibatalkan";
  return s || "-";
};

const taskStatusOrder: Record<string, number> = {
  open: 0,
  in_progress: 1,
  done: 2,
};

const isForwardStatus = (current?: string | null, next?: string | null) => {
  const currentKey = String(current ?? "").toLowerCase();
  const nextKey = String(next ?? "").toLowerCase();
  if (!(currentKey in taskStatusOrder) || !(nextKey in taskStatusOrder)) return true;
  return taskStatusOrder[nextKey] >= taskStatusOrder[currentKey];
};

export function EditorDashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<EditorDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskItems, setTaskItems] = useState<EditorTaskItem[]>([]);
  const [taskUpdatingIds, setTaskUpdatingIds] = useState<number[]>([]);
  const storedUser = useMemo(() => getAuthUser(), []);
  const displayName = storedUser?.name || "Editor";

  const stats = useMemo(() => {
    const articles = data?.stats?.articles ?? {};
    const programs = data?.stats?.programs ?? {};
    return {
      articlesDraft: Number(articles.draft ?? 0),
      articlesReview: Number(articles.review ?? 0),
      articlesPublished: Number(articles.published ?? 0),
      articlesTotal: Number(articles.total ?? 0),
      programsActive: Number(programs.active ?? 0),
      programsInactive: Number(programs.inactive ?? 0),
      programsTotal: Number(programs.total ?? 0),
      programsHighlight: Number(data?.stats?.programs_highlight ?? 0),
      partnersActive: Number(data?.stats?.partners_active ?? 0),
      organizationMembers: Number(data?.stats?.organization_members ?? 0),
    };
  }, [data]);

  const activities = data?.activities ?? [];

  useEffect(() => {
    let active = true;
    setLoading(true);
    http.get<EditorDashboardPayload>("/editor/dashboard")
      .then((res) => { if (active) { setData(res.data); setError(null); } })
      .catch(() => { if (active) setError("Gagal memuat data dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!data) return;
    setTaskItems(data.tasks?.items ?? []);
  }, [data]);

  const onUpdateTaskStatus = async (taskId: number, nextStatus: string) => {
    const current = taskItems.find((item) => item.id === taskId);
    if (!current || current.status === nextStatus) return;
    if (String(current.status ?? "").toLowerCase() === "cancelled") return;
    if (!isForwardStatus(current.status, nextStatus)) {
      toast.error("Status tidak bisa kembali ke tahap sebelumnya.", { title: "Status tugas" });
      return;
    }

    setTaskItems((items) =>
      items.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item))
    );
    setTaskUpdatingIds((ids) => Array.from(new Set([...ids, taskId])));

    try {
      await http.patch(`/editor/tasks/${taskId}`, { status: nextStatus });
      toast.success(`Berhasil memperbarui status menjadi: ${formatTaskStatus(nextStatus)}`, { title: "Update tugas" });
      
      // Refresh dashboard data to sync stats and task list
      http.get<EditorDashboardPayload>("/editor/dashboard")
        .then((res) => {
          setData(res.data);
          setTaskItems(res.data.tasks?.items ?? []);
        });
    } catch {
      setTaskItems((items) =>
        items.map((item) => (item.id === taskId ? { ...item, status: current.status } : item))
      );
      toast.error("Gagal memperbarui status tugas.", { title: "Update tugas" });
    } finally {
      setTaskUpdatingIds((ids) => ids.filter((id) => id !== taskId));
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <EditorDashboardHeader displayName={displayName} />

      {/* ALERTS */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-700 bg-rose-600 p-4 text-sm font-semibold text-white shadow-lg animate-in fade-in zoom-in-95">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      )}

      <EditorDashboardStats loading={loading} stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EditorDashboardTasks 
          loading={loading} 
          taskItems={taskItems} 
          taskUpdatingIds={taskUpdatingIds} 
          onUpdateTaskStatus={onUpdateTaskStatus} 
        />

        <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
          <EditorDashboardActivities loading={loading} activities={activities} />
        </div>
      </div>
    </div>
  );
}
