import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSelectionStore } from "./selection-store";

describe("selection store", () => {
  it("starts empty", () => {
    const store = createSelectionStore();
    assert.deepEqual(store.getState(), { selectedId: null, type: null });
  });

  it("selects, updates and clears, notifying subscribers once per change", () => {
    const store = createSelectionStore();
    let ticks = 0;
    const unsubscribe = store.subscribe(() => ticks++);

    store.selectElement("sec1::0/2", "button", "sec1", { label: "Apply" });
    assert.equal(ticks, 1);
    assert.deepEqual(store.getState(), {
      selectedId: "sec1::0/2",
      type: "button",
      sectionId: "sec1",
      meta: { label: "Apply" },
    });

    // Re-selecting the same element is a no-op.
    store.selectElement("sec1::0/2", "button", "sec1");
    assert.equal(ticks, 1);

    store.updateElementProps("sec1::0/2", { href: "/admissions" });
    assert.equal(ticks, 2);
    assert.deepEqual(store.getState().meta, { label: "Apply", href: "/admissions" });

    // Props for something that is not selected are dropped, not applied.
    store.updateElementProps("other", { label: "x" });
    assert.equal(ticks, 2);

    store.clearSelection();
    assert.equal(ticks, 3);
    assert.deepEqual(store.getState(), { selectedId: null, type: null });

    // Clearing an empty selection does not notify.
    store.clearSelection();
    assert.equal(ticks, 3);

    unsubscribe();
    store.selectElement("sec1::1", "card", "sec1");
    assert.equal(ticks, 3);
  });
});
