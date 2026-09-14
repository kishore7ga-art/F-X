import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildYouTubeEmbedUrl,
  classify,
  elementId,
  ELEMENT_TYPE_LABEL,
  extractYouTubeVideoId,
  findImageElement,
  findYouTubeElement,
  findVideoElement,
  parseElementId,
} from "./element-resolver";

describe("element ids", () => {
  it("round-trips a section id and a path", () => {
    assert.equal(elementId("sec_1", "0/3/1"), "sec_1::0/3/1");
    assert.deepEqual(parseElementId("sec_1::0/3/1"), { sectionId: "sec_1", path: "0/3/1" });
    assert.deepEqual(parseElementId("sec_1::"), { sectionId: "sec_1", path: "" });
    assert.equal(parseElementId("no-separator"), null);
  });
});

describe("YouTube URL helpers", () => {
  it("extracts video ID from various YouTube URL formats", () => {
    assert.equal(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(extractYouTubeVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(extractYouTubeVideoId("https://invalid-domain.com/video"), null);
    assert.equal(extractYouTubeVideoId(""), null);
  });

  it("builds YouTube embed URLs with options", () => {
    const embed1 = buildYouTubeEmbedUrl("dQw4w9WgXcQ");
    assert.ok(embed1.includes("https://www.youtube.com/embed/dQw4w9WgXcQ"));
    assert.ok(embed1.includes("enablejsapi=1"));

    const embed2 = buildYouTubeEmbedUrl("dQw4w9WgXcQ", { autoplay: true, muted: true, loop: true });
    assert.ok(embed2.includes("autoplay=1"));
    assert.ok(embed2.includes("mute=1"));
    assert.ok(embed2.includes("loop=1"));
  });
});

describe("classification by tag and class", () => {
  it("recognises buttons", () => {
    assert.ok(classify.isButtonLike("button", "", null, null));
    assert.ok(classify.isButtonLike("div", "", "button", null));
    assert.ok(classify.isButtonLike("input", "", null, "submit"));
    assert.ok(classify.isButtonLike("a", "inline-flex btn-primary", null, null));
    assert.ok(classify.isButtonLike("a", "apply-now", null, null));
    assert.ok(!classify.isButtonLike("a", "nav-link", null, null));
    assert.ok(!classify.isButtonLike("input", "", null, "text"));
  });

  it("recognises YouTube videos", () => {
    assert.ok(classify.isYouTubeLike("iframe", "https://www.youtube.com/embed/dQw4w9WgXcQ", "", false));
    assert.ok(classify.isYouTubeLike("div", "", "youtube-wrapper", false));
    assert.ok(classify.isYouTubeLike("div", "", "", true));
    assert.ok(!classify.isYouTubeLike("div", "", "normal-container", false));
  });

  it("recognises HTML5 videos", () => {
    assert.ok(classify.isVideoLike("video", "", false));
    assert.ok(classify.isVideoLike("div", "video-container", false));
    assert.ok(classify.isVideoLike("div", "", true));
  });

  it("recognises logos", () => {
    assert.ok(classify.isLogoLike("img", "nav-logo", false, ""));
    assert.ok(classify.isLogoLike("img", "", true, ""));
    assert.ok(classify.isLogoLike("img", "", false, "University Logo"));
    assert.ok(!classify.isLogoLike("img", "hero-banner", false, "Students on campus"));
  });

  it("recognises plus placeholders", () => {
    assert.ok(classify.isPlusLike("button", "add-media", false, ""));
    assert.ok(classify.isPlusLike("div", "add-placeholder", false, ""));
    assert.ok(classify.isPlusLike("button", "", false, "+"));
    assert.ok(classify.isPlusLike("span", "", true, ""));
  });

  it("recognises icons", () => {
    assert.ok(classify.isIconLike("svg", "", false));
    assert.ok(classify.isIconLike("i", "lucide lucide-star", false));
    assert.ok(classify.isIconLike("div", "", true));
  });

  it("recognises text tags", () => {
    for (const tag of ["h1", "h6", "p", "span", "li", "blockquote"]) assert.ok(classify.isTextTag(tag), tag);
    for (const tag of ["div", "section", "img", "a"]) assert.ok(!classify.isTextTag(tag), tag);
  });

  it("recognises cards", () => {
    assert.ok(classify.isCardLike("div", "card", false));
    assert.ok(classify.isCardLike("div", "rounded-xl program-card", false));
    assert.ok(classify.isCardLike("div", "", true));
    assert.ok(classify.isCardLike("article", "", false));
    assert.ok(!classify.isCardLike("div", "grid gap-4", false));
  });

  it("recognises containers", () => {
    assert.ok(classify.isContainerLike("div", "container mx-auto", false));
    assert.ok(classify.isContainerLike("div", "grid grid-cols-3", false));
    assert.ok(classify.isContainerLike("div", "flex flex-row items-center", false));
    assert.ok(classify.isContainerLike("div", "columns-2", false));
    assert.ok(classify.isContainerLike("div", "", true));
    assert.ok(classify.isContainerLike("main", "", false));
  });

  it("recognises heading tags", () => {
    assert.ok(classify.isHeadingTag("h1"));
    assert.ok(classify.isHeadingTag("H2"));
    assert.ok(classify.isHeadingTag("h6"));
    assert.ok(!classify.isHeadingTag("p"));
    assert.ok(!classify.isHeadingTag("div"));
  });

  it("recognises paragraph and inline text tags", () => {
    assert.ok(classify.isParagraphOrInlineTextTag("p"));
    assert.ok(classify.isParagraphOrInlineTextTag("span"));
    assert.ok(classify.isParagraphOrInlineTextTag("strong"));
    assert.ok(classify.isParagraphOrInlineTextTag("blockquote"));
    assert.ok(!classify.isParagraphOrInlineTextTag("h1"));
    assert.ok(!classify.isParagraphOrInlineTextTag("div"));
  });

  it("exposes labels for all supported element types", () => {
    const types = [
      "section",
      "container",
      "card",
      "heading",
      "text",
      "button",
      "image",
      "video",
      "youtube",
      "icon",
      "logo",
      "plus",
      "generic",
    ] as const;
    for (const t of types) {
      assert.ok(typeof ELEMENT_TYPE_LABEL[t] === "string");
      assert.ok(ELEMENT_TYPE_LABEL[t].length > 0);
    }
  });
});

describe("findImageElement & media resolution", () => {
  function matchMock(el: any, sel: string): boolean {
    const parts = sel.split(",").map((s) => s.trim().toLowerCase());
    const t = el.tagName.toLowerCase();
    const cls = (el.className || "").toLowerCase();
    for (const p of parts) {
      if (p === t) return true;
      if (p.startsWith(".") && cls.includes(p.slice(1))) return true;
      if (p.includes("[")) {
        const tagMatch = p.slice(0, p.indexOf("[")).trim();
        if (tagMatch && tagMatch !== t) continue;
        const attrMatch = p.slice(p.indexOf("[") + 1, p.lastIndexOf("]"));
        if (attrMatch.includes("*=")) {
          const [attr, val] = attrMatch.split("*=").map((s) => s.replace(/['"]/g, "").trim());
          const actual = (el.getAttribute(attr) || "").toLowerCase();
          if (actual.includes(val)) return true;
        } else if (attrMatch.includes("=")) {
          const [attr, val] = attrMatch.split("=").map((s) => s.replace(/['"]/g, "").trim());
          const actual = (el.getAttribute(attr) || "").toLowerCase();
          if (actual === val) return true;
        } else {
          if (el.hasAttribute(attrMatch)) return true;
        }
      }
    }
    return false;
  }

  function createMockNode(tag: string, attrs: Record<string, string> = {}, text = ""): any {
    const node: any = {
      tagName: tag.toUpperCase(),
      className: attrs.class || "",
      style: {
        backgroundImage: attrs["data-bg"] ? `url(${attrs["data-bg"]})` : "none",
        position: attrs["data-position"] || "static",
      },
      textContent: text,
      children: [],
      parentElement: null,
      hasAttribute(name: string) {
        return name in attrs;
      },
      getAttribute(name: string) {
        return attrs[name] ?? null;
      },
      closest(selector: string) {
        let cur: any = this;
        while (cur) {
          if (matchMock(cur, selector)) return cur;
          cur = cur.parentElement;
        }
        return null;
      },
      querySelector(selector: string) {
        const directOnly = selector.startsWith(":scope >");
        const cleanSel = selector.replace(":scope >", "").trim();
        for (const child of this.children) {
          if (matchMock(child, cleanSel)) return child;
          if (!directOnly) {
            const found = child.querySelector(selector);
            if (found) return found;
          }
        }
        return null;
      },
      contains(other: any) {
        let cur = other;
        while (cur) {
          if (cur === this) return true;
          cur = cur.parentElement;
        }
        return false;
      },
      appendChild(child: any) {
        child.parentElement = this;
        this.children.push(child);
        return child;
      },
    };
    return node;
  }

  it("resolves a direct <img> element", () => {
    const root = createMockNode("section");
    const container = root.appendChild(createMockNode("div", { class: "container" }));
    const img = container.appendChild(createMockNode("img", { src: "campus.jpg", alt: "Campus" }));

    assert.equal(findImageElement(img, root), img);
  });

  it("resolves an overlay sitting in front of a sibling <img>", () => {
    const root = createMockNode("section");
    const card = root.appendChild(createMockNode("div", { class: "card relative" }));
    const img = card.appendChild(createMockNode("img", { src: "photo.jpg" }));
    const overlay = card.appendChild(createMockNode("div", { class: "absolute inset-0 bg-black/30 overlay" }));

    // User clicked directly on the overlay, but it should resolve to the sibling img!
    const resolved = findImageElement(overlay, root);
    assert.equal(resolved, img);
  });

  it("resolves an image wrapper (.image-wrapper) to the nested <img>", () => {
    const root = createMockNode("section");
    const wrapper = root.appendChild(createMockNode("div", { class: "image-wrapper aspect-video" }));
    const img = wrapper.appendChild(createMockNode("img", { src: "lab.jpg" }));

    assert.equal(findImageElement(wrapper, root), img);
  });

  it("resolves an anchor wrapping only an <img> to the img", () => {
    const root = createMockNode("section");
    const link = root.appendChild(createMockNode("a", { href: "/gallery" }));
    const img = link.appendChild(createMockNode("img", { src: "event.jpg" }));

    assert.equal(findImageElement(link, root), img);
  });

  it("returns null when clicking root section", () => {
    const root = createMockNode("section");
    assert.equal(findImageElement(root, root), null);
  });

  it("finds YouTube iframe or wrapper", () => {
    const root = createMockNode("section");
    const ytWrapper = root.appendChild(createMockNode("div", { class: "youtube-wrapper" }));
    const iframe = ytWrapper.appendChild(createMockNode("iframe", { src: "https://www.youtube.com/embed/xyz12345678" }));

    assert.ok(findYouTubeElement(iframe, root) !== null);
  });

  it("finds Video element", () => {
    const root = createMockNode("section");
    const video = root.appendChild(createMockNode("video", { src: "tour.mp4" }));

    assert.equal(findVideoElement(video, root), video);
  });
});


