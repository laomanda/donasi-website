import { sanitizeHtml } from './sanitize';

/**
 * Check if the content has any HTML tags.
 */
export const isHtmlContent = (content?: string | null): boolean => {
  if (!content) return false;
  return /<\/?(p|div|span|h[1-6]|ul|ol|li|br|strong|b|em|i|u|s|img|video|source|iframe|a|blockquote|table|thead|tbody|tfoot|tr|th|td|figure|figcaption|pre|code|hr)\b/i.test(
    content
  );
};

/**
 * Formats article content for rendering as HTML.
 * Handles both full HTML markup (e.g. pasted HTML with <p>, <h2>, etc.)
 * and hybrid / plain text with newlines and inserted <img> / media blocks,
 * ensuring newlines and paragraphs are never flattened when an image or tag is present.
 */
export const formatArticleContentHtml = (raw?: string | null): string => {
  if (!raw) return '';
  const content = String(raw).trim();
  if (!content) return '';

  // Check if content already contains structural block HTML tags
  const hasBlockTags = /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|section|article|pre|figure)\b/i.test(
    content
  );

  if (hasBlockTags) {
    // Already structured HTML: sanitize directly
    return sanitizeHtml(content);
  }

  // If no block tags exist (e.g. plain text or plain text mixed with <img> / <strong> / etc.):
  // Split by double (or more) newlines into distinct paragraphs to preserve structure
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) {
    const wrapped = paragraphs
      .map((para) => {
        // If the paragraph is a standalone block media tag like <img ... /> or <video ...></video>
        if (/^<(img|video|figure|iframe)\b/i.test(para) && />$/i.test(para)) {
          return para;
        }
        // Otherwise wrap in <p> and convert single newlines within the paragraph to <br/>
        return `<p>${para.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('\n');
    return sanitizeHtml(wrapped);
  }

  return sanitizeHtml(content.replace(/\n/g, '<br/>'));
};
