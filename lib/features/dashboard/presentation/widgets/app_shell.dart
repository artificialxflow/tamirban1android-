import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/navigation/app_router.dart';
import '../../../auth/providers/auth_provider.dart';

/// App Shell widget that provides consistent layout for authenticated pages
class AppShell extends ConsumerWidget {
  const AppShell({
    super.key,
    required this.title,
    required this.child,
    this.description,
    this.actions,
    this.showDrawer = true,
  });

  final String title;
  final String? description;
  final Widget child;
  final List<Widget>? actions;
  final bool showDrawer;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    final currentRoute = GoRouterState.of(context).uri.path;
    final isDashboard = currentRoute == AppRouter.dashboard;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(title),
        leading: isDashboard
            ? null // در Dashboard، drawer icon نمایش داده می‌شود
            : IconButton(
                icon: const Icon(Icons.home),
                tooltip: 'بازگشت به خانه',
                onPressed: () {
                  context.go(AppRouter.dashboard);
                },
              ),
        actions: [
          if (authState.user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Center(
                child: Text(
                  authState.user?.fullName ?? '',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
          if (actions != null) ...actions!,
        ],
      ),
      drawer: showDrawer ? _AppDrawer(user: authState.user) : null,
      body: SafeArea(
        child: Column(
          children: [
            if (description != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                color: AppColors.surface,
                child: Text(
                  description!,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}

/// Navigation drawer for the app
class _AppDrawer extends ConsumerWidget {
  const _AppDrawer({this.user});

  final dynamic user; // User from AuthState

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                  colors: [
                    AppColors.primary,
                    AppColors.primaryDark,
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TamirBan CRM',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 1,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'تعمیربان',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                        ),
                        child: const Text(
                          'v0.1',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Navigation items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _NavItem(
                    icon: Icons.dashboard,
                    title: 'داشبورد',
                    route: AppRouter.dashboard,
                  ),
                  _NavItem(
                    icon: Icons.people,
                    title: 'مشتریان',
                    route: AppRouter.customers,
                  ),
                  _NavItem(
                    icon: Icons.badge,
                    title: 'بازاریاب‌ها',
                    route: AppRouter.marketers,
                  ),
                  _NavItem(
                    icon: Icons.event,
                    title: 'ویزیت‌ها',
                    route: AppRouter.visits,
                  ),
                  _NavItem(
                    icon: Icons.receipt_long,
                    title: 'پیش‌فاکتورها',
                    route: AppRouter.invoices,
                  ),
                  const Divider(height: 32),
                  _NavItem(
                    icon: Icons.sms,
                    title: 'پیامک‌ها',
                    route: AppRouter.sms,
                  ),
                  _NavItem(
                    icon: Icons.bar_chart,
                    title: 'گزارش‌ها',
                    route: AppRouter.reports,
                  ),
                  const Divider(height: 32),
                  _NavItem(
                    icon: Icons.settings,
                    title: 'تنظیمات',
                    route: AppRouter.settings,
                  ),
                ],
              ),
            ),

            // User info and logout
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: AppColors.border),
                ),
              ),
              child: Column(
                children: [
                  if (authState.user != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Icon(
                              Icons.person,
                              color: AppColors.primary,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  authState.user?.fullName ?? '',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  authState.user?.mobile ?? '',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('خروج از حساب کاربری'),
                            content: const Text(
                              'آیا مطمئن هستید که می‌خواهید خارج شوید؟',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(false),
                                child: const Text('انصراف'),
                              ),
                              FilledButton(
                                onPressed: () => Navigator.of(context).pop(true),
                                child: const Text('خروج'),
                              ),
                            ],
                          ),
                        );

                        if (confirmed == true && context.mounted) {
                          await ref.read(authProvider.notifier).logout();
                          if (context.mounted) {
                            context.go(AppRouter.login);
                          }
                        }
                      },
                      icon: const Icon(Icons.logout),
                      label: const Text('خروج از حساب'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.danger,
                        side: const BorderSide(color: AppColors.danger),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Navigation item in drawer
class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.title,
    required this.route,
    this.disabled = false,
  });

  final IconData icon;
  final String title;
  final String route;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final isActive = location == route;

    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primary.withValues(alpha: 0.15)
              : AppColors.textSecondary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          color: disabled
              ? AppColors.textSecondary.withValues(alpha: 0.5)
              : isActive
                  ? AppColors.primary
                  : AppColors.textSecondary,
          size: 20,
        ),
      ),
      title: Text(
        title,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              color: disabled
                  ? AppColors.textSecondary.withValues(alpha: 0.5)
                  : isActive
                      ? AppColors.primary
                      : AppColors.textPrimary,
            ),
      ),
      trailing: disabled
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.textSecondary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'به زودی',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                    ),
              ),
            )
          : isActive
              ? Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: AppColors.primary,
                )
              : null,
      selected: isActive,
      selectedTileColor: AppColors.primary.withValues(alpha: 0.05),
      enabled: !disabled,
      onTap: disabled
          ? null
          : () {
              Navigator.of(context).pop(); // Close drawer
              context.go(route);
            },
    );
  }
}

