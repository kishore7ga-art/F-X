import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildYouTubeEmbedUrl,
  classify,
  elementId,
  ELEMENT_TYPE_LABEL,
  extractYouTubeVideoId,
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

