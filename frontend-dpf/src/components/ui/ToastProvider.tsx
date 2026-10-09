import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

export type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export type ToastOptions = Partial<Omit<ToastInput, "message" | "variant">> | string;

export type ToastContextValue = {
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  success: (message: string, optionsOrTitle?: ToastOptions) => string;
  error: (message: string, optionsOrTitle?: ToastOptions) => string;
  info: (message: string, optionsOrTitle?: ToastOptions) => string;
  warning: (message: string, optionsOrTitle?: ToastOptions) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let globalToastContext: ToastContextValue | null = null;

export const getDefaultToastTitle = (variant: ToastVariant): string => {
  switch (variant) {
    case "success":
      return "Berhasil";
    case "error":
      return "Gagal";
    case "warning":
      return "Peringatan";
    case "info":
    default:
      return "Informasi";
  }
};

const parseOptions = (optionsOrTitle?: ToastOptions): Partial<Omit<ToastInput, "message" | "variant">> => {
  if (typeof optionsOrTitle === "string") {
    return { title: optionsOrTitle };
  }
  return optionsOrTitle ?? {};
};

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
      card: "bg-emerald-600 text-white shadow-xl shadow-emerald-950/20 border border-emerald-500/80 ring-1 ring-emerald-500/50",
      iconWrap: "bg-white/20 text-white",
      title: "text-white",
      message: "text-white/95",
    };
  }

  if (variant === "error") {
    return {
      icon: faCircleExclamation,
      card: "bg-red-600 text-white shadow-xl shadow-red-950/20 border border-red-500/80 ring-1 ring-red-500/50",
      iconWrap: "bg-white/20 text-white",
      title: "text-white",
      message: "text-white/95",
    };
  }

  if (variant === "warning") {
    return {
      icon: faTriangleExclamation,
      card: "bg-amber-600 text-white shadow-xl shadow-amber-950/20 border border-amber-500/80 ring-1 ring-amber-500/50",
      iconWrap: "bg-white/20 text-white",
      title: "text-white",
      message: "text-white/95",
    };
  }

  return {
    icon: faCircleInfo,
    card: "bg-primary-600 text-white shadow-xl shadow-primary-950/20 border border-primary-500/80 ring-1 ring-primary-500/50",
    iconWrap: "bg-white/20 text-white",
    title: "text-white",
    message: "text-white/95",
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
      const variant = toast.variant ?? "info";
      const title = toast.title?.trim() || getDefaultToastTitle(variant);

      const item: ToastItem = {
        id,
        title,
        message: toast.message,
        variant,
        durationMs: toast.durationMs ?? 3800,
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
      success: (message, optionsOrTitle) => {
        const opts = parseOptions(optionsOrTitle);
        return push({ ...opts, message, variant: "success", title: opts.title || "Berhasil" });
      },
      error: (message, optionsOrTitle) => {
        const opts = parseOptions(optionsOrTitle);
        return push({ ...opts, message, variant: "error", title: opts.title || "Gagal" });
      },
      info: (message, optionsOrTitle) => {
        const opts = parseOptions(optionsOrTitle);
        return push({ ...opts, message, variant: "info", title: opts.title || "Informasi" });
      },
      warning: (message, optionsOrTitle) => {
        const opts = parseOptions(optionsOrTitle);
        return push({ ...opts, message, variant: "warning", title: opts.title || "Peringatan" });
      },
    };
  }, [dismiss, push]);

  useEffect(() => {
    globalToastContext = api;
    return () => {
      if (globalToastContext === api) {
        globalToastContext = null;
      }
    };
  }, [api]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] w-[min(26rem,calc(100vw-2rem))] space-y-3">
        {toasts.map((item) => {
          const tokens = getVariantTokens(item.variant);
          return (
            <div
              key={item.id}
              className={[
                "pointer-events-auto overflow-hidden rounded-2xl shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-top-2",
                tokens.card,
              ].join(" ")}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 sm:gap-3.5 p-4">
                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    tokens.iconWrap,
                  ].join(" ")}
                >
                  <FontAwesomeIcon icon={tokens.icon} className="text-base" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h4 className={["text-sm font-bold tracking-tight", tokens.title].join(" ")}>
                    {item.title}
                  </h4>
                  <p
                    className={[
                      "mt-1 text-xs sm:text-sm font-normal leading-relaxed break-words",
                      tokens.message,
                    ].join(" ")}
                  >
                    {item.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/20 hover:text-white shrink-0 -mr-1 -mt-1"
                  aria-label="Tutup notifikasi"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
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

export const toast = {
  push: (input: ToastInput) => globalToastContext?.push(input) ?? "",
  dismiss: (id: string) => globalToastContext?.dismiss(id),
  success: (message: string, optionsOrTitle?: ToastOptions) =>
    globalToastContext?.success(message, optionsOrTitle) ?? "",
  error: (message: string, optionsOrTitle?: ToastOptions) =>
    globalToastContext?.error(message, optionsOrTitle) ?? "",
  info: (message: string, optionsOrTitle?: ToastOptions) =>
    globalToastContext?.info(message, optionsOrTitle) ?? "",
  warning: (message: string, optionsOrTitle?: ToastOptions) =>
    globalToastContext?.warning(message, optionsOrTitle) ?? "",
};
