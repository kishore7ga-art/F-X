import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyCardLayoutDom,
  applyElementProps,
  buildYouTubeEmbedUrl,
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
});


