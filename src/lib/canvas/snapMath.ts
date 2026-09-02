import type { SnapGuide, DistanceBadge } from "@/stores/useVisualCanvasStore";

export interface NodeBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  right: number;
  bottom: number;
}

export interface SnapCalculationResult {
  snappedX: number;
  snappedY: number;
  guides: SnapGuide[];
  distanceBadges: DistanceBadge[];
}

const SNAP_THRESHOLD = 6; // 6px magnetic threshold

/**
 * Calculates magnetic snapping coordinates and visual guidelines against all sibling nodes.
 */
export function calculateMagneticSnap(
  draggedBounds: { x: number; y: number; width: number; height: number },
  siblingBounds: NodeBounds[],
  sectionBounds: { width: number; height: number }
): SnapCalculationResult {
  let snappedX = draggedBounds.x;
  let snappedY = draggedBounds.y;

  const currentCenterX = draggedBounds.x + draggedBounds.width / 2;
  const currentCenterY = draggedBounds.y + draggedBounds.height / 2;
  const currentRight = draggedBounds.x + draggedBounds.width;
  const currentBottom = draggedBounds.y + draggedBounds.height;

  const guides: SnapGuide[] = [];
  const distanceBadges: DistanceBadge[] = [];

  let minDeltaX = SNAP_THRESHOLD + 1;
  let minDeltaY = SNAP_THRESHOLD + 1;

  // 1. Check Section Center Snapping
  const sectionCenterX = sectionBounds.width / 2;
  const sectionCenterY = sectionBounds.height / 2;

  if (Math.abs(currentCenterX - sectionCenterX) <= SNAP_THRESHOLD) {
    snappedX = sectionCenterX - draggedBounds.width / 2;
    minDeltaX = Math.abs(currentCenterX - sectionCenterX);
    guides.push({
      id: "guide-section-center-x",
      orientation: "vertical",
      coordinate: sectionCenterX,
      color: "#06b6d4", // Cyan for canvas center
    });
  }

  if (Math.abs(currentCenterY - sectionCenterY) <= SNAP_THRESHOLD) {
    snappedY = sectionCenterY - draggedBounds.height / 2;
    minDeltaY = Math.abs(currentCenterY - sectionCenterY);
    guides.push({
      id: "guide-section-center-y",
      orientation: "horizontal",
      coordinate: sectionCenterY,
      color: "#06b6d4",
    });
  }

  // 2. Check Sibling Alignment Snapping (Left, Center, Right, Top, Middle, Bottom)
  for (const sibling of siblingBounds) {
    // --- Vertical Alignment (X Axis) ---
    // Left to Left
    const dLeftLeft = Math.abs(draggedBounds.x - sibling.x);
    if (dLeftLeft < SNAP_THRESHOLD && dLeftLeft < minDeltaX) {
      minDeltaX = dLeftLeft;
      snappedX = sibling.x;
      guides.push({
        id: `guide-left-${sibling.id}`,
        orientation: "vertical",
        coordinate: sibling.x,
        color: "#ec4899", // Magenta for element edges
      });
    }

    // Center to Center
    const dCenterX = Math.abs(currentCenterX - sibling.centerX);
    if (dCenterX < SNAP_THRESHOLD && dCenterX < minDeltaX) {
      minDeltaX = dCenterX;
      snappedX = sibling.centerX - draggedBounds.width / 2;
      guides.push({
        id: `guide-center-x-${sibling.id}`,
        orientation: "vertical",
        coordinate: sibling.centerX,
        color: "#ec4899",
      });
    }

    // Right to Right
    const dRightRight = Math.abs(currentRight - sibling.right);
    if (dRightRight < SNAP_THRESHOLD && dRightRight < minDeltaX) {
      minDeltaX = dRightRight;
      snappedX = sibling.right - draggedBounds.width;
      guides.push({
        id: `guide-right-${sibling.id}`,
        orientation: "vertical",
        coordinate: sibling.right,
        color: "#ec4899",
      });
    }

    // Left to Right (Side-by-side)
    const dLeftRight = Math.abs(draggedBounds.x - sibling.right);
    if (dLeftRight < SNAP_THRESHOLD && dLeftRight < minDeltaX) {
      minDeltaX = dLeftRight;
      snappedX = sibling.right;
      guides.push({
        id: `guide-left-right-${sibling.id}`,
        orientation: "vertical",
        coordinate: sibling.right,
        color: "#ec4899",
      });
    }

    // --- Horizontal Alignment (Y Axis) ---
    // Top to Top
    const dTopTop = Math.abs(draggedBounds.y - sibling.y);
    if (dTopTop < SNAP_THRESHOLD && dTopTop < minDeltaY) {
      minDeltaY = dTopTop;
      snappedY = sibling.y;
      guides.push({
        id: `guide-top-${sibling.id}`,
        orientation: "horizontal",
        coordinate: sibling.y,
        color: "#ec4899",
      });
    }

    // Center to Center
    const dCenterY = Math.abs(currentCenterY - sibling.centerY);
    if (dCenterY < SNAP_THRESHOLD && dCenterY < minDeltaY) {
      minDeltaY = dCenterY;
      snappedY = sibling.centerY - draggedBounds.height / 2;
      guides.push({
        id: `guide-center-y-${sibling.id}`,
        orientation: "horizontal",
        coordinate: sibling.centerY,
        color: "#ec4899",
      });
    }

    // Bottom to Bottom
    const dBottomBottom = Math.abs(currentBottom - sibling.bottom);
    if (dBottomBottom < SNAP_THRESHOLD && dBottomBottom < minDeltaY) {
      minDeltaY = dBottomBottom;
      snappedY = sibling.bottom - draggedBounds.height;
      guides.push({
        id: `guide-bottom-${sibling.id}`,
        orientation: "horizontal",
        coordinate: sibling.bottom,
        color: "#ec4899",
      });
    }

    // Top to Bottom (Stacked)
    const dTopBottom = Math.abs(draggedBounds.y - sibling.bottom);
    if (dTopBottom < SNAP_THRESHOLD && dTopBottom < minDeltaY) {
      minDeltaY = dTopBottom;
      snappedY = sibling.bottom;
      guides.push({
        id: `guide-top-bottom-${sibling.id}`,
        orientation: "horizontal",
        coordinate: sibling.bottom,
        color: "#ec4899",
      });
    }
  }

  // 3. Distance Gaps & Equal Spacing Badges
  for (let i = 0; i < siblingBounds.length; i++) {
    const sibA = siblingBounds[i];
    // Check horizontal gap between sibling and dragged node
    if (Math.abs(sibA.centerY - currentCenterY) < 30) {
      if (snappedX > sibA.right) {
        const gap = Math.round(snappedX - sibA.right);
        if (gap > 8 && gap < 200) {
          distanceBadges.push({
            id: `gap-h-${sibA.id}`,
            x: sibA.right + gap / 2,
            y: (sibA.centerY + currentCenterY) / 2,
            distance: gap,
            orientation: "horizontal",
          });
        }
      }
    }

    // Check vertical gap between sibling and dragged node
    if (Math.abs(sibA.centerX - currentCenterX) < 40) {
      if (snappedY > sibA.bottom) {
        const gap = Math.round(snappedY - sibA.bottom);
        if (gap > 8 && gap < 200) {
          distanceBadges.push({
            id: `gap-v-${sibA.id}`,
            x: (sibA.centerX + currentCenterX) / 2,
            y: sibA.bottom + gap / 2,
            distance: gap,
            orientation: "vertical",
          });
        }
      }
    }
  }

  return {
    snappedX,
    snappedY,
    guides,
    distanceBadges,
  };
}
