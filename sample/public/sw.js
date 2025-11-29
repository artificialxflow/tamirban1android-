/* eslint-disable no-restricted-globals */
// Service Worker برای PWA
// این فایل باید در public/sw.js قرار گیرد

const CACHE_NAME = 'tamirban-v1';
const OFFLINE_PAGE = '/offline.html';

// فایل‌های استاتیک که باید cache شوند
const STATIC_CACHE_FILES = [
  '/',
  '/dashboard',
  '/offline.html',
  '/manifest.json',
];

// نصب Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static files');
      return cache.addAll(STATIC_CACHE_FILES).catch((error) => {
        console.warn('[Service Worker] Failed to cache some files:', error);
      });
    })
  );
  self.skipWaiting(); // فعال کردن Service Worker فوراً
});

// فعال‌سازی Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // کنترل تمام صفحات
});

// مدیریت درخواست‌ها
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // رد کردن درخواست‌های غیر HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // استراتژی Cache First برای فایل‌های استاتیک
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/fonts')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            // فقط پاسخ‌های موفق را cache می‌کنیم
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // در صورت خطا، سعی می‌کنیم از cache استفاده کنیم
            return caches.match(request);
          });
      })
    );
    return;
  }

  // استراتژی Network First برای API calls و صفحات
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // برای API calls، cache نمی‌کنیم
          if (url.pathname.startsWith('/api/')) {
            return response;
          }
          // برای صفحات، cache می‌کنیم
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // در صورت خطا، برای صفحات، صفحه Offline را نمایش می‌دهیم
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE);
          }
          // برای API calls، خطا را برمی‌گردانیم
          return new Response(
            JSON.stringify({
              success: false,
              message: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
              code: 'NETWORK_ERROR',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // برای سایر درخواست‌ها، Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// مدیریت Push Notifications (اختیاری - برای آینده)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  // در آینده می‌توان Push Notifications را پیاده‌سازی کرد
});

// مدیریت Background Sync (اختیاری - برای آینده)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // در آینده می‌توان Background Sync را پیاده‌سازی کرد
});

