import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type ToastVariant = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  success: (message: string, options?: Partial<Omit<ToastInput, "message" | "variant">>) => string;
  error: (message: string, options?: Partial<Omit<ToastInput, "message" | "variant">>) => string;
  info: (message: string, options?: Partial<Omit<ToastInput, "message" | "variant">>) => string;
  warning: (message: string, options?: Partial<Omit<ToastInput, "message" | "variant">>) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const createToastId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID() as string;
  }
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const getVariantTokens = (variant: ToastVariant) => {
  if (variant === "success") {
    return {
      icon: faCheckCircle,
      ring: "ring-brandGreen-100",
      bg: "bg-brandGreen-50",
      iconText: "text-brandGreen-700",
      title: "text-brandGreen-900",
      message: "text-brandGreen-800",
    };
  }

  if (variant === "error") {
    return {
      icon: faTriangleExclamation,
      ring: "ring-red-100",
      bg: "bg-red-50",
      iconText: "text-red-600",
      title: "text-red-900",
      message: "text-red-800",
    };
  }

  if (variant === "warning") {
    return {
      icon: faTriangleExclamation,
      ring: "ring-amber-100",
      bg: "bg-amber-50",
      iconText: "text-amber-700",
      title: "text-amber-900",
      message: "text-amber-800",
    };
  }

  return {
    icon: faCircleInfo,
    ring: "ring-slate-200",
    bg: "bg-white",
    iconText: "text-primary-700",
    title: "text-slate-900",
    message: "text-slate-700",
  };
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();
      const item: ToastItem = {
        id,
        title: toast.title,
        message: toast.message,
        variant: toast.variant ?? "info",
        durationMs: toast.durationMs ?? 3200,
      };

      setToasts((current) => [...current.slice(-4), item]);

      if (item.durationMs > 0) {
        const timer = window.setTimeout(() => dismiss(id), item.durationMs);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const api = useMemo<ToastContextValue>(() => {
    return {
      push,
      dismiss,
      success: (message, options) => push({ ...options, message, variant: "success" }),
      error: (message, options) => push({ ...options, message, variant: "error" }),
      info: (message, options) => push({ ...options, message, variant: "info" }),
      warning: (message, options) => push({ ...options, message, variant: "warning" }),
    };
  }, [dismiss, push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] w-[min(26rem,calc(100vw-2rem))] space-y-3">
        {toasts.map((toast) => {
          const tokens = getVariantTokens(toast.variant);
          return (
            <div
              key={toast.id}
              className={[
                "pointer-events-auto overflow-hidden rounded-2xl bg-white shadow-soft ring-1",
                tokens.ring,
              ].join(" ")}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 p-4">
                <div className={["flex h-10 w-10 items-center justify-center rounded-2xl", tokens.bg].join(" ")}>
                  <FontAwesomeIcon icon={tokens.icon} className={tokens.iconText} />
                </div>
                <div className="min-w-0 flex-1">
                  {toast.title ? (
                    <p className={["truncate text-sm font-bold", tokens.title].join(" ")}>
                      {toast.title}
                    </p>
                  ) : null}
                  <p className={["mt-0.5 text-sm font-semibold", tokens.message].join(" ")}>
                    {toast.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  aria-label="Tutup"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider.");
  return ctx;
};

