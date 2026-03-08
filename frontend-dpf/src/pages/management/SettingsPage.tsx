import { useMemo, useState } from "react";
import http from "../../lib/http";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import type { DashboardRole } from "../../components/management/dashboard/DashboardUtils";
import { useToast } from "../../components/ui/ToastProvider";

import SettingsHero from "../../components/management/settings/SettingsHero";
import SettingsSidebar from "../../components/management/settings/SettingsSidebar";
import SettingsAccountSection from "../../components/management/settings/SettingsAccountSection";
import SettingsSecuritySection from "../../components/management/settings/SettingsSecuritySection";

const roleLabel = (role: DashboardRole) => {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Editor";
};

export function SettingsPage({ role }: { role: DashboardRole }) {
  const toast = useToast();

  const user = useMemo(() => getAuthUser(), []);
  const tokenExists = useMemo(() => Boolean(getAuthToken()), []);

  const displayName = useMemo(() => {
    const value = String(user?.name ?? roleLabel(role)).trim();
    return value || roleLabel(role);
  }, [role, user?.name]);

  const displayEmail = useMemo(() => {
    const value = String(user?.email ?? "").trim();
    return value || "Email belum tersedia";
  }, [user?.email]);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [k: string]: string }>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  const onCopy = async (value: string, label: string) => {
    const text = String(value ?? "");
    if (!text.trim()) {
      toast.error(`${label} kosong.`, { title: "Gagal" });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin.`, { title: "Berhasil" });
    } catch {
      toast.error(`Tidak bisa menyalin ${label}.`, { title: "Gagal" });
    }
  };

  const validatePasswordForm = () => {
    const nextErrors: { [k: string]: string } = {};
    if (!passwordForm.current.trim()) nextErrors.current = "Password saat ini wajib diisi.";
    if (!passwordForm.next.trim()) nextErrors.next = "Password baru wajib diisi.";
    if (passwordForm.next.trim().length > 0 && passwordForm.next.trim().length < 8) {
      nextErrors.next = "Password baru minimal 8 karakter.";
    }
    if (!passwordForm.confirm.trim()) nextErrors.confirm = "Konfirmasi password wajib diisi.";
    if (passwordForm.next.trim() && passwordForm.confirm.trim() && passwordForm.next !== passwordForm.confirm) {
      nextErrors.confirm = "Konfirmasi password tidak sama.";
    }
    return nextErrors;
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validatePasswordForm();
    if (Object.keys(nextErrors).length) {
      setPasswordErrors(nextErrors);
      return;
    }
    setPasswordSaving(true);
    setPasswordErrors({});
    try {
      await http.put("/auth/password", {
        current_password: passwordForm.current,
        new_password: passwordForm.next,
        new_password_confirmation: passwordForm.confirm,
      });
      setPasswordForm({ current: "", next: "", confirm: "" });
      toast.success("Password berhasil diperbarui.", { title: "Berhasil" });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Gagal memperbarui password.";
      toast.error(message, { title: "Gagal" });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-20">
      <SettingsHero 
        user={user} 
        role={role} 
        displayName={displayName} 
        displayEmail={displayEmail} 
        roleLabel={roleLabel} 
      />

      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SettingsSidebar />

        <div className="space-y-8">
          <SettingsAccountSection 
            role={role}
            displayName={displayName}
            displayEmail={displayEmail}
            tokenExists={tokenExists}
            roleLabel={roleLabel}
            onCopy={onCopy}
          />

          <SettingsSecuritySection 
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            passwordErrors={passwordErrors}
            passwordSaving={passwordSaving}
            onChangePassword={onChangePassword}
            onReset={() => {
              setPasswordForm({ current: "", next: "", confirm: "" });
              setPasswordErrors({});
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
