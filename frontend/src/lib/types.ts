// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'WAITER' | 'KITCHEN' | 'CASHIER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
  sortOrder: number;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  active: boolean;
  available: boolean;
  preparationTime?: number;
  sortOrder: number;
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  modifiers?: ProductModifier[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  sku?: string;
}

export interface ProductModifier {
  id: string;
  productId: string;
  name: string;
  price: number;
  required: boolean;
}

// Table types
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_REQUESTED' | 'CLEANING';

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  shape: string;
  active: boolean;
  orders?: Order[];
}

// Order types
export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'SERVED' | 'BILL_REQUESTED' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  tableId?: string;
  table?: Table;
  waiterId?: string;
  waiter?: User;
  items: OrderItem[];
  payments: Payment[];
  invoice?: Invoice;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: string;
}

// Payment types
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  createdAt: string;
}

// Invoice types
export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  customerName?: string;
  customerTaxId?: string;
  customerAddress?: string;
  notes?: string;
  createdAt: string;
}

// Inventory types
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  cost: number;
  location?: string;
  productId?: string;
  product?: Product;
  movements?: InventoryMovement[];
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  item?: InventoryItem;
  quantity: number;
  type: MovementType;
  reason?: string;
  reference?: string;
  createdAt: string;
}

// Service types (for service businesses)
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
  appointments?: Appointment[];
}

export interface Appointment {
  id: string;
  serviceId: string;
  service?: Service;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  dateTime: string;
  duration: number;
  status: string;
  notes?: string;
}

// Settings
export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}
