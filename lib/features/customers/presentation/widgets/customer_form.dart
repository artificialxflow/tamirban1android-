import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/customers/models/customer.dart';
import '../../../../data/customers/models/customer_status.dart';
import '../../../../data/customers/models/geo_location.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_text_field.dart';
import '../../providers/customers_provider.dart';

/// فرم ایجاد/ویرایش مشتری
class CustomerForm extends ConsumerStatefulWidget {
  const CustomerForm({
    super.key,
    this.customer,
    this.onSuccess,
    this.onCancel,
  });

  final Customer? customer;
  final VoidCallback? onSuccess;
  final VoidCallback? onCancel;

  @override
  ConsumerState<CustomerForm> createState() => _CustomerFormState();
}

class _CustomerFormState extends ConsumerState<CustomerForm> {
  final _formKey = GlobalKey<FormState>();
  
  final _displayNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  final _tagsController = TextEditingController();
  final _notesController = TextEditingController();

  CustomerStatus _selectedStatus = CustomerStatus.active;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    if (widget.customer != null) {
      _displayNameController.text = widget.customer!.displayName;
      _phoneController.text = widget.customer!.contact.phone;
      _cityController.text = widget.customer!.contact.city ?? '';
      _tagsController.text = widget.customer!.tags.join(', ');
      _notesController.text = widget.customer!.notes ?? '';
      _selectedStatus = widget.customer!.status;
    }
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _tagsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final repo = ref.read(customersRepositoryProvider);
      
      // Parse tags
      final tags = _tagsController.text
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();

      final payload = <String, dynamic>{
        'displayName': _displayNameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'status': _selectedStatus.value,
        'tags': tags,
      };

      if (_cityController.text.trim().isNotEmpty) {
        payload['city'] = _cityController.text.trim();
      }

      if (_notesController.text.trim().isNotEmpty) {
        payload['notes'] = _notesController.text.trim();
      }

      if (widget.customer != null) {
        // Update
        await repo.updateCustomer(widget.customer!.id, payload);
        setState(() {
          _successMessage = 'مشتری با موفقیت به‌روزرسانی شد.';
        });
      } else {
        // Create
        await repo.createCustomer(payload);
        setState(() {
          _successMessage = 'مشتری با موفقیت ثبت شد.';
        });
      }

      // Reset form if creating
      if (widget.customer == null) {
        _formKey.currentState!.reset();
        _displayNameController.clear();
        _phoneController.clear();
        _cityController.clear();
        _tagsController.clear();
        _notesController.clear();
        _selectedStatus = CustomerStatus.active;
      }

      // Refresh list
      ref.invalidate(customerListFiltersProvider);
      final filters = ref.read(customerListFiltersProvider);
      ref.invalidate(customersListProvider(filters));

      // Call success callback
      if (mounted) {
        widget.onSuccess?.call();
      }
    } catch (error) {
      String message = 'خطا در ثبت مشتری';
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
    return Form(
      key: _formKey,
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

          // Form fields
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 600;
              if (isWide) {
                // Two columns layout
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          // Display Name
                          AppTextField(
                            controller: _displayNameController,
                            label: 'نام مشتری',
                            hintText: 'مثال: شرکت آرمان خودرو',
                            prefixIcon: const Icon(Icons.business),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'نام مشتری الزامی است';
                              }
                              if (value.trim().length < 3) {
                                return 'نام مشتری باید حداقل ۳ کاراکتر باشد';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          // City
                          AppTextField(
                            controller: _cityController,
                            label: 'شهر',
                            hintText: 'تهران',
                            prefixIcon: const Icon(Icons.location_city),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        children: [
                          // Phone
                          AppPhoneField(
                            controller: _phoneController,
                            label: 'شماره موبایل',
                            hintText: '09123456789',
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'شماره موبایل الزامی است';
                              }
                              if (value.trim().length != 11 || !value.startsWith('0')) {
                                return 'شماره موبایل باید ۱۱ رقم و با ۰ شروع شود';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          // Status
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'وضعیت',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.textPrimary,
                                    ),
                              ),
                              const SizedBox(height: 8),
                              DropdownButtonFormField<CustomerStatus>(
                                value: _selectedStatus,
                                isExpanded: true,
                                decoration: InputDecoration(
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: AppColors.border),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: AppColors.border),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                                  ),
                                ),
                                items: CustomerStatus.values.map((status) {
                                  return DropdownMenuItem<CustomerStatus>(
                                    value: status,
                                    child: Text(status.displayName),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  if (value != null) {
                                    setState(() => _selectedStatus = value);
                                  }
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              } else {
                // Single column layout
                return Column(
                  children: [
                    // Display Name
                    AppTextField(
                      controller: _displayNameController,
                      label: 'نام مشتری',
                      hintText: 'مثال: شرکت آرمان خودرو',
                      prefixIcon: const Icon(Icons.business),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'نام مشتری الزامی است';
                        }
                        if (value.trim().length < 3) {
                          return 'نام مشتری باید حداقل ۳ کاراکتر باشد';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // Phone
                    AppPhoneField(
                      controller: _phoneController,
                      label: 'شماره موبایل',
                      hintText: '09123456789',
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'شماره موبایل الزامی است';
                        }
                        if (value.trim().length != 11 || !value.startsWith('0')) {
                          return 'شماره موبایل باید ۱۱ رقم و با ۰ شروع شود';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // City
                    AppTextField(
                      controller: _cityController,
                      label: 'شهر',
                      hintText: 'تهران',
                      prefixIcon: const Icon(Icons.location_city),
                    ),
                    const SizedBox(height: 16),
                    // Status
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'وضعیت',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                                color: AppColors.textPrimary,
                              ),
                        ),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<CustomerStatus>(
                          value: _selectedStatus,
                          isExpanded: true,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: AppColors.border),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: AppColors.border),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: AppColors.primary, width: 2),
                            ),
                          ),
                          items: CustomerStatus.values.map((status) {
                            return DropdownMenuItem<CustomerStatus>(
                              value: status,
                              child: Text(status.displayName),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => _selectedStatus = value);
                            }
                          },
                        ),
                      ],
                    ),
                  ],
                );
              }
            },
          ),

          const SizedBox(height: 16),

          // Tags
          AppTextField(
            controller: _tagsController,
            label: 'برچسب‌ها (با کاما جدا کنید)',
            hintText: 'VIP, قطعات, فوری',
            prefixIcon: const Icon(Icons.label),
            helperText: 'برچسب‌ها را با کاما از هم جدا کنید',
          ),

          const SizedBox(height: 16),

          // Notes
          AppTextField(
            controller: _notesController,
            label: 'یادداشت',
            hintText: 'توضیحات یا نیازهای ویژه مشتری',
            prefixIcon: const Icon(Icons.note),
            maxLines: 3,
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
                loadingText: widget.customer != null ? 'در حال به‌روزرسانی...' : 'در حال ثبت...',
                child: Text(widget.customer != null ? 'به‌روزرسانی' : 'ثبت مشتری'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

