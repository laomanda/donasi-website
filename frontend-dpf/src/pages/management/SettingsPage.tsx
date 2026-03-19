import { useMemo, useState } from "react";
import http from "../../lib/http";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import type { DashboardRole } from "../../components/management/dashboard/DashboardUtils";
import { useToast } from "../../components/ui/ToastProvider";
import { useLang } from "../../lib/i18n";
import { settingsDict, translate } from "../../i18n/settings";

import SettingsHero from "../../components/management/settings/SettingsHero";
import SettingsSidebar from "../../components/management/settings/SettingsSidebar";
import SettingsAccountSection from "../../components/management/settings/SettingsAccountSection";
import SettingsSecuritySection from "../../components/management/settings/SettingsSecuritySection";

export function SettingsPage({ role }: { role: DashboardRole }) {
  const toast = useToast();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(settingsDict, locale, key, fallback);

  const user = useMemo(() => getAuthUser(), []);
  const tokenExists = useMemo(() => Boolean(getAuthToken()), []);

  const roleLabel = (role: DashboardRole) => {
    if (role === "superadmin") return t("role.superadmin");
    if (role === "admin") return t("role.admin");
    if (role === "editor") return t("role.editor");
    return t("role.mitra");
  };

  const displayName = useMemo(() => {
    const value = String(user?.name ?? roleLabel(role)).trim();
    return value || roleLabel(role);
  }, [role, user?.name, locale]); // Add locale to dependency to update role label on change

  const displayEmail = useMemo(() => {
    const value = String(user?.email ?? "").trim();
    return value || t("settings.hero.email_not_available");
  }, [user?.email, locale]);

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
      toast.error(t("settings.account.empty_fail", `${label} kosong.`).replace("{label}", label), { 
        title: locale === "en" ? "Failed" : "Gagal" 
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("settings.account.copy_success", `${label} berhasil disalin.`).replace("{label}", label), { 
        title: locale === "en" ? "Success" : "Berhasil" 
      });
    } catch {
      toast.error(t("settings.account.copy_fail", `Tidak bisa menyalin ${label}.`).replace("{label}", label), { 
        title: locale === "en" ? "Failed" : "Gagal" 
      });
    }
  };

  const validatePasswordForm = () => {
    const nextErrors: { [k: string]: string } = {};
    if (!passwordForm.current.trim()) nextErrors.current = t("settings.validation.current_required");
    if (!passwordForm.next.trim()) nextErrors.next = t("settings.validation.new_required");
    if (passwordForm.next.trim().length > 0 && passwordForm.next.trim().length < 8) {
      nextErrors.next = t("settings.validation.min_length");
    }
    if (!passwordForm.confirm.trim()) nextErrors.confirm = t("settings.validation.confirm_required");
    if (passwordForm.next.trim() && passwordForm.confirm.trim() && passwordForm.next !== passwordForm.confirm) {
      nextErrors.confirm = t("settings.validation.mismatch");
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
      toast.success(t("settings.validation.success"), { title: locale === "en" ? "Success" : "Berhasil" });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? t("settings.validation.fail");
      toast.error(message, { title: locale === "en" ? "Failed" : "Gagal" });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-20">
      <SettingsHero 
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
