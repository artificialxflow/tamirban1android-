import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'app.dart';
import 'core/di/providers.dart';
import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'data/auth/models/auth_tokens.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  final tokenStorage = TokenStorage();
  final apiClient = ApiClient.create(
    tokenProvider: tokenStorage.readAccessToken,
    refreshTokenProvider: tokenStorage.readRefreshToken,
    tokenSaver: (accessToken, refreshToken) async {
      await tokenStorage.saveTokens(
        AuthTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
        ),
      );
    },
    onTokenRefreshFailed: () async {
      // Token refresh failed, clear tokens
      await tokenStorage.clear();
    },
  );

  runApp(
    ProviderScope(
      overrides: [
        tokenStorageProvider.overrideWithValue(tokenStorage),
        apiClientProvider.overrideWithValue(apiClient),
      ],
      child: const TamirbanApp(),
    ),
  );
}
