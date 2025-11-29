export type RoleKey = "SUPER_ADMIN" | "FINANCE_MANAGER" | "MARKETER" | "CUSTOMER";

export type OTPChannel = "SMS" | "WHATSAPP" | "VOICE_CALL";

export interface AuditTrail {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  telegramId?: string;
  whatsappNumber?: string;
  city?: string;
  address?: string;
}

export interface UserRole {
  key: RoleKey;
  label: string;
  permissions: string[];
}

export interface User extends AuditTrail {
  _id: string;
  fullName: string;
  mobile: string;
  email?: string;
  role: RoleKey;
  isActive: boolean;
  lastLoginAt?: Date;
  otpSecret?: string;
  otpExpiresAt?: Date;
}

export interface MarketerProfile extends AuditTrail {
  userId: string;
  region: string;
  assignedCustomers: string[];
  performanceScore?: number;
  lastVisitAt?: Date;
}

export const CUSTOMER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
  "AT_RISK",
  "LOYAL",
  "SUSPENDED",
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface Customer extends AuditTrail {
  _id: string;
  code: string;
  displayName: string;
  legalName?: string;
  contact: ContactInfo;
  assignedMarketerId?: string;
  assignedMarketerName?: string;
  status: CustomerStatus;
  tags: string[];
  lastVisitAt?: Date;
  revenueMonthly?: number;
  loyaltyScore?: number;
  grade?: "A" | "B" | "C" | "D";
  geoLocation?: GeoLocation;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface Product extends AuditTrail {
  _id: string;
  name: string;
  sku?: string;
  category?: string;
  unitPrice: number;
  currency: "IRR" | "USD";
  taxRate?: number;
  isActive: boolean;
  mediaUrls?: string[];
}

export type VisitStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Visit extends AuditTrail {
  _id: string;
  customerId: string;
  marketerId: string;
  scheduledAt: Date;
  completedAt?: Date;
  status: VisitStatus;
  topics: string[];
  notes?: string;
  locationSnapshot?: GeoLocation;
  followUpAction?: string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceLineItem {
  productId?: string;
  title: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  total: number;
}

export interface Invoice extends AuditTrail {
  _id: string;
  customerId: string;
  marketerId?: string;
  status: InvoiceStatus;
  issuedAt: Date;
  dueAt: Date;
  currency: "IRR" | "USD";
  items: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal?: number;
  grandTotal: number;
  paymentReference?: string;
  paidAt?: Date;
  meta?: Record<string, unknown>;
}

export type SMSStatus = "QUEUED" | "DELIVERED" | "FAILED";

export interface SMSLog extends AuditTrail {
  _id: string;
  phoneNumber: string;
  channel: OTPChannel;
  template: string;
  payload: Record<string, unknown>;
  status: SMSStatus;
  sentAt: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  requestId?: string;
}

export interface OTPAttempt extends AuditTrail {
  _id?: string;
  phoneNumber: string;
  hashedCode: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export type OtpAttempt = {
  id: string;
  phone: string;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
  attempts: number;
};

export type AuthTokenPayload = {
  sub: string;
  phone: string;
  type: "access";
};

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

