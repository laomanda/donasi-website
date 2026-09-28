import {
  faListCheck,
  faBookOpen,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import type {
  ImportModule,
  AccountsImportPreviewData,
  JournalImportPreviewData,
  OpeningBalanceImportPreviewData,
} from "@/types/finance";

export interface ModuleConfig {
  id: ImportModule;
  title: string;
  shortName: string;
  description: string;
  icon: typeof faListCheck;
  templateFileName: string;
}

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: "accounts",
    title: "Daftar Akun (Chart of Accounts)",
    shortName: "Daftar Akun",
    description: "Import struktur Chart of Accounts, kode akun, hierarki parent, dan saldo normal ke sistem Finance.",
    icon: faListCheck,
    templateFileName: "template_daftar_akun.xlsx",
  },
  {
    id: "journals",
    title: "Jurnal Umum (JU)",
    shortName: "Jurnal Umum",
    description: "Import histori transaksi jurnal umum ganda dan posting mutasi debit/kredit ke buku besar.",
    icon: faBookOpen,
    templateFileName: "template_jurnal_umum.xlsx",
  },
  {
    id: "opening_balance",
    title: "Saldo Awal (Opening Balance)",
    shortName: "Saldo Awal",
    description: "Import inisialisasi saldo awal buku besar untuk periode akuntansi yang sedang dibuka.",
    icon: faScaleBalanced,
    templateFileName: "template_saldo_awal.xlsx",
  },
];

export type CombinedPreviewData =
  | { type: "accounts"; data: AccountsImportPreviewData }
  | { type: "journals"; data: JournalImportPreviewData }
  | { type: "opening_balance"; data: OpeningBalanceImportPreviewData };

export interface LastImportSummary {
  batch_id?: number;
  total_rows?: number;
  total_journals?: number;
  success_rows?: number;
  failed_rows?: number;
  message?: string;
}
