import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'app_router.dart';

/// مدیریت دکمه Back در اپلیکیشن
/// 
/// رفتار:
/// - اگر در صفحه Dashboard نیستیم، با back به Dashboard می‌رویم
/// - اگر در Dashboard هستیم، با اولین back یک پیام نمایش می‌دهد
/// - با دومین back در Dashboard، از برنامه خارج می‌شود
class BackButtonHandler extends StatefulWidget {
  const BackButtonHandler({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<BackButtonHandler> createState() => _BackButtonHandlerState();
}

class _BackButtonHandlerState extends State<BackButtonHandler> {
  DateTime? _lastBackPress;
  static const _backPressInterval = Duration(seconds: 2);

  Future<bool> _onWillPop() async {
    final router = GoRouter.of(context);
    final currentLocation = router.routerDelegate.currentConfiguration.uri.path;

    // اگر در Dashboard نیستیم، به Dashboard برو
    if (currentLocation != AppRouter.dashboard && currentLocation != AppRouter.login) {
      if (context.mounted) {
        router.go(AppRouter.dashboard);
      }
      return false; // جلوگیری از خروج
    }

    // اگر در Dashboard هستیم
    if (currentLocation == AppRouter.dashboard) {
      final now = DateTime.now();
      
      // اگر اولین بار است یا فاصله زمانی زیاد است
      if (_lastBackPress == null || 
          now.difference(_lastBackPress!) > _backPressInterval) {
        _lastBackPress = now;
        
        // نمایش پیام
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('برای خروج دوباره Back را بزنید'),
              duration: _backPressInterval,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
            ),
          );
        }
        
        return false; // جلوگیری از خروج
      }
      
      // اگر دوباره back زد، از برنامه خارج شو
      return true;
    }

    // برای صفحه Login، اجازه خروج بده
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) {
          final shouldPop = await _onWillPop();
          if (shouldPop && context.mounted) {
            // خروج از برنامه
            // در Android، این کار را با SystemNavigator انجام می‌دهیم
            // در iOS، این کار خودکار انجام می‌شود
            // ignore: deprecated_member_use
            SystemNavigator.pop();
          }
        }
      },
      child: widget.child,
    );
  }
}

