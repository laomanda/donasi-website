import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCheckCircle, 
    faTimesCircle, 
    faCreditCard,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";

interface PaymentStatusOverlaysProps {
    showSuccessOverlay: boolean;
    setShowSuccessOverlay: (val: boolean) => void;
    showFailedOverlay: boolean;
    setShowFailedOverlay: (val: boolean) => void;
    showDanaConfirm: boolean;
    setShowDanaConfirm: (val: boolean) => void;
    showPendingBanner: boolean;
    setShowPendingBanner: (val: boolean) => void;
    checkingPayment: boolean;
    onCheckPaymentStatus: () => void;
    t: (key: string, fallback?: string) => string;
}

export const PaymentStatusOverlays = ({
    showSuccessOverlay,
    setShowSuccessOverlay,
    showFailedOverlay,
    setShowFailedOverlay,
    showDanaConfirm,
    setShowDanaConfirm,
    showPendingBanner,
    setShowPendingBanner,
    checkingPayment,
    onCheckPaymentStatus,
    t
}: PaymentStatusOverlaysProps) => {
    return (
        <>
            {/* SUCCESS OVERLAY */}
            <AnimatePresence>
                {showSuccessOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 280, damping: 22 }}
                            className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
                        >
                            <div className="mb-4 flex items-center justify-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brandGreen-100">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-brandGreen-600" />
                                </div>
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-slate-900">
                                🎉 {t("donate.success.overlay.title", "Donasi Berhasil!")}
                            </h2>
                            <p className="mb-1 text-base text-slate-600">
                                {t("donate.success.overlay.desc", "Pembayaran Anda telah diterima dan sedang diverifikasi.")}
                            </p>
                            <p className="mb-6 text-sm text-slate-400">
                                {t("donate.success.overlay.sub", "Terima kasih atas kebaikan Anda. Semoga menjadi amal jariyah.")}
                            </p>
                            <button
                                onClick={() => setShowSuccessOverlay(false)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brandGreen-700"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                {t("donate.success.overlay.btn", "Oke, Terima Kasih!")}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAILED OVERLAY */}
            <AnimatePresence>
                {showFailedOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 280, damping: 22 }}
                            className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
                        >
                            <div className="mb-4 flex items-center justify-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                                    <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-500" />
                                </div>
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-slate-900">
                                ❌ {t("donate.failed.overlay.title", "Transaksi Gagal")}
                            </h2>
                            <p className="mb-1 text-base text-slate-600">
                                {t("donate.failed.overlay.desc", "Pembayaran tidak diselesaikan. Transaksi dibatalkan.")}
                            </p>
                            <p className="mb-6 text-sm text-slate-400">
                                {t("donate.failed.overlay.sub", "Silakan coba lagi jika Anda masih ingin berdonasi.")}
                            </p>
                            <button
                                onClick={() => setShowFailedOverlay(false)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-600"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                                {t("donate.failed.overlay.btn", "Tutup")}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DANA / E-WALLET CONFIRM DIALOG */}
            <AnimatePresence>
                {showDanaConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
                        >
                            <div className="mb-3 flex items-center justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-blue-600" />
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-slate-900">Verifikasi Pembayaran</h3>
                            <p className="mb-5 text-sm text-slate-600 leading-relaxed">
                                Apakah Anda sudah berhasil menyelesaikan pembayaran melalui <strong>Dana / GoPay</strong>?
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        setShowDanaConfirm(false);
                                        onCheckPaymentStatus();
                                    }}
                                    disabled={checkingPayment}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brandGreen-700 disabled:opacity-50"
                                >
                                    {checkingPayment ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                                    Ya, Sudah Bayar
                                </button>
                                <button
                                    onClick={() => setShowDanaConfirm(false)}
                                    className="w-full rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-200"
                                >
                                    Belum / Batal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PENDING / WAITING STATUS BANNER */}
            <AnimatePresence>
                {showPendingBanner && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 left-1/2 z-[50] w-full max-w-xs -translate-x-1/2 px-4 md:max-w-md lg:max-w-lg"
                    >
                        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur-md border border-brandGreen-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-brandGreen-50">
                                    <FontAwesomeIcon icon={faSpinner} spin className="text-brandGreen-500" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">Menunggu Pembayaran</h4>
                                    <p className="text-[10px] text-slate-500">Selesaikan pembayaran Anda segera.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                                <button
                                    onClick={onCheckPaymentStatus}
                                    disabled={checkingPayment}
                                    className="rounded-lg bg-brandGreen-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:opacity-50"
                                >
                                    {checkingPayment ? <FontAwesomeIcon icon={faSpinner} spin /> : "Cek Status"}
                                </button>
                                <button
                                    onClick={() => setShowPendingBanner(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} className="text-sm" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
