import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MenuItem, Order, Table, User, Notification, Category, AuditLog, CashRegister, Extra } from '../types';
import { toast } from 'sonner';
import { initialUsers } from '../data/initialUsers';
import { tablesService } from '../services/tablesService';

export interface AccessibilitySettings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  increasedLineSpacing: boolean;
}

export interface InvoiceBannerProduct {
  id: string;
  name: string;
  price: string;
  imageUrl?: string;
}

export interface InvoiceBannerSettings {
  systemName: string;
  slogan: string;
  message: string;
  products: InvoiceBannerProduct[];
  backgroundColor: string;
  textColor: string;
}

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  darkMode: false,
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  increasedLineSpacing: false,
};

const DEFAULT_INVOICE_BANNER: InvoiceBannerSettings = {
  systemName: 'La Taquería',
  slogan: 'La Mejor Taquería de la Ciudad',
  message: 'Disfruta nuestros auténticos tacos al pastor, carnitas, y mucho más. ¡Y no olvides facturar tu compra!',
  products: [
    { id: '1', name: 'Tacos al Pastor', price: '5 piezas $125' },
    { id: '2', name: 'Quesadillas', price: 'De queso $60' },
    { id: '3', name: 'Tacos de Carnitas', price: '5 piezas $130' },
    { id: '4', name: 'Aguas Frescas', price: '1 litro $45' },
  ],
  backgroundColor: '#d93025',
  textColor: '#ffffff',
};

interface AppContextType {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  orders: Order[];
  tables: Table[];
  users: User[]
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  notifications: Notification[];
  auditLogs: AuditLog[];
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  invoiceBanner: InvoiceBannerSettings;
  updateInvoiceBanner: (settings: Partial<InvoiceBannerSettings>) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateTable: (tableNumber: number, updates: Partial<Table>) => void;
  addTable: (table: Omit<Table, 'id'>) => Promise<void>;
  deleteTable: (tableNumber: number) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  updateInventory: (itemId: string, quantity: number) => void;
  cashRegisters: CashRegister[];
  addCashRegister: (cashRegister: Omit<CashRegister, 'id'>) => void;
  getSalesByPeriod: (period: 'day' | 'week' | 'month') => { total: number; count: number; byCash: number; byCard: number; byMobile: number };
  extras: Extra[];
  categoryExtras: Map<string, string[]>;
  productExtras: Map<string, string[]>;
  addExtra: (extra: Extra) => void;
  updateExtra: (id: string, updates: Partial<Extra>) => void;
  deleteExtra: (id: string) => void;
  getAvailableExtrasForProduct: (productId: string) => Extra[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// FUNCIONES DE CARGA DESDE LOCALSTORAGE
// ============================================================================

const loadCurrentUser = (): User | null => {
  const stored = localStorage.getItem('pos_current_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      };
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }
  return null;
};

const loadMenuItems = (): MenuItem[] => {
  const stored = localStorage.getItem('pos_menu_items');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error loading menu items:', error);
      return [];
    }
  }
  return [];
};

const loadCategories = (): Category[] => {
  const stored = localStorage.getItem('pos_categories');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((cat: any) => ({
        ...cat,
        createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }
  return [];
};

const loadOrders = (): Order[] => {
  const stored = localStorage.getItem('pos_orders');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        paidAt: order.paidAt ? new Date(order.paidAt) : undefined,
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }
  return [];
};

const loadTables = (): Table[] => {
  const stored = localStorage.getItem('pos_tables');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((table: any) => ({
        ...table,
        // Generar ID temporal para datos legacy que no tienen id
        id: table.id || `local-${table.number}-${Date.now()}`,
        occupiedAt: table.occupiedAt ? new Date(table.occupiedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading tables:', error);
      return [];
    }
  }
  return [];
};

const loadUsers = (): User[] => {
  const stored = localStorage.getItem('pos_users');

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const usersData = parsed.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      }));
      return usersData;
    } catch (error) {
      console.error('Error loading users:', error);
      localStorage.setItem('pos_users', JSON.stringify(initialUsers));
      return initialUsers;
    }
  }

  // Si no hay usuarios en localStorage, cargar los usuarios iniciales
  localStorage.setItem('pos_users', JSON.stringify(initialUsers));
  return initialUsers;
};

const loadNotifications = (): Notification[] => {
  const stored = localStorage.getItem('pos_notifications');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((notif: any) => ({
        ...notif,
        timestamp: notif.timestamp ? new Date(notif.timestamp) : new Date(),
      }));
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }
  return [];
};

const loadAuditLogs = (): AuditLog[] => {
  const stored = localStorage.getItem('pos_audit_logs');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
      return [];
    }
  }
  return [];
};

const loadCashRegisters = (): CashRegister[] => {
  const stored = localStorage.getItem('pos_cash_registers');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((reg: any) => ({
        ...reg,
        date: new Date(reg.date),
      }));
    } catch (error) {
      console.error('Error loading cash registers:', error);
      return [];
    }
  }
  return [];
};

const loadAccessibilitySettings = (currentUser: User | null): AccessibilitySettings => {
  if (!currentUser) return DEFAULT_ACCESSIBILITY;

  const storageKey = `accessibility_${currentUser.id}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      return { ...DEFAULT_ACCESSIBILITY, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_ACCESSIBILITY;
    }
  }
  return DEFAULT_ACCESSIBILITY;
};

const loadInvoiceBannerSettings = (): InvoiceBannerSettings => {
  const stored = localStorage.getItem('invoice_banner_settings');
  if (stored) {
    try {
      return { ...DEFAULT_INVOICE_BANNER, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_INVOICE_BANNER;
    }
  }
  return DEFAULT_INVOICE_BANNER;
};

const loadExtras = (): Extra[] => {
  const stored = localStorage.getItem('pos_extras');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((extra: any) => ({
        ...extra,
        createdAt: extra.createdAt ? new Date(extra.createdAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error loading extras:', error);
      return [];
    }
  }
  return [];
};

const loadCategoryExtras = (): Map<string, string[]> => {
  const stored = localStorage.getItem('pos_category_extras');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Error loading category extras:', error);
      return new Map();
    }
  }
  return new Map();
};

const loadProductExtras = (): Map<string, string[]> => {
  const stored = localStorage.getItem('pos_product_extras');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Error loading product extras:', error);
      return new Map();
    }
  }
  return new Map();
};

// ============================================================================
// COMPONENTE PROVIDER
// ============================================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(loadMenuItems);
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [tables, setTables] = useState<Table[]>(loadTables);
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUser);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(loadAuditLogs);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(loadCashRegisters);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY);
  const [invoiceBanner, setInvoiceBanner] = useState<InvoiceBannerSettings>(loadInvoiceBannerSettings());
  const [extras, setExtras] = useState<Extra[]>(loadExtras);
  const [categoryExtras, setCategoryExtras] = useState<Map<string, string[]>>(loadCategoryExtras);
  const [productExtras, setProductExtras] = useState<Map<string, string[]>>(loadProductExtras);

  // Load accessibility settings when user changes
  useEffect(() => {
    const settings = loadAccessibilitySettings(currentUser);
    setAccessibility(settings);
    applyAccessibilitySettings(settings);
  }, [currentUser]);

  // Persistir menuItems
  useEffect(() => {
    localStorage.setItem('pos_menu_items', JSON.stringify(menuItems));
    window.dispatchEvent(new Event('menuItemsUpdated'));
  }, [menuItems]);

  // Actualizar productCount en categorías cuando cambian los menuItems
  useEffect(() => {
    const updatedCategories = categories.map(category => {
      const count = menuItems.filter(item => item.categoryId === category.id).length;
      return { ...category, productCount: count };
    });

    // Solo actualizar si hay cambios en los conteos
    const hasChanges = updatedCategories.some((cat, idx) =>
      cat.productCount !== categories[idx]?.productCount
    );

    if (hasChanges) {
      setCategories(updatedCategories);
    }
  }, [menuItems]);

  // Persistir categorías
  useEffect(() => {
    localStorage.setItem('pos_categories', JSON.stringify(categories));
    window.dispatchEvent(new Event('categoriesUpdated'));
  }, [categories]);

  // Persistir órdenes
  useEffect(() => {
    localStorage.setItem('pos_orders', JSON.stringify(orders));
  }, [orders]);

  // Persistir mesas
  useEffect(() => {
    localStorage.setItem('pos_tables', JSON.stringify(tables));
  }, [tables]);

  // Persistir usuarios
  useEffect(() => {
    localStorage.setItem('pos_users', JSON.stringify(users));
  }, [users]);

  // Persistir usuario actual
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pos_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pos_current_user');
    }
  }, [currentUser]);

  // Persistir notificaciones
  useEffect(() => {
    localStorage.setItem('pos_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Persistir audit logs
  useEffect(() => {
    localStorage.setItem('pos_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Persistir cortes de caja
  useEffect(() => {
    localStorage.setItem('pos_cash_registers', JSON.stringify(cashRegisters));
  }, [cashRegisters]);

  // Persistir extras
  useEffect(() => {
    localStorage.setItem('pos_extras', JSON.stringify(extras));
  }, [extras]);

  // Persistir category extras
  useEffect(() => {
    const obj = Object.fromEntries(categoryExtras);
    localStorage.setItem('pos_category_extras', JSON.stringify(obj));
  }, [categoryExtras]);

  // Persistir product extras
  useEffect(() => {
    const obj = Object.fromEntries(productExtras);
    localStorage.setItem('pos_product_extras', JSON.stringify(obj));
  }, [productExtras]);

  // Verificar stock bajo
  useEffect(() => {
    checkLowStock();
  }, [menuItems]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setNotifications([newNotification, ...notifications]);
  };

  const checkLowStock = () => {
    const lowStockItems = menuItems.filter(
      item => item.stock <= item.minStock && item.stock > 0 && item.active
    );

    lowStockItems.forEach(item => {
      const existingNotification = notifications.find(
        n => n.type === 'warning' && n.message.includes(item.name) && !n.read
      );

      if (!existingNotification) {
        addNotification({
          type: 'warning',
          message: `Stock bajo: ${item.name} (${item.stock} ${item.unit})`,
          read: false,
        });
      }
    });
  };

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.setProperty('--font-size', fontSizes[settings.fontSize]);

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.increasedLineSpacing) {
      root.classList.add('increased-spacing');
    } else {
      root.classList.remove('increased-spacing');
    }
  };

  const updateAccessibility = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...accessibility, ...updates };
    setAccessibility(newSettings);
    applyAccessibilitySettings(newSettings);

    if (currentUser) {
      const storageKey = `accessibility_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
      toast.success('Configuración guardada');
    }
  };

  const updateInvoiceBanner = (updates: Partial<InvoiceBannerSettings>) => {
    const newSettings = { ...invoiceBanner, ...updates };
    setInvoiceBanner(newSettings);
    localStorage.setItem('invoice_banner_settings', JSON.stringify(newSettings));
    toast.success('Configuración del banner guardada');
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems([...menuItems, item]);
    toast.success(`Producto ${item.name} agregado`);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'create',
        module: 'inventory',
        entityType: 'product',
        entityId: item.id,
        details: `Categoría: ${item.category}, Precio: $${item.priceClient}`,
      });
    }
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    const item = menuItems.find(i => i.id === id);
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
    toast.success('Producto actualizado');

    if (currentUser && item) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'update',
        module: 'inventory',
        entityType: 'product',
        entityId: id,
        details: Object.keys(updates).join(', '),
      });
    }
  };

  const deleteMenuItem = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast.success('Producto eliminado');

    if (currentUser && item) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'delete',
        module: 'inventory',
        entityType: 'product',
        entityId: id,
        details: `Producto: ${item.name}`,
      });
    }
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'create',
        module: 'orders',
        entityType: 'order',
        entityId: order.id,
        details: `Mesa: ${order.tableNumber}, Total: $${order.total}`,
      });
    }
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const order = orders.find(o => o.id === id);
    setOrders(orders.map(order =>
      order.id === id ? { ...order, ...updates } : order
    ));

    if (currentUser && order && updates.status === 'paid') {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'payment',
        module: 'orders',
        entityType: 'order',
        entityId: id,
        details: `Total: $${order.total}, Método: ${updates.paymentMethod || order.paymentMethod}`,
      });
    }
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const updateTable = (tableNumber: number, updates: Partial<Table>) => {
    setTables(tables.map(table =>
      table.number === tableNumber ? { ...table, ...updates } : table
    ));
  };

  const addTable = async (table: Omit<Table, 'id'>) => {
    try {
      console.log('🏗️ [addTable] Creando mesa en API:', table);

      // Llamar a la API para crear la mesa
      const response = await tablesService.createTable({
        number: table.number,
        status: table.status,
      });

      // Crear el objeto de mesa con el ID del backend
      const newTable: Table = {
        ...table,
        id: response.tableId,
      };

      // Actualizar el estado local
      setTables([...tables, newTable]);
      toast.success(`Mesa ${table.number} creada`);

      if (currentUser) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'create',
          module: 'tables',
          entityType: 'table',
          entityId: newTable.id,
          details: `Mesa ${table.number} - Capacidad: ${table.capacity}`,
        });
      }

      console.log('✅ [addTable] Mesa creada exitosamente:', newTable);
    } catch (error) {
      console.error('❌ [addTable] Error al crear mesa:', error);
      toast.error('Error al crear la mesa. Intenta nuevamente.');
      throw error;
    }
  };

  const deleteTable = (tableNumber: number) => {
    const table = tables.find(t => t.number === tableNumber);
    setTables(tables.filter(table => table.number !== tableNumber));
    toast.success(`Mesa ${tableNumber} eliminada`);

    if (currentUser && table) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'delete',
        module: 'tables',
        entityType: 'table',
        entityId: table.id,
        details: `Mesa ${tableNumber}`,
      });
    }
  };

  const login = (username: string, password: string) => {
    const user = users.find(
      u => u.username === username && u.password === password && u.active
    );

    if (user) {
      setCurrentUser(user);
      toast.success(`Bienvenido ${user.name}`);

      addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'login',
        module: 'auth',
        entityType: 'session',
        entityId: user.id,
        details: `Rol: ${user.role}`,
      });

      return true;
    }

    toast.error('Credenciales incorrectas');
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'logout',
        module: 'auth',
        entityType: 'session',
        entityId: currentUser.id,
        details: `Usuario cerró sesión`,
      });
    }
    setCurrentUser(null);
    toast.success('Sesión cerrada');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers([...users, newUser]);
    toast.success(`Usuario ${newUser.name} agregado`);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'create',
        module: 'users',
        entityType: 'user',
        entityId: newUser.id,
        details: `Rol: ${newUser.role}, Email: ${newUser.email}`,
      });
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const user = users.find(u => u.id === id);
    setUsers(users.map(user =>
      user.id === id ? { ...user, ...updates } : user
    ));
    toast.success('Usuario actualizado');

    if (currentUser && user) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'update',
        module: 'users',
        entityType: 'user',
        entityId: id,
        details: `Usuario: ${user.name}, Campos: ${Object.keys(updates).join(', ')}`,
      });
    }
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(user => user.id !== id));
    toast.success('Usuario eliminado');

    if (currentUser && user) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'delete',
        module: 'users',
        entityType: 'user',
        entityId: id,
        details: `Usuario eliminado: ${user.name}`,
      });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAllNotifications = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const updateInventory = (itemId: string, quantity: number) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + quantity);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
    toast.success(`Categoría ${category.name} agregada`);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'create',
        module: 'inventory',
        entityType: 'category',
        entityId: category.id,
        details: `Categoría: ${category.name}`,
      });
    }
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const category = categories.find(c => c.id === id);
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    toast.success('Categoría actualizada');

    if (currentUser && category) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'update',
        module: 'inventory',
        entityType: 'category',
        entityId: id,
        details: `Categoría: ${category.name}, Campos: ${Object.keys(updates).join(', ')}`,
      });
    }
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    setCategories(categories.filter(cat => cat.id !== id));
    toast.success('Categoría eliminada');

    if (currentUser && category) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'delete',
        module: 'inventory',
        entityType: 'category',
        entityId: id,
        details: `Categoría eliminada: ${category.name}`,
      });
    }
  };

  const addAuditLog = (log: {
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    module: string;
    entityType?: string;
    entityId?: string;
    details: string;
  }) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      ...log,
      timestamp: new Date(),
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const addCashRegister = (cashRegister: Omit<CashRegister, 'id'>) => {
    const newCashRegister: CashRegister = {
      ...cashRegister,
      id: Date.now().toString(),
    };
    setCashRegisters([newCashRegister, ...cashRegisters]);
    toast.success('Corte de caja registrado exitosamente');
  };

  const getSalesByPeriod = (period: 'day' | 'week' | 'month') => {
    const now = new Date();
    const paidOrders = orders.filter(order => order.status === 'paid' && order.paidAt);

    let filteredOrders: Order[] = [];

    if (period === 'day') {
      filteredOrders = paidOrders.filter(order =>
        order.paidAt && new Date(order.paidAt).toDateString() === now.toDateString()
      );
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filteredOrders = paidOrders.filter(order =>
        order.paidAt && new Date(order.paidAt) >= weekAgo
      );
    } else if (period === 'month') {
      filteredOrders = paidOrders.filter(order => {
        if (!order.paidAt) return false;
        const orderDate = new Date(order.paidAt);
        return orderDate.getMonth() === now.getMonth() &&
               orderDate.getFullYear() === now.getFullYear();
      });
    }

    const total = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const count = filteredOrders.length;
    const byCash = filteredOrders
      .filter(o => o.paymentMethod === 'cash')
      .reduce((sum, order) => sum + order.total, 0);
    const byCard = filteredOrders
      .filter(o => o.paymentMethod === 'card')
      .reduce((sum, order) => sum + order.total, 0);
    const byMobile = filteredOrders
      .filter(o => o.paymentMethod === 'mobile')
      .reduce((sum, order) => sum + order.total, 0);

    return { total, count, byCash, byCard, byMobile };
  };

  const addExtra = (extra: Extra & { categoryIds?: string[]; productIds?: string[] }) => {
    const newExtraId = extra.id || Date.now().toString();
    const newExtra = { ...extra, id: newExtraId };

    console.log('➕ [addExtra] Agregando extra:', {
      id: newExtraId,
      name: extra.name,
      applicationType: extra.applicationType,
      categoryIds: extra.categoryIds,
      productIds: extra.productIds,
    });

    setExtras([...extras, newExtra]);

    // Actualizar relaciones con categorías
    if (extra.categoryIds && extra.categoryIds.length > 0) {
      const newCategoryExtras = new Map(categoryExtras);
      extra.categoryIds.forEach(categoryId => {
        const current = newCategoryExtras.get(categoryId) || [];
        if (!current.includes(newExtraId)) {
          newCategoryExtras.set(categoryId, [...current, newExtraId]);
        }
      });
      console.log('📂 [addExtra] Actualizando categoryExtras:', Object.fromEntries(newCategoryExtras));
      setCategoryExtras(newCategoryExtras);
    }

    // Actualizar relaciones con productos
    if (extra.productIds && extra.productIds.length > 0) {
      const newProductExtras = new Map(productExtras);
      extra.productIds.forEach(productId => {
        const current = newProductExtras.get(productId) || [];
        if (!current.includes(newExtraId)) {
          newProductExtras.set(productId, [...current, newExtraId]);
        }
      });
      console.log('📦 [addExtra] Actualizando productExtras:', Object.fromEntries(newProductExtras));
      setProductExtras(newProductExtras);
    }

    toast.success(`Extra ${extra.name} agregado`);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'create',
        module: 'inventory',
        entityType: 'extra',
        entityId: newExtraId,
        details: `Tipo: ${extra.applicationType}, Precio: $${extra.price}`,
      });
    }
  };

  const updateExtra = (id: string, updates: Partial<Extra> & { categoryIds?: string[]; productIds?: string[] }) => {
    const extra = extras.find(e => e.id === id);

    console.log('✏️ [updateExtra] Actualizando extra:', {
      id,
      name: updates.name || extra?.name,
      applicationType: updates.applicationType,
      categoryIds: updates.categoryIds,
      productIds: updates.productIds,
    });

    setExtras(extras.map(extra =>
      extra.id === id ? { ...extra, ...updates } : extra
    ));

    // Actualizar relaciones con categorías
    if (updates.categoryIds !== undefined) {
      const newCategoryExtras = new Map(categoryExtras);

      // Remover el extra de todas las categorías que ya no lo tienen
      categoryExtras.forEach((extraIds, categoryId) => {
        if (!updates.categoryIds!.includes(categoryId)) {
          newCategoryExtras.set(
            categoryId,
            extraIds.filter(extraId => extraId !== id)
          );
        }
      });

      // Agregar el extra a las nuevas categorías
      updates.categoryIds.forEach(categoryId => {
        const current = newCategoryExtras.get(categoryId) || [];
        if (!current.includes(id)) {
          newCategoryExtras.set(categoryId, [...current, id]);
        }
      });

      setCategoryExtras(newCategoryExtras);
    }

    // Actualizar relaciones con productos
    if (updates.productIds !== undefined) {
      const newProductExtras = new Map(productExtras);

      // Remover el extra de todos los productos que ya no lo tienen
      productExtras.forEach((extraIds, productId) => {
        if (!updates.productIds!.includes(productId)) {
          newProductExtras.set(
            productId,
            extraIds.filter(extraId => extraId !== id)
          );
        }
      });

      // Agregar el extra a los nuevos productos
      updates.productIds.forEach(productId => {
        const current = newProductExtras.get(productId) || [];
        if (!current.includes(id)) {
          newProductExtras.set(productId, [...current, id]);
        }
      });

      setProductExtras(newProductExtras);
    }

    toast.success('Extra actualizado');

    if (currentUser && extra) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'update',
        module: 'inventory',
        entityType: 'extra',
        entityId: id,
        details: Object.keys(updates).join(', '),
      });
    }
  };

  const deleteExtra = (id: string) => {
    const extra = extras.find(e => e.id === id);
    setExtras(extras.filter(extra => extra.id !== id));

    // Eliminar relaciones con categorías
    const newCategoryExtras = new Map(categoryExtras);
    categoryExtras.forEach((extraIds, categoryId) => {
      newCategoryExtras.set(
        categoryId,
        extraIds.filter(extraId => extraId !== id)
      );
    });
    setCategoryExtras(newCategoryExtras);

    // Eliminar relaciones con productos
    const newProductExtras = new Map(productExtras);
    productExtras.forEach((extraIds, productId) => {
      newProductExtras.set(
        productId,
        extraIds.filter(extraId => extraId !== id)
      );
    });
    setProductExtras(newProductExtras);

    toast.success('Extra eliminado');

    if (currentUser && extra) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'delete',
        module: 'inventory',
        entityType: 'extra',
        entityId: id,
        details: `Extra: ${extra.name}`,
      });
    }
  };

  const getAvailableExtrasForProduct = (productId: string): Extra[] => {
    const product = menuItems.find(p => p.id === productId);
    if (!product) {
      console.log('❌ [getAvailableExtrasForProduct] Producto no encontrado:', productId);
      return [];
    }

    console.log('🔍 [getAvailableExtrasForProduct] Buscando extras para:', {
      productId,
      productName: product.name,
      categoryId: product.categoryId,
      categoryName: product.category,
    });

    const availableExtras: Extra[] = [];

    // Extras globales (aplican a todos los productos)
    const globalExtras = extras.filter(e => e.active && e.applicationType === 'global');
    console.log('🌍 [getAvailableExtrasForProduct] Extras globales:', globalExtras.map(e => e.name));
    availableExtras.push(...globalExtras);

    // Extras específicos del producto
    const productExtraIds = productExtras.get(productId) || [];
    console.log('📦 [getAvailableExtrasForProduct] IDs de extras del producto:', productExtraIds);
    productExtraIds.forEach(extraId => {
      const extra = extras.find(e => e.id === extraId && e.active);
      if (extra && !availableExtras.find(e => e.id === extraId)) {
        console.log('  ➕ Agregando extra de producto:', extra.name);
        availableExtras.push(extra);
      }
    });

    // Extras de la categoría del producto
    if (product.categoryId) {
      const categoryExtraIds = categoryExtras.get(product.categoryId) || [];
      console.log('📂 [getAvailableExtrasForProduct] IDs de extras de categoría:', categoryExtraIds);
      categoryExtraIds.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId && e.active);
        if (extra && !availableExtras.find(e => e.id === extraId)) {
          console.log('  ➕ Agregando extra de categoría:', extra.name);
          availableExtras.push(extra);
        }
      });
    }

    console.log('✅ [getAvailableExtrasForProduct] Total de extras disponibles:', availableExtras.map(e => e.name));
    return availableExtras;
  };

  return (
    <AppContext.Provider
      value={{
        menuItems,
        setMenuItems,
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        tables,
        updateTable,
        addTable,
        deleteTable,
        users,
        addUser,
        updateUser,
        deleteUser,
        currentUser,
        setCurrentUser,
        login,
        logout,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        updateInventory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        accessibility,
        updateAccessibility,
        invoiceBanner,
        updateInvoiceBanner,
        auditLogs,
        cashRegisters,
        addCashRegister,
        getSalesByPeriod,
        extras,
        categoryExtras,
        productExtras,
        addExtra,
        updateExtra,
        deleteExtra,
        getAvailableExtrasForProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export const useAppContext = useApp;
