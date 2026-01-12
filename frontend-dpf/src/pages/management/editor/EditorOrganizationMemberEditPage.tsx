import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EditorOrganizationMemberForm } from "./EditorOrganizationMemberForm";

export function EditorOrganizationMemberEditPage() {
  const { id } = useParams<{ id: string }>();
  const memberId = useMemo(() => Number(id), [id]);

  return <EditorOrganizationMemberForm mode="edit" memberId={memberId} />;
}

export default EditorOrganizationMemberEditPage;


