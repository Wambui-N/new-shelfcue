export type FormDisplayMode = "standalone" | "embed";

export type FormLayout = "simple" | "compact" | "conversational" | "hero";

export interface FormTheme {
  // Quick Branding (Level 1)
  primaryColor: string;
  fontFamily: string;
  borderRadius: number;
  // Optional brand assets
  logoUrl?: string;
  
  // Auto-generated secondary colors
  secondaryColors?: {
    light: string;
    lighter: string;
    dark: string;
    darker: string;
  };
  
  // Advanced Control (Level 2) - CSS variables
  customCSS?: string;
  
  // Background options
  background?: {
    type: "solid" | "gradient" | "image" | "animated";
    color?: string;
    gradient?: string;
    image?: string;
    overlay?: string;
  };
  
  // Typography
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    fontSize?: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
  };
  
  // Spacing
  spacing?: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  
  // Shadows
  shadows?: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface FormHeaderConfig {
  showLogo: boolean;
  showTitle: boolean;
  showDescription: boolean;
  logoUrl?: string;
  logoHeight?: number;
  titleAlignment?: "left" | "center" | "right";
}

export interface FormFooterConfig {
  showSocialLinks: boolean;
  showCompanyInfo: boolean;
  showPrivacyLinks: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export interface LayoutConfig {
  type: FormLayout;
  columns: number;
  spacing: "tight" | "normal" | "loose";
  showProgress: boolean;
  showStepNumbers: boolean;
  mobileBreakpoint: number;
}

// Default theme
export const defaultTheme: FormTheme = {
  primaryColor: "#3b82f6",
  fontFamily: "Inter, system-ui, sans-serif",
  borderRadius: 8,
  background: {
    type: "solid",
    color: "#ffffff"
  },
  typography: {
    headingFont: "Inter, system-ui, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    fontSize: {
      small: "0.875rem",
      medium: "1rem",
      large: "1.125rem",
      xlarge: "1.5rem"
    }
  },
  spacing: {
    small: "0.5rem",
    medium: "1rem",
    large: "1.5rem",
    xlarge: "2rem"
  },
  shadows: {
    small: "0 1px 3px rgba(0, 0, 0, 0.1)",
    medium: "0 4px 12px rgba(0, 0, 0, 0.1)",
    large: "0 8px 24px rgba(0, 0, 0, 0.15)"
  }
};

// Layout presets
export const layoutPresets: Record<FormLayout, LayoutConfig> = {
  simple: {
    type: "simple",
    columns: 1,
    spacing: "normal",
    showProgress: false,
    showStepNumbers: false,
    mobileBreakpoint: 768
  },
  compact: {
    type: "compact",
    columns: 2,
    spacing: "tight",
    showProgress: false,
    showStepNumbers: false,
    mobileBreakpoint: 768
  },
  conversational: {
    type: "conversational",
    columns: 1,
    spacing: "loose",
    showProgress: true,
    showStepNumbers: true,
    mobileBreakpoint: 768
  },
  hero: {
    type: "hero",
    columns: 1,
    spacing: "loose",
    showProgress: false,
    showStepNumbers: false,
    mobileBreakpoint: 1024
  }
};
