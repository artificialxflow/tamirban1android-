# رفع سریع مشکل Migration

## مشکل: فایل .env ایجاد شده اما اسکریپت آن را نمی‌خواند

### راه حل سریع (3 روش)

#### روش 1: Export مستقیم (سریع‌ترین)

```bash
cd ~/tamirban1.ir

export MONGODB_URI="mongodb://tamirban_tamirban1:Ronak123Ronak@178.239.147.121:27017/tamirban_tamirban1"
export MONGODB_DB_NAME="tamirban_tamirban1"

node scripts/migrations/add-invoice-indexes.js
```

#### روش 2: اجرا با متغیرهای inline

```bash
cd ~/tamirban1.ir

MONGODB_URI="mongodb://tamirban_tamirban1:Ronak123Ronak@178.239.147.121:27017/tamirban_tamirban1" \
MONGODB_DB_NAME="tamirban_tamirban1" \
node scripts/migrations/add-invoice-indexes.js
```

#### روش 3: بررسی و اصلاح فایل .env

```bash
cd ~/tamirban1.ir

# بررسی وجود فایل
ls -la .env

# بررسی محتوای فایل
cat .env

# اگر فایل وجود دارد اما کار نمی‌کند، از export استفاده کنید
export $(cat .env | grep -v '^#' | xargs)

node scripts/migrations/add-invoice-indexes.js
```

### بررسی مسیر فایل .env

```bash
# بررسی مسیر فعلی
pwd

# باید در مسیر پروژه باشید
# مثال: /home/tamirban/tamirban1.ir

# بررسی وجود فایل .env
ls -la .env

# اگر فایل در مسیر دیگری است، به آن مسیر بروید
```

### تست سریع

```bash
# تست خواندن .env
node -e "require('fs').readFileSync('.env', 'utf8').split('\n').forEach(l => { const [k,v] = l.split('='); if(k && v) console.log(k, '=', v.substring(0,20)+'...'); })"
```

### اگر هنوز کار نمی‌کند

از روش 1 (export مستقیم) استفاده کنید - این روش همیشه کار می‌کند.

