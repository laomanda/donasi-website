import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLayerGroup, 
  faArrowRight 
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import type { 
  Program, 
  Donation, 
  ProgramUpdate 
} from "../ProgramShared";
import { 
  getStatusLabel, 
  formatDate, 
  getExcerptParagraph, 
  formatCurrency 
} from "../ProgramShared";
import { sanitizeHtml } from "../../../lib/sanitize";

interface ProgramDetailInfoProps {
  program: Program;
  localizedProgram: any;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  activeTab: "detail" | "updates" | "donors";
  setActiveTab: (tab: "detail" | "updates" | "donors") => void;
  recentDonations: Donation[];
  filteredDonations: Donation[];
  latestUpdates: ProgramUpdate[];
  donorQuery: string;
  setDonorQuery: (query: string) => void;
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
  donorQuery,
  setDonorQuery
}: ProgramDetailInfoProps) {
  
  const benefits = (localizedProgram?.benefits ?? "")
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  const rawDescription = localizedProgram?.description ?? localizedProgram?.short_description ?? "";
  const isProbablyHtml = /<\/?(p|div|span|h1|h2|h3|h4|ul|ol|li|br|strong|em|img|a|blockquote)\b/i.test(rawDescription);
  const contentHtml = isProbablyHtml ? sanitizeHtml(rawDescription) : sanitizeHtml(rawDescription.replace(/\n/g, "<br/>"));

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
            <FontAwesomeIcon icon={faLayerGroup} className="text-orange-500" />
            {localizedProgram?.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            {getStatusLabel(program?.status, t, program?.published_at, program?.deadline_days)}
          </span>
          {program?.is_highlight ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Highlight
            </span>
          ) : null}
        </div>
        <div className="mt-4 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
            {locale === "en" ? "Program date" : "Tanggal program"}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {formatDate(program?.published_at ?? program?.created_at, locale)}
          </span>
        </div>

        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {localizedProgram?.title ?? ""}
        </h1>

        {localizedProgram?.short_description ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
            {localizedProgram.short_description}
          </p>
        ) : null}
      </div>

      {/* Tabs Section */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-3 text-sm font-semibold">
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
            <span className="ml-2 inline-flex min-w-[26px] items-center justify-center rounded-full bg-brandGreen-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {recentDonations?.length ?? 0}
            </span>
          </button>
        </div>

        {activeTab === "detail" && (
          <div className="mt-5">
            <div
              className={[
                "break-words text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8",
                "[&_h1]:text-2xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-6",
                "[&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6",
                "[&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5",
                "[&_p]:mt-4 [&_p]:text-slate-700 [&_strong]:text-slate-900",
                "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5",
                "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5",
                "[&_li]:mt-1 [&_li]:text-slate-700",
                "[&_a]:text-primary-700 [&_a]:font-semibold hover:[&_a]:text-primary-800",
                "[&_blockquote]:mt-5 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-slate-200 [&_blockquote]:bg-slate-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-slate-700",
                "[&_img]:my-6 [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:ring-1 [&_img]:ring-slate-200",
              ].join(" ")}
              {...(isProbablyHtml ? { dangerouslySetInnerHTML: { __html: contentHtml } } : {})}
            >
              {isProbablyHtml ? null : <div className="whitespace-pre-wrap">{rawDescription}</div>}
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
              filteredDonations.map((don) => (
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
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500">
                {recentDonations.length === 0
                  ? "Belum ada donatur untuk program ini."
                  : "Tidak ada donatur yang cocok."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
