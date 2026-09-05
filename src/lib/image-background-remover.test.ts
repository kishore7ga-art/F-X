import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  colorDistance,
  hexToRgb,
  DEFAULT_IMAGE_ASSETS,
  removeImageBackground,
} from "./image-background-remover";

describe("Image Background Remover & Assets Engine", () => {
  it("computes Euclidean color distance accurately", () => {
    // Identical colors
    assert.equal(colorDistance(255, 255, 255, 255, 255, 255), 0);

    // Black and White distance sqrt(255^2 * 3) ~ 441.67
    const blackWhiteDist = colorDistance(0, 0, 0, 255, 255, 255);
    assert.ok(blackWhiteDist > 441 && blackWhiteDist < 442);

    // Close colors
    const closeDist = colorDistance(255, 255, 255, 250, 250, 250);
    assert.ok(closeDist < 10);
  });

  it("parses 3-digit and 6-digit hex colors correctly", () => {
    assert.deepEqual(hexToRgb("#fff"), { r: 255, g: 255, b: 255 });
    assert.deepEqual(hexToRgb("#000"), { r: 0, g: 0, b: 0 });
    assert.deepEqual(hexToRgb("#ff0000"), { r: 255, g: 0, b: 0 });
    assert.deepEqual(hexToRgb("#2563eb"), { r: 37, g: 99, b: 235 });
    assert.equal(hexToRgb("invalid"), null);
  });

  it("exports default image assets catalog with books and academic assets", () => {
    assert.ok(DEFAULT_IMAGE_ASSETS.length >= 5);

    const bookAssets = DEFAULT_IMAGE_ASSETS.filter((a) => a.category === "books");
    assert.ok(bookAssets.length >= 2, "Expected at least 2 book assets in library");

    for (const asset of DEFAULT_IMAGE_ASSETS) {
      assert.ok(asset.id, "Asset missing ID");
      assert.ok(asset.name, "Asset missing name");
      assert.ok(asset.url.startsWith("https://"), "Asset URL must be valid https URL");
      assert.ok(asset.width > 0 && asset.height > 0, "Asset dimensions must be positive");
    }
  });

  it("falls back cleanly on server environments where window/canvas is unavailable", async () => {
    const inputSrc = "https://example.com/book.jpg";
    const result = await removeImageBackground(inputSrc);
    assert.equal(result, inputSrc);
  });
});
