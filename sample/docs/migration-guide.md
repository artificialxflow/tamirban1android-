# راهنمای اجرای Migration Scripts

## اجرای Migration برای ایندکس‌های Invoices

این migration ایندکس‌های MongoDB را برای collection `invoices` ایجاد می‌کند تا جستجوها سریع‌تر شوند.

### پیش‌نیازها

1. اتصال به MongoDB از سرور
2. فایل `.env` در مسیر پروژه با متغیرهای زیر:
   - `MONGODB_URI` - آدرس اتصال به MongoDB
   - `MONGODB_DB_NAME` - نام دیتابیس (اختیاری، پیش‌فرض: "tamirban")

### نحوه اجرا

#### در Terminal سرور:

```bash
# 1. رفتن به مسیر پروژه
cd ~/tamirban1.ir

# 2. اطمینان از وجود فایل .env
ls -la .env

# 3. اجرای migration
node scripts/migrations/add-invoice-indexes.js
```

### خروجی مورد انتظار

```
✅ Connected to MongoDB

📊 Creating indexes for 'invoices' collection...

✅ Index created: customerId (1)
✅ Index created: status (1)
✅ Index created: dueAt (1)
✅ Index created: marketerId (1)
✅ Index created: customerId (1) + status (1) + dueAt (-1)

📋 Current indexes on 'invoices' collection:
   - _id_: {"_id":1}
   - customerId_1: {"customerId":1}
   - status_1: {"status":1}
   - dueAt_1: {"dueAt":1}
   - marketerId_1: {"marketerId":1}
   - customerId_1_status_1_dueAt_-1: {"customerId":1,"status":1,"dueAt":-1}

✅ Migration completed successfully!

🔌 Disconnected from MongoDB
```

### نکات مهم

1. **ایندکس‌های موجود**: اگر ایندکسی از قبل وجود داشته باشد، اسکریپت خطا نمی‌دهد و فقط پیام می‌دهد که ایندکس موجود است.

2. **ایمنی**: این migration فقط ایندکس ایجاد می‌کند و داده‌ها را تغییر نمی‌دهد.

3. **زمان اجرا**: برای دیتابیس‌های بزرگ، ایجاد ایندکس ممکن است چند دقیقه طول بکشد.

4. **بررسی دستی**: می‌توانید ایندکس‌ها را در MongoDB Compass یا mongo shell بررسی کنید:
   ```javascript
   db.invoices.getIndexes()
   ```

### رفع مشکلات

#### خطا: "MONGODB_URI environment variable is not set"
- مطمئن شوید فایل `.env` در مسیر پروژه وجود دارد
- بررسی کنید که `MONGODB_URI` در `.env` تنظیم شده باشد

#### خطا: "Connection timeout"
- بررسی کنید که MongoDB از سرور قابل دسترسی است
- بررسی کنید که IP سرور در whitelist MongoDB قرار دارد

#### خطا: "Authentication failed"
- بررسی کنید که username و password در `MONGODB_URI` صحیح است

### Migration‌های دیگر

برای ایندکس‌های دیگر collections (customers, visits, marketers) می‌توانید اسکریپت‌های مشابه ایجاد کنید.

