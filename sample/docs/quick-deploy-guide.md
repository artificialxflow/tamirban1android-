# راهنمای سریع استقرار و رفع مشکل Build

## مشکل: "Could not find a production build in the '.next' directory"

این خطا زمانی رخ می‌دهد که `next build` اجرا نشده باشد.

## راه حل سریع

### روش 1: استفاده از اسکریپت (توصیه می‌شود)

```bash
# در مسیر پروژه
cd ~/tamirban1.ir

# اجرای اسکریپت استقرار کامل
bash scripts/deploy.sh
```

یا برای استقرار سریع (فقط build و restart):

```bash
bash scripts/quick-deploy.sh
```

### روش 2: دستی

```bash
# 1. رفتن به مسیر پروژه
cd ~/tamirban1.ir

# 2. تنظیم NODE_ENV
export NODE_ENV=production

# 3. ساخت build
npm run build

# 4. بررسی وجود پوشه .next
ls -la .next

# 5. Restart PM2
pm2 restart tamirban1.ir
```

یا اگر PM2 process وجود ندارد:

```bash
pm2 start server.js --name tamirban1.ir --env production
```

## بررسی وضعیت

```bash
# بررسی وضعیت PM2
pm2 status

# مشاهده لاگ‌ها
pm2 logs tamirban1.ir

# مشاهده لاگ‌های خطا
pm2 logs tamirban1.ir --err
```

## نکات مهم

1. **همیشه قبل از restart، build کنید:**
   ```bash
   npm run build && pm2 restart tamirban1.ir
   ```

2. **بررسی متغیرهای محیطی:**
   - مطمئن شوید `.env` در مسیر پروژه وجود دارد
   - متغیر `NODE_ENV=production` تنظیم شده باشد

3. **بررسی پوشه .next:**
   ```bash
   ls -la .next
   ```
   باید فایل `BUILD_ID` وجود داشته باشد.

4. **در صورت خطا در build:**
   ```bash
   # پاک کردن build قبلی
   rm -rf .next
   
   # ساخت مجدد
   npm run build
   ```

## رفع مشکل Customer Not Found

این warning در لاگ‌ها نشان می‌دهد که برخی پیش‌فاکتورها به مشتری‌هایی اشاره می‌کنند که حذف شده‌اند. این یک warning است و باعث خطا نمی‌شود، اما می‌توانید:

1. بررسی کنید که آیا مشتری‌ها حذف شده‌اند
2. یا پیش‌فاکتورهای مربوطه را حذف/ویرایش کنید

## دستورات مفید PM2

```bash
# مشاهده تمام processها
pm2 list

# Restart
pm2 restart tamirban1.ir

# Stop
pm2 stop tamirban1.ir

# Delete
pm2 delete tamirban1.ir

# مشاهده اطلاعات
pm2 info tamirban1.ir

# مشاهده لاگ‌های real-time
pm2 logs tamirban1.ir --lines 50

# پاک کردن لاگ‌ها
pm2 flush
```

