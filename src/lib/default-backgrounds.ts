/**
 * Default Form Backgrounds
 * Predefined gradient backgrounds for the left section of forms
 */

export interface DefaultBackground {
  id: string;
  name: string;
  description: string;
  gradient: string; // CSS gradient string
  preview: string; // Preview color (for UI)
}

export const defaultBackgrounds: DefaultBackground[] = [
  {
    id: "gradient-1",
    name: "Ocean Breeze",
    description: "Cool blue gradient for a professional look",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    preview: "#667eea",
  },
  {
    id: "gradient-2",
    name: "Sunset Glow",
    description: "Warm orange-pink gradient for a vibrant feel",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    preview: "#f093fb",
  },
];

/**
 * Get a default background by ID
 */
export function getDefaultBackground(
  id: string,
): DefaultBackground | undefined {
  return defaultBackgrounds.find((bg) => bg.id === id);
}

/**
 * Get the CSS gradient string for a default background
 */
export function getDefaultBackgroundGradient(id: string): string | undefined {
  const bg = getDefaultBackground(id);
  return bg?.gradient;
}
