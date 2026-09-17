import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyCardLayoutDom,
  applyElementProps,
  applyRangeHeadingTagDom,
  transformSelectedRangeToTag,
  isPartialTextSelection,
  buildYouTubeEmbedUrl,
  changeHeadingTagDom,
  classify,
  elementId,
  ELEMENT_TYPE_LABEL,
  extractYouTubeVideoId,
  findCardMediaElement,
  findImageElement,
  findYouTubeElement,
  findVideoElement,
  insertChildIntoCardDom,
  insertMediaIntoCardDom,
  parseElementId,
  removeMediaFromCardDom,
} from "./element-resolver";
import {
  ALL_TEXT_TAGS,
  matchFontOption,
  RADIUS_OPTIONS,
  BUTTON_RADIUS_OPTIONS,
  PADDING_OPTIONS,
  BUTTON_SIZES,
  matchRadiusOption,
  matchPaddingOption,
} from "../../components/editor/selection/SelectionHighlight";
import { FONT_SIZE_OPTIONS } from "../../components/editor/TextColorSettingsControl";

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
    const nodeAttrs = { ...attrs };
    const node: any = {
      tagName: tag.toUpperCase(),
      className: nodeAttrs.class || "",
      classList: {
        add(...classes: string[]) {
          const current = (node.className || "").split(/\s+/).filter(Boolean);
          for (const c of classes) {
            if (!current.includes(c)) current.push(c);
          }
          node.className = current.join(" ");
          nodeAttrs.class = node.className;
        },
        remove(...classes: string[]) {
          const current = (node.className || "").split(/\s+/).filter(Boolean);
          const filtered = current.filter((c: string) => !classes.includes(c));
          node.className = filtered.join(" ");
          nodeAttrs.class = node.className;
        },
        contains(c: string) {
          return (node.className || "").split(/\s+/).includes(c);
        },
      },
      style: {
        backgroundImage: nodeAttrs["data-bg"] ? `url(${nodeAttrs["data-bg"]})` : "none",
        position: nodeAttrs["data-position"] || "static",
        setProperty(prop: string, val: string) {
          (this as any)[prop] = val;
        },
        removeProperty(prop: string) {
          delete (this as any)[prop];
        },
      },
      textContent: text,
      children: [],
      parentElement: null,
      get firstChild() {
        return this.children[0] ?? null;
      },
      hasAttribute(name: string) {
        return name in nodeAttrs;
      },
      getAttribute(name: string) {
        return nodeAttrs[name] ?? null;
      },
      setAttribute(name: string, val: string) {
        nodeAttrs[name] = val;
        if (name === "class") node.className = val;
      },
      removeAttribute(name: string) {
        delete nodeAttrs[name];
        if (name === "class") node.className = "";
      },
      get attributes() {
        return Object.entries(nodeAttrs).map(([name, value]) => ({ name, value }));
      },
      querySelectorAll(selector: string) {
        const results: any[] = [];
        const cleanSel = selector.split(",").map((s) => s.trim().toLowerCase());
        const traverse = (n: any) => {
          for (const child of n.children) {
            const t = child.tagName.toLowerCase();
            const cls = (child.className || "").toLowerCase();
            if (cleanSel.some((sel) => sel === t || (sel.startsWith(".") && cls.includes(sel.slice(1))))) {
              results.push(child);
            }
            traverse(child);
          }
        };
        traverse(this);
        return results;
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
        if (child.parentElement) {
          const pIdx = child.parentElement.children.indexOf(child);
          if (pIdx >= 0) child.parentElement.children.splice(pIdx, 1);
        }
        child.parentElement = this;
        this.children.push(child);
        return child;
      },
      insertBefore(newChild: any, refChild: any) {
        if (newChild.parentElement) {
          const pIdx = newChild.parentElement.children.indexOf(newChild);
          if (pIdx >= 0) newChild.parentElement.children.splice(pIdx, 1);
        }
        const idx = this.children.indexOf(refChild);
        newChild.parentElement = this;
        if (idx >= 0) {
          this.children.splice(idx, 0, newChild);
        } else {
          this.children.push(newChild);
        }
        return newChild;
      },
      replaceWith(newEl: any) {
        if (this.parentElement) {
          const idx = this.parentElement.children.indexOf(this);
          if (idx >= 0) {
            newEl.parentElement = this.parentElement;
            this.parentElement.children[idx] = newEl;
          }
        }
      },
      remove() {
        if (this.parentElement) {
          const idx = this.parentElement.children.indexOf(this);
          if (idx >= 0) {
            this.parentElement.children.splice(idx, 1);
            this.parentElement = null;
          }
        }
      },
    };
    return node;
  }

  // Ensure global document exists for Node test environment
  if (typeof (globalThis as any).document === "undefined") {
    (globalThis as any).document = {
      createElement(tagName: string) {
        return createMockNode(tagName);
      },
    };
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

  it("finds card media element (img, video, youtube)", () => {
    const cardEmpty = createMockNode("div", { class: "card" });
    assert.equal(findCardMediaElement(cardEmpty), null);

    const cardWithImg = createMockNode("div", { class: "card" });
    const img = cardWithImg.appendChild(createMockNode("img", { src: "hero.jpg" }));
    cardWithImg.appendChild(createMockNode("h3", {}, "Title"));
    assert.equal(findCardMediaElement(cardWithImg), img);

    const cardWithVid = createMockNode("div", { class: "card" });
    const vid = cardWithVid.appendChild(createMockNode("video", { src: "clip.mp4" }));
    assert.equal(findCardMediaElement(cardWithVid), vid);

    const cardWithYt = createMockNode("div", { class: "card" });
    const yt = cardWithYt.appendChild(createMockNode("iframe", { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" }));
    assert.equal(findCardMediaElement(cardWithYt), yt);
  });

  it("inserts image into card preserving existing content", () => {
    const card = createMockNode("div", { class: "card" });
    const heading = card.appendChild(createMockNode("h3", {}, "Course Title"));
    const paragraph = card.appendChild(createMockNode("p", {}, "Course description here."));

    const insertedImg = insertMediaIntoCardDom(card, "image", { src: "https://example.com/course.jpg" }, "top");

    assert.equal(card.children.length, 3);
    assert.equal(card.children[0], insertedImg);
    assert.equal(card.children[1], heading);
    assert.equal(card.children[2], paragraph);
    assert.equal(insertedImg.tagName, "IMG");
    assert.equal(insertedImg.getAttribute("src"), "https://example.com/course.jpg");
  });

  it("inserts video into card at bottom preserving existing content", () => {
    const card = createMockNode("div", { class: "card" });
    const heading = card.appendChild(createMockNode("h3", {}, "Lab Tour"));

    const insertedVid = insertMediaIntoCardDom(card, "video", { src: "https://example.com/lab.mp4" }, "bottom");

    assert.equal(card.children.length, 2);
    assert.equal(card.children[0], heading);
    assert.equal(card.children[1], insertedVid);
    assert.equal(insertedVid.tagName, "VIDEO");
    assert.equal(insertedVid.getAttribute("src"), "https://example.com/lab.mp4");
  });

  it("replaces existing media in card when new media is added", () => {
    const card = createMockNode("div", { class: "card" });
    const img = card.appendChild(createMockNode("img", { src: "old.jpg" }));
    const text = card.appendChild(createMockNode("p", {}, "Content"));

    const newVid = insertMediaIntoCardDom(card, "video", { src: "new.mp4" });

    assert.equal(card.children.length, 2);
    assert.equal(card.children[0], newVid);
    assert.equal(card.children[1], text);
    assert.equal(newVid.tagName, "VIDEO");
  });

  it("removes media from card cleanly preserving remaining elements", () => {
    const card = createMockNode("div", { class: "card" });
    const img = card.appendChild(createMockNode("img", { src: "photo.jpg" }));
    const title = card.appendChild(createMockNode("h3", {}, "Event"));
    const button = card.appendChild(createMockNode("button", {}, "Register"));

    const removed = removeMediaFromCardDom(card);
    assert.equal(removed, true);
    assert.equal(card.children.length, 2);
    assert.equal(card.children[0], title);
    assert.equal(card.children[1], button);
    assert.equal(findCardMediaElement(card), null);
  });

  it("inserts media into small card with horizontal split layout (Media Left, Content Right)", () => {
    const card = createMockNode("div", { class: "card p-4 rounded-xl" });
    const heading = card.appendChild(createMockNode("h3", {}, "Graduate"));
    const paragraph = card.appendChild(createMockNode("p", {}, "Explore our graduate programs."));

    const img = insertMediaIntoCardDom(card, "image", { src: "https://example.com/grad.jpg" }, "left");

    assert.equal(card.children[0], img);
    assert.ok(card.classList.contains("sm:flex-row"));
    assert.equal(img.tagName, "IMG");

    // Content was wrapped in card-content container
    const content = card.querySelector(".card-content");
    assert.ok(content !== null);
    assert.equal(content.children.length, 2);
    assert.equal(content.children[0], heading);
    assert.equal(content.children[1], paragraph);
  });

  it("inserts child elements (heading, text, button) into card", () => {
    const card = createMockNode("div", { class: "card" });

    const heading = insertChildIntoCardDom(card, "heading");
    const text = insertChildIntoCardDom(card, "text");
    const button = insertChildIntoCardDom(card, "button");

    assert.equal(card.children.length, 3);
    assert.equal(heading.tagName, "H3");
    assert.equal(text.tagName, "P");
    assert.equal(button.tagName, "A");
    assert.equal(button.getAttribute("href"), "#");
  });

  it("applies layout modifications to card (vertical, horizontal-left, horizontal-right)", () => {
    const card = createMockNode("div", { class: "card" });
    const img = card.appendChild(createMockNode("img", { src: "thumb.jpg" }));
    const title = card.appendChild(createMockNode("h3", {}, "Undergraduate"));

    applyCardLayoutDom(card, "horizontal-left", "compact", "center");
    assert.ok(card.classList.contains("sm:flex-row"));

    applyCardLayoutDom(card, "horizontal-right", "1/2", "start");
    assert.ok(card.classList.contains("sm:flex-row-reverse"));

    applyCardLayoutDom(card, "vertical", "1/3", "center");
    assert.ok(card.classList.contains("flex-col"));
    assert.ok(!card.classList.contains("sm:flex-row"));
    assert.ok(!card.classList.contains("sm:flex-row-reverse"));
  });

  it("removes media from a split card without breaking the heading and paragraph description", () => {
    const card = createMockNode("div", { class: "card flex sm:flex-row" });
    const img = card.appendChild(createMockNode("img", { src: "photo.jpg" }));
    const content = card.appendChild(createMockNode("div", { class: "card-content flex-1" }));
    const heading = content.appendChild(createMockNode("h3", {}, "Graduate Studies"));
    const desc = content.appendChild(createMockNode("p", {}, "Detailed description here."));

    const removed = removeMediaFromCardDom(card);
    assert.equal(removed, true);
    assert.equal(findCardMediaElement(card), null);
    assert.equal(content.children.length, 2);
    assert.equal(content.children[0], heading);
    assert.equal(content.children[1], desc);
  });

  it("applies button label and newTab target/rel safely", () => {
    const btn = createMockNode("a", { href: "/apply" }, "Old Label");
    applyElementProps("button", btn, { text: "Apply Now", newTab: true });
    assert.equal(btn.getAttribute("target"), "_blank");
    assert.equal(btn.getAttribute("rel"), "noopener noreferrer");
    assert.equal(btn.textContent, "Apply Now");

    applyElementProps("button", btn, { newTab: false });
    assert.equal(btn.getAttribute("target"), null);
    assert.equal(btn.getAttribute("rel"), null);
  });

  it("applies typography font-family and text-transform to headings and text", () => {
    const heading = createMockNode("h2", {}, "Engineering");
    applyElementProps("heading", heading, {
      fontFamily: "'Outfit', sans-serif",
      textTransform: "uppercase",
    });
    assert.equal(heading.style["font-family"], "'Outfit', sans-serif");
    assert.equal(heading.style["text-transform"], "uppercase");

    const text = createMockNode("p", {}, "Description text");
    applyElementProps("text", text, {
      fontFamily: "'Inter', sans-serif",
      textTransform: "capitalize",
    });
    assert.equal(text.style["font-family"], "'Inter', sans-serif");
    assert.equal(text.style["text-transform"], "capitalize");
  });

  it("applies alignment, justification to flex containers and opacity to images", () => {
    const container = createMockNode("div", { class: "flex" });
    applyElementProps("container", container, {
      alignItems: "center",
      justifyContent: "space-between",
    });
    assert.equal(container.style["align-items"], "center");
    assert.equal(container.style["justify-content"], "space-between");

    const img = createMockNode("img", { src: "photo.jpg" });
    applyElementProps("image", img, { opacity: "0.8" });
    assert.equal(img.style["opacity"], "0.8");
  });

  describe("contextual text toolbar operations", () => {
    it("exports ALL_TEXT_TAGS covering H1 through H6 and P", () => {
      const tags = ALL_TEXT_TAGS.map((t) => t.tag);
      assert.deepEqual(tags, ["h1", "h2", "h3", "h4", "h5", "h6", "p"]);
      for (const item of ALL_TEXT_TAGS) {
        assert.ok(item.label.length > 0);
        assert.ok(item.sub.length > 0);
      }
    });

    it("includes 74px and standard font sizes in FONT_SIZE_OPTIONS", () => {
      const values = FONT_SIZE_OPTIONS.map((s) => s.value);
      assert.ok(values.includes("74px"));
      assert.ok(values.includes("16px"));
      assert.ok(values.includes("32px"));
      assert.ok(values.includes("48px"));
      assert.ok(values.includes("96px"));
    });

    it("matches font family options cleanly and provides fallbacks", () => {
      const inter = matchFontOption("'Inter', sans-serif");
      assert.equal(inter.label, "Inter");

      const outfit = matchFontOption("Outfit");
      assert.equal(outfit.label, "Outfit");

      const jakarta = matchFontOption("'Plus Jakarta Sans', sans-serif");
      assert.equal(jakarta.label, "Plus Jakarta");

      const fallback = matchFontOption("CustomFont, serif");
      assert.equal(fallback.label, "CustomFont");

      const empty = matchFontOption("");
      assert.equal(empty.label, "Default Font");
    });

    it("swaps heading and paragraph semantic tags via changeHeadingTagDom while strictly preserving parent DIV container", () => {
      const parentDiv = createMockNode("div", { class: "editor-block", id: "block-1", "data-editor-block": "true" });
      const h1 = parentDiv.appendChild(
        createMockNode("h1", { class: "font-bold text-slate-800 text-3xl", id: "hero-title" }, "Welcome to Xite")
      );

      // 1. Change H1 to P inside parent DIV: parentDiv must remain intact
      const p = changeHeadingTagDom(h1, "p" as any);
      assert.equal(p.tagName, "P");
      assert.equal(parentDiv.children.length, 1);
      assert.equal(parentDiv.children[0], p);
      assert.equal(p.parentElement, parentDiv);
      assert.equal(parentDiv.getAttribute("class"), "editor-block");
      assert.equal(parentDiv.getAttribute("id"), "block-1");
      assert.equal(p.getAttribute("id"), "hero-title");

      // 2. Change P to H1 inside parent DIV: stays inside parentDiv
      const backToH1 = changeHeadingTagDom(p, "h1");
      assert.equal(backToH1.tagName, "H1");
      assert.equal(parentDiv.children.length, 1);
      assert.equal(parentDiv.children[0], backToH1);
      assert.equal(backToH1.parentElement, parentDiv);
      assert.equal(parentDiv.getAttribute("class"), "editor-block");

      // 3. Change H1 to H3 inside parent DIV: stays inside parentDiv
      const h3 = changeHeadingTagDom(backToH1, "h3");
      assert.equal(h3.tagName, "H3");
      assert.equal(parentDiv.children[0], h3);
      assert.equal(h3.parentElement, parentDiv);

      // 4. Calling changeHeadingTagDom on the container DIV directly preserves the container DIV and updates the inner heading
      const pFromDiv = changeHeadingTagDom(parentDiv, "p" as any);
      assert.equal(pFromDiv.tagName, "P");
      assert.equal(parentDiv.children.length, 1);
      assert.equal(parentDiv.children[0], pFromDiv);
      assert.equal(parentDiv.tagName, "DIV");
      assert.equal(parentDiv.getAttribute("class"), "editor-block");

      // 5. Calling changeHeadingTagDom on a bare-text container DIV wraps the text inside the DIV without destroying the DIV
      const bareDiv = createMockNode("div", { class: "editor-block" });
      const bareP = changeHeadingTagDom(bareDiv, "p" as any);
      assert.equal(bareP.tagName, "P");
      assert.equal(bareDiv.children.length, 1);
      assert.equal(bareDiv.children[0], bareP);
      assert.equal(bareDiv.tagName, "DIV");

      // 6. Same tag returns element unchanged
      const same = changeHeadingTagDom(pFromDiv, "p" as any);
      assert.equal(same, pFromDiv);
    });

    it("detects partial vs full text selection correctly via isPartialTextSelection", () => {
      const p = {
        tagName: "P",
        textContent: "Welcome to my website",
      } as any;

      const partialRange = {
        collapsed: false,
        toString: () => "website",
      } as any;
      assert.equal(isPartialTextSelection(partialRange, p), true);

      const charRange = {
        collapsed: false,
        toString: () => "W",
      } as any;
      assert.equal(isPartialTextSelection(charRange, p), true);

      const fullRange = {
        collapsed: false,
        toString: () => "Welcome to my website",
      } as any;
      assert.equal(isPartialTextSelection(fullRange, p), false);

      const collapsedRange = {
        collapsed: true,
        toString: () => "",
      } as any;
      assert.equal(isPartialTextSelection(collapsedRange, p), false);

      assert.equal(isPartialTextSelection(null, p), false);
    });

    it("transforms a single character 'W' inside <div class='editor-container'><p>Hello World</p></div> without moving outside container", () => {
      const container = createMockNode("div", { class: "editor-container", id: "section-block-42" });
      const p = container.appendChild(createMockNode("p", {}, "Hello World"));

      const charW = createMockNode("span", {}, "W");
      const mockRange = {
        collapsed: false,
        commonAncestorContainer: p,
        extractContents() {
          return charW;
        },
        insertNode(node: any) {
          p.appendChild(node);
        },
      } as any;

      const tagEl = transformSelectedRangeToTag(mockRange, "h1", container);
      assert.ok(tagEl);
      assert.equal(tagEl.tagName, "SPAN");
      assert.equal(tagEl.getAttribute("data-xite-heading-tag"), "h1");
      assert.equal(tagEl.getAttribute("role"), "heading");
      assert.equal(tagEl.getAttribute("aria-level"), "1");
      assert.equal(tagEl.style.display, "inline");
      assert.equal((tagEl.style as any)["font-weight"], "800");
      // Verify hard container boundary is strictly preserved
      assert.equal(container.children.length, 1);
      assert.equal(container.children[0], p);
      assert.equal(p.parentElement, container);
      assert.equal(container.getAttribute("class"), "editor-container");
      assert.equal(container.getAttribute("id"), "section-block-42");
      assert.equal(tagEl.parentElement, p);
    });

    it("dynamically transforms ranges to any generic tag (H1-H6, P, BLOCKQUOTE, PRE, CODE, SPAN, STRONG)", () => {
      const parentDiv = createMockNode("div", { class: "editor-block" });
      const textContainer = parentDiv.appendChild(createMockNode("p", {}, "Code and quotes here"));

      const testTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "pre", "code", "span", "strong"];
      for (const tag of testTags) {
        const extracted = createMockNode("span", {}, "snippet");
        const mockRange = {
          collapsed: false,
          commonAncestorContainer: textContainer,
          extractContents() {
            return extracted;
          },
          insertNode(node: any) {
            textContainer.appendChild(node);
          },
        } as any;

        const res = transformSelectedRangeToTag(mockRange, tag, parentDiv);
        assert.ok(res, `Failed for tag: ${tag}`);
        const expectedTag = ["code", "span", "strong"].includes(tag) ? tag.toUpperCase() : "SPAN";
        assert.equal(res.tagName, expectedTag);
        assert.equal(res.getAttribute("data-xite-heading-tag"), tag.toLowerCase());
        assert.equal(res.style.display, "inline");
        // Ensure parent container hierarchy is 100% maintained
        assert.equal(textContainer.parentElement, parentDiv);
      }
    });

    it("enforces hard DOM boundaries and rejects out-of-boundary ranges", () => {
      const containerA = createMockNode("div", { class: "editor-block-a" });
      const containerB = createMockNode("div", { class: "editor-block-b" });
      const pInB = containerB.appendChild(createMockNode("p", {}, "Other text"));

      const outOfBoundsRange = {
        collapsed: false,
        commonAncestorContainer: pInB, // In containerB, but we specify containerA as editorRoot
        extractContents() {
          return createMockNode("span", {}, "Other");
        },
        insertNode() {},
      } as any;

      const res = transformSelectedRangeToTag(outOfBoundsRange, "h1", containerA);
      assert.equal(res, null); // Must safely reject to prevent DOM escape
    });

    it("handles collapsed ranges cleanly by returning null without DOM mutation", () => {
      const container = createMockNode("div", { class: "editor-block" });
      const p = container.appendChild(createMockNode("p", {}, "Hello"));

      const collapsedRange = {
        collapsed: true,
        commonAncestorContainer: p,
      } as any;

      assert.equal(transformSelectedRangeToTag(collapsedRange, "h1", container), null);
      assert.equal(applyRangeHeadingTagDom(collapsedRange, p, "h1"), null);
    });

    it("applies range heading tag within parent container boundary", () => {
      const parentDiv = createMockNode("div", { class: "editor-block" });
      const h1 = parentDiv.appendChild(createMockNode("h1", {}, "Welcome to my website"));

      const mockRange = {
        collapsed: false,
        commonAncestorContainer: h1,
        extractContents() {
          return createMockNode("span", {}, "website");
        },
        insertNode(node: any) {
          h1.appendChild(node);
        },
      } as any;

      const tagEl = applyRangeHeadingTagDom(mockRange, h1, "p");
      assert.ok(tagEl);
      assert.equal(tagEl.tagName, "SPAN");
      assert.equal(tagEl.getAttribute("data-xite-heading-tag"), "p");
      assert.equal(h1.parentElement, parentDiv);
    });

    it("applies all text formatting toolbar properties (bold, italic, underline, font-size, color, align, line-height, letter-spacing)", () => {
      const heading = createMockNode("h1", {}, "Main Title");
      const subSpan = heading.appendChild(createMockNode("span", {}, "Sub text"));

      applyElementProps("heading", heading, {
        fontWeight: "bold",
        fontStyle: "italic",
        textDecoration: "underline",
        fontSize: "74px",
        color: "#ec4899",
        fontFamily: "'Outfit', sans-serif",
        textAlign: "center",
        textTransform: "uppercase",
        lineHeight: "1.2",
        letterSpacing: "0.05em",
      });

      assert.equal(heading.style["font-weight"], "bold");
      assert.equal(heading.style["font-style"], "italic");
      assert.equal(heading.style["text-decoration"], "underline");
      assert.equal(heading.style["font-size"], "74px");
      assert.equal(heading.style["color"], "#ec4899");
      assert.equal(heading.style["font-family"], "'Outfit', sans-serif");
      assert.equal(heading.style["text-align"], "center");
      assert.equal(heading.style["text-transform"], "uppercase");
      assert.equal(heading.style["line-height"], "1.2");
      assert.equal(heading.style["letter-spacing"], "0.05em");

      // Check font family cascaded to nested span
      assert.equal(subSpan.style["font-family"], "'Outfit', sans-serif");
    });

    it("applies text props to paragraph elements and handles reset properties", () => {
      const p = createMockNode("p", {}, "Body paragraph");

      applyElementProps("text", p, {
        fontWeight: "400",
        fontStyle: "normal",
        textDecoration: "none",
        fontSize: "18px",
        color: "#0f172a",
        textAlign: "justify",
        lineHeight: "1.6",
        letterSpacing: "-0.01em",
      });

      assert.equal(p.style["font-weight"], "400");
      assert.equal(p.style["font-style"], "normal");
      assert.equal(p.style["text-decoration"], "none");
      assert.equal(p.style["font-size"], "18px");
      assert.equal(p.style["color"], "#0f172a");
      assert.equal(p.style["text-align"], "justify");
      assert.equal(p.style["line-height"], "1.6");
      assert.equal(p.style["letter-spacing"], "-0.01em");
    });

    it("provides clean Auto, Small, Normal, Max segmented options for radius, padding, and button sizes", () => {
      // Radius options: Auto, Small, Normal, Max
      assert.deepEqual(
        RADIUS_OPTIONS.map((r) => r.label),
        ["Auto", "Small", "Normal", "Max"]
      );
      assert.deepEqual(
        RADIUS_OPTIONS.map((r) => r.value),
        ["0px", "8px", "16px", "9999px"]
      );

      // Button Radius options
      assert.deepEqual(
        BUTTON_RADIUS_OPTIONS.map((r) => r.label),
        ["Auto", "Small", "Normal", "Max"]
      );
      assert.deepEqual(
        BUTTON_RADIUS_OPTIONS.map((r) => r.value),
        ["0px", "6px", "12px", "50px"]
      );

      // Padding options: Auto, Small, Normal, Max
      assert.deepEqual(
        PADDING_OPTIONS.map((p) => p.label),
        ["Auto", "Small", "Normal", "Max"]
      );

      // Button sizes: Small, Normal, Max
      assert.deepEqual(
        BUTTON_SIZES.map((s) => s.label),
        ["Small", "Normal", "Max"]
      );
      assert.deepEqual(
        BUTTON_SIZES.map((s) => s.key),
        ["sm", "md", "lg"]
      );
    });

    it("matches radius and padding options reliably", () => {
      // Standard elements radius
      assert.equal(matchRadiusOption("0px"), "0px");
      assert.equal(matchRadiusOption("none"), "0px");
      assert.equal(matchRadiusOption(""), "0px");
      assert.equal(matchRadiusOption("8px"), "8px");
      assert.equal(matchRadiusOption("12px"), "8px");
      assert.equal(matchRadiusOption("16px"), "16px");
      assert.equal(matchRadiusOption("24px"), "16px");
      assert.equal(matchRadiusOption("9999px"), "9999px");
      assert.equal(matchRadiusOption("full"), "9999px");

      // Button radius
      assert.equal(matchRadiusOption("0px", true), "0px");
      assert.equal(matchRadiusOption("6px", true), "6px");
      assert.equal(matchRadiusOption("12px", true), "12px");
      assert.equal(matchRadiusOption("50px", true), "50px");

      // Padding
      assert.equal(matchPaddingOption("0px"), "0px");
      assert.equal(matchPaddingOption("8px"), "8px");
      assert.equal(matchPaddingOption("16px"), "16px");
      assert.equal(matchPaddingOption("32px"), "32px");
      assert.equal(matchPaddingOption("48px"), "32px");
    });
  });
});


