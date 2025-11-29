# راهنمای ایجاد آیکون‌های PWA

## نیازمندی‌ها

برای PWA به آیکون‌های زیر نیاز داریم:

1. **icon-192.png** (192x192 پیکسل) - برای Android
2. **icon-512.png** (512x512 پیکسل) - برای Android
3. **icon-180.png** (180x180 پیکسل) - برای iOS

## روش 1: استفاده از favicon.png موجود

اگر `public/favicon.png` موجود است، می‌توانید آن را به سایزهای مختلف تبدیل کنید:

### با استفاده از آنلاین:
1. به [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) بروید
2. فایل `favicon.png` را آپلود کنید
3. آیکون‌های مختلف را دانلود کنید
4. فایل‌ها را در `public/icons/` قرار دهید

### با استفاده از ImageMagick (Command Line):
```bash
# نصب ImageMagick (در صورت نیاز)
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# تبدیل به سایزهای مختلف
cd public
mkdir -p icons
convert favicon.png -resize 192x192 icons/icon-192.png
convert favicon.png -resize 512x512 icons/icon-512.png
convert favicon.png -resize 180x180 icons/icon-180.png
```

### با استفاده از Node.js Script:
```bash
# نصب sharp (اگر نصب نشده)
npm install --save-dev sharp

# اجرای اسکریپت
node scripts/generate-pwa-icons.js
```

## روش 2: طراحی آیکون جدید

می‌توانید یک آیکون جدید طراحی کنید:
- حداقل 512x512 پیکسل
- پس‌زمینه شفاف یا رنگی
- لوگوی تعمیربان یا نماد مرتبط

## بررسی

بعد از ایجاد آیکون‌ها، مطمئن شوید که:
- فایل‌ها در `public/icons/` قرار دارند
- نام فایل‌ها دقیقاً `icon-192.png`, `icon-512.png`, `icon-180.png` است
- فایل‌ها فرمت PNG هستند

## تست

بعد از قرار دادن آیکون‌ها:
1. صفحه را refresh کنید
2. در Chrome DevTools > Application > Manifest بررسی کنید
3. آیکون‌ها باید نمایش داده شوند

