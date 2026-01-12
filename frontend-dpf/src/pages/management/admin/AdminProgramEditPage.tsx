import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { AdminProgramForm } from "./AdminProgramForm";

export function AdminProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const programId = useMemo(() => Number(id), [id]);

  return <AdminProgramForm mode="edit" programId={programId} />;
}

export default AdminProgramEditPage;


