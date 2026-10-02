import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faRotateRight,
  faTriangleExclamation,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

import { AccountPageHeader } from "@/components/management/finance/accounts";
import {
  JournalDetailOverview,
  JournalLinesTable,
  JournalAuditMetadata,
  JournalActionBar,
} from "@/components/management/finance/journals";
import { FinanceErrorState } from "@/components/management/finance/shared";
import {
  useJournal,
  invalidateJournalDetailCache,
} from "@/hooks/finance/useJournal";
import { invalidateJournalsCache } from "@/hooks/finance/useJournals";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";

export function JournalDetailPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const journalId = Number(paramId);
  const isValidId = !isNaN(journalId) && journalId > 0;

  // RBAC Permission Check
  const currentUser = getAuthUser();
  const userRoles = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles;
  }, [currentUser]);

  const canManage = userRoles.includes("keuangan") || userRoles.includes("superadmin");

  // Fetch Journal with SWR cache
  const {
    journal,
    loading,
    refreshing,
    error,
    refresh,
  } = useJournal(isValidId ? journalId : null);

  const [actionLoading, setActionLoading] = useState(false);

  // 1. Post Journal Action
  const handlePostJournal = async () => {
    if (!journal) return;

    const result = await Swal.fire({
      title: "Posting Jurnal ke Buku Besar?",
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p>Jurnal <b>${journal.journal_number}</b> akan langsung dibukukan ke dalam <b>Buku Besar (General Ledger)</b> yayasan.</p>
          <p class="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
            <strong>Penting:</strong> Setelah diposting, jurnal ini berstatus <em>immutable</em> (terkunci permanen) demi integritas audit trail. Segala bentuk koreksi saldo harus dilakukan melalui <b>Jurnal Pembalik (Reverse)</b>.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3f8f3f", // Solid brandGreen-500
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Posting Jurnal",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      await financeService.postJournal(journal.id);
      toast.success(`Jurnal ${journal.journal_number} berhasil diposting ke Buku Besar.`);

      // Targeted cache invalidation
      invalidateJournalDetailCache(journal.id);
      invalidateJournalsCache();

      await refresh();
    } catch (err: unknown) {
      const msg = extractFinanceErrorMessage(err, "Gagal memposting jurnal ke Buku Besar.");
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Void Journal Action
  const handleVoidJournal = async () => {
    if (!journal) return;

    const result = await Swal.fire({
      title: "Batalkan Jurnal (Void)?",
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p>Jurnal <b>${journal.journal_number}</b> akan dibatalkan secara permanen.</p>
          <p class="text-red-800 bg-red-50 p-2 rounded-lg border border-red-200">
            Jurnal yang dibatalkan tidak akan pernah mempengaruhi saldo Buku Besar yayasan. Tindakan ini tidak dapat diurungkan.
          </p>
        </div>
      `,
      icon: "warning",
      input: "textarea",
      inputLabel: "Alasan Pembatalan (Wajib)",
      inputPlaceholder: "Tuliskan alasan pembatalan jurnal secara jelas...",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Alasan pembatalan jurnal wajib diisi!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // Solid Red
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan Jurnal",
      cancelButtonText: "Tutup",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      await financeService.voidJournal(journal.id, result.value);
      toast.success(`Jurnal ${journal.journal_number} berhasil dibatalkan (Void).`);

      // Targeted cache invalidation
      invalidateJournalDetailCache(journal.id);
      invalidateJournalsCache();

      await refresh();
    } catch (err: unknown) {
      const msg = extractFinanceErrorMessage(err, "Gagal membatalkan jurnal.");
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Reverse Journal Action
  const handleReverseJournal = async () => {
    if (!journal) return;

    const result = await Swal.fire({
      title: "Buat Jurnal Pembalik (Reverse)?",
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p>Sistem akan membuat <b>jurnal baru berstatus Draft</b> yang membalikkan posisi seluruh akun Debit dan Kredit dari jurnal <b>${journal.journal_number}</b>.</p>
          <p class="text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200">
            Jurnal asli tetap tersimpan secara permanen untuk memelihara riwayat audit akuntansi.
          </p>
        </div>
      `,
      icon: "info",
      input: "textarea",
      inputLabel: "Alasan Pembalikan Jurnal (Wajib)",
      inputPlaceholder: "Tuliskan alasan pembuatan jurnal pembalik...",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Alasan pembalikan jurnal wajib diisi!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#f39c12", // Solid brandWarmOrange-500
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Buat Jurnal Pembalik",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await financeService.reverseJournal(journal.id, result.value);
      const newJournal = res.data;

      // Invalidate list caches
      invalidateJournalsCache();
      invalidateJournalDetailCache(journal.id);

      toast.success(
        newJournal?.journal_number
          ? `Jurnal pembalik ${newJournal.journal_number} berhasil dibuat sebagai draft.`
          : "Jurnal pembalik berhasil dibuat sebagai draft."
      );

      // Navigate to the newly created reversal journal if ID returned
      if (newJournal?.id) {
        navigate(`/finance/journals/${newJournal.id}`);
      } else {
        await refresh();
      }
    } catch (err: unknown) {
      const msg = extractFinanceErrorMessage(err, "Gagal membuat jurnal pembalik.");
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Invalid ID State
  if (!isValidId) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Detail Jurnal"
          description="Rincian voucher transaksi pembukuan berpasangan."
          backHref="/finance/journals"
          backLabel="Kembali ke Jurnal Umum"
        />
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs max-w-lg mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">ID Jurnal Tidak Valid</h3>
            <p className="text-xs text-slate-500">
              Parameter ID jurnal pada URL harus berupa bilangan bulat positif.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/finance/journals")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Kembali ke Jurnal Umum</span>
          </button>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !journal) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Detail Jurnal"
          description="Rincian voucher transaksi pembukuan berpasangan."
          backHref="/finance/journals"
          backLabel="Kembali ke Jurnal Umum"
        />
        <FinanceErrorState
          title="Gagal Memuat Detail Jurnal"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  // Initial Loading Skeleton
  if (loading && !journal) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-6">
            <div className="h-40 rounded-2xl bg-slate-200" />
            <div className="h-56 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  // If not found or empty
  if (!journal) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Detail Jurnal"
          description="Rincian voucher transaksi pembukuan berpasangan."
          backHref="/finance/journals"
          backLabel="Kembali ke Jurnal Umum"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs max-w-lg mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FontAwesomeIcon icon={faBookOpen} className="text-2xl" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Jurnal Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Data jurnal dengan ID #{journalId} tidak ditemukan dalam sistem atau telah dihapus.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/finance/journals")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Kembali ke Jurnal Umum</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AccountPageHeader
        title={`Jurnal ${journal.journal_number}`}
        description="Voucher transaksi pembukuan berpasangan (Double-Entry Accounting)."
        backHref="/finance/journals"
        backLabel="Kembali ke Jurnal Umum"
        variant="brand"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            <FontAwesomeIcon icon={faBookOpen} className="text-xs text-white" />
            <span>Voucher #{journal.id}</span>
          </span>
        }
        breadcrumbs={[
          { label: "Keuangan", href: "/finance" },
          { label: "Jurnal Umum", href: "/finance/journals" },
          { label: journal.journal_number },
        ]}
        actions={
          <button
            type="button"
            onClick={() => refresh()}
            disabled={refreshing}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 hover:bg-white/25 px-3.5 text-xs font-bold text-white transition active:scale-95 shadow-xs backdrop-blur-xs"
            title="Segarkan data detail jurnal"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={`text-xs ${refreshing ? "animate-spin text-white" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Menyegarkan..." : "Segarkan"}
            </span>
          </button>
        }
      />

      {/* Main Content Layout: 2/3 Main Column + 1/3 Sidebar Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Overview + Lines Table (~2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview & Metadata */}
          <JournalDetailOverview journal={journal} />

          {/* Double-Entry Lines Table */}
          <JournalLinesTable journal={journal} />
        </div>

        {/* Right Sidebar: Actions & Audit Metadata (~1/3) - Sticky so it follows scroll and space stays filled */}
        <div className="lg:col-span-1 sticky top-24 self-start space-y-6">
          {/* Action Bar */}
          <JournalActionBar
            journal={journal}
            canManage={canManage}
            onPost={handlePostJournal}
            onVoid={handleVoidJournal}
            onReverse={handleReverseJournal}
            isActionLoading={actionLoading}
          />

          {/* Audit Metadata */}
          <JournalAuditMetadata journal={journal} />
        </div>
      </div>
    </div>
  );
}

export default JournalDetailPage;
