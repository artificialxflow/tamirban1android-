# 🔧 حالت Offline/Test Mode برای Development

## ✅ تغییرات انجام شده:

### 1. فعال‌سازی Offline Mode:
- ✅ **فقط در Development و Web:** `AppConfig.enableOfflineMode`
- ✅ **در Production یا Mobile:** غیرفعال (باید از backend استفاده شود)

### 2. استفاده از کد تست `0000`:
- ✅ **در `_handleVerifyOtp`:** اگر offline mode فعال باشد و کد `0000` باشد، مستقیماً mock login انجام می‌شود
- ✅ **بدون نیاز به Backend:** در حالت offline، مستقیماً بدون چک کردن backend، mock login انجام می‌شود

### 3. پیام راهنما:
- ✅ **در Request OTP:** اگر backend در دسترس نباشد، پیام نمایش داده می‌شود که می‌تواند از کد `0000` استفاده کند
- ✅ **در Verify OTP:** یک باکس راهنما اضافه شده که کد تست `0000` را نمایش می‌دهد

---

## 📝 نحوه استفاده:

### حالت Development (Web):
1. **Backend در دسترس نیست:**
   - شماره موبایل را وارد کنید (مثلاً: `09126723365`)
   - اگر backend در دسترس نباشد، پیام خطا نمایش داده می‌شود
   - مستقیماً به گام 2 بروید
   - کد `0000` را وارد کنید
   - ورود انجام می‌شود (mock login)

2. **Backend در دسترس است:**
   - شماره موبایل را وارد کنید
   - کد واقعی از backend دریافت می‌شود
   - کد را وارد کنید
   - ورود انجام می‌شود

### حالت Production (Mobile):
- **همیشه از Backend استفاده می‌شود**
- کد تست `0000` کار نمی‌کند
- باید backend در دسترس باشد

---

## 🔧 تنظیمات:

### `lib/core/config/app_environment.dart`:
```dart
/// Enable offline/test mode for development when backend is not available
/// In this mode, code '0000' can be used to login without backend
static bool get enableOfflineMode {
  return current == AppEnvironment.development && kIsWeb;
}
```

### منطق Mock Login:
```dart
Future<void> _mockLogin(AuthNotifier authNotifier, String phone) async {
  // ایجاد mock user با نقش SUPER_ADMIN
  final mockUser = User(
    id: 'test-user-${DateTime.now().millisecondsSinceEpoch}',
    fullName: 'کاربر تست',
    mobile: phone,
    role: 'SUPER_ADMIN',
    isActive: true,
  );

  // ایجاد mock tokens
  final mockTokens = AuthTokens(
    accessToken: 'mock-access-token-...',
    refreshToken: 'mock-refresh-token-...',
  );

  await authNotifier.login(mockUser, mockTokens);
}
```

---

## 📝 فایل‌های تغییر یافته:

1. **`lib/features/auth/presentation/login_page.dart`**:
   - بهبود `_handleVerifyOtp`: استفاده مستقیم از mock login برای کد `0000`
   - بهبود `_handleRequestOtp`: پیام مناسب برای offline mode
   - اضافه شدن راهنمای کد تست در `_VerifyOtpCard`

2. **`lib/core/config/app_environment.dart`**:
   - اضافه شدن `enableOfflineMode` getter

---

## 🧪 تست:

### Development (Web):
1. ✅ بدون backend، شماره موبایل را وارد کنید
2. ✅ پیام خطا نمایش داده می‌شود
3. ✅ کد `0000` را وارد کنید
4. ✅ ورود انجام می‌شود (mock login)

### Production (Mobile):
1. ✅ Backend باید در دسترس باشد
2. ✅ کد تست `0000` کار نمی‌کند
3. ✅ باید کد واقعی از backend دریافت شود

---

## ⚠️ نکات مهم:

1. **فقط برای Development:** این حالت فقط در development و web فعال است
2. **Production:** در production یا mobile، همیشه از backend استفاده می‌شود
3. **Mock User:** کاربر mock با نقش `SUPER_ADMIN` ایجاد می‌شود
4. **Build برای Mobile:** وقتی build گرفتید و روی گوشی گذاشتید، از production API استفاده می‌شود و کد تست کار نمی‌کند

---

**حالا می‌توانید بدون backend تست کنید! 🚀**

