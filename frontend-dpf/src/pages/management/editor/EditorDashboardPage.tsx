import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { getAuthUser } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";

// Dashboard Components
import type { EditorDashboardPayload } from "../../../components/management/editor/dashboard/EditorDashboardTypes";
import EditorDashboardHeader from "../../../components/management/editor/dashboard/EditorDashboardHeader";
import EditorDashboardStats from "../../../components/management/editor/dashboard/EditorDashboardStats";
import EditorDashboardActivities from "../../../components/management/editor/dashboard/EditorDashboardActivities";

/* --- Helpers --- */

export function EditorDashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<EditorDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      <div className="grid gap-6">
        <EditorDashboardActivities loading={loading} activities={activities} />
      </div>
    </div>
  );
}
