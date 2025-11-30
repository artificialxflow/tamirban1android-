import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:shamsi_date/shamsi_date.dart';

import '../../../../core/config/app_environment.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/marketers/models/marketer_summary.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_modal.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';
import '../../providers/marketers_provider.dart';
import '../widgets/marketer_form.dart';

/// صفحه لیست بازاریاب‌ها
class MarketersListPage extends ConsumerStatefulWidget {
  const MarketersListPage({super.key});

  @override
  ConsumerState<MarketersListPage> createState() => _MarketersListPageState();
}

class _MarketersListPageState extends ConsumerState<MarketersListPage> {
  bool? _selectedIsActive;

  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(marketerListFiltersProvider);
    final marketersAsync = ref.watch(marketersListProvider(filters));

    return AppShell(
      title: 'بازاریاب‌ها',
      actions: [
        AppButton(
          onPressed: () {
            AppModal.show(
              context: context,
              title: 'بازاریاب جدید',
              child: MarketerForm(
                onSuccess: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('بازاریاب با موفقیت ثبت شد'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                onCancel: () => Navigator.of(context).pop(),
              ),
            );
          },
          leftIcon: const Icon(Icons.add, size: 20),
          child: const Text('بازاریاب جدید'),
        ),
      ],
      child: Column(
        children: [
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
                // فیلتر وضعیت فعال/غیرفعال
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('همه'),
                        selected: _selectedIsActive == null,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedIsActive = null);
                            _updateFilters();
                          }
                        },
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('فعال'),
                        selected: _selectedIsActive == true,
                        onSelected: (selected) {
                          setState(() {
                            _selectedIsActive = selected ? true : null;
                          });
                          _updateFilters();
                        },
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('غیرفعال'),
                        selected: _selectedIsActive == false,
                        onSelected: (selected) {
                          setState(() {
                            _selectedIsActive = selected ? false : null;
                          });
                          _updateFilters();
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // لیست بازاریاب‌ها
          Expanded(
            child: marketersAsync.when(
              data: (paginatedList) {
                final marketers = paginatedList.data;
                final pagination = paginatedList.pagination;

                if (marketers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.person_outline,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'بازاریابی یافت نشد',
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
                    ref.invalidate(marketersListProvider(filters));
                  },
                  child: Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: marketers.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final marketer = marketers[index];
                            return _MarketerCard(marketer: marketer);
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
                              'نمایش ${marketers.length} از ${pagination.total}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Row(
                              children: [
                                if (pagination.page > 1)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page - 1);
                                      ref.read(marketerListFiltersProvider.notifier).state = newFilters;
                                    },
                                    child: const Text('قبلی'),
                                  ),
                                if (pagination.page > 1 && pagination.total > pagination.page * pagination.limit)
                                  const SizedBox(width: 8),
                                if (pagination.total > pagination.page * pagination.limit)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page + 1);
                                      ref.read(marketerListFiltersProvider.notifier).state = newFilters;
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
                String message = 'خطا در دریافت لیست بازاریاب‌ها';
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
                          ref.invalidate(marketersListProvider(filters));
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
    final filters = MarketerListFilters(
      isActive: _selectedIsActive,
      page: 1,
      limit: 20,
    );
    ref.read(marketerListFiltersProvider.notifier).state = filters;
  }
}

/// کارت نمایش بازاریاب
class _MarketerCard extends ConsumerStatefulWidget {
  const _MarketerCard({required this.marketer});

  final MarketerSummary marketer;

  @override
  ConsumerState<_MarketerCard> createState() => _MarketerCardState();
}

class _MarketerCardState extends ConsumerState<_MarketerCard> {
  bool _isDeleting = false;

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    final jalali = Jalali.fromDateTime(date);
    return '${jalali.year}/${jalali.month.toString().padLeft(2, '0')}/${jalali.day.toString().padLeft(2, '0')}';
  }

  Future<void> _handleEdit(BuildContext context) async {
    if (_isDeleting) return;
    
    try {
      final repo = ref.read(marketersRepositoryProvider);
      final marketer = await repo.getMarketer(widget.marketer.id);
      
      if (!mounted) return;
      
      AppModal.show(
        context: context,
        title: 'ویرایش بازاریاب',
        child: MarketerForm(
          marketer: marketer,
          onSuccess: () {
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('بازاریاب با موفقیت به‌روزرسانی شد'),
                backgroundColor: Colors.green,
              ),
            );
            // Refresh list
            final filters = ref.read(marketerListFiltersProvider);
            ref.invalidate(marketersListProvider(filters));
          },
          onCancel: () => Navigator.of(context).pop(),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطا در دریافت جزئیات بازاریاب: ${error is ApiException ? error.message : 'خطای ناشناخته'}'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  Future<void> _handleDelete(BuildContext context) async {
    if (_isDeleting) return;
    
    // Confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف بازاریاب'),
        content: const Text('آیا از حذف این بازاریاب اطمینان دارید؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('انصراف'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
    
    if (confirmed != true) return;
    
    setState(() => _isDeleting = true);
    
    try {
      final repo = ref.read(marketersRepositoryProvider);
      await repo.deleteMarketer(widget.marketer.id);
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('بازاریاب با موفقیت حذف شد'),
          backgroundColor: Colors.green,
        ),
      );
      
      // Refresh list
      final filters = ref.read(marketerListFiltersProvider);
      ref.invalidate(marketersListProvider(filters));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطا در حذف بازاریاب: ${error is ApiException ? error.message : 'خطای ناشناخته'}'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isDeleting = false);
      }
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
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              widget.marketer.fullName,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: widget.marketer.isActive
                                  ? AppColors.accent.withValues(alpha: 0.1)
                                  : AppColors.textSecondary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              widget.marketer.isActive ? 'فعال' : 'غیرفعال',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: widget.marketer.isActive
                                        ? AppColors.accent
                                        : AppColors.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 16,
                        runSpacing: 8,
                        children: [
                          _InfoItem(
                            icon: Icons.phone,
                            label: widget.marketer.mobile,
                          ),
                          if (widget.marketer.email != null)
                            _InfoItem(
                              icon: Icons.email,
                              label: widget.marketer.email!,
                            ),
                          _InfoItem(
                            icon: Icons.location_on,
                            label: widget.marketer.region,
                          ),
                          _InfoItem(
                            icon: Icons.badge,
                            label: widget.marketer.roleDisplayName,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 16,
                        runSpacing: 8,
                        children: [
                          _InfoItem(
                            icon: Icons.people,
                            label: '${widget.marketer.assignedCustomersCount} مشتری',
                          ),
                          if (widget.marketer.performanceScore != null)
                            _InfoItem(
                              icon: Icons.star,
                              label: 'امتیاز: ${widget.marketer.performanceScore!.toStringAsFixed(1)}',
                            ),
                          if (widget.marketer.lastVisitAt != null)
                            _InfoItem(
                              icon: Icons.event,
                              label: 'آخرین ویزیت: ${_formatDate(widget.marketer.lastVisitAt)}',
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  onPressed: _isDeleting ? null : () => _handleEdit(context),
                  icon: const Icon(Icons.edit, size: 20),
                  color: AppColors.primary,
                  tooltip: 'ویرایش',
                ),
                IconButton(
                  onPressed: _isDeleting ? null : () => _handleDelete(context),
                  icon: _isDeleting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.delete, size: 20),
                  color: AppColors.danger,
                  tooltip: 'حذف',
                ),
              ],
            ),
          ],
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

