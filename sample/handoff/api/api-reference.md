# TamirBan CRM — API Reference (Handoff)

این سند خلاصه‌ای از Endpointهای اصلی است تا همراه با Postman Collection به تیم اندروید منتقل شود.

## احراز هویت
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Headerهای مشترک:
```
Authorization: Bearer <token>
Content-Type: application/json
```

## مشتریان (Customers)
- `GET /api/customers` — فیلتر بر اساس `status`, `city`, `page`, `limit`
- `POST /api/customers` — ایجاد مشتری جدید
- `GET /api/customers/{id}`
- `PATCH /api/customers/{id}`
- `DELETE /api/customers/{id}`

نمونه پاسخ:
```json
{
  "success": true,
  "data": {
    "id": "C-25744",
    "displayName": "شرکت آرمان خودرو",
    "status": "ACTIVE"
  },
  "message": null
}
```

## ویزیت‌ها (Visits)
- `GET /api/visits?status=` — پشتیبانی از فیلترهای تاریخ، بازاریاب، مشتری
- `POST /api/visits`
- `GET /api/visits/{id}`
- `PATCH /api/visits/{id}`
- `PATCH /api/visits/{id}/status`
- `DELETE /api/visits/{id}`

## پیش‌فاکتورها (Invoices)
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/{id}`
- `PATCH /api/invoices/{id}`
- `DELETE /api/invoices/{id}`
- `PATCH /api/invoices/{id}/status`
- `GET /api/invoices/{id}/pdf`

## پیامک‌ها (SMS)
- `POST /api/sms/send` — ارسال OTP یا پیام اطلاع‌رسانی
- `GET /api/sms/logs`

## یادداشت‌ها
1. ساختار پاسخ استاندارد: `{ success, data, message, errors }`
2. خطاها:
   - `UNAUTHORIZED (401)`
   - `FORBIDDEN (403)`
   - `NOT_FOUND (404)`
   - `VALIDATION_ERROR (422)` — بخش `errors` شامل جزئیات است.
3. نرخ درخواست OTP محدود به 5 بار در ساعت برای هر شماره است.
4. برای استفاده از Postman:
   - ابتدا `tamirban.postman_environment.json` را Import کنید.
   - سپس Collection را وارد و متغیر `baseUrl` را بر اساس محیط تغییر دهید.

> برای جزئیات بیشتر به Postman Collection و فایل‌های JSON همراه مراجعه کنید. این سند صرفاً نمای کلی است.

