# رفع مشکل Migration Script

## مشکل: "MONGODB_URI environment variable is not set"

### علت
متغیرهای محیطی که در cPanel Node.js App Manager تنظیم شده‌اند، فقط برای process‌های Node.js که از طریق Application Manager اجرا می‌شوند در دسترس هستند. وقتی مستقیماً `node scripts/migrations/add-invoice-indexes.js` را اجرا می‌کنید، این متغیرها در دسترس نیستند.

### راه حل 1: ایجاد فایل .env (توصیه می‌شود)

در terminal سرور:

```bash
cd ~/tamirban1.ir

# ایجاد فایل .env از متغیرهای cPanel
cat > .env << 'EOF'
MONGODB_URI=mongodb://tamirban_tamirban1:Ronak123Ronak@178.239.147.121:27017/tamirban_tamirban1
MONGODB_DB_NAME=tamirban_tamirban1
NODE_ENV=production
PORT=3124
NEXT_PUBLIC_SITE_URL=https://tamirban1.ir
JWT_SECRET=ey-name-to-behtarin-saraghaz-ey-name-to-behtarin-saraghaz
OTP_TEST_CODE=0000
OTP_EXPIRATION_MINUTES=5
EOF

# اجرای migration
node scripts/migrations/add-invoice-indexes.js
```

### راه حل 2: Export دستی متغیرها

```bash
cd ~/tamirban1.ir

export MONGODB_URI="mongodb://tamirban_tamirban1:Ronak123Ronak@178.239.147.121:27017/tamirban_tamirban1"
export MONGODB_DB_NAME="tamirban_tamirban1"

node scripts/migrations/add-invoice-indexes.js
```

### راه حل 3: استفاده از PM2 با متغیرهای محیطی

```bash
cd ~/tamirban1.ir

# اجرا با PM2 و متغیرهای محیطی
pm2 start scripts/migrations/add-invoice-indexes.js --name migration --no-autorestart --env production

# مشاهده خروجی
pm2 logs migration

# حذف بعد از اجرا
pm2 delete migration
```

### راه حل 4: استفاده از cPanel Terminal با متغیرهای Application Manager

اگر cPanel Terminal از متغیرهای Application Manager استفاده می‌کند:

```bash
cd ~/tamirban1.ir
node scripts/migrations/add-invoice-indexes.js
```

## بررسی موفقیت

بعد از اجرای موفق، باید این خروجی را ببینید:

```
✅ Loaded environment variables from .env
✅ Connected to MongoDB

📊 Creating indexes for 'invoices' collection...

✅ Index created: customerId (1)
✅ Index created: status (1)
✅ Index created: dueAt (1)
✅ Index created: marketerId (1)
✅ Index created: customerId (1) + status (1) + dueAt (-1)

✅ Migration completed successfully!
```

## نکات امنیتی

⚠️ **مهم**: فایل `.env` را در `.gitignore` نگه دارید و هرگز آن را commit نکنید!

```bash
# بررسی .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

