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
        "mt-6 sm:mt-8 text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8 min-w-0 max-w-full overflow-hidden [overflow-wrap:anywhere] break-words",
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
        "[&_video]:my-6 [&_video]:block [&_video]:w-full [&_video]:max-w-full [&_video]:max-h-[500px] [&_video]:rounded-2xl [&_video]:shadow-md [&_video]:bg-black",
        "[&_iframe]:my-6 [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-md",
        "[&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:my-6 [&_table]:border-collapse",
        "[&_th]:p-2.5 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:text-left [&_th]:text-xs sm:[&_th]:text-sm [&_th]:font-bold [&_th]:break-words",
        "[&_td]:p-2.5 [&_td]:border [&_td]:border-slate-200 [&_td]:text-xs sm:[&_td]:text-sm [&_td]:break-words",
        "[&_pre]:my-6 [&_pre]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_pre]:text-xs sm:[&_pre]:text-sm",
        "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs sm:[&_code]:text-sm [&_code]:text-primary-700 [&_code]:break-words",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}

