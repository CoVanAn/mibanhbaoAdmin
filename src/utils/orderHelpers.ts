import { OrderStatus } from "../schema/order.schema";
import { formatCurrency, formatDate as formatDateHelper } from "./helpers";

/**
 * Status configuration with colors and labels
 */
export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "default",
    icon: "⏳",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "processing",
    icon: "✓",
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    color: "warning",
    icon: "👨‍🍳",
  },
  READY: {
    label: "Sẵn sàng",
    color: "cyan",
    icon: "📦",
  },
  OUT_FOR_DELIVERY: {
    label: "Đang giao hàng",
    color: "geekblue",
    icon: "🚚",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "success",
    icon: "✅",
  },
  CANCELED: {
    label: "Đã hủy",
    color: "error",
    icon: "❌",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "purple",
    icon: "💰",
  },
} as const;

/**
 * Payment status configuration
 */
export const PAYMENT_STATUS_CONFIG = {
  UNPAID: { label: "Chưa thanh toán", color: "default" },
  AUTHORIZED: { label: "Đã ủy quyền", color: "processing" },
  PAID: { label: "Đã thanh toán", color: "success" },
  FAILED: { label: "Thất bại", color: "error" },
  REFUNDED: { label: "Đã hoàn tiền", color: "purple" },
} as const;

/**
 * Fulfillment method configuration
 */
export const FULFILLMENT_METHOD_CONFIG = {
  DELIVERY: { label: "Giao hàng", color: "blue", icon: "🚚" },
  PICKUP: { label: "Tự đến lấy", color: "green", icon: "🏪" },
} as const;

/**
 * Get status label
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_CONFIG[status]?.label || status;
}

/**
 * Get status color for Tag component
 */
export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_CONFIG[status]?.color || "default";
}

/**
 * Status transition rules - what statuses can transition to what
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PREPARING", "CANCELED"],
  PREPARING: ["READY", "CANCELED"],
  READY: ["OUT_FOR_DELIVERY", "COMPLETED", "CANCELED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELED"],
  COMPLETED: ["REFUNDED"],
  CANCELED: [],
  REFUNDED: [],
};

/**
 * Check if a status transition is valid
 */
export function canTransitionStatus(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

/**
 * Get available next statuses for current status
 */
export function getAvailableStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if order can be canceled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(status);
}

/**
 * Check if order can be refunded
 */
export function canRefundOrder(status: OrderStatus): boolean {
  return status === "COMPLETED";
}

/**
 * Format currency VND - reuse from helpers
 */
export const formatCurrencyVND = formatCurrency;

/**
 * Format date time for orders
 */
export function formatDateTime(dateString: string): string {
  return formatDateHelper(dateString, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date only for orders
 */
export function formatOrderDate(dateString: string): string {
  return formatDateHelper(dateString, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Get customer display name from order
 */
export function getCustomerName(order: any): string {
  if (order.user?.name) return order.user.name;
  if (order.address?.recipientName) return order.address.recipientName;
  return "Khách hàng";
}

/**
 * Get customer phone from order
 */
export function getCustomerPhone(order: any): string {
  if (order.user?.phone) return order.user.phone;
  if (order.address?.phone) return order.address.phone;
  return "N/A";
}

/**
 * Get full address string
 */
export function getFullAddress(address: any): string {
  if (!address) return "N/A";
  const parts = [
    address.street,
    address.ward,
    address.district,
    address.province,
  ].filter(Boolean);
  return parts.join(", ");
}
