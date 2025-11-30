import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/customers/models/customer_summary.dart';
import '../../../../data/marketers/models/marketer_summary.dart';
import '../../../../data/visits/models/visit.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_text_field.dart';
import '../../../../widgets/common/persian_datetime_picker.dart';
import '../../../../widgets/common/searchable_dropdown.dart';
import '../../../customers/providers/customers_provider.dart';
import '../../../marketers/providers/marketers_provider.dart';
import '../../providers/visits_provider.dart';

/// فرم ایجاد/ویرایش ویزیت
class VisitForm extends ConsumerStatefulWidget {
  const VisitForm({
    super.key,
    this.visit,
    this.onSuccess,
    this.onCancel,
  });

  final Visit? visit;
  final VoidCallback? onSuccess;
  final VoidCallback? onCancel;

  @override
  ConsumerState<VisitForm> createState() => _VisitFormState();
}

class _VisitFormState extends ConsumerState<VisitForm> {
  final _formKey = GlobalKey<FormState>();
  
  final _notesController = TextEditingController();
  final _followUpActionController = TextEditingController();

  CustomerSummary? _selectedCustomer;
  MarketerSummary? _selectedMarketer;
  DateTime? _scheduledDateTime;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    if (widget.visit != null) {
      _scheduledDateTime = widget.visit!.scheduledAt;
      _notesController.text = widget.visit!.notes ?? '';
      _followUpActionController.text = widget.visit!.followUpAction ?? '';
      // Customer and Marketer will be loaded in build method
    } else {
      // Default to tomorrow at 12:00
      final tomorrow = DateTime.now().add(const Duration(days: 1));
      _scheduledDateTime = DateTime(tomorrow.year, tomorrow.month, tomorrow.day, 12, 0);
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    _followUpActionController.dispose();
    super.dispose();
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

    if (_scheduledDateTime == null) {
      setState(() {
        _errorMessage = 'لطفاً تاریخ و زمان را انتخاب کنید';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final repo = ref.read(visitsRepositoryProvider);
      
      final payload = <String, dynamic>{
        'customerId': _selectedCustomer!.id,
        'marketerId': _selectedMarketer?.id ?? '',
        'scheduledAt': _scheduledDateTime!.toIso8601String(),
      };

      if (_notesController.text.trim().isNotEmpty) {
        payload['notes'] = _notesController.text.trim();
      }

      if (_followUpActionController.text.trim().isNotEmpty) {
        payload['followUpAction'] = _followUpActionController.text.trim();
      }

      if (widget.visit != null) {
        // Update
        await repo.updateVisit(widget.visit!.id, payload);
        setState(() {
          _successMessage = 'ویزیت با موفقیت به‌روزرسانی شد.';
        });
      } else {
        // Create
        await repo.createVisit(payload);
        setState(() {
          _successMessage = 'ویزیت با موفقیت ثبت شد.';
        });
      }

      // Reset form if creating
      if (widget.visit == null) {
        _formKey.currentState!.reset();
        _selectedCustomer = null;
        _selectedMarketer = null;
        final tomorrow = DateTime.now().add(const Duration(days: 1));
        _scheduledDateTime = DateTime(tomorrow.year, tomorrow.month, tomorrow.day, 12, 0);
        _notesController.clear();
        _followUpActionController.clear();
      }

      // Refresh list
      ref.invalidate(visitListFiltersProvider);
      final filters = ref.read(visitListFiltersProvider);
      ref.invalidate(visitsListProvider(filters));

      // Call success callback
      if (mounted) {
        widget.onSuccess?.call();
      }
    } catch (error) {
      String message = 'خطا در ثبت ویزیت';
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
      status: null, // همه مشتری‌ها
      page: 1,
      limit: 100, // برای dropdown
    );
    final customersAsync = ref.watch(customersListProvider(customersFilters));
    
    // Load marketers for dropdown
    final marketersFilters = MarketerListFilters(
      isActive: true, // فقط بازاریاب‌های فعال
      page: 1,
      limit: 100,
    );
    final marketersAsync = ref.watch(marketersListProvider(marketersFilters));
    
    // Load customer if editing
    if (widget.visit != null && _selectedCustomer == null) {
      final customerDetailAsync = ref.watch(customerDetailProvider(widget.visit!.customerId));
      customerDetailAsync.whenData((customer) {
        // Convert Customer to CustomerSummary for dropdown
        final customerSummary = CustomerSummary(
          id: customer.id,
          code: customer.code,
          name: customer.displayName,
          marketer: customer.assignedMarketerName,
          city: customer.contact.city,
          status: customer.status,
          grade: customer.grade,
          monthlyRevenue: customer.revenueMonthly,
          lastVisitAt: customer.lastVisitAt,
          tags: customer.tags,
        );
        if (mounted && _selectedCustomer == null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && _selectedCustomer == null) {
              setState(() {
                _selectedCustomer = customerSummary;
              });
            }
          });
        }
      });
    }
    
    // Load marketer if editing
    if (widget.visit != null && _selectedMarketer == null && widget.visit!.marketerId.isNotEmpty) {
      final marketerDetailAsync = ref.watch(marketerDetailProvider(widget.visit!.marketerId));
      marketerDetailAsync.whenData((marketer) {
        final marketerSummary = marketer.toSummary();
        if (mounted && _selectedMarketer == null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && _selectedMarketer == null) {
              setState(() {
                _selectedMarketer = marketerSummary;
              });
            }
          });
        }
      });
    }

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

          // Marketer selection
          marketersAsync.when(
            data: (paginatedList) {
              final marketers = paginatedList.data;
              return SearchableDropdown<MarketerSummary>(
                items: marketers,
                label: 'بازاریاب',
                displayItem: (marketer) => '${marketer.fullName} (${marketer.region})',
                hintText: 'انتخاب بازاریاب...',
                selectedItem: _selectedMarketer,
                prefixIcon: const Icon(Icons.badge),
                onChanged: (marketer) {
                  setState(() {
                    _selectedMarketer = marketer;
                  });
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => Text(
              'خطا در دریافت لیست بازاریاب‌ها',
              style: TextStyle(color: AppColors.danger),
            ),
          ),

          const SizedBox(height: 16),

          // Date and Time
          PersianDateTimePicker(
            label: 'تاریخ و زمان ویزیت',
            initialValue: _scheduledDateTime,
            onChanged: (dateTime) {
              setState(() {
                _scheduledDateTime = dateTime;
              });
            },
            validator: (value) {
              if (value == null) {
                return 'تاریخ و زمان الزامی است';
              }
              return null;
            },
            prefixIcon: const Icon(Icons.calendar_today),
          ),

          const SizedBox(height: 16),

          // Notes
          AppTextField(
            controller: _notesController,
            label: 'یادداشت',
            hintText: 'یادداشت‌های ویزیت',
            prefixIcon: const Icon(Icons.note),
            maxLines: 3,
          ),

          const SizedBox(height: 16),

          // Follow-up action
          AppTextField(
            controller: _followUpActionController,
            label: 'اقدام پیگیری',
            hintText: 'اقدامات لازم برای پیگیری',
            prefixIcon: const Icon(Icons.track_changes),
            maxLines: 2,
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
                loadingText: widget.visit != null ? 'در حال به‌روزرسانی...' : 'در حال ثبت...',
                child: Text(widget.visit != null ? 'به‌روزرسانی' : 'ثبت ویزیت'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

