import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import type { PickupRequest, PickupStatus } from "@/types/pickup";
import AdminPickupDetailInfo from "@/components/management/admin/pickups/AdminPickupDetailInfo";
import AdminPickupStatusControl from "@/components/management/admin/pickups/AdminPickupStatusControl";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusBorder = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "border-l-amber-500 text-amber-600 bg-amber-50/50";
  if (s === "dijadwalkan") return "border-l-blue-600 text-blue-700 bg-blue-50/50";
  if (s === "selesai") return "border-l-emerald-600 text-emerald-700 bg-emerald-50/50";
  if (s === "dibatalkan") return "border-l-rose-600 text-rose-700 bg-rose-50/50";
  return "border-l-slate-400 text-slate-600 bg-slate-50";
};

const getStatusLabel = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "Baru";
  if (s === "dijadwalkan") return "Dijadwalkan";
  if (s === "selesai") return "Selesai";
  if (s === "dibatalkan") return "Dibatalkan";
  return String(status || "-");
};

export function AdminPickupRequestShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [status, setStatus] = useState<PickupStatus>("baru");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await http.get<PickupRequest>(`/admin/pickup-requests/${id}`);
      setData(res.data);
      setStatus(res.data.status ?? "baru");
      setAssignedOfficer(res.data.assigned_officer ?? "");
      setNotes(res.data.notes ?? "");
    } catch {
      toast.error("Gagal memuat data permintaan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    try {
      await http.patch(`/admin/pickup-requests/${id}/status`, {
        status,
        assigned_officer: assignedOfficer,
        notes,
      });
      toast.success("Berhasil memperbarui data.");
      void fetchData();
      window.dispatchEvent(new Event("refresh-badges"));
    } catch {
      toast.error("Gagal memperbarui data.");
    } finally {
      setSaving(false);
    }
  };

  const isLockedStatus = data?.status === "selesai" || data?.status === "dibatalkan";
  const canSave = !loading && !saving;
  const canEditDetails = !isLockedStatus;

  const statusOptions = [
    { value: "baru", label: "Baru", disabled: isLockedStatus },
    { value: "dijadwalkan", label: "Dijadwalkan", disabled: isLockedStatus },
    { value: "selesai", label: "Selesai (Kunci Data)", disabled: false },
    { value: "dibatalkan", label: "Dibatalkan (Kunci Data)", disabled: false },
  ];

  const sendWa = () => {
    if (!data?.donor_phone) return;
    const phone = data.donor_phone.replace(/\D/g, "");
    const cleanPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
    const msg = encodeURIComponent(
      `Halo Bapak/Ibu ${data.donor_name}, perkenalkan kami dari DPF (Dompet Peduli Fauziah). ` +
      `Terkait permintaan jemput wakaf Anda, mohon info titik lokasinya ya Pak/Bu agar kami teruskan ke petugas.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-sm font-bold text-slate-500 transition hover:text-emerald-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:bg-emerald-50 group-hover:ring-emerald-200">
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          Kembali
        </button>

        <button
          onClick={sendWa}
          className="group flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-600 shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-600 hover:text-white hover:ring-emerald-600"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
          Hubungi Donatur
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminPickupDetailInfo
            data={data}
            loading={loading}
            getStatusBorder={getStatusBorder}
            getStatusLabel={getStatusLabel}
            formatDateTime={formatDateTime}
          />
        </div>

        <div className="lg:col-span-1">
          <AdminPickupStatusControl
            status={status}
            setStatus={setStatus}
            statusOptions={statusOptions}
            assignedOfficer={assignedOfficer}
            setAssignedOfficer={setAssignedOfficer}
            notes={notes}
            setNotes={setNotes}
            canSave={canSave}
            isLockedStatus={isLockedStatus}
            canEditDetails={canEditDetails}
            saving={saving}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminPickupRequestShowPage;
