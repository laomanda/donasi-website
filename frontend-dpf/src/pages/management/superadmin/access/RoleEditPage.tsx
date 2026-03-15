import { useParams } from "react-router-dom";
import RoleForm from "../../../../components/management/superadmin/access/RoleForm";

export function RoleEditPage() {
  const { id } = useParams<{ id: string }>();
  return <RoleForm mode="edit" roleId={id ? parseInt(id) : undefined} />;
}

export default RoleEditPage;
