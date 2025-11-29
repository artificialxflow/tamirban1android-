"use client";

import { useEffect, useState } from "react";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // ثبت Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);

          // بررسی به‌روزرسانی Service Worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Service Worker جدید نصب شده، به‌روزرسانی در دسترس است
                  console.log("[PWA] New service worker available");
                  // می‌توانید یک notification نمایش دهید
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });

      // بررسی به‌روزرسانی Service Worker
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // مدیریت Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // بررسی اینکه آیا اپلیکیشن از قبل نصب شده است
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[PWA] Running in standalone mode");
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] User choice:", outcome);

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // نمایش دکمه نصب فقط در صورت نیاز
  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="rounded-2xl border-2 border-primary-300 bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* آیکون نصب */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary-400 bg-linear-to-br from-primary-500 to-primary-700 shadow-inner shadow-primary-700/30">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-6m0 0l-3 3m3-3l3 3M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">نصب اپلیکیشن تعمیربان</p>
              <p className="text-xs text-slate-600">برای دسترسی سریع‌تر، اپلیکیشن را نصب کنید</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-6m0 0l-3 3m3-3l3 3M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
              />
            </svg>
            نصب
          </button>
        </div>
      </div>
    </div>
  );
}

