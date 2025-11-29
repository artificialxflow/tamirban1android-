import 'package:go_router/go_router.dart';

/// Application routes configuration
/// Routes are now defined in app.dart to have access to Riverpod providers
class AppRouter {
  static const String login = '/auth';
  static const String dashboard = '/dashboard';
  static const String customers = '/customers';
  static const String visits = '/visits';
  static const String invoices = '/invoices';
  static const String marketers = '/marketers';
  static const String sms = '/sms';
  static const String reports = '/reports';
  static const String settings = '/settings';
}

