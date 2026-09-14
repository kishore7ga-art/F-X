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
      ancestors: [],
    });

    // Re-selecting the same element is a no-op.
    store.selectElement("sec1::0/2", "button", "sec1");
    assert.equal(ticks, 1);

    // Selecting with ancestors
    store.selectElement("sec1::0/2/1", "heading", "sec1", { fontSize: "24px" }, [
      { id: "sec1", type: "section", label: "Hero", path: "" },
      { id: "sec1::0/2", type: "container", label: "Container", path: "0/2" },
    ]);
    assert.equal(ticks, 2);
    assert.deepEqual(store.getState().ancestors, [
      { id: "sec1", type: "section", label: "Hero", path: "" },
      { id: "sec1::0/2", type: "container", label: "Container", path: "0/2" },
    ]);

    store.updateElementProps("sec1::0/2/1", { fontSize: "32px" });
    assert.equal(ticks, 3);
    assert.deepEqual(store.getState().meta, { fontSize: "32px" });

    // Props for something that is not selected are dropped, not applied.
    store.updateElementProps("other", { label: "x" });
    assert.equal(ticks, 3);

    store.clearSelection();
    assert.equal(ticks, 4);
    assert.deepEqual(store.getState(), { selectedId: null, type: null });

    // Clearing an empty selection does not notify.
    store.clearSelection();
    assert.equal(ticks, 4);

    unsubscribe();
    store.selectElement("sec1::1", "card", "sec1");
    assert.equal(ticks, 4);
  });
});
