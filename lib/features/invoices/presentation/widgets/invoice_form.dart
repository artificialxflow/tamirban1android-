import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/customers/models/customer_summary.dart';
import '../../../../data/invoices/models/invoice.dart';
import '../../../../data/invoices/models/invoice_line_item.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_text_field.dart';
import '../../../../widgets/common/persian_datetime_picker.dart';
import '../../../../widgets/common/searchable_dropdown.dart';
import '../../../customers/providers/customers_provider.dart';
import '../../providers/invoices_provider.dart';

/// فرم ایجاد/ویرایش پیش‌فاکتور
class InvoiceForm extends ConsumerStatefulWidget {
  const InvoiceForm({
    super.key,
    this.invoice,
    this.onSuccess,
    this.onCancel,
  });

  final Invoice? invoice;
  final VoidCallback? onSuccess;
  final VoidCallback? onCancel;

  @override
  ConsumerState<InvoiceForm> createState() => _InvoiceFormState();
}

class _InvoiceFormState extends ConsumerState<InvoiceForm> {
  final _formKey = GlobalKey<FormState>();
  
  final _items = <InvoiceLineItem>[];
  final _itemTitleController = TextEditingController();
  final _itemQuantityController = TextEditingController();
  final _itemUnitPriceController = TextEditingController();
  final _itemDiscountController = TextEditingController();
  final _itemTaxRateController = TextEditingController();

  CustomerSummary? _selectedCustomer;
  DateTime? _issuedAt;
  DateTime? _dueAt;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    if (widget.invoice != null) {
      _items.addAll(widget.invoice!.items);
      _issuedAt = widget.invoice!.issuedAt;
      _dueAt = widget.invoice!.dueAt;
    } else {
      _issuedAt = DateTime.now();
      _dueAt = DateTime.now().add(const Duration(days: 30));
    }
  }

  @override
  void dispose() {
    _itemTitleController.dispose();
    _itemQuantityController.dispose();
    _itemUnitPriceController.dispose();
    _itemDiscountController.dispose();
    _itemTaxRateController.dispose();
    super.dispose();
  }

  void _addItem() {
    if (_itemTitleController.text.trim().isEmpty ||
        _itemQuantityController.text.trim().isEmpty ||
        _itemUnitPriceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('لطفاً تمام فیلدهای آیتم را پر کنید'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    final quantity = double.tryParse(_itemQuantityController.text);
    final unitPrice = double.tryParse(_itemUnitPriceController.text);
    final discount = _itemDiscountController.text.trim().isEmpty
        ? null
        : double.tryParse(_itemDiscountController.text);
    final taxRate = _itemTaxRateController.text.trim().isEmpty
        ? null
        : double.tryParse(_itemTaxRateController.text);

    if (quantity == null || unitPrice == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('مقدار و قیمت واحد باید عدد معتبر باشند'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() {
      _items.add(InvoiceLineItem(
        title: _itemTitleController.text.trim(),
        quantity: quantity,
        unitPrice: unitPrice,
        discount: discount,
        taxRate: taxRate,
      ));
      _itemTitleController.clear();
      _itemQuantityController.clear();
      _itemUnitPriceController.clear();
      _itemDiscountController.clear();
      _itemTaxRateController.clear();
    });
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  Map<String, double> _calculateTotals() {
    double subtotal = 0.0;
    double discountTotal = 0.0;
    double taxTotal = 0.0;

    for (final item in _items) {
      final itemSubtotal = item.quantity * item.unitPrice;
      final itemDiscount = item.discount != null ? (itemSubtotal * item.discount! / 100) : 0.0;
      final afterDiscount = itemSubtotal - itemDiscount;
      final itemTax = item.taxRate != null ? (afterDiscount * item.taxRate! / 100) : 0.0;

      subtotal += itemSubtotal;
      discountTotal += itemDiscount;
      taxTotal += itemTax;
    }

    final grandTotal = subtotal - discountTotal + taxTotal;

    return {
      'subtotal': subtotal,
      'discountTotal': discountTotal,
      'taxTotal': taxTotal,
      'grandTotal': grandTotal,
    };
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedCustomer == null) {
      setState(() {
        _errorMessage = 'لطفاً مشتری را انتخاب کنید';
      });
      return;
    }

    if (_items.isEmpty) {
      setState(() {
        _errorMessage = 'حداقل یک آیتم باید اضافه شود';
      });
      return;
    }

    if (_issuedAt == null || _dueAt == null) {
      setState(() {
        _errorMessage = 'تاریخ صدور و سررسید الزامی است';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final repo = ref.read(invoicesRepositoryProvider);
      final totals = _calculateTotals();
      
      final payload = <String, dynamic>{
        'customerId': _selectedCustomer!.id,
        'issuedAt': _issuedAt!.toIso8601String(),
        'dueAt': _dueAt!.toIso8601String(),
        'currency': 'IRR',
        'items': _items.map((e) => e.toJson()).toList(),
        'subtotal': totals['subtotal'],
        'taxTotal': totals['taxTotal'],
        if (totals['discountTotal']! > 0) 'discountTotal': totals['discountTotal'],
        'grandTotal': totals['grandTotal'],
      };

      if (widget.invoice != null) {
        // Update
        await repo.updateInvoice(widget.invoice!.id, payload);
        setState(() {
          _successMessage = 'پیش‌فاکتور با موفقیت به‌روزرسانی شد.';
        });
      } else {
        // Create
        await repo.createInvoice(payload);
        setState(() {
          _successMessage = 'پیش‌فاکتور با موفقیت ثبت شد.';
        });
      }

      // Reset form if creating
      if (widget.invoice == null) {
        _formKey.currentState!.reset();
        _selectedCustomer = null;
        _items.clear();
        _issuedAt = DateTime.now();
        _dueAt = DateTime.now().add(const Duration(days: 30));
      }

      // Refresh list
      ref.invalidate(invoiceListFiltersProvider);
      final filters = ref.read(invoiceListFiltersProvider);
      ref.invalidate(invoicesListProvider(filters));

      // Call success callback
      if (mounted) {
        widget.onSuccess?.call();
      }
    } catch (error) {
      String message = 'خطا در ثبت پیش‌فاکتور';
      if (error is ApiException) {
        message = error.message;
      }
      setState(() {
        _errorMessage = message;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Load customers for dropdown
    final customersFilters = CustomerListFilters(
      status: null,
      page: 1,
      limit: 100,
    );
    final customersAsync = ref.watch(customersListProvider(customersFilters));
    
    final totals = _calculateTotals();

    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Messages
            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.1),
                  border: Border.all(color: AppColors.danger),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: AppColors.danger, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: AppColors.danger),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (_successMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.1),
                  border: Border.all(color: AppColors.accent),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle_outline, color: AppColors.accent, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _successMessage!,
                        style: TextStyle(color: AppColors.accent),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Customer selection
            customersAsync.when(
              data: (paginatedList) {
                final customers = paginatedList.data;
                return SearchableDropdown<CustomerSummary>(
                  items: customers,
                  label: 'مشتری',
                  displayItem: (customer) => '${customer.name} (${customer.code})',
                  hintText: 'انتخاب مشتری...',
                  selectedItem: _selectedCustomer,
                  prefixIcon: const Icon(Icons.person),
                  validator: (value) {
                    if (value == null) {
                      return 'انتخاب مشتری الزامی است';
                    }
                    return null;
                  },
                  onChanged: (customer) {
                    setState(() {
                      _selectedCustomer = customer;
                    });
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Text(
                'خطا در دریافت لیست مشتری‌ها',
                style: TextStyle(color: AppColors.danger),
              ),
            ),

            const SizedBox(height: 16),

            // Dates
            Row(
              children: [
                Expanded(
                  child: PersianDateTimePicker(
                    label: 'تاریخ صدور',
                    initialValue: _issuedAt,
                    onChanged: (dateTime) {
                      setState(() {
                        _issuedAt = dateTime;
                      });
                    },
                    prefixIcon: const Icon(Icons.calendar_today),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PersianDateTimePicker(
                    label: 'تاریخ سررسید',
                    initialValue: _dueAt,
                    onChanged: (dateTime) {
                      setState(() {
                        _dueAt = dateTime;
                      });
                    },
                    prefixIcon: const Icon(Icons.event),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Items section
            Text(
              'آیتم‌ها',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 12),

            // Add item form
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
                    AppTextField(
                      controller: _itemTitleController,
                      label: 'عنوان آیتم',
                      hintText: 'مثال: تعمیر موتور',
                      prefixIcon: const Icon(Icons.description),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: AppTextField(
                            controller: _itemQuantityController,
                            label: 'تعداد',
                            hintText: '1',
                            keyboardType: TextInputType.number,
                            prefixIcon: const Icon(Icons.numbers),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: AppTextField(
                            controller: _itemUnitPriceController,
                            label: 'قیمت واحد (ریال)',
                            hintText: '1000000',
                            keyboardType: TextInputType.number,
                            prefixIcon: const Icon(Icons.attach_money),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: AppTextField(
                            controller: _itemDiscountController,
                            label: 'تخفیف (%)',
                            hintText: '10',
                            keyboardType: TextInputType.number,
                            prefixIcon: const Icon(Icons.percent),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: AppTextField(
                            controller: _itemTaxRateController,
                            label: 'مالیات (%)',
                            hintText: '9',
                            keyboardType: TextInputType.number,
                            prefixIcon: const Icon(Icons.receipt),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    AppButton(
                      onPressed: _addItem,
                      variant: ButtonVariant.secondary,
                      leftIcon: const Icon(Icons.add, size: 20),
                      child: const Text('افزودن آیتم'),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Items list
            if (_items.isNotEmpty) ...[
              ...List.generate(_items.length, (index) {
                final item = _items[index];
                final itemTotal = item.calculateTotal();
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: AppColors.border),
                  ),
                  child: ListTile(
                    title: Text(item.title),
                    subtitle: Text(
                      'تعداد: ${item.quantity} × ${NumberFormat('#,###', 'fa').format(item.unitPrice)} = ${NumberFormat('#,###', 'fa').format(itemTotal)}',
                    ),
                    trailing: IconButton(
                      onPressed: () => _removeItem(index),
                      icon: const Icon(Icons.delete, color: AppColors.danger),
                    ),
                  ),
                );
              }),
              const SizedBox(height: 16),
            ],

            // Totals
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
                      value: NumberFormat('#,###', 'fa').format(totals['subtotal']),
                    ),
                    if (totals['discountTotal']! > 0) ...[
                      const Divider(),
                      _TotalRow(
                        label: 'تخفیف',
                        value: '- ${NumberFormat('#,###', 'fa').format(totals['discountTotal'])}',
                        color: AppColors.accent,
                      ),
                    ],
                    if (totals['taxTotal']! > 0) ...[
                      const Divider(),
                      _TotalRow(
                        label: 'مالیات',
                        value: NumberFormat('#,###', 'fa').format(totals['taxTotal']),
                      ),
                    ],
                    const Divider(),
                    _TotalRow(
                      label: 'مبلغ نهایی',
                      value: NumberFormat('#,###', 'fa').format(totals['grandTotal']),
                      isBold: true,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (widget.onCancel != null)
                  AppButton(
                    onPressed: _isLoading ? null : widget.onCancel,
                    variant: ButtonVariant.ghost,
                    child: const Text('انصراف'),
                  ),
                if (widget.onCancel != null) const SizedBox(width: 12),
                AppButton(
                  onPressed: _isLoading ? null : _handleSubmit,
                  isLoading: _isLoading,
                  loadingText: widget.invoice != null ? 'در حال به‌روزرسانی...' : 'در حال ثبت...',
                  child: Text(widget.invoice != null ? 'به‌روزرسانی' : 'ثبت پیش‌فاکتور'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

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

