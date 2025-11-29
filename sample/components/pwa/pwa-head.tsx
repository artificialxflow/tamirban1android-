"use client";

import { useEffect } from "react";

export function PWAHead() {
  useEffect(() => {
    // افزودن meta tags و link tags برای PWA
    const addMetaTag = (name: string, content: string) => {
      if (typeof document !== "undefined" && !document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    const addLinkTag = (rel: string, href: string, attributes?: Record<string, string>) => {
      if (typeof document !== "undefined" && !document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            link.setAttribute(key, value);
          });
        }
        document.head.appendChild(link);
      }
    };

    // Manifest
    addLinkTag("manifest", "/manifest.json");

    // Theme color
    addMetaTag("theme-color", "#3b82f6");

    // Apple Web App
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "default");
    addMetaTag("apple-mobile-web-app-title", "تعمیربان");

    // Apple touch icon
    addLinkTag("apple-touch-icon", "/icons/icon-180.png");
  }, []);

  return null;
}

