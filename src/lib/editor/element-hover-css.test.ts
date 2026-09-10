import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseHoverStyles, writeHoverRule } from "./element-hover-css";

describe("hover css region", () => {
  it("adds, updates and removes rules without touching authored css", () => {
    const authored = ".hero { padding: 40px }";

    const one = writeHoverRule(authored, "el-a1", { background: "#1d4ed8", color: "#fff" });
    assert.ok(one.startsWith(authored));
    assert.deepEqual(parseHoverStyles(one), { "el-a1": { background: "#1d4ed8", color: "#fff" } });
    assert.match(one, /\[data-xite-el="el-a1"\]\[data-xite-el="el-a1"\]:hover\{background-color:#1d4ed8 !important;color:#fff !important\}/);

    const two = writeHoverRule(one, "el-b2", { color: "#000" });
    assert.deepEqual(parseHoverStyles(two), {
      "el-a1": { background: "#1d4ed8", color: "#fff" },
      "el-b2": { color: "#000" },
    });

    const updated = writeHoverRule(two, "el-a1", { background: "#000" });
    assert.deepEqual(parseHoverStyles(updated)["el-a1"], { background: "#000" });

    const cleared = writeHoverRule(updated, "el-a1", {});
    assert.deepEqual(parseHoverStyles(cleared), { "el-b2": { color: "#000" } });

    const empty = writeHoverRule(cleared, "el-b2", { background: "" });
    assert.equal(empty, authored);
    assert.deepEqual(parseHoverStyles(empty), {});
  });
});
