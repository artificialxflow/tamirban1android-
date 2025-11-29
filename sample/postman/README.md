# Postman Collections

این پوشه محل نگهداری کالکشن‌ها و محیط‌های Postman برای پروژه تعمیربان است. تا پیش از پیاده‌سازی کامل API، ساختار پیشنهادی زیر را دنبال کنید:

- `collections/` : کالکشن اصلی شامل مسیرهای Auth، Customers، Visits، Invoices و Reports.
- `environments/` : محیط‌های توسعه (`local`)، تست (`staging`) و عملیاتی (`production`).
- `shared/` : اسکریپت‌های مشترک (pre-request، test) و snippetهای تکرارپذیر.

## گام‌های آماده‌سازی
1. یک کالکشن پایه با نام **TamirBan CRM** ایجاد کنید و پوشه‌های زیر را در آن بسازید:
   - `Auth`
   - `Users`
   - `Customers`
   - `Visits`
   - `Invoices`
   - `Reports`
2. برای هر محیط، متغیرهای `baseUrl`, `otpTestCode`, `authToken` و `refreshToken` را تعریف کنید.
3. سناریوی ورود OTP را با حالت تست (`OTP_TEST_CODE`) شبیه‌سازی کرده و تست‌های اعتبارسنجی پاسخ را در تب `Tests` بنویسید.
4. در مرحلهٔ پیاده‌سازی API، مثال درخواست/پاسخ هر Endpoint را مستندسازی و مطابق با تغییرات به‌روز کنید.

> نکته: پس از اضافه شدن فایل‌های واقعی کالکشن، این README را با لینک و توضیحات دقیق‌تر به‌روزرسانی کنید.

---

## جریان تست OTP (محیط توسعه)

### متغیرهای پیشنهادی محیط `local`
| نام متغیر | مقدار نمونه | توضیح |
| --- | --- | --- |
| `baseUrl` | `http://localhost:3000` | دامنه اصلی Next.js |
| `testPhone` | `09123456789` | شماره آزمایشی برای ورود |
| `otpTestCode` | `0000` | مقدار ثابت در `.env.local` |
| `authToken` | _(خالی)_ | بعد از احراز هویت پر می‌شود |

### 1. درخواست کد تایید
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/otp/request`
- **Body (JSON)**:
  ```json
  {
    "phone": "{{testPhone}}"
  }
  ```
- **Tests پیشنهادی**:
  ```javascript
  pm.test("وضعیت موفقیت است", function () {
    pm.response.to.have.status(200);
  });
  pm.test("پاسخ شامل success=true است", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.eql(true);
    pm.expect(json.code).to.eql(pm.environment.get("otpTestCode"));
  });
  ```

### 2. تایید کد و دریافت JWT
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/otp/verify`
- **Body (JSON)**:
  ```json
  {
    "phone": "{{testPhone}}",
    "code": "{{otpTestCode}}"
  }
  ```
- **Tests پیشنهادی**:
  ```javascript
  pm.test("وضعیت موفقیت است", function () {
    pm.response.to.have.status(200);
  });
  const json = pm.response.json();
  pm.test("توکن و اطلاعات کاربر دریافت شد", function () {
    pm.expect(json.success).to.eql(true);
    pm.expect(json.token).to.be.a("string");
    pm.expect(json.user.mobile).to.eql(pm.environment.get("testPhone"));
  });
  pm.environment.set("authToken", json.token);
  ```

پس از موفقیت این دو درخواست می‌توانید از مقدار `authToken` در سایر مسیرهای نیازمند احراز هویت استفاده کنید. تا زمان پیاده‌سازی کامل ماژول‌ها، این سناریو تنها نقطه اتصال واقعی میان فرانت‌اند و دیتابیس است.

