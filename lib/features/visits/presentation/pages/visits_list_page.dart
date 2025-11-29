import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/config/app_environment.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/visits/models/visit_status.dart';
import '../../../../data/visits/models/visit_summary.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';
import '../../providers/visit_list_filters.dart';
import '../../providers/visits_provider.dart';

/// صفحه لیست ویزیت‌ها
class VisitsListPage extends ConsumerStatefulWidget {
  const VisitsListPage({super.key});

  @override
  ConsumerState<VisitsListPage> createState() => _VisitsListPageState();
}

class _VisitsListPageState extends ConsumerState<VisitsListPage> {
  VisitStatus? _selectedStatus;

  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(visitListFiltersProvider);
    final visitsAsync = ref.watch(visitsListProvider(filters));

    return AppShell(
      title: 'ویزیت‌ها',
      actions: [
        AppButton(
          onPressed: () {
            // TODO: Open create visit modal
          },
          leftIcon: const Icon(Icons.add, size: 20),
          child: const Text('ویزیت جدید'),
        ),
      ],
      child: Column(
        children: [
          // بنر حالت Offline/Mock
          if (AppConfig.enableOfflineMode)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha: 0.1),
                border: Border(
                  bottom: BorderSide(color: AppColors.accent.withValues(alpha: 0.3)),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.wifi_off,
                    size: 20,
                    color: AppColors.accent,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'حالت تست: داده‌های نمونه نمایش داده می‌شوند',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          // فیلترها
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border(
                bottom: BorderSide(color: AppColors.border),
              ),
            ),
            child: Column(
              children: [
                // فیلتر وضعیت
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('همه'),
                        selected: _selectedStatus == null,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedStatus = null);
                            _updateFilters();
                          }
                        },
                      ),
                      const SizedBox(width: 8),
                      ...VisitStatus.values.map((status) {
                        return Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: FilterChip(
                            label: Text(status.displayName),
                            selected: _selectedStatus == status,
                            onSelected: (selected) {
                              setState(() {
                                _selectedStatus = selected ? status : null;
                              });
                              _updateFilters();
                            },
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // لیست ویزیت‌ها
          Expanded(
            child: visitsAsync.when(
              data: (paginatedList) {
                final visits = paginatedList.data;
                final pagination = paginatedList.pagination;

                if (visits.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.event_note_outlined,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'ویزیتی یافت نشد',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(visitsListProvider(filters));
                  },
                  child: Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: visits.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final visit = visits[index];
                            return _VisitCard(visit: visit);
                          },
                        ),
                      ),
                      // Pagination info
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          border: Border(
                            top: BorderSide(color: AppColors.border),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'نمایش ${visits.length} از ${pagination.total}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Row(
                              children: [
                                if (pagination.page > 1)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page - 1);
                                      ref.read(visitListFiltersProvider.notifier).state = newFilters;
                                    },
                                    child: const Text('قبلی'),
                                  ),
                                if (pagination.page > 1 && pagination.total > pagination.page * pagination.limit)
                                  const SizedBox(width: 8),
                                if (pagination.total > pagination.page * pagination.limit)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page + 1);
                                      ref.read(visitListFiltersProvider.notifier).state = newFilters;
                                    },
                                    child: const Text('بعدی'),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) {
                String message = 'خطا در دریافت لیست ویزیت‌ها';
                if (error is ApiException) {
                  message = error.message;
                }

                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: AppColors.danger,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        message,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppColors.danger,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          ref.invalidate(visitsListProvider(filters));
                        },
                        child: const Text('تلاش مجدد'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _updateFilters() {
    final filters = VisitListFilters(
      status: _selectedStatus,
      page: 1,
      limit: 20,
    );
    ref.read(visitListFiltersProvider.notifier).state = filters;
  }
}

/// کارت نمایش ویزیت
class _VisitCard extends StatelessWidget {
  const _VisitCard({required this.visit});

  final VisitSummary visit;

  String _formatDateTime(DateTime dateTime) {
    final dateFormat = DateFormat('yyyy/MM/dd', 'fa');
    final timeFormat = DateFormat('HH:mm', 'fa');
    return '${dateFormat.format(dateTime)} ${timeFormat.format(dateTime)}';
  }

  Color _getStatusColor(VisitStatus status) {
    switch (status) {
      case VisitStatus.scheduled:
        return AppColors.primary;
      case VisitStatus.inProgress:
        return AppColors.warning;
      case VisitStatus.completed:
        return AppColors.accent;
      case VisitStatus.cancelled:
        return AppColors.danger;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to visit detail page
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          visit.customerName,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDateTime(visit.scheduledAt),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(visit.status).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      visit.status.displayName,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: _getStatusColor(visit.status),
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: [
                  if (visit.marketerName != null)
                    _InfoItem(
                      icon: Icons.person,
                      label: visit.marketerName!,
                    ),
                  if (visit.topics.isNotEmpty)
                    _InfoItem(
                      icon: Icons.topic,
                      label: visit.topics.join(', '),
                    ),
                  if (visit.completedAt != null)
                    _InfoItem(
                      icon: Icons.check_circle,
                      label: 'تکمیل شده: ${_formatDateTime(visit.completedAt!)}',
                    ),
                ],
              ),
              if (visit.notes != null && visit.notes!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  visit.notes!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
      ],
    );
  }
}
