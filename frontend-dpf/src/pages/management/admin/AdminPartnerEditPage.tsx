import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { AdminPartnerForm } from "./AdminPartnerForm";

export function AdminPartnerEditPage() {
  const { id } = useParams<{ id: string }>();
  const partnerId = useMemo(() => Number(id), [id]);

  return <AdminPartnerForm mode="edit" partnerId={partnerId} />;
}

export default AdminPartnerEditPage;


