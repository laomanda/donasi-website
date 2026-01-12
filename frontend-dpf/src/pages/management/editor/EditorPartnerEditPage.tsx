import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EditorPartnerForm } from "./EditorPartnerForm";

export function EditorPartnerEditPage() {
  const { id } = useParams<{ id: string }>();
  const partnerId = useMemo(() => Number(id), [id]);

  return <EditorPartnerForm mode="edit" partnerId={partnerId} />;
}

export default EditorPartnerEditPage;


