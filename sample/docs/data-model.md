# مدل داده پروژه تعمیربان

این سند مرجع اولیه برای طراحی مدل‌های داده در MongoDB است. هر بخش شامل توضیح موجودیت، فیلدهای کلیدی، روابط و نکات پیاده‌سازی است تا در مراحل بعدی (فاز ۵ به بعد) مبنای توسعه API و UI قرار گیرد.

## موجودیت‌ها

### User (کاربر)
- **شناسه:** `_id` (ObjectId)
- **فیلدها:** `fullName`, `mobile`, `email`, `role`, `isActive`, `lastLoginAt`, `otpSecret`, `otpExpiresAt`
- **توضیح:** هر حساب کاربری در سیستم با نقش مشخص (مدیر، مالی، بازاریاب). OTP و JWT بر اساس این موجودیت تولید می‌شود.
- **ارتباط‌ها:** 
  - یک کاربر نقش واحد دارد (`role` از نوع `RoleKey`)
  - بازاریاب‌ها رکورد تکمیلی در `MarketerProfile` دارند

### MarketerProfile (پروفایل بازاریاب)
- **شناسه:** `_id` (ObjectId مطابق `userId`)
- **فیلدها:** `userId`, `region`, `assignedCustomers`, `performanceScore`, `lastVisitAt`
- **توضیح:** اطلاعات تخصصی بازاریاب برای تقسیم‌بندی جغرافیایی و سنجش عملکرد.
- **ارتباط‌ها:** 
  - `userId` به `User` اشاره دارد
  - `assignedCustomers` آرایه‌ای از شناسه مشتری‌ها است

### Customer (مشتری)
- **شناسه:** `_id` (ObjectId)
- **فیلدها:** `displayName`, `legalName`, `contact`, `assignedMarketerId`, `status`, `tags`, `lastVisitAt`, `geoLocation`, `notes`
- **توضیح:** تعمیرگاه یا مشتری نهایی که توسط بازاریاب‌ها مدیریت می‌شود.
- **ارتباط‌ها:** 
  - `assignedMarketerId` به `MarketerProfile` اشاره دارد
  - در جدول `Visit` و `Invoice` استفاده می‌شود

### Visit (ویزیت)
- **شناسه:** `_id` (ObjectId)
- **فیلدها:** `customerId`, `marketerId`, `scheduledAt`, `completedAt`, `status`, `topics`, `notes`, `locationSnapshot`, `followUpAction`
- **توضیح:** ثبت رویداد ویزیت بازاریاب. برای مانیتورینگ و تحلیل عملکرد استفاده می‌شود.
- **ارتباط‌ها:** 
  - `customerId` → `Customer`
  - `marketerId` → `MarketerProfile`

### Product (محصول/خدمت)
- **شناسه:** `_id` (ObjectId)
- **فیلدها:** `name`, `sku`, `category`, `unitPrice`, `currency`, `taxRate`, `isActive`, `mediaUrls`
- **توضیح:** آیتم‌های قابل فروش/خدمت که در پیش‌فاکتور استفاده می‌شوند.
- **ارتباط‌ها:** 
  - در آیتم‌های `Invoice` استفاده می‌شود (اختیاری)

### Invoice (پیش‌فاکتور)
- **شناسه:** `_id` (ObjectId)
- **فیلدها:** `customerId`, `marketerId`, `status`, `issuedAt`, `dueAt`, `currency`, `items`, `subtotal`, `taxTotal`, `discountTotal`, `grandTotal`, `paymentReference`, `paidAt`
- **آیتم‌ها (`items`):** آرایه‌ای از `InvoiceLineItem` شامل `title`, `quantity`, `unit`, `unitPrice`, `taxRate`, `discount`, `total`
- **توضیح:** ثبت پیش‌فاکتورهای صادر شده؛ مبنای پیگیری مالی و تولید سند PDF.
- **ارتباط‌ها:** 
  - `customerId` → `Customer`
  - `marketerId` → `MarketerProfile` (اختیاری)
  - آیتم‌ها ممکن است به `Product` ارجاع داشته باشند (اختیاری)

### SMSLog (لاگ پیامک)
- **شناسه:** `_id` (ObjectId)
- **فیلدها:** `phoneNumber`, `channel`, `template`, `payload`, `status`, `sentAt`, `deliveredAt`, `errorMessage`, `requestId`
- **توضیح:** آرشیو پیامک‌های OTP و اطلاع‌رسانی برای پیگیری و دیباگ.
- **ارتباط‌ها:** 
  - `phoneNumber` می‌تواند به `User` یا `Customer` مرتبط باشد (رابطه غیرمستقیم)

### OTPAttempt (تلاش احراز هویت)
- **نوع:** سند موقتی (می‌توان در Redis یا Collection جدا نگه داشت)
- **فیلدها:** `phoneNumber`, `hashedCode`, `expiresAt`, `attempts`, `maxAttempts`
- **توضیح:** کنترل امنیتی برای محدود کردن تلاش‌های ورود.

## نکات طراحی
- همه موجودیت‌ها از `AuditTrail` استفاده می‌کنند (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`).
- `GeoLocation` و `ContactInfo` به صورت ساختار جداگانه در `Customer` و `Visit` استفاده می‌شوند.
- برای پشتیبانی از چند ارز یا زبان، `metadata` در موجودیت‌های کلیدی پیش‌بینی شده است.
- ایندکس‌های پیشنهادی در فاز تست و پیاده‌سازی تعیین می‌شوند (بر اساس حجم داده و الگوی کوئری).

> این سند در فازهای بعدی (۵ و ۶) با جزییات بیشتر در خصوص ایندکس‌ها، اعتبارسنجی و روابط نهایی به‌روزرسانی می‌شود.

