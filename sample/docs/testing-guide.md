# راهنمای تست پروژه تعمیربان

این راهنما شامل تست‌های دستی برای تمام قابلیت‌های پیاده‌سازی شده است.

## پیش‌نیازها

1. اطمینان از اجرای پروژه:
   ```bash
   npm run dev
   ```

2. بررسی متغیرهای محیطی در `.env.local`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `TABAN_SMS_API_KEY` (اختیاری برای تست)

3. اطمینان از اتصال به MongoDB

---

## بخش 1: تست احراز هویت (Authentication)

### 1.1 تست درخواست OTP

**روش 1: از طریق UI**
1. به آدرس `http://localhost:3000/auth` بروید
2. شماره موبایل خود را وارد کنید (مثال: `09123456789`)
3. روی دکمه "دریافت کد تایید" کلیک کنید
4. در حالت Development، کد `0000` را دریافت می‌کنید
5. بررسی کنید که پیام موفقیت نمایش داده شود

**روش 2: از طریق Postman/API**
```http
POST http://localhost:3000/api/auth/otp/request
Content-Type: application/json

{
  "phone": "09123456789"
}
```

**انتظارات:**
- پاسخ موفق: `{success: true, message: "کد تایید با موفقیت ارسال شد."}`
- در Development: کد `0000` در پاسخ (فقط برای تست)
- Rate Limiting: بعد از 5 درخواست در 1 ساعت، خطای 429 دریافت کنید

### 1.2 تست تایید OTP و ورود

**روش 1: از طریق UI**
1. کد `0000` را در فیلد "کد تایید" وارد کنید
2. روی دکمه "تایید و ورود" کلیک کنید
3. باید به صفحه `/dashboard` هدایت شوید
4. بررسی کنید که توکن‌ها در `localStorage` ذخیره شده‌اند:
   - `auth_tokens`: شامل `accessToken` و `refreshToken`
   - `auth_user`: اطلاعات کاربر

**روش 2: از طریق Postman/API**
```http
POST http://localhost:3000/api/auth/otp/verify
Content-Type: application/json

{
  "phone": "09123456789",
  "code": "0000"
}
```

**انتظارات:**
- پاسخ موفق با `accessToken` و `refreshToken`
- `expiresIn`: 3600 (1 ساعت)
- `refreshExpiresIn`: 604800 (7 روز)
- `user`: اطلاعات کاربر شامل `_id`, `mobile`, `role`

### 1.3 تست Refresh Token

**از طریق Postman/API:**
```http
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token_from_verify>"
}
```

**انتظارات:**
- دریافت جفت توکن جدید
- توکن‌های قبلی باطل نمی‌شوند (در نسخه فعلی)

### 1.4 تست Logout

**از طریق Postman/API:**
```http
POST http://localhost:3000/api/auth/logout
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "refreshToken": "<refresh_token>"
}
```

**از طریق UI:**
1. وارد داشبورد شوید
2. در sidebar، روی دکمه "خروج از حساب" کلیک کنید
3. باید به صفحه `/auth` هدایت شوید
4. بررسی کنید که `localStorage` پاک شده باشد

---

## بخش 2: تست Customers API

### 2.1 تست ایجاد مشتری (POST)

```http
POST http://localhost:3000/api/customers
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "displayName": "شرکت تست",
  "phone": "09123456789",
  "city": "تهران",
  "status": "ACTIVE",
  "tags": ["VIP", "مهم"]
}
```

**انتظارات:**
- پاسخ موفق با `status: 201`
- داده مشتری با `code` تولید شده (مثال: `C-24123`)
- `_id` و `createdAt` در پاسخ

### 2.2 تست لیست مشتریان (GET) - بدون فیلتر

```http
GET http://localhost:3000/api/customers
Authorization: Bearer <access_token>
```

**انتظارات:**
- پاسخ با ساختار:
  ```json
  {
    "success": true,
    "data": {
      "data": [...],
      "total": 10,
      "page": 1,
      "limit": 20
    }
  }
  ```

### 2.3 تست فیلترها

**فیلتر بر اساس وضعیت:**
```http
GET http://localhost:3000/api/customers?status=ACTIVE
Authorization: Bearer <access_token>
```

**فیلتر بر اساس شهر:**
```http
GET http://localhost:3000/api/customers?city=تهران
Authorization: Bearer <access_token>
```

**جستجو:**
```http
GET http://localhost:3000/api/customers?search=تست
Authorization: Bearer <access_token>
```

**فیلتر بر اساس بازاریاب:**
```http
GET http://localhost:3000/api/customers?marketerId=<marketer_id>
Authorization: Bearer <access_token>
```

### 2.4 تست Pagination

```http
GET http://localhost:3000/api/customers?page=2&limit=10
Authorization: Bearer <access_token>
```

**انتظارات:**
- `page: 2`
- `limit: 10`
- `data`: حداکثر 10 آیتم
- `total`: تعداد کل رکوردها

### 2.5 تست دریافت جزئیات مشتری (GET)

```http
GET http://localhost:3000/api/customers/<customer_id>
Authorization: Bearer <access_token>
```

**انتظارات:**
- اطلاعات کامل مشتری
- در صورت عدم وجود: `404` با پیام "مشتری یافت نشد."

### 2.6 تست ویرایش مشتری (PATCH)

```http
PATCH http://localhost:3000/api/customers/<customer_id>
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "displayName": "شرکت تست - ویرایش شده",
  "status": "LOYAL"
}
```

**انتظارات:**
- پاسخ موفق با داده به‌روز شده
- `updatedAt` تغییر کرده باشد

### 2.7 تست حذف مشتری (DELETE)

```http
DELETE http://localhost:3000/api/customers/<customer_id>
Authorization: Bearer <access_token>
```

**انتظارات:**
- پاسخ موفق: `{success: true, message: "مشتری با موفقیت حذف شد."}`
- در صورت عدم وجود: `404`

---

## بخش 3: تست UI - صفحه Customers

### 3.1 تست فیلترها در UI

1. به آدرس `http://localhost:3000/dashboard/customers` بروید
2. در بخش "فیلترها و جستجو":
   - **جستجو**: متن "تست" را وارد کنید → لیست فیلتر شود
   - **وضعیت**: "فعال" را انتخاب کنید → فقط مشتریان فعال نمایش داده شوند
   - **شهر**: "تهران" را وارد کنید → فقط مشتریان تهران نمایش داده شوند
   - **بازاریاب**: شناسه بازاریاب را وارد کنید
3. بررسی کنید که URL به‌روزرسانی شود (query parameters)
4. دکمه "پاک کردن همه" را تست کنید

### 3.2 تست Pagination در UI

1. حداقل 25 مشتری ایجاد کنید
2. در پایین جدول، Pagination را بررسی کنید:
   - نمایش "صفحه 1 از 2"
   - دکمه "بعدی" فعال باشد
   - کلیک روی "بعدی" → صفحه 2 نمایش داده شود
   - دکمه "قبلی" فعال شود
   - شماره صفحات نمایش داده شود

### 3.3 تست ایجاد مشتری از UI

1. روی دکمه "افزودن مشتری جدید" کلیک کنید
2. فرم را پر کنید:
   - نام مشتری: "مشتری تست UI"
   - شماره موبایل: "09123456789"
   - شهر: "تهران"
   - وضعیت: "فعال"
3. روی "ثبت مشتری" کلیک کنید
4. بررسی کنید:
   - پیام موفقیت نمایش داده شود
   - فرم پاک شود
   - لیست به‌روزرسانی شود (مشتری جدید در لیست باشد)

### 3.4 تست حذف مشتری از UI

1. در جدول، روی دکمه حذف یک مشتری کلیک کنید
2. بررسی کنید که مشتری از لیست حذف شود
3. صفحه به‌روزرسانی شود

---

## بخش 4: تست امنیت و Error Handling

### 4.1 تست محافظت از API (بدون Token)

```http
GET http://localhost:3000/api/customers
```

**انتظارات:**
- پاسخ `401 Unauthorized`
- پیام: "توکن احراز هویت ارسال نشده است."
- کد خطا: `UNAUTHORIZED`

### 4.2 تست Token نامعتبر

```http
GET http://localhost:3000/api/customers
Authorization: Bearer invalid_token
```

**انتظارات:**
- پاسخ `401 Unauthorized`
- پیام: "توکن نامعتبر است."
- کد خطا: `INVALID_TOKEN`

### 4.3 تست Token منقضی شده

1. یک Token منقضی شده بسازید (یا صبر کنید تا منقضی شود)
2. درخواست بفرستید

**انتظارات:**
- پاسخ `401 Unauthorized`
- پیام: "توکن منقضی شده است. لطفاً دوباره وارد شوید."
- کد خطا: `TOKEN_EXPIRED`

### 4.4 تست Validation Errors

```http
POST http://localhost:3000/api/customers
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "displayName": "ab",  // کمتر از 3 کاراکتر
  "phone": "123"  // نامعتبر
}
```

**انتظارات:**
- پاسخ `422 Unprocessable Entity`
- ساختار خطا:
  ```json
  {
    "success": false,
    "message": "خطا در اعتبارسنجی داده‌های ورودی",
    "code": "VALIDATION_ERROR",
    "errors": [
      {
        "field": "displayName",
        "message": "نام مشتری باید حداقل سه کاراکتر باشد"
      }
    ]
  }
  ```

### 4.5 تست Rate Limiting

1. 6 بار متوالی درخواست OTP بفرستید (برای همان شماره)
2. درخواست ششم باید خطا بدهد

**انتظارات:**
- پاسخ `429 Too Many Requests`
- پیام: "تعداد درخواست‌های OTP بیش از حد مجاز است..."
- Header: `X-RateLimit-Limit: 5`
- Header: `X-RateLimit-Remaining: 0`

---

## بخش 5: تست Session Management

### 5.1 تست تمدید خودکار Token

1. وارد داشبورد شوید
2. Token را در `localStorage` بررسی کنید
3. Token را منقضی کنید (یا صبر کنید)
4. یک درخواست API بفرستید (از طریق UI)
5. بررسی کنید که:
   - Token به‌صورت خودکار تمدید شود
   - درخواست موفق باشد
   - Token جدید در `localStorage` ذخیره شود

### 5.2 تست Auth Guard

1. بدون ورود، به آدرس `/dashboard/customers` بروید
2. باید به `/auth` هدایت شوید
3. بعد از ورود، دوباره به `/dashboard/customers` بروید
4. باید صفحه Customers نمایش داده شود

### 5.3 تست Logout و پاک کردن Session

1. وارد داشبورد شوید
2. روی "خروج از حساب" کلیک کنید
3. بررسی کنید:
   - `localStorage` پاک شود
   - به صفحه `/auth` هدایت شوید
   - در صورت بازگشت به `/dashboard`، دوباره به `/auth` هدایت شوید

---

## بخش 6: تست CORS

### 6.1 تست از Flutter/Web

1. از یک دامنه دیگر (یا localhost با پورت دیگر) درخواست بفرستید
2. بررسی کنید که Headerهای CORS درست تنظیم شده باشند:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

---

## چک‌لیست تست سریع

- [ ] درخواست OTP موفق
- [ ] تایید OTP و دریافت Token
- [ ] Refresh Token کار می‌کند
- [ ] Logout موفق
- [ ] ایجاد مشتری از API
- [ ] لیست مشتریان با Pagination
- [ ] فیلترها کار می‌کنند (وضعیت، شهر، جستجو)
- [ ] ویرایش مشتری
- [ ] حذف مشتری
- [ ] فیلترها در UI کار می‌کنند
- [ ] Pagination در UI کار می‌کند
- [ ] ایجاد مشتری از UI
- [ ] محافظت از API (بدون Token)
- [ ] Validation Errors
- [ ] Rate Limiting
- [ ] Auth Guard
- [ ] Session Management

---

## مشکلات رایج و راه‌حل

### مشکل: "توکن احراز هویت ارسال نشده است"
**راه‌حل:** مطمئن شوید که Header `Authorization: Bearer <token>` را ارسال می‌کنید

### مشکل: "MongoDB connection error"
**راه‌حل:** بررسی کنید که `MONGODB_URI` در `.env.local` درست تنظیم شده باشد

### مشکل: "Rate limit exceeded"
**راه‌حل:** یک ساعت صبر کنید یا شماره موبایل دیگری استفاده کنید

### مشکل: Pagination کار نمی‌کند
**راه‌حل:** بررسی کنید که `page` و `limit` در query parameters درست ارسال می‌شوند

---

## نکات مهم

1. **در Development**: کد OTP همیشه `0000` است
2. **Rate Limiting**: 5 درخواست OTP در ساعت برای هر شماره
3. **Token Expiry**: Access Token 1 ساعت، Refresh Token 7 روز
4. **Pagination Default**: 20 آیتم در هر صفحه

---

## گزارش باگ

اگر مشکلی پیدا کردید، لطفاً این اطلاعات را ثبت کنید:
- مراحل بازتولید مشکل
- پیام خطا
- کد خطا (اگر وجود دارد)
- Request/Response (در صورت امکان)

