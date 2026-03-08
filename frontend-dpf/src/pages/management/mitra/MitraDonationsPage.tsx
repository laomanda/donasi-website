import { useEffect, useState, useCallback } from "react";
import { 
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";

import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";

// Shared Components
import { MitraPageHeader } from "../../../components/management/mitra/shared/MitraPageHeader";
import { MitraFilterSection } from "../../../components/management/mitra/shared/MitraFilterSection";
import { MitraPagination } from "../../../components/management/mitra/shared/MitraPagination";

// Donation Components
import { MitraDonationsTable } from "../../../components/management/mitra/donations/MitraDonationsTable";
import { MitraDonationCards } from "../../../components/management/mitra/donations/MitraDonationCards";

type Donation = {
  id: number;
  donation_code: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  program?: { 
    title: string;
    title_en: string | null;
  };
};

export function MitraDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        q: search,
        date_from: dateFrom,
        date_to: dateTo,
        per_page: "10"
      });

      const res = await http.get(`/mitra/donations?${params.toString()}`);
      const responseData = res.data.data;
      
      setDonations(responseData.data);
      setTotalPages(responseData.last_page);
      setTotalItems(responseData.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetFilters = () => {
      setSearch("");
      setDateFrom("");
      setDateTo("");
      setCurrentPage(1);
  };

  const handleDownloadInvoice = async (donationId: number, code: string) => {
    try {
      const res = await http.get(`/mitra/donations/${donationId}/export`, {
        params: { lang: locale },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleExportPdf = async () => {
    setLoadingPdf(true);
    try {
      const params = new URLSearchParams({
        q: search,
        date_from: dateFrom,
        date_to: dateTo,
        lang: locale
      });
      const res = await http.get(`/mitra/donations/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-donasi-${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export PDF failed:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <MitraPageHeader
        title={t("mitra.recent_donations", "Donasi Terbaru")}
        subtitle={t("mitra.donations_subtitle", "Lihat riwayat kontribusi donasi Anda.")}
        actionButton={{
          label: t("mitra.download_report", "Unduh Laporan"),
          onClick: handleExportPdf,
          icon: faFilePdf,
          loading: loadingPdf,
          variant: "blur"
        }}
      />

      <MitraFilterSection
        title={t("mitra.filter_search", "Filter & Pencarian")}
        t={t}
        onReset={handleResetFilters}
        search={{
          value: search,
          onChange: (val) => {
            setSearch(val);
            setCurrentPage(1);
          },
          placeholder: t("mitra.search_program_placeholder", "Cari Kode Donasi atau Program"),
          label: t("nav.search", "Pencarian")
        }}
        dateFilters={{
          from: {
            label: t("mitra.date_from", "Dari Tanggal"),
            value: dateFrom,
            onChange: (val) => {
              setDateFrom(val);
              setCurrentPage(1);
            }
          },
          to: {
            label: t("mitra.date_to_label", "Sampai Tanggal"),
            value: dateTo,
            onChange: (val) => {
              setDateTo(val);
              setCurrentPage(1);
            }
          }
        }}
      />

      <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <MitraDonationsTable
          donations={donations}
          loading={loading}
          locale={locale}
          onDownloadInvoice={handleDownloadInvoice}
          t={t}
        />
        
        <MitraDonationCards
          donations={donations}
          loading={loading}
          locale={locale}
          onDownloadInvoice={handleDownloadInvoice}
          t={t}
        />

        <MitraPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          currentCount={donations.length}
          loading={loading}
          onPageChange={setCurrentPage}
          showingInfoText={t("mitra.showing_info", "Menampilkan {count} dari {total} data")}
        />
      </div>
    </div>
  );
}
