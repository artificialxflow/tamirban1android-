import 'dart:async';

import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import 'models/auth_tokens.dart';
import 'models/user.dart';

class AuthRepository {
  AuthRepository(this._client);

  final ApiClient _client;

  Dio get _dio => _client.dio;

  /// POST /api/auth/otp/request
  Future<void> requestOtp({required String mobile}) async {
    await _dio.post<Map<String, dynamic>>(
      '/auth/otp/request',
      data: <String, dynamic>{
        'phone': mobile, // Backend expects 'phone' not 'mobile'
      },
    );
  }

  /// POST /api/auth/otp/verify
  /// Returns user + tokens based on backend response structure.
  Future<(User, AuthTokens)> verifyOtp({
    required String mobile,
    required String code,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/otp/verify',
      data: <String, dynamic>{
        'phone': mobile, // Backend expects 'phone' not 'mobile'
        'code': code,
      },
    );

    final body = response.data ?? <String, dynamic>{};
    final apiResponse =
        ApiResponse<Map<String, dynamic>>.fromJson(body, (json) {
      return json as Map<String, dynamic>;
    });

    if (!apiResponse.success || apiResponse.data == null) {
      final message = apiResponse.message ?? 'خطا در تایید کد ورود';
      throw AuthException(message);
    }

    final data = apiResponse.data!;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    final tokens =
        AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>? ?? {});
    return (user, tokens);
  }

  /// POST /api/auth/refresh
  Future<AuthTokens> refreshToken(String refreshToken) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: <String, dynamic>{
        'refreshToken': refreshToken,
      },
    );

    final body = response.data ?? <String, dynamic>{};
    final apiResponse = ApiResponse.fromJson(
      body,
      (json) => json as Map<String, dynamic>,
    );

    if (!apiResponse.success || apiResponse.data == null) {
      final message = apiResponse.message ?? 'خطا در به‌روزرسانی توکن';
      throw AuthException(message);
    }

    return AuthTokens.fromJson(apiResponse.data!);
  }

  /// POST /api/auth/logout
  Future<void> logout() async {
    await _dio.post<Map<String, dynamic>>('/auth/logout');
  }
}

class AuthException implements Exception {
  AuthException(this.message);

  final String message;

  @override
  String toString() => 'AuthException: $message';
}


