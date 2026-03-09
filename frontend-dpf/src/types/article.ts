export type ArticleStatus = "draft" | "review" | "published" | string;

export type Article = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  status: ArticleStatus;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ArticlePaginationPayload = {
  data: Article[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

export type EditorArticle = {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  program_id?: number | null;
  category: string;
  category_en?: string | null;
  excerpt: string;
  excerpt_en?: string | null;
  body: string;
  body_en?: string | null;
  status: string;
  author_name?: string | null;
  thumbnail_path?: string | null;
  published_at?: string | null;
};

export type ArticleFormState = {
  title: string;
  title_en: string;
  slug: string;
  category: string;
  category_en: string;
  author_name: string;
  program_id: string;
  thumbnail_path: string;
  excerpt: string;
  excerpt_en: string;
  body: string;
  body_en: string;
  status: "draft" | "review" | "published";
  published_at: string;
};

export const emptyArticleForm: ArticleFormState = {
  title: "",
  title_en: "",
  slug: "",
  category: "",
  category_en: "",
  author_name: "",
  program_id: "",
  thumbnail_path: "",
  excerpt: "",
  excerpt_en: "",
  body: "",
  body_en: "",
  status: "draft",
  published_at: "",
};
