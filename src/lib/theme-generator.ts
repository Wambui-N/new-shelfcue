import type { FormTheme } from "@/types/form-display";

/**
 * Generate a color palette from a primary color
 */
export function generatePalette(primaryColor: string) {
  // Convert hex to HSL
  const hex = primaryColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Generate variations
  const light = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.min(95, Math.round(l * 100) + 20)}%)`;
  const lighter = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.min(98, Math.round(l * 100) + 35)}%)`;
  const dark = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.max(5, Math.round(l * 100) - 20)}%)`;
  const darker = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.max(2, Math.round(l * 100) - 35)}%)`;

  return { light, lighter, dark, darker };
}

/**
 * Generate CSS variables for advanced theming
 */
export function generateCSSVariables(theme: FormTheme): string {
  const palette = generatePalette(theme.primaryColor);

  return `
    :root {
      --shelf-primary: ${theme.primaryColor};
      --shelf-primary-light: ${palette.light};
      --shelf-primary-lighter: ${palette.lighter};
      --shelf-primary-dark: ${palette.dark};
      --shelf-primary-darker: ${palette.darker};
      --shelf-radius: ${theme.borderRadius}px;
      --shelf-font-family: ${theme.fontFamily};
      --shelf-shadow-small: ${theme.shadows?.small || "0 1px 3px rgba(0, 0, 0, 0.1)"};
      --shelf-shadow-medium: ${theme.shadows?.medium || "0 4px 12px rgba(0, 0, 0, 0.1)"};
      --shelf-shadow-large: ${theme.shadows?.large || "0 8px 24px rgba(0, 0, 0, 0.15)"};
      --shelf-spacing-small: ${theme.spacing?.small || "0.5rem"};
      --shelf-spacing-medium: ${theme.spacing?.medium || "1rem"};
      --shelf-spacing-large: ${theme.spacing?.large || "1.5rem"};
      --shelf-spacing-xlarge: ${theme.spacing?.xlarge || "2rem"};
    }
  `;
}

/**
 * Create a theme from brand colors (Level 1 - Quick Branding)
 */
export function createThemeFromBrand(
  primaryColor: string,
  fontFamily?: string,
): FormTheme {
  const palette = generatePalette(primaryColor);

  return {
    primaryColor,
    fontFamily: fontFamily || "Inter, system-ui, sans-serif",
    borderRadius: 8,
    secondaryColors: palette,
    background: {
      type: "solid",
      color: "#ffffff",
    },
    typography: {
      headingFont: fontFamily || "Inter, system-ui, sans-serif",
      bodyFont: fontFamily || "Inter, system-ui, sans-serif",
      fontSize: {
        small: "0.875rem",
        medium: "1rem",
        large: "1.125rem",
        xlarge: "1.5rem",
      },
    },
    spacing: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      xlarge: "2rem",
    },
    shadows: {
      small: "0 1px 3px rgba(0, 0, 0, 0.1)",
      medium: "0 4px 12px rgba(0, 0, 0, 0.1)",
      large: "0 8px 24px rgba(0, 0, 0, 0.15)",
    },
  };
}

/**
 * Validate theme configuration
 */
export function validateTheme(theme: Partial<FormTheme>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!theme.primaryColor) {
    errors.push("Primary color is required");
  } else if (!/^#[0-9A-F]{6}$/i.test(theme.primaryColor)) {
    errors.push("Primary color must be a valid hex color (e.g., #3b82f6)");
  }

  if (
    theme.borderRadius !== undefined &&
    (theme.borderRadius < 0 || theme.borderRadius > 50)
  ) {
    errors.push("Border radius must be between 0 and 50");
  }

  if (theme.background?.type === "image" && !theme.background.image) {
    errors.push("Background image URL is required when type is 'image'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
