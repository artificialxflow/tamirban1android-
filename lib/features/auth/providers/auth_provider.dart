import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../../core/di/providers.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../../../data/auth/auth_repository.dart';
import '../../../data/auth/models/auth_tokens.dart';
import '../../../data/auth/models/user.dart';

/// State class for authentication
class AuthState {
  const AuthState({
    this.user,
    this.isLoading = false,
    this.isAuthenticated = false,
  });

  final User? user;
  final bool isLoading;
  final bool isAuthenticated;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

/// Provider for authentication state management
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._tokenStorage, this._apiClient)
      : super(const AuthState(isLoading: true)) {
    _checkAuthStatus();
  }

  final TokenStorage _tokenStorage;
  final ApiClient _apiClient;

  /// Check if user is already authenticated on app start
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);

    final accessToken = await _tokenStorage.readAccessToken();
    if (accessToken != null && accessToken.isNotEmpty) {
      // Token exists, but we don't have user info yet
      // In a real app, you might want to fetch user info from /api/auth/me
      // For now, we'll just mark as authenticated if token exists
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
      );
    }
  }

  /// Login user and save tokens
  Future<void> login(User user, AuthTokens tokens) async {
    await _tokenStorage.saveTokens(tokens);
    state = state.copyWith(
      user: user,
      isAuthenticated: true,
      isLoading: false,
    );
  }

  /// Logout user and clear tokens
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      final refreshToken = await _tokenStorage.readRefreshToken();
      if (refreshToken != null) {
        final repo = AuthRepository(_apiClient);
        await repo.logout();
      }
    } catch (e) {
      // Ignore logout API errors, still clear local tokens
    }

    await _tokenStorage.clear();
    state = const AuthState(
      isLoading: false,
      isAuthenticated: false,
    );
  }

  /// Refresh access token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await _tokenStorage.readRefreshToken();
      if (refreshToken == null) {
        return false;
      }

      final repo = AuthRepository(_apiClient);
      final newTokens = await repo.refreshToken(refreshToken);
      await _tokenStorage.saveTokens(newTokens);
      return true;
    } catch (e) {
      // Refresh failed, logout user
      await logout();
      return false;
    }
  }
}

/// Provider for AuthNotifier
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  final apiClient = ref.watch(apiClientProvider);
  return AuthNotifier(tokenStorage, apiClient);
});

