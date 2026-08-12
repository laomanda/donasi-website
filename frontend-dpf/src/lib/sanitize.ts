import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous tags and attributes.
 *
 * @param html The potentially unsafe HTML string.
 * @returns Clean HTML string safe for rendering.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }, // Only allow HTML, no SVG/MathML by default unless needed
    ADD_TAGS: ['video', 'source'],
    ADD_ATTR: ['target', 'controls', 'preload', 'src', 'poster', 'class', 'type', 'playsinline', 'muted', 'loop'],
  });
};
