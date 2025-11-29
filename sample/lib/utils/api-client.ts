"use client";

import { ApiResponse } from "./errors";

const TOKEN_KEY = "auth_tokens";

/**
 * دریافت access token از localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) {
    return null;
  }

  try {
    const tokens = JSON.parse(stored);
    return tokens.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * بررسی انقضای token
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

/**
 * تمدید token
 */
async function refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return null;
    }

    // ذخیره token‌های جدید
    localStorage.setItem(TOKEN_KEY, JSON.stringify({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      expiresIn: data.data.expiresIn,
      refreshExpiresIn: data.data.refreshExpiresIn,
    }));

    return {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  } catch {
    return null;
  }
}

/**
 * Client برای API calls با احراز هویت خودکار
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * درخواست GET
   */
  async get<T = unknown>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * درخواست POST
   */
  async post<T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  /**
   * درخواست PATCH
   */
  async patch<T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  /**
   * درخواست DELETE
   */
  async delete<T = unknown>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * درخواست اصلی با مدیریت احراز هویت
   */
  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    let token = getAccessToken();
    const stored = localStorage.getItem(TOKEN_KEY);
    
    console.log("[ApiClient] Request:", endpoint, { hasToken: !!token, hasStored: !!stored });

    // بررسی انقضای token و تمدید در صورت نیاز
    if (token && isTokenExpired(token) && stored) {
      try {
        const tokens = JSON.parse(stored);
        if (tokens.refreshToken) {
          const newTokens = await refreshToken(tokens.refreshToken);
          if (newTokens) {
            token = newTokens.accessToken;
          } else {
            // اگر تمدید ناموفق بود، به صفحه ورود هدایت شود
            if (typeof window !== "undefined") {
              window.location.href = "/auth";
            }
            throw new Error("Token refresh failed");
          }
        }
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
        throw new Error("Token refresh failed");
      }
    }

    // اضافه کردن token به headers
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // درخواست به API
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    
    console.log("[ApiClient] Response:", endpoint, { status: response.status, ok: response.ok });

    // بررسی خطای 401 (Unauthorized)
    if (response.status === 401) {
      console.error("[ApiClient] Unauthorized - redirecting to auth");
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("auth_user");
        window.location.href = "/auth";
      }
      throw new Error("Unauthorized");
    }

    // بررسی خطای HTTP دیگر
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[ApiClient] HTTP Error:", response.status, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[ApiClient] Response data:", endpoint, { success: data.success, hasData: !!data.data });
    return data as ApiResponse<T>;
  }
}

/**
 * Instance پیش‌فرض
 * همیشه از relative path استفاده می‌کند (/api)
 * endpoint ها باید بدون /api/ باشند (مثلاً /customers به جای /api/customers)
 */
export const apiClient = new ApiClient("/api");

