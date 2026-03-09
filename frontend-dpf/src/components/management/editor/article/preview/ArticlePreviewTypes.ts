export type PreviewArticle = {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  excerpt?: string | null;
  body?: string | null;
  status?: string | null;
  author_name?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null; // datetime-local from editor
};

export type PreviewPayload = {
  type: "article";
  created_at?: string | null;
  return_to?: string | null;
  article: PreviewArticle;
};
