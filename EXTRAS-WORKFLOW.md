# Documentación Completa: CRUD de Extras y Aplicación en Órdenes

## 📋 Índice

1. [Tipos de Datos](#tipos-de-datos)
2. [Crear un Extra](#crear-un-extra)
3. [Almacenamiento Local](#almacenamiento-local)
4. [Actualizar un Extra](#actualizar-un-extra)
5. [Eliminar un Extra](#eliminar-un-extra)
6. [Aplicación en Órdenes](#aplicación-en-órdenes)
7. [Flujo Visual Completo](#flujo-visual-completo)

---

## 1. Tipos de Datos

### Interface `Extra` (Frontend)
```typescript
// Ubicación: src/app/types.ts
export interface Extra {
  id: string;                    // UUID del backend
  name: string;                  // Nombre del extra (ej: "Piña")
  description: string;           // Descripción opcional (ej: "Piña para tacos")
  price: number;                 // Precio adicional (puede ser 0)
  applicationType: 'global' | 'category' | 'product'; 
  active: boolean;               // Si el extra está disponible
  createdAt: Date;               // Fecha de creación
}
```

**Valores de `applicationType`:**
- `'global'`: Aplica a **todos** los productos del menú
- `'category'`: Aplica solo a productos de **categorías específicas**
- `'product'`: Aplica solo a **productos individuales específicos**

### Relaciones entre Extras y Productos/Categorías

El sistema usa **Maps** para gestionar las relaciones:

```typescript
// Ubicación: src/app/context/AppContext.tsx

// Map<categoryId, extraId[]>
// Relaciona qué extras aplican a cada categoría
const categoryExtras: Map<string, string[]>
// Ejemplo: 
// Map {
//   "cat-123-tacos" => ["extra-456-piña", "extra-789-cebolla"],
//   "cat-999-tortas" => ["extra-456-piña"]
// }

// Map<productId, extraId[]>
// Relaciona qué extras aplican a cada producto
const productExtras: Map<string, string[]>
// Ejemplo:
// Map {
//   "prod-111-pastor" => ["extra-456-piña"],
//   "prod-222-asada" => ["extra-789-cebolla"]
// }
```

---

## 2. Crear un Extra

### 2.1 Formulario (ExtraModal.tsx)

El componente `ExtraModal` muestra el formulario con estos campos:

```typescript
// Estado interno del formulario
const [formData, setFormData] = useState({
  name: '',                       // string - Nombre del extra
  description: '',                // string - Descripción (opcional)
  price: 0,                       // number - Precio adicional
  active: true,                   // boolean - Si está activo
  applicationType: 'global',      // 'global' | 'category' | 'product'
  applyToAllProducts: false,      // boolean - Checkbox "Aplicar a todos"
  categoryIds: [],                // string[] - IDs de categorías seleccionadas
  productIds: [],                 // string[] - IDs de productos seleccionados
});
```

### 2.2 Validación del Formulario

```typescript
// Ubicación: src/app/components/ExtraModal.tsx línea 75

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // ❌ Nombre es obligatorio
  if (!formData.name.trim()) {
    newErrors.name = 'El nombre es requerido';
  }

  // ❌ Precio no puede ser negativo
  if (formData.price < 0) {
    newErrors.price = 'El precio no puede ser negativo';
  }

  // ❌ Si NO es global, debe seleccionar al menos una categoría o producto
  if (!formData.applyToAllProducts) {
    if (!formData.categoryIds?.length && !formData.productIds?.length) {
      newErrors.application = 'Debe seleccionar al menos una categoría o producto';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 2.3 Determinación del `applicationType`

Cuando el usuario hace clic en "Guardar", el sistema determina automáticamente el tipo:

```typescript
// Ubicación: src/app/components/ExtraModal.tsx línea 99

let applicationType: 'global' | 'category' | 'product' = 'global';

if (!formData.applyToAllProducts) {
  // Si hay productos seleccionados → tipo 'product'
  if (formData.productIds.length > 0) {
    applicationType = 'product';
  } 
  // Si hay categorías seleccionadas → tipo 'category'
  else if (formData.categoryIds.length > 0) {
    applicationType = 'category';
  }
}

// Resultado:
// - applyToAllProducts = true → 'global'
// - productIds.length > 0 → 'product'
// - categoryIds.length > 0 → 'category'
```

### 2.4 Datos Enviados al Contexto

```typescript
// Ubicación: src/app/components/ExtraModal.tsx línea 110

const dataToSave = {
  name: formData.name,              // string - "Piña"
  description: formData.description, // string - "Piña para tacos"
  price: formData.price,            // number - 0
  active: formData.active,          // boolean - true
  applicationType,                   // 'global' | 'category' | 'product'
  categoryIds: formData.categoryIds, // string[] - ["cat-123", "cat-456"]
  productIds: formData.productIds,   // string[] - ["prod-789"]
};

console.log('💾 [ExtraModal] Guardando extra:', dataToSave);
onSave(dataToSave);
```

**Ejemplo de `dataToSave` para Extra Global:**
```json
{
  "name": "Salsa extra",
  "description": "Salsa adicional para cualquier producto",
  "price": 5,
  "active": true,
  "applicationType": "global",
  "categoryIds": [],
  "productIds": []
}
```

**Ejemplo de `dataToSave` para Extra por Categoría:**
```json
{
  "name": "Piña",
  "description": "Piña para tacos y tortas",
  "price": 0,
  "active": true,
  "applicationType": "category",
  "categoryIds": ["cat-123-tacos", "cat-456-tortas"],
  "productIds": []
}
```

**Ejemplo de `dataToSave` para Extra por Producto:**
```json
{
  "name": "Piña",
  "description": "Piña para tacos de pastor",
  "price": 0,
  "active": true,
  "applicationType": "product",
  "categoryIds": [],
  "productIds": ["prod-789-pastor"]
}
```

### 2.5 Procesamiento en AppContext

```typescript
// Ubicación: src/app/context/AppContext.tsx línea 1437

const addExtra = (extra: Extra & { categoryIds?: string[]; productIds?: string[] }) => {
  // 1️⃣ Generar ID único
  const newExtraId = extra.id || Date.now().toString();
  const newExtra = { ...extra, id: newExtraId };

  console.log('➕ [addExtra] Agregando extra:', {
    id: newExtraId,               // "1736181234567"
    name: extra.name,             // "Piña"
    applicationType: extra.applicationType, // "product"
    categoryIds: extra.categoryIds,         // []
    productIds: extra.productIds,           // ["prod-789-pastor"]
  });

  // 2️⃣ Agregar al estado de extras
  setExtras([...extras, newExtra]);

  // 3️⃣ Actualizar relaciones con categorías (si applicationType === 'category')
  if (extra.categoryIds && extra.categoryIds.length > 0) {
    const newCategoryExtras = new Map(categoryExtras);
    
    extra.categoryIds.forEach(categoryId => {
      const current = newCategoryExtras.get(categoryId) || [];
      if (!current.includes(newExtraId)) {
        newCategoryExtras.set(categoryId, [...current, newExtraId]);
      }
    });
    
    console.log('📂 [addExtra] Actualizando categoryExtras:', 
                Object.fromEntries(newCategoryExtras));
    setCategoryExtras(newCategoryExtras);
  }

  // 4️⃣ Actualizar relaciones con productos (si applicationType === 'product')
  if (extra.productIds && extra.productIds.length > 0) {
    const newProductExtras = new Map(productExtras);
    
    extra.productIds.forEach(productId => {
      const current = newProductExtras.get(productId) || [];
      if (!current.includes(newExtraId)) {
        newProductExtras.set(productId, [...current, newExtraId]);
      }
    });
    
    console.log('📦 [addExtra] Actualizando productExtras:', 
                Object.fromEntries(newProductExtras));
    setProductExtras(newProductExtras);
  }

  // 5️⃣ Mostrar notificación
  toast.success(`Extra ${extra.name} agregado`);

  // 6️⃣ Registrar en auditoría
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
```

---

## 3. Almacenamiento Local

### 3.1 LocalStorage

El sistema usa **localStorage** como caché para persistir los datos entre recargas:

```typescript
// Ubicación: src/app/context/AppContext.tsx línea 594

// Cada vez que cambia el estado de extras, se guarda en localStorage
useEffect(() => {
  localStorage.setItem('pos_extras', JSON.stringify(extras));
}, [extras]);

// Cada vez que cambian las relaciones de categorías
useEffect(() => {
  const obj = Object.fromEntries(categoryExtras);
  localStorage.setItem('pos_category_extras', JSON.stringify(obj));
}, [categoryExtras]);

// Cada vez que cambian las relaciones de productos
useEffect(() => {
  const obj = Object.fromEntries(productExtras);
  localStorage.setItem('pos_product_extras', JSON.stringify(obj));
}, [productExtras]);
```

**Estructura en localStorage:**

```javascript
// localStorage.getItem('pos_extras')
[
  {
    "id": "1736181234567",
    "name": "Piña",
    "description": "Piña para tacos de pastor",
    "price": 0,
    "applicationType": "product",
    "active": true,
    "createdAt": "2026-05-06T10:30:00.000Z"
  }
]

// localStorage.getItem('pos_category_extras')
{
  "cat-123-tacos": ["extra-456-piña", "extra-789-cebolla"],
  "cat-999-tortas": ["extra-456-piña"]
}

// localStorage.getItem('pos_product_extras')
{
  "prod-789-pastor": ["1736181234567"],
  "prod-555-asada": ["extra-789-cebolla"]
}
```

### 3.2 Estado en Memoria (React State)

```typescript
// Ubicación: src/app/context/AppContext.tsx línea 89

const [extras, setExtras] = useState<Extra[]>([]);

const [categoryExtras, setCategoryExtras] = useState<Map<string, string[]>>(
  new Map()
);

const [productExtras, setProductExtras] = useState<Map<string, string[]>>(
  new Map()
);
```

---

## 4. Actualizar un Extra

### 4.1 Flujo de Actualización

```typescript
// Ubicación: src/app/context/AppContext.tsx línea 1493

const updateExtra = (
  id: string, 
  updates: Partial<Extra> & { categoryIds?: string[]; productIds?: string[] }
) => {
  const extra = extras.find(e => e.id === id);

  console.log('✏️ [updateExtra] Actualizando extra:', {
    id,                                    // "1736181234567"
    name: updates.name || extra?.name,     // "Piña" (nuevo)
    applicationType: updates.applicationType, // "category" (nuevo)
    categoryIds: updates.categoryIds,      // ["cat-123-tacos"] (nuevo)
    productIds: updates.productIds,        // [] (nuevo, se limpia)
  });

  // 1️⃣ Actualizar el extra en el estado
  setExtras(extras.map(extra =>
    extra.id === id ? { ...extra, ...updates } : extra
  ));

  // 2️⃣ Actualizar relaciones con categorías
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

  // 3️⃣ Actualizar relaciones con productos
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
};
```

**Ejemplo: Cambiar de producto individual a categorías**

```javascript
// Estado ANTES:
// Extra: { id: "1736181234567", name: "Piña", applicationType: "product" }
// productExtras: Map { "prod-789-pastor" => ["1736181234567"] }
// categoryExtras: Map {}

updateExtra("1736181234567", {
  applicationType: "category",
  categoryIds: ["cat-123-tacos", "cat-456-tortas"],
  productIds: []
});

// Estado DESPUÉS:
// Extra: { id: "1736181234567", name: "Piña", applicationType: "category" }
// productExtras: Map { "prod-789-pastor" => [] } // ❌ Limpiado
// categoryExtras: Map { 
//   "cat-123-tacos" => ["1736181234567"],
//   "cat-456-tortas" => ["1736181234567"]
// } // ✅ Actualizado
```

---

## 5. Eliminar un Extra

```typescript
// Ubicación: src/app/context/AppContext.tsx línea 1574

const deleteExtra = (id: string) => {
  const extra = extras.find(e => e.id === id);
  
  // 1️⃣ Eliminar del estado de extras
  setExtras(extras.filter(extra => extra.id !== id));

  // 2️⃣ Eliminar de relaciones con categorías
  const newCategoryExtras = new Map(categoryExtras);
  categoryExtras.forEach((extraIds, categoryId) => {
    newCategoryExtras.set(
      categoryId,
      extraIds.filter(extraId => extraId !== id)
    );
  });
  setCategoryExtras(newCategoryExtras);

  // 3️⃣ Eliminar de relaciones con productos
  const newProductExtras = new Map(productExtras);
  productExtras.forEach((extraIds, productId) => {
    newProductExtras.set(
      productId,
      extraIds.filter(extraId => extraId !== id)
    );
  });
  setProductExtras(newProductExtras);

  toast.success('Extra eliminado');
};
```

---

## 6. Aplicación en Órdenes

### 6.1 Modal de Extras al Tomar Orden (ExtrasModal.tsx)

Cuando un mesero toma una orden y selecciona un producto, se abre el modal `ExtrasModal`:

```typescript
// Ubicación: src/app/components/ExtrasModal.tsx línea 13

interface ExtrasModalProps {
  item: MenuItem;  // Producto seleccionado
  onConfirm: (extras: Array<{ id: string; name: string; price: number }>, notes: string) => void;
  onClose: () => void;
}
```

### 6.2 Filtrado de Extras Disponibles

El modal filtra qué extras están disponibles para el producto actual:

```typescript
// Ubicación: src/app/components/ExtrasModal.tsx línea 19

const { extras, categoryExtras, productExtras } = useApp();

// Filtrar extras disponibles según la lógica de negocio
const availableExtras = useMemo(() => {
  return extras.filter(extra => {
    // ❌ No mostrar extras inactivos
    if (!extra.active) return false;

    // ✅ Si es GLOBAL → mostrar para todos los productos
    if (extra.applicationType === 'global') return true;

    // ✅ Si es CATEGORÍA → verificar si el producto pertenece a esa categoría
    if (extra.applicationType === 'category') {
      // Buscar en el Map de categoryExtras
      const categoryExtraIds = categoryExtras.get(item.categoryId) || [];
      return categoryExtraIds.includes(extra.id);
    }

    // ✅ Si es PRODUCTO → verificar si este producto está incluido
    if (extra.applicationType === 'product') {
      // Buscar en el Map de productExtras
      const productExtraIds = productExtras.get(item.id) || [];
      return productExtraIds.includes(extra.id);
    }

    return false;
  });
}, [extras, categoryExtras, productExtras, item.categoryId, item.id]);
```

**Ejemplo de filtrado para "Taco de Pastor":**

```javascript
// Producto: { id: "prod-789-pastor", categoryId: "cat-123-tacos" }

// Extras en el sistema:
extras = [
  { id: "extra-1", name: "Salsa extra", applicationType: "global", active: true },
  { id: "extra-2", name: "Piña", applicationType: "product", active: true },
  { id: "extra-3", name: "Cebolla", applicationType: "category", active: true },
  { id: "extra-4", name: "Aguacate", applicationType: "product", active: false }
];

// Maps:
categoryExtras = Map { "cat-123-tacos" => ["extra-3"] }
productExtras = Map { "prod-789-pastor" => ["extra-2"] }

// Resultado del filtro:
availableExtras = [
  { id: "extra-1", name: "Salsa extra" },   // ✅ Global
  { id: "extra-2", name: "Piña" },          // ✅ Producto (prod-789-pastor)
  { id: "extra-3", name: "Cebolla" }        // ✅ Categoría (cat-123-tacos)
  // ❌ "Aguacate" NO aparece porque active = false
];
```

### 6.3 Selección de Extras por el Usuario

```typescript
// Ubicación: src/app/components/ExtrasModal.tsx línea 15

const [selectedExtras, setSelectedExtras] = useState<
  Array<{ id: string; name: string; price: number }>
>([]);

const toggleExtra = useCallback((extra: { id: string; name: string; price: number }) => {
  setSelectedExtras(prev => {
    const isSelected = prev.some(e => e.id === extra.id);
    if (isSelected) {
      return prev.filter(e => e.id !== extra.id);
    } else {
      return [...prev, extra];
    }
  });
}, []);
```

**Ejemplo de estado al seleccionar extras:**

```javascript
// Usuario marca: ✅ Piña, ✅ Salsa extra

selectedExtras = [
  { id: "extra-2", name: "Piña", price: 0 },
  { id: "extra-1", name: "Salsa extra", price: 5 }
];
```

### 6.4 Cálculo del Total

```typescript
// Ubicación: src/app/components/ExtrasModal.tsx línea 59

const totalWithExtras = useMemo(() => {
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  return item.priceClient + extrasTotal;
}, [item.priceClient, selectedExtras]);

// Ejemplo:
// item.priceClient = 45
// selectedExtras = [
//   { id: "extra-2", name: "Piña", price: 0 },
//   { id: "extra-1", name: "Salsa extra", price: 5 }
// ]
// 
// extrasTotal = 0 + 5 = 5
// totalWithExtras = 45 + 5 = 50
```

### 6.5 Confirmación y Agregado a la Orden

```typescript
// Ubicación: src/app/components/ExtrasModal.tsx línea 64

const handleConfirm = useCallback(() => {
  onConfirm(selectedExtras, notes);
}, [selectedExtras, notes, onConfirm]);

// Se envía al componente padre:
onConfirm(
  [
    { id: "extra-2", name: "Piña", price: 0 },
    { id: "extra-1", name: "Salsa extra", price: 5 }
  ],
  "Sin cebolla por favor"  // notes
);
```

### 6.6 Agregado al OrderItem

```typescript
// Ubicación: Componente que llama a ExtrasModal (ej: WaiterView)

const orderItem: OrderItem = {
  ...menuItem,              // Todos los datos del producto
  quantity: 1,
  extras: selectedExtras,   // Array<{ id, name, price }>
  notes: notes              // string - Notas especiales
};

// Ejemplo completo de OrderItem:
{
  id: "prod-789-pastor",
  name: "Taco de Pastor",
  description: "Taco de carne de cerdo marinada",
  priceProvider: 30,
  priceClient: 45,
  category: "Tacos",
  categoryId: "cat-123-tacos",
  stock: 100,
  minStock: 10,
  unit: "pzs",
  active: true,
  createdAt: "2026-05-06T10:00:00.000Z",
  quantity: 1,
  extras: [
    { id: "extra-2", name: "Piña", price: 0 },
    { id: "extra-1", name: "Salsa extra", price: 5 }
  ],
  notes: "Sin cebolla por favor"
}
```

### 6.7 Impacto en el Total de la Orden

```typescript
// Al calcular el total de la orden:

const calculateOrderTotal = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, item) => {
    // Precio base del producto
    let itemTotal = item.priceClient * item.quantity;
    
    // Sumar extras
    if (item.extras && item.extras.length > 0) {
      const extrasTotal = item.extras.reduce((extraSum, extra) => 
        extraSum + extra.price, 0
      );
      itemTotal += extrasTotal * item.quantity;
    }
    
    return sum + itemTotal;
  }, 0);
  
  return subtotal;
};

// Ejemplo:
// OrderItem: Taco de Pastor x2
// - Precio base: 45 x 2 = 90
// - Extra Piña: 0 x 2 = 0
// - Extra Salsa: 5 x 2 = 10
// Total del item: 100
```

---

## 7. Flujo Visual Completo

### 7.1 Crear Extra Global

```
┌─────────────────────────────────────────┐
│ FORMULARIO (ExtraModal)                 │
├─────────────────────────────────────────┤
│ Nombre: "Salsa extra"                   │
│ Precio: 5                               │
│ ✅ Aplicar a todos los productos        │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ applicationType = "global"              │
│ categoryIds = []                        │
│ productIds = []                         │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ AppContext.addExtra()                   │
├─────────────────────────────────────────┤
│ ✅ Agregar a extras[]                   │
│ ❌ No actualizar categoryExtras         │
│ ❌ No actualizar productExtras          │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ RESULTADO                               │
├─────────────────────────────────────────┤
│ extras: [{ id, name, type: "global" }]  │
│ categoryExtras: Map {}                  │
│ productExtras: Map {}                   │
└─────────────────────────────────────────┘
```

### 7.2 Crear Extra por Categoría

```
┌─────────────────────────────────────────┐
│ FORMULARIO (ExtraModal)                 │
├─────────────────────────────────────────┤
│ Nombre: "Piña"                          │
│ Precio: 0                               │
│ ❌ Aplicar a todos                      │
│ ✅ Categorías: ["Tacos", "Tortas"]      │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ applicationType = "category"            │
│ categoryIds = ["cat-123", "cat-456"]    │
│ productIds = []                         │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ AppContext.addExtra()                   │
├─────────────────────────────────────────┤
│ ✅ Agregar a extras[]                   │
│ ✅ Actualizar categoryExtras            │
│    Map {                                │
│      "cat-123" => ["extra-id"],         │
│      "cat-456" => ["extra-id"]          │
│    }                                    │
│ ❌ No actualizar productExtras          │
└─────────────────────────────────────────┘
```

### 7.3 Crear Extra por Producto Individual

```
┌─────────────────────────────────────────┐
│ FORMULARIO (ExtraModal)                 │
├─────────────────────────────────────────┤
│ Nombre: "Piña"                          │
│ Precio: 0                               │
│ ❌ Aplicar a todos                      │
│ ❌ Categorías                           │
│ ✅ Productos: ["Pastor"]                │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ applicationType = "product"             │
│ categoryIds = []                        │
│ productIds = ["prod-789-pastor"]        │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ AppContext.addExtra()                   │
├─────────────────────────────────────────┤
│ ✅ Agregar a extras[]                   │
│ ❌ No actualizar categoryExtras         │
│ ✅ Actualizar productExtras             │
│    Map {                                │
│      "prod-789-pastor" => ["extra-id"]  │
│    }                                    │
└─────────────────────────────────────────┘
```

### 7.4 Aplicar Extras en Orden

```
MESERO TOMA ORDEN → Selecciona "Taco de Pastor"
              │
              ▼
┌─────────────────────────────────────────┐
│ ExtrasModal.tsx                         │
│ Producto: { id: "prod-789-pastor" }     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ FILTRAR EXTRAS DISPONIBLES              │
├─────────────────────────────────────────┤
│ 1. Buscar extras globales:              │
│    ✅ "Salsa extra" (global)            │
│                                         │
│ 2. Buscar en productExtras:             │
│    productExtras.get("prod-789-pastor") │
│    ✅ "Piña" (producto)                 │
│                                         │
│ 3. Buscar en categoryExtras:            │
│    categoryExtras.get("cat-123-tacos")  │
│    ✅ "Cebolla" (categoría)             │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ MOSTRAR EN UI:                          │
│ ☐ Salsa extra (+$5)                     │
│ ☐ Piña (Gratis)                         │
│ ☐ Cebolla (Gratis)                      │
└─────────────────────────────────────────┘
              │
              ▼ (Usuario selecciona)
┌─────────────────────────────────────────┐
│ USUARIO SELECCIONA:                     │
│ ✅ Piña                                 │
│ ✅ Salsa extra                          │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ selectedExtras = [                      │
│   { id: "extra-2", name: "Piña", price: 0 }, │
│   { id: "extra-1", name: "Salsa", price: 5 } │
│ ]                                       │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ CALCULAR TOTAL:                         │
│ - Taco Pastor: $45                      │
│ - Piña: $0                              │
│ - Salsa extra: $5                       │
│ ─────────────────                       │
│ TOTAL: $50                              │
└─────────────────────────────────────────┘
              │
              ▼ (Click "Agregar")
┌─────────────────────────────────────────┐
│ AGREGAR A ORDEN:                        │
│ OrderItem {                             │
│   ...producto,                          │
│   quantity: 1,                          │
│   extras: selectedExtras,               │
│   notes: "Sin cebolla"                  │
│ }                                       │
└─────────────────────────────────────────┘
```

---

## 🎯 Resumen de Tipos de Datos

### Variables Principales

| Variable | Tipo | Ubicación | Descripción |
|----------|------|-----------|-------------|
| `extras` | `Extra[]` | AppContext | Array de todos los extras |
| `categoryExtras` | `Map<string, string[]>` | AppContext | Relación categoría → extras |
| `productExtras` | `Map<string, string[]>` | AppContext | Relación producto → extras |
| `formData` | `object` | ExtraModal | Estado del formulario |
| `selectedExtras` | `Array<{id, name, price}>` | ExtrasModal | Extras seleccionados en orden |
| `availableExtras` | `Extra[]` | ExtrasModal | Extras filtrados para un producto |

### Valores de Variables

```typescript
// ✅ applicationType
type ApplicationType = 'global' | 'category' | 'product';

// ✅ Extra completo
interface Extra {
  id: string;              // "1736181234567" o UUID del backend
  name: string;            // "Piña", "Salsa extra"
  description: string;     // "Piña para tacos"
  price: number;           // 0, 5, 10
  applicationType: ApplicationType;
  active: boolean;         // true o false
  createdAt: Date;         // Fecha de creación
}

// ✅ categoryExtras Map
// Map<categoryId, extraId[]>
new Map([
  ["cat-123-tacos", ["extra-1", "extra-2"]],
  ["cat-456-tortas", ["extra-1"]]
])

// ✅ productExtras Map
// Map<productId, extraId[]>
new Map([
  ["prod-789-pastor", ["extra-2"]],
  ["prod-555-asada", ["extra-3"]]
])

// ✅ selectedExtras en orden
[
  { id: "extra-1", name: "Salsa extra", price: 5 },
  { id: "extra-2", name: "Piña", price: 0 }
]
```

---

**Fecha de última actualización**: Mayo 2026
