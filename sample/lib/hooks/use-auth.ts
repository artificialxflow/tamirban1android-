"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

const TOKEN_KEY = "auth_tokens";
const USER_KEY = "auth_user";

/**
 * Hook برای مدیریت احراز هویت در فرانت‌اند
 */
export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<{ _id: string; mobile: string; role: string } | null>(null);

  // بارگذاری وضعیت احراز هویت از localStorage
  useEffect(() => {
    const storedTokens = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedTokens && storedUser) {
      try {
        const parsedTokens = JSON.parse(storedTokens) as AuthTokens;
        const parsedUser = JSON.parse(storedUser);

        // بررسی انقضای token
        if (isTokenExpired(parsedTokens.accessToken)) {
          // تلاش برای تمدید با refresh token
          refreshToken(parsedTokens.refreshToken)
            .then((newTokens) => {
              setTokens(newTokens);
              setUser(parsedUser);
              setIsAuthenticated(true);
            })
            .catch(() => {
              // اگر تمدید ناموفق بود، خروج
              logout();
            });
        } else {
          setTokens(parsedTokens);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch {
        logout();
      }
    }

    setIsLoading(false);
  }, []);

  /**
   * بررسی انقضای token
   */
  function isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000; // تبدیل به میلی‌ثانیه
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  /**
   * تمدید token با refresh token
   */
  async function refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error("Invalid refresh response");
    }

    const newTokens: AuthTokens = {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      expiresIn: data.data.expiresIn,
      refreshExpiresIn: data.data.refreshExpiresIn,
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
    return newTokens;
  }

  /**
   * ورود کاربر
   */
  function login(tokensData: AuthTokens, userData: { _id: string; mobile: string; role: string }) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokensData));
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setTokens(tokensData);
    setUser(userData);
    setIsAuthenticated(true);
    router.push("/dashboard");
  }

  /**
   * خروج کاربر
   */
  async function logout() {
    // فراخوانی API logout (اختیاری)
    if (tokens?.refreshToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch {
        // خطا در logout API مهم نیست
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokens(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/auth");
  }

  /**
   * دریافت access token برای استفاده در API calls
   */
  function getAccessToken(): string | null {
    if (!tokens) {
      return null;
    }

    // بررسی انقضا و تمدید خودکار
    if (isTokenExpired(tokens.accessToken)) {
      if (tokens.refreshToken) {
        refreshToken(tokens.refreshToken)
          .then((newTokens) => {
            setTokens(newTokens);
            return newTokens.accessToken;
          })
          .catch(() => {
            logout();
            return null;
          });
      } else {
        logout();
        return null;
      }
    }

    return tokens.accessToken;
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getAccessToken,
  };
}

