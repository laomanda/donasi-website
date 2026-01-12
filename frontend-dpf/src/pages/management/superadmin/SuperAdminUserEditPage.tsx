import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { SuperAdminUserForm } from "./SuperAdminUserForm";

export function SuperAdminUserEditPage() {
  const params = useParams();
  const userId = useMemo(() => {
    const raw = String(params.id ?? "");
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }, [params.id]);

  return <SuperAdminUserForm mode="edit" userId={userId} />;
}

export default SuperAdminUserEditPage;


