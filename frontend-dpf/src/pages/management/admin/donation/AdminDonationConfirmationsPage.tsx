import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { runWithConcurrency } from "@/lib/bulk";
import { useBulkSelection } from "@/components/ui/useBulkSelection";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";

// Import modular components
import AdminDonationHeader from "@/components/management/admin/donations/AdminDonationHeader";
import AdminDonationFilters from "@/components/management/admin/donations/AdminDonationFilters";
import AdminDonationTable from "@/components/management/admin/donations/AdminDonationTable";
import AdminDonationMobileList from "@/components/management/admin/donations/AdminDonationMobileList";
import AdminDonationPagination from "@/components/management/admin/donations/AdminDonationPagination";
import AdminWhatsappConfirmationModal from "@/components/management/admin/AdminWhatsappConfirmationModal";

// Import utilities
import {
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  normalizeSourceLabel,
  formatCount,
} from "@/utils/management/adminDonationUtils";

type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { title: string } | null;
  whatsapp_number?: string | null;
  payment_source?: string | null;
  donor_phone?: string | null;
  whatsapp_sent_at?: string | null;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

type ProgramOption = {
  id: number;
  title: string;
};

type ProgramsPayload = PaginationPayload<{
  id: number;
  title: string;
}>;

export function AdminDonationConfirmationsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // States for filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("pending");
  const [paymentSource, setPaymentSource] = useState("manual");
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [programLoading, setProgramLoading] = useState(false);

  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; donation: Donation | null }>({
    isOpen: false,
    donation: null,
  });

  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((d) => d.id), [items]);
  const skipAutoFetchRef = useRef(false);

  const hasFilters = Boolean(
    q.trim() || 
    (status && status !== "pending") || 
    programId || 
    dateFrom || 
    dateTo
  );

  const fetchPrograms = async () => {
    setProgramLoading(true);
    try {
      const res = await http.get<ProgramsPayload>("/admin/programs", { params: { page: 1, per_page: 100 } });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setProgramOptions(
        list
          .filter((item) => item && typeof item === "object" && typeof (item as any).id === "number")
          .map((item) => ({ id: Number((item as any).id), title: String((item as any).title ?? "") }))
      );
    } catch {
      setProgramOptions([]);
    } finally {
      setProgramLoading(false);
    }
  };

  const fetchConfirmations = async (
    nextPage: number,
    overrides?: Partial<{ q: string; status: string; perPage: number; programId: string; dateFrom: string; dateTo: string }>,
    options?: { background?: boolean }
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const perPageValue = overrides?.perPage ?? perPage;
    const programIdValue = overrides?.programId ?? programId;
    const dateFromValue = overrides?.dateFrom ?? dateFrom;
    const dateToValue = overrides?.dateTo ?? dateTo;

    if (!options?.background) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Donation>>("/admin/donations", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          program_id: programIdValue || undefined,
          start_date: dateFromValue || undefined,
          end_date: dateToValue || undefined,
          payment_source: "manual", // Paksa manual untuk konfirmasi
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      if (!options?.background) {
        setError("Gagal memuat konfirmasi donasi.");
      }
    } finally {
      if (!options?.background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchPrograms();
  }, []);

  // Real-time polling
  useEffect(() => {
    if (q.trim().length > 0) return;

    const interval = window.setInterval(() => {
      void fetchConfirmations(page, undefined, { background: true });
    }, 3000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, q, status, programId, dateFrom, dateTo]);

  useEffect(() => {
    if (skipAutoFetchRef.current) {
      skipAutoFetchRef.current = false;
      return;
    }
    const delay = q.trim().length ? 500 : 0;
    const timer = window.setTimeout(() => {
      void fetchConfirmations(1);
    }, delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, perPage, programId, dateFrom, dateTo]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const onResetFilters = () => {
    skipAutoFetchRef.current = true;
    setQ("");
    setStatus("pending");
    setProgramId("");
    setDateFrom("");
    setDateTo("");
    void fetchConfirmations(1, { q: "", status: "pending", programId: "", dateFrom: "", dateTo: "" });
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/donations/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} donasi.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchConfirmations(1);
      window.dispatchEvent(new Event("refresh-badges"));
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleOpenWhatsapp = (donation: Donation, e: React.MouseEvent) => {
    e.stopPropagation();
    setWhatsappModal({ isOpen: true, donation });
  };

  const openDonation = (id: number) => {
    navigate(`/admin/donations/${id}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <AdminDonationHeader 
        onInputManual={() => navigate("/admin/donations/manual")}
      />

      <AdminDonationFilters 
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        paymentSource={paymentSource}
        setPaymentSource={setPaymentSource}
        programId={programId}
        setProgramId={setProgramId}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        programOptions={programOptions}
        programLoading={programLoading}
        hasFilters={hasFilters}
        onResetFilters={onResetFilters}
      />

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <BulkActionsBar
        count={selection.count}
        itemLabel="donasi"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <AdminDonationTable 
          items={items}
          loading={loading}
          selection={selection}
          pageIds={pageIds}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
          getStatusTone={getStatusTone}
          getStatusLabel={getStatusLabel}
          normalizeSourceLabel={normalizeSourceLabel}
          handleOpenWhatsapp={handleOpenWhatsapp}
          openDonation={openDonation}
        />

        <AdminDonationMobileList 
          items={items}
          loading={loading}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
          getStatusTone={getStatusTone}
          getStatusLabel={getStatusLabel}
          normalizeSourceLabel={normalizeSourceLabel}
          handleOpenWhatsapp={handleOpenWhatsapp}
          openDonation={openDonation}
        />
      </div>

      <AdminDonationPagination 
        page={page}
        lastPage={lastPage}
        perPage={perPage}
        total={total}
        loading={loading}
        pageLabel={`Menampilkan ${items.length} dari ${formatCount(total)} konfirmasi`}
        onPageChange={(p) => void fetchConfirmations(p)}
      />

      {whatsappModal.donation && (
        <AdminWhatsappConfirmationModal 
          isOpen={whatsappModal.isOpen}
          onClose={() => setWhatsappModal({ ...whatsappModal, isOpen: false })}
          donationId={whatsappModal.donation.id}
          donorName={whatsappModal.donation.donor_name || "Hamba Allah"}
          donorPhone={whatsappModal.donation.donor_phone || ""}
          amount={whatsappModal.donation.amount || 0}
          programTitle={whatsappModal.donation.program?.title || "Program Umum"}
          donationCode={whatsappModal.donation.donation_code || "-"}
          onSuccess={() => {
              void fetchConfirmations(page);
          }}
        />
      )}
    </div>
  );
}

export default AdminDonationConfirmationsPage;
