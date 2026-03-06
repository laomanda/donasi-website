import { useMemo } from "react";
import { sanitizeHtml } from "../../../lib/sanitize";

interface LiterasiDetailContentProps {
  body?: string | null;
  excerpt?: string | null;
}

export function LiterasiDetailContent({ body, excerpt }: LiterasiDetailContentProps) {
  const isProbablyHtml = useMemo(() => {
    const content = String(body ?? "");
    return /<\/?(p|div|span|h1|h2|h3|h4|ul|ol|li|br|strong|em|img|a|blockquote)\b/i.test(content);
  }, [body]);

  const rawContent = useMemo(() => {
    return String(body ?? excerpt ?? "");
  }, [body, excerpt]);

  const contentHtml = useMemo(() => {
    if (!rawContent) return "";
    if (isProbablyHtml) return sanitizeHtml(rawContent);
    return sanitizeHtml(rawContent.replace(/\n/g, "<br/>"));
  }, [isProbablyHtml, rawContent]);

  return (
    <div
      className={[
        "mt-8 break-words text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8",
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
      {isProbablyHtml ? null : <div className="whitespace-pre-wrap">{rawContent}</div>}
    </div>
  );
}
