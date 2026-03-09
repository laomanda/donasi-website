import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { runWithConcurrency } from "@/lib/bulk";
import { useBulkSelection } from "@/components/ui/useBulkSelection";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";

// Modular Components
import AdminDonationHeader from "@/components/management/admin/donations/AdminDonationHeader";
import AdminDonationFilters from "@/components/management/admin/donations/AdminDonationFilters";
import AdminDonationTable from "@/components/management/admin/donations/AdminDonationTable";
import AdminDonationMobileList from "@/components/management/admin/donations/AdminDonationMobileList";
import AdminDonationPagination from "@/components/management/admin/donations/AdminDonationPagination";
import AdminWhatsappConfirmationModal from "@/components/management/admin/AdminWhatsappConfirmationModal";

// Utilities
import {
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  normalizeSourceLabel,
} from "@/utils/management/adminDonationUtils";

type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  donor_phone?: string | null;
  whatsapp_sent_at?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  payment_source?: string | null;
  payment_method?: string | null;
  payment_channel?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
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

export function AdminDonationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [items, setItems] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<DonationStatus>("");
  const [paymentSource, setPaymentSource] = useState("");
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [programLoading, setProgramLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((d) => d.id), [items]);

  // WhatsApp Modal State
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const hasFilters = Boolean(
    q.trim() || status || paymentSource || programId.trim() || dateFrom.trim() || dateTo.trim()
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

  const fetchDonations = async (
    nextPage: number,
    overrides?: Partial<{
      q: string;
      status: DonationStatus;
      paymentSource: string;
      programId: string;
      dateFrom: string;
      dateTo: string;
      perPage: number;
    }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const sourceValue = (overrides?.paymentSource ?? paymentSource).trim();
    const programIdValue = (overrides?.programId ?? programId).trim();
    const fromValue = (overrides?.dateFrom ?? dateFrom).trim();
    const toValue = (overrides?.dateTo ?? dateTo).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Donation>>("/admin/donations", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          payment_source: sourceValue || undefined,
          program_id: programIdValue ? Number(programIdValue) : undefined,
          date_from: fromValue || undefined,
          date_to: toValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data donasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPrograms();
  }, []);

  useEffect(() => {
    selection.keepOnly(pageIds);
  }, [pageIds]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDonations(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [q, status, paymentSource, programId, dateFrom, dateTo, perPage]);

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPaymentSource("");
    setProgramId("");
    setDateFrom("");
    setDateTo("");
  };

  const basePath = location.pathname.split('/').slice(0, 2).join('/');
  const openDonation = (id: number) => navigate(`${basePath}/donations/${id}`);

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

      await fetchDonations(1);
      window.dispatchEvent(new Event("refresh-badges"));
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleOpenWhatsapp = (donation: Donation, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDonation(donation);
    setIsWhatsappModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <AdminDonationHeader 
        onInputManual={() => navigate("/admin/donations/manual")}
      />

      {selectedDonation && (
        <AdminWhatsappConfirmationModal 
            isOpen={isWhatsappModalOpen}
            onClose={() => setIsWhatsappModalOpen(false)}
            donationId={selectedDonation.id}
            donorName={selectedDonation.donor_name || "Hamba Allah"}
            donorPhone={selectedDonation.donor_phone || ""}
            amount={selectedDonation.amount || 0}
            programTitle={selectedDonation.program?.title || "Program Umum"}
            donationCode={selectedDonation.donation_code || "-"}
            onSuccess={() => {
                setIsWhatsappModalOpen(false);
                void fetchDonations(page);
            }}
        />
      )}

      <AdminDonationFilters 
        q={q} setQ={setQ}
        status={status} setStatus={setStatus}
        paymentSource={paymentSource} setPaymentSource={setPaymentSource}
        programId={programId} setProgramId={setProgramId}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        programOptions={programOptions}
        programLoading={programLoading}
        hasFilters={hasFilters}
        onResetFilters={onResetFilters}
      />

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500" />
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
        total={total}
        perPage={perPage}
        loading={loading}
        pageLabel={pageLabel}
        onPageChange={(p) => void fetchDonations(p)}
      />
    </div>
  );
}

export default AdminDonationsPage;
