import { useNavigate } from "react-router-dom";
import { 
  faReceipt, 
  faClipboardCheck, 
  faListCheck, 
  faTruckRampBox, 
  faHeadset 
} from "@fortawesome/free-solid-svg-icons";
import SearchSectionCard from "./SearchSectionCard";
import SearchResultRow from "./SearchResultRow";
import { renderSectionContent } from "./SearchUIState";
import { 
  donationStatusLabel, 
  formatCurrency, 
  formatDate, 
  badgeTone, 
  editorTaskStatusLabel, 
  editorTaskPriorityLabel, 
  formatDateTime, 
  pickupStatusLabel, 
  consultationStatusLabel 
} from "@/lib/search-utils";
import type { 
  LoadState, 
  Donation, 
  EditorTask, 
  PickupRequest, 
  Consultation 
} from "@/types/search";

type AdminSearchResultsProps = {
  donationsState: LoadState<Donation>;
  donationConfirmationsState: LoadState<Donation>;
  editorTasksState: LoadState<EditorTask>;
  pickupRequestsState: LoadState<PickupRequest>;
  consultationsState: LoadState<Consultation>;
};

export default function AdminSearchResults({
  donationsState,
  donationConfirmationsState,
  editorTasksState,
  pickupRequestsState,
  consultationsState,
}: AdminSearchResultsProps) {
  const navigate = useNavigate();

  return (
    <>
      <SearchSectionCard
        category="Operasional"
        title="Donasi"
        description="Hasil paling relevan dari data donasi."
        count={donationsState.total}
        icon={faReceipt}
        tone="red"
      >
        {renderSectionContent(donationsState, "Tidak ada donasi yang cocok.", (item) => {
          const code = String(item.donation_code ?? "").trim() || `#${item.id}`;
          const donor = String(item.donor_name ?? "").trim() || "Anonim";
          const programTitle = String(item.program?.title ?? "").trim() || "Tanpa program";
          const status = donationStatusLabel(String(item.status ?? ""));
          const when = item.paid_at ?? item.created_at;
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            <span key="amount" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              {formatCurrency(item.amount)}
            </span>,
          ];
          return (
            <SearchResultRow
              key={item.id}
              title={code}
              subtitle={`${donor} - ${programTitle}`}
              icon={faReceipt}
              tone="red"
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(when)}</span>}
              onClick={() => navigate(`/admin/donations/${item.id}`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Operasional"
        title="Konfirmasi Donasi"
        description="Transfer manual yang membutuhkan verifikasi."
        count={donationConfirmationsState.total}
        icon={faClipboardCheck}
        tone="amber"
      >
        {renderSectionContent(donationConfirmationsState, "Tidak ada konfirmasi donasi yang cocok.", (item) => {
          const code = String(item.donation_code ?? "").trim() || `#${item.id}`;
          const donor = String(item.donor_name ?? "").trim() || "Anonim";
          const status = donationStatusLabel(String(item.status ?? ""));
          const when = item.paid_at ?? item.created_at;
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            <span key="amount" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              {formatCurrency(item.amount)}
            </span>,
            <span key="manual" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Manual
            </span>,
          ];
          return (
            <SearchResultRow
              key={item.id}
              title={code}
              subtitle={`Transfer manual - ${donor}`}
              icon={faClipboardCheck}
              tone="amber"
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Dikirim: {formatDate(when)}</span>}
              onClick={() => navigate(`/admin/donations/${item.id}`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Operasional"
        title="Tugas Editor"
        description="Instruksi dan lampiran untuk editor."
        count={editorTasksState.total}
        icon={faListCheck}
        tone="primary"
      >
        {renderSectionContent(editorTasksState, "Tidak ada tugas editor yang cocok.", (item) => {
          const status = editorTaskStatusLabel(String(item.status ?? ""));
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            <span key="priority" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Prioritas: {editorTaskPriorityLabel(String(item.priority ?? ""))}
            </span>,
            <span key="due" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Tenggat: {formatDateTime(item.due_at)}
            </span>,
          ];
          return (
            <SearchResultRow
              key={item.id}
              title={item.title ?? "Tugas tanpa judul"}
              subtitle={item.description}
              icon={faListCheck}
              tone="primary"
              metaLeft={meta}
              metaRight={
                <span className="text-[11px] font-semibold text-slate-500">
                  Editor: {item.assignee?.name ?? "Semua Editor"}
                </span>
              }
              onClick={() => navigate(`/admin/editor-tasks`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Operasional"
        title="Jemput Wakaf"
        description="Permintaan jemput wakaf terbaru."
        count={pickupRequestsState.total}
        icon={faTruckRampBox}
        tone="green"
      >
        {renderSectionContent(pickupRequestsState, "Tidak ada permintaan jemput yang cocok.", (item) => {
          const status = pickupStatusLabel(String(item.status ?? ""));
          const location = [item.city, item.district].filter(Boolean).join(", ");
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            <span key="type" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Jenis: {item.zakat_type ?? "-"}
            </span>,
            <span key="phone" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Kontak: {item.donor_phone ?? "-"}
            </span>,
          ];
          return (
            <SearchResultRow
              key={item.id}
              title={item.donor_name ?? "Pemohon"}
              subtitle={location || null}
              icon={faTruckRampBox}
              tone="green"
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDateTime(item.created_at)}</span>}
              onClick={() => navigate(`/admin/pickup-requests/${item.id}`)}
            />
          );
        })}
      </SearchSectionCard>

      <SearchSectionCard
        category="Operasional"
        title="Konsultasi"
        description="Pertanyaan dan tindak lanjut konsultasi."
        count={consultationsState.total}
        icon={faHeadset}
        tone="sky"
      >
        {renderSectionContent(consultationsState, "Tidak ada konsultasi yang cocok.", (item) => {
          const status = consultationStatusLabel(String(item.status ?? ""));
          const contact = item.phone ?? item.email ?? "-";
          const meta = [
            <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
              {status.label}
            </span>,
            <span key="contact" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Kontak: {contact}
            </span>,
          ];
          return (
            <SearchResultRow
              key={item.id}
              title={item.name ?? "Pemohon"}
              subtitle={item.topic ?? item.message ?? null}
              icon={faHeadset}
              tone="sky"
              metaLeft={meta}
              metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDateTime(item.created_at)}</span>}
              onClick={() => navigate(`/admin/consultations/${item.id}`)}
            />
          );
        })}
      </SearchSectionCard>
    </>
  );
}
