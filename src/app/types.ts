export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceProvider: number; // Precio proveedor
  priceClient: number; // Precio venta al cliente
  category: string; // Nombre de la categoría (para mostrar)
  categoryId: string; // 🔥 ID de la categoría (para enviar al backend)
  stock: number;
  minStock: number; // Stock mínimo para alerta
  unit: string; // Unidad de medida (ej: 'kg', 'pzs', 'lt')
  imageUrl?: string;
  imageFile?: File; // 🔥 Archivo de imagen para upload
  active: boolean; // Si el producto está disponible
  createdAt: Date;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  extras?: Array<{ id: string; name: string; price: number }>; // Extras con precio
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'billed' | 'paid' | 'completed' | 'cancelled';
  createdAt: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  paidAt?: Date;
  waiterName?: string;
  paymentMethod?: PaymentMethod;
  cancelReason?: string;
}

export interface Table {
  id: string; // UUID del backend
  number: number;
  status: 'free' | 'occupied' | 'billed'; // libre, ocupada, en cuenta
  capacity: number;
  currentOrder: string | null;
  orderId?: string;
  waiterName?: string;
  occupiedAt?: Date;
  waiterId?: string;
  currentOrderId?: string;
}

export interface CashRegister {
  id: string;
  date: Date;
  openingAmount: number;
  sales: number;
  cancellations: number;
  adjustments: number;
  closingAmount: number;
  cashierName: string;
  status: 'open' | 'closed';
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'order_ready' | 'system';
  title: string;
  message: string;
  productId?: string;
  read: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  productCount?: number;
  createdAt: Date;
}

export interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  applicationType: 'global' | 'category' | 'product'; // 🔥 Tipo de aplicación del extra
  active: boolean;
  createdAt: Date;
}

// 🔥 Relación entre extras y categorías
export interface CategoryExtra {
  id: string;
  category: string; // Nombre de la categoría
  extraId: string;
  createdAt: Date;
}

// 🔥 Relación entre extras y productos
export interface ProductExtra {
  id: string;
  productId: string;
  extraId: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'waiter' | 'cashier';
  active: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  details: string;
  previousValues?: any;
  newValues?: any;
  ipAddress?: string;
  timestamp: Date;
}

export type PaymentMethod = 'cash' | 'card';