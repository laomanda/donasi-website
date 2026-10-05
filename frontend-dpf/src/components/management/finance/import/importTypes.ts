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
    title: "Bagan Akun",
    shortName: "Daftar Akun",
    description: "Impor struktur dan klasifikasi akun.",
    icon: faListCheck,
    templateFileName: "template_daftar_akun.xlsx",
  },
  {
    id: "journals",
    title: "Jurnal Umum",
    shortName: "Jurnal Umum",
    description: "Impor transaksi jurnal melalui template terstruktur.",
    icon: faBookOpen,
    templateFileName: "template_jurnal_umum.xlsx",
  },
  {
    id: "opening_balance",
    title: "Saldo Awal",
    shortName: "Saldo Awal",
    description: "Impor saldo pembukaan untuk periode akuntansi.",
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
