import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/config/app_environment.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/customers/models/customer_summary.dart';
import '../../../../data/customers/models/customer_status.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_modal.dart';
import '../../../dashboard/presentation/widgets/app_shell.dart';
import '../../providers/customers_provider.dart';
import '../widgets/customer_form.dart';

/// صفحه لیست مشتری‌ها
class CustomersListPage extends ConsumerStatefulWidget {
  const CustomersListPage({super.key});

  @override
  ConsumerState<CustomersListPage> createState() => _CustomersListPageState();
}

class _CustomersListPageState extends ConsumerState<CustomersListPage> {
  final _searchController = TextEditingController();
  CustomerStatus? _selectedStatus;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _updateFilters() {
    final filters = CustomerListFilters(
      search: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
      status: _selectedStatus,
      page: 1,
      limit: 20,
    );
    ref.read(customerListFiltersProvider.notifier).state = filters;
  }

  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(customerListFiltersProvider);
    final customersAsync = ref.watch(customersListProvider(filters));

    return AppShell(
      title: 'مشتریان',
      actions: [
        AppButton(
          onPressed: () => _showCreateCustomerModal(context),
          leftIcon: const Icon(Icons.add, size: 20),
          child: const Text('مشتری جدید'),
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
          // فیلترها و جستجو
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
                // جستجو
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'جستجوی نام، کد، یا شماره تماس...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _updateFilters();
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onSubmitted: (_) => _updateFilters(),
                ),
                const SizedBox(height: 12),
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
                      ...CustomerStatus.values.map((status) {
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

          // لیست مشتری‌ها
          Expanded(
            child: customersAsync.when(
              data: (paginatedList) {
                final customers = paginatedList.data;
                final pagination = paginatedList.pagination;

                if (customers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.people_outline,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'مشتری یافت نشد',
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
                    ref.invalidate(customersListProvider(filters));
                  },
                  child: Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: customers.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final customer = customers[index];
                            return _CustomerCard(customer: customer);
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
                              'نمایش ${customers.length} از ${pagination.total}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Row(
                              children: [
                                if (pagination.page > 1)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page - 1);
                                      ref.read(customerListFiltersProvider.notifier).state = newFilters;
                                    },
                                    child: const Text('قبلی'),
                                  ),
                                if (pagination.page > 1 && pagination.total > pagination.page * pagination.limit)
                                  const SizedBox(width: 8),
                                if (pagination.total > pagination.page * pagination.limit)
                                  TextButton(
                                    onPressed: () {
                                      final newFilters = filters.copyWith(page: pagination.page + 1);
                                      ref.read(customerListFiltersProvider.notifier).state = newFilters;
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
                String message = 'خطا در دریافت لیست مشتری‌ها';
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
                          ref.invalidate(customersListProvider(filters));
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

  void _showCreateCustomerModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AppModal(
        title: 'ثبت مشتری جدید',
        subtitle: 'اطلاعات مشتری را وارد کنید',
        onClose: () => Navigator.of(context).pop(),
        child: CustomerForm(
          onSuccess: () {
            Navigator.of(context).pop();
          },
          onCancel: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }
}

/// کارت نمایش مشتری
class _CustomerCard extends ConsumerStatefulWidget {
  const _CustomerCard({required this.customer});

  final CustomerSummary customer;

  @override
  ConsumerState<_CustomerCard> createState() => _CustomerCardState();
}

class _CustomerCardState extends ConsumerState<_CustomerCard> {
  bool _isLoadingCustomer = false;
  bool _isDeleting = false;

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    return DateFormat('yyyy/MM/dd', 'fa').format(date);
  }

  String _formatCurrency(double? amount) {
    if (amount == null) return '-';
    return NumberFormat('#,###', 'fa').format(amount);
  }

  Color _getStatusColor(CustomerStatus status) {
    switch (status) {
      case CustomerStatus.active:
        return AppColors.accent;
      case CustomerStatus.inactive:
        return AppColors.textSecondary;
      case CustomerStatus.pending:
        return AppColors.warning;
      case CustomerStatus.atRisk:
        return AppColors.danger;
      case CustomerStatus.loyal:
        return AppColors.primary;
      case CustomerStatus.suspended:
        return AppColors.danger;
    }
  }

  Future<void> _handleEdit(BuildContext context) async {
    if (_isLoadingCustomer || _isDeleting) return;
    
    setState(() => _isLoadingCustomer = true);
    
    try {
      final repo = ref.read(customersRepositoryProvider);
      final customer = await repo.getCustomer(widget.customer.id);
      
      if (!mounted) return;
      
      showDialog(
        context: context,
        builder: (context) => AppModal(
          title: 'ویرایش مشتری',
          subtitle: 'کد: ${customer.code}',
          onClose: () => Navigator.of(context).pop(),
          child: CustomerForm(
            customer: customer,
            onSuccess: () {
              Navigator.of(context).pop();
              // Refresh list
              final filters = ref.read(customerListFiltersProvider);
              ref.invalidate(customersListProvider(filters));
            },
            onCancel: () => Navigator.of(context).pop(),
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      
      String message = 'خطا در دریافت اطلاعات مشتری';
      if (error is ApiException) {
        message = error.message;
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoadingCustomer = false);
      }
    }
  }

  Future<void> _handleDelete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف مشتری'),
        content: Text('آیا مطمئن هستید که می‌خواهید مشتری "${widget.customer.name}" را حذف کنید؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('انصراف'),
          ),
          AppButton(
            onPressed: () => Navigator.of(context).pop(true),
            variant: ButtonVariant.danger,
            child: const Text('حذف'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    setState(() => _isDeleting = true);

    try {
      final repo = ref.read(customersRepositoryProvider);
      await repo.deleteCustomer(widget.customer.id);
      
      // Refresh list
      final filters = ref.read(customerListFiltersProvider);
      ref.invalidate(customersListProvider(filters));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('مشتری "${widget.customer.name}" با موفقیت حذف شد'),
            backgroundColor: AppColors.accent,
          ),
        );
      }
    } catch (error) {
      if (mounted) {
        String message = 'خطا در حذف مشتری';
        if (error is ApiException) {
          message = error.message;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isDeleting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final customer = widget.customer;
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to customer detail page
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
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                customer.name,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusColor(customer.status).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                customer.status.displayName,
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: _getStatusColor(customer.status),
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          customer.code,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: [
                  if (customer.city != null)
                    _InfoItem(
                      icon: Icons.location_on,
                      label: customer.city!,
                    ),
                  if (customer.marketer != null)
                    _InfoItem(
                      icon: Icons.person,
                      label: customer.marketer!,
                    ),
                  if (customer.lastVisitAt != null)
                    _InfoItem(
                      icon: Icons.calendar_today,
                      label: _formatDate(customer.lastVisitAt),
                    ),
                  if (customer.monthlyRevenue != null)
                    _InfoItem(
                      icon: Icons.attach_money,
                      label: '${_formatCurrency(customer.monthlyRevenue)} تومان',
                    ),
                ],
              ),
              if (customer.tags.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: customer.tags.map((tag) {
                    return Chip(
                      label: Text(tag),
                      padding: EdgeInsets.zero,
                      labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    );
                  }).toList(),
                ),
              ],
              const SizedBox(height: 12),
              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  AppButton(
                    onPressed: (_isDeleting || _isLoadingCustomer) ? null : () => _handleEdit(context),
                    variant: ButtonVariant.secondary,
                    size: ButtonSize.sm,
                    isLoading: _isLoadingCustomer,
                    leftIcon: _isLoadingCustomer ? null : const Icon(Icons.edit, size: 16),
                    child: const Text('ویرایش'),
                  ),
                  const SizedBox(width: 8),
                  AppButton(
                    onPressed: (_isDeleting || _isLoadingCustomer) ? null : () => _handleDelete(context),
                    variant: ButtonVariant.danger,
                    size: ButtonSize.sm,
                    isLoading: _isDeleting,
                    leftIcon: _isDeleting ? null : const Icon(Icons.delete, size: 16),
                    child: const Text('حذف'),
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

