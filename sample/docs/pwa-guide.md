# راهنمای PWA (Progressive Web App) — تعمیربان

## 📱 معرفی

PWA (Progressive Web App) به کاربران امکان نصب اپلیکیشن روی موبایل و دسکتاپ را می‌دهد بدون نیاز به اپ استور. این ویژگی تجربه کاربری مشابه اپلیکیشن Native را فراهم می‌کند.

## ✅ کارهای انجام شده

### 1. Manifest.json
- ✅ فایل `public/manifest.json` ایجاد شد
- ✅ تنظیمات کامل (name, short_name, theme_color, icons)
- ✅ Shortcuts برای دسترسی سریع به صفحات اصلی
- ✅ اتصال به `app/layout.tsx`

### 2. Service Worker
- ✅ فایل `public/sw.js` ایجاد شد
- ✅ Cache Strategy:
  - Cache First برای فایل‌های استاتیک (CSS, JS, Images, Fonts)
  - Network First برای API calls و صفحات
- ✅ Offline Support با صفحه `offline.html`
- ✅ ثبت خودکار در `PWAInstaller` component

### 3. Meta Tags
- ✅ Apple Web App meta tags برای iOS
- ✅ Theme color
- ✅ Apple touch icon

### 4. PWA Installer Component
- ✅ کامپوننت `PWAInstaller` برای نمایش دکمه نصب
- ✅ مدیریت Install Prompt
- ✅ به‌روزرسانی خودکار Service Worker

## 📋 مراحل نصب برای کاربر

### Android (Chrome)

1. باز کردن سایت در Chrome
2. مشاهده پیام "نصب اپلیکیشن" در پایین صفحه
3. کلیک روی "نصب"
4. یا از منوی Chrome: ⋮ > "Add to Home screen"

### iOS (Safari)

1. باز کردن سایت در Safari
2. کلیک روی دکمه Share (□↑)
3. انتخاب "Add to Home Screen"
4. تایید نام و اضافه کردن

## 🔧 تنظیمات فنی

### آیکون‌های PWA

برای تولید آیکون‌ها از `favicon.png`:

```bash
# نصب sharp (فقط یک بار)
npm install --save-dev sharp

# تولید آیکون‌ها
node scripts/generate-pwa-icons.js
```

یا از [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) استفاده کنید.

### Service Worker

Service Worker به صورت خودکار ثبت می‌شود. برای به‌روزرسانی:

1. تغییر فایل `public/sw.js`
2. تغییر `CACHE_NAME` در Service Worker
3. Refresh صفحه (Service Worker جدید نصب می‌شود)

### Cache Strategy

- **Cache First**: برای فایل‌های استاتیک (`/_next/static/`, `/fonts/`, images)
- **Network First**: برای API calls و صفحات
- **Offline Fallback**: نمایش صفحه `offline.html` در صورت قطع اینترنت

## 🧪 تست PWA

### 1. تست Manifest

```bash
# در Chrome DevTools
1. F12 > Application > Manifest
2. بررسی نمایش اطلاعات PWA
3. بررسی آیکون‌ها
```

### 2. تست Service Worker

```bash
# در Chrome DevTools
1. F12 > Application > Service Workers
2. بررسی ثبت Service Worker
3. بررسی Cache Storage
```

### 3. تست Offline Mode

```bash
# در Chrome DevTools
1. F12 > Network > Offline
2. Refresh صفحه
3. باید صفحه offline.html نمایش داده شود
```

### 4. تست نصب

- **Android**: بررسی نمایش "Add to Home Screen"
- **iOS**: بررسی نمایش "Add to Home Screen" در Safari

## 🐛 رفع مشکلات

### مشکل: Service Worker ثبت نمی‌شود

**راه حل:**
1. بررسی Console برای خطاها
2. بررسی مسیر `/sw.js` (باید قابل دسترسی باشد)
3. بررسی HTTPS (Service Worker فقط در HTTPS کار می‌کند)

### مشکل: آیکون‌ها نمایش داده نمی‌شوند

**راه حل:**
1. بررسی وجود فایل‌ها در `public/icons/`
2. بررسی نام فایل‌ها (باید دقیقاً `icon-192.png`, `icon-512.png`, `icon-180.png`)
3. بررسی فرمت PNG
4. Clear Cache و Refresh

### مشکل: به‌روزرسانی Service Worker کار نمی‌کند

**راه حل:**
1. تغییر `CACHE_NAME` در `sw.js`
2. Unregister Service Worker قدیمی:
   ```javascript
   // در Console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
   });
   ```
3. Hard Refresh (Ctrl+Shift+R)

## 📊 ویژگی‌های PWA

### ✅ پیاده‌سازی شده

- [x] Manifest.json
- [x] Service Worker
- [x] Offline Support
- [x] Install Prompt
- [x] Cache Strategy
- [x] Auto Update

### 🔜 برای آینده (اختیاری)

- [ ] Push Notifications
- [ ] Background Sync
- [ ] Share Target API
- [ ] File System Access

## 📝 نکات مهم

1. **HTTPS ضروری است**: Service Worker فقط در HTTPS کار می‌کند (یا localhost)
2. **Cache Management**: برای به‌روزرسانی، `CACHE_NAME` را تغییر دهید
3. **آیکون‌ها**: حداقل 512x512 پیکسل برای کیفیت بهتر
4. **Testing**: همیشه در موبایل واقعی تست کنید

## 🔗 منابع

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)

