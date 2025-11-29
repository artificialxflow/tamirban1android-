# آماده‌سازی زیرساخت برای Flutter/Android

این سند مشخص می‌کند که چه چیزهایی باید از الان برای اپلیکیشن Flutter آماده شود.

## پاسخ سوال: آیا از الان نیاز به زیرساخت خاصی هست؟

### ✅ **بله، اما نه زیرساخت پیچیده!**

برای Flutter نیاز به موارد زیر است که باید **همزمان با توسعه وب** آماده شود:

---

## 1. **API Standardization (اولویت بالا)** ⚠️

### چرا مهم است؟
- Flutter و Web باید از **همان API** استفاده کنند
- اگر API برای وب بهینه شود، Flutter هم بهینه می‌شود
- جلوگیری از تغییرات بعدی که باعث شکستن Flutter می‌شود

### چه کارهایی باید انجام شود:

#### الف) ساختار پاسخ یکپارچه
```typescript
// ✅ ساختار استاندارد که باید از الان رعایت شود:
{
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

#### ب) کدهای خطای استاندارد
```typescript
// باید از الان تعریف شود:
enum ApiErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  // ...
}
```

#### ج) Headers استاندارد
```typescript
// همه API باید این headers را پشتیبانی کنند:
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
X-Request-ID: {uuid} // برای tracing
```

---

## 2. **Postman Collection کامل (اولویت بالا)** 📦

### چرا مهم است؟
- تیم Flutter می‌تواند **فوراً** شروع به کار کند
- تست API بدون نیاز به وب
- مستندات زنده و قابل اجرا

### چه کارهایی باید انجام شود:

#### الف) ساختار کالکشن
```
TamirBan API/
├── Auth/
│   ├── Request OTP
│   ├── Verify OTP
│   ├── Refresh Token
│   └── Logout
├── Customers/
│   ├── List Customers
│   ├── Get Customer
│   ├── Create Customer
│   ├── Update Customer
│   └── Delete Customer
├── Visits/
│   └── ...
├── Invoices/
│   └── ...
└── ...
```

#### ب) Environment Variables
```json
{
  "baseUrl": "https://tamirban1.ir/api",
  "authToken": "",
  "refreshToken": "",
  "testPhone": "09123456789",
  "testOtpCode": "0000"
}
```

#### ج) Pre-request Scripts
- خودکار کردن دریافت token
- تنظیم headers مشترک
- Generate request ID

#### د) Test Scripts
- بررسی ساختار پاسخ
- ذخیره خودکار token
- Validation responses

---

## 3. **API Documentation (اولویت متوسط)** 📚

### چرا مهم است؟
- تیم Flutter نیاز به مستندات دارد
- کاهش سوالات و خطاها

### چه کارهایی باید انجام شود:

#### الف) OpenAPI/Swagger (اختیاری اما توصیه می‌شود)
- اگر زمان دارید، Swagger UI اضافه کنید
- یا حداقل یک فایل Markdown با تمام endpoints

#### ب) Response Examples
```markdown
## GET /api/customers

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "شرکت آرمان",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "شماره موبایل معتبر نیست",
  "errors": [
    {
      "field": "phone",
      "message": "فرمت شماره موبایل صحیح نیست"
    }
  ]
}
```
```

---

## 4. **CORS Configuration (اولویت بالا)** 🔒

### چرا مهم است؟
- Flutter در مراحل اولیه ممکن است از WebView استفاده کند
- یا برای تست از Browser استفاده کند

### چه کارهایی باید انجام شود:
```typescript
// در next.config.ts یا middleware
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // در production محدود کنید
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

---

## 5. **Error Handling Standard (اولویت بالا)** ⚠️

### چرا مهم است؟
- Flutter باید بداند چگونه خطاها را handle کند
- UX بهتر در موبایل

### چه کارهایی باید انجام شود:

#### الف) Error Response Format
```typescript
// همه خطاها باید این ساختار را داشته باشند:
{
  success: false;
  message: string; // پیام کاربرپسند
  code?: string; // کد خطا برای برنامه‌نویسی
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

#### ب) HTTP Status Codes استاندارد
- 200: Success
- 201: Created
- 400: Bad Request (Validation)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limit
- 500: Server Error

---

## 6. **Pagination Standard (اولویت متوسط)** 📄

### چرا مهم است؟
- Flutter نیاز به pagination دارد
- باید از الان استاندارد شود

### چه کارهایی باید انجام شود:
```typescript
// Query Parameters استاندارد:
?page=1&limit=20&sort=createdAt&order=desc

// Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 7. **Authentication Flow (اولویت بالا)** 🔐

### چرا مهم است؟
- Flutter نیاز به Refresh Token دارد
- مدیریت session در موبایل متفاوت است

### چه کارهایی باید انجام شود:

#### الف) Refresh Token API
```typescript
POST /api/auth/refresh
Body: { refreshToken: string }
Response: { token: string, refreshToken: string }
```

#### ب) Token Expiry در Response
```typescript
{
  "token": "...",
  "expiresIn": 3600, // seconds
  "refreshToken": "...",
  "refreshExpiresIn": 604800 // 7 days
}
```

---

## 8. **File Upload/Download (اولویت پایین)** 📎

### اگر نیاز باشد:
- API برای آپلود تصاویر
- API برای دانلود PDF
- باید از الان در نظر گرفته شود

---

## ✅ **خلاصه: چه کارهایی از الان باید انجام شود؟**

### فوری (قبل از شروع Flutter):
1. ✅ **Postman Collection کامل** - تیم Flutter می‌تواند شروع کند
2. ✅ **API Response Standardization** - جلوگیری از تغییرات بعدی
3. ✅ **Error Handling Standard** - UX بهتر
4. ✅ **CORS Configuration** - امکان تست
5. ✅ **Refresh Token API** - مدیریت session

### متوسط (همزمان با توسعه):
6. ⚠️ **API Documentation** - Markdown یا Swagger
7. ⚠️ **Pagination Standard** - برای لیست‌ها

### پایین (بعد از MVP):
8. 📎 **File Upload/Download** - اگر نیاز باشد
9. 📊 **WebSocket/Real-time** - اگر نیاز باشد

---

## ❌ **چه کارهایی نیاز نیست از الان انجام شود؟**

- ❌ ساخت پروژه Flutter (بعد از تکمیل API)
- ❌ طراحی UI موبایل (بعد از تایید وب)
- ❌ Push Notifications (بعد از MVP)
- ❌ Offline Mode (بعد از MVP)

---

## 📋 **چک‌لیست آماده‌سازی برای Flutter**

این چک‌لیست در `todo.md` به‌روزرسانی شده است.

