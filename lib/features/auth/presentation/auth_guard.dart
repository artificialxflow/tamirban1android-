import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/navigation/app_router.dart';
import '../providers/auth_provider.dart';

/// Widget that guards routes requiring authentication
class AuthGuard extends ConsumerWidget {
  const AuthGuard({
    super.key,
    required this.child,
    this.requireAuth = true,
  });

  final Widget child;
  final bool requireAuth;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // Show loading while checking auth status
    if (authState.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // If authentication is required but user is not authenticated, redirect to login
    if (requireAuth && !authState.isAuthenticated) {
      // Use GoRouter for navigation in Flutter Web
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          context.go(AppRouter.login);
        }
      });
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // If user is authenticated but on login page, redirect to dashboard
    if (!requireAuth && authState.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          context.go(AppRouter.dashboard);
        }
      });
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return child;
  }
}

