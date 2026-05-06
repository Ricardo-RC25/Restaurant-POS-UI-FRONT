/**
 * Menu Items API Service
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Obtener headers con token de autenticación si está disponible
 */
const getHeaders = (includeContentType: boolean = true): HeadersInit => {
  const headers: HeadersInit = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

interface CreateMenuItemRequest {
  name: string;
  description: string;
  category_id: string;
  price_provider: number;
  price_client: number;
  stock: number;
  min_stock: number;
  image?: File;
}

interface CreateMenuItemResponse {
  message: string;
  item: {
    id: string;
    name: string;
    description: string;
    category_id: string;
    price_provider: string;
    price_client: string;
    stock: string;
    min_stock: string;
    image: string;
    active: boolean;
    created_by: string | null;
  };
}

interface MenuItemApiResponse {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price_provider: string;
  price_client: string;
  stock: string;
  min_stock: string;
  image: string;
  active: number;
  created_at: string;
}

interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  category_id?: string;
  price_provider?: number;
  price_client?: number;
  stock?: number;
  min_stock?: number;
  active?: boolean;
  image?: File;
}

interface UpdateMenuItemResponse {
  message: string;
}

interface DeleteMenuItemResponse {
  message: string;
}

export const menuItemsService = {
  /**
   * Obtener todos los productos
   */
  async getMenuItems(): Promise<MenuItemApiResponse[]> {
    console.log('📡 [API] Obteniendo todos los productos');
    const response = await fetch(`${API_BASE_URL}/menu-items`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [API] Productos obtenidos:', data);
    return data;
  },

  /**
   * Crear un nuevo producto (con FormData para soportar imagen)
   */
  async createMenuItem(data: CreateMenuItemRequest): Promise<CreateMenuItemResponse> {
    console.log('📡 [API] Creando producto:', { ...data, image: data.image ? 'FILE' : null });

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category_id', data.category_id);
    formData.append('price_provider', data.price_provider.toString());
    formData.append('price_client', data.price_client.toString());
    formData.append('stock', data.stock.toString());
    formData.append('min_stock', data.min_stock.toString());

    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await fetch(`${API_BASE_URL}/menu-items`, {
      method: 'POST',
      headers: getHeaders(false), // No incluir Content-Type para FormData
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [API] Producto creado:', result);
    return result;
  },

  /**
   * Actualizar un producto (con FormData para soportar imagen)
   */
  async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<UpdateMenuItemResponse> {
    console.log('📡 [API] Actualizando producto:', { id, data: { ...data, image: data.image ? 'FILE' : null } });

    const formData = new FormData();

    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.category_id !== undefined) formData.append('category_id', data.category_id);
    if (data.price_provider !== undefined) formData.append('price_provider', data.price_provider.toString());
    if (data.price_client !== undefined) formData.append('price_client', data.price_client.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.min_stock !== undefined) formData.append('min_stock', data.min_stock.toString());
    if (data.active !== undefined) formData.append('active', data.active.toString());
    if (data.image) formData.append('image', data.image);

    const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
      method: 'PUT',
      headers: getHeaders(false), // No incluir Content-Type para FormData
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [API] Producto actualizado:', result);
    return result;
  },

  /**
   * Eliminar un producto
   */
  async deleteMenuItem(id: string): Promise<DeleteMenuItemResponse> {
    console.log('📡 [API] Eliminando producto:', id);
    const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [API] Producto eliminado:', result);
    return result;
  },
};
