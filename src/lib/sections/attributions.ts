/**
 * Attribution required by the licence of a variant's source design.
 *
 * Some open-source templates we adapt designs from (CC BY, for example) require
 * a visible credit wherever the design is used. Keying credits by
 * `component_key` means a college's footer only shows the credits for designs
 * that college actually has on the page — and adding a new sourced variant is a
 * one-line entry here rather than an edit to the footer.
 */
export type Attribution = {
  /** Name of the source template. */
  name: string;
  /** Where the source lives. */
  url: string;
  /** Short licence label, e.g. "CC BY 4.0". */
  license: string;
  licenseUrl: string;
};

const AR_TEMPLATE: Attribution = {
  name: "AR template",
  url: "https://github.com/dmsl/academic-responsive-template",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
};

/** component_key -> attribution. Variants we designed ourselves are absent. */
export const VARIANT_ATTRIBUTIONS: Record<string, Attribution> = {
  hero_academic_masthead: AR_TEMPLATE,
};

/** De-duplicated credits for the variants rendered on a page. */
export function collectAttributions(componentKeys: string[]): Attribution[] {
  const byUrl = new Map<string, Attribution>();

  for (const key of componentKeys) {
    const attribution = VARIANT_ATTRIBUTIONS[key];
    if (attribution) byUrl.set(attribution.url, attribution);
  }

  return [...byUrl.values()];
}
