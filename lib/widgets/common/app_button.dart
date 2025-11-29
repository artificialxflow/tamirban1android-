import 'package:flutter/material.dart';

/// کامپوننت دکمه مشترک مطابق UI Style Guide
/// 
/// Variants:
/// - Primary: دکمه اصلی با رنگ primary
/// - Secondary: دکمه با border
/// - Ghost: دکمه بدون background
/// - Danger: دکمه حذف/عملیات حساس
/// 
/// Sizes:
/// - sm: کوچک (text-xs, rounded-full)
/// - md: متوسط (text-sm, rounded-xl) - پیش‌فرض
/// - lg: بزرگ (text-base, rounded-2xl)
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.child,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    this.leftIcon,
    this.rightIcon,
    this.isLoading = false,
    this.loadingText,
    this.fullWidth = false,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final Widget? leftIcon;
  final Widget? rightIcon;
  final bool isLoading;
  final String? loadingText;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDisabled = onPressed == null || isLoading;

    return SizedBox(
      width: fullWidth ? double.infinity : null,
      child: _buildButton(theme, isDisabled),
    );
  }

  Widget _buildButton(ThemeData theme, bool isDisabled) {
    switch (variant) {
      case ButtonVariant.primary:
        return _PrimaryButton(
          child: child,
          onPressed: isDisabled ? null : onPressed,
          size: size,
          leftIcon: leftIcon,
          rightIcon: rightIcon,
          isLoading: isLoading,
          loadingText: loadingText,
        );
      case ButtonVariant.secondary:
        return _SecondaryButton(
          child: child,
          onPressed: isDisabled ? null : onPressed,
          size: size,
          leftIcon: leftIcon,
          rightIcon: rightIcon,
          isLoading: isLoading,
          loadingText: loadingText,
        );
      case ButtonVariant.ghost:
        return _GhostButton(
          child: child,
          onPressed: isDisabled ? null : onPressed,
          size: size,
          leftIcon: leftIcon,
          rightIcon: rightIcon,
          isLoading: isLoading,
          loadingText: loadingText,
        );
      case ButtonVariant.danger:
        return _DangerButton(
          child: child,
          onPressed: isDisabled ? null : onPressed,
          size: size,
          leftIcon: leftIcon,
          rightIcon: rightIcon,
          isLoading: isLoading,
          loadingText: loadingText,
        );
    }
  }
}

/// نوع دکمه
enum ButtonVariant {
  primary,
  secondary,
  ghost,
  danger,
}

/// سایز دکمه
enum ButtonSize {
  sm,
  md,
  lg,
}

// ========================================
// Implementations
// ========================================

abstract class _BaseButton extends StatelessWidget {
  const _BaseButton({
    required this.child,
    this.onPressed,
    required this.size,
    this.leftIcon,
    this.rightIcon,
    this.isLoading = false,
    this.loadingText,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final ButtonSize size;
  final Widget? leftIcon;
  final Widget? rightIcon;
  final bool isLoading;
  final String? loadingText;

  Color get backgroundColor;
  Color get foregroundColor;
  Color get hoverColor;
  Color get disabledColor;
  Color? get borderColor;
  double? get borderWidth;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: onPressed == null ? disabledColor : backgroundColor,
      borderRadius: _getBorderRadius(),
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: _getBorderRadius(),
        child: Container(
          padding: _getPadding(),
          decoration: BoxDecoration(
            borderRadius: _getBorderRadius(),
            border: borderColor != null
                ? Border.all(
                    color: onPressed == null ? disabledColor : borderColor!,
                    width: borderWidth ?? 1.0,
                  )
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isLoading) ...[
                SizedBox(
                  width: _getIconSize(),
                  height: _getIconSize(),
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      onPressed == null ? disabledColor : foregroundColor,
                    ),
                  ),
                ),
                if (loadingText != null) const SizedBox(width: 8),
              ] else if (leftIcon != null) ...[
                SizedBox(
                  width: _getIconSize(),
                  height: _getIconSize(),
                  child: leftIcon,
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: DefaultTextStyle(
                  style: TextStyle(
                    fontSize: _getFontSize(),
                    fontWeight: FontWeight.w600,
                    color: onPressed == null ? disabledColor : foregroundColor,
                  ),
                  textAlign: TextAlign.center,
                  child: isLoading && loadingText != null
                      ? Text(loadingText!)
                      : child,
                ),
              ),
              if (!isLoading && rightIcon != null) ...[
                const SizedBox(width: 8),
                SizedBox(
                  width: _getIconSize(),
                  height: _getIconSize(),
                  child: rightIcon,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  BorderRadius _getBorderRadius() {
    switch (size) {
      case ButtonSize.sm:
        return BorderRadius.circular(20); // rounded-full
      case ButtonSize.md:
        return BorderRadius.circular(12); // rounded-xl
      case ButtonSize.lg:
        return BorderRadius.circular(16); // rounded-2xl
    }
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case ButtonSize.sm:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
      case ButtonSize.md:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case ButtonSize.lg:
        return const EdgeInsets.symmetric(horizontal: 20, vertical: 12);
    }
  }

  double _getFontSize() {
    switch (size) {
      case ButtonSize.sm:
        return 12; // text-xs
      case ButtonSize.md:
        return 14; // text-sm
      case ButtonSize.lg:
        return 16; // text-base
    }
  }

  double _getIconSize() {
    return 16;
  }
}

class _PrimaryButton extends _BaseButton {
  const _PrimaryButton({
    required super.child,
    super.onPressed,
    required super.size,
    super.leftIcon,
    super.rightIcon,
    super.isLoading,
    super.loadingText,
  });

  @override
  Color get backgroundColor => const Color(0xFF3B82F6); // primary-500

  @override
  Color get foregroundColor => Colors.white;

  @override
  Color get hoverColor => const Color(0xFF2563EB); // primary-600

  @override
  Color get disabledColor => const Color(0xFF94A3B8); // slate-400

  @override
  Color? get borderColor => null;

  @override
  double? get borderWidth => null;
}

class _SecondaryButton extends _BaseButton {
  const _SecondaryButton({
    required super.child,
    super.onPressed,
    required super.size,
    super.leftIcon,
    super.rightIcon,
    super.isLoading,
    super.loadingText,
  });

  @override
  Color get backgroundColor => Colors.transparent;

  @override
  Color get foregroundColor => const Color(0xFF1E40AF); // primary-700

  @override
  Color get hoverColor => const Color(0xFFEFF6FF); // primary-50

  @override
  Color get disabledColor => const Color(0xFF94A3B8);

  @override
  Color get borderColor => const Color(0xFFBFDBFE); // primary-200

  @override
  double? get borderWidth => 1.0;
}

class _GhostButton extends _BaseButton {
  const _GhostButton({
    required super.child,
    super.onPressed,
    required super.size,
    super.leftIcon,
    super.rightIcon,
    super.isLoading,
    super.loadingText,
  });

  @override
  Color get backgroundColor => Colors.transparent;

  @override
  Color get foregroundColor => const Color(0xFF475569); // slate-600

  @override
  Color get hoverColor => const Color(0xFFF1F5F9); // slate-100

  @override
  Color get disabledColor => const Color(0xFF94A3B8);

  @override
  Color? get borderColor => null;

  @override
  double? get borderWidth => null;
}

class _DangerButton extends _BaseButton {
  const _DangerButton({
    required super.child,
    super.onPressed,
    required super.size,
    super.leftIcon,
    super.rightIcon,
    super.isLoading,
    super.loadingText,
  });

  @override
  Color get backgroundColor => const Color(0xFFEF4444); // rose-500

  @override
  Color get foregroundColor => Colors.white;

  @override
  Color get hoverColor => const Color(0xFFDC2626); // rose-600

  @override
  Color get disabledColor => const Color(0xFF94A3B8);

  @override
  Color? get borderColor => null;

  @override
  double? get borderWidth => null;
}

