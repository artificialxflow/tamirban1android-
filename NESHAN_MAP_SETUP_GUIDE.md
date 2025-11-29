# راهنمای پر کردن فرم Neshan Map API Key

## 📋 اطلاعات مورد نیاز برای فرم

### 1️⃣ **نام (Name)**
یک نام مناسب برای این کلید دسترسی انتخاب کنید:

```
TamirBan Android App
```

یا هر نام دیگری که برای شما قابل تشخیص است مثل:
- `تعمیربان - اندروید`
- `TamirBan Mobile`

---

### 2️⃣ **سرویس‌ها (Services)** ✅
انتخاب کنید:
- ✅ **"اپلیکیشن موبایل - android"** (همان که الان انتخاب کرده‌اید)

---

### 3️⃣ **نام باندل (Bundle Name)**

این همان **Package Name** اپلیکیشن شماست. در حال حاضر:

```
com.example.tamirban1android
```

**⚠️ نکته مهم:** 
- می‌توانید از همین Package Name استفاده کنید
- اما بهتر است آن را تغییر دهید به: `ir.tamirban.app` یا `com.tamirban.mobile`
- اگر تغییر دادید، باید در فایل `android/app/build.gradle.kts` هم تغییر دهید

**اگر می‌خواهید تغییر دهید:**
1. فرم را فعلاً ببندید (Cancel)
2. اول Package Name را تغییر دهید
3. سپس دوباره فرم را باز کنید و Bundle Name جدید را وارد کنید

---

### 4️⃣ **کلید امضاء (Sign Key)**

این **SHA-1 Fingerprint** از Keystore شماست.

#### 🔧 روش دریافت SHA-1 (برای Debug):

**روش 1: استفاده از Gradle (توصیه می‌شود)**

در ترمینال پروژه، دستور زیر را اجرا کنید:

```bash
cd android
./gradlew signingReport
```

یا در PowerShell (Windows):
```powershell
cd android
.\gradlew signingReport
```

در خروجی، دنبال خطی بگردید که شامل `SHA1:` است، مثلاً:
```
Variant: debug
Config: debug
Store: C:\Users\YOUR_USER\.android\debug.keystore
Alias: AndroidDebugKey
MD5: XX:XX:XX:...
SHA1: **AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE** ← این را کپی کنید
SHA-256: XX:XX:XX:...
```

**کد SHA-1 را کپی کنید** (با دو نقطه‌ها `:` بین اعداد).

---

**روش 2: استفاده از keytool (برای Debug Keystore)**

```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

در PowerShell:
```powershell
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

---

#### 📝 اگر چند Sign Key دارید (Debug + Release)

اگر بعداً Keystore Release هم ساختید، می‌توانید هر دو را با کاما (`,`) جدا کنید:

```
AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE,FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:FF:EE:DD:CC:BB
```

اما برای الان فقط SHA-1 مربوط به Debug کافی است.

---

## 🎯 خلاصه - چه چیزی در فرم وارد کنید:

| فیلد | مقدار |
|------|-------|
| **نام** | `TamirBan Android App` |
| **سرویس‌ها** | ✅ اپلیکیشن موبایل - android |
| **نام باندل** | `com.example.tamirban1android` (یا `ir.tamirban.app` اگر تغییر دادید) |
| **کلید امضاء** | SHA-1 که از `gradlew signingReport` گرفتید |

---

## ✅ بعد از ذخیره فرم:

1. **API Key را کپی کنید** (مثلاً: `android.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
2. آن را در `AndroidManifest.xml` اضافه کنید
3. کتابخانه `neshan_map_sdk` را نصب کنید

---

## 🚀 مراحل بعدی (بعد از دریافت API Key):

بعد از اینکه فرم را ذخیره کردید و API Key را دریافت کردید، به من بگویید تا:
1. Package Name را تغییر دهیم (اگر می‌خواهید)
2. API Key را به AndroidManifest.xml اضافه کنیم
3. کتابخانه Neshan Map را نصب کنیم

