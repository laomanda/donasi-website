import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../ui/ToastProvider";

type WhatsappConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  donationId: number | null;
  donorName: string;
  donorPhone: string | null;
  amount: number | string;
  programTitle: string;
  donationCode: string;
  onSuccess?: () => void;
};

export default function WhatsappConfirmationModal({
  isOpen,
  onClose,
  donationId,
  donorName,
  donorPhone,
  amount,
  programTitle,
  donationCode,
  onSuccess,
}: WhatsappConfirmationModalProps) {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Format currency
  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  // Generate default message when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhone(donorPhone || "");
      const defaultMessage = `Assalamu'alaikum Kak *${donorName}*,\n\nAlhamdulillah, donasi sebesar *${formatCurrency(amount)}* untuk program *${programTitle}* telah kami terima.\n\nTerima kasih atas kepercayaannya. Semoga menjadi amal jariyah yang berkah.\n\nRef: _${donationCode}_`;
      setMessage(defaultMessage);
    }
  }, [isOpen, donorName, donorPhone, amount, programTitle, donationCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationId) return;

    setLoading(true);
    try {
      // 1. Format Phone Number (Ensure it starts with 62)
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "62" + formattedPhone.slice(1);
      }

      // 2. Open WhatsApp in New Tab
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");

      // 3. Update Backend Status (Mark as Sent)
      await http.post(`/admin/donations/${donationId}/send-whatsapp`, {
        phone, // Send original phone for logging
        message, // Send message for logging
        is_manual_link: true, // Flag for backend
      });

      toast.success("WhatsApp dibuka! Status diperbarui.", { title: "Berhasil" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("Gagal memperbarui status.", { title: "Error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-6 py-4">
                  <Dialog.Title
                    as="h3"
                    className="flex items-center gap-2 text-lg font-bold leading-6 text-emerald-900"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                    Kirim WhatsApp Manual
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 transition hover:text-slate-500"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nomor WhatsApp Donatur
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pesan
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                    <p className="mt-2 text-[10px] text-slate-500">
                      *Klik "Lanjut ke WhatsApp" untuk membuka aplikasi WA dan mengirim pesan ini.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                      disabled={loading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faWhatsapp} />
                          Lanjut ke WhatsApp
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
