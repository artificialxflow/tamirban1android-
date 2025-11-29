## چک‌لیست جامع توسعه اپ اندروید «تعمیربان» (Flutter)

### 1. فاز آماده‌سازی و هماهنگی
- [x] **بازبینی مستندات وب‌اپ**  
  - [x] مطالعه کامل `sample/todo.md` برای فهم ماژول‌ها، فازها و اولویت‌ها  
  - [x] مرور `sample/docs/android-design-handoff.md`، `flutter-preparation.md`، `ui-style-guide.md`  
  - [x] مرور `sample/handoff/static-ui/*` برای درک دقیق Layout، جدول‌ها، کارت‌ها و Empty/Loading states  
  - [x] بررسی `sample/handoff/api/api-reference.md` و Postman (`tamirban.postman_collection.json`, `tamirban.postman_environment.json`)  
- [x] **هماهنگی معماری بین وب و موبایل**  
  - [x] تصمیم‌گیری درباره ساختار لایه‌ها در Flutter (presentation, state management, data, domain)  
  - [x] انتخاب State Management: **Riverpod + Dio** با معماری feature-based (core/data/domain/features)  
  - [x] تعیین استراتژی نگه‌داری Token‌ها (Secure Storage + Refresh Token flow مطابق وب)  
  - [x] هماهنگی نام‌گذاری Routeها، Enumها، Statusها با Types موجود در `sample/lib/types`  

### 2. فاز راه‌اندازی پروژه Flutter
- [x] **ایجاد پروژه Flutter پایه**  
  - [x] پروژه Flutter ایجاد شده با نام `tamirban1android`
  - [x] **تغییر Package Name از `com.example.tamirban1android` به `ir.tamirban.app`** (ضروری برای Neshan Map API Key و انتشار نهایی)
    - [x] تغییر `namespace` و `applicationId` در `android/app/build.gradle.kts`
    - [x] تغییر Package در `MainActivity.kt` و جابجایی فایل به مسیر جدید (`ir/tamirban/app/`)
    - [x] تغییر Bundle ID در iOS (`ios/Runner.xcodeproj/project.pbxproj`)
    - [x] تغییر Bundle ID در macOS (`macos/Runner/Configs/AppInfo.xcconfig`)
    - [ ] مرجع: `flutter-implementation-guide.md` خطوط 217-220
  - [ ] تنظیم حداقل نسخه اندروید و iOS مطابق نیاز (minSdk، targetSdk) - بررسی نیازها  
- [ ] **تنظیم زبان، RTL و فونت ایران یکان**  
  - [ ] افزودن فونت «ایران یکان» به `pubspec.yaml` و پوشه `assets/fonts` (فایل‌های واقعی فونت هنوز اضافه نشده‌اند)  
  - [x] تنظیم `locale` پیش‌فرض `fa_IR` و `directionality` راست‌چین در `MaterialApp`  
  - [x] تعریف Theme اصلی (رنگ‌ها، تایپوگرافی، radius، shadows) مطابق `sample/docs/ui-style-guide.md`  
  - [x] تضمین RTL در AppBar، Navigation، لیست‌ها و فرم‌ها  
- [x] **تنظیم ساختار پوشه‌ها**  
  - [x] ایجاد ساختار ماژولار:  
    - [x] `lib/core/` (theme، constants، utils، error handling، networking)  
    - [x] `lib/data/` (models، dtos، api clients، repositories)  
    - [x] `lib/domain/` (entities، usecases – در صورت نیاز)  
    - [x] `lib/features/*` (آغاز با `dashboard`، بقیه ماژول‌ها در فازهای بعدی)  
  - [x] آماده‌سازی فولدر `widgets/common` برای اجزای مشترک (Buttons, Inputs, Modals, Tables)  
- [ ] **هویت بصری و آیکن‌ها**  
  - [ ] استفاده از `sample/public/favicon.png` به عنوان آیکن اصلی اپ (Android/iOS)
  - [ ] تبدیل favicon.png به آیکون‌های مختلف سایز برای Android (`android/app/src/main/res/mipmap-*/`)
  - [ ] استفاده از همان آیکن در Splash Screen/Logo داخل اپ  
  - [ ] در صورت نیاز به خروجی‌های دیگر (PWA، WebView)، همین فایل مبنا قرار گیرد
  - [ ] مرجع: `PROJECT_STATUS_REPORT.md` بخش "آیکون اپلیکیشن"  

### 3. فاز اتصال به بک‌اند و تنظیم محیط
- [x] **پیکربندی Environment در Flutter**  
  - [x] تعریف ساختار config برای آدرس سرور (Base URL) و مسیرها (از روی `sample/env.local` و API Reference)  
  - [x] تعریف دو محیط حداقل: Development (`http://localhost:3124/api`)، Production (`https://tamirban1.ir/api`) در `AppConfig`  
  - [ ] پیاده‌سازی مکانیزم پیشرفته‌تر load config (Build Flavors یا env جداگانه — اختیاری برای فاز‌های بعدی)  
- [x] **کلاینت HTTP و استاندارد API**  
  - [x] انتخاب کتابخانه HTTP (dio)  
  - [x] پیاده‌سازی interceptor برای:  
    - [x] افزودن Headerهای استاندارد: `Content-Type`, `Accept` و `X-Request-ID`  
    - [x] افزودن Header `Authorization` بر اساس توکن ذخیره‌شده  
    - [x] مدیریت خودکار Refresh Token بر اساس `POST /api/auth/refresh` (در صورت 401، خودکار refresh می‌کند)  
  - [x] پیاده‌سازی مدل استاندارد پاسخ بر اساس `{success, data, message, errors, pagination}`  
  - [x] پیاده‌سازی `ApiErrorCode` enum و `ApiException` کلاس در `lib/core/errors/api_error.dart` (مرجع: `sample/lib/utils/errors.ts`)
  - [x] افزودن فیلد `code` به `ApiResponse` برای هماهنگی با ساختار خطای backend
  - [ ] استفاده از `ApiException.fromDioError()` در Repositoryها برای تبدیل خطاهای Dio به ApiException
  - [ ] هندل‌کردن خطاها در UI بر اساس `ApiErrorCode` (UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, ...)  
  - [ ] نمایش پیام‌های خطای فارسی به کاربر بر اساس کد خطا (مرجع: `sample/lib/utils/errors.ts`)  
- [ ] **مدل‌ها و Repositories**  
  - [x] تعریف مدل‌های Dart برای User و AuthTokens بر اساس `sample/docs/data-model.md`  
  - [x] ایجاد AuthRepository متصل به `/api/auth/*`  
  - [ ] تعریف مدل‌ها و Repository برای Customers، Visits، Invoices، Marketers، SMSLog  
  - [ ] نوشتن Mapperها بین JSON و مدل‌ها با توجه به نام فیلدها در Postman و `api-reference.md`  

### 4. فاز احراز هویت و نشست (Auth & Session)
- [x] **پیاده‌سازی OTP Login مطابق وب**  
  - [x] صفحه ورود با ورودی شماره موبایل (هم‌چون `OTPCard` وب) - `lib/features/auth/presentation/login_page.dart`
  - [x] اتصال به `POST /api/auth/otp/request` (نمایش پیام موفقیت/خطا) - مرجع: `flutter-implementation-guide.md` خطوط 99-125
  - [x] صفحه وارد کردن OTP با ورودی ۴ رقمی و گزینه ارسال مجدد (کد تست 0000) - مرجع: `flutter-implementation-guide.md` خط 38 (`OTP_TEST_CODE=0000`)
  - [x] اتصال به `POST /api/auth/otp/verify` و دریافت User + Tokens - مرجع: `flutter-implementation-guide.md` خطوط 127-155
  - [x] هدایت به صفحه داشبورد پس از ورود موفق
  - [ ] افزودن تایمر اعتبار OTP (5 دقیقه) مطابق `OTP_EXPIRATION_MINUTES` در UI (مرجع: `flutter-implementation-guide.md` خط 39)
  - [ ] افزودن شمارش‌گر محدودیت تلاش‌ها (حداکثر 5 بار) مطابق `OTP_MAX_ATTEMPTS` در UI (مرجع: `flutter-implementation-guide.md` خط 40)
  - [ ] نمایش پیام خطا در صورت منقضی شدن کد یا رسیدن به حد تلاش‌ها  
- [x] **مدیریت توکن و نشست**  
  - [x] ذخیره AccessToken و RefreshToken در Secure Storage (`lib/core/storage/token_storage.dart`)
  - [x] پیاده‌سازی AuthProvider با Riverpod برای مدیریت وضعیت احراز هویت (`lib/features/auth/providers/auth_provider.dart`)
  - [x] پیاده‌سازی Refresh Token Flow (اتصال به `/api/auth/refresh`) - خودکار در `ApiClient` interceptor
  - [x] مدیریت خروج (`/api/auth/logout`) و پاک کردن توکن‌ها (مرجع: `flutter-implementation-guide.md` خطوط 439-448)
  - [x] گارد صفحات (Route Guard) بر اساس وضعیت لاگین - استفاده از GoRouter `redirect` با `refreshListenable` (مرجع: `app.dart`)
  - [x] افزودن دکمه Logout به داشبورد
  - [x] مدیریت خودکار refresh token در `ApiClient` با queue برای جلوگیری از چند درخواست همزمان
  - [x] رفع مشکل navigation با refactoring GoRouter در `app.dart` (حذف AuthGuard widget wrapper)  
- [ ] **مدیریت نقش‌ها و RBAC در اپ**  
  - [ ] تعریف enum نقش‌ها و permissions بر اساس `sample/lib/permissions/role-permissions.ts`  
  - [ ] نگه‌داری نقش کاربر در State (مثلاً داخل AuthProvider/Riverpod)  
  - [ ] مخفی/غیرفعال کردن المان‌های UI بر اساس permission (شبیه `ProtectedComponent` وب)  

### 5. فاز طراحی هسته UI (Shell, Navigation, Theme)
- [x] **ساخت App Shell مطابق وب**  
  - [x] پیاده‌سازی Layout اصلی: AppBar بالا + Drawer (با الهام از `components/layout/app-shell.tsx` و `dashboard` وب)  
  - [x] طراحی صفحه داشبورد placeholder با کارت‌های KPI نمونه (بر اساس `dashboard.html` و Next.js `dashboard/page.tsx`)  
  - [x] رعایت Design Tokens (رنگ‌ها، Typo، Spacing) از `ui-style-guide.md`  
  - [x] ساخت AppShell widget با Drawer navigation و نمایش اطلاعات کاربر  
- [x] **ناوبری (Navigation)**  
  - [x] تعریف Routeهای اصلی: `/auth`, `/dashboard`, `/customers`, `/visits`, `/invoices`, `/marketers`, `/sms`, `/reports`, `/settings`  
  - [x] انتخاب Navigator: **go_router** با پشتیبانی Deep Link  
  - [x] مدیریت Back Stack برای سناریوهای OTP، Detail Pages و Modals
  - [x] پیاده‌سازی Route Guard با GoRouter `redirect` callback و `refreshListenable` برای واکنش به تغییرات AuthState
  - [x] رفع مشکل `assertFailed` در Flutter Web با refactoring navigation logic  

### 6. فاز ماژول Auth UI (صفحات ورود)
- [x] **صفحه ورود (شماره موبایل)**  
  - [x] طراحی مشابه UI وب (card، توضیحات، لوگو/عنوان) بر اساس `components/auth/otp-card.tsx`  
  - [x] اعتبارسنجی شماره موبایل، دکمه ارسال OTP، نمایش پیام خطا/موفقیت  
- [x] **صفحه/Modal وارد کردن OTP**  
  - [x] ورودی OTP با یک فیلد 4 رقمی  
  - [x] پیاده‌سازی حالت تست با کد `0000` برای offline mode
  - [x] نمایش راهنمای کد تست در UI (زمانی که offline mode فعال است)
  - [x] بهبود پیام‌های خطا و نمایش راهنمای استفاده از کد تست
  - [ ] تایمر اعتبار (5 دقیقه) مطابق `OTP_EXPIRATION_MINUTES` (بعداً)  
  - [x] نمایش Errorهای اعتبارسنجی از بک‌اند  

### 7. فاز ماژول Customers
- [ ] **لیست مشتریان**  
  - [ ] طراحی صفحه Customers مطابق `sample/handoff/static-ui/customers.html` و Next.js `components/customers/*`  
  - [ ] اتصال به `GET /api/customers` با فیلترها و pagination  
  - [ ] نمایش ستون‌ها: شناسه، نام، بازاریاب، شهر، آخرین ویزیت، وضعیت، امتیاز، درآمد ماه جاری  
  - [ ] پیاده‌سازی Pagination (دکمه‌های قبلی/بعدی + نمایش صفحه فعلی)  
- [ ] **فیلتر و جستجو**  
  - [ ] فیلتر وضعیت، شهر، بازاریاب (در صورت نیاز Searchable Dropdown)  
  - [ ] جستجوی زنده بر اساس نام/شماره  
- [ ] **ایجاد/ویرایش/حذف مشتری**  
  - [ ] فرم ایجاد مشتری (Modal/Page) مطابق `customer-create-form.tsx` با اعتبارسنجی سمت کلاینت  
  - [ ] اتصال به `POST /api/customers`، `PATCH /api/customers/{id}`, `DELETE /api/customers/{id}`  
  - [ ] نمایش Toast برای موفقیت/خطا و به‌روزرسانی لیست پس از عملیات  
- [ ] **حالت‌های خالی، Loading، Error**  
  - [ ] پیاده‌سازی Empty State و Skeleton مطابق قوانین `ui-style-guide.md`  

### 8. فاز ماژول Visits
- [ ] **لیست ویزیت‌ها و داشبورد ساده**  
  - [ ] پیاده‌سازی صفحه Visits مشابه `handoff/static-ui/dashboard.html` و `components/visits/visits-page-client.tsx`  
  - [ ] اتصال به `GET /api/visits` با فیلترهای تاریخ، بازاریاب، وضعیت، مشتری  
  - [ ] نمایش جدول برنامه روزانه/هفتگی، وضعیت هر ویزیت، یادداشت‌ها  
- [ ] **فرم ثبت/ویرایش ویزیت**  
  - [ ] فرم ایجاد ویزیت جدید (انتخاب مشتری، بازاریاب، تاریخ شمسی، ساعت، یادداشت‌ها و اقدام پیگیری)  
  - [ ] استفاده از DatePicker شمسی (Persian DateTime Picker) سازگار با موبایل  
  - [ ] اتصال به `POST /api/visits`, `PATCH /api/visits/{id}`, `DELETE /api/visits/{id}`  
- [ ] **راه‌اندازی نقشه Neshan Map برای Visits**  
  - [x] دریافت فایل License از پنل Neshan (`assets/licenses/neshan.license`) - مرجع: `NESHAN_LICENSE_SETUP.md`
  - [x] افزودن فایل License به `pubspec.yaml` در بخش assets
  - [ ] دریافت API Key از پنل Neshan (در صورت نیاز) - راهنما: `HOW_TO_GET_NESHAN_API_KEY.md`
  - [ ] نصب کتابخانه Neshan Map SDK در `pubspec.yaml` (پکیج: `neshanmap_flutter` یا `neshan_map_sdk`)
  - [ ] افزودن Maven Repository Neshan به `android/build.gradle.kts` (مرجع: `flutter-implementation-guide.md` خطوط 259-273)
  - [ ] تنظیم Permission ها در `AndroidManifest.xml` (INTERNET, ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION) - مرجع: `flutter-implementation-guide.md` خطوط 296-313
  - [ ] افزودن API Key به `AndroidManifest.xml` در صورت نیاز (meta-data `neshan_api_key`) - مرجع: `flutter-implementation-guide.md` خطوط 277-292
  - [ ] بارگذاری فایل License در کد Flutter (استفاده از `rootBundle.loadString()`)
  - [ ] طراحی وایرفریم اولیه کامپوننت نقشه (`lib/features/visits/widgets/neshan_map_widget.dart`)
  - [ ] پیاده‌سازی نمایش نقاط ویزیت روی نقشه (Markers)
  - [ ] پیاده‌سازی انتخاب لوکیشن برای ویزیت جدید (مرجع: `sample/components/visits/neshan-map.tsx`)
  - [ ] Reverse Geocoding: تبدیل مختصات به آدرس فارسی (مرجع: `flutter-implementation-guide.md` خطوط 366-395)
  - [ ] راهنمای کامل: `NESHAN_MAP_SETUP_GUIDE.md`, `NESHAN_FORM_VALUES.md`, `flutter-implementation-guide.md` بخش "🗺️ اتصال به نقشه نشان"  

### 9. فاز ماژول Invoices
- [ ] **لیست پیش‌فاکتورها**  
  - [ ] طراحی UI مطابق `handoff/static-ui/invoices.html` و `components/invoices/*`  
  - [ ] اتصال به `GET /api/invoices` با فیلتر وضعیت و تاریخ + pagination  
- [ ] **ایجاد/ویرایش پیش‌فاکتور**  
  - [ ] فرم انتخاب مشتری، آیتم‌ها (محصول، تعداد، قیمت، تخفیف، مالیات)، تاریخ سررسید (تاریخ شمسی)  
  - [ ] محاسبه خودکار جمع کل و نمایش خلاصه (Subtotal, Discount, Tax, Grand Total)  
  - [ ] اتصال به `POST /api/invoices`, `PATCH /api/invoices/{id}`  
- [ ] **جزئیات پیش‌فاکتور و وضعیت پرداخت**  
  - [ ] صفحه جزئیات Invoice با اطلاعات کامل مشتری و آیتم‌ها (شبیه `invoice-detail-view.tsx`)  
  - [ ] اتصال به `PATCH /api/invoices/{id}/status` برای تغییر وضعیت (DRAFT, SENT, PAID, OVERDUE, CANCELLED)  
  - [ ] نمایش تاریخ و مرجع پرداخت در صورت PAID  
- [ ] **دانلود/مشاهده PDF (در صورت نیاز موبایل)**  
  - [ ] تصمیم‌گیری:  
    - [ ] باز کردن PDF در WebView / مرورگر خارجی  
    - [ ] فقط نمایش خلاصه در اپ و اجازه دانلود جداگانه  
  - [ ] اتصال به `GET /api/invoices/{id}/pdf` و مدیریت Permission ذخیره فایل در اندروید  

### 10. فاز ماژول Marketers
- [ ] **لیست بازاریاب‌ها و کارت‌های عملکرد**  
  - [ ] طراحی صفحه مطابق `components/marketers/*` و بخش مربوط در Dashboard وب  
  - [ ] اتصال به `GET /api/marketers` با فیلتر و Pagination  
- [ ] **ایجاد/ویرایش/حذف بازاریاب**  
  - [ ] فرم ایجاد/ویرایش بازاریاب (نام، شماره، نقش، منطقه، وضعیت فعال/غیرفعال)  
  - [ ] اتصال به `POST /api/marketers`, `PATCH /api/marketers/{id}`, `DELETE /api/marketers/{id}`  
- [ ] **نقش و دسترسی (فقط برای SUPER_ADMIN در UI موبایل)**  
  - [ ] نمایش نقش فعلی و محدودکردن دکمه‌ها با توجه به Role فعلی کاربر  

### 11. فاز ماژول SMS Center (پس از تکمیل در بک‌اند)
- [ ] **همگام‌سازی با وضعیت وب**  
  - [ ] بررسی پیشرفت فاز SMS Center در وب طبق `sample/todo.md`  
  - [ ] پس از نهایی شدن APIهای `/api/sms/*`، به‌روزرسانی مستندات موبایل  
- [ ] **UI کمپین‌ها (در صورت نیاز برای موبایل)**  
  - [ ] لیست کمپین‌ها، وضعیت ارسال، لاگ‌ پیامک‌ها  
  - [ ] فرم ایجاد کمپین (مخاطبین، متن پیام، زمان‌بندی) – در صورت نیاز کارفرما در موبایل  

### 12. فاز Reports و Settings (در صورت نیاز در نسخه موبایل)
- [ ] **Reports (گزارش‌ها)**  
  - [ ] هماهنگی نیاز واقعی کارفرما: کدام گزارش‌ها در موبایل لازم است (KPI ساده یا نمودار پیشرفته)  
  - [ ] اتصال به `/api/reports/*` بعد از پیاده‌سازی در وب  
  - [ ] نمایش نمودارهای ساده (Line/Bar) برای بازاریاب و مدیر (استفاده از پکیج نمودار Flutter)  
- [ ] **Settings (تنظیمات)**  
  - [ ] صفحه تنظیمات پروفایل کاربر، اعلان‌ها، لاگ‌اوت  
  - [ ] در صورت نیاز، فقط مشاهده نقش و دسترسی‌ها (مدیریت نقش‌ها معمولاً فقط در وب)  

### 13. فاز کامپوننت‌های مشترک UI در Flutter
- [ ] **سیستم دکمه (Buttons)** مطابق `ui-style-guide.md`  
  - [ ] پیاده‌سازی `Primary`, `Secondary`, `Ghost`, `Danger` با سایزهای `sm`, `md`, `lg`  
  - [ ] وضعیت‌های `loading`, `disabled` و پشتیبانی از آیکون  
- [ ] **ورودی‌ها (Inputs)**  
  - [ ] TextField استاندارد با Label، HelperText، ErrorText  
  - [ ] ورودی شماره موبایل، مبلغ (با فرمت ریالی)، تاریخ شمسی  
- [ ] **کارت‌ها و مدال‌ها (Dialog/BottomSheet)**  
  - [ ] Card استاندارد با سایه سبک، radius یکنواخت  
  - [ ] Dialog/BottomSheet برای فرم‌ها و تأیید عملیات (حذف، تغییر وضعیت)  
- [ ] **لیست و جدول**  
  - [ ] پیاده‌سازی List/Table ریسپانسیو (Card در موبایل، الهام از static-ui)  
  - [ ] Pagination کنترل، Empty/Loading/Error states  
- [ ] **Toast/Notification**  
  - [ ] سیستم پیام موفقیت/خطا هماهنگ با وب (متن فارسی، جای‌گذاری مناسب در پایین صفحه)  

### 14. فاز تست و تضمین کیفیت اپ موبایل
- [ ] **Unit Tests**  
  - [ ] تست Models و Mappers (JSON ↔ Dart)  
  - [ ] تست Repositories (با Mock API)  
- [ ] **Integration Tests**  
  - [ ] تست Auth Flow (OTP Request → Verify → Refresh → Logout)  
  - [ ] تست CRUD Customers، Visits، Invoices بر روی سرور تست  
- [ ] **UI / Widget Tests**  
  - [ ] تست صفحات اصلی (Auth, Dashboard, Customers List, Visit Form, Invoice List)  
- [ ] **Manual Testing روی دستگاه واقعی**  
  - [ ] تست در چند سایز صفحه (موبایل کوچک، متوسط، بزرگ)  
  - [ ] تست RTL، فونت ایران یکان، خوانایی متن و اعداد  
  - [ ] تست عملکرد و روان بودن اسکرول و لیست‌ها  

### 15. فاز آماده‌سازی برای انتشار (Release)
- [ ] **پیکربندی نسخه و نام اپ**  
  - [ ] تنظیم نام اپ (`TamirBan` / «تعمیربان CRM») و آیکون‌ها (هماهنگ با PWA آیکون‌ها در `sample/public/icons`)  
  - [ ] تنظیم Package Name و Versioning  
- [ ] **امنیت و لاگ‌گیری**  
  - [ ] جلوگیری از لاگ‌کردن اطلاعات حساس (توکن‌ها، OTPها، شماره موبایل کامل)  
  - [ ] افزودن Crash Reporting (Firebase Crashlytics یا مشابه) در صورت نیاز  
- [ ] **ساخت Release Build و تست نهایی**  
  - [ ] تست روی چند دستگاه واقعی/شبیه‌ساز  
  - [ ] بررسی رفتار در سرعت اینترنت پایین و قطع/وصل شدن  
  - [ ] هماهنگی نهایی با کارفرما برای سناریوهای کلیدی  

---

### 16. کارهای فوری و اولویت بالا (در حال انجام)

**📊 خلاصه وضعیت فعلی (آخرین به‌روزرسانی: 2025-01-28):**

✅ **کارهای تکمیل شده اخیر:**
- رفع باگ `setState() called after dispose()` در `login_page.dart` - تمام `setState()` calls اکنون `mounted` را چک می‌کنند
- پیاده‌سازی حالت Offline/Test Mode با کد تست `0000` برای توسعه بدون backend
- بهبود فرمت ورودی شماره موبایل (حذف +98، فرمت خودکار 09xxxxxxxxx)
- رفع مشکل ارسال کد (تغییر `mobile` به `phone` در API calls)
- بهبود Error Handling و پیام‌های خطا برای Connection Refused و CORS
- Refactoring Navigation: استفاده از GoRouter `redirect` به جای AuthGuard widget wrapper
- استفاده از `ApiException.fromDioError()` در `AuthRepository` - حذف `AuthException` و استفاده کامل از `ApiException`
- تغییر Package Name از `com.example.tamirban1android` به `ir.tamirban.app` - تغییر در Android, iOS, macOS و جابجایی `MainActivity.kt`

⚠️ **کارهای باقی‌مانده با اولویت بالا:**
- نصب و راه‌اندازی Neshan Map SDK (اکنون می‌توان با Package Name جدید شروع کرد)
- به‌روزرسانی Bundle Name در پنل Neshan با Package Name جدید (`ir.tamirban.app`) اگر API Key قبلاً ساخته شده باشد
- افزودن فونت ایران یکان (اگر فایل‌ها موجود است)

- [x] **پیاده‌سازی ApiErrorCode و بهبود Error Handling**
  - [x] ایجاد `lib/core/errors/api_error.dart` با enum `ApiErrorCode` (UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, ...)
  - [x] ایجاد کلاس `ApiException` با پشتیبانی از Dio errors
  - [x] افزودن فیلد `code` به `ApiResponse`
  - [x] بهبود پیام‌های خطا برای Connection Refused و CORS errors
  - [x] استفاده از `ApiException.fromDioError()` در `AuthRepository` (حذف `AuthException` قدیمی)
  - [x] به‌روزرسانی `login_page.dart` برای استفاده از `ApiException`
  - [ ] نمایش خطاها در UI بر اساس کد خطا (بهبود بیشتر پیام‌های خطا)
  - مرجع: `PROJECT_STATUS_REPORT.md` بخش "کارهای ناتمام"

- [x] **رفع باگ setState() called after dispose()**
  - [x] افزودن بررسی `mounted` قبل از تمام `setState()` calls در `login_page.dart`
  - [x] رفع خطای memory leak در `_handleRequestOtp` و `_handleVerifyOtp`
  - مرجع: خطای console در Flutter Web

- [x] **پیاده‌سازی حالت Offline/Test Mode**
  - [x] افزودن `enableOfflineMode` به `AppConfig` (فعال برای development + web)
  - [x] پیاده‌سازی Mock Login با کد تست `0000` در `login_page.dart`
  - [x] نمایش پیام راهنما برای استفاده از کد تست در UI
  - [x] بهبود پیام‌های خطا برای Connection Refused با پیشنهاد استفاده از کد تست
  - مرجع: درخواست کاربر برای تست بدون backend

- [x] **بهبود فرمت ورودی شماره موبایل**
  - [x] حذف `+98` prefix از TextField
  - [x] پیاده‌سازی `_IranianPhoneFormatter` برای فرمت خودکار (09xxxxxxxxx)
  - [x] جلوگیری از ورود دو صفر در ابتدا (00)
  - [x] محدود کردن به 11 رقم (09123456789)
  - [x] بهبود `_normalizedPhone` getter برای handle کردن فرمت‌های مختلف ورودی
  - مرجع: درخواست کاربر برای فرمت استاندارد

- [x] **رفع مشکل ارسال کد (Backend Compatibility)**
  - [x] تغییر فیلد `mobile` به `phone` در `AuthRepository.requestOtp` و `verifyOtp`
  - [x] هماهنگی با ساختار API backend
  - مرجع: خطای "Code sending was unsuccessful"

- [x] **تغییر Package Name برای Neshan Map**
  - [x] تغییر `com.example.tamirban1android` به `ir.tamirban.app`
  - [x] به‌روزرسانی `namespace` و `applicationId` در `android/app/build.gradle.kts`
  - [x] جابجایی `MainActivity.kt` به مسیر جدید (`ir/tamirban/app/`)
  - [x] به‌روزرسانی Bundle ID در iOS و macOS
  - [ ] به‌روزرسانی Bundle Name در پنل Neshan با Package Name جدید (اگر API Key قبلاً ساخته شده باشد)
  - مرجع: `NESHAN_FORM_VALUES.md`

- [x] **راه‌اندازی اولیه Neshan Map SDK**
  - [x] دریافت فایل License از پنل Neshan
  - [x] قرار دادن License در `assets/licenses/neshan.license`
  - [x] افزودن به `pubspec.yaml`
  - [ ] نصب کتابخانه Neshan Map SDK
  - [ ] تنظیم AndroidManifest.xml
  - مرجع: `NESHAN_LICENSE_SETUP.md`, `flutter-implementation-guide.md` بخش "🗺️ اتصال به نقشه نشان"

- [x] **بهبود Error Handling در Repositoryها**
  - [x] استفاده از `ApiException.fromDioError()` در `AuthRepository`
  - [x] حذف کلاس `AuthException` و استفاده کامل از `ApiException`
  - [x] به‌روزرسانی `login_page.dart` برای استفاده از `ApiException`
  - [ ] اضافه کردن error handling در Repositoryهای بعدی (Customers, Visits, ...)
  - مرجع: `lib/core/errors/api_error.dart`

- [ ] **افزودن فونت ایران یکان**
  - [ ] دریافت فایل‌های فونت (IRANYekanXFaNum-Regular.ttf, Medium, Bold)
  - [ ] قرار دادن در `assets/fonts/`
  - [ ] فعال‌سازی در `pubspec.yaml`
  - [ ] به‌روزرسانی Theme برای استفاده از فونت
  - مرجع: `assets/fonts/README.md`

---

## 📚 مراجع و مستندات کلیدی

### مستندات پروژه:
- **راهنمای پیاده‌سازی Flutter:** `flutter-implementation-guide.md` - شامل راهنمای OTP Login، Neshan Map، و API Endpoints
- **گزارش وضعیت پروژه:** `PROJECT_STATUS_REPORT.md` - خلاصه کامل کارهای انجام شده و باقی‌مانده
- **راهنمای Neshan Map:** 
  - `NESHAN_LICENSE_SETUP.md` - راهنمای استفاده از License File
  - `NESHAN_MAP_SETUP_GUIDE.md` - راهنمای کامل راه‌اندازی Neshan Map
  - `NESHAN_FORM_VALUES.md` - مقادیر دقیق برای فرم Neshan

### مستندات وب‌اپ (مرجع):
- **API Reference:** `sample/handoff/api/api-reference.md`
- **UI Style Guide:** `sample/docs/ui-style-guide.md`
- **Authentication Plan:** `sample/docs/authentication-plan.md`
- **Data Model:** `sample/docs/data-model.md`
- **Postman Collection:** `sample/postman/tamirban.postman_collection.json`

### فایل‌های کلیدی کد:
- **ApiClient:** `lib/core/network/api_client.dart` - HTTP Client با Refresh Token
- **ApiError:** `lib/core/errors/api_error.dart` - مدیریت خطاها
- **AuthRepository:** `lib/data/auth/auth_repository.dart` - Repository احراز هویت
- **LoginPage:** `lib/features/auth/presentation/login_page.dart` - صفحه ورود OTP
- **AppConfig:** `lib/core/config/app_environment.dart` - تنظیمات Environment

---

### مواردی که در صورت نبودن، لطفاً اضافه/ارسال کنید
- [ ] **آیکون‌ها و هویت بصری نهایی موبایل**  
  - اگر آیکون اختصاصی برای اپ موبایل دارید (512x512 یا SVG)، لطفاً در اختیار بگذارید؛ در حال حاضر فقط آیکون‌های PWA (`sample/public/icons`) در دسترس است.  
- [ ] **فایل فونت ایران یکان**  
  - فایل‌های فونت (IRANYekanXFaNum-Regular.ttf, Medium, Bold) برای استفاده در اپ
  - راهنما: `assets/fonts/README.md`
- [ ] **API Key Neshan Map (در صورت نیاز)**  
  - اگر فقط License File کافی نبود، API Key را از پنل Neshan دریافت کنید
  - راهنما: `HOW_TO_GET_NESHAN_API_KEY.md`
- [ ] **فایل `handoff/prompt/mobile-implementation.md` (اگر در مخزن موجود است)**  
  - الان در ساختار لیست شده، این فایل را نمی‌بینم؛ اگر نسخه‌ای از آن دارید، برای هم‌راستا شدن دقیق‌تر موبایل با استراتژی حاکم وب لازم است.  
- [ ] **هر ماژول بک‌اند که هنوز در وب نهایی نشده (خصوصاً SMS Center, Reports, Import/Export Excel)**  
  - تا وقتی APIهای این بخش‌ها در وب نهایی و پایدار نشوند، توسعه کامل معادل در موبایل بهتر است به فاز بعد موکول شود.  


