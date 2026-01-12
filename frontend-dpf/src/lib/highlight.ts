import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type HighlightOptions = {
  autoClearMs?: number;
  term?: string;
};

const HL_CLASS = "hl bg-amber-200 text-slate-900 rounded px-0.5";
const HL_ACTIVE_CLASS = "hl-active ring-2 ring-amber-400";

export function clearHighlights(root: HTMLElement) {
  const spans = Array.from(root.querySelectorAll("span.hl, span.hl-active"));
  spans.forEach((span) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
    parent.normalize();
  });
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function highlightTerm(root: HTMLElement, rawTerm: string): HTMLElement | null {
  const term = rawTerm.trim();
  if (!term) return null;
  const pattern = new RegExp(escapeRegex(term), "gi");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE" || parent.classList.contains("hl"))) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let firstMatchEl: HTMLElement | null = null;
  const matches: { node: Text; parts: (string | HTMLElement)[] }[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const text = node.nodeValue ?? "";
    const found = Array.from(text.matchAll(pattern));
    if (!found.length) continue;

    let lastIndex = 0;
    const parts: (string | HTMLElement)[] = [];
    found.forEach((m, idx) => {
      const start = m.index ?? 0;
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
      const span = document.createElement("span");
      span.className = HL_CLASS + (idx === 0 && !firstMatchEl ? ` ${HL_ACTIVE_CLASS}` : "");
      span.textContent = m[0];
      if (!firstMatchEl) firstMatchEl = span;
      parts.push(span);
      lastIndex = start + m[0].length;
    });
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    matches.push({ node, parts });
  }

  matches.forEach(({ node, parts }) => {
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (typeof part === "string") frag.appendChild(document.createTextNode(part));
      else frag.appendChild(part);
    });
    node.parentNode?.replaceChild(frag, node);
  });

  return firstMatchEl;
}

export function useSearchHighlight(containerRef: React.RefObject<HTMLElement | null>, options?: HighlightOptions) {
  const location = useLocation();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fromState = (location.state as any)?.q as string | undefined;
    const fromQuery = new URLSearchParams(location.search).get("q") || undefined;
    const term = (options?.term ?? fromState ?? fromQuery ?? "").trim();

    clearHighlights(container);
    if (!term) return;

    const first: HTMLElement | null = highlightTerm(container, term);
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    let timer: number | undefined;
    if (options?.autoClearMs) {
      timer = window.setTimeout(() => clearHighlights(container), options.autoClearMs);
    }

    return () => {
      clearHighlights(container);
      if (timer) window.clearTimeout(timer);
    };
  }, [location.pathname, containerRef, options?.autoClearMs, options?.term]);
}
