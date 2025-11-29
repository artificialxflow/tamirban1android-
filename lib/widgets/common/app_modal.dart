import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';

/// کامپوننت Modal مشترک مطابق UI Style Guide
///
/// ویژگی‌ها:
/// - Backdrop blur
/// - Rounded corners (rounded-3xl)
/// - Close button
/// - Responsive
class AppModal extends StatelessWidget {
  const AppModal({
    super.key,
    required this.title,
    required this.child,
    this.subtitle,
    this.onClose,
    this.actions,
    this.width,
    this.maxHeight,
  });

  final String title;
  final String? subtitle;
  final Widget child;
  final VoidCallback? onClose;
  final List<Widget>? actions;
  final double? width;
  final double? maxHeight;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(16),
      child: Container(
        constraints: BoxConstraints(
          maxWidth: width ?? 600,
          maxHeight: maxHeight ?? MediaQuery.of(context).size.height * 0.9,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(24), // rounded-3xl
          border: Border.all(
            color: AppColors.border.withValues(alpha: 0.6),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.border),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                        ),
                        if (subtitle != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            subtitle!,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (onClose != null)
                    IconButton(
                      onPressed: onClose,
                      icon: const Icon(Icons.close),
                      color: AppColors.textSecondary,
                      iconSize: 24,
                    ),
                ],
              ),
            ),
            // Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: child,
              ),
            ),
            // Actions (footer)
            if (actions != null && actions!.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: AppColors.border),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: actions!,
                ),
              ),
          ],
        ),
      ),
    );
  }

  /// نمایش Modal به صورت برنامه‌نویسی
  static Future<T?> show<T>({
    required BuildContext context,
    required String title,
    required Widget child,
    String? subtitle,
    List<Widget>? actions,
    double? width,
    double? maxHeight,
    bool barrierDismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierColor: Colors.black.withValues(alpha: 0.4),
      builder: (context) => AppModal(
        title: title,
        subtitle: subtitle,
        child: child,
        onClose: () => Navigator.of(context).pop(),
        actions: actions,
        width: width,
        maxHeight: maxHeight,
      ),
    );
  }
}

