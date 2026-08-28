import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
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
import SettingsSocialSection from "../../components/management/settings/SettingsSocialSection";

type SocialSettingsState = {
  instagramEnabled: boolean;
  youtubeEnabled: boolean;
};

const SOCIAL_SETTING_KEYS = {
  instagramEnabled: "social.instagram_enabled",
  youtubeEnabled: "social.youtube_enabled",
} as const;

export function SettingsPage({ role }: { role: DashboardRole }) {
  const toast = useToast();
  const { locale } = useLang();
  const effectiveLocale = role === "mitra" ? locale : "id";
  const t = useCallback((key: string, fallback?: string) => translate(settingsDict, effectiveLocale, key, fallback), [effectiveLocale]);

  const user = useMemo(() => getAuthUser(), []);
  const tokenExists = useMemo(() => Boolean(getAuthToken()), []);

  const roleLabel = useCallback((role: DashboardRole) => {
    if (role === "superadmin") return t("role.superadmin");
    if (role === "admin") return t("role.admin");
    if (role === "editor") return t("role.editor");
    if (role === "keuangan") return "Keuangan";
    if (role === "custom") return (user as any)?.role_label || "Staff";
    return t("role.mitra");
  }, [t, user]);

  const displayName = useMemo(() => {
    const value = String(user?.name ?? roleLabel(role)).trim();
    return value || roleLabel(role);
  }, [role, user?.name, roleLabel]);

  const displayEmail = useMemo(() => {
    const value = String(user?.email ?? "").trim();
    return value || t("settings.hero.email_not_available");
  }, [user?.email, t]);

  const canManageSocialSettings = role === "admin" || role === "superadmin";

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
  const [socialForm, setSocialForm] = useState<SocialSettingsState>({
    instagramEnabled: false,
    youtubeEnabled: false,
  });
  const [socialLoading, setSocialLoading] = useState(canManageSocialSettings);
  const [socialSaving, setSocialSaving] = useState(false);

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

  useEffect(() => {
    if (!canManageSocialSettings) return;

    let active = true;
    const loadSocialSettings = async () => {
      setSocialLoading(true);
      try {
        const response = await http.get("/admin/settings", {
          params: {
            keys: Object.values(SOCIAL_SETTING_KEYS).join(","),
          },
        });

        if (!active) return;

        const items = Array.isArray(response.data) ? response.data : [];
        const nextState = items.reduce<SocialSettingsState>(
          (acc, item) => {
            if (item?.key === SOCIAL_SETTING_KEYS.instagramEnabled) {
              acc.instagramEnabled = String(item?.value ?? "0") === "1";
            }
            if (item?.key === SOCIAL_SETTING_KEYS.youtubeEnabled) {
              acc.youtubeEnabled = String(item?.value ?? "0") === "1";
            }
            return acc;
          },
          {
            instagramEnabled: false,
            youtubeEnabled: false,
          }
        );

        setSocialForm(nextState);
      } catch (err: unknown) {
        if (!active) return;
        const message = isAxiosError(err)
          ? err.response?.data?.message ?? t("settings.social.load_fail")
          : t("settings.social.load_fail");
        toast.error(message, { title: locale === "en" ? "Failed" : "Gagal" });
      } finally {
        if (active) setSocialLoading(false);
      }
    };

    void loadSocialSettings();
    return () => {
      active = false;
    };
  }, [canManageSocialSettings, locale, t, toast]);

  const onToggleSocialSetting = (key: keyof SocialSettingsState, checked: boolean) => {
    setSocialForm((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const onSaveSocialSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSocialSettings || socialLoading) return;

    setSocialSaving(true);
    try {
      await http.put("/admin/settings", {
        settings: [
          {
            key: SOCIAL_SETTING_KEYS.instagramEnabled,
            value: socialForm.instagramEnabled ? "1" : "0",
          },
          {
            key: SOCIAL_SETTING_KEYS.youtubeEnabled,
            value: socialForm.youtubeEnabled ? "1" : "0",
          },
        ],
      });
      toast.success(t("settings.social.save_success"), { title: locale === "en" ? "Success" : "Berhasil" });
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? t("settings.social.save_fail")
        : t("settings.social.save_fail");
      toast.error(message, { title: locale === "en" ? "Failed" : "Gagal" });
    } finally {
      setSocialSaving(false);
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
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? t("settings.validation.fail")
        : t("settings.validation.fail");
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
        <SettingsSidebar role={role} showSocialSettings={canManageSocialSettings} />

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
            role={role}
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

          {canManageSocialSettings && (
            <SettingsSocialSection
              role={role}
              value={socialForm}
              loading={socialLoading}
              saving={socialSaving}
              onToggle={onToggleSocialSetting}
              onSave={onSaveSocialSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
