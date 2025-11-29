import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/constants/app_colors.dart';

/// کامپوننت ورودی متن مشترک مطابق UI Style Guide
///
/// ویژگی‌ها:
/// - Label (اختیاری)
/// - Helper Text (اختیاری)
/// - Error Text (اختیاری)
/// - انواع ورودی (text, tel, email, number, password, etc.)
/// - استایل مطابق UI Style Guide (rounded-xl, border, focus ring)
class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    this.controller,
    this.label,
    this.hintText,
    this.helperText,
    this.errorText,
    this.prefixIcon,
    this.suffixIcon,
    this.keyboardType,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.maxLines = 1,
    this.maxLength,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.inputFormatters,
    this.textInputAction,
    this.autofocus = false,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final String? helperText;
  final String? errorText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final int? maxLines;
  final int? maxLength;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction? textInputAction;
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final hasError = errorText != null && errorText!.isNotEmpty;
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
        ],
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          enabled: enabled,
          readOnly: readOnly,
          maxLines: maxLines,
          maxLength: maxLength,
          onChanged: onChanged,
          onSubmitted: onSubmitted,
          inputFormatters: inputFormatters,
          textInputAction: textInputAction,
          autofocus: autofocus,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: enabled ? AppColors.textPrimary : AppColors.textSecondary,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: theme.textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: enabled ? AppColors.surface : AppColors.background,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12), // rounded-xl
              borderSide: BorderSide(
                color: hasError ? AppColors.danger : AppColors.border,
                width: 1,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: hasError ? AppColors.danger : AppColors.border,
                width: 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: hasError ? AppColors.danger : AppColors.primary,
                width: 2,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: AppColors.border,
                width: 1,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: AppColors.danger,
                width: 1,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: AppColors.danger,
                width: 2,
              ),
            ),
            errorText: hasError ? errorText : null,
            errorStyle: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.danger,
              fontSize: 12,
            ),
            helperText: !hasError ? helperText : null,
            helperStyle: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
            counterText: '', // Hide default counter
          ),
        ),
      ],
    );
  }
}

/// کامپوننت ورودی شماره موبایل با فرمت خودکار
class AppPhoneField extends StatefulWidget {
  const AppPhoneField({
    super.key,
    this.controller,
    this.label = 'شماره موبایل',
    this.hintText = '09123456789',
    this.helperText,
    this.errorText,
    this.onChanged,
    this.validator,
    this.enabled = true,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final String? helperText;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;
  final bool enabled;

  @override
  State<AppPhoneField> createState() => _AppPhoneFieldState();
}

class _AppPhoneFieldState extends State<AppPhoneField> {
  late TextEditingController _controller;
  bool _isInternalController = false;

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      _controller = widget.controller!;
    } else {
      _controller = TextEditingController();
      _isInternalController = true;
    }
  }

  @override
  void dispose() {
    if (_isInternalController) {
      _controller.dispose();
    }
    super.dispose();
  }

  String _normalizePhone(String phone) {
    // Remove non-digits
    phone = phone.replaceAll(RegExp(r'[^\d]'), '');
    
    if (phone.isEmpty) return '';
    
    // Ensure starts with 0 and is 11 digits
    if (phone.startsWith('0')) {
      if (phone.length > 11) {
        return phone.substring(0, 11);
      }
      return phone;
    }
    
    // Add 0 prefix if missing
    if (phone.length >= 10 && phone.length <= 11) {
      if (!phone.startsWith('0')) {
        return '0$phone';
      }
    }
    
    return phone;
  }

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      controller: _controller,
      label: widget.label,
      hintText: widget.hintText,
      helperText: widget.helperText ?? 'شماره را بدون 0 اول وارد کنید (مثال: 912345678)',
      errorText: widget.errorText,
      prefixIcon: const Icon(Icons.phone),
      keyboardType: TextInputType.phone,
      enabled: widget.enabled,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(11),
        _IranianPhoneFormatter(),
      ],
      onChanged: (value) {
        final normalized = _normalizePhone(value);
        if (normalized != value && _controller.text != normalized) {
          _controller.value = TextEditingValue(
            text: normalized,
            selection: TextSelection.collapsed(offset: normalized.length),
          );
        }
        widget.onChanged?.call(normalized);
      },
      validator: widget.validator,
    );
  }
}

/// Formatter برای شماره موبایل ایرانی
class _IranianPhoneFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text;
    
    // Only digits
    if (text.isEmpty) {
      return newValue;
    }
    
    // Ensure starts with 0
    String formatted = text;
    if (!formatted.startsWith('0') && formatted.isNotEmpty) {
      formatted = '0$formatted';
    }
    
    // Prevent double 0
    if (formatted.startsWith('00')) {
      formatted = '0${formatted.substring(2)}';
    }
    
    // Limit to 11 digits
    if (formatted.length > 11) {
      formatted = formatted.substring(0, 11);
    }
    
    if (formatted != text) {
      return TextEditingValue(
        text: formatted,
        selection: TextSelection.collapsed(offset: formatted.length),
      );
    }
    
    return newValue;
  }
}

/// کامپوننت ورودی مبلغ (با فرمت هزارگان)
class AppAmountField extends StatefulWidget {
  const AppAmountField({
    super.key,
    this.controller,
    this.label = 'مبلغ',
    this.hintText,
    this.helperText,
    this.errorText,
    this.onChanged,
    this.validator,
    this.enabled = true,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hintText;
  final String? helperText;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;
  final bool enabled;

  @override
  State<AppAmountField> createState() => _AppAmountFieldState();
}

class _AppAmountFieldState extends State<AppAmountField> {
  late TextEditingController _controller;
  bool _isInternalController = false;

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      _controller = widget.controller!;
    } else {
      _controller = TextEditingController();
      _isInternalController = true;
    }
  }

  @override
  void dispose() {
    if (_isInternalController) {
      _controller.dispose();
    }
    super.dispose();
  }

  String _formatAmount(String value) {
    // Remove commas
    final digits = value.replaceAll(',', '');
    if (digits.isEmpty) return '';
    
    // Format with commas
    final formatted = digits.replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
    
    return formatted;
  }

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      controller: _controller,
      label: widget.label,
      hintText: widget.hintText ?? '1,000,000',
      helperText: widget.helperText,
      errorText: widget.errorText,
      prefixIcon: const Icon(Icons.attach_money),
      keyboardType: TextInputType.number,
      enabled: widget.enabled,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[\d,]')),
        LengthLimitingTextInputFormatter(20),
      ],
      onChanged: (value) {
        final formatted = _formatAmount(value);
        if (formatted != value && _controller.text != formatted) {
          _controller.value = TextEditingValue(
            text: formatted,
            selection: TextSelection.collapsed(offset: formatted.length),
          );
        }
        // Call onChanged with numeric value (without commas)
        final numericValue = formatted.replaceAll(',', '');
        widget.onChanged?.call(numericValue);
      },
      validator: widget.validator,
    );
  }
}

