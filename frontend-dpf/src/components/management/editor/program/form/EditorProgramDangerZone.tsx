import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

type Props = {
    onDelete: () => void;
    deleting: boolean;
    disabled?: boolean;
};

export default function EditorProgramDangerZone({ onDelete, deleting, disabled }: Props) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold tracking-wide text-red-600">Zona berbahaya</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Hapus program</h2>
            <p className="mt-2 text-sm text-slate-600">
                Program tidak bisa dihapus jika sudah memiliki donasi. Pastikan sebelum melanjutkan.
            </p>

            {!showConfirm ? (
                <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                    disabled={disabled}
                >
                    <FontAwesomeIcon icon={faTrash} />
                    Hapus Program
                </button>
            ) : (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                    <p className="mt-1 text-sm text-red-700">Klik "Ya, hapus" untuk melanjutkan.</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                            disabled={deleting}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={deleting}
                        >
                            {deleting ? "Menghapus..." : "Ya, hapus"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
