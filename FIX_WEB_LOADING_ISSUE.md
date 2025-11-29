# 🔧 رفع مشکل لود نشدن اپلیکیشن در Flutter Web

## 🐛 مشکل:
- خطای `assertFailed` در کنسول مرورگر
- اپلیکیشن لود نمی‌شود و فقط loading spinner نمایش داده می‌شود
- خطا از `profile.dart` و `js_primitives.dart` می‌آید

## ✅ راه‌حل اعمال شده:

### 1. تغییر ساختار Navigation:
- **قبل:** استفاده از `AuthGuard` با `addPostFrameCallback` و `context.go` که باعث assert failed می‌شد
- **بعد:** استفاده از `redirect` در GoRouter با `refreshListenable`

### 2. تغییرات انجام شده:

#### `lib/app.dart`:
- تبدیل `ConsumerWidget` به `ConsumerStatefulWidget`
- استفاده از `ValueNotifier<AuthState?>` برای `refreshListenable` در GoRouter
- انتقال تمام routes از `app_router.dart` به `app.dart` برای دسترسی به `ref`
- استفاده از `redirect` callback در GoRouter به جای `AuthGuard`

#### `lib/core/navigation/app_router.dart`:
- ساده‌سازی: فقط تعریف route constants
- حذف `createRouter()` method (حالا در `app.dart` است)

### 3. مزایای این روش:
- ✅ بدون assert failed
- ✅ کار در Flutter Web
- ✅ مدیریت بهتر redirect ها
- ✅ استفاده از `refreshListenable` برای به‌روزرسانی خودکار

---

## 📝 تغییرات فایل‌ها:

### `lib/app.dart`:
- تبدیل به `ConsumerStatefulWidget`
- اضافه شدن `ValueNotifier` برای auth state
- اضافه شدن `refreshListenable` به GoRouter
- انتقال routes به این فایل

### `lib/core/navigation/app_router.dart`:
- ساده‌سازی: فقط route constants

---

## 🧪 تست:

بعد از این تغییرات:
1. اپلیکیشن باید بدون خطا لود شود
2. صفحه Login باید نمایش داده شود
3. بعد از ورود، باید به Dashboard هدایت شود
4. بدون assert failed در کنسول

---

## ⚠️ نکات:

- `AuthGuard` دیگر استفاده نمی‌شود (می‌توانید حذف کنید یا نگه دارید برای استفاده‌های دیگر)
- `refreshListenable` باعث می‌شود که router به صورت خودکار refresh شود وقتی auth state تغییر می‌کند
- `ValueNotifier` به عنوان bridge بین Riverpod و GoRouter استفاده می‌شود

---

**حالا اپلیکیشن باید بدون مشکل لود شود! 🚀**

