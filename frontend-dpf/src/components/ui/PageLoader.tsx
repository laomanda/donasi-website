import { useEffect, useState } from 'react';

export function PageLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Avoid flash of loader for extremely fast connection
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-emerald-500/20 duration-1000"></div>
        {/* Middle spinning ring */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
      <p className="mt-4 font-heading text-sm font-semibold tracking-wider text-slate-600 animate-pulse uppercase">
        Memuat Halaman...
      </p>
    </div>
  );
}
