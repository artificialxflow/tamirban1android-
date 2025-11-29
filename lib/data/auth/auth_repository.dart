import 'dart:async';

import 'package:dio/dio.dart';

import '../../core/errors/api_error.dart';
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
    try {
      await _dio.post<Map<String, dynamic>>(
        '/auth/otp/request',
        data: <String, dynamic>{
          'phone': mobile, // Backend expects 'phone' not 'mobile'
        },
      );
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/auth/otp/verify
  /// Returns user + tokens based on backend response structure.
  Future<(User, AuthTokens)> verifyOtp({
    required String mobile,
    required String code,
  }) async {
    try {
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
        final code = ApiErrorCode.fromString(apiResponse.code);
        throw ApiException(
          message,
          statusCode: response.statusCode ?? 400,
          code: code ?? ApiErrorCode.validationError,
        );
      }

      final data = apiResponse.data!;
      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      final tokens =
          AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>? ?? {});
      return (user, tokens);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/auth/refresh
  Future<AuthTokens> refreshToken(String refreshToken) async {
    try {
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
        final code = ApiErrorCode.fromString(apiResponse.code);
        throw ApiException(
          message,
          statusCode: response.statusCode ?? 401,
          code: code ?? ApiErrorCode.unauthorized,
        );
      }

      return AuthTokens.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/auth/logout
  Future<void> logout() async {
    try {
      await _dio.post<Map<String, dynamic>>('/auth/logout');
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }
}

