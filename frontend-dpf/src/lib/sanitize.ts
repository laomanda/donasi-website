import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks while preserving
 * rich typography, responsive media, tables, and formatting.
 *
 * @param html The potentially unsafe HTML string.
 * @returns Clean HTML string safe for rendering.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: [
      'video',
      'source',
      'iframe',
      'picture',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'caption',
      'hr',
      'mark',
      'code',
      'pre',
      'b',
      'i',
      'u',
      's',
      'sub',
      'sup',
    ],
    ADD_ATTR: [
      'target',
      'rel',
      'controls',
      'preload',
      'src',
      'srcset',
      'sizes',
      'poster',
      'class',
      'type',
      'playsinline',
      'muted',
      'loop',
      'autoplay',
      'alt',
      'title',
      'width',
      'height',
      'loading',
      'style',
      'align',
      'frameborder',
      'allow',
      'allowfullscreen',
      'referrerpolicy',
    ],
  });
};

