import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../lib/http";
import { AuthLayout } from "../../layouts/AuthLayout";
import { useLang } from "../../lib/i18n";
import { authDict, translate } from "../../i18n/auth";
import { RegisterLeftPanel } from "../../components/auth/register/RegisterLeftPanel";
import { RegisterForm } from "../../components/auth/register/RegisterForm";

export function MitraRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(authDict, locale, key, fallback);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instansi: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await http.post("/auth/mitra/register", formData);
      navigate("/login", { 
        state: { successKey: "register" } 
      });
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_25px_70px_-45px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col md:flex-row">
            <RegisterLeftPanel
              title={t("register.left_panel_title")}
              description={t("register.left_panel_desc")}
              alreadyHaveAccountLabel={t("register.already_have_account").split("?")[0]}
              loginLabel={t("register.already_have_account").split("?")[1]?.trim() || "Login"}
            />

            <div className="flex-1 p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="font-heading text-xl font-bold text-slate-900">{t("register.title")}</h2>
                <p className="text-sm font-medium text-slate-500">{t("register.subtitle")}</p>
              </div>

              <RegisterForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                loading={loading}
                onSubmit={handleSubmit}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                t={t}
                labels={{
                  picName: t("register.pic_name"),
                  picNamePlaceholder: t("register.pic_name_placeholder"),
                  institutionName: t("register.institution_name"),
                  institutionNamePlaceholder: t("register.institution_name_placeholder"),
                  email: t("auth.email"),
                  emailPlaceholder: t("register.email_placeholder"),
                  whatsapp: t("register.whatsapp"),
                  password: t("auth.password"),
                  confirmPassword: t("register.confirm_password"),
                  submit: t("register.submit"),
                  processing: t("auth.processing"),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
