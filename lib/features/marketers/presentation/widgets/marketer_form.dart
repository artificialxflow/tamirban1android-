import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/errors/api_error.dart';
import '../../../../data/marketers/models/marketer.dart';
import '../../../../widgets/common/app_button.dart';
import '../../../../widgets/common/app_text_field.dart';
import '../../providers/marketers_provider.dart';

/// فرم ایجاد/ویرایش بازاریاب
class MarketerForm extends ConsumerStatefulWidget {
  const MarketerForm({
    super.key,
    this.marketer,
    this.onSuccess,
    this.onCancel,
  });

  final Marketer? marketer;
  final VoidCallback? onSuccess;
  final VoidCallback? onCancel;

  @override
  ConsumerState<MarketerForm> createState() => _MarketerFormState();
}

class _MarketerFormState extends ConsumerState<MarketerForm> {
  final _formKey = GlobalKey<FormState>();
  
  final _fullNameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _emailController = TextEditingController();
  final _regionController = TextEditingController();

  String _selectedRole = 'MARKETER';
  bool _isActive = true;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    if (widget.marketer != null) {
      _fullNameController.text = widget.marketer!.fullName;
      _mobileController.text = widget.marketer!.mobile;
      _emailController.text = widget.marketer!.email ?? '';
      _regionController.text = widget.marketer!.region;
      _selectedRole = widget.marketer!.role;
      _isActive = widget.marketer!.isActive;
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    _regionController.dispose();
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
      final repo = ref.read(marketersRepositoryProvider);
      
      final payload = <String, dynamic>{
        'fullName': _fullNameController.text.trim(),
        'mobile': _mobileController.text.trim(),
        'role': _selectedRole,
        'region': _regionController.text.trim(),
        'isActive': _isActive,
      };

      if (_emailController.text.trim().isNotEmpty) {
        payload['email'] = _emailController.text.trim();
      }

      if (widget.marketer != null) {
        // Update
        await repo.updateMarketer(widget.marketer!.id, payload);
        setState(() {
          _successMessage = 'بازاریاب با موفقیت به‌روزرسانی شد.';
        });
      } else {
        // Create
        await repo.createMarketer(payload);
        setState(() {
          _successMessage = 'بازاریاب با موفقیت ثبت شد.';
        });
      }

      // Reset form if creating
      if (widget.marketer == null) {
        _formKey.currentState!.reset();
        _fullNameController.clear();
        _mobileController.clear();
        _emailController.clear();
        _regionController.clear();
        _selectedRole = 'MARKETER';
        _isActive = true;
      }

      // Refresh list
      ref.invalidate(marketerListFiltersProvider);
      final filters = ref.read(marketerListFiltersProvider);
      ref.invalidate(marketersListProvider(filters));

      // Call success callback
      if (mounted) {
        widget.onSuccess?.call();
      }
    } catch (error) {
      String message = 'خطا در ثبت بازاریاب';
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
                          // Full Name
                          AppTextField(
                            controller: _fullNameController,
                            label: 'نام و نام خانوادگی',
                            hintText: 'مثال: علی محمدی',
                            prefixIcon: const Icon(Icons.person),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'نام و نام خانوادگی الزامی است';
                              }
                              if (value.trim().length < 3) {
                                return 'نام باید حداقل ۳ کاراکتر باشد';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          // Email
                          AppTextField(
                            controller: _emailController,
                            label: 'ایمیل (اختیاری)',
                            hintText: 'example@email.com',
                            prefixIcon: const Icon(Icons.email),
                            keyboardType: TextInputType.emailAddress,
                            validator: (value) {
                              if (value != null && value.trim().isNotEmpty) {
                                final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                                if (!emailRegex.hasMatch(value.trim())) {
                                  return 'ایمیل معتبر وارد کنید';
                                }
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        children: [
                          // Mobile
                          AppPhoneField(
                            controller: _mobileController,
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
                          // Region
                          AppTextField(
                            controller: _regionController,
                            label: 'منطقه',
                            hintText: 'تهران',
                            prefixIcon: const Icon(Icons.location_on),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'منطقه الزامی است';
                              }
                              return null;
                            },
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
                    // Full Name
                    AppTextField(
                      controller: _fullNameController,
                      label: 'نام و نام خانوادگی',
                      hintText: 'مثال: علی محمدی',
                      prefixIcon: const Icon(Icons.person),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'نام و نام خانوادگی الزامی است';
                        }
                        if (value.trim().length < 3) {
                          return 'نام باید حداقل ۳ کاراکتر باشد';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // Mobile
                    AppPhoneField(
                      controller: _mobileController,
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
                    // Email
                    AppTextField(
                      controller: _emailController,
                      label: 'ایمیل (اختیاری)',
                      hintText: 'example@email.com',
                      prefixIcon: const Icon(Icons.email),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value != null && value.trim().isNotEmpty) {
                          final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                          if (!emailRegex.hasMatch(value.trim())) {
                            return 'ایمیل معتبر وارد کنید';
                          }
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // Region
                    AppTextField(
                      controller: _regionController,
                      label: 'منطقه',
                      hintText: 'تهران',
                      prefixIcon: const Icon(Icons.location_on),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'منطقه الزامی است';
                        }
                        return null;
                      },
                    ),
                  ],
                );
              }
            },
          ),

          const SizedBox(height: 16),

          // Role
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'نقش',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedRole,
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
                items: const [
                  DropdownMenuItem<String>(
                    value: 'MARKETER',
                    child: Text('بازاریاب'),
                  ),
                  DropdownMenuItem<String>(
                    value: 'FINANCE_MANAGER',
                    child: Text('مدیر مالی'),
                  ),
                  DropdownMenuItem<String>(
                    value: 'SUPER_ADMIN',
                    child: Text('مدیر کل'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedRole = value);
                  }
                },
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Is Active
          Row(
            children: [
              Checkbox(
                value: _isActive,
                onChanged: (value) {
                  setState(() => _isActive = value ?? true);
                },
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'حساب فعال است',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ],
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
                loadingText: widget.marketer != null ? 'در حال به‌روزرسانی...' : 'در حال ثبت...',
                child: Text(widget.marketer != null ? 'به‌روزرسانی' : 'ثبت بازاریاب'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

