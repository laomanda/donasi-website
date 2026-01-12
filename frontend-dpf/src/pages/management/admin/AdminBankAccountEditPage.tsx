import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { AdminBankAccountForm } from "./AdminBankAccountForm";

export function AdminBankAccountEditPage() {
  const { id } = useParams<{ id: string }>();
  const accountId = useMemo(() => Number(id), [id]);
  return <AdminBankAccountForm mode="edit" accountId={accountId} />;
}

export default AdminBankAccountEditPage;

