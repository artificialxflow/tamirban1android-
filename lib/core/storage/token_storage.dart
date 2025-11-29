import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'token_storage_stub.dart'
    if (dart.library.html) 'token_storage_web.dart';
import '../../data/auth/models/auth_tokens.dart';

class TokenStorage {
  TokenStorage()
      : _storage = kIsWeb
            ? null
            : const FlutterSecureStorage(
                aOptions:
                    AndroidOptions(encryptedSharedPreferences: true),
                iOptions: IOSOptions(
                  accessibility: KeychainAccessibility.unlocked,
                ),
              );

  final FlutterSecureStorage? _storage;

  static const _accessTokenKey = 'tamirban_access_token';
  static const _refreshTokenKey = 'tamirban_refresh_token';

  Future<void> saveTokens(AuthTokens tokens) async {
    if (kIsWeb) {
      await saveToStorage(_accessTokenKey, tokens.accessToken);
      await saveToStorage(_refreshTokenKey, tokens.refreshToken);
    } else {
      if (_storage == null) return;
      final storage = _storage;
      await storage.write(
        key: _accessTokenKey,
        value: tokens.accessToken,
      );
      await storage.write(
        key: _refreshTokenKey,
        value: tokens.refreshToken,
      );
    }
  }

  Future<String?> readAccessToken() async {
    if (kIsWeb) {
      return await readFromStorage(_accessTokenKey);
    }
    if (_storage == null) return null;
    final storage = _storage;
    return storage.read(key: _accessTokenKey);
  }

  Future<String?> readRefreshToken() async {
    if (kIsWeb) {
      return await readFromStorage(_refreshTokenKey);
    }
    if (_storage == null) return null;
    final storage = _storage;
    return storage.read(key: _refreshTokenKey);
  }

  Future<void> clear() async {
    if (kIsWeb) {
      await deleteFromStorage(_accessTokenKey);
      await deleteFromStorage(_refreshTokenKey);
    } else {
      if (_storage == null) return;
      final storage = _storage;
      await storage.delete(key: _accessTokenKey);
      await storage.delete(key: _refreshTokenKey);
    }
  }
}

