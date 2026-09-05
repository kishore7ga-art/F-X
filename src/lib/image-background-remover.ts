/**
 * Client-Side Smart Background Removal & Image Assets Engine
 *
 * Uses multi-point corner/edge sampling and boundary-connected BFS flood fill
 * to eliminate solid/gradient backgrounds while strictly preserving interior
 * elements (like the pages or text of an open book). Applies anti-aliasing
 * edge feathering for smooth transparent PNG outputs.
 */

export interface BgRemovalOptions {
  /** Color matching threshold distance (default: 38, range: 10-100) */
  tolerance?: number;
  /** Anti-aliasing edge feathering band in pixels (default: 15) */
  featherRadius?: number;
  /** Custom background color hex override (e.g. "#ffffff"), optional */
  targetColor?: string;
  /** Max width to scale for processing performance (default: 1200) */
  maxWidth?: number;
}

export interface ImageAssetItem {
  id: string;
  name: string;
  category: "books" | "badges" | "academics" | "devices" | "custom";
  url: string;
  width: number;
  height: number;
  hasTransparentBg?: boolean;
}

/**
 * Pinned Image Asset on a Section
 */
export interface PinnedSectionImage {
  id: string;
  sectionId: string;
  url: string;
  name: string;
  x: number; // px relative to section left
  y: number; // px relative to section top
  width: number; // px
  height?: number; // px
  scale?: number; // 0.5 - 2
  isFloating?: boolean; // smooth idle hover animation
  zIndex?: number;
}

/**
 * Built-in high-quality transparent assets available out of the box,
 * including academic books, open manuscripts, graduation badges, and devices.
 */
export const DEFAULT_IMAGE_ASSETS: ImageAssetItem[] = [
  {
    id: "book-academic-hardcover",
    name: "Academic Hardcover Book",
    category: "books",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    width: 220,
    height: 280,
    hasTransparentBg: false,
  },
  {
    id: "book-open-manuscript",
    name: "Open Research Book",
    category: "books",
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    width: 320,
    height: 220,
    hasTransparentBg: false,
  },
  {
    id: "academic-degree-diploma",
    name: "University Honors Degree",
    category: "academics",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    width: 260,
    height: 200,
    hasTransparentBg: false,
  },
  {
    id: "crest-gold-badge",
    name: "Excellence Gold Crest",
    category: "badges",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    width: 200,
    height: 200,
    hasTransparentBg: false,
  },
  {
    id: "campus-macbook-mockup",
    name: "Campus Tech Display",
    category: "devices",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    width: 320,
    height: 210,
    hasTransparentBg: false,
  },
];

/**
 * Calculates Euclidean distance between two RGB colors
 */
export function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

/**
 * Executes a client-side boundary-connected flood fill background removal.
 * Preserves interior pixels of the subject and creates smooth anti-aliased alpha borders.
 */
export async function removeImageBackground(
  imageSource: string,
  options: BgRemovalOptions = {},
): Promise<string> {
  const tolerance = options.tolerance ?? 42;
  const feather = options.featherRadius ?? 16;
  const maxWidth = options.maxWidth ?? 1200;

  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(imageSource);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve(imageSource);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 1. Identify Background Seeds (Corners and Edge Perimeter)
        const cornerSeeds: Array<{ r: number; g: number; b: number }> = [];
        const sampleCoords = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
          [Math.floor(width / 2), 0],
          [Math.floor(width / 2), height - 1],
          [0, Math.floor(height / 2)],
          [width - 1, Math.floor(height / 2)],
        ];

        if (options.targetColor) {
          const parsed = hexToRgb(options.targetColor);
          if (parsed) cornerSeeds.push(parsed);
        } else {
          for (const [sx, sy] of sampleCoords) {
            const idx = (sy! * width + sx!) * 4;
            cornerSeeds.push({
              r: data[idx]!,
              g: data[idx + 1]!,
              b: data[idx + 2]!,
            });
          }
        }

        // Helper to test if a pixel matches any background seed
        const isBgMatch = (r: number, g: number, b: number, distTolerance: number) => {
          for (const seed of cornerSeeds) {
            if (colorDistance(r, g, b, seed.r, seed.g, seed.b) <= distTolerance) {
              return true;
            }
          }
          return false;
        };

        // 2. Flood Fill (BFS) starting from all boundary edges
        const totalPixels = width * height;
        const visited = new Uint8Array(totalPixels);
        const isBg = new Uint8Array(totalPixels);
        const queue: number[] = [];

        // Seed boundary edge pixels
        for (let x = 0; x < width; x++) {
          // Top edge
          const topIdx = x;
          const topDataIdx = topIdx * 4;
          if (isBgMatch(data[topDataIdx]!, data[topDataIdx + 1]!, data[topDataIdx + 2]!, tolerance)) {
            visited[topIdx] = 1;
            isBg[topIdx] = 1;
            queue.push(topIdx);
          }

          // Bottom edge
          const btmIdx = (height - 1) * width + x;
          const btmDataIdx = btmIdx * 4;
          if (isBgMatch(data[btmDataIdx]!, data[btmDataIdx + 1]!, data[btmDataIdx + 2]!, tolerance)) {
            visited[btmIdx] = 1;
            isBg[btmIdx] = 1;
            queue.push(btmIdx);
          }
        }

        for (let y = 0; y < height; y++) {
          // Left edge
          const leftIdx = y * width;
          const leftDataIdx = leftIdx * 4;
          if (
            !visited[leftIdx] &&
            isBgMatch(data[leftDataIdx]!, data[leftDataIdx + 1]!, data[leftDataIdx + 2]!, tolerance)
          ) {
            visited[leftIdx] = 1;
            isBg[leftIdx] = 1;
            queue.push(leftIdx);
          }

          // Right edge
          const rightIdx = y * width + (width - 1);
          const rightDataIdx = rightIdx * 4;
          if (
            !visited[rightIdx] &&
            isBgMatch(data[rightDataIdx]!, data[rightDataIdx + 1]!, data[rightDataIdx + 2]!, tolerance)
          ) {
            visited[rightIdx] = 1;
            isBg[rightIdx] = 1;
            queue.push(rightIdx);
          }
        }

        // BFS expansion
        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++]!;
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          // 4-neighborhood
          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1,
          ];

          for (const n of neighbors) {
            if (n === -1 || visited[n]) continue;
            visited[n] = 1;

            const dIdx = n * 4;
            const r = data[dIdx]!;
            const g = data[dIdx + 1]!;
            const b = data[dIdx + 2]!;

            if (isBgMatch(r, g, b, tolerance)) {
              isBg[n] = 1;
              queue.push(n);
            }
          }
        }

        // 3. Alpha assignment with feathering along the background-foreground boundary
        for (let i = 0; i < totalPixels; i++) {
          const dIdx = i * 4;
          if (isBg[i]) {
            // Check minimum distance to seed for smooth feathering
            let minSeedDist = Infinity;
            const r = data[dIdx]!;
            const g = data[dIdx + 1]!;
            const b = data[dIdx + 2]!;

            for (const s of cornerSeeds) {
              const dist = colorDistance(r, g, b, s.r, s.g, s.b);
              if (dist < minSeedDist) minSeedDist = dist;
            }

            if (minSeedDist <= tolerance - feather) {
              // Completely transparent
              data[dIdx + 3] = 0;
            } else {
              // Soft feather edge
              const factor = (minSeedDist - (tolerance - feather)) / feather;
              data[dIdx + 3] = Math.max(0, Math.min(255, Math.round(factor * 255)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL("image/png");
        resolve(transparentDataUrl);
      } catch (err) {
        console.warn("[removeImageBackground] processing fallback:", err);
        resolve(imageSource);
      }
    };

    img.onerror = () => {
      console.warn("[removeImageBackground] could not load image for bg removal:", imageSource);
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}
