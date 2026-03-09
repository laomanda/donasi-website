export type ActivityItem = {
  type: "article" | "program";
  id: number;
  title: string;
  status: string;
  action: "created" | "updated" | "published" | string;
  occurred_at: string;
};

export type TaskAttachment = {
  id: number;
  original_name?: string | null;
  url?: string | null;
};

export type EditorTaskItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  cancel_reason?: string | null;
  priority?: string | null;
  due_at?: string | null;
  created_at?: string | null;
  attachments?: TaskAttachment[] | null;
  creator?: { id?: number; name?: string | null; email?: string | null } | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
};

export type EditorDashboardPayload = {
  stats?: {
    articles?: { draft?: number; review?: number; published?: number; total?: number };
    programs?: { active?: number; inactive?: number; total?: number };
    programs_highlight?: number;
    partners_active?: number;
    organization_members?: number;
  };
  tasks?: { items?: EditorTaskItem[] };
  activities?: ActivityItem[];
};
