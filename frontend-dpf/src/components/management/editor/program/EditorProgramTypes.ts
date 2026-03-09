export type ProgramStatus = "draft" | "active" | "completed" | "archived" | string;

export type Program = {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: ProgramStatus;
  is_highlight?: boolean | null;
  target_amount?: number | string | null;
  collected_amount?: number | string | null;
  deadline_days?: number | string | null;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

export type EditorProgram = {
    id: number;
    title: string;
    title_en?: string | null;
    slug: string;
    category: string;
    category_en?: string | null;
    short_description: string;
    short_description_en?: string | null;
    description: string;
    description_en?: string | null;
    benefits?: string | null;
    benefits_en?: string | null;
    target_amount: number | string;
    collected_amount?: number | string | null;
    deadline_days?: number | string | null;
    published_at?: string | null;
    thumbnail_path?: string | null;
    banner_path?: string | null;
    program_images?: string[] | null;
    is_highlight?: boolean | null;
    status: string;
};

export type ProgramFormState = {
    title: string;
    title_en: string;
    slug: string;
    category: string;
    category_en: string;
    short_description: string;
    short_description_en: string;
    description: string;
    description_en: string;
    benefits: string;
    benefits_en: string;
    target_amount: string;
    deadline_days: string;
    published_at: string;
    thumbnail_path: string;
    banner_path: string;
    program_images: string[];
    is_highlight: boolean;
    status: "draft" | "active" | "completed";
};

export type FormMode = "create" | "edit";
