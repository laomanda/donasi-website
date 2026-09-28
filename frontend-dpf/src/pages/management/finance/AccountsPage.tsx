import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap, faFileExcel, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceEmptyState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import { downloadBlobFile } from "@/utils/financeUtils";

export function AccountsPage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportAccounts();
      downloadBlobFile(blob, `bagan-akun-coa-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Bagan Akun Standar (Chart of Accounts)"
        description="Klasifikasi dan kode akun perkiraan akuntansi yayasan (Aset, Kewajiban, Ekuitas/Dana Wakaf, Pendapatan, dan Beban)."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
              {exporting ? "Mengunduh..." : "Export Excel"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tambah Akun
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
        <FinanceEmptyState
          title="Bagan Akun (Chart of Accounts)"
          description="Daftar hierarki akun terstruktur akan dimuat dan dikelola pada fase modul akun berikutnya."
          icon={faSitemap}
        />
      </div>
    </div>
  );
}

export default AccountsPage;
