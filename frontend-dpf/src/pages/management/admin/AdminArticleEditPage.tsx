import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { AdminArticleForm } from "./AdminArticleForm";

export function AdminArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const articleId = useMemo(() => Number(id), [id]);

  return <AdminArticleForm mode="edit" articleId={articleId} />;
}

export default AdminArticleEditPage;


