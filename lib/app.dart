import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'core/navigation/app_router.dart';
import 'core/navigation/back_button_handler.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_page.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/customers/presentation/pages/customers_list_page.dart';
import 'features/dashboard/presentation/pages/dashboard_page.dart';
import 'features/invoices/presentation/pages/invoice_detail_page.dart';
import 'features/invoices/presentation/pages/invoices_list_page.dart';
import 'features/marketers/presentation/pages/marketers_list_page.dart';
import 'features/reports/presentation/pages/reports_page.dart';
import 'features/settings/presentation/pages/settings_page.dart';
import 'features/sms/presentation/pages/sms_page.dart';
import 'features/visits/presentation/pages/visit_detail_page.dart';
import 'features/visits/presentation/pages/visits_list_page.dart';

class TamirbanApp extends ConsumerStatefulWidget {
  const TamirbanApp({super.key});

  @override
  ConsumerState<TamirbanApp> createState() => _TamirbanAppState();
}

class _TamirbanAppState extends ConsumerState<TamirbanApp> {
  late final GoRouter _router;
  final _authNotifier = ValueNotifier<AuthState?>(null);

  @override
  void initState() {
    super.initState();
    _router = _createRouter();
  }

  @override
  void dispose() {
    _authNotifier.dispose();
    super.dispose();
  }

  GoRouter _createRouter() {
    return GoRouter(
      initialLocation: AppRouter.login,
      refreshListenable: _authNotifier,
      redirect: (context, state) {
        final authState = _authNotifier.value;
        
        // Don't redirect while loading or if auth state is not available
        if (authState == null || authState.isLoading) {
          return null;
        }

        final isAuthenticated = authState.isAuthenticated;
        final isLoginPage = state.uri.path == AppRouter.login;

        // If user is authenticated and on login page, redirect to dashboard
        if (isAuthenticated && isLoginPage) {
          return AppRouter.dashboard;
        }

        // If user is not authenticated and trying to access protected route
        if (!isAuthenticated && !isLoginPage) {
          return AppRouter.login;
        }

        // Allow navigation
        return null;
      },
      routes: [
        GoRoute(
          path: AppRouter.login,
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: AppRouter.dashboard,
          builder: (context, state) => const DashboardPage(),
        ),
        // Customers page
        GoRoute(
          path: AppRouter.customers,
          builder: (context, state) => const CustomersListPage(),
        ),
        GoRoute(
          path: AppRouter.visits,
          builder: (context, state) => const VisitsListPage(),
        ),
        GoRoute(
          path: '/visits/:visitId',
          builder: (context, state) {
            final visitId = state.pathParameters['visitId'] ?? '';
            return VisitDetailPage(visitId: visitId);
          },
        ),
        GoRoute(
          path: AppRouter.invoices,
          builder: (context, state) => const InvoicesListPage(),
        ),
        GoRoute(
          path: '/invoices/:invoiceId',
          builder: (context, state) {
            final invoiceId = state.pathParameters['invoiceId'] ?? '';
            return InvoiceDetailPage(invoiceId: invoiceId);
          },
        ),
        GoRoute(
          path: AppRouter.marketers,
          builder: (context, state) => const MarketersListPage(),
        ),
        GoRoute(
          path: AppRouter.sms,
          builder: (context, state) => const SmsPage(),
        ),
        GoRoute(
          path: AppRouter.reports,
          builder: (context, state) => const ReportsPage(),
        ),
        GoRoute(
          path: AppRouter.settings,
          builder: (context, state) => const SettingsPage(),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // Watch auth state and update notifier
    final authState = ref.watch(authProvider);
    _authNotifier.value = authState;

    return MaterialApp.router(
      title: 'تعمیربان CRM',
      debugShowCheckedModeBanner: false,
      locale: const Locale('fa'),
      supportedLocales: const [
        Locale('fa'),
        Locale('en'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: AppTheme.light(),
      routerConfig: _router,
      builder: (context, child) {
        return BackButtonHandler(
          child: Directionality(
            textDirection: TextDirection.rtl,
            child: child ?? const SizedBox.shrink(),
          ),
        );
      },
    );
  }
}

/// Placeholder page for routes not yet implemented
class _PlaceholderPage extends StatelessWidget {
  const _PlaceholderPage({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.construction,
              size: 64,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'این صفحه در حال توسعه است',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

