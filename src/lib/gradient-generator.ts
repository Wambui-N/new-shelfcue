/**
 * Gradient Generator Utility
 * Generates CSS gradients from theme colors for background overlays
 */

export interface GradientOptions {
  type?: "linear" | "radial" | "conic";
  direction?: string; // e.g., "135deg", "to right", "to bottom right"
  stops?: number; // Number of color stops
  opacity?: number; // Overlay opacity (0-1)
}

/**
 * Generate a CSS gradient string from theme colors
 */
export function generateGradient(
  primaryColor: string,
  backgroundColor: string,
  accentColor?: string,
  options: GradientOptions = {},
): string {
  const {
    type = "linear",
    direction = "135deg",
    stops = 2,
    opacity = 0.8,
  } = options;

  // Convert hex colors to rgba for opacity control
  const primaryRgba = hexToRgba(primaryColor, opacity);
  const backgroundRgba = hexToRgba(backgroundColor, opacity);
  const accentRgba = accentColor
    ? hexToRgba(accentColor, opacity)
    : primaryRgba;

  switch (type) {
    case "linear":
      if (stops === 2) {
        return `linear-gradient(${direction}, ${primaryRgba} 0%, ${backgroundRgba} 100%)`;
      } else if (stops === 3) {
        return `linear-gradient(${direction}, ${primaryRgba} 0%, ${accentRgba} 50%, ${backgroundRgba} 100%)`;
      } else {
        return `linear-gradient(${direction}, ${primaryRgba}, ${backgroundRgba})`;
      }

    case "radial":
      return `radial-gradient(circle, ${primaryRgba} 0%, ${backgroundRgba} 100%)`;

    case "conic":
      return `conic-gradient(from ${direction}, ${primaryRgba}, ${accentRgba}, ${backgroundRgba}, ${primaryRgba})`;

    default:
      return `linear-gradient(${direction}, ${primaryRgba}, ${backgroundRgba})`;
  }
}

/**
 * Generate a gradient overlay for background images
 * This creates a gradient that overlays on top of an image
 */
export function generateImageOverlay(
  primaryColor: string,
  backgroundColor: string,
  overlayOpacity: number = 0.6,
): string {
  const primaryRgba = hexToRgba(primaryColor, overlayOpacity);
  const backgroundRgba = hexToRgba(backgroundColor, overlayOpacity * 0.5);

  // Create a gradient that goes from primary (top) to background (bottom)
  // This creates depth and ensures text readability
  return `linear-gradient(135deg, ${primaryRgba} 0%, ${backgroundRgba} 100%)`;
}

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex: string, alpha: number = 1): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generate multiple gradient presets
 */
export const gradientPresets = {
  subtle: (primary: string, background: string) =>
    generateGradient(primary, background, undefined, {
      type: "linear",
      direction: "135deg",
      opacity: 0.3,
    }),
  vibrant: (primary: string, background: string) =>
    generateGradient(primary, background, undefined, {
      type: "linear",
      direction: "135deg",
      opacity: 0.8,
    }),
  radial: (primary: string, background: string) =>
    generateGradient(primary, background, undefined, {
      type: "radial",
      opacity: 0.6,
    }),
};

/**
 * Generate an automatic gradient background with swirl effect
 * Creates a beautiful gradient from very light accent color (top) to full accent color (bottom)
 * with a subtle radial swirl for visual interest
 */
export function generateAutoGradient(
  accentColor: string,
  backgroundColor: string,
): string {
  // Convert accent color to very light version (almost white with hint of accent)
  const lightAccent = hexToRgba(accentColor, 0.15); // Very transparent at top
  const mediumAccent = hexToRgba(accentColor, 0.4); // Medium in middle
  const fullAccent = accentColor; // Full color at bottom
  
  // Create a multi-stop linear gradient with a radial swirl overlay effect
  // The gradient goes from very light (top) to full color (bottom)
  // We'll use a combination of linear and radial gradients for the swirl effect
  return `
    linear-gradient(180deg, ${lightAccent} 0%, ${mediumAccent} 50%, ${fullAccent} 100%),
    radial-gradient(ellipse at 30% 20%, ${hexToRgba(accentColor, 0.3)} 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, ${hexToRgba(accentColor, 0.2)} 0%, transparent 50%)
  `.trim();
}

