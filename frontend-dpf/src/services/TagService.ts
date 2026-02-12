import http from "../lib/http";

export type Tag = {
  id: number;
  name: string;
  url: string | null;
  is_active: boolean;
  sort_order: number;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
};

export type TagPayload = {
  name: string;
  url?: string;
  is_active?: boolean;
  sort_order?: number;
  open_in_new_tab?: boolean;
};

const TagService = {
  getAll: async () => {
    const res = await http.get<Tag[]>("/editor/tags");
    return res.data;
  },

  getPublic: async () => {
    const res = await http.get<Tag[]>("/tags");
    return res.data;
  },

  create: async (payload: TagPayload) => {
    const res = await http.post<Tag>("/editor/tags", payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<TagPayload>) => {
    const res = await http.put<Tag>(`/editor/tags/${id}`, payload);
    return res.data;
  },

  delete: async (id: number) => {
    await http.delete(`/editor/tags/${id}`);
  },
};

export default TagService;
