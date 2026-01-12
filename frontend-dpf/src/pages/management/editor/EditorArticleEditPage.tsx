import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EditorArticleForm } from "./EditorArticleForm";

export function EditorArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const articleId = useMemo(() => Number(id), [id]);

  return <EditorArticleForm mode="edit" articleId={articleId} />;
}

export default EditorArticleEditPage;


