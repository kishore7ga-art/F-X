# The responsive canvas

How the editor and the preview show a site at a width that is not the width of
the screen it is being shown on — and what that emulation can and cannot do.

---

## Read this first

**The preview used to lie, and this is the line it lied with:**

```tsx
style={{ width: viewportWidth, maxWidth: "100%" }}
```

`maxWidth: "100%"` clamps the canvas to the editor pane. The canvas is also the
element every section's `@container` query is written against — so clamping the
box does not merely shrink the picture, **it changes which responsive rules
match**. Select 1920 in a 900px pane and the site was laid out for 900: the
breakpoints, the column counts and the type scale were all the 900px ones, while
the toolbar said 1920.

Two consequences, both silent:

- **Six of the ten desktop widths could not be previewed at all** on an ordinary
  laptop. 1536, 1600, 1920, 2560, 2880 and 3840 each collapsed to the pane.
- A section signed off at "1920" had never been seen at 1920.

The width and the zoom are separate now. The canvas keeps its **real** CSS
width; a `transform: scale()` is what makes it visible. Transforms are applied
after layout, so nothing inside the canvas can observe one.

---

## 1. The two numbers

| | What it decides | Who sees it |
| :--- | :--- | :--- |
| **viewport width** | what the site's CSS is laid out against | the site |
| **zoom** | how large that is drawn | the operator |

They read as the same thing and are not. Changing the width changes the layout.
Changing the zoom changes nothing about the layout at all.

The toolbar had one control meaning both — three buttons cycling a width, the
desktop one labelled `100%`, a percentage sitting where a width belonged. There
was no way to look more closely at a phone layout, and the only "zoom" on offer
silently switched the site to a different one.

---

## 2. The ladder

Thirty widths, in `src/lib/viewport-presets.ts`. Defaults in bold.

| Mode | Widths |
| :--- | :--- |
| Desktop | 1024, 1280, 1366, **1440**, 1536, 1600, 1920, 2560, 2880, 3840 |
| Tablet | 600, 640, 667, 720, **768**, 800, 834, 900, 960, 1024 |
| Phone | 320, 360, 375, **390**, 393, 412, 414, 430, 480, 540 |

`1024` is on two ladders on purpose: it is the desktop/tablet boundary, and
which side of it a layout falls on is exactly what somebody checking 1024 wants
to know. A stored 1024 is read back as **tablet**, on the grounds that anyone
picking the smallest desktop was more likely checking the boundary.

Zoom is `Fit`, 50%, 75%, 100%, 125%, 150%. `Fit` is not a level — it means
"whatever makes the selected width visible", a number derived from the pane, and
it is stored as `null` rather than as the percentage it currently works out to.
Storing the percentage would freeze it at whatever the pane happened to be when
it was chosen.

---

## 3. Where the state lives

One object, `{ mode, width, zoom }`, and **not in MongoDB**.

Which width somebody is inspecting is a property of the person and the minute,
not of the website. Storing it with the site would make it a value two open tabs
fought over, would push one operator's phone view onto a colleague's screen, and
— worst — would make switching to phone *a change to the page*, with a dirty
flag and a save.

It lives in `localStorage`, read through `useSyncExternalStore`
(`src/hooks/useViewport.ts`) rather than through `useState` plus an effect. Three
reasons, in order of severity:

- `localStorage` is a **source**, not initialisation. Another tab can change it,
  and the effect version would never notice. This one syncs across tabs.
- The server has no `localStorage`, so reading it lazily in `useState` would
  hydrate a mismatch. `getServerSnapshot` returns the plain default and React
  re-renders once with the stored value after hydration.
- React 19's linter rejects a synchronous `setState` in an effect body outright.

**Nothing about it reaches the published site.** `PreviewSiteViewer` renders two
different trees: live mode is a plain full-width canvas with no wrapper, no
frame and no transform — byte-for-byte what it always was — and preview mode
gets the canvas below.

---

## 4. How the scaling works

`src/components/preview/ResponsiveCanvas.tsx`, three nested boxes:

```
pane        measured; scrolls; a plain block, never a centring flex row
  fit box   width = selected x scale, height = measured height x scale
    scaled  position: absolute, width = the real selected width, transform: scale()
      canvas   .xite-site-canvas — the query container the sections see
```

Four details are load-bearing:

- **The fit box carries the scaled footprint.** A transform does not change the
  space an element occupies, so scaling a 3840px canvas to 24% would still
  reserve 3840px of layout and the pane would scroll sideways past several
  screens of nothing.
- **The scaled box is absolutely positioned.** Its height is content-driven and
  cannot be influenced by the height derived from it, so the `ResizeObserver`
  settles instead of oscillating.
- **The pane is a block with `margin: 0 auto` on the child**, not a flex row
  with `justify-content: center`. A centring flex container clips the *start* of
  an overflowing child — at 3840px the first 1000px would be unreachable.
- **No transform at all when the scale is 1.** `scale(1)` is not free: it
  establishes a stacking context and a containing block for fixed-position
  descendants, and some engines rasterise through it. At 100% the canvas is
  exactly what it was before this existed.

The device frame sits on the fit box, outside the transform, so its border stays
one real pixel rather than 0.47 of one. The floating-dock spacer is outside the
canvas for the same reason — inside, its 160px of clearance would shrink with
the zoom and the dock would cover the end of the page.

**The editor chrome is never scaled.** The toolbar, the drawers and the pane are
all outside `ResponsiveCanvas`.

---

## 5. What the emulation cannot do

The canvas is a `container-type: inline-size` element, not an iframe. That is a
deliberate trade — it costs nothing in editing fidelity, since sections are
edited in place — but it is an emulation, and these are its edges:

| | |
| :--- | :--- |
| Section `<style>` `@media` width queries | **correct** — rewritten to `@container` by `viewportMediaToContainer` |
| Tailwind `sm:` / `md:` / `lg:` | **correct** — the Play CDN sheet is mirrored with its width queries pointed at the container, and the original disabled |
| `vw` / `vh` units | **approximate** — they resolve against the real window, not the selected width |
| `window.innerWidth` in a section's own script | **the real viewport** — nothing can intercept it |
| `@media` inside a stylesheet a section `<link>`s | **not rewritten** — only inline `<style>` blocks are parsed |
| `@media` on anything but width (`hover`, `pointer`, `prefers-*`) | **the real device** — a phone width on a desktop still reports a mouse |

An iframe would close all six. It would also mean the editor's click-to-select,
inline text editing and drag interactions all had to cross a document boundary,
which is a large change to the part of the editor that currently works. It is
the right follow-up, not the right thing to bundle with this.

The Tailwind mirror is now **always on** in the editor and in preview mode. It
used to switch off at `100%`, which was correct then because the canvas really
was the window's width. It never is now, so without the mirror `md:` would
answer to the window while everything else answered to the canvas.

---

## 6. Tests

```
npm run test:unit      # 154, of which 25 cover the ladder and the scale rule
npm run test:canvas    # 1560 checks in a real Chromium
```

`viewport-presets.test.ts` covers the arithmetic: the thirty widths, the
defaults, storage validation, and the property that no pane size and no zoom can
change `width`.

`scripts/test-responsive-canvas.ts` covers what only a layout engine can answer.
It builds the real `sectionRuntimeCss` / `sectionResponsiveCss` output and the
real DOM shape, then drives **30 widths x 6 zooms x 2 pane sizes** through
Chromium and asserts, for each:

1. the canvas measures the selected width,
2. the section inside it fills that width,
3. the `@container` rules resolve at that width's breakpoint,
4. the *painted* width follows the zoom,
5. `Fit` leaves no horizontal overflow and reserves the scaled footprint.

Assertion 3 is the one that matters, and it is verified to fail: reintroducing
`maxWidth: "100%"` in the harness breaks **498 of the 1560 checks**, including
the band assertions — the silent wrong-layout symptom, caught rather than
assumed.

---

## 7. Known and open

- **The admin repo keeps its own seven-preset ladder.** `section-runtime.ts` is
  mirrored byte-for-byte between `xite-F` and `xite-admin` behind a drift gate,
  and the admin's template previews are real iframes at fixed widths — a
  different mechanism with a different set of trade-offs. Its `tablet` is 768
  and its `mobile` is 375, both of which are on this ladder, so the two agree
  where it matters. Migrating it is a follow-up.
- **`vw` units and external-stylesheet media queries stay approximate.** See §5.
  The fix is the iframe, above.
- **The editor no longer has a full-width mode.** The desktop ladder starts at
  1024 and there is no `100%`. This is the intended change — "however wide the
  window happens to be" is not a viewport anyone ships to — but it does mean the
  canvas is now always drawn at a chosen width, scaled to fit by default.
