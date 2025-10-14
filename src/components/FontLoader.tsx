"use client";

import { useEffect } from "react";
import { availableFonts } from "@/lib/fonts";

interface FontLoaderProps {
  fontFamily: string;
}

export function FontLoader({ fontFamily }: FontLoaderProps) {
  useEffect(() => {
    if (!fontFamily) return;

    const font = availableFonts.find((f) => f.value === fontFamily);

    // Only load Google Fonts
    if (font?.type === "google") {
      const linkId = `font-${fontFamily.replace(/\s+/g, "-")}`;

      // Check if already loaded
      if (document.getElementById(linkId)) return;

      // Create and append link element
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}:300,400,500,600,700&display=swap`;
      link.rel = "stylesheet";
      link.setAttribute("data-font", fontFamily);

      document.head.appendChild(link);

      // Cleanup function
      return () => {
        const existingLink = document.getElementById(linkId);
        if (existingLink) {
          document.head.removeChild(existingLink);
        }
      };
    }
  }, [fontFamily]);

  return null;
}
