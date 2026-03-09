export type Tag = {
  id: number;
  name: string;
  url: string | null;
  is_active: boolean;
  sort_order: number;
  open_in_new_tab: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TagFormState = {
  name: string;
  url: string;
  is_active: boolean;
  sort_order: string;
  open_in_new_tab: boolean;
};

export const emptyTagForm: TagFormState = {
  name: "",
  url: "",
  is_active: true,
  sort_order: "0",
  open_in_new_tab: true,
};

export const getNextAvailableOrder = (tags: Tag[], excludeId?: number) => {
  const used = new Set<number>();
  tags.forEach((t) => {
    if (excludeId && t.id === excludeId) return;
    const n = Number(t.sort_order);
    if (!Number.isFinite(n)) return;
    used.add(Math.max(0, Math.floor(n)));
  });

  let candidate = 0;
  while (used.has(candidate)) candidate += 1;
  return candidate;
};
