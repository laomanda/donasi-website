import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import type { Allocation } from "@/types/allocation";
import { resolveStorageUrl } from "@/lib/urls";

type AdminAllocationTableProps = {
    allocations: Allocation[];
    loading: boolean;
    formatDate: (val: string) => string;
    formatCurrency: (val: number) => string;
};

export default function AdminAllocationTable({
    allocations,
    loading,
    formatDate,
    formatCurrency,
}: AdminAllocationTableProps) {
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
        <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Waktu & Tanggal
                        </th>
                        <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Sumber Donatur / Mitra
                        </th>
                        <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Detail Penggunaan
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Nominal
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Aksi & Bukti
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-5 py-3.5">
                                    <div className="h-3.5 w-20 rounded bg-slate-100" />
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="h-8 w-36 rounded bg-slate-100" />
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="h-8 w-44 rounded bg-slate-100" />
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="h-5 w-20 rounded bg-slate-100 ml-auto" />
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="h-7 w-16 rounded bg-slate-100 mx-auto" />
                                </td>
                            </tr>
                        ))
                    ) : allocations.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-5 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300 mb-3">
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        className="text-lg"
                                    />
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                    Tidak ada data ditemukan
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Coba sesuaikan kata kunci pencarian Anda.
                                </p>
                            </td>
                        </tr>
                    ) : (
                        allocations.map((alloc) => {
                            const isPublic = Boolean(alloc.donation);
                            const donorName = isPublic
                                ? alloc.donation?.donor_name ||
                                  "Hamba Allah (Anonim)"
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
                                <tr
                                    key={alloc.id}
                                    className="group transition hover:bg-slate-50/70"
                                >
                                    <td className="px-5 py-3.5 align-top">
                                        <p className="text-xs font-semibold text-slate-800">
                                            {
                                                formatDate(
                                                    alloc.allocated_at || alloc.created_at,
                                                ).split(",")[0]
                                            }
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {
                                                formatDate(
                                                    alloc.allocated_at || alloc.created_at,
                                                ).split(",")[1]
                                            }
                                        </p>
                                    </td>
                                    <td className="px-5 py-3.5 align-top">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs ${
                                                        isPublic
                                                            ? "bg-amber-500"
                                                            : "bg-brandGreen-600"
                                                    }`}
                                                >
                                                    {isPublic
                                                        ? "Donatur Publik"
                                                        : "Mitra Terdaftar"}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {donorName}
                                            </p>
                                            {donorEmail && (
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {donorEmail}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 align-top">
                                        <p className="text-xs font-medium text-slate-800 line-clamp-1">
                                            {alloc.description}
                                        </p>
                                        <span className="mt-1 inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                                            {programTitle}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right align-top">
                                        <p className="font-heading text-sm font-bold text-rose-600">
                                            -{formatCurrency(alloc.amount)}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap align-top">
                                        <div className="flex items-center justify-center gap-2">
                                            {waUrl && (
                                                <a
                                                    href={waUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 whitespace-nowrap"
                                                    title="Kirim Laporan via WhatsApp"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faWhatsapp}
                                                        className="text-xs shrink-0"
                                                    />
                                                    <span>
                                                        Kirim WA
                                                    </span>
                                                </a>
                                            )}

                                            {alloc.proof_path ? (
                                                <a
                                                    href={resolveStorageUrl(
                                                        alloc.proof_path,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                                    title="Buka Bukti Penyaluran"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faExternalLinkAlt}
                                                        className="text-xs"
                                                    />
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 italic">
                                                    -
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
