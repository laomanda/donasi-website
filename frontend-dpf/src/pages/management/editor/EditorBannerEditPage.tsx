import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EditorBannerForm } from "./EditorBannerForm";

export function EditorBannerEditPage() {
  const { id } = useParams<{ id: string }>();
  const bannerId = useMemo(() => Number(id), [id]);

  return <EditorBannerForm mode="edit" bannerId={bannerId} />;
}

export default EditorBannerEditPage;
