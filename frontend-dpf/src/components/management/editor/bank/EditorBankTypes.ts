export type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_visible_public: boolean;
  order: number;
  updated_at?: string | null;
  created_at?: string | null;
  category?: string | null;
  type?: string | null;
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const getStatusTone = (isActive: boolean) =>
  isActive
    ? "bg-brandGreen-600 text-white shadow-sm ring-1 ring-brandGreen-600"
    : "bg-slate-500 text-white shadow-sm ring-1 ring-slate-500";
