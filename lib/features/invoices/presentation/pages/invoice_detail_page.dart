import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shamsi_date/shamsi_date.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/invoices/models/invoice_status.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_modal.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';
import '../../providers/invoices_provider.dart';
import '../widgets/invoice_form.dart';

/// صفحه جزئیات پیش‌فاکتور
class InvoiceDetailPage extends ConsumerWidget {
  const InvoiceDetailPage({
    super.key,
    required this.invoiceId,
  });

  final String invoiceId;

  void _showStatusChangeDialog(BuildContext context, WidgetRef ref, invoice) {
    InvoiceStatus? selectedStatus = invoice.status;
    final paidAtController = TextEditingController();
    final paymentReferenceController = TextEditingController();
    bool isChanging = false;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('تغییر وضعیت پیش‌فاکتور'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('وضعیت جدید را انتخاب کنید:'),
                const SizedBox(height: 16),
                DropdownButtonFormField<InvoiceStatus>(
                  value: selectedStatus,
                  isExpanded: true,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: InvoiceStatus.values.map((status) {
                    return DropdownMenuItem<InvoiceStatus>(
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
                if (selectedStatus == InvoiceStatus.paid) ...[
                  const SizedBox(height: 16),
                  TextField(
                    controller: paidAtController,
                    decoration: const InputDecoration(
                      labelText: 'تاریخ پرداخت',
                      hintText: '1403/08/15',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: paymentReferenceController,
                    decoration: const InputDecoration(
                      labelText: 'شماره مرجع پرداخت',
                      hintText: 'اختیاری',
                    ),
                  ),
                ],
              ],
            ),
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
                      if (selectedStatus == null || selectedStatus == invoice.status) {
                        Navigator.of(context).pop();
                        return;
                      }

                      setDialogState(() => isChanging = true);

                      try {
                        final repo = ref.read(invoicesRepositoryProvider);
                        await repo.changeInvoiceStatus(
                          invoice.id,
                          selectedStatus!,
                          paidAt: selectedStatus == InvoiceStatus.paid
                              ? DateTime.now() // TODO: Parse from paidAtController
                              : null,
                          paymentReference: paymentReferenceController.text.trim().isEmpty
                              ? null
                              : paymentReferenceController.text.trim(),
                        );

                        if (context.mounted) {
                          Navigator.of(context).pop();
                          ref.invalidate(invoiceDetailProvider(invoiceId));
                          final filters = ref.read(invoiceListFiltersProvider);
                          ref.invalidate(invoicesListProvider(filters));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('وضعیت پیش‌فاکتور با موفقیت تغییر کرد'),
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
    final invoiceAsync = ref.watch(invoiceDetailProvider(invoiceId));

    return AppShell(
      title: 'جزئیات پیش‌فاکتور',
      actions: [
        invoiceAsync.when(
          data: (invoice) => Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AppButton(
                onPressed: () {
                  _showStatusChangeDialog(context, ref, invoice);
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
                    title: 'ویرایش پیش‌فاکتور',
                    child: InvoiceForm(
                      invoice: invoice,
                      onSuccess: () {
                        Navigator.of(context).pop();
                        ref.invalidate(invoiceDetailProvider(invoiceId));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('پیش‌فاکتور با موفقیت به‌روزرسانی شد'),
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
      child: invoiceAsync.when(
        data: (invoice) => _InvoiceDetailContent(invoice: invoice),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) {
          String message = 'خطا در دریافت جزئیات پیش‌فاکتور';
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
                    ref.invalidate(invoiceDetailProvider(invoiceId));
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

/// محتوای صفحه جزئیات پیش‌فاکتور
class _InvoiceDetailContent extends StatelessWidget {
  const _InvoiceDetailContent({required this.invoice});

  final invoice;

  String _formatPersianDate(DateTime dateTime) {
    final jalali = Jalali.fromDateTime(dateTime);
    return '${jalali.year}/${jalali.month.toString().padLeft(2, '0')}/${jalali.day.toString().padLeft(2, '0')}';
  }

  String _formatCurrency(double amount) {
    return NumberFormat('#,###', 'fa').format(amount);
  }

  Color _getStatusColor(InvoiceStatus status) {
    switch (status) {
      case InvoiceStatus.draft:
        return AppColors.textSecondary;
      case InvoiceStatus.sent:
        return AppColors.primary;
      case InvoiceStatus.paid:
        return AppColors.accent;
      case InvoiceStatus.overdue:
        return AppColors.danger;
      case InvoiceStatus.cancelled:
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
                color: _getStatusColor(invoice.status).withValues(alpha: 0.1),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: _getStatusColor(invoice.status),
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
                          invoice.status.displayName,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: _getStatusColor(invoice.status),
                              ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${_formatCurrency(invoice.grandTotal)} ${invoice.currency}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: _getStatusColor(invoice.status),
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
                    value: invoice.customerId, // TODO: نمایش نام مشتری
                  ),
                  const Divider(height: 24),
                  _InfoRow(
                    icon: Icons.calendar_today,
                    label: 'تاریخ صدور',
                    value: _formatPersianDate(invoice.issuedAt),
                  ),
                  const Divider(height: 24),
                  _InfoRow(
                    icon: Icons.event,
                    label: 'تاریخ سررسید',
                    value: _formatPersianDate(invoice.dueAt),
                  ),
                  if (invoice.paidAt != null) ...[
                    const Divider(height: 24),
                    _InfoRow(
                      icon: Icons.check_circle,
                      label: 'تاریخ پرداخت',
                      value: _formatPersianDate(invoice.paidAt!),
                    ),
                  ],
                  if (invoice.paymentReference != null) ...[
                    const Divider(height: 24),
                    _InfoRow(
                      icon: Icons.receipt,
                      label: 'شماره مرجع پرداخت',
                      value: invoice.paymentReference!,
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Items
          _SectionTitle(title: 'آیتم‌ها'),
          const SizedBox(height: 12),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: AppColors.border),
            ),
            child: Column(
              children: [
                ...invoice.items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  final itemTotal = item.calculateTotal();
                  return Column(
                    children: [
                      if (index > 0) const Divider(),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.title,
                                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                          fontWeight: FontWeight.w600,
                                        ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item.quantity} × ${_formatCurrency(item.unitPrice)}',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                  ),
                                  if (item.discount != null || item.taxRate != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      [
                                        if (item.discount != null) 'تخفیف: ${item.discount}%',
                                        if (item.taxRate != null) 'مالیات: ${item.taxRate}%',
                                      ].join(' - '),
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            Text(
                              _formatCurrency(itemTotal),
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Totals
          _SectionTitle(title: 'خلاصه مالی'),
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
                  _TotalRow(
                    label: 'جمع کل',
                    value: _formatCurrency(invoice.subtotal),
                  ),
                  if (invoice.discountTotal != null && invoice.discountTotal! > 0) ...[
                    const Divider(),
                    _TotalRow(
                      label: 'تخفیف',
                      value: '- ${_formatCurrency(invoice.discountTotal!)}',
                      color: AppColors.accent,
                    ),
                  ],
                  if (invoice.taxTotal > 0) ...[
                    const Divider(),
                    _TotalRow(
                      label: 'مالیات',
                      value: _formatCurrency(invoice.taxTotal),
                    ),
                  ],
                  const Divider(),
                  _TotalRow(
                    label: 'مبلغ نهایی',
                    value: _formatCurrency(invoice.grandTotal),
                    isBold: true,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
          ),

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

/// ردیف جمع کل
class _TotalRow extends StatelessWidget {
  const _TotalRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.color,
  });

  final String label;
  final String value;
  final bool isBold;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
                color: color ?? AppColors.textPrimary,
              ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
                color: color ?? AppColors.textPrimary,
              ),
        ),
      ],
    );
  }
}

