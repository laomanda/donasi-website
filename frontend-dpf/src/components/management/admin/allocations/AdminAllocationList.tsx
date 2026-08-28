import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faCoins } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import type { Allocation } from "@/types/allocation";
import { resolveStorageUrl } from "@/lib/urls";

type AdminAllocationListProps = {
    allocations: Allocation[];
    loading: boolean;
    formatDate: (val: string) => string;
    formatCurrency: (val: number) => string;
};

export default function AdminAllocationList({
    allocations,
    loading,
    formatDate,
    formatCurrency,
}: AdminAllocationListProps) {
    const getWhatsappUrl = (
        phone?: string | null,
        name?: string,
        amount?: number,
        description?: string,
        program?: string,
        proofPath?: string | null,
    ) => {
        if (!phone) return null;
        const cleanPhone = phone.replace(/\D/g, "");
        if (!cleanPhone) return null;
        let formattedPhone = cleanPhone;
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "62" + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith("62")) {
            formattedPhone = "62" + formattedPhone;
        }

        const proofUrl = proofPath ? resolveStorageUrl(proofPath) : null;
        const text = `Assalamu'alaikum Wr. Wb.\n\nYth. Bapak/Ibu *${name || "Donatur"}*,\n\nTerima kasih atas kebaikan dan donasi wakaf Anda pada program *${program || "Wakaf Umum"}*.\n\nBerikut kami sampaikan laporan penyaluran dana wakaf Anda:\n- Nominal Penyaluran: *Rp ${new Intl.NumberFormat("id-ID").format(amount || 0)}*\n- Keperluan/Tujuan: *${description || "-"}*\n${proofUrl ? `- Bukti Foto Penyaluran: ${proofUrl}\n` : ""}\nSemoga menjadi pembersih harta dan pahala jariyah yang senantiasa mengalir. Syukron jazakumullah khairan.\n\n— *Djalaludin Pane Foundation (DPF)*`;

        return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="lg:hidden divide-y divide-slate-100">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 space-y-4 animate-pulse">
                        <div className="flex justify-between">
                            <div className="h-4 w-24 rounded bg-slate-100" />
                            <div className="h-4 w-20 rounded bg-slate-100" />
                        </div>
                        <div className="h-12 w-full rounded bg-slate-100" />
                        <div className="h-6 w-32 rounded bg-slate-100" />
                    </div>
                ))
            ) : allocations.length === 0 ? (
                <div className="p-12 text-center">
                    <p className="text-sm font-bold text-slate-900">
                        Tidak ada data ditemukan
                    </p>
                </div>
            ) : (
                allocations.map((alloc) => {
                    const isPublic = Boolean(alloc.donation);
                    const donorName = isPublic
                        ? alloc.donation?.donor_name || "Hamba Allah (Anonim)"
                        : alloc.user?.name || "Mitra Yayasan";
                    const donorEmail = isPublic
                        ? alloc.donation?.donor_email ||
                          alloc.donation?.donation_code
                        : alloc.user?.email;
                    const phone = isPublic
                        ? alloc.donation?.donor_phone
                        : alloc.user?.phone;

                    const programTitle =
                        alloc.program?.title ||
                        alloc.donation?.program?.title ||
                        "Program Umum";
                    const waUrl = getWhatsappUrl(
                        phone,
                        donorName,
                        alloc.amount,
                        alloc.description,
                        programTitle,
                        alloc.proof_path,
                    );

                    return (
                        <div
                            key={alloc.id}
                            className="p-6 space-y-4 active:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Waktu Transaksi
                                    </p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {formatDate(alloc.allocated_at || alloc.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {waUrl && (
                                        <a
                                            href={waUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm whitespace-nowrap"
                                            title="Kirim Laporan WA"
                                        >
                                            <FontAwesomeIcon
                                                icon={faWhatsapp}
                                                className="shrink-0"
                                            />
                                            <span className="whitespace-nowrap">
                                                Kirim WA
                                            </span>
                                        </a>
                                    )}

                                    {alloc.proof_path && (
                                        <a
                                            href={resolveStorageUrl(
                                                alloc.proof_path,
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shadow-sm"
                                        >
                                            <FontAwesomeIcon
                                                icon={faExternalLinkAlt}
                                            />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                    <FontAwesomeIcon
                                        icon={faCoins}
                                        className="text-lg"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-sm ${
                                                isPublic
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-600"
                                            }`}
                                        >
                                            {isPublic
                                                ? "Donatur Publik"
                                                : "Mitra Terdaftar"}
                                        </span>
                                    </div>
                                    <p className="font-bold text-slate-900 truncate">
                                        {donorName}
                                    </p>
                                    {donorEmail && (
                                        <p className="text-[11px] font-semibold text-slate-500 truncate">
                                            {donorEmail}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                        {alloc.description}
                                    </p>
                                    <span className="inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                        {programTitle}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Total Nominal
                                    </span>
                                    <span className="font-heading text-xl font-black text-rose-600">
                                        -{formatCurrency(alloc.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
