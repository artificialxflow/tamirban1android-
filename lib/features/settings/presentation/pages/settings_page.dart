import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../widgets/common/common_widgets.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';

/// صفحه تنظیمات سیستم
class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  int _selectedTab = 0;

  final List<String> _tabs = [
    'دسترسی‌ها',
    'اعلان‌ها',
    'یکپارچگی‌ها',
    'ظاهر سیستم',
    'امنیت',
  ];

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: 'تنظیمات سیستم',
      description: 'مدیریت نقش‌ها، اعلان‌ها و یکپارچگی‌ها قبل از اتصال به داده‌های واقعی.',
      actions: [
        OutlinedButton(
          onPressed: () {},
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: AppColors.primary),
            foregroundColor: AppColors.primary,
          ),
          child: const Text('ذخیره تغییرات'),
        ),
        const SizedBox(width: 12),
        AppButton(
          onPressed: () {},
          child: const Text('بازگشت به تنظیمات پیش‌فرض'),
        ),
      ],
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Toolbar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border, width: 2),
              ),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'حالت پیش‌نمایش: تغییرات ذخیره نمی‌شوند • تمام موارد بر اساس داده ثابت هستند.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Tabs
            Card(
              elevation: 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(color: AppColors.border, width: 2),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tab Navigation
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: List.generate(
                        _tabs.length,
                        (index) => _TabButton(
                          label: _tabs[index],
                          isSelected: _selectedTab == index,
                          onTap: () {
                            setState(() {
                              _selectedTab = index;
                            });
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Tab Content
                    if (_selectedTab == 0) _AccessTab(),
                    if (_selectedTab == 1) _NotificationsTab(),
                    if (_selectedTab == 2) _IntegrationsTab(),
                    if (_selectedTab == 3) _AppearanceTab(),
                    if (_selectedTab == 4) _SecurityTab(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// دکمه تب
class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryDark],
                )
              : null,
          color: isSelected ? null : AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? Colors.transparent
                : AppColors.primary.withValues(alpha: 0.3),
            width: 2,
          ),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: isSelected ? Colors.white : AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
        ),
      ),
    );
  }
}

/// تب دسترسی‌ها
class _AccessTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final roles = [
      {
        'name': 'مدیر کل',
        'permissions': 'مدیریت کامل سیستم، دسترسی به گزارش‌های مالی و تنظیمات امنیتی',
        'members': ['رضا توکلی', 'سمیرا بهمنی'],
      },
      {
        'name': 'مدیر مالی',
        'permissions': 'مشاهده و تایید پیش‌فاکتور، مدیریت پرداخت‌ها، گزارش مالی ماهانه',
        'members': ['الهام رضوی'],
      },
      {
        'name': 'بازاریاب',
        'permissions': 'مدیریت مشتریان تخصیص‌یافته، ثبت ویزیت، ارسال پیش‌فاکتور آزمایشی',
        'members': ['سارا احمدی', 'امیرحسین صابری', 'نیلوفر کرمی'],
      },
      {
        'name': 'پشتیبانی',
        'permissions': 'پیگیری درخواست‌های پس از فروش و مدیریت پیامک‌ها',
        'members': ['تیم پشتیبانی CRM'],
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'مدیریت نقش‌ها',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'تعریف نقش‌ها و کاربرانی که به آنها تخصیص یافته‌اند',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
            OutlinedButton(
              onPressed: () {},
              child: const Text('مدیریت نقش‌ها'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...roles.map((role) => Container(
              padding: const EdgeInsets.all(20),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.border),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        role['name'] as String,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('ویرایش دسترسی‌ها'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    role['permissions'] as String,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: (role['members'] as List<String>)
                        .map((member) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Text(
                                member,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: AppColors.textPrimary,
                                    ),
                              ),
                            ))
                        .toList(),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}

/// تب اعلان‌ها
class _NotificationsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final channels = [
      {
        'title': 'پیامک OTP',
        'description': 'ارسال کد تایید ورود برای کاربران و مشتریان',
        'enabled': true,
      },
      {
        'title': 'گزارش‌های روزانه ایمیل',
        'description': 'ارسال خلاصه عملکرد بازاریاب‌ها به مدیر کل',
        'enabled': false,
      },
      {
        'title': 'هشدار فاکتور معوق',
        'description': 'ارسال اعلان به مدیر مالی در صورت عبور از سررسید',
        'enabled': true,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'کانال‌های اعلان',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'بر اساس تصمیم فاز ۵، فعال‌سازی کانال‌ها با داده واقعی انجام می‌شود',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
            TextButton(
              onPressed: () {},
              child: const Text('تنظیمات پیشرفته'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...channels.map((channel) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          channel['title'] as String,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          channel['description'] as String,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: (channel['enabled'] as bool)
                          ? AppColors.accent.withValues(alpha: 0.1)
                          : AppColors.textSecondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: (channel['enabled'] as bool)
                            ? AppColors.accent.withValues(alpha: 0.3)
                            : AppColors.textSecondary.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      (channel['enabled'] as bool) ? 'فعال' : 'غیرفعال',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: (channel['enabled'] as bool)
                                ? AppColors.accent
                                : AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}

/// تب یکپارچگی‌ها
class _IntegrationsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final integrations = [
      {
        'name': 'سامانه پیامکی کاوه نگار',
        'status': 'فعال',
        'description': 'ارسال OTP و پیامک‌های اطلاع‌رسانی',
        'actions': ['تنظیم مجدد کلید', 'مشاهده گزارش ارسال'],
      },
      {
        'name': 'نقشه نشان',
        'status': 'در حال اتصال',
        'description': 'نمایش موقعیت تعمیرگاه‌ها و برنامه ویزیت',
        'actions': ['تایید API Key', 'راهنمای اتصال'],
      },
      {
        'name': 'درگاه پرداخت زرین‌پال',
        'status': 'پیشنهاد شده',
        'description': 'امکان پرداخت آنلاین پیش‌فاکتور توسط مشتری',
        'actions': ['شروع فرآیند اتصال'],
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'یکپارچگی‌ها',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'لیست سرویس‌های متصل یا در انتظار اتصال برای فازهای بعدی',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
            OutlinedButton(
              onPressed: () {},
              child: const Text('افزودن یکپارچگی جدید'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.9,
          children: integrations.map((integration) {
            return Card(
              elevation: 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(color: AppColors.border, width: 2),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            integration['name'] as String,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.3),
                              width: 2,
                            ),
                          ),
                          child: Text(
                            integration['status'] as String,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: Text(
                        integration['description'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: (integration['actions'] as List<String>)
                          .map((action) => OutlinedButton(
                                onPressed: () {},
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  action,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

/// تب ظاهر سیستم
class _AppearanceTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.palette_outlined,
            size: 64,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 16),
          Text(
            'تنظیمات ظاهر سیستم',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'این بخش در حال توسعه است',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
        ],
      ),
    );
  }
}

/// تب امنیت
class _SecurityTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final securityItems = [
      {
        'title': 'احراز هویت',
        'description':
            'OTP رمزنگاری‌شده با bcrypt، صدور JWT و امکان قفل حساب پس از تلاش ناموفق متوالی.',
        'action': 'نمایش سیاست پیشنهادی',
      },
      {
        'title': 'ذخیره‌سازی داده',
        'description':
            'عدم ذخیره OTP خام، نگهداری لاگ رویدادها و پاکسازی برنامه‌ریزی‌شده اطلاعات حساس.',
        'action': 'چک‌لیست دیتابیس',
      },
      {
        'title': 'انطباق و مانیتورینگ',
        'description':
            'تعریف هشدار برای تلاش‌های مشکوک، ثبت لاگ و هشدار ایمیلی برای مدیر امنیت.',
        'action': 'لیست اقدامات',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'حوزه‌های امنیتی',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'یادآوری مواردی که باید هنگام پیاده‌سازی واقعی احراز هویت، رمزنگاری و لاگ‌ها در نظر گرفته شود',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
            TextButton(
              onPressed: () {},
              child: const Text('بازبینی سیاست‌ها'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.9,
          children: securityItems.map((item) {
            return Card(
              elevation: 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['title'] as String,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: Text(
                        item['description'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () {},
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        item['action'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

