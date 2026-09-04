import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { handleInteractiveSectionClick } from "./interactive-section-runtime";

// Helper mock DOM elements
class MockClassList {
  classes = new Set<string>();
  add(...names: string[]) { names.forEach(n => this.classes.add(n)); }
  remove(...names: string[]) { names.forEach(n => this.classes.delete(n)); }
  contains(name: string) { return this.classes.has(name); }
  toggle(name: string) {
    if (this.classes.has(name)) { this.classes.delete(name); return false; }
    else { this.classes.add(name); return true; }
  }
}

class MockElement {
  tagName: string;
  className: string;
  classList = new MockClassList();
  attributes: Record<string, string> = {};
  parentElement: MockElement | null = null;
  children: MockElement[] = [];
  style: Record<string, string> = {};
  scrollHeight = 100;
  id = "";

  constructor(tagName: string, className = "", id = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    this.id = id;
    if (className) {
      className.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
  }

  setAttribute(name: string, val: string) { this.attributes[name] = val; }
  getAttribute(name: string) { return this.attributes[name] ?? null; }

  appendChild(child: MockElement) {
    child.parentElement = this;
    this.children.push(child);
  }

  matchesSelector(sel: string): boolean {
    sel = sel.trim();
    if (sel.startsWith("#")) {
      return this.id === sel.slice(1);
    }
    if (sel.startsWith(".")) {
      const parts = sel.split(".").filter(Boolean);
      return parts.every(p => this.classList.contains(p));
    }
    if (sel.includes("[") && sel.includes("]")) {
      const attrMatch = sel.match(/\[([^\]=]+)(?:=["']?([^"'\]]+)["']?)?\]/);
      if (attrMatch) {
        const attrName = attrMatch[1];
        const attrVal = attrMatch[2];
        if (attrVal) return this.getAttribute(attrName) === attrVal;
        return this.getAttribute(attrName) !== null;
      }
    }
    return this.tagName.toLowerCase() === sel.toLowerCase();
  }

  closest<T = MockElement>(selector: string): T | null {
    let curr: MockElement | null = this;
    const selectors = selector.split(",").map(s => s.trim());

    while (curr) {
      for (const sel of selectors) {
        if (curr.matchesSelector(sel)) return curr as unknown as T;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  querySelector<T = MockElement>(selector: string): T | null {
    const list = this.querySelectorAll<T>(selector);
    return list[0] ?? null;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const results: MockElement[] = [];
    const selectors = selector.split(",").map(s => s.trim());

    const traverse = (node: MockElement) => {
      for (const sel of selectors) {
        if (node.matchesSelector(sel)) {
          if (!results.includes(node)) results.push(node);
        }
      }
      for (const child of node.children) {
        traverse(child);
      }
    };

    for (const child of this.children) {
      traverse(child);
    }
    return results as unknown as T[];
  }
}

describe("handleInteractiveSectionClick — full suite", () => {
  test("toggles desktop mega menu on click and closes on second click", () => {
    const header = new MockElement("header", "mesa-header");
    const navContainer = new MockElement("div", "mesa-nav-container");
    const navItemPg = new MockElement("div", "nav-item");
    navItemPg.setAttribute("data-menu", "pg");
    const trigger = new MockElement("button", "nav-trigger");
    const span = new MockElement("span");

    trigger.appendChild(span);
    navItemPg.appendChild(trigger);
    navContainer.appendChild(navItemPg);
    header.appendChild(navContainer);

    const megaPg = new MockElement("div", "mega-menu", "menu-pg");
    header.appendChild(megaPg);

    let defaultPrevented = false;
    let propagationStopped = false;
    const mockEvent = {
      target: span,
      preventDefault: () => { defaultPrevented = true; },
      stopPropagation: () => { propagationStopped = true; }
    } as any;

    const handled = handleInteractiveSectionClick(mockEvent);
    assert.equal(handled, true);
    assert.equal(defaultPrevented, true);
    assert.equal(propagationStopped, true);
    assert.equal(navItemPg.classList.contains("open"), true);
    assert.equal(megaPg.classList.contains("active"), true);

    // Second click closes
    const handled2 = handleInteractiveSectionClick(mockEvent);
    assert.equal(handled2, true);
    assert.equal(navItemPg.classList.contains("open"), false);
    assert.equal(megaPg.classList.contains("active"), false);
  });

  test("toggles mobile drawer on open and close triggers", () => {
    const header = new MockElement("header", "mesa-header");
    const openBtn = new MockElement("button", "hamburger-btn", "openDrawerBtn");
    const drawer = new MockElement("div", "mobile-drawer", "mobileDrawer");
    const closeBtn = new MockElement("button", "drawer-close-btn", "closeDrawerBtn");

    drawer.appendChild(closeBtn);
    header.appendChild(openBtn);
    header.appendChild(drawer);

    const openEvent = {
      target: openBtn,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handledOpen = handleInteractiveSectionClick(openEvent);
    assert.equal(handledOpen, true);
    assert.equal(drawer.classList.contains("active"), true);

    const closeEvent = {
      target: closeBtn,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handledClose = handleInteractiveSectionClick(closeEvent);
    assert.equal(handledClose, true);
    assert.equal(drawer.classList.contains("active"), false);
  });

  test("toggles drawer accordion items", () => {
    const drawer = new MockElement("div", "mobile-drawer");
    const accItem = new MockElement("div", "drawer-accordion");
    const accBtn = new MockElement("button", "drawer-accordion-btn");
    const accBody = new MockElement("div", "drawer-accordion-body");

    accItem.appendChild(accBtn);
    accItem.appendChild(accBody);
    drawer.appendChild(accItem);

    const clickEvent = {
      target: accBtn,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handled = handleInteractiveSectionClick(clickEvent);
    assert.equal(handled, true);
    assert.equal(accItem.classList.contains("open"), true);
  });

  test("toggles FAQ expander items", () => {
    const section = new MockElement("section", "faq-section");
    const faqItem = new MockElement("div", "faq-item");
    const faqTrigger = new MockElement("button", "faq-trigger");
    const faqContent = new MockElement("div", "faq-content");

    faqItem.appendChild(faqTrigger);
    faqItem.appendChild(faqContent);
    section.appendChild(faqItem);

    const clickEvent = {
      target: faqTrigger,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handled = handleInteractiveSectionClick(clickEvent);
    assert.equal(handled, true);
    assert.equal(faqItem.classList.contains("open"), true);

    // Second click closes
    handleInteractiveSectionClick(clickEvent);
    assert.equal(faqItem.classList.contains("open"), false);
  });

  test("toggles video lightbox modal on reel card click", () => {
    const section = new MockElement("section", "gallery-section");
    const reelCard = new MockElement("div", "reel-card");
    reelCard.setAttribute("data-video", "https://example.com/reel.mp4");
    const modal = new MockElement("div", "video-modal", "videoModal");
    const closeBtn = new MockElement("button", "close-modal-btn", "closeModalBtn");

    modal.appendChild(closeBtn);
    section.appendChild(reelCard);
    section.appendChild(modal);

    const clickEvent = {
      target: reelCard,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handled = handleInteractiveSectionClick(clickEvent);
    assert.equal(handled, true);
    assert.equal(modal.classList.contains("active"), true);

    // Close button click
    const closeEvent = {
      target: closeBtn,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;
    const handledClose = handleInteractiveSectionClick(closeEvent);
    assert.equal(handledClose, true);
    assert.equal(modal.classList.contains("active"), false);
  });

  test("toggles FAQ chat drawer on trigger click", () => {
    const section = new MockElement("section", "faq-section");
    const chatBtn = new MockElement("button", "chat-trigger-btn", "faqChatBtn");
    const chatDrawer = new MockElement("div", "chat-drawer", "chatDrawer");
    const chatClose = new MockElement("button", "chat-close-btn", "chatCloseBtn");

    chatDrawer.appendChild(chatClose);
    section.appendChild(chatBtn);
    section.appendChild(chatDrawer);

    const openEvent = {
      target: chatBtn,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handled = handleInteractiveSectionClick(openEvent);
    assert.equal(handled, true);
    assert.equal(chatDrawer.classList.contains("active"), true);

    const closeEvent = {
      target: chatClose,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as any;

    const handledClose = handleInteractiveSectionClick(closeEvent);
    assert.equal(handledClose, true);
    assert.equal(chatDrawer.classList.contains("active"), false);
  });
});
