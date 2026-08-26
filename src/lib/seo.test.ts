import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSiteMetadata,
  buildStructuredData,
  canonicalOrigin,
  canonicalPath,
  canonicalUrl,
  geoMetaTags,
  jsonLdScript,
  pageDescription,
  pageIndexable,
  pageTitle,
  type JsonLdNode,
  type SeoInput,
} from "@/lib/seo";

function input(overrides: Partial<SeoInput> = {}): SeoInput {
  return {
    subdomain: "greenfield",
    requestHost: null,
    siteName: "Greenfield College",
    siteTitle: null,
    siteDescription: null,
    siteOgImage: null,
    indexingEnabled: true,
    page: { slug: "/home", title: "Home" },
    ...overrides,
  };
}

describe("canonicalOrigin — one address, from every address", () => {
  it("uses the platform subdomain when the visitor is on the platform", () => {
    for (const host of ["webxite.org", "greenfield.webxite.org", "localhost", null, ""]) {
      assert.equal(
        canonicalOrigin("greenfield", host),
        "https://greenfield.webxite.org",
        `for host ${JSON.stringify(host)}`,
      );
    }
  });

  it("keeps a visitor on the tenant's own connected domain", () => {
    assert.equal(canonicalOrigin("greenfield", "www.greenfield.edu.in"), "https://www.greenfield.edu.in");
  });

  it("never produces the /site/<tenant> path form", () => {
    // That spelling exists only because of an internal rewrite. A search result
    // pointing at it sends people through the platform rather than to the site.
    assert.ok(!canonicalOrigin("greenfield", "webxite.org").includes("/site/"));
  });

  it("does not send a canonical to a development machine", () => {
    assert.equal(canonicalOrigin("greenfield", "127.0.0.1"), "https://greenfield.webxite.org");
  });
});

describe("canonicalPath and canonicalUrl", () => {
  it("collapses every spelling of the home page to the root", () => {
    for (const slug of ["/home", "/", "", null, undefined]) {
      assert.equal(canonicalPath(slug), "/", `for ${JSON.stringify(slug)}`);
    }
  });

  it("keeps a real page at its own path", () => {
    assert.equal(canonicalPath("about"), "/about");
    assert.equal(canonicalPath("/Admissions/Fees"), "/admissions/fees");
  });

  it("builds one absolute URL per page", () => {
    assert.equal(canonicalUrl("greenfield", "/home"), "https://greenfield.webxite.org/");
    assert.equal(canonicalUrl("greenfield", "/about"), "https://greenfield.webxite.org/about");
  });

  it("gives the same page the same URL from both platform spellings", () => {
    assert.equal(
      canonicalUrl("greenfield", "/about", "webxite.org"),
      canonicalUrl("greenfield", "/about", "greenfield.webxite.org"),
    );
  });
});

describe("pageTitle — two pages of one site are two titles", () => {
  it("puts the page's name in front of the site's", () => {
    assert.equal(
      pageTitle(input({ siteTitle: "Greenfield College", page: { slug: "/about", title: "About Us" } })),
      "About Us — Greenfield College",
    );
  });

  it("leaves the home page as the site", () => {
    assert.equal(
      pageTitle(input({ siteTitle: "Greenfield College", page: { slug: "/home", title: "Home" } })),
      "Greenfield College",
    );
  });

  it("lets a page override it outright", () => {
    assert.equal(
      pageTitle(
        input({
          siteTitle: "Greenfield College",
          page: { slug: "/about", title: "About Us", seo: { title: "Our Story Since 1974" } },
        }),
      ),
      "Our Story Since 1974",
    );
  });

  it("falls back to the institution's name, then to the platform default", () => {
    assert.equal(pageTitle(input({ siteTitle: null })), "Greenfield College");
    assert.equal(
      pageTitle(input({ siteTitle: null, siteName: "" })),
      "Official Campus Portal — Powered by XITE",
    );
  });
});

describe("pageDescription", () => {
  it("prefers the page's own", () => {
    assert.equal(
      pageDescription(
        input({
          siteDescription: "A college",
          page: { slug: "/about", title: "About", seo: { description: "Founded 1974" } },
        }),
      ),
      "Founded 1974",
    );
  });

  it("inherits the site's when the page says nothing", () => {
    assert.equal(pageDescription(input({ siteDescription: "A college" })), "A college");
  });

  it("is null rather than an empty string", () => {
    assert.equal(pageDescription(input({ siteDescription: "   " })), null);
  });
});

describe("pageIndexable — the site's switch is a floor", () => {
  it("indexes an ordinary page of an indexable site", () => {
    assert.equal(pageIndexable(input()), true);
  });

  it("lets one page opt out", () => {
    assert.equal(
      pageIndexable(input({ page: { slug: "/thanks", title: "Thanks", seo: { indexable: false } } })),
      false,
    );
  });

  it("does not let a page opt back in when the site is switched off", () => {
    // Otherwise "do not index this site" quietly means "unless a page disagrees",
    // which is not what anyone reads that switch as.
    assert.equal(
      pageIndexable(
        input({
          indexingEnabled: false,
          page: { slug: "/about", title: "About", seo: { indexable: true } },
        }),
      ),
      false,
    );
  });
});

describe("geoMetaTags", () => {
  it("emits nothing at all when the tenant has given no location", () => {
    assert.deepEqual(geoMetaTags(null), {});
    assert.deepEqual(geoMetaTags({}), {});
  });

  it("uses an ISO subdivision when it looks like one", () => {
    assert.equal(geoMetaTags({ region: "in-tn", country: "IN" })["geo.region"], "IN-TN");
  });

  it("falls back to the country when the region is prose", () => {
    // "Tamil Nadu" in geo.region is a malformed subdivision code; the country
    // alone is correct and parseable.
    assert.equal(geoMetaTags({ region: "Tamil Nadu", country: "IN" })["geo.region"], "IN");
  });

  it("emits coordinates only as a pair", () => {
    assert.equal(geoMetaTags({ latitude: 13.08 })["geo.position"], undefined);
    const both = geoMetaTags({ latitude: 13.08, longitude: 80.27 });
    assert.equal(both["geo.position"], "13.08;80.27");
    assert.equal(both["ICBM"], "13.08, 80.27");
  });
});

describe("buildSiteMetadata", () => {
  it("declares one canonical URL", () => {
    const meta = buildSiteMetadata(input({ page: { slug: "/about", title: "About" } }));
    assert.equal(meta.alternates?.canonical, "https://greenfield.webxite.org/about");
  });

  it("carries Open Graph and a Twitter card", () => {
    const meta = buildSiteMetadata(
      input({ siteTitle: "Greenfield College", siteDescription: "Since 1974" }),
    );
    assert.equal(meta.openGraph?.title, "Greenfield College");
    assert.equal((meta.openGraph as { siteName?: string }).siteName, "Greenfield College");
    assert.equal((meta.twitter as { card?: string })?.card, "summary");
  });

  it("upgrades the card only when there is an image to make large", () => {
    const meta = buildSiteMetadata(input({ siteOgImage: "https://cdn.example.com/og.png" }));
    assert.equal((meta.twitter as { card?: string })?.card, "summary_large_image");
  });

  it("clears the platform's own description and favicon", () => {
    // Next merges metadata down the tree, and the root layout carries XITE's
    // marketing copy and logo. Inheriting either puts the platform's words and
    // mark on a college's own domain.
    const meta = buildSiteMetadata(input({ siteDescription: null }));
    assert.equal(meta.description, null);
    assert.equal(meta.icons, null);
  });

  it("emits noindex for a site with indexing switched off", () => {
    const meta = buildSiteMetadata(input({ indexingEnabled: false }));
    assert.equal((meta.robots as { index?: boolean }).index, false);
  });
});

describe("buildStructuredData", () => {
  const geo = {
    streetAddress: "12 Anna Salai",
    locality: "Chennai",
    region: "IN-TN",
    postalCode: "600002",
    country: "IN",
    latitude: 13.0827,
    longitude: 80.2707,
    telephone: "+91 44 1234 5678",
  };

  const byType = (nodes: JsonLdNode[], type: string) =>
    nodes.find((node) => node["@type"] === type);

  it("always says this is a website", () => {
    const nodes = buildStructuredData(input());
    assert.ok(byType(nodes, "WebSite"));
  });

  it("does not invent an organisation from a name alone", () => {
    // A node carrying only what every site has by definition is noise, and an
    // aggregator that reads it learns nothing it did not already have.
    const nodes = buildStructuredData(input());
    assert.equal(byType(nodes, "CollegeOrUniversity"), undefined);
  });

  it("describes the institution once it has something to say", () => {
    const nodes = buildStructuredData(input({ geo }));
    const org = byType(nodes, "CollegeOrUniversity") as JsonLdNode;
    assert.ok(org);
    assert.equal((org.address as JsonLdNode).addressLocality, "Chennai");
    assert.equal((org.address as JsonLdNode).addressCountry, "IN");
    assert.equal((org.geo as JsonLdNode).latitude, 13.0827);
    assert.equal(org.telephone, "+91 44 1234 5678");
  });

  it("honours a declared organisation type", () => {
    const nodes = buildStructuredData(
      input({ geo, aeo: { organizationType: "School" } }),
    );
    assert.ok(byType(nodes, "School"));
  });

  it("emits a breadcrumb for an inner page and none for the home page", () => {
    assert.equal(byType(buildStructuredData(input()), "BreadcrumbList"), undefined);
    const inner = buildStructuredData(input({ page: { slug: "/about", title: "About" } }));
    const crumb = byType(inner, "BreadcrumbList") as JsonLdNode;
    assert.ok(crumb);
    assert.equal((crumb.itemListElement as JsonLdNode[])[1]!.item, "https://greenfield.webxite.org/about");
  });

  it("emits an FAQ block only when questions have answers", () => {
    assert.equal(
      byType(buildStructuredData(input({ aeo: { faqs: [] } })), "FAQPage"),
      undefined,
    );
    assert.equal(
      byType(
        buildStructuredData(input({ aeo: { faqs: [{ question: "Fees?", answer: "" }] } })),
        "FAQPage",
      ),
      undefined,
    );
    const nodes = buildStructuredData(
      input({ aeo: { faqs: [{ question: "What are the fees?", answer: "₹80,000 a year." }] } }),
    );
    const faq = byType(nodes, "FAQPage") as JsonLdNode;
    assert.equal((faq.mainEntity as JsonLdNode[]).length, 1);
  });

  it("names service areas as areas, not as prose", () => {
    const nodes = buildStructuredData(input({ geo: { ...geo, serviceAreas: ["Tamil Nadu", "Kerala"] } }));
    const org = byType(nodes, "CollegeOrUniversity") as JsonLdNode;
    assert.deepEqual(
      (org.areaServed as JsonLdNode[]).map((area) => area.name),
      ["Tamil Nadu", "Kerala"],
    );
  });
});

describe("jsonLdScript — a FAQ answer cannot close the script", () => {
  it("escapes every < so no tag can begin", () => {
    const payload = jsonLdScript([
      { "@type": "FAQPage", answer: "</script><img src=x onerror=alert(1)>" },
    ]);
    assert.ok(!payload.includes("<"), payload);
    assert.ok(payload.includes("\\u003c"));
  });

  it("still parses as the same JSON", () => {
    const nodes = [{ "@type": "Thing", name: "a < b" }];
    assert.deepEqual(JSON.parse(jsonLdScript(nodes)), nodes[0]);
  });

  it("is empty when there is nothing to say", () => {
    assert.equal(jsonLdScript([]), "");
  });

  it("emits an array only when there is more than one node", () => {
    const one = JSON.parse(jsonLdScript([{ "@type": "WebSite" }]));
    assert.ok(!Array.isArray(one));
    const two = JSON.parse(jsonLdScript([{ "@type": "WebSite" }, { "@type": "FAQPage" }]));
    assert.ok(Array.isArray(two));
  });
});
