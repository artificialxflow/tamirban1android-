# استراتژی تست جامع پروژه تعمیربان

این سند استراتژی تست همزمان با توسعه را مشخص می‌کند.

## فلسفه تست: Test-Driven Development (TDD) سبک

### رویکرد پیشنهادی:
- ✅ **همزمان با توسعه** نه بعد از آن
- ✅ **تست‌های مرحله‌ای** برای هر ماژول
- ✅ **اولویت بر تست‌های Integration** (API + UI)
- ✅ **تست‌های E2E برای سناریوهای کلیدی**

---

## سطوح تست

### 1. **Unit Tests (اولویت متوسط)**

#### چه چیزهایی تست می‌شوند:
- ✅ Services (customers.service, visits.service, ...)
- ✅ Utilities (jwt, phone, otp)
- ✅ Validators (Zod schemas)

#### ابزار:
- **Vitest** (توصیه می‌شود - سریع‌تر از Jest)
- یا **Jest**

#### Coverage هدف:
- Services: 70-80%
- Utilities: 90%+
- Validators: 100%

#### زمان:
- **همزمان با نوشتن Service** (نه بعد از آن)

---

### 2. **Integration Tests (اولویت بالا)** ⚠️

#### چه چیزهایی تست می‌شوند:
- ✅ API Endpoints (Request → Response)
- ✅ Database Operations (CRUD)
- ✅ Authentication Flow
- ✅ Error Handling

#### ابزار:
- **Vitest** + **Supertest** (برای API testing)
- یا **Jest** + **Supertest**

#### Coverage هدف:
- API Endpoints: 80%+
- Critical Flows: 100%

#### زمان:
- **بلافاصله بعد از پیاده‌سازی API**

---

### 3. **E2E Tests (اولویت بالا برای سناریوهای کلیدی)** 🎯

#### چه چیزهایی تست می‌شوند:
- ✅ سناریوهای کامل کاربری
- ✅ Flows انتها به انتها

#### ابزار:
- **Playwright** (توصیه می‌شود)
- یا **Cypress**

#### سناریوهای کلیدی:
1. **ورود کامل**: درخواست OTP → دریافت → تایید → ورود به داشبورد
2. **ایجاد مشتری**: ورود → ایجاد مشتری → مشاهده در لیست
3. **ثبت ویزیت**: انتخاب مشتری → ثبت ویزیت → مشاهده در داشبورد
4. **ایجاد پیش‌فاکتور**: انتخاب مشتری → ایجاد فاکتور → دانلود PDF
5. **مدیریت نقش**: ورود مدیر → ایجاد بازاریاب → تخصیص نقش

#### Coverage هدف:
- Critical User Flows: 100%
- Secondary Flows: 50-70%

#### زمان:
- **بعد از تکمیل هر ماژول**

---

### 4. **Manual Testing (همیشه)** 👤

#### چه چیزهایی تست می‌شوند:
- ✅ UX/UI در مرورگرهای مختلف
- ✅ Responsive Design
- ✅ RTL Support
- ✅ Accessibility
- ✅ Performance

#### چک‌لیست:
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Tablet (iPad)
- [ ] RTL در همه مرورگرها
- [ ] Keyboard Navigation
- [ ] Screen Reader (حداقل ChromeVox)

#### زمان:
- **قبل از تحویل هر ماژول**

---

## تست‌های مرحله‌ای (Phase-by-Phase Testing)

### فاز 1: زیرساخت و احراز هویت

#### Unit Tests:
- [ ] `otp.service.ts`: requestOtp, verifyOtp
- [ ] `jwt.ts`: issueJwt, verifyJwt
- [ ] `phone.ts`: normalizePhone

#### Integration Tests:
- [ ] POST /api/auth/otp/request (موفق)
- [ ] POST /api/auth/otp/request (خطا: شماره نامعتبر)
- [ ] POST /api/auth/otp/verify (موفق)
- [ ] POST /api/auth/otp/verify (خطا: کد نامعتبر)
- [ ] POST /api/auth/otp/verify (خطا: کد منقضی شده)
- [ ] Rate Limiting برای OTP

#### E2E Tests:
- [ ] سناریو ورود کامل (درخواست → تایید → ورود)

#### Manual Tests:
- [ ] UI صفحه ورود در موبایل و دسکتاپ
- [ ] RTL Support
- [ ] Error Messages واضح

---

### فاز 2: ماژول Customers

#### Unit Tests:
- [ ] `customers.service.ts`: createCustomer, updateCustomer, deleteCustomer
- [ ] `customers.service.ts`: listCustomerSummaries (فیلترها)

#### Integration Tests:
- [ ] GET /api/customers (لیست)
- [ ] GET /api/customers?status=ACTIVE (فیلتر)
- [ ] GET /api/customers?search=test (جستجو)
- [ ] POST /api/customers (ایجاد)
- [ ] POST /api/customers (خطا: validation)
- [ ] GET /api/customers/[id] (جزئیات)
- [ ] PATCH /api/customers/[id] (ویرایش)
- [ ] DELETE /api/customers/[id] (حذف)
- [ ] Authentication Required (بدون token)

#### E2E Tests:
- [ ] سناریو ایجاد مشتری کامل
- [ ] سناریو ویرایش و حذف مشتری

#### Manual Tests:
- [ ] UI لیست مشتریان (Pagination)
- [ ] UI فرم ایجاد/ویرایش
- [ ] Loading States
- [ ] Error Handling در UI

---

### فاز 3: ماژول Visits

#### Unit Tests:
- [ ] `visits.service.ts`: createVisit, updateVisit, changeStatus

#### Integration Tests:
- [ ] GET /api/visits
- [ ] POST /api/visits
- [ ] PATCH /api/visits/[id]/status
- [ ] فیلتر بر اساس تاریخ

#### E2E Tests:
- [ ] سناریو ثبت ویزیت کامل

#### Manual Tests:
- [ ] UI نقشه (اگر پیاده‌سازی شده)
- [ ] UI جدول ویزیت‌ها

---

### فاز 4: ماژول Invoices

#### Unit Tests:
- [ ] `invoices.service.ts`: createInvoice, calculateTotal
- [ ] PDF Generation

#### Integration Tests:
- [ ] GET /api/invoices
- [ ] POST /api/invoices
- [ ] GET /api/invoices/[id]/pdf
- [ ] محاسبه خودکار جمع

#### E2E Tests:
- [ ] سناریو ایجاد پیش‌فاکتور و دانلود PDF

#### Manual Tests:
- [ ] UI پیش‌نمایش PDF
- [ ] دانلود PDF

---

## تست‌های Performance

### چه چیزهایی تست می‌شوند:
- ✅ زمان پاسخ API (< 500ms برای اکثر endpoints)
- ✅ زمان لود صفحه (< 2s)
- ✅ زمان تولید PDF (< 3s)
- ✅ Import Excel (< 10s برای 1000 ردیف)

### ابزار:
- **Lighthouse** (برای Frontend)
- **Artillery** یا **k6** (برای API Load Testing)

### زمان:
- **قبل از استقرار Production**

---

## تست‌های Security

### چه چیزهایی تست می‌شوند:
- ✅ SQL Injection (MongoDB Injection)
- ✅ XSS
- ✅ CSRF
- ✅ Authentication Bypass
- ✅ Rate Limiting
- ✅ Input Validation

### ابزار:
- **OWASP ZAP** (برای Security Scanning)
- Manual Penetration Testing

### زمان:
- **قبل از استقرار Production**

---

## Coverage Goals

### حداقل Coverage:
- Services: **70%**
- API Endpoints: **80%**
- Critical Flows (E2E): **100%**

### Coverage ایده‌آل:
- Services: **85%**
- API Endpoints: **90%**
- Critical Flows (E2E): **100%**

---

## CI/CD Integration

### چه زمانی تست‌ها اجرا می‌شوند:
- ✅ **قبل از Commit** (Pre-commit hooks)
- ✅ **در Pull Request** (GitHub Actions)
- ✅ **قبل از Deploy** (CI Pipeline)

### Pipeline پیشنهادی:
```yaml
1. Lint (ESLint)
2. Type Check (TypeScript)
3. Unit Tests
4. Integration Tests
5. Build (next build)
6. E2E Tests (در صورت نیاز)
```

---

## گزارش‌دهی تست

### چه چیزهایی گزارش می‌شوند:
- ✅ Coverage Report (بعد از هر تست)
- ✅ Test Results (موفق/ناموفق)
- ✅ Performance Metrics
- ✅ Security Issues

### ابزار:
- **Vitest Coverage** (برای Coverage)
- **GitHub Actions** (برای CI/CD)

---

## چک‌لیست تست قبل از تحویل هر ماژول

- [ ] Unit Tests نوشته شده (70%+ coverage)
- [ ] Integration Tests نوشته شده (80%+ coverage)
- [ ] E2E Test برای سناریوی کلیدی
- [ ] Manual Testing انجام شده
- [ ] Performance قابل قبول است
- [ ] Security Issues بررسی شده
- [ ] Documentation به‌روز شده

---

## زمان‌بندی تست

### برای هر ماژول:
- **Unit Tests**: 20% زمان توسعه
- **Integration Tests**: 30% زمان توسعه
- **E2E Tests**: 10% زمان توسعه
- **Manual Testing**: 10% زمان توسعه

### کل زمان تست:
**~70% زمان توسعه** (اما این باعث کاهش باگ‌ها و صرفه‌جویی در زمان می‌شود)

---

## نکات مهم

1. ✅ **تست‌ها را همزمان با کد بنویسید** نه بعد از آن
2. ✅ **تست‌های شکست‌خورده را فوراً رفع کنید**
3. ✅ **Coverage را به تدریج افزایش دهید**
4. ✅ **تست‌های E2E را برای سناریوهای کلیدی نگه دارید**
5. ✅ **Manual Testing را دست کم نگیرید**

