export const formatDateTime = (value?: string | null, longMonth = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: longMonth ? "long" : "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    suggestion: "Saran",
    bug: "Laporan Bug",
    appreciation: "Apresiasi",
    other: "Lainnya",
  };
  return map[cat] || cat;
};

export const getCategoryTone = (cat: string) => {
  if (cat === "bug") return "bg-red-500 text-white shadow-md shadow-red-500/20";
  if (cat === "appreciation") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (cat === "suggestion") return "bg-primary-600 text-white shadow-md shadow-primary-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

export const getCategoryToneAlt = (cat: string) => {
  if (cat === "bug") return "bg-red-50 text-red-700 border-red-100";
  if (cat === "appreciation") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (cat === "suggestion") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
};

export const formatWhatsAppLink = (phone: string, name: string, category: string) => {
  let cleanNumber = phone.replace(/\D/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1);
  } else if (cleanNumber.startsWith("8")) {
    cleanNumber = "62" + cleanNumber;
  }
  const categoryLabel = getCategoryLabel(category);
  const message = `Halo Bapak/Ibu ${name}, kami dari Admin DPF ingin menindaklanjuti pesan Anda terkait *${categoryLabel}*. Terima kasih.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};
