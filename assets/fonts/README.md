### فونت ایران یکان برای تعمیربان

این پوشه برای قرار دادن فایل‌های واقعی فونت **IranYekan** است تا اپ Flutter مطابق نسخه وب نمایش داده شود.

1. از فایل‌های دارای مجوز (مثلاً `IRANYekanXFaNum-Regular.ttf`, `IRANYekanXFaNum-Medium.ttf`, `IRANYekanXFaNum-Bold.ttf`) استفاده کنید.
2. هر فایل را در همین پوشه قرار دهید و نام آن‌ها را دقیقاً مطابق بالا نگه دارید.
3. پس از اضافه کردن فونت‌ها، بخش زیر را در `pubspec.yaml` فعال/به‌روزرسانی کنید:

```
flutter:
  fonts:
    - family: IRANYekan
      fonts:
        - asset: assets/fonts/IRANYekanXFaNum-Regular.ttf
        - asset: assets/fonts/IRANYekanXFaNum-Medium.ttf
          weight: 500
        - asset: assets/fonts/IRANYekanXFaNum-Bold.ttf
          weight: 700
```

> تا زمان اضافه شدن فایل‌های واقعی، اپ از فونت پیش‌فرض سیستم استفاده می‌کند ولی تمام Theme و راه‌اندازی RTL آماده است.

