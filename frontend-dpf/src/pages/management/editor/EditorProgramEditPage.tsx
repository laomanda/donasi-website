import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EditorProgramForm } from "./EditorProgramForm";

export function EditorProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const programId = useMemo(() => Number(id), [id]);

  return <EditorProgramForm mode="edit" programId={programId} />;
}

export default EditorProgramEditPage;


