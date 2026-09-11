/**
 * Where a button's link opens, decided from the link itself.
 *
 * There used to be an "Open in new tab" switch beside the link field. It was
 * one more thing to get wrong, and the answer is almost never a choice: a
 * link to *another site* opens in a new tab so the visitor does not lose the
 * college's page, and a link to *another page of this site* — `/admissions`,
 * `#contact`, `about.html` — navigates in place, as a website's own
 * navigation does. So the link decides, and the switch is gone.
 *
 * "Another site" means an absolute `http(s)://` or protocol-relative `//`
 * URL. `mailto:` and `tel:` are handed to the device and open no tab at all,
 * so they get no target either.
 */
export function isExternalLink(href: string): boolean {
  const value = href.trim();
  return /^(https?:)?\/\//i.test(value);
}

/** The `target` a link should carry, or null for none. */
export function linkTarget(href: string): "_blank" | null {
  return isExternalLink(href) ? "_blank" : null;
}

/** Sets or clears `target`/`rel` on an anchor to match its link. */
export function applyLinkTarget(el: Element, href: string): void {
  if (linkTarget(href)) {
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  } else {
    el.removeAttribute("target");
    el.removeAttribute("rel");
  }
}
