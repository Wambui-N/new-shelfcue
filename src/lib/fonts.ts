// Font configuration and utilities

export const availableFonts = [
  // Keep local Satoshi for legacy/default themes (not exposed in picker)
  { value: "Satoshi", label: "Satoshi", type: "local" },
  // Allowed Google Fonts for forms
  { value: "Inter", label: "Inter", type: "google" },
  { value: "Poppins", label: "Poppins", type: "google" },
  { value: "Lato", label: "Lato", type: "google" },
  { value: "Montserrat", label: "Montserrat", type: "google" },
  { value: "Manrope", label: "Manrope", type: "google" },
  { value: "Merriweather", label: "Merriweather", type: "google" },
  { value: "Playfair Display", label: "Playfair Display", type: "google" },
  { value: "Rubik", label: "Rubik", type: "google" },
  { value: "Raleway", label: "Raleway", type: "google" },
  { value: "Nunito", label: "Nunito", type: "google" },
] as const;

export function getFontFamily(fontName: string): string {
  const font = availableFonts.find((f) => f.value === fontName);

  if (!font) return "Satoshi, sans-serif";

  switch (font.type) {
    case "local":
      return "Satoshi, sans-serif";
    case "google":
      return `'${fontName}', system-ui, sans-serif`;
    default:
      return "sans-serif";
  }
}

export function getGoogleFontsUrl(fontNames: string[]): string {
  const googleFonts = fontNames.filter((name) => {
    const font = availableFonts.find((f) => f.value === name);
    return font?.type === "google";
  });

  if (googleFonts.length === 0) return "";

  // Load multiple weights for better typography
  const fontsQuery = googleFonts
    .map((font) => `${font.replace(/\s+/g, "+")}:wght@300;400;500;600;700`)
    .join("&family=");

  return `https://fonts.googleapis.com/css2?family=${fontsQuery}&display=swap`;
}

export function loadGoogleFont(fontName: string) {
  const font = availableFonts.find((f) => f.value === fontName);

  if (font?.type !== "google") return;

  const existingLink = document.querySelector(`link[data-font="${fontName}"]`);
  if (existingLink) return;

  const link = document.createElement("link");
  link.href = getGoogleFontsUrl([fontName]);
  link.rel = "stylesheet";
  link.setAttribute("data-font", fontName);
  document.head.appendChild(link);
}
