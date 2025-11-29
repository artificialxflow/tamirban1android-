import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_environment.dart';
import '../../../core/errors/api_error.dart';
import '../../dashboard/presentation/pages/dashboard_placeholder.dart';
import '../../../core/di/providers.dart';
import '../../../data/auth/auth_repository.dart';
import '../../../data/auth/models/auth_tokens.dart';
import '../../../data/auth/models/user.dart';
import '../providers/auth_provider.dart';
import '../../../widgets/common/common_widgets.dart';

class LoginPage extends HookConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const Scaffold(
      body: SafeArea(
        child: _LoginContent(),
      ),
    );
  }
}

class _LoginContent extends StatefulWidget {
  const _LoginContent();

  @override
  State<_LoginContent> createState() => _LoginContentState();
}

class _LoginContentState extends State<_LoginContent> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();

  bool _isRequesting = false;
  bool _isVerifying = false;
  String? _requestMessage;
  String? _verifyMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  /// Normalize phone number to format expected by backend (09xxxxxxxxx)
  String get _normalizedPhone {
    String phone = _phoneController.text.trim();
    
    // Remove any non-digit characters
    phone = phone.replaceAll(RegExp(r'[^\d]'), '');
    
    // If empty, return empty
    if (phone.isEmpty) {
      return '';
    }
    
    // If starts with 0, keep it (already in correct format)
    if (phone.startsWith('0')) {
      // Make sure it's 11 digits (09xxxxxxxxx)
      if (phone.length == 11) {
        return phone;
      }
      // If it's longer than 11, take first 11
      if (phone.length > 11) {
        return phone.substring(0, 11);
      }
    }
    
    // If starts with 9 (10 digits), add 0 prefix
    if (phone.startsWith('9') && phone.length == 10) {
      return '0$phone';
    }
    
    // If starts with 98, remove it and add 0
    if (phone.startsWith('98') && phone.length == 12) {
      return '0${phone.substring(2)}';
    }
    
    // If starts with +98, it's already handled by replaceAll above
    // Final format should be 09xxxxxxxxx (11 digits)
    if (phone.length >= 10 && phone.length <= 11) {
      // If doesn't start with 0, add it
      if (!phone.startsWith('0')) {
        return '0$phone';
      }
      return phone;
    }
    
    return phone;
  }

  /// Mock login برای حالت تست بدون backend
  Future<void> _mockLogin(AuthNotifier authNotifier, String phone) async {
    // ایجاد mock user
    final mockUser = User(
      id: 'test-user-${DateTime.now().millisecondsSinceEpoch}',
      fullName: 'کاربر تست',
      mobile: phone,
      role: 'SUPER_ADMIN',
      isActive: true,
    );

    // ایجاد mock tokens (برای تست)
    final mockTokens = AuthTokens(
      accessToken: 'mock-access-token-${DateTime.now().millisecondsSinceEpoch}',
      refreshToken: 'mock-refresh-token-${DateTime.now().millisecondsSinceEpoch}',
    );

    await authNotifier.login(mockUser, mockTokens);
  }

  Future<void> _handleRequestOtp(WidgetRef ref) async {
    if (_normalizedPhone.isEmpty) {
      setState(() {
        _requestMessage = 'لطفاً شماره موبایل را وارد کنید.';
      });
      return;
    }

    setState(() {
      _isRequesting = true;
      _requestMessage = null;
    });

    final apiClient = ref.read(apiClientProvider);
    final repo = AuthRepository(apiClient);

    try {
      await repo.requestOtp(mobile: _normalizedPhone);
      setState(() {
        _requestMessage =
            'کد تایید به شماره موبایل شما ارسال شد. (در حالت تست: 0000)';
      });
    } catch (error) {
      String errorMessage = 'ارسال کد ناموفق بود.';
      
      if (error is ApiException) {
        errorMessage = error.message;
        // اگر خطای Connection Refused یا CORS باشد، پیام مناسب نمایش بده
        if (error.code == ApiErrorCode.internalServerError &&
            (error.message.contains('Connection refused') ||
             error.message.contains('در دسترس نیست'))) {
          if (AppConfig.enableOfflineMode) {
            errorMessage = 'سرور در دسترس نیست. می‌توانید مستقیماً از کد تست 0000 برای ورود استفاده کنید.';
          }
        }
      } else {
        // Check for specific error types (fallback)
        final errorString = error.toString().toLowerCase();
        if (errorString.contains('cors') || 
            errorString.contains('connection refused') ||
            errorString.contains('connection') ||
            errorString.contains('network')) {
          if (AppConfig.enableOfflineMode) {
            errorMessage = 'سرور در دسترس نیست. می‌توانید مستقیماً از کد تست 0000 برای ورود استفاده کنید.';
          } else {
            errorMessage = 'سرور در دسترس نیست. لطفاً مطمئن شوید که backend در حال اجرا است.';
          }
        }
      }
      
      if (mounted) {
        setState(() {
          _requestMessage = errorMessage;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isRequesting = false;
        });
      }
    }
  }

  Future<void> _handleVerifyOtp(WidgetRef ref) async {
    if (_normalizedPhone.isEmpty) {
      setState(() {
        _verifyMessage =
            'ابتدا شماره موبایل را وارد و کد را دریافت کنید.';
      });
      return;
    }

    final code = _codeController.text.trim();
    if (code.length != 4) {
      setState(() {
        _verifyMessage = 'کد تایید باید چهار رقم باشد.';
      });
      return;
    }

    setState(() {
      _isVerifying = true;
      _verifyMessage = null;
    });

           final apiClient = ref.read(apiClientProvider);
           final repo = AuthRepository(apiClient);
           final authNotifier = ref.read(authProvider.notifier);

           try {
             // حالت تست: اگر offline mode فعال باشد و کد 0000 بود، مستقیماً mock login
             if (AppConfig.enableOfflineMode && code == '0000') {
               // مستقیماً mock login بدون چک کردن backend
               await _mockLogin(authNotifier, _normalizedPhone);
             } else {
               // حالت عادی: استفاده از backend
               final (user, tokens) =
                   await repo.verifyOtp(mobile: _normalizedPhone, code: code);

               await authNotifier.login(user, tokens);
             }

             if (mounted) {
               setState(() {
                 _verifyMessage = 'ورود موفق بود. در حال انتقال...';
               });
             }

             if (!mounted) return;
             await Future<void>.delayed(const Duration(milliseconds: 600));
             if (!mounted) return;
             Navigator.of(context).pushReplacement(
               MaterialPageRoute<void>(
                 builder: (_) => const DashboardPlaceholderPage(),
               ),
             );
    } catch (error) {
      if (mounted) {
        String errorMessage = 'ورود ناموفق بود.';
        if (error is ApiException) {
          errorMessage = error.message;
        }
        setState(() {
          _verifyMessage = errorMessage;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isVerifying = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, _) {
        return Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
              colors: [
                Color(0xFF020617),
                Color(0xFF0F172A),
              ],
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 16),
                Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 540),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'ورود با شماره موبایل',
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(color: Colors.white),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'شماره موبایل خود را وارد کنید تا کد تایید برایتان ارسال شود، سپس با همان کد وارد داشبورد شوید.',
                          textAlign: TextAlign.center,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.white70,
                                  ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _Chip('حالت تست: کد ثابت 0000'),
                            _Chip('اعتبار کد: ۵ دقیقه'),
                            _Chip('محدودیت تلاش: ۵ بار'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final isWide = constraints.maxWidth >= 800;
                    final step1 = ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 420),
                      child: _StepCard(
                        label: 'گام ۱ — درخواست کد',
                        labelColor: AppColors.primary,
                        child: _RequestOtpCard(
                          phoneController: _phoneController,
                          isLoading: _isRequesting,
                          message: _requestMessage,
                          onSubmit: () => _handleRequestOtp(ref),
                        ),
                      ),
                    );
                    final step2 = ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 420),
                      child: _StepCard(
                        label: 'گام ۲ — ورود کد',
                        labelColor: AppColors.accent,
                        child: _VerifyOtpCard(
                          phone: _normalizedPhone,
                          codeController: _codeController,
                          isLoading: _isVerifying,
                          message: _verifyMessage,
                          onSubmit: () => _handleVerifyOtp(ref),
                          onResend: () => _handleRequestOtp(ref),
                        ),
                      ),
                    );

                    if (isWide) {
                      return Center(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            step1,
                            const SizedBox(width: 24),
                            step2,
                          ],
                        ),
                      );
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        step1,
                        const SizedBox(height: 32),
                        step2,
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white24),
      ),
      child: Text(
        text,
        style: Theme.of(context)
            .textTheme
            .bodySmall
            ?.copyWith(color: Colors.white70),
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  const _StepCard({
    required this.label,
    required this.labelColor,
    required this.child,
  });

  final String label;
  final Color labelColor;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Positioned(
          top: -18,
          left: 24,
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: labelColor,
              borderRadius: BorderRadius.circular(999),
              boxShadow: [
                BoxShadow(
                  color: labelColor.withValues(alpha: 0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .labelSmall
                  ?.copyWith(color: Colors.white),
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.only(top: 8),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border, width: 2),
            boxShadow: const [
              BoxShadow(
                color: Color(0xFFE2E8F0),
                blurRadius: 16,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: child,
        ),
      ],
    );
  }
}

class _RequestOtpCard extends StatelessWidget {
  const _RequestOtpCard({
    required this.phoneController,
    required this.isLoading,
    required this.message,
    required this.onSubmit,
  });

  final TextEditingController phoneController;
  final bool isLoading;
  final String? message;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'کد تایید را دریافت کنید',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 6),
        Text(
          'شماره موبایل کاری خود را وارد کنید تا کد تایید برایتان ارسال شود.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12),
        if (message != null) ...[
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.2),
              ),
              color: AppColors.primary.withValues(alpha: 0.04),
            ),
            child: Text(
              message!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.primaryDark,
                  ),
            ),
          ),
          const SizedBox(height: 12),
        ],
        Directionality(
          textDirection: TextDirection.ltr,
          child: TextField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            textAlign: TextAlign.left,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(11),
              _IranianPhoneFormatter(),
            ],
            decoration: const InputDecoration(
              labelText: 'شماره موبایل',
              hintText: '09123456789',
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Checkbox(
              value: true,
              onChanged: (_) {},
            ),
            Expanded(
              child: Text(
                'مرا به سیستم بازاریاب‌ها اضافه کن',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        AppButton(
          onPressed: isLoading ? null : onSubmit,
          isLoading: isLoading,
          loadingText: 'در حال پردازش...',
          fullWidth: true,
          child: const Text('دریافت کد تایید'),
        ),
        const SizedBox(height: 8),
        Text(
          'با ورود به سیستم، شرایط و قوانین تعمیربان را می‌پذیرم. کد ارسال‌شده تنها ۵ دقیقه اعتبار دارد.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class _VerifyOtpCard extends StatelessWidget {
  const _VerifyOtpCard({
    required this.phone,
    required this.codeController,
    required this.isLoading,
    required this.message,
    required this.onSubmit,
    required this.onResend,
  });

  final String phone;
  final TextEditingController codeController;
  final bool isLoading;
  final String? message;
  final VoidCallback onSubmit;
  final VoidCallback onResend;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'کد ارسال‌شده را وارد کنید',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 6),
        Text(
          phone.isNotEmpty
              ? 'کد چهار رقمی ارسال‌شده به شماره $phone را وارد کنید.'
              : 'کد چهار رقمی ارسال‌شده را وارد کنید.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        if (AppConfig.enableOfflineMode) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.accent.withValues(alpha: 0.3),
              ),
              color: AppColors.accent.withValues(alpha: 0.1),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 16,
                  color: AppColors.accent,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'کد تست: 0000',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.accent,
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 12),
        if (message != null) ...[
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.warning.withValues(alpha: 0.2),
              ),
              color: AppColors.warning.withValues(alpha: 0.04),
            ),
            child: Text(
              message!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.warning,
                  ),
            ),
          ),
          const SizedBox(height: 12),
        ],
        Directionality(
          textDirection: TextDirection.ltr,
          child: TextField(
            controller: codeController,
            keyboardType: TextInputType.number,
            maxLength: 4,
            decoration: const InputDecoration(
              labelText: 'کد تایید',
              counterText: '',
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'کد تست فعلی: 0000',
                style: Theme.of(context).textTheme.bodySmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            AppButton(
              onPressed: isLoading ? null : onResend,
              variant: ButtonVariant.ghost,
              size: ButtonSize.sm,
              child: const Text('ارسال مجدد کد'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        AppButton(
          onPressed: isLoading ? null : onSubmit,
          isLoading: isLoading,
          loadingText: 'در حال پردازش...',
          fullWidth: true,
          child: const Text('ورود به داشبورد'),
        ),
        const SizedBox(height: 8),
        Text(
          'در صورت بروز مشکل با واحد پشتیبانی تماس بگیرید.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

/// Formatter برای شماره موبایل ایرانی (09123456789)
class _IranianPhoneFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // فقط اعداد
    final digitsOnly = newValue.text.replaceAll(RegExp(r'[^\d]'), '');
    
    // اگر خالی است، خالی برگردان
    if (digitsOnly.isEmpty) {
      return TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }
    
    // اگر با 0 شروع نشده باشد، 0 اضافه کن
    String formatted = digitsOnly;
    if (!digitsOnly.startsWith('0')) {
      formatted = '0$digitsOnly';
    }
    
    // جلوگیری از دو تا 0 در اول
    if (formatted.startsWith('00')) {
      formatted = '0${formatted.substring(2)}';
    }
    
    // حداکثر 11 رقم (09123456789)
    if (formatted.length > 11) {
      formatted = formatted.substring(0, 11);
    }
    
    // محاسبه موقعیت cursor
    final offset = formatted.length;
    
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: offset),
    );
  }
}


