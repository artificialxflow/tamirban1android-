import 'package:flutter/foundation.dart';

enum AppEnvironment {
  development,
  production,
}

class AppConfig {
  AppConfig._();

  /// Automatically use development for web (to avoid CORS issues),
  /// production for mobile platforms.
  /// 
  /// **Note:** If development server is not running, you can temporarily
  /// set `_forceProduction` to `true` to use production API, but CORS
  /// errors may occur unless backend allows your origin.
  /// 
  /// **Important:** 
  /// - Set to `false` for development (uses localhost:3124 - no CORS issues)
  /// - Set to `true` for production build (uses tamirban1.ir - may have CORS issues in web)
  static const bool _forceProduction = false; // Set to true only for production build

  static AppEnvironment get current {
    if (_forceProduction) {
      return AppEnvironment.production;
    }
    
    if (kIsWeb) {
      // Web platform: use development to avoid CORS issues with localhost
      // If dev server is not running, change _forceProduction to true above
      return AppEnvironment.development;
    }
    // Mobile platforms (Android/iOS): use production
    return AppEnvironment.production;
  }

  static String get apiBaseUrl {
    switch (current) {
      case AppEnvironment.development:
        // Next.js dev server (port 3124) – adjust if you use a different port.
        return 'http://localhost:3124/api';
      case AppEnvironment.production:
        // Deployed Next.js app for tamirban1.ir
        return 'https://tamirban1.ir/api';
    }
  }

  /// Enable offline/test mode ONLY for development when backend is not available
  /// 
  /// **Important:**
  /// - ✅ Active: Only in DEVELOPMENT + WEB (for local testing without backend)
  /// - ❌ Inactive: In PRODUCTION or MOBILE platforms (Android/iOS)
  /// 
  /// **When building for mobile:**
  /// - This will always be `false`
  /// - App will always connect to real API: `https://tamirban1.ir/api`
  /// - No mock data or test codes will work
  /// - Real authentication required
  static bool get enableOfflineMode {
    // Only enable in development AND web platform
    // In mobile (Android/iOS), this is always false - always uses production API
    return current == AppEnvironment.development && kIsWeb;
  }
}


