import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shamsi_date/shamsi_date.dart';

import '../../../../core/config/app_environment.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../core/navigation/app_router.dart';
import '../../../../data/invoices/models/invoice_status.dart';
import '../../../../data/invoices/models/invoice_summary.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_modal.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';
import '../../providers/invoices_provider.dart';
import '../widgets/invoice_form.dart';
import 'package:go_router/go_router.dart';

/// صفحه لیست پیش‌فاکتورها
class InvoicesListPage extends ConsumerStatefulWidget {
  const InvoicesListPage({super.key});

  @override
  ConsumerState<InvoicesListPage> createState() => _InvoicesListPageState();
}

class _InvoicesListPageState extends ConsumerState<InvoicesListPage> {
  InvoiceStatus? _selectedStatus;

  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(invoiceListFiltersProvider);
    final invoicesAsync = ref.watch(invoicesListProvider(filters));

    return AppShell(
      title: 'پیش‌فاکتورها',
      actions: [
        AppButton(
          onPressed: () {
            AppModal.show(
              context: context,
              title: 'پیش‌فاکتور جدید',
              child: InvoiceForm(
                onSuccess: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('پیش‌فاکتور با موفقیت ثبت شد'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                onCancel: () => Navigator.of(context).pop(),
              ),
            );
          },
          leftIcon: const Icon(Icons.add, size: 20),
          child: const Text('پیش‌فاکتور جدید'),
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
                      ...InvoiceStatus.values.map((status) {
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

          // لیست پیش‌فاکتورها
          Expanded(
            child: invoicesAsync.when(
              data: (paginatedList) {
                final invoices = paginatedList.data;
                final pagination = paginatedList.pagination;

                if (invoices.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.receipt_long_outlined,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'پیش‌فاکتوری یافت نشد',
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
                    ref.invalidate(invoicesListProvider(filters));
                  },
                  child: Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: invoices.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final invoice = invoices[index];
                            return _InvoiceCard(invoice: invoice);
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
                              'نمایش ${invoices.length} از ${pagination.total}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Row(
                              children: [
                                if (pagination.page > 1)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page - 1);
                                      ref.read(invoiceListFiltersProvider.notifier).state = newFilters;
                                    },
                                    child: const Text('قبلی'),
                                  ),
                                if (pagination.page > 1 && pagination.total > pagination.page * pagination.limit)
                                  const SizedBox(width: 8),
                                if (pagination.total > pagination.page * pagination.limit)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page + 1);
                                      ref.read(invoiceListFiltersProvider.notifier).state = newFilters;
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
                String message = 'خطا در دریافت لیست پیش‌فاکتورها';
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
                          ref.invalidate(invoicesListProvider(filters));
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
    final filters = InvoiceListFilters(
      status: _selectedStatus,
      page: 1,
      limit: 20,
    );
    ref.read(invoiceListFiltersProvider.notifier).state = filters;
  }
}

/// کارت نمایش پیش‌فاکتور
class _InvoiceCard extends ConsumerStatefulWidget {
  const _InvoiceCard({required this.invoice});

  final InvoiceSummary invoice;

  @override
  ConsumerState<_InvoiceCard> createState() => _InvoiceCardState();
}

class _InvoiceCardState extends ConsumerState<_InvoiceCard> {
  bool _isDeleting = false;

  Future<void> _handleDelete(BuildContext context) async {
    if (_isDeleting) return;
    
    // Confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف پیش‌فاکتور'),
        content: const Text('آیا از حذف این پیش‌فاکتور اطمینان دارید؟'),
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
      final repo = ref.read(invoicesRepositoryProvider);
      await repo.deleteInvoice(widget.invoice.id);
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('پیش‌فاکتور با موفقیت حذف شد'),
          backgroundColor: Colors.green,
        ),
      );
      
      // Refresh list
      final filters = ref.read(invoiceListFiltersProvider);
      ref.invalidate(invoicesListProvider(filters));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطا در حذف پیش‌فاکتور: ${error is ApiException ? error.message : 'خطای ناشناخته'}'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isDeleting = false);
      }
    }
  }

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
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () {
          context.push('${AppRouter.invoices}/${widget.invoice.id}');
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
                          widget.invoice.customerName,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${_formatPersianDate(widget.invoice.issuedAt)} - ${_formatPersianDate(widget.invoice.dueAt)}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusColor(widget.invoice.status).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          widget.invoice.status.displayName,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: _getStatusColor(widget.invoice.status),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_formatCurrency(widget.invoice.grandTotal)} ${widget.invoice.currency}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
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
      ),
    );
  }
}

