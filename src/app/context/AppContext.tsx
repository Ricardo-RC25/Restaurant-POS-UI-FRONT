import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MenuItem, Order, Table, User, Notification, Category, AuditLog, CashRegister, Extra } from '../types';
import { toast } from 'sonner';
import { initialUsers } from '../data/initialUsers';
import { tablesService } from '../services/tablesService';
import { usersService } from '../services/usersService';
import { authService } from '../services/authService';
import { categoriesService } from '../services/categoriesService';
import { menuItemsService } from '../services/menuItemsService';
import { extrasService } from '../services/extrasService';

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
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
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
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  updateTableNumber: (id: string, newNumber: number) => Promise<void>;
  addTable: (table: Omit<Table, 'id'>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  updateInventory: (itemId: string, quantity: number) => void;
  cashRegisters: CashRegister[];
  addCashRegister: (cashRegister: Omit<CashRegister, 'id'>) => void;
  getSalesByPeriod: (period: 'day' | 'week' | 'month') => { total: number; count: number; byCash: number; byCard: number };
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

const loadTablesFromLocalStorage = (): Table[] => {
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
      console.error('Error loading tables from localStorage:', error);
      return [];
    }
  }
  return [];
};

const loadUsersFromLocalStorage = (): User[] => {
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
      console.error('Error loading users from localStorage:', error);
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

// Los extras ya NO se cargan desde localStorage, solo desde la API

// ============================================================================
// COMPONENTE PROVIDER
// ============================================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUser);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(loadAuditLogs);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(loadCashRegisters);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY);
  const [invoiceBanner, setInvoiceBanner] = useState<InvoiceBannerSettings>(loadInvoiceBannerSettings());
  const [extras, setExtras] = useState<Extra[]>([]);
  const [categoryExtras, setCategoryExtras] = useState<Map<string, string[]>>(new Map());
  const [productExtras, setProductExtras] = useState<Map<string, string[]>>(new Map());

  // Cargar mesas desde la API al iniciar
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const apiTables = await tablesService.getTables();

        // Mapear de snake_case a camelCase y convertir tipos
        const mappedTables: Table[] = apiTables.map(table => ({
          id: table.id,
          number: table.number,
          status: table.status,
          capacity: 4, // Valor por defecto (no viene de la API)
          currentOrder: null,
          currentOrderId: table.current_order_id,
          waiterId: table.waiter_id,
          waiterName: undefined, // Se llenará dinámicamente
          occupiedAt: table.occupied_at ? new Date(table.occupied_at) : undefined,
        }));

        setTables(mappedTables);

        // Guardar en localStorage como cache
        localStorage.setItem('pos_tables', JSON.stringify(mappedTables));
      } catch (error) {
        console.error('❌ [AppContext] Error al cargar mesas desde API, usando localStorage:', error);
        // Si falla la API, cargar desde localStorage como respaldo
        const localTables = loadTablesFromLocalStorage();
        setTables(localTables);
      }
    };

    fetchTables();
  }, []);

  // Cargar usuarios desde la API al iniciar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUsers = await usersService.getUsers();

        // Mapear de snake_case a camelCase y convertir tipos
        const mappedUsers: User[] = apiUsers.map(user => ({
          id: user.id,
          username: user.username,
          password: '', // No se devuelve por seguridad
          name: user.name,
          email: user.email || undefined,
          phone: user.phone || undefined,
          role: user.role,
          active: user.active === 1,
          createdAt: new Date(user.created_at),
        }));

        setUsers(mappedUsers);

        // Guardar en localStorage como cache
        localStorage.setItem('pos_users', JSON.stringify(mappedUsers));
      } catch (error) {
        console.error('❌ [AppContext] Error al cargar usuarios desde API, usando localStorage:', error);
        // Si falla la API, cargar desde localStorage como respaldo
        const localUsers = loadUsersFromLocalStorage();
        setUsers(localUsers);
      }
    };

    fetchUsers();
  }, []);

  // Cargar categorías desde API al montar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiCategories = await categoriesService.getCategories();

        // Mapear de snake_case a camelCase y convertir tipos
        const mappedCategories: Category[] = apiCategories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          productCount: 0, // Se calculará dinámicamente
          displayOrder: category.display_order,
          active: category.active === 1,
        }));

        setCategories(mappedCategories);

        // Guardar en localStorage como cache
        localStorage.setItem('pos_categories', JSON.stringify(mappedCategories));
      } catch (error) {
        console.error('❌ [AppContext] Error al cargar categorías desde API, usando localStorage:', error);
        // Si falla la API, cargar desde localStorage como respaldo
        const localCategories = loadCategories();
        setCategories(localCategories);
      }
    };

    fetchCategories();
  }, []);

  // Cargar productos desde API al montar
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const apiMenuItems = await menuItemsService.getMenuItems();

        // Mapear de snake_case a camelCase y convertir tipos
        const mappedMenuItems: MenuItem[] = apiMenuItems.map(item => {
          // Buscar el nombre de la categoría
          const category = categories.find(c => c.id === item.category_id);

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            priceProvider: parseFloat(item.price_provider),
            priceClient: parseFloat(item.price_client),
            category: category?.name || 'Sin categoría',
            categoryId: item.category_id,
            stock: parseInt(item.stock),
            minStock: parseInt(item.min_stock),
            unit: 'pzs', // Valor por defecto (no viene de la API)
            imageUrl: item.image ? `http://localhost:3000/uploads/${item.image}` : undefined,
            active: item.active === 1,
            createdAt: new Date(item.created_at),
          };
        });

        setMenuItems(mappedMenuItems);

        // Guardar en localStorage como cache
        localStorage.setItem('pos_menu_items', JSON.stringify(mappedMenuItems));
      } catch (error) {
        console.error('❌ [AppContext] Error al cargar productos desde API, usando localStorage:', error);
        // Si falla la API, cargar desde localStorage como respaldo
        const localMenuItems = loadMenuItems();
        setMenuItems(localMenuItems);
      }
    };

    // Solo cargar productos después de que las categorías estén disponibles
    if (categories.length > 0) {
      fetchMenuItems();
    }
  }, [categories]);

  // Cargar extras desde la API al iniciar
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const apiExtras = await extrasService.getExtras();

        // Mapear datos de la API al formato del frontend
        const mappedExtras: Extra[] = apiExtras.map(extra => ({
          id: extra.id,
          name: extra.name,
          description: extra.description || '',
          price: parseFloat(extra.price),
          applicationType: extra.application_type,
          active: extra.active === 1,
          createdAt: new Date(extra.created_at),
        }));

        setExtras(mappedExtras);

        // Reconstruir Maps de relaciones
        const newCategoryExtras = new Map<string, string[]>();
        const newProductExtras = new Map<string, string[]>();

        apiExtras.forEach(extra => {
          // Relaciones con categorías
          if (extra.categories && extra.categories.length > 0) {
            extra.categories.forEach((categoryId: string) => {
              const current = newCategoryExtras.get(categoryId) || [];
              if (!current.includes(extra.id)) {
                newCategoryExtras.set(categoryId, [...current, extra.id]);
              }
            });
          }

          // Relaciones con productos
          if (extra.products && extra.products.length > 0) {
            extra.products.forEach((productId: string) => {
              const current = newProductExtras.get(productId) || [];
              if (!current.includes(extra.id)) {
                newProductExtras.set(productId, [...current, extra.id]);
              }
            });
          }
        });

        setCategoryExtras(newCategoryExtras);
        setProductExtras(newProductExtras);
      } catch (error) {
        console.error('❌ [AppContext] Error al cargar extras desde API:', error);
      }
    };

    fetchExtras();
  }, []);

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

  // Los extras ya NO se guardan en localStorage, solo vienen desde la API

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

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt'>) => {
    try {
      // Llamar a la API para crear el producto
      const response = await menuItemsService.createMenuItem({
        name: item.name,
        description: item.description,
        category_id: item.categoryId,
        price_provider: item.priceProvider,
        price_client: item.priceClient,
        stock: item.stock,
        min_stock: item.minStock,
        image: item.imageFile,
      });

      // Crear el objeto MenuItem completo con los datos de la API
      const newItem: MenuItem = {
        id: response.item.id,
        name: response.item.name,
        description: response.item.description,
        priceProvider: parseFloat(response.item.price_provider),
        priceClient: parseFloat(response.item.price_client),
        category: item.category, // Mantener el nombre de la categoría del frontend
        categoryId: response.item.category_id,
        stock: parseInt(response.item.stock),
        minStock: parseInt(response.item.min_stock),
        unit: item.unit,
        imageUrl: response.item.image ? `http://localhost:3000/uploads/${response.item.image}` : undefined,
        active: response.item.active,
        createdAt: new Date(),
      };

      setMenuItems([...menuItems, newItem]);
      toast.success(`Producto ${newItem.name} agregado`);

      if (currentUser) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'create',
          module: 'inventory',
          entityType: 'product',
          entityId: newItem.id,
          details: `Categoría: ${newItem.category}, Precio: $${newItem.priceClient}`,
        });
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al crear el producto. Intenta nuevamente.');
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const item = menuItems.find(i => i.id === id);

    if (!item) {
      toast.error('Producto no encontrado');
      return;
    }

    try {
      // Combinar el estado actual con las actualizaciones
      const updatedItem = { ...item, ...updates };

      // Enviar TODOS los campos a la API para evitar valores NULL
      const apiData: any = {
        name: updatedItem.name,
        description: updatedItem.description,
        category_id: updatedItem.categoryId,
        price_provider: updatedItem.priceProvider,
        price_client: updatedItem.priceClient,
        stock: updatedItem.stock,
        min_stock: updatedItem.minStock,
      };

      // Si hay un archivo de imagen nuevo, incluirlo
      if (updates.imageFile) {
        apiData.image = updates.imageFile;
      }

      await menuItemsService.updateMenuItem(id, apiData);

      setMenuItems(menuItems.map(item =>
        item.id === id ? updatedItem : item
      ));
      toast.success('Producto actualizado');

      if (currentUser) {
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
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar el producto. Intenta nuevamente.');
      // Aún así actualizar el estado local
      setMenuItems(menuItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ));
    }
  };

  const deleteMenuItem = async (id: string) => {
    const item = menuItems.find(i => i.id === id);

    try {
      await menuItemsService.deleteMenuItem(id);
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
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto. Intenta nuevamente.');
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

  // Actualizar estado local de mesa (para estados operacionales temporales)
  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  // Actualizar número de mesa en la API (cambio permanente)
  const updateTableNumber = async (id: string, newNumber: number) => {
    try {
      await tablesService.updateTableNumber(id, newNumber);

      // Recargar todas las mesas desde la API
      const apiTables = await tablesService.getTables();

      const mappedTables: Table[] = apiTables.map(table => ({
        id: table.id,
        number: table.number,
        status: table.status,
        capacity: 4,
        currentOrder: null,
        currentOrderId: table.current_order_id,
        waiterId: table.waiter_id,
        waiterName: undefined,
        occupiedAt: table.occupied_at ? new Date(table.occupied_at) : undefined,
      }));

      setTables([...mappedTables]);
      localStorage.setItem('pos_tables', JSON.stringify(mappedTables));
    } catch (error) {
      console.error('Error al actualizar número de mesa:', error);
      toast.error('Error al actualizar el número de mesa. Intenta nuevamente.');
    }
  };

  const addTable = async (table: Omit<Table, 'id'>) => {
    try {
      // Llamar a la API para crear la mesa
      const response = await tablesService.createTable({
        number: table.number,
        status: table.status,
      });

      // Recargar todas las mesas desde la API para asegurar sincronización
      const apiTables = await tablesService.getTables();

      const mappedTables: Table[] = apiTables.map(table => ({
        id: table.id,
        number: table.number,
        status: table.status,
        capacity: 4,
        currentOrder: null,
        currentOrderId: table.current_order_id,
        waiterId: table.waiter_id,
        waiterName: undefined,
        occupiedAt: table.occupied_at ? new Date(table.occupied_at) : undefined,
      }));

      setTables(mappedTables);
      localStorage.setItem('pos_tables', JSON.stringify(mappedTables));
      toast.success(`Mesa ${table.number} creada`);

      if (currentUser) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'create',
          module: 'tables',
          entityType: 'table',
          entityId: response.tableId,
          details: `Mesa ${table.number} - Capacidad: ${table.capacity}`,
        });
      }
    } catch (error) {
      console.error('❌ [addTable] Error al crear mesa:', error);
      toast.error('Error al crear la mesa. Intenta nuevamente.');
      throw error;
    }
  };

  const deleteTable = async (id: string) => {
    try {
      const table = tables.find(t => t.id === id);

      // Llamar a la API para eliminar la mesa
      await tablesService.deleteTable(id);

      // Recargar todas las mesas desde la API para asegurar sincronización
      const apiTables = await tablesService.getTables();

      const mappedTables: Table[] = apiTables.map(table => ({
        id: table.id,
        number: table.number,
        status: table.status,
        capacity: 4,
        currentOrder: null,
        currentOrderId: table.current_order_id,
        waiterId: table.waiter_id,
        waiterName: undefined,
        occupiedAt: table.occupied_at ? new Date(table.occupied_at) : undefined,
      }));

      setTables(mappedTables);
      localStorage.setItem('pos_tables', JSON.stringify(mappedTables));
      toast.success(`Mesa ${table?.number} eliminada`);

      if (currentUser && table) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'delete',
          module: 'tables',
          entityType: 'table',
          entityId: table.id,
          details: `Mesa ${table.number}`,
        });
      }
    } catch (error) {
      console.error('❌ [deleteTable] Error al eliminar mesa:', error);
      toast.error('Error al eliminar la mesa. Intenta nuevamente.');
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });

      // Guardar token en localStorage
      localStorage.setItem('auth_token', response.token);

      // Buscar el usuario completo en el estado local
      const user = users.find(u => u.id === response.user.id);

      if (user) {
        setCurrentUser(user);
        toast.success(`Bienvenido ${response.user.name}`);

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
      } else {
        // Si no encontramos el usuario completo, usar los datos básicos de la API
        const basicUser: User = {
          id: response.user.id,
          username: username,
          password: '', // No guardamos la contraseña
          name: response.user.name,
          role: response.user.role as 'admin' | 'manager' | 'waiter' | 'cashier',
          active: true,
          createdAt: new Date(),
        };
        setCurrentUser(basicUser);
        toast.success(`Bienvenido ${response.user.name}`);
        return true;
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Credenciales incorrectas');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Llamar a la API para cerrar sesión
      await authService.logout();

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

      // Eliminar token de localStorage
      localStorage.removeItem('auth_token');

      setCurrentUser(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así cerrar sesión localmente
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
      toast.success('Sesión cerrada');
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      // Llamar a la API para crear el usuario
      const response = await usersService.createUser({
        username: userData.username,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        phone: userData.phone,
        created_by: currentUser?.id || null,
      });

      // Crear el objeto de usuario con el ID del backend
      const newUser: User = {
        id: response.user.id,
        username: userData.username,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        phone: userData.phone,
        active: true,
        createdAt: new Date(),
      };

      // Actualizar el estado local
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
    } catch (error) {
      console.error('❌ [addUser] Error al crear usuario:', error);
      toast.error('Error al crear el usuario. Intenta nuevamente.');
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) {
        return;
      }

      // Crear el objeto actualizado completo (combinar estado actual con updates)
      const updatedUser = { ...user, ...updates };

      // Preparar datos para la API con TODOS los campos
      const apiData: any = {
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email || null,
        phone: updatedUser.phone || null,
        role: updatedUser.role,
        active: updatedUser.active,
      };

      await usersService.updateUser(id, apiData);

      // Actualizar estado local
      setUsers(users.map(u =>
        u.id === id ? updatedUser : u
      ));

      toast.success('Usuario actualizado');

      if (currentUser) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'update',
          module: 'users',
          entityType: 'user',
          entityId: id,
          details: `Usuario: ${updatedUser.name}, Campos: ${Object.keys(updates).join(', ')}`,
        });
      }
    } catch (error) {
      console.error('❌ [updateUser] Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario. Intenta nuevamente.');
      // Aún así actualizar el estado local
      setUsers(users.map(user =>
        user.id === id ? { ...user, ...updates } : user
      ));
    }
  };

  const deleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);

    try {
      await usersService.deleteUser(id);
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
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar el usuario. Intenta nuevamente.');
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

  const addCategory = async (category: Omit<Category, 'id' | 'productCount'>) => {
    try {
      // Llamar a la API para crear la categoría
      const response = await categoriesService.createCategory({
        name: category.name,
        description: category.description,
      });

      // Crear el objeto Category completo con los datos de la API
      const newCategory: Category = {
        id: response.category.id,
        name: response.category.name,
        description: response.category.description,
        productCount: 0,
        displayOrder: response.category.display_order,
        active: response.category.active,
      };

      setCategories([...categories, newCategory]);
      toast.success(`Categoría ${newCategory.name} agregada`);

      if (currentUser) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'create',
          module: 'inventory',
          entityType: 'category',
          entityId: newCategory.id,
          details: `Categoría: ${newCategory.name}`,
        });
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error('Error al crear la categoría. Intenta nuevamente.');
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const category = categories.find(c => c.id === id);

    if (!category) {
      toast.error('Categoría no encontrada');
      return;
    }

    try {
      // Combinar el estado actual con las actualizaciones
      const updatedCategory = { ...category, ...updates };

      // Enviar TODOS los campos a la API para evitar valores NULL
      const apiData: any = {
        name: updatedCategory.name,
        description: updatedCategory.description,
        active: updatedCategory.active,
      };

      await categoriesService.updateCategory(id, apiData);

      setCategories(categories.map(cat =>
        cat.id === id ? updatedCategory : cat
      ));
      toast.success('Categoría actualizada');

      if (currentUser) {
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
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar la categoría. Intenta nuevamente.');
      // Aún así actualizar el estado local
      setCategories(categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      ));
    }
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const productsToDelete = menuItems.filter(item => item.categoryId === id);

    try {
      // Primero eliminar todos los productos asociados a esta categoría (en la BD)
      for (const product of productsToDelete) {
        try {
          await menuItemsService.deleteMenuItem(product.id);
        } catch (error) {
          console.error(`Error al eliminar producto ${product.name}:`, error);
          throw new Error(`No se pudo eliminar el producto ${product.name}`);
        }
      }

      // Actualizar estado local de productos
      setMenuItems(menuItems.filter(item => item.categoryId !== id));

      // Luego eliminar la categoría (en la BD)
      await categoriesService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));

      const deletedCount = productsToDelete.length;
      toast.success(`Categoría eliminada${deletedCount > 0 ? ` junto con ${deletedCount} producto${deletedCount > 1 ? 's' : ''}` : ''}`);

      if (currentUser && category) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'delete',
          module: 'inventory',
          entityType: 'category',
          entityId: id,
          details: `Categoría eliminada: ${category.name}${deletedCount > 0 ? ` (${deletedCount} producto${deletedCount > 1 ? 's' : ''} eliminado${deletedCount > 1 ? 's' : ''})` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('Error al eliminar la categoría. Intenta nuevamente.');
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

    return { total, count, byCash, byCard };
  };

  const addExtra = async (extra: Omit<Extra, 'id' | 'createdAt'> & { categoryIds?: string[]; productIds?: string[] }) => {
    try {
      let categories: string[] = [];
      let products: string[] = [];

      // Determinar qué enviar según application_type
      if (extra.applicationType === 'category') {
        categories = extra.categoryIds || [];
        products = [];
      } else if (extra.applicationType === 'product') {
        categories = [];
        products = extra.productIds || [];
      } else {
        // Global
        categories = [];
        products = [];
      }

      await extrasService.createExtra({
        name: extra.name,
        description: extra.description,
        price: extra.price,
        application_type: extra.applicationType,
        active: extra.active,
        categories,  // ✅ Array de category IDs
        products,    // ✅ Array de product IDs
      });

      // Recargar desde API
      await reloadExtrasFromAPI();
      toast.success(`Extra ${extra.name} agregado`);

      if (currentUser) {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'create',
          module: 'inventory',
          entityType: 'extra',
          entityId: 'created',
          details: `Tipo: ${extra.applicationType}, Precio: $${extra.price}`,
        });
      }
    } catch (error) {
      console.error('❌ Error al crear extra:', error);
      toast.error('Error al crear el extra. Intenta nuevamente.');
    }
  };

  const updateExtra = async (id: string, updates: Partial<Extra> & { categoryIds?: string[]; productIds?: string[] }) => {
    try {
      let categories: string[] = [];
      let products: string[] = [];

      // Determinar qué enviar según application_type
      if (updates.applicationType === 'category') {
        categories = updates.categoryIds || [];
        products = [];
      } else if (updates.applicationType === 'product') {
        categories = [];
        products = updates.productIds || [];
      } else if (updates.applicationType === 'global') {
        // Global
        categories = [];
        products = [];
      }

      await extrasService.updateExtra(id, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        application_type: updates.applicationType,
        active: updates.active,
        categories,  // ✅ Array de category IDs
        products,    // ✅ Array de product IDs
      });

      // Recargar desde API
      await reloadExtrasFromAPI();
      toast.success('Extra actualizado');

      if (currentUser) {
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
    } catch (error) {
      console.error('❌ Error al actualizar extra:', error);
      toast.error('Error al actualizar el extra. Intenta nuevamente.');
    }
  };

  const deleteExtra = async (id: string) => {
    try {
      const extra = extras.find(e => e.id === id);

      await extrasService.deleteExtra(id);

      // Recargar desde API
      await reloadExtrasFromAPI();
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
    } catch (error) {
      console.error('❌ Error al eliminar extra:', error);
      toast.error('Error al eliminar el extra. Intenta nuevamente.');
    }
  };

  const reloadExtrasFromAPI = async () => {
    try {
      const apiExtras = await extrasService.getExtras();

      // Mapear datos de la API al formato del frontend
      const mappedExtras: Extra[] = apiExtras.map(extra => ({
        id: extra.id,
        name: extra.name,
        description: extra.description || '',
        price: parseFloat(extra.price),
        applicationType: extra.application_type,
        active: extra.active === 1,
        createdAt: new Date(extra.created_at),
      }));

      setExtras(mappedExtras);

      // Reconstruir Maps de relaciones
      const newCategoryExtras = new Map<string, string[]>();
      const newProductExtras = new Map<string, string[]>();

      apiExtras.forEach(extra => {
        // Relaciones con categorías
        if (extra.categories && extra.categories.length > 0) {
          extra.categories.forEach((categoryId: string) => {
            const current = newCategoryExtras.get(categoryId) || [];
            if (!current.includes(extra.id)) {
              newCategoryExtras.set(categoryId, [...current, extra.id]);
            }
          });
        }

        // Relaciones con productos
        if (extra.products && extra.products.length > 0) {
          extra.products.forEach((productId: string) => {
            const current = newProductExtras.get(productId) || [];
            if (!current.includes(extra.id)) {
              newProductExtras.set(productId, [...current, extra.id]);
            }
          });
        }
      });

      setCategoryExtras(newCategoryExtras);
      setProductExtras(newProductExtras);
    } catch (error) {
      console.error('❌ [reloadExtrasFromAPI] Error:', error);
      throw error;
    }
  };

  const getAvailableExtrasForProduct = (productId: string): Extra[] => {
    const product = menuItems.find(p => p.id === productId);
    if (!product) {
      return [];
    }

    const availableExtras: Extra[] = [];

    // Extras globales (aplican a todos los productos)
    const globalExtras = extras.filter(e => e.active && e.applicationType === 'global');
    availableExtras.push(...globalExtras);

    // Extras específicos del producto
    const productExtraIds = productExtras.get(productId) || [];
    productExtraIds.forEach(extraId => {
      const extra = extras.find(e => e.id === extraId && e.active);
      if (extra && !availableExtras.find(e => e.id === extraId)) {
        availableExtras.push(extra);
      }
    });

    // Extras de la categoría del producto
    if (product.categoryId) {
      const categoryExtraIds = categoryExtras.get(product.categoryId) || [];
      categoryExtraIds.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId && e.active);
        if (extra && !availableExtras.find(e => e.id === extraId)) {
          availableExtras.push(extra);
        }
      });
    }

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
        updateTableNumber,
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
