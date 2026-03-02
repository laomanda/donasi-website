import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EditorBankForm } from "./EditorBankForm";

export function EditorBankEditPage() {
  const { id } = useParams<{ id: string }>();
  const accountId = useMemo(() => Number(id), [id]);
  return <EditorBankForm mode="edit" accountId={accountId} />;
}

export default EditorBankEditPage;

