import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
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
    proofPath?: string | null
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
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Waktu & Tanggal</th>
            <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Sumber Donatur / Mitra</th>
            <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Detail Penggunaan</th>
            <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nominal</th>
            <th className="px-8 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Aksi & Bukti</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-8 py-6">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-10 w-40 rounded bg-slate-100" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-10 w-48 rounded bg-slate-100" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-6 w-24 rounded bg-slate-100 ml-auto" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-8 w-8 rounded bg-slate-100 mx-auto" />
                </td>
              </tr>
            ))
          ) : allocations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
                  <FontAwesomeIcon icon={faMagnifyingGlass} size="xl" />
                </div>
                <p className="text-sm font-bold text-slate-900">Tidak ada data ditemukan</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
              </td>
            </tr>
          ) : (
            allocations.map((alloc) => {
              const isPublic = Boolean(alloc.donation);
              const donorName = isPublic
                ? alloc.donation?.donor_name || "Hamba Allah (Anonim)"
                : alloc.user?.name || "Mitra Yayasan";
              const donorEmail = isPublic
                ? alloc.donation?.donor_email || alloc.donation?.donation_code
                : alloc.user?.email;
              const phone = isPublic
                ? alloc.donation?.donor_phone
                : alloc.user?.phone;

              const programTitle = alloc.program?.title || alloc.donation?.program?.title || "Program Umum";
              const waUrl = getWhatsappUrl(phone, donorName, alloc.amount, alloc.description, programTitle, alloc.proof_path);

              return (
                <tr key={alloc.id} className="group transition hover:bg-slate-50/80">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{formatDate(alloc.created_at).split(",")[0]}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{formatDate(alloc.created_at).split(",")[1]}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm ${
                          isPublic ? "bg-amber-500" : "bg-emerald-600"
                        }`}>
                          {isPublic ? "Donatur Publik" : "Mitra Terdaftar"}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 truncate">{donorName}</p>
                      {donorEmail && <p className="text-xs font-semibold text-slate-500 truncate">{donorEmail}</p>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="line-clamp-1 font-bold text-slate-900">{alloc.description}</p>
                    <span className="mt-1.5 inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {programTitle}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="font-heading text-lg font-bold text-rose-600">
                      -{formatCurrency(alloc.amount)}
                    </p>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md whitespace-nowrap"
                          title="Kirim Laporan via WhatsApp"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} className="text-sm shrink-0" />
                          <span className="whitespace-nowrap">Kirim WA</span>
                        </a>
                      )}

                      {alloc.proof_path ? (
                        <a
                          href={resolveStorageUrl(alloc.proof_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-emerald-600 hover:shadow-md"
                          title="Buka Bukti Penyaluran"
                        >
                          <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-slate-300 italic tracking-widest">
                          No File
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
