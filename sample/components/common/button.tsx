"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white shadow-sm hover:bg-primary-600 focus-visible:ring-primary-300",
  secondary: "border border-primary-200 text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-200",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-200",
  danger: "bg-rose-500 text-white shadow-sm hover:bg-rose-600 focus-visible:ring-rose-300",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 rounded-full",
  md: "text-sm px-4 py-2 rounded-xl",
  lg: "text-base px-5 py-3 rounded-2xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    isLoading = false,
    loadingText,
    disabled,
    fullWidth,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const showLeftIcon = leftIcon && !isLoading;
  const showRightIcon = rightIcon && !isLoading;

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden="true"
        />
      )}
      {showLeftIcon && <span className="flex h-4 w-4 items-center justify-center">{leftIcon}</span>}
      <span>{isLoading && loadingText ? loadingText : children}</span>
      {showRightIcon && <span className="flex h-4 w-4 items-center justify-center">{rightIcon}</span>}
    </button>
  );
});

