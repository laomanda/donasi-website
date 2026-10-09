import { useMemo } from "react";
import { formatArticleContentHtml } from "../../../lib/articleContent";

interface LiterasiDetailContentProps {
  body?: string | null;
  excerpt?: string | null;
}

export function LiterasiDetailContent({ body, excerpt }: LiterasiDetailContentProps) {
  const rawContent = useMemo(() => {
    return String(body ?? excerpt ?? "");
  }, [body, excerpt]);

  const contentHtml = useMemo(() => {
    return formatArticleContentHtml(rawContent);
  }, [rawContent]);



  return (
    <div
      className={[
        "mt-6 sm:mt-8 min-w-0 max-w-full overflow-hidden [overflow-wrap:anywhere] break-words",
        // Ukuran font standar normal sebuah berita (14px di mobile, 15px di desktop, leading 1.8x nyaman dibaca)
        "text-sm sm:text-[15px] leading-[1.8] sm:leading-[1.8] text-slate-700",
        // Paragraf berita
        "[&_p]:mb-4 sm:[&_p]:mb-5 [&_p]:leading-[1.8] [&_p]:text-slate-700",
        "[&_strong]:font-semibold [&_strong]:text-slate-900",
        // Sub-heading di dalam isi berita
        "[&_h1]:text-xl sm:[&_h1]:text-2xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-7 [&_h1]:mb-3 [&_h1]:break-words [&_h1]:[overflow-wrap:anywhere]",
        "[&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h2]:break-words [&_h2]:[overflow-wrap:anywhere]",
        "[&_h3]:text-base sm:[&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:break-words [&_h3]:[overflow-wrap:anywhere]",
        // List styling
        "[&_ul]:my-4 [&_ul]:pl-5 [&_ul]:list-disc",
        "[&_ol]:my-4 [&_ol]:pl-5 [&_ol]:list-decimal",
        "[&_li]:mb-1.5 [&_li]:text-slate-700 [&_li]:leading-[1.75]",
        // Tautan tautan
        "[&_a]:text-brandGreen-700 [&_a]:font-semibold hover:[&_a]:text-brandGreen-800 hover:[&_a]:underline [&_a]:break-all [&_a]:[overflow-wrap:anywhere]",
        // Kutipan / Blockquote
        "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brandGreen-500 [&_blockquote]:bg-slate-50/70 [&_blockquote]:px-5 [&_blockquote]:py-3.5 [&_blockquote]:rounded-r-xl [&_blockquote]:text-slate-700 [&_blockquote]:italic",
        // Foto di dalam isi artikel: proporsional, rapi, tidak raksasa, border bersih
        "[&_img]:my-6 sm:[&_img]:my-8 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:max-h-[460px] [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200/80 [&_img]:shadow-xs [&_img]:object-contain sm:[&_img]:object-cover [&_img]:bg-slate-50",
        // Figure & Figcaption pendukung
        "[&_figure]:my-6 sm:[&_figure]:my-8 [&_figure]:mx-auto [&_figure]:text-center",
        "[&_figcaption]:mt-2 [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_figcaption]:italic [&_figcaption]:text-center",
        // Media video & iframe
        "[&_video]:my-6 [&_video]:block [&_video]:w-full [&_video]:max-w-full [&_video]:max-h-[460px] [&_video]:rounded-xl [&_video]:shadow-sm [&_video]:bg-black",
        "[&_iframe]:my-6 [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:shadow-sm",
        // Tabel
        "[&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:my-6 [&_table]:border-collapse",
        "[&_th]:p-2.5 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:text-left [&_th]:text-xs sm:[&_th]:text-sm [&_th]:font-bold [&_th]:break-words",
        "[&_td]:p-2.5 [&_td]:border [&_td]:border-slate-200 [&_td]:text-xs sm:[&_td]:text-sm [&_td]:break-words",
        // Code
        "[&_pre]:my-6 [&_pre]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_pre]:text-xs sm:[&_pre]:text-sm",
        "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs sm:[&_code]:text-sm [&_code]:text-primary-700 [&_code]:break-words",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}

