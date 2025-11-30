import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/navigation/app_router.dart';
import '../widgets/app_shell.dart';
import '../../../customers/providers/customers_provider.dart';
import '../../../visits/providers/visit_list_filters.dart';
import '../../../visits/providers/visits_provider.dart';
import '../../../invoices/providers/invoices_provider.dart';
import '../../../marketers/providers/marketers_provider.dart';
import '../../../visits/widgets/neshan_map_widget.dart';

/// صفحه اصلی Dashboard
class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // دریافت آمار از Providers
    final customersFilters = const CustomerListFilters(
      status: null,
      page: 1,
      limit: 1,
    );
    final customersAsync = ref.watch(customersListProvider(customersFilters));

    final visitsFilters = VisitListFilters(
      status: null,
      page: 1,
      limit: 1,
    );
    final visitsAsync = ref.watch(visitsListProvider(visitsFilters));

    final invoicesFilters = const InvoiceListFilters(
      page: 1,
      limit: 1,
    );
    final invoicesAsync = ref.watch(invoicesListProvider(invoicesFilters));

    final marketersFilters = const MarketerListFilters(
      isActive: true,
      page: 1,
      limit: 1,
    );
    final marketersAsync = ref.watch(marketersListProvider(marketersFilters));

    return AppShell(
      title: 'داشبورد',
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(customersListProvider(customersFilters));
          ref.invalidate(visitsListProvider(visitsFilters));
          ref.invalidate(invoicesListProvider(invoicesFilters));
          ref.invalidate(marketersListProvider(marketersFilters));
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // کارت‌های خلاصه - Grid 2x2
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
                children: [
                  _SummaryCard(
                    icon: Icons.people,
                    label: 'مشتریان',
                    value: customersAsync.when(
                      data: (data) => data.pagination.total.toString(),
                      loading: () => '...',
                      error: (_, __) => '-',
                    ),
                    color: AppColors.primary,
                    onTap: () => context.push(AppRouter.customers),
                  ),
                  _SummaryCard(
                    icon: Icons.event,
                    label: 'ویزیت‌ها',
                    value: visitsAsync.when(
                      data: (data) => data.pagination.total.toString(),
                      loading: () => '...',
                      error: (_, __) => '-',
                    ),
                    color: AppColors.accent,
                    onTap: () => context.push(AppRouter.visits),
                  ),
                  _SummaryCard(
                    icon: Icons.receipt_long,
                    label: 'پیش‌فاکتورها',
                    value: invoicesAsync.when(
                      data: (data) => data.pagination.total.toString(),
                      loading: () => '...',
                      error: (_, __) => '-',
                    ),
                    color: AppColors.warning,
                    onTap: () => context.push(AppRouter.invoices),
                  ),
                  _SummaryCard(
                    icon: Icons.badge,
                    label: 'بازاریاب‌ها',
                    value: marketersAsync.when(
                      data: (data) => data.pagination.total.toString(),
                      loading: () => '...',
                      error: (_, __) => '-',
                    ),
                    color: AppColors.primary,
                    onTap: () => context.push(AppRouter.marketers),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // نقشه
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'نقشه',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 12),
                  NeshanMapWidget(
                    height: 280,
                    interactive: false,
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // دسترسی سریع
              Text(
                'دسترسی سریع',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 12),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 2.5,
                children: [
                  _QuickActionButton(
                    icon: Icons.add_business,
                    label: 'مشتری جدید',
                    color: AppColors.primary,
                    onTap: () => context.push(AppRouter.customers),
                  ),
                  _QuickActionButton(
                    icon: Icons.event_available,
                    label: 'ویزیت جدید',
                    color: AppColors.accent,
                    onTap: () => context.push(AppRouter.visits),
                  ),
                  _QuickActionButton(
                    icon: Icons.receipt,
                    label: 'پیش‌فاکتور جدید',
                    color: AppColors.warning,
                    onTap: () => context.push(AppRouter.invoices),
                  ),
                  _QuickActionButton(
                    icon: Icons.person_add,
                    label: 'بازاریاب جدید',
                    color: AppColors.primary,
                    onTap: () => context.push(AppRouter.marketers),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// کارت خلاصه آمار
class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  color.withValues(alpha: 0.1),
                  color.withValues(alpha: 0.05),
                ],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // متن‌ها در بالا سمت چپ
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      value,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: color,
                            fontSize: 24,
                            height: 1.1,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      label,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                            height: 1.2,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                const Spacer(),
                // آیکون در پایین سمت راست
                Align(
                  alignment: Alignment.bottomRight,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: color, size: 24),
                  ),
                ),
              ],
            ),
          ),
      ),
    );
  }
}

/// دکمه دسترسی سریع
class _QuickActionButton extends StatelessWidget {
  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: color.withValues(alpha: 0.05),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 20, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
