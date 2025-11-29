# راهنمای پیاده‌سازی Flutter برای تعمیربان

این سند راهنمای کامل برای پیاده‌سازی اپلیکیشن Flutter تعمیربان است که شامل اتصال به SMS (تابان) و نقشه نشان (Neshan Map) برای اندروید می‌شود.

---

## 📋 فهرست مطالب

1. [متغیرهای محیطی](#متغیرهای-محیطی)
2. [اتصال به SMS (تابان)](#اتصال-به-sms-تابان)
3. [اتصال به نقشه نشان (Neshan Map) برای اندروید](#اتصال-به-نقشه-نشان-neshan-map-برای-اندروید)
4. [API Endpoints](#api-endpoints)
5. [ساختار احراز هویت](#ساختار-احراز-هویت)
6. [نکات مهم](#نکات-مهم)

---

## 🔐 متغیرهای محیطی

تمام متغیرهای زیر باید در فایل `.env` یا در تنظیمات Flutter (مثلاً `flutter_dotenv` یا `flutter_config`) قرار گیرند:

```env
# ============================================
# تنظیمات عمومی
# ============================================
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://tamirban1.ir

# ============================================
# پایگاه داده (برای Backend - در Flutter نیاز نیست)
# ============================================
# MONGODB_URI=mongodb://...
# MONGODB_DB_NAME=tamirban_tamirban1

# ============================================
# احراز هویت OTP
# ============================================
OTP_TEST_CODE=0000
OTP_EXPIRATION_MINUTES=5
OTP_MAX_ATTEMPTS=5
JWT_SECRET=ey-name-to-behtarin-saraghaz-ey-name-to-behtarin-saraghaz
JWT_REFRESH_SECRET=ey-name-to-behtarin-saraghaz-ey-name-to-behtarin-saraghaz
BCRYPT_SALT_ROUNDS=10

# ============================================
# سرویس پیامکی تابان اس‌ام‌اس (IPPanel Edge API)
# ============================================
# مستندات: https://ippanelcom.github.io/Edge-Document/docs/
TABAN_SMS_BASE_URL=https://edge.ippanel.com/v1
TABAN_SMS_API_KEY=YTA1Njg1ZjQtOTQ5ZC00MjJmLWI4NWUtOTUwMjQ3MTU1MTA5YzkwZTk1YmRiNGNmMmVlZDkwNzMyMjgzN2I5NDgyNjU=
TABAN_SMS_SENDER_NUMBER=3000505
# شماره خط خدماتی برای ارسال OTP (از پنل تابان دریافت شود)

TABAN_SMS_PATTERN_CODE=0wopn74577wVmss
# کد پترن SMS برای ارسال OTP (از پنل تابان دریافت شود)

TABAN_SMS_PATTERN_VAR=verification-code
# نام متغیر Pattern در پنل تابان (باید با نام متغیر در Pattern مطابقت داشته باشد)
# مثال: "verification-code" برای %verification-code%

TABAN_SMS_PATTERN_MESSAGE=کد تایید اپلیکیشن تعمیربان %verification-code%
# متن Pattern از پنل تابان (با placeholder %verification-code% - API خودش جایگزین می‌کند)

# ============================================
# تنظیمات PWA (برای وب - در Flutter نیاز نیست)
# ============================================
# NEXT_PUBLIC_PWA_NAME=TamirBan
# NEXT_PUBLIC_PWA_SHORT_NAME=TamirBan
# NEXT_PUBLIC_PWA_DESCRIPTION=TamirBan CRM Progressive Web App

# ============================================
# نقشه نشان (Neshan Map API)
# ============================================
# برای وب‌اپلیکیشن: استفاده از API Key وب
NESHAN_API_KEY=web.eaba70d1a1b34fb2a2ad25306e8e58c7
NEXT_PUBLIC_NESHAN_API_KEY=web.eaba70d1a1b34fb2a2ad25306e8e58c7

# برای اندروید: باید از پنل نشان دریافت شود (نیاز به Bundle Name + Sign Key)
# NESHAN_ANDROID_API_KEY=
```

---

## 📱 اتصال به SMS (تابان)

### 1. دریافت API Key از پنل تابان

1. وارد پنل تابان شوید: https://ippanel.com
2. به بخش **API Keys** بروید
3. API Key موجود: `YTA1Njg1ZjQtOTQ5ZC00MjJmLWI4NWUtOTUwMjQ3MTU1MTA5YzkwZTk1YmRiNGNmMmVlZDkwNzMyMjgzN2I5NDgyNjU=`

### 2. دریافت Pattern Code

1. در پنل تابان، به بخش **Patterns** بروید
2. Pattern Code موجود: `0wopn74577wVmss`
3. نام متغیر Pattern: `verification-code`
4. متن Pattern: `کد تایید اپلیکیشن تعمیربان %verification-code%`

### 3. ساختار درخواست ارسال OTP

**Endpoint:** `POST https://tamirban1.ir/api/auth/otp/request`

**Request Body:**
```json
{
  "phone": "09123456789"
}
```

**Response (موفق):**
```json
{
  "success": true,
  "message": "کد تایید ارسال شد"
}
```

**Response (خطا):**
```json
{
  "success": false,
  "message": "خطا در ارسال پیامک",
  "code": "INTERNAL_SERVER_ERROR"
}
```

### 4. ساختار درخواست تایید OTP

**Endpoint:** `POST https://tamirban1.ir/api/auth/otp/verify`

**Request Body:**
```json
{
  "phone": "09123456789",
  "code": "3959"
}
```

**Response (موفق):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800,
    "user": {
      "_id": "65f1234567890abcdef12345",
      "mobile": "09123456789",
      "role": "SUPER_ADMIN"
    }
  }
}
```

### 5. استفاده از Token در درخواست‌های بعدی

برای تمام درخواست‌های بعدی، باید `accessToken` را در Header ارسال کنید:

```
Authorization: Bearer <accessToken>
```

### 6. Refresh Token

اگر `accessToken` منقضی شد، می‌توانید از `refreshToken` برای دریافت توکن جدید استفاده کنید:

**Endpoint:** `POST https://tamirban1.ir/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800
  }
}
```

---

## 🗺️ اتصال به نقشه نشان (Neshan Map) برای اندروید

### 1. دریافت API Key از پنل نشان

#### مرحله 1: ورود به پنل نشان

1. وارد پنل نشان شوید: https://platform.neshan.org/panel/
2. وارد حساب کاربری خود شوید (یا ثبت‌نام کنید)

#### مرحله 2: ایجاد کلید دسترسی جدید

1. در منوی سمت راست، روی **"ایجاد کلید دسترسی"** کلیک کنید
2. یک Modal باز می‌شود با فرم زیر:

#### مرحله 3: پر کردن فرم ایجاد کلید دسترسی

**نام (Name):**
- یک نام مناسب برای کلید انتخاب کنید (مثلاً: `TamirBan Android App`)

**سرویس‌ها (Services):**
- ✅ **"اپلیکیشن موبایل - android"** را انتخاب کنید (این گزینه را تیک بزنید)
- ❌ "نقشه وب" را انتخاب نکنید (این برای وب است)
- ❌ "اپلیکیشن موبایل - ios" را انتخاب نکنید (مگر اینکه iOS هم دارید)

**نام باندل (Bundle Name):**
- این همان **Package Name** اپلیکیشن Flutter شماست
- مثال: `com.tamirban.app` یا `ir.tamirban.mobile`
- **نکته مهم:** این Package Name باید دقیقاً با Package Name در فایل `android/app/build.gradle` شما مطابقت داشته باشد

**کلید امضاء (Sign Key):**
- این همان **SHA-1 Fingerprint** از Keystore اندروید شماست
- برای دریافت SHA-1:

  **روش 1: از Keystore (برای Production):**
  ```bash
  keytool -list -v -keystore android/app/keystore.jks -alias upload
  ```
  
  **روش 2: از Debug Keystore (برای Development):**
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
  
  **روش 3: از Gradle (برای Debug):**
  ```bash
  cd android
  ./gradlew signingReport
  ```
  
  در خروجی، دنبال `SHA1:` بگردید و مقدار آن را کپی کنید.

- **نکته مهم:** اگر بیش از یک Sign Key دارید (مثلاً Debug و Release)، آنها را با کاما (`,`) از هم جدا کنید:
  ```
  AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE,11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:AA:BB:CC:DD:EE
  ```

#### مرحله 4: ذخیره کلید

1. روی دکمه **"ذخیره"** کلیک کنید
2. API Key تولید شده را کپی کنید (مثلاً: `android.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. این API Key را در فایل `.env` یا تنظیمات Flutter قرار دهید:

```env
NESHAN_ANDROID_API_KEY=android.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. نصب کتابخانه Neshan Map در Flutter

در فایل `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  neshan_map_sdk: ^1.0.0  # یا آخرین نسخه
```

سپس:
```bash
flutter pub get
```

### 3. تنظیمات Android

#### 3.1. افزودن API Key به `AndroidManifest.xml`

در فایل `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <!-- سایر تنظیمات -->
        
        <!-- Neshan Map API Key -->
        <meta-data
            android:name="neshan_api_key"
            android:value="YOUR_NESHAN_ANDROID_API_KEY_HERE" />
    </application>
</manifest>
```

**نکته:** بهتر است از متغیر محیطی استفاده کنید تا API Key در کد hardcode نشود.

#### 3.2. افزودن Permission ها

در همان فایل `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Permission برای دسترسی به اینترنت -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Permission برای دسترسی به موقعیت (اختیاری - اگر می‌خواهید موقعیت کاربر را بگیرید) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <application>
        <!-- ... -->
    </application>
</manifest>
```

### 4. استفاده از Neshan Map در Flutter

#### مثال ساده:

```dart
import 'package:neshan_map_sdk/neshan_map_sdk.dart';

class MapScreen extends StatefulWidget {
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  NeshanMapController? mapController;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NeshanMap(
        onMapCreated: (NeshanMapController controller) {
          mapController = controller;
          // تنظیم موقعیت اولیه (تهران)
          controller.setCameraPosition(
            CameraPosition(
              target: LatLng(35.6892, 51.3890),
              zoom: 11.0,
            ),
          );
        },
        onMapClick: (LatLng position) {
          // وقتی کاربر روی نقشه کلیک می‌کند
          print('Clicked: ${position.latitude}, ${position.longitude}');
        },
      ),
    );
  }
}
```

#### افزودن Marker:

```dart
mapController?.addMarker(
  MarkerOptions(
    position: LatLng(35.6892, 51.3890),
    icon: BitmapDescriptor.defaultMarker,
    title: 'موقعیت ویزیت',
  ),
);
```

### 5. دریافت آدرس از مختصات (Reverse Geocoding)

برای تبدیل مختصات به آدرس، می‌توانید از API نشان استفاده کنید:

**Endpoint:** `GET https://api.neshan.org/v1/reverse`

**Headers:**
```
Api-Key: YOUR_NESHAN_ANDROID_API_KEY
```

**Query Parameters:**
```
lat=35.6892
lng=51.3890
```

**Response:**
```json
{
  "status": "OK",
  "formatted_address": "تهران، میدان آزادی، ...",
  "components": {
    "province": "تهران",
    "city": "تهران",
    "district": "...",
    "street": "..."
  }
}
```

---

## 🔌 API Endpoints

### Base URL

- **Production:** `https://tamirban1.ir/api`
- **Development:** `http://localhost:3124/api` (فقط برای تست - نیاز به اجرای backend)

### احراز هویت

#### 1. درخواست OTP
```
POST /api/auth/otp/request
Content-Type: application/json

{
  "phone": "09123456789"
}
```

#### 2. تایید OTP
```
POST /api/auth/otp/verify
Content-Type: application/json

{
  "phone": "09123456789",
  "code": "3959"
}
```

#### 3. Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

#### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "..."
}
```

### مشتریان (Customers)

#### 1. لیست مشتریان
```
GET /api/customers?page=1&limit=20&status=ACTIVE&city=تهران
Authorization: Bearer <accessToken>
```

#### 2. ایجاد مشتری
```
POST /api/customers
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "displayName": "شرکت تست",
  "phone": "09123456789",
  "city": "تهران",
  "status": "ACTIVE",
  "geoLocation": {
    "latitude": 35.6892,
    "longitude": 51.3890,
    "addressLine": "تهران، میدان آزادی"
  }
}
```

#### 3. دریافت مشتری
```
GET /api/customers/{id}
Authorization: Bearer <accessToken>
```

#### 4. به‌روزرسانی مشتری
```
PATCH /api/customers/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "displayName": "شرکت تست (ویرایش شده)",
  "status": "INACTIVE"
}
```

#### 5. حذف مشتری
```
DELETE /api/customers/{id}
Authorization: Bearer <accessToken>
```

### ویزیت‌ها (Visits)

#### 1. لیست ویزیت‌ها
```
GET /api/visits?page=1&limit=20&status=SCHEDULED&marketerId=...
Authorization: Bearer <accessToken>
```

#### 2. ایجاد ویزیت
```
POST /api/visits
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "customerId": "C-12345",
  "marketerId": "M-67890",
  "scheduledAt": "2024-03-15T10:00:00Z",
  "notes": "یادداشت ویزیت",
  "geoLocation": {
    "latitude": 35.6892,
    "longitude": 51.3890,
    "addressLine": "تهران، میدان آزادی"
  }
}
```

#### 3. دریافت ویزیت
```
GET /api/visits/{id}
Authorization: Bearer <accessToken>
```

#### 4. به‌روزرسانی ویزیت
```
PATCH /api/visits/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "ویزیت انجام شد"
}
```

#### 5. تغییر وضعیت ویزیت
```
PATCH /api/visits/{id}/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "CANCELLED"
}
```

### پیش‌فاکتورها (Invoices)

#### 1. لیست پیش‌فاکتورها
```
GET /api/invoices?page=1&limit=20&status=PENDING
Authorization: Bearer <accessToken>
```

#### 2. ایجاد پیش‌فاکتور
```
POST /api/invoices
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "customerId": "C-12345",
  "visitId": "V-67890",
  "items": [
    {
      "description": "خدمات تعمیر",
      "quantity": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ],
  "totalAmount": 100000,
  "dueDate": "2024-04-15"
}
```

---

## 🔑 ساختار احراز هویت

### 1. Flow کلی

```
1. کاربر شماره موبایل را وارد می‌کند
   ↓
2. درخواست OTP ارسال می‌شود (POST /api/auth/otp/request)
   ↓
3. کاربر کد OTP را وارد می‌کند
   ↓
4. کد تایید می‌شود (POST /api/auth/otp/verify)
   ↓
5. accessToken و refreshToken دریافت می‌شود
   ↓
6. در تمام درخواست‌های بعدی، accessToken در Header ارسال می‌شود
```

### 2. مدیریت Token

- **accessToken:** معتبر برای 1 ساعت (3600 ثانیه)
- **refreshToken:** معتبر برای 7 روز (604800 ثانیه)
- وقتی `accessToken` منقضی شد، از `refreshToken` برای دریافت توکن جدید استفاده کنید

### 3. ذخیره‌سازی Token

**توصیه:** Token ها را در `SecureStorage` یا `SharedPreferences` (با رمزنگاری) ذخیره کنید:

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// ذخیره Token
await storage.write(key: 'accessToken', value: accessToken);
await storage.write(key: 'refreshToken', value: refreshToken);

// خواندن Token
String? accessToken = await storage.read(key: 'accessToken');
```

---

## ⚠️ نکات مهم

### 1. امنیت

- **هرگز API Key ها را در کد hardcode نکنید**
- از متغیرهای محیطی یا فایل `.env` استفاده کنید
- Token ها را در `SecureStorage` ذخیره کنید
- در Production، از HTTPS استفاده کنید

### 2. مدیریت خطا

- همیشه Response را بررسی کنید (`success: true/false`)
- در صورت خطا، `message` و `code` را به کاربر نمایش دهید
- برای خطاهای 401 (Unauthorized)، کاربر را به صفحه Login هدایت کنید
- برای خطاهای 429 (Rate Limit)، به کاربر اطلاع دهید که باید صبر کند

### 3. محدودیت‌ها

- **OTP:** حداکثر 5 بار درخواست در ساعت برای هر شماره
- **OTP Expiration:** کد OTP تا 5 دقیقه معتبر است
- **OTP Attempts:** حداکثر 5 بار تلاش برای وارد کردن کد

### 4. تست

- در حالت Development، می‌توانید از کد تست `0000` استفاده کنید
- برای تست SMS واقعی، باید `TABAN_SMS_API_KEY` تنظیم شده باشد

### 5. Neshan Map

- **Bundle Name** باید دقیقاً با Package Name در `build.gradle` مطابقت داشته باشد
- **Sign Key** باید SHA-1 از Keystore باشد (برای Production) یا Debug Keystore (برای Development)
- اگر چند Sign Key دارید (Debug و Release)، همه را با کاما جدا کنید

---

## 📚 منابع و مستندات

### تابان SMS
- مستندات API: https://ippanelcom.github.io/Edge-Document/docs/
- پنل کاربری: https://ippanel.com

### Neshan Map
- مستندات API: https://platform.neshan.org/api/getting-started/
- مستندات Android SDK: https://platform.neshan.org/docs/android/getting-started/
- پنل کاربری: https://platform.neshan.org/panel/

### Flutter
- مستندات رسمی: https://flutter.dev/docs
- Secure Storage: https://pub.dev/packages/flutter_secure_storage

---

## 🆘 پشتیبانی

در صورت بروز مشکل:

1. لاگ‌های سرور را بررسی کنید
2. Response API را چک کنید
3. متغیرهای محیطی را بررسی کنید
4. با تیم Backend تماس بگیرید

---

**آخرین به‌روزرسانی:** 2024-03-15

