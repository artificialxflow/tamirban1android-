import 'dart:async';

import 'package:dio/dio.dart';

import '../config/app_environment.dart';

typedef TokenProvider = FutureOr<String?> Function();
typedef RefreshTokenProvider = FutureOr<String?> Function();
typedef TokenSaver = FutureOr<void> Function(String accessToken, String refreshToken);
typedef OnTokenRefreshFailed = FutureOr<void> Function();

/// Centralized Dio client configured for TamirBan backend.
class ApiClient {
  ApiClient._(
    this._dio, {
    this.tokenProvider,
    this.refreshTokenProvider,
    this.tokenSaver,
    this.onTokenRefreshFailed,
  });

  static ApiClient? _instance;

  final Dio _dio;
  final TokenProvider? tokenProvider;
  final RefreshTokenProvider? refreshTokenProvider;
  final TokenSaver? tokenSaver;
  final OnTokenRefreshFailed? onTokenRefreshFailed;

  bool _isRefreshing = false;
  final _refreshQueue = <Completer<void>>[];

  static ApiClient create({
    TokenProvider? tokenProvider,
    RefreshTokenProvider? refreshTokenProvider,
    TokenSaver? tokenSaver,
    OnTokenRefreshFailed? onTokenRefreshFailed,
  }) {
    final baseOptions = BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 20),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    final dio = Dio(baseOptions);

    final client = ApiClient._(
      dio,
      tokenProvider: tokenProvider,
      refreshTokenProvider: refreshTokenProvider,
      tokenSaver: tokenSaver,
      onTokenRefreshFailed: onTokenRefreshFailed,
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Attach Authorization header if token is available.
          if (client.tokenProvider != null) {
            try {
              final token = await client.tokenProvider!();
              if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
              }
            } catch (e) {
              // If token reading fails, continue without token (will get 401)
              // This should not happen, but handle gracefully
            }
          }

          // Simple request id for tracing (can be aligned with backend if needed).
          options.headers['X-Request-ID'] =
              DateTime.now().microsecondsSinceEpoch.toString();

          return handler.next(options);
        },
        onError: (error, handler) async {
          // Handle 401 Unauthorized - try to refresh token
          if (error.response?.statusCode == 401 &&
              client.refreshTokenProvider != null &&
              client.tokenSaver != null) {
            try {
              // Wait for ongoing refresh if any
              await client._waitForRefresh();

              // Try to refresh token
              final refreshToken = await client.refreshTokenProvider!();
              if (refreshToken != null && refreshToken.isNotEmpty) {
                final refreshed = await client._refreshToken(refreshToken);
                if (refreshed) {
                  // Retry the original request with new token
                  final opts = error.requestOptions;
                  final newToken = await client.tokenProvider!();
                  if (newToken != null) {
                    opts.headers['Authorization'] = 'Bearer $newToken';
                    final response = await client._dio.fetch(opts);
                    return handler.resolve(response);
                  }
                }
              }
            } catch (e) {
              // Refresh failed, notify and rethrow
              if (client.onTokenRefreshFailed != null) {
                await client.onTokenRefreshFailed!();
              }
            }
          }

          return handler.next(error);
        },
      ),
    );

    _instance = client;
    return _instance!;
  }

  /// Wait for ongoing refresh operation
  Future<void> _waitForRefresh() async {
    if (!_isRefreshing) return;

    final completer = Completer<void>();
    _refreshQueue.add(completer);
    return completer.future;
  }

  /// Refresh access token using refresh token
  Future<bool> _refreshToken(String refreshToken) async {
    if (_isRefreshing) {
      await _waitForRefresh();
      return true; // Another request already refreshed
    }

    _isRefreshing = true;

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = response.data;
      if (data != null &&
          data['success'] == true &&
          data['data'] != null) {
        final tokens = data['data'] as Map<String, dynamic>;
        final accessToken = tokens['accessToken'] as String;
        final newRefreshToken = tokens['refreshToken'] as String;

        if (tokenSaver != null) {
          await tokenSaver!(accessToken, newRefreshToken);
        }

        // Notify waiting requests
        for (final completer in _refreshQueue) {
          completer.complete();
        }
        _refreshQueue.clear();
        _isRefreshing = false;

        return true;
      }
    } catch (e) {
      // Refresh failed
      for (final completer in _refreshQueue) {
        completer.completeError(e);
      }
      _refreshQueue.clear();
      _isRefreshing = false;
      return false;
    }

    _isRefreshing = false;
    return false;
  }

  static ApiClient get instance {
    final client = _instance;
    if (client == null) {
      throw StateError(
        'ApiClient is not initialized. Call ApiClient.create() in app startup.',
      );
    }
    return client;
  }

  Dio get dio => _dio;
}


