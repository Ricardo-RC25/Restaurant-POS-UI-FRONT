/**
 * Application constants
 */

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
};

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: '💵',
  card: '💳',
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  BILLED: 'billed',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  billed: 'Facturado',
  paid: 'Pagado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  preparing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  ready: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  delivered: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  billed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  paid: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300',
  completed: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
};

// Table statuses
export const TABLE_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  BILLED: 'billed',
} as const;

export const TABLE_STATUS_LABELS: Record<string, string> = {
  free: 'Libre',
  occupied: 'Ocupada',
  billed: 'En Cuenta',
};

export const TABLE_STATUS_COLORS: Record<string, string> = {
  free: 'bg-green-500',
  occupied: 'bg-yellow-500',
  billed: 'bg-orange-500',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  WAITER: 'waiter',
  CASHIER: 'cashier',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  waiter: 'Mesero',
  cashier: 'Cajero',
};

// Notification types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  ORDER_READY: 'order_ready',
  SYSTEM: 'system',
} as const;

// LocalStorage keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'pos_current_user',
  MENU_ITEMS: 'pos_menu_items',
  CATEGORIES: 'pos_categories',
  ORDERS: 'pos_orders',
  TABLES: 'pos_tables',
  USERS: 'pos_users',
  NOTIFICATIONS: 'pos_notifications',
  AUDIT_LOGS: 'pos_audit_logs',
  CASH_REGISTERS: 'pos_cash_registers',
  EXTRAS: 'pos_extras',
  CATEGORY_EXTRAS: 'pos_category_extras',
  PRODUCT_EXTRAS: 'pos_product_extras',
  ACCESSIBILITY: 'pos_accessibility',
  INVOICE_BANNER: 'pos_invoice_banner',
} as const;

// Tax rate (16% IVA)
export const TAX_RATE = 0.16;

// Default pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
