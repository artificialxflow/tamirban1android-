import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shamsi_date/shamsi_date.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/visits/models/visit_status.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_modal.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';
import '../../providers/visits_provider.dart';
import '../widgets/visit_form.dart';

/// صفحه جزئیات ویزیت
class VisitDetailPage extends ConsumerWidget {
  const VisitDetailPage({
    super.key,
    required this.visitId,
  });

  final String visitId;

  void _showStatusChangeDialog(BuildContext context, WidgetRef ref, visit) {
    VisitStatus? selectedStatus = visit.status;
    bool isChanging = false;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('تغییر وضعیت ویزیت'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('وضعیت جدید را انتخاب کنید:'),
              const SizedBox(height: 16),
              DropdownButtonFormField<VisitStatus>(
                value: selectedStatus,
                isExpanded: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: VisitStatus.values.map((status) {
                  return DropdownMenuItem<VisitStatus>(
                    value: status,
                    child: Text(status.displayName),
                  );
                }).toList(),
                onChanged: isChanging
                    ? null
                    : (value) {
                        if (value != null) {
                          setDialogState(() {
                            selectedStatus = value;
                          });
                        }
                      },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: isChanging ? null : () => Navigator.of(context).pop(),
              child: const Text('انصراف'),
            ),
            ElevatedButton(
              onPressed: isChanging
                  ? null
                  : () async {
                      if (selectedStatus == null || selectedStatus == visit.status) {
                        Navigator.of(context).pop();
                        return;
                      }

                      setDialogState(() => isChanging = true);

                      try {
                        final repo = ref.read(visitsRepositoryProvider);
                        await repo.changeVisitStatus(
                          visit.id,
                          selectedStatus!,
                          completedAt: selectedStatus == VisitStatus.completed
                              ? DateTime.now()
                              : null,
                        );

                        if (context.mounted) {
                          Navigator.of(context).pop();
                          ref.invalidate(visitDetailProvider(visitId));
                          final filters = ref.read(visitListFiltersProvider);
                          ref.invalidate(visitsListProvider(filters));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('وضعیت ویزیت با موفقیت تغییر کرد'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      } catch (error) {
                        if (context.mounted) {
                          setDialogState(() => isChanging = false);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'خطا در تغییر وضعیت: ${error is ApiException ? error.message : 'خطای ناشناخته'}',
                              ),
                              backgroundColor: AppColors.danger,
                            ),
                          );
                        }
                      }
                    },
              child: isChanging
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('تایید'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final visitAsync = ref.watch(visitDetailProvider(visitId));

    return AppShell(
      title: 'جزئیات ویزیت',
      actions: [
        visitAsync.when(
          data: (visit) => Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AppButton(
                onPressed: () {
                  _showStatusChangeDialog(context, ref, visit);
                },
                variant: ButtonVariant.secondary,
                leftIcon: const Icon(Icons.swap_horiz, size: 20),
                child: const Text('تغییر وضعیت'),
              ),
              const SizedBox(width: 8),
              AppButton(
                onPressed: () {
                  AppModal.show(
                    context: context,
                    title: 'ویرایش ویزیت',
                    child: VisitForm(
                      visit: visit,
                      onSuccess: () {
                        Navigator.of(context).pop();
                        ref.invalidate(visitDetailProvider(visitId));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('ویزیت با موفقیت به‌روزرسانی شد'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      },
                      onCancel: () => Navigator.of(context).pop(),
                    ),
                  );
                },
                variant: ButtonVariant.secondary,
                leftIcon: const Icon(Icons.edit, size: 20),
                child: const Text('ویرایش'),
              ),
            ],
          ),
          loading: () => const SizedBox.shrink(),
          error: (error, stack) => const SizedBox.shrink(),
        ),
      ],
      child: visitAsync.when(
        data: (visit) => _VisitDetailContent(visit: visit),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) {
          String message = 'خطا در دریافت جزئیات ویزیت';
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
                    ref.invalidate(visitDetailProvider(visitId));
                  },
                  child: const Text('تلاش مجدد'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// محتوای صفحه جزئیات ویزیت
class _VisitDetailContent extends StatelessWidget {
  const _VisitDetailContent({required this.visit});

  final visit;

  String _formatPersianDate(DateTime dateTime) {
    final jalali = Jalali.fromDateTime(dateTime);
    return '${jalali.year}/${jalali.month.toString().padLeft(2, '0')}/${jalali.day.toString().padLeft(2, '0')}';
  }

  String _formatTime(DateTime dateTime) {
    return DateFormat('HH:mm', 'fa').format(dateTime);
  }

  String _formatDateTime(DateTime dateTime) {
    return '${_formatPersianDate(dateTime)} ${_formatTime(dateTime)}';
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
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status Card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: AppColors.border),
            ),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: _getStatusColor(visit.status).withValues(alpha: 0.1),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: _getStatusColor(visit.status),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'وضعیت',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          visit.status.displayName,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: _getStatusColor(visit.status),
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Basic Information
          _SectionTitle(title: 'اطلاعات اصلی'),
          const SizedBox(height: 12),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: AppColors.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _InfoRow(
                    icon: Icons.person,
                    label: 'مشتری',
                    value: visit.customerId, // TODO: نمایش نام مشتری
                  ),
                  const Divider(height: 24),
                  _InfoRow(
                    icon: Icons.badge,
                    label: 'بازاریاب',
                    value: visit.marketerId, // TODO: نمایش نام بازاریاب
                  ),
                  const Divider(height: 24),
                  _InfoRow(
                    icon: Icons.calendar_today,
                    label: 'تاریخ و زمان',
                    value: _formatDateTime(visit.scheduledAt),
                  ),
                  if (visit.completedAt != null) ...[
                    const Divider(height: 24),
                    _InfoRow(
                      icon: Icons.check_circle,
                      label: 'تاریخ تکمیل',
                      value: _formatDateTime(visit.completedAt!),
                    ),
                  ],
                ],
              ),
            ),
          ),

          if (visit.topics.isNotEmpty) ...[
            const SizedBox(height: 16),
            _SectionTitle(title: 'موضوعات'),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: visit.topics.map((topic) {
                    return Chip(
                      label: Text(topic),
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                      labelStyle: TextStyle(color: AppColors.primary),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],

          if (visit.notes != null && visit.notes!.isNotEmpty) ...[
            const SizedBox(height: 16),
            _SectionTitle(title: 'یادداشت'),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  visit.notes!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
          ],

          if (visit.followUpAction != null && visit.followUpAction!.isNotEmpty) ...[
            const SizedBox(height: 16),
            _SectionTitle(title: 'اقدام پیگیری'),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.track_changes, color: AppColors.primary, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        visit.followUpAction!,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          if (visit.locationSnapshot != null) ...[
            const SizedBox(height: 16),
            _SectionTitle(title: 'موقعیت'),
            const SizedBox(height: 12),
            Card(
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
                    if (visit.locationSnapshot!.address != null) ...[
                      Row(
                        children: [
                          Icon(Icons.location_on, color: AppColors.primary, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              visit.locationSnapshot!.address!,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                    Text(
                      'مختصات: ${visit.locationSnapshot!.latitude.toStringAsFixed(6)}, ${visit.locationSnapshot!.longitude.toStringAsFixed(6)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          if (visit.createdAt != null || visit.updatedAt != null) ...[
            const SizedBox(height: 16),
            _SectionTitle(title: 'اطلاعات سیستم'),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    if (visit.createdAt != null)
                      _InfoRow(
                        icon: Icons.add_circle_outline,
                        label: 'تاریخ ایجاد',
                        value: _formatDateTime(visit.createdAt!),
                      ),
                    if (visit.createdAt != null && visit.updatedAt != null)
                      const Divider(height: 24),
                    if (visit.updatedAt != null)
                      _InfoRow(
                        icon: Icons.edit_outlined,
                        label: 'آخرین به‌روزرسانی',
                        value: _formatDateTime(visit.updatedAt!),
                      ),
                  ],
                ),
              ),
            ),
          ],

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

/// عنوان بخش
class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
    );
  }
}

/// ردیف اطلاعات
class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppColors.textSecondary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

