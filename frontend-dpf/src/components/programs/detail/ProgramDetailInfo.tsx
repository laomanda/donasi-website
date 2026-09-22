import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLayerGroup, 
  faArrowRight,
  faThumbtack,
  faImage
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import type { 
  Program, 
  Donation, 
  ProgramUpdate,
  ProgramAllocation 
} from "../ProgramShared";
import { 
  getStatusLabel, 
  formatDate, 
  getExcerptParagraph, 
  formatCurrency,
  getImageUrl
} from "../ProgramShared";
import { sanitizeHtml } from "../../../lib/sanitize";

interface ProgramDetailInfoProps {
  program: Program;
  localizedProgram: any;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  activeTab: "detail" | "updates" | "donors" | "allocations";
  setActiveTab: (tab: "detail" | "updates" | "donors" | "allocations") => void;
  recentDonations: Donation[];
  filteredDonations: Donation[];
  latestUpdates: ProgramUpdate[];
  allocations: ProgramAllocation[];
  filteredAllocations: ProgramAllocation[];
  totalAllocated: number;
  donorQuery: string;
  setDonorQuery: (query: string) => void;
  allocationQuery: string;
  setAllocationQuery: (query: string) => void;
}

export function ProgramDetailInfo({
  program,
  localizedProgram,
  locale,
  t,
  activeTab,
  setActiveTab,
  recentDonations,
  filteredDonations,
  latestUpdates,
  allocations,
  filteredAllocations,
  donorQuery,
  setDonorQuery,
  allocationQuery,
  setAllocationQuery
}: ProgramDetailInfoProps) {
  const [donorLimit, setDonorLimit] = useState(10);
  const [allocationLimit, setAllocationLimit] = useState(10);

  useEffect(() => {
    setDonorLimit(10);
  }, [donorQuery]);

  useEffect(() => {
    setAllocationLimit(10);
  }, [allocationQuery]);
  
  const benefits = (localizedProgram?.benefits ?? "")
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  const rawDescription = localizedProgram?.description ?? localizedProgram?.short_description ?? "";
  const isProbablyHtml = /<\/?(p|div|span|h1|h2|h3|h4|ul|ol|li|br|strong|em|img|video|source|a|blockquote)\b/i.test(rawDescription);
  const contentHtml = isProbablyHtml ? sanitizeHtml(rawDescription) : sanitizeHtml(rawDescription.replace(/\n/g, "<br/>"));

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 max-w-full">
      {/* Title Section */}
      <div className="rounded-2xl sm:rounded-[32px] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
            <FontAwesomeIcon icon={faLayerGroup} className="text-orange-500" />
            {localizedProgram?.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            {getStatusLabel(program?.status, t, program?.published_at, program?.deadline_days)}
          </span>
          {program?.is_highlight ? (
            <span 
              title={locale === "en" ? "Pinned" : "Disematkan"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-300 shadow-sm"
            >
              <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
            </span>
          ) : null}
        </div>
        <div className="mt-4 inline-flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-1.5 sm:px-4 sm:py-2 shadow-sm">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-2.5 sm:px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
            {locale === "en" ? "Published" : "Diterbitkan"}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-900">
            {formatDate(program?.published_at ?? program?.created_at, locale)}
          </span>
        </div>

        <h1 className="mt-4 sm:mt-5 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 break-words [overflow-wrap:anywhere]">
          {localizedProgram?.title ?? ""}
        </h1>

        {localizedProgram?.short_description ? (
          <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7 break-words [overflow-wrap:anywhere]">
            {localizedProgram.short_description}
          </p>
        ) : null}
      </div>

      {/* Tabs Section */}
      <div className="rounded-2xl sm:rounded-[32px] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 border-b border-slate-100 pb-3 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("detail")}
            className={`pb-2 transition ${activeTab === "detail" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
          >
            Detail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={`pb-2 transition ${activeTab === "updates" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
          >
            Kabar Terbaru
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("donors")}
            className={`relative pb-2 transition ${activeTab === "donors" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
          >
            Donatur
            <span className="ml-2 inline-flex min-w-[22px] sm:min-w-[26px] items-center justify-center rounded-full bg-brandGreen-600 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white">
              {recentDonations?.length ?? 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("allocations")}
            className={`relative pb-2 transition ${activeTab === "allocations" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
          >
            {locale === "en" ? "Disbursements" : "Penyaluran"}
            <span className="ml-2 inline-flex min-w-[22px] sm:min-w-[26px] items-center justify-center rounded-full bg-brandGreen-600 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white">
              {allocations?.length ?? 0}
            </span>
          </button>
        </div>

        {activeTab === "detail" && (
          <div className="mt-5">
            <div
              className={[
                "text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8 min-w-0 max-w-full overflow-hidden [overflow-wrap:anywhere] break-words",
                "[&_h1]:text-2xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-6 [&_h1]:break-words [&_h1]:[overflow-wrap:anywhere]",
                "[&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:break-words [&_h2]:[overflow-wrap:anywhere]",
                "[&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5 [&_h3]:break-words [&_h3]:[overflow-wrap:anywhere]",
                "[&_p]:mt-4 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_strong]:text-slate-900",
                "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5",
                "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5",
                "[&_li]:mt-1 [&_li]:text-slate-700",
                "[&_a]:text-primary-700 [&_a]:font-semibold hover:[&_a]:text-primary-800 [&_a]:break-all [&_a]:[overflow-wrap:anywhere]",
                "[&_blockquote]:mt-5 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-slate-200 [&_blockquote]:bg-slate-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-slate-700",
                "[&_img]:my-6 [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:ring-1 [&_img]:ring-slate-200 [&_img]:object-contain [&_img]:mx-auto",
                "[&_iframe]:my-6 [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-md",
                "[&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:my-6 [&_table]:border-collapse",
                "[&_th]:p-2.5 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:text-left [&_th]:text-xs sm:[&_th]:text-sm [&_th]:font-bold [&_th]:break-words",
                "[&_td]:p-2.5 [&_td]:border [&_td]:border-slate-200 [&_td]:text-xs sm:[&_td]:text-sm [&_td]:break-words",
                "[&_pre]:my-6 [&_pre]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_pre]:text-xs sm:[&_pre]:text-sm",
                "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs sm:[&_code]:text-sm [&_code]:text-primary-700 [&_code]:break-words",
              ].join(" ")}
              {...(isProbablyHtml ? { dangerouslySetInnerHTML: { __html: contentHtml } } : {})}
            >
              {isProbablyHtml ? null : <div className="whitespace-pre-wrap [overflow-wrap:anywhere] break-words">{rawDescription}</div>}
            </div>

            {benefits.length > 0 ? (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-sm font-bold text-slate-900">{locale === "en" ? "Benefits" : "Manfaat"}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {benefits.map((b: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="mt-5 space-y-4">
            {latestUpdates && latestUpdates.length > 0 ? (
              latestUpdates.map((u) => (
                <div
                  key={u.id}
                  className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-5 shadow-sm ring-1 ring-slate-50 hover:ring-slate-100 transition"
                >
                  <p className="text-base font-semibold text-slate-900">
                    {u.title ?? "Kabar terbaru"}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-500">
                    {formatDate(u.published_at, locale)}
                  </p>
                  {u.excerpt ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {getExcerptParagraph(u.excerpt)}
                    </p>
                  ) : null}
                  {u.slug ? (
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/articles/${u.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-brandGreen-700 transition hover:text-brandGreen-800"
                      >
                        Selengkapnya
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500">
                Belum ada kabar terbaru untuk program ini.
              </div>
            )}
          </div>
        )}

        {activeTab === "donors" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500">
                  Cari Donatur
                </span>
                <input
                  value={donorQuery}
                  onChange={(e) => setDonorQuery(e.target.value)}
                  placeholder="Ketik nama donatur..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                />
              </div>
            </div>
            {filteredDonations && filteredDonations.length > 0 ? (
              <>
                {filteredDonations.slice(0, donorLimit).map((don) => (
                  <div
                    key={don.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{don.donor_name || "Hamba Allah"}</p>
                      <p className="text-[11px] font-semibold text-slate-500">{formatDate(don.paid_at, locale)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-slate-500">Donasi</p>
                      <p className="text-base font-bold text-slate-900">{formatCurrency(don.amount, locale)}</p>
                    </div>
                  </div>
                ))}

                {filteredDonations.length > donorLimit && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setDonorLimit((prev) => prev + 10)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-brandGreen-500 hover:text-brandGreen-700 active:scale-[0.98]"
                    >
                      <span>{locale === "en" ? "Load More" : "Lebih Banyak"}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        +{Math.min(10, filteredDonations.length - donorLimit)}
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500">
                {recentDonations.length === 0
                  ? "Belum ada donatur untuk program ini."
                  : "Tidak ada donatur yang cocok."}
              </div>
            )}
          </div>
        )}

        {activeTab === "allocations" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500">
                  {locale === "en" ? "Search" : "Cari Penyaluran"}
                </span>
                <input
                  value={allocationQuery}
                  onChange={(e) => setAllocationQuery(e.target.value)}
                  placeholder={locale === "en" ? "Search distribution activities..." : "Ketik kegiatan / peruntukan penyaluran..."}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                />
              </div>
            </div>
            {filteredAllocations && filteredAllocations.length > 0 ? (
              <>
                {filteredAllocations.slice(0, allocationLimit).map((alloc) => (
                  <div
                    key={alloc.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{alloc.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold text-slate-500">
                          {formatDate(alloc.allocated_at ?? alloc.created_at, locale)}
                        </p>
                        {alloc.proof_path && (
                          <a
                            href={getImageUrl(alloc.proof_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition ring-1 ring-emerald-200/60"
                          >
                            <FontAwesomeIcon icon={faImage} className="text-[9px]" />
                            {locale === "en" ? "View Proof" : "Bukti Penyaluran"}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-semibold text-emerald-600">Disalurkan</p>
                      <p className="text-base font-bold text-slate-900">{formatCurrency(alloc.amount, locale)}</p>
                    </div>
                  </div>
                ))}

                {filteredAllocations.length > allocationLimit && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setAllocationLimit((prev) => prev + 10)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-brandGreen-500 hover:text-brandGreen-700 active:scale-[0.98]"
                    >
                      <span>{locale === "en" ? "Load More" : "Lebih Banyak"}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        +{Math.min(10, filteredAllocations.length - allocationLimit)}
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500">
                {allocations.length === 0
                  ? (locale === "en" ? "No distribution records yet for this program." : "Belum ada riwayat penyaluran untuk program ini.")
                  : (locale === "en" ? "No matching distribution records found." : "Tidak ada penyaluran yang cocok.")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
