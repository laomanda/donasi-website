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

// Allocation Components
import { MitraAllocationsTable } from "../../../components/management/mitra/allocations/MitraAllocationsTable";
import { MitraAllocationCards } from "../../../components/management/mitra/allocations/MitraAllocationCards";

interface Allocation {
  id: number;
  title: string;
  amount: number;
  created_at: string;
  proof_path?: string;
}

export function MitraAllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
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

      const res = await http.get(`/mitra/allocations?${params.toString()}`);
      const responseData = res.data.data;
      
      setAllocations(responseData.data);
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

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    try {
      const params = new URLSearchParams({
        q: search,
        date_from: dateFrom,
        date_to: dateTo,
        lang: locale
      });
      const res = await http.get(`/mitra/allocations/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-alokasi-${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <MitraPageHeader
        title={t("mitra.recent_allocations", "Alokasi Penyaluran")}
        subtitle={t("mitra.allocations_subtitle", "Pantau penyaluran dana donasi secara transparan.")}
        actionButton={{
          label: t("mitra.download_report", "Unduh Laporan"),
          onClick: handleDownloadPdf,
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
          placeholder: t("mitra.search_allocation_placeholder", "Cari keperluan alokasi..."),
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
        <MitraAllocationsTable
          allocations={allocations}
          loading={loading}
          locale={locale}
          t={t}
        />
        
        <MitraAllocationCards
          allocations={allocations}
          loading={loading}
          locale={locale}
          t={t}
        />

        <MitraPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          currentCount={allocations.length}
          loading={loading}
          onPageChange={setCurrentPage}
          showingInfoText={t("mitra.showing_info", "Menampilkan {count} dari {total} data")}
        />
      </div>
    </div>
  );
}
