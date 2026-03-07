import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import http from "../lib/http";
import { setAuthToken, setAuthUser } from "../lib/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { useToast } from "../components/ui/ToastProvider";
import { useLang } from "../lib/i18n";
import { authDict, translate } from "../i18n/auth";

// Components
import { LoginHeader } from "../components/auth/login/LoginHeader";
import { LoginForm } from "../components/auth/login/LoginForm";
import { SocialLogin } from "../components/auth/login/SocialLogin";
import { LoginFooter } from "../components/auth/login/LoginFooter";

// Utils
import { getRedirectPath } from "../components/auth/shared/AuthUtils";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { locale } = useLang();
  
  const t = (key: string, fallback?: string) => translate(authDict, locale, key, fallback);

  const toastTriggered = useRef(false);

  useEffect(() => {
    // Check for success key from registration redirect
    if (location.state?.successKey && !toastTriggered.current) {
      toastTriggered.current = true;
      toast.success(t("register.success_subtitle"), { 
        title: t("register.success_title"),
        durationMs: 6000 
      });
      
      // Clear state so it doesn't reappear on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, toast, t]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        const res = await http.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });
        
        const { token, user } = res.data;
        setAuthToken(token);
        setAuthUser(user);
        
        toast.success(t("login.google_success"));
        navigate(getRedirectPath(user), { replace: true });
      } catch (err) {
        toast.error(t("login.google_fail"));
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => {
      toast.error(t("login.google_connection_error"));
    },
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await http.post<{ token?: unknown; user?: unknown }>("/auth/login", {
        email: email.trim(),
        password,
        remember,
      });

      if (typeof res.data?.token === "string" && res.data.token) {
        setAuthToken(res.data.token);
      }

      if (res.data?.user && typeof res.data.user === "object") {
        const raw = res.data.user as any;
        setAuthUser({
          id: typeof raw.id === "number" ? raw.id : undefined,
          name: typeof raw.name === "string" ? raw.name : undefined,
          email: typeof raw.email === "string" ? raw.email : undefined,
          role_label: typeof raw.role_label === "string" ? raw.role_label : undefined,
          roles: Array.isArray(raw.roles)
            ? raw.roles
                .filter((r: any) => r && typeof r === "object" && typeof r.name === "string")
                .map((r: any) => ({ name: r.name as string }))
            : undefined,
        });
      }

      navigate(getRedirectPath(res.data?.user), { replace: true });
    } catch (err: unknown) {
      toast.error(t("login.error_subtitle"), { 
        title: t("login.error_title") 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-md">
        <LoginHeader />

        <div className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-[0_25px_70px_-45px_rgba(0,0,0,0.45)] sm:p-9">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-semibold text-slate-900">{t("login.title")}</h1>
            <p className="text-sm leading-relaxed text-slate-600">{t("login.subtitle")}</p>
          </div>

          <div className="mt-6">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              remember={remember}
              setRemember={setRemember}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              submitting={submitting}
              onSubmit={onSubmit}
              labels={{
                email: t("auth.email"),
                emailPlaceholder: t("login.email_placeholder"),
                password: t("auth.password"),
                passwordPlaceholder: t("auth.password_placeholder"),
                rememberMe: t("login.remember_me"),
                submit: t("login.title"),
                processing: t("auth.processing"),
                showPassword: locale === "en" ? "Show password" : "Tampilkan kata sandi",
                hidePassword: locale === "en" ? "Hide password" : "Sembunyikan kata sandi",
              }}
            />
          </div>

          <SocialLogin
            disabled={submitting}
            onGoogleLogin={() => loginWithGoogle()}
            googleLabel={t("auth.google_login")}
            orLabel={t("auth.or")}
          />

          <LoginFooter
            mitraInterestLabel={t("login.mitra_interest")}
            registerMitraLabel={t("login.register_mitra")}
          />
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
