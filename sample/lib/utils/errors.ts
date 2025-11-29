import { ZodError } from "zod";
import { NextResponse } from "next/server";

/**
 * کدهای خطای استاندارد API
 */
export enum ApiErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
}

/**
 * ساختار یکپارچه خطا
 */
export interface ApiError {
  success: false;
  message: string;
  code?: ApiErrorCode | string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * ساختار پاسخ موفق
 */
export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * نوع پاسخ API
 */
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/**
 * کلاس خطای سفارشی برای API
 */
export class ApiException extends Error {
  public statusCode: number;
  public code?: ApiErrorCode | string;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number = 400, code?: ApiErrorCode | string, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ApiException";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }

  toResponse(): NextResponse<ApiError> {
    return NextResponse.json(
      {
        success: false,
        message: this.message,
        code: this.code,
        errors: this.errors,
      },
      { status: this.statusCode },
    );
  }
}

/**
 * Error Handler مرکزی برای Route Handlers
 * این تابع خطاهای مختلف را به فرمت یکپارچه تبدیل می‌کند
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // خطای سفارشی ApiException
  if (error instanceof ApiException) {
    return error.toResponse();
  }

  // خطای Zod (Validation)
  if (error instanceof ZodError) {
    const errors = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return NextResponse.json(
      {
        success: false,
        message: "خطا در اعتبارسنجی داده‌های ورودی",
        code: ApiErrorCode.VALIDATION_ERROR,
        errors,
      },
      { status: 422 },
    );
  }

  // خطای Error معمولی
  if (error instanceof Error) {
    // لاگ خطا برای دیباگ (در production باید به logging service ارسال شود)
    console.error("[API Error]:", error.message, error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "خطای غیرمنتظره رخ داد",
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      },
      { status: 500 },
    );
  }

  // خطای ناشناخته
  console.error("[API Error]: Unknown error", error);

  return NextResponse.json(
    {
      success: false,
      message: "خطای غیرمنتظره رخ داد",
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
    },
    { status: 500 },
  );
}

/**
 * Helper برای ایجاد پاسخ موفق
 */
export function successResponse<T>(data?: T, message?: string, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status },
  );
}

/**
 * Helper برای ایجاد پاسخ خطا
 */
export function errorResponse(
  message: string,
  code?: ApiErrorCode | string,
  status = 400,
  errors?: Array<{ field: string; message: string }>,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      ...(errors && { errors }),
    },
    { status },
  );
}

