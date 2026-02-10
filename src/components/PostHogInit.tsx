"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

declare global {
  interface Window {
    __POSTHOG_INITIALIZED__?: boolean;
    posthog?: any;
  }
}

/**
 * Initializes PostHog on the client so any posthog.capture calls
 * from components work as expected.
 */
export function PostHogInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Avoid double-initializing in React Strict Mode / multiple mounts
    if (window.__POSTHOG_INITIALIZED__) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

    if (!apiKey) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "[PostHog] NEXT_PUBLIC_POSTHOG_KEY is missing; client analytics disabled.",
        );
      }
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      autocapture: true,
      capture_pageview: true,
    });

    if (process.env.NODE_ENV === "development") {
      // Expose posthog for easy testing in DevTools:
      // posthog.capture('my_custom_event', { property: 'value' })
      window.posthog = posthog;
      // eslint-disable-next-line no-console
      console.log("[PostHog] Initialized and attached to window.posthog");
    }

    window.__POSTHOG_INITIALIZED__ = true;
  }, []);

  return null;
}

