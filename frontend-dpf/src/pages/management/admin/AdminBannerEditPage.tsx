import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { AdminBannerForm } from "./AdminBannerForm";

export function AdminBannerEditPage() {
  const { id } = useParams<{ id: string }>();
  const bannerId = useMemo(() => Number(id), [id]);

  return <AdminBannerForm mode="edit" bannerId={bannerId} />;
}

export default AdminBannerEditPage;
