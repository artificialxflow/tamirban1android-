import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../widgets/app_shell.dart';

class DashboardPlaceholderPage extends StatelessWidget {
  const DashboardPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: 'داشبورد تعمیربان',
      description: 'نسخه موبایل در حال آماده‌سازی است. در فازهای بعدی این صفحه با داده‌های واقعی جایگزین می‌شود.',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: const [
                _SummaryCard(
                  label: 'مشتریان فعال',
                  value: '128',
                  trendText: '+8 این هفته',
                ),
                _SummaryCard(
                  label: 'ویزیت‌های امروز',
                  value: '12',
                  trendText: '3 در انتظار تایید',
                ),
                _SummaryCard(
                  label: 'پیش‌فاکتورهای معوق',
                  value: '5',
                  trendText: 'رسیدگی فوری',
                  trendColor: AppColors.warning,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.label,
    required this.value,
    required this.trendText,
    this.trendColor = AppColors.textSecondary,
  });

  final String label;
  final String value;
  final String trendText;
  final Color trendColor;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(
        minWidth: 160,
        maxWidth: 240,
      ),
      child: Card(
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              Text(
                value,
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                trendText,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: trendColor,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
