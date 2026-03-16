import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { useToast } from "../../../ui/ToastProvider";

// Modular Components
import { UserFormHeader } from "./UserFormHeader";
import { UserPersonalInfoFields } from "./UserPersonalInfoFields";
import { UserRoleAksesFields } from "./UserRoleAksesFields";
import { UserStatusAksiSidebar } from "./UserStatusAksiSidebar";

type Role = {
  id: number;
  name: string;
};

type Permission = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  role_label?: string | null;
  roles?: { id?: number; name: string }[];
  permissions?: { id?: number; name: string }[];
};

type UserFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  is_active: boolean;
  role_label: string;
  roles: string[];
  permissions: string[];
};

type RoleExtended = Role & {
  permissions?: Permission[];
};

const emptyForm: UserFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  is_active: true,
  role_label: "",
  roles: [],
  permissions: [],
};

const normalizeErrors = (error: any): string[] => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    const message = error?.response?.data?.message ?? error?.message;
    return message ? [String(message)] : ["Terjadi kesalahan."];
  }

  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key];
    if (Array.isArray(value)) value.forEach((msg) => messages.push(String(msg)));
    else if (value) messages.push(String(value));
  }
  return messages.length ? messages : ["Validasi gagal."];
};

type Mode = "create" | "edit";

export function SuperAdminUserForm({ mode, userId }: { mode: Mode; userId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [roles, setRoles] = useState<RoleExtended[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const isEditIdValid = typeof userId === "number" && Number.isFinite(userId) && userId > 0;

  const fetchRolesAndPermissions = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        http.get<RoleExtended[]>("/superadmin/roles"),
        http.get<Permission[]>("/superadmin/permissions"),
      ]);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      setAllPermissions(Array.isArray(permsRes.data) ? permsRes.data : []);
    } catch {
      setRoles([]);
      setAllPermissions([]);
    }
  };

  const fetchUser = async (id: number) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await http.get<User>(`/superadmin/users/${id}`);
      const user = res.data;
      const userRoles = Array.isArray(user.roles)
        ? user.roles.map((r) => String(r?.name ?? "").trim()).filter(Boolean)
        : [];
      const userPermissions = Array.isArray(user.permissions)
        ? user.permissions.map((p) => String(p?.name ?? "").trim()).filter(Boolean)
        : [];
      setForm({
        name: String(user.name ?? ""),
        email: String(user.email ?? ""),
        phone: String(user.phone ?? ""),
        password: "",
        is_active: Boolean(user.is_active),
        role_label: String(user.role_label ?? ""),
        roles: userRoles,
        permissions: userPermissions,
      });
    } catch (err) {
      setErrors(normalizeErrors(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRolesAndPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID pengguna tidak valid."]);
      setLoading(false);
      return;
    }
    void fetchUser(userId as number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isEditIdValid, userId]);

  const toggleRole = (name: string) => {
    const roleObj = roles.find((r) => r.name === name);
    setForm((prev) => {
      const nextPermissions = roleObj?.permissions?.map((p) => p.name) || [];

      return {
        ...prev,
        roles: [name],
        permissions: nextPermissions,
        // Auto-fill role_label if empty
        role_label:
          prev.role_label.trim() === ""
            ? name.charAt(0).toUpperCase() + name.slice(1)
            : prev.role_label,
      };
    });
  };

  const canSubmit = !loading && !saving;

  const onSubmit = async () => {
    setSaving(true);
    setErrors([]);
    try {
      const trimmedPhone = form.phone.trim();
      if (trimmedPhone !== "" && trimmedPhone.length < 8) {
        const message = "Nomor telepon terlalu pendek.";
        setErrors([message]);
        toast.error(message, { title: "Validasi gagal" });
        return;
      }
      const permissions = Array.from(new Set([...form.permissions]));
      
      const data = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: trimmedPhone || null,
        password: form.password || undefined,
        is_active: Boolean(form.is_active),
        role_label: form.role_label.trim() || null,
        roles: form.roles,
        permissions: permissions,
      };

      if (mode === "create") {
        await http.post("/superadmin/users", data);
        toast.success("Pengguna berhasil dibuat.", { title: "Berhasil" });
        navigate("/superadmin/users");
      } else {
        if (!isEditIdValid) throw new Error("ID pengguna tidak valid.");
        await http.put(`/superadmin/users/${userId}`, data);
        toast.success("Pengguna berhasil diperbarui.", { title: "Berhasil" });
        navigate("/superadmin/users");
      }
    } catch (err) {
      const messages = normalizeErrors(err);
      setErrors(messages);
      toast.error(messages[0] ?? "Gagal menyimpan pengguna.", { title: "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <UserFormHeader mode={mode} />

      {errors.length ? (
        <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 flex items-start gap-4 text-red-700 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 mt-1">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div>
            <p className="font-bold text-lg">Validasi Gagal</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-medium">
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <UserPersonalInfoFields
            form={form}
            setForm={setForm}
            loading={loading}
            saving={saving}
            mode={mode}
          />

          <UserRoleAksesFields
            roles={roles}
            selectedRoles={form.roles}
            toggleRole={toggleRole}
            permissions={allPermissions}
            selectedPermissions={form.permissions}
            roleLabel={form.role_label}
            setRoleLabel={(val) => setForm((s) => ({ ...s, role_label: val }))}
            loading={loading}
            saving={saving}
          />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <UserStatusAksiSidebar
            isActive={form.is_active}
            setIsActive={(val) => setForm((s) => ({ ...s, is_active: val }))}
            loading={loading}
            saving={saving}
            onSubmit={onSubmit}
            canSubmit={canSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default SuperAdminUserForm;
