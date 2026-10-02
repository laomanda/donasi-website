import React from "react";
import type { JournalEntry } from "@/types/finance";
import { formatFinanceDate } from "@/utils/financeUtils";
import { JournalStatusBadge } from "./JournalStatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faFolderOpen,
  faHashtag,
  faProjectDiagram,
  faShieldHalved,
  faBan,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

interface JournalDetailOverviewProps {
  journal: JournalEntry;
}

export const JournalDetailOverview: React.FC<JournalDetailOverviewProps> = ({ journal }) => {
  return (
    <div className="space-y-4">
      {/* Top Identity Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Nomor Jurnal
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {journal.journal_number}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <JournalStatusBadge status={journal.status} />
          </div>
        </div>

        {/* 4-Column Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tanggal Transaksi */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faCalendarDay} className="text-slate-400" />
              <span>Tanggal Transaksi</span>
            </div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">
              {formatFinanceDate(journal.transaction_date || journal.date)}
            </div>
          </div>

          {/* Periode Akuntansi */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faFolderOpen} className="text-slate-400" />
              <span>Periode Akuntansi</span>
            </div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">
              {journal.accounting_period?.name || `ID #${journal.accounting_period_id || "—"}`}
            </div>
          </div>

          {/* Program Terkait */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faProjectDiagram} className="text-slate-400" />
              <span>Program</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs truncate">
              {journal.program ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brandBlueTeal-500 text-white font-bold text-[11px]">
                  {journal.program.title}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>

          {/* Referensi Transaksi */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faHashtag} className="text-slate-400" />
              <span>Referensi</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs truncate">
              {journal.reference_type
                ? `${journal.reference_type}${journal.reference_id ? ` #${journal.reference_id}` : ""}`
                : "—"}
            </div>
          </div>
        </div>

        {/* Deskripsi / Keterangan */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Keterangan Transaksi:
          </div>
          <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
            {journal.description || "Tidak ada keterangan tambahan."}
          </p>
        </div>
      </div>

      {/* Accounting Notice Banners (Solid & Neutral surfaces, no pastel wash) */}
      {journal.status === "posted" && (
        <div className="flex items-start gap-3 rounded-2xl border-l-4 border-l-brandGreen-500 border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-xs">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brandGreen-500 text-white">
            <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">
              Jurnal telah diposting ke Buku Besar (Immutable)
            </span>
            <p className="text-slate-600 leading-normal">
              Demi kepatuhan standar akuntansi dan integritas audit trail, jurnal ini berstatus <em>terkunci</em> (tidak dapat diubah atau dihapus secara langsung). Koreksi saldo dilakukan melalui prosedur Jurnal Pembalik (Reverse).
            </p>
          </div>
        </div>
      )}

      {journal.status === "draft" && (
        <div className="flex items-start gap-3 rounded-2xl border-l-4 border-l-brandWarmOrange-500 border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-xs">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brandWarmOrange-500 text-white">
            <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">
              Status Draft (Belum Diposting)
            </span>
            <p className="text-slate-600 leading-normal">
              Transaksi ini belum mempengaruhi saldo Buku Besar maupun Laporan Keuangan yayasan. Pengguna berwenang dapat memposting jurnal ini untuk membukukannya secara resmi atau membatalkannya (Void).
            </p>
          </div>
        </div>
      )}

      {journal.status === "void" && (
        <div className="flex items-start gap-3 rounded-2xl border-l-4 border-l-slate-700 border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-xs">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-white">
            <FontAwesomeIcon icon={faBan} className="text-xs" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">
              Status Void (Dibatalkan)
            </span>
            <p className="text-slate-600 leading-normal">
              Jurnal ini telah dibatalkan secara permanen. Transaksi tidak diikutsertakan dalam kalkulasi saldo Buku Besar yayasan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
