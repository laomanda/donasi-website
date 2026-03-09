import { faTag, faClock, faUser, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { InfoBadge, type BadgeTone } from "./ArticlePreviewUI";

type Props = {
  category: string;
  categoryLabel: string;
  publishLabel: string;
  publishedLabel: string;
  author: string;
  authorLabel: string;
  statusLabel: string;
  statusText: string;
  statusTone: BadgeTone;
  title: string;
  excerpt?: string | null;
  contentHtml: string;
  isProbablyHtml: boolean;
  rawContent: string;
  emptyContentLabel: string;
};

export default function ArticlePreviewContent({
  category,
  categoryLabel,
  publishLabel,
  publishedLabel,
  author,
  authorLabel,
  statusLabel,
  statusText,
  statusTone,
  title,
  excerpt,
  contentHtml,
  isProbablyHtml,
  rawContent,
  emptyContentLabel,
}: Props) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <InfoBadge icon={faTag} label={categoryLabel} value={category} tone="green" />
        <InfoBadge icon={faClock} label={publishLabel} value={publishedLabel} tone="primary" />
        <InfoBadge icon={faUser} label={authorLabel} value={author} tone="neutral" />
        <InfoBadge icon={faCircleInfo} label={statusLabel} value={statusText} tone={statusTone} />
      </div>

      <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>

      {excerpt ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
          {excerpt}
        </p>
      ) : null}

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
        {isProbablyHtml ? null : rawContent ? (
          <div className="whitespace-pre-wrap">{rawContent}</div>
        ) : (
          <p className="text-sm font-semibold text-slate-500">{emptyContentLabel}</p>
        )}
      </div>
    </div>
  );
}
