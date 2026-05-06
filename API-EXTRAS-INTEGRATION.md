# Integración API de Extras - Correcciones y Guía Completa

## 📋 Índice

1. [Problemas Encontrados](#problemas-encontrados)
2. [Corrección de Base de Datos](#corrección-de-base-de-datos)
3. [Backend Corregido](#backend-corregido)
4. [Frontend Actualizado](#frontend-actualizado)
5. [Ejemplos de Requests/Responses](#ejemplos-de-requestsresponses)
6. [Flujo Completo](#flujo-completo)

---

## 1. Problemas Encontrados

### ⚠️ Problema 1: `category_extras` usa `category` (nombre) en lugar de `category_id`

**En tu código backend (extraModel.js):**

```javascript
// ❌ INCORRECTO - Línea insertCategoryExtras
const insertCategoryExtras = async (connection, extraId, categories) => {
  for (const category of categories) {
    await connection.query(
      `INSERT INTO category_extras (id, category, extra_id)  // ❌ 'category'
       VALUES (?, ?, ?)`,
      [crypto.randomUUID(), category, extraId]  // ❌ Intenta insertar nombre
    );
  }
};
```

**El problema:**
- El frontend envía `categoryIds` como **array de UUIDs**: `["cat-123", "cat-456"]`
- El backend intenta insertar en columna `category` que espera **nombres**: `"Tacos"`
- La tabla `category_extras` en tu esquema tiene columna `category` (VARCHAR) en lugar de `category_id`

**Impacto:**
- ❌ Al crear/editar extra por categoría, se insertan UUIDs en la columna que espera nombres
- ❌ Las consultas no pueden hacer JOIN con `categories.id`
- ❌ No hay integridad referencial (sin FK)

### ⚠️ Problema 2: GET no devuelve relaciones

**En tu código backend (extraModel.js):**

```javascript
// ❌ INCORRECTO - No devuelve categories ni products
const getAllExtras = async (db) => {
  const [rows] = await db.query(`
    SELECT *
    FROM extras
    ORDER BY created_at DESC
  `);
  return rows;
};
```

**El problema:**
- El frontend necesita saber qué categorías y productos están asociados a cada extra
- Sin esta información, el modal de edición no puede marcar los checkboxes correctos
- El frontend debe reconstruir los Maps `categoryExtras` y `productExtras`

**Ejemplo de lo que el frontend espera:**

```json
{
  "id": "extra-123",
  "name": "Piña",
  "application_type": "category",
  "categories": ["cat-id-1", "cat-id-2"],  // ✅ Necesario para el frontend
  "products": []
}
```

### ⚠️ Problema 3: Frontend envía `categoryIds` pero backend espera nombres

**En el frontend (AppContext.tsx línea ~1440):**

```typescript
// Frontend construye array de NOMBRES (incorrecto para nueva estructura)
if (extra.applicationType === 'category') {
  const categoryNames = (extra.categoryIds || []).map(catId => {
    const cat = categories.find(c => c.id === catId);
    return cat?.name || '';
  }).filter(name => name !== '');
  categories = categoryNames;  // ❌ Envía nombres
  products = [];
}
```

**El problema:**
- El frontend convierte IDs → nombres antes de enviar
- Debería enviar directamente los IDs
- La API debería recibir IDs, no nombres

---

## 2. Corrección de Base de Datos

### 2.1 Script SQL para Corregir `category_extras`

**EJECUTA ESTE SCRIPT EN TU BASE DE DATOS:**

```sql
-- ================================================================================
-- CORRECCIÓN: category_extras
-- Cambiar 'category' (nombre) por 'category_id' (UUID)
-- ================================================================================

USE restaurant_pos;

-- Paso 1: Eliminar tabla actual (si no tiene datos importantes)
DROP TABLE IF EXISTS category_extras;

-- Paso 2: Crear tabla con estructura CORRECTA
CREATE TABLE `category_extras` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL COMMENT 'ID de la categoría (FK)',
  `extra_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  -- Llaves foráneas
  CONSTRAINT `fk_category_extras_category`
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories`(`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  CONSTRAINT `fk_category_extras_extra`
    FOREIGN KEY (`extra_id`) 
    REFERENCES `extras`(`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  -- Índices
  UNIQUE KEY `unique_category_extra` (`category_id`, `extra_id`),
  KEY `idx_category_extras_category_id` (`category_id`),
  KEY `idx_category_extras_extra_id` (`extra_id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación entre extras y categorías';
```

### 2.2 Verificar Cambios

```sql
-- Verificar estructura de la tabla
DESCRIBE category_extras;

-- Resultado esperado:
-- +-------------+-------------+------+-----+-------------------+
-- | Field       | Type        | Null | Key | Default           |
-- +-------------+-------------+------+-----+-------------------+
-- | id          | varchar(36) | NO   | PRI | NULL              |
-- | category_id | varchar(36) | NO   | MUL | NULL              | ✅
-- | extra_id    | varchar(36) | NO   | MUL | NULL              |
-- | created_at  | timestamp   | NO   |     | CURRENT_TIMESTAMP |
-- +-------------+-------------+------+-----+-------------------+
```

---

## 3. Backend Corregido

### 3.1 extraModel.js (VERSIÓN CORREGIDA)

```javascript
const crypto = require("crypto");

/**
 * CREATE EXTRA
 */
const createExtra = async (connection, extra) => {
  await connection.query(
    `INSERT INTO extras 
    (id, name, description, price, application_type, active)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      extra.id,
      extra.name,
      extra.description || '',
      extra.price,
      extra.application_type,
      extra.active,
    ]
  );
};

/**
 * UPDATE EXTRA
 */
const updateExtra = async (connection, id, extra) => {
  await connection.query(
    `UPDATE extras SET
      name = ?,
      description = ?,
      price = ?,
      application_type = ?,
      active = ?
     WHERE id = ?`,
    [
      extra.name,
      extra.description || '',
      extra.price,
      extra.application_type,
      extra.active,
      id,
    ]
  );
};

/**
 * DELETE RELACIONES
 */
const deleteRelations = async (connection, extraId) => {
  await connection.query(
    `DELETE FROM category_extras WHERE extra_id = ?`,
    [extraId]
  );

  await connection.query(
    `DELETE FROM product_extras WHERE extra_id = ?`,
    [extraId]
  );
};

/**
 * INSERT CATEGORY RELATIONS
 * ✅ CORREGIDO: Usa category_id en lugar de category
 */
const insertCategoryExtras = async (connection, extraId, categoryIds) => {
  for (const categoryId of categoryIds) {
    await connection.query(
      `INSERT INTO category_extras (id, category_id, extra_id)
       VALUES (?, ?, ?)`,
      [crypto.randomUUID(), categoryId, extraId]  // ✅ categoryId (UUID)
    );
  }
};

/**
 * INSERT PRODUCT RELATIONS
 */
const insertProductExtras = async (connection, extraId, productIds) => {
  for (const productId of productIds) {
    await connection.query(
      `INSERT INTO product_extras (id, product_id, extra_id)
       VALUES (?, ?, ?)`,
      [crypto.randomUUID(), productId, extraId]
    );
  }
};

/**
 * GET ALL EXTRAS
 * ✅ CORREGIDO: Incluye relaciones con categories y products
 */
const getAllExtras = async (db) => {
  const [extras] = await db.query(`
    SELECT 
      e.id,
      e.name,
      e.description,
      e.price,
      e.application_type,
      e.active,
      e.created_at
    FROM extras e
    ORDER BY e.created_at DESC
  `);

  // Para cada extra, obtener sus relaciones
  for (const extra of extras) {
    // Obtener IDs de categorías relacionadas
    const [categoryRows] = await db.query(
      `SELECT category_id FROM category_extras WHERE extra_id = ?`,
      [extra.id]
    );
    extra.categories = categoryRows.map(row => row.category_id);

    // Obtener IDs de productos relacionados
    const [productRows] = await db.query(
      `SELECT product_id FROM product_extras WHERE extra_id = ?`,
      [extra.id]
    );
    extra.products = productRows.map(row => row.product_id);
  }

  return extras;
};

/**
 * DELETE EXTRA
 */
const deleteExtra = async (db, id) => {
  const [result] = await db.query(
    `DELETE FROM extras WHERE id = ?`,
    [id]
  );
  return result;
};

module.exports = {
  createExtra,
  updateExtra,
  deleteRelations,
  insertCategoryExtras,
  insertProductExtras,
  getAllExtras,
  deleteExtra,
};
```

**Cambios realizados:**

1. ✅ `insertCategoryExtras`: Ahora inserta en `category_id` en lugar de `category`
2. ✅ `getAllExtras`: Ahora devuelve arrays `categories` y `products` con los IDs
3. ✅ Renombré parámetro `categories` → `categoryIds` y `products` → `productIds` para claridad

### 3.2 extraController.js (VERSIÓN CORREGIDA)

```javascript
const crypto = require("crypto");
const db = require("../config/db");
const extraModel = require("../models/extraModel");

/**
 * CREATE EXTRA
 */
const createExtra = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      name,
      description,
      price,
      application_type,
      active,
      categories,  // Array de category_id (UUIDs)
      products,    // Array de product_id (UUIDs)
    } = req.body;

    // Validación
    if (!name || price === undefined) {
      await connection.rollback();
      return res.status(400).json({
        message: "name y price son obligatorios",
      });
    }

    if (!['global', 'category', 'product'].includes(application_type)) {
      await connection.rollback();
      return res.status(400).json({
        message: "application_type debe ser: global, category o product",
      });
    }

    const extraId = crypto.randomUUID();

    // 1. Crear extra
    await extraModel.createExtra(connection, {
      id: extraId,
      name,
      description: description || '',
      price,
      application_type: application_type || "global",
      active: active ?? true,
    });

    // 2. Insertar relaciones según tipo
    if (application_type === "category" && categories?.length) {
      await extraModel.insertCategoryExtras(connection, extraId, categories);
    }

    if (application_type === "product" && products?.length) {
      await extraModel.insertProductExtras(connection, extraId, products);
    }

    await connection.commit();

    console.log('✅ Extra creado:', {
      extraId,
      name,
      application_type,
      categories: categories?.length || 0,
      products: products?.length || 0,
    });

    res.status(201).json({
      message: "Extra creado correctamente",
      extraId,
    });

  } catch (error) {
    await connection.rollback();

    console.error("❌ Create extra error:", error);

    res.status(500).json({
      message: "Error creando extra",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });

  } finally {
    connection.release();
  }
};

/**
 * UPDATE EXTRA
 */
const updateExtra = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const {
      name,
      description,
      price,
      application_type,
      active,
      categories,  // Array de category_id (UUIDs)
      products,    // Array de product_id (UUIDs)
    } = req.body;

    // Validación
    if (application_type && !['global', 'category', 'product'].includes(application_type)) {
      await connection.rollback();
      return res.status(400).json({
        message: "application_type debe ser: global, category o product",
      });
    }

    // 1. Actualizar extra
    await extraModel.updateExtra(connection, id, {
      name,
      description: description || '',
      price,
      application_type,
      active,
    });

    // 2. Limpiar relaciones anteriores
    await extraModel.deleteRelations(connection, id);

    // 3. Insertar nuevas relaciones según tipo
    if (application_type === "category" && categories?.length) {
      await extraModel.insertCategoryExtras(connection, id, categories);
    }

    if (application_type === "product" && products?.length) {
      await extraModel.insertProductExtras(connection, id, products);
    }

    await connection.commit();

    console.log('✅ Extra actualizado:', {
      id,
      name,
      application_type,
      categories: categories?.length || 0,
      products: products?.length || 0,
    });

    res.json({
      message: "Extra actualizado correctamente",
    });

  } catch (error) {
    await connection.rollback();

    console.error("❌ Update extra error:", error);

    res.status(500).json({
      message: "Error actualizando extra",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });

  } finally {
    connection.release();
  }
};

/**
 * GET ALL EXTRAS
 */
const getExtras = async (req, res) => {
  try {
    const data = await extraModel.getAllExtras(db);

    console.log(`✅ Obtenidos ${data.length} extras`);

    res.json(data);
  } catch (error) {
    console.error("❌ Get extras error:", error);

    res.status(500).json({
      message: "Error obteniendo extras",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * DELETE EXTRA
 */
const deleteExtra = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await extraModel.deleteExtra(db, id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Extra no encontrado",
      });
    }

    console.log('✅ Extra eliminado:', id);

    res.json({
      message: "Extra eliminado",
    });

  } catch (error) {
    console.error("❌ Delete extra error:", error);

    res.status(500).json({
      message: "Error eliminando extra",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createExtra,
  updateExtra,
  getExtras,
  deleteExtra,
};
```

**Cambios realizados:**

1. ✅ Mejor manejo de errores con rollback
2. ✅ Validaciones de `application_type`
3. ✅ Logs para debugging
4. ✅ Manejo de `description` cuando es undefined

---

## 4. Frontend Actualizado

### 4.1 extrasService.ts (YA ESTÁ CORRECTO)

Tu archivo `src/app/services/extrasService.ts` ya está bien estructurado. Solo verifica que los tipos coincidan.

**Verificar que tienes:**

```typescript
interface CreateExtraRequest {
  name: string;
  description: string;
  price: number;
  application_type: 'global' | 'category' | 'product';
  active: boolean;
  categories: string[];  // ✅ Array de category IDs
  products: string[];    // ✅ Array de product IDs
}
```

### 4.2 AppContext.tsx - `addExtra` (CORREGIR)

**UBICACIÓN:** `src/app/context/AppContext.tsx` línea ~1437

**❌ VERSIÓN ACTUAL (INCORRECTA):**

```typescript
const addExtra = async (extra: Omit<Extra, 'id' | 'createdAt'> & { categoryIds?: string[]; productIds?: string[] }) => {
  let categories: string[] = [];
  let products: string[] = [];

  if (extra.applicationType === 'category') {
    // ❌ INCORRECTO: Convierte IDs → nombres
    const categoryNames = (extra.categoryIds || []).map(catId => {
      const cat = categories.find(c => c.id === catId);
      return cat?.name || '';
    }).filter(name => name !== '');
    categories = categoryNames;  // ❌ Envía nombres
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
    categories,  // ❌ Envía nombres
    products,
  });
  await reloadExtrasFromAPI();
};
```

**✅ VERSIÓN CORREGIDA:**

```typescript
const addExtra = async (extra: Omit<Extra, 'id' | 'createdAt'> & { categoryIds?: string[]; productIds?: string[] }) => {
  try {
    let categories: string[] = [];
    let products: string[] = [];

    // Determinar qué enviar según application_type
    if (extra.applicationType === 'category') {
      // ✅ CORRECTO: Enviar IDs directamente
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

    console.log('📡 [addExtra] Enviando a API:', {
      name: extra.name,
      application_type: extra.applicationType,
      categories,  // ✅ IDs
      products,    // ✅ IDs
    });

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

  } catch (error) {
    console.error('❌ Error al crear extra:', error);
    toast.error('Error al crear el extra. Intenta nuevamente.');
  }
};
```

### 4.3 AppContext.tsx - `updateExtra` (CORREGIR)

**UBICACIÓN:** `src/app/context/AppContext.tsx` línea ~1493

**✅ VERSIÓN CORREGIDA:**

```typescript
const updateExtra = async (id: string, updates: Partial<Extra> & { categoryIds?: string[]; productIds?: string[] }) => {
  try {
    let categories: string[] = [];
    let products: string[] = [];

    // Determinar qué enviar según application_type
    if (updates.applicationType === 'category') {
      // ✅ CORRECTO: Enviar IDs directamente
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

    console.log('📡 [updateExtra] Enviando a API:', {
      id,
      name: updates.name,
      application_type: updates.applicationType,
      categories,  // ✅ IDs
      products,    // ✅ IDs
    });

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

  } catch (error) {
    console.error('❌ Error al actualizar extra:', error);
    toast.error('Error al actualizar el extra. Intenta nuevamente.');
  }
};
```

### 4.4 AppContext.tsx - `reloadExtrasFromAPI` (CORREGIR)

**UBICACIÓN:** `src/app/context/AppContext.tsx`

**✅ VERSIÓN CORREGIDA:**

```typescript
const reloadExtrasFromAPI = async () => {
  try {
    console.log('🔄 [reloadExtrasFromAPI] Recargando extras desde API...');

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
        extra.categories.forEach(categoryId => {
          const current = newCategoryExtras.get(categoryId) || [];
          if (!current.includes(extra.id)) {
            newCategoryExtras.set(categoryId, [...current, extra.id]);
          }
        });
      }

      // Relaciones con productos
      if (extra.products && extra.products.length > 0) {
        extra.products.forEach(productId => {
          const current = newProductExtras.get(productId) || [];
          if (!current.includes(extra.id)) {
            newProductExtras.set(productId, [...current, extra.id]);
          }
        });
      }
    });

    setCategoryExtras(newCategoryExtras);
    setProductExtras(newProductExtras);

    // Guardar en localStorage
    localStorage.setItem('pos_extras', JSON.stringify(mappedExtras));
    localStorage.setItem('pos_category_extras', JSON.stringify(Object.fromEntries(newCategoryExtras)));
    localStorage.setItem('pos_product_extras', JSON.stringify(Object.fromEntries(newProductExtras)));

    console.log('✅ [reloadExtrasFromAPI] Extras recargados:', {
      totalExtras: mappedExtras.length,
      categoryExtras: newCategoryExtras.size,
      productExtras: newProductExtras.size,
    });

  } catch (error) {
    console.error('❌ [reloadExtrasFromAPI] Error:', error);
    throw error;
  }
};
```

### 4.5 AppContext.tsx - `deleteExtra` (CORREGIR)

**✅ VERSIÓN CORREGIDA:**

```typescript
const deleteExtra = async (id: string) => {
  try {
    console.log('🗑️ [deleteExtra] Eliminando extra:', id);

    await extrasService.deleteExtra(id);

    // Recargar desde API
    await reloadExtrasFromAPI();
    toast.success('Extra eliminado');

  } catch (error) {
    console.error('❌ Error al eliminar extra:', error);
    toast.error('Error al eliminar el extra. Intenta nuevamente.');
  }
};
```

---

## 5. Ejemplos de Requests/Responses

### 5.1 POST - Crear Extra Global

**Request:**
```http
POST http://localhost:3000/api/extras
Content-Type: application/json

{
  "name": "Salsa extra",
  "description": "Porción adicional de salsa",
  "price": 5,
  "application_type": "global",
  "active": true,
  "categories": [],
  "products": []
}
```

**Response:**
```json
{
  "message": "Extra creado correctamente",
  "extraId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Base de datos:**
```sql
-- extras
INSERT INTO extras VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Salsa extra',
  'Porción adicional de salsa',
  5.00,
  'global',
  1,
  NOW(),
  NOW()
);

-- category_extras: NO se inserta nada
-- product_extras: NO se inserta nada
```

### 5.2 POST - Crear Extra por Categoría

**Request:**
```http
POST http://localhost:3000/api/extras
Content-Type: application/json

{
  "name": "Piña",
  "description": "Piña natural",
  "price": 0,
  "application_type": "category",
  "active": true,
  "categories": [
    "cat-00000001",
    "cat-00000002"
  ],
  "products": []
}
```

**Response:**
```json
{
  "message": "Extra creado correctamente",
  "extraId": "660e8400-e29b-41d4-a716-446655440111"
}
```

**Base de datos:**
```sql
-- extras
INSERT INTO extras VALUES (
  '660e8400-e29b-41d4-a716-446655440111',
  'Piña',
  'Piña natural',
  0.00,
  'category',
  1,
  NOW(),
  NOW()
);

-- category_extras (2 registros)
INSERT INTO category_extras VALUES (
  UUID(),
  'cat-00000001',  -- ✅ category_id (UUID)
  '660e8400-e29b-41d4-a716-446655440111',
  NOW()
);

INSERT INTO category_extras VALUES (
  UUID(),
  'cat-00000002',  -- ✅ category_id (UUID)
  '660e8400-e29b-41d4-a716-446655440111',
  NOW()
);

-- product_extras: NO se inserta nada
```

### 5.3 POST - Crear Extra por Producto

**Request:**
```http
POST http://localhost:3000/api/extras
Content-Type: application/json

{
  "name": "Cebolla morada",
  "description": "Cebolla morada curtida",
  "price": 0,
  "application_type": "product",
  "active": true,
  "categories": [],
  "products": [
    "prod-001-pastor",
    "prod-002-asada"
  ]
}
```

**Response:**
```json
{
  "message": "Extra creado correctamente",
  "extraId": "770e8400-e29b-41d4-a716-446655440222"
}
```

**Base de datos:**
```sql
-- extras
INSERT INTO extras VALUES (
  '770e8400-e29b-41d4-a716-446655440222',
  'Cebolla morada',
  'Cebolla morada curtida',
  0.00,
  'product',
  1,
  NOW(),
  NOW()
);

-- category_extras: NO se inserta nada

-- product_extras (2 registros)
INSERT INTO product_extras VALUES (
  UUID(),
  'prod-001-pastor',  -- ✅ product_id (UUID)
  '770e8400-e29b-41d4-a716-446655440222',
  NOW()
);

INSERT INTO product_extras VALUES (
  UUID(),
  'prod-002-asada',  -- ✅ product_id (UUID)
  '770e8400-e29b-41d4-a716-446655440222',
  NOW()
);
```

### 5.4 GET - Obtener Todos los Extras

**Request:**
```http
GET http://localhost:3000/api/extras
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Salsa extra",
    "description": "Porción adicional de salsa",
    "price": "5.00",
    "application_type": "global",
    "active": 1,
    "created_at": "2026-05-06T10:30:00.000Z",
    "categories": [],
    "products": []
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "name": "Piña",
    "description": "Piña natural",
    "price": "0.00",
    "application_type": "category",
    "active": 1,
    "created_at": "2026-05-06T10:35:00.000Z",
    "categories": [
      "cat-00000001",
      "cat-00000002"
    ],
    "products": []
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "name": "Cebolla morada",
    "description": "Cebolla morada curtida",
    "price": "0.00",
    "application_type": "product",
    "active": 1,
    "created_at": "2026-05-06T10:40:00.000Z",
    "categories": [],
    "products": [
      "prod-001-pastor",
      "prod-002-asada"
    ]
  }
]
```

**Nota:** Los campos `categories` y `products` ahora contienen los IDs ✅

### 5.5 PUT - Actualizar Extra

**Request:**
```http
PUT http://localhost:3000/api/extras/660e8400-e29b-41d4-a716-446655440111
Content-Type: application/json

{
  "name": "Piña",
  "description": "Piña natural en rodajas",
  "price": 0,
  "application_type": "product",
  "active": true,
  "categories": [],
  "products": [
    "prod-001-pastor"
  ]
}
```

**Response:**
```json
{
  "message": "Extra actualizado correctamente"
}
```

**Base de datos (cambios):**
```sql
-- 1. Actualiza extras
UPDATE extras SET
  name = 'Piña',
  description = 'Piña natural en rodajas',
  price = 0.00,
  application_type = 'product',  -- Cambió de 'category' a 'product'
  active = 1
WHERE id = '660e8400-e29b-41d4-a716-446655440111';

-- 2. Elimina relaciones anteriores
DELETE FROM category_extras WHERE extra_id = '660e8400-e29b-41d4-a716-446655440111';
DELETE FROM product_extras WHERE extra_id = '660e8400-e29b-41d4-a716-446655440111';

-- 3. Inserta nuevas relaciones
INSERT INTO product_extras VALUES (
  UUID(),
  'prod-001-pastor',
  '660e8400-e29b-41d4-a716-446655440111',
  NOW()
);
```

### 5.6 DELETE - Eliminar Extra

**Request:**
```http
DELETE http://localhost:3000/api/extras/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "message": "Extra eliminado"
}
```

**Base de datos:**
```sql
-- 1. Las relaciones se eliminan automáticamente (CASCADE)
-- DELETE FROM category_extras WHERE extra_id = '550e8400-e29b-41d4-a716-446655440000';
-- DELETE FROM product_extras WHERE extra_id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Elimina el extra
DELETE FROM extras WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## 6. Flujo Completo

### 6.1 Crear Extra por Categoría (Taco + Tortas)

```
FRONTEND (ExtraModal)
│
├─ Usuario llena formulario:
│  - Nombre: "Piña"
│  - Precio: 0
│  - ✅ Categorías: Tacos, Tortas
│
├─ onClick "Guardar"
│  └─ Determina applicationType = "category"
│  └─ Construye dataToSave:
│     {
│       name: "Piña",
│       price: 0,
│       applicationType: "category",
│       categoryIds: ["cat-123", "cat-456"],
│       productIds: []
│     }
│
└─ onSave(dataToSave)
    │
    ▼
┌────────────────────────────────────────────────────┐
│ AppContext.addExtra()                              │
├────────────────────────────────────────────────────┤
│ // Determinar arrays a enviar                      │
│ if (applicationType === 'category') {              │
│   categories = categoryIds  // ✅ ["cat-123", ...] │
│   products = []                                    │
│ }                                                  │
│                                                    │
│ // Llamar API                                      │
│ await extrasService.createExtra({                  │
│   name: "Piña",                                    │
│   application_type: "category",                    │
│   categories: ["cat-123", "cat-456"],  // ✅ IDs   │
│   products: []                                     │
│ })                                                 │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ BACKEND (extraController.createExtra)              │
├────────────────────────────────────────────────────┤
│ const extraId = UUID()                             │
│                                                    │
│ // 1. Insertar en extras                           │
│ await extraModel.createExtra(connection, {         │
│   id: extraId,                                     │
│   name: "Piña",                                    │
│   application_type: "category"                     │
│ })                                                 │
│                                                    │
│ // 2. Insertar relaciones                          │
│ await extraModel.insertCategoryExtras(             │
│   connection,                                      │
│   extraId,                                         │
│   ["cat-123", "cat-456"]  // ✅ IDs                │
│ )                                                  │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ BASE DE DATOS                                      │
├────────────────────────────────────────────────────┤
│ INSERT INTO extras VALUES (                        │
│   'extra-id',                                      │
│   'Piña',                                          │
│   ...,                                             │
│   'category'                                       │
│ )                                                  │
│                                                    │
│ INSERT INTO category_extras VALUES (               │
│   UUID(),                                          │
│   'cat-123',  -- ✅ category_id                    │
│   'extra-id'                                       │
│ )                                                  │
│                                                    │
│ INSERT INTO category_extras VALUES (               │
│   UUID(),                                          │
│   'cat-456',  -- ✅ category_id                    │
│   'extra-id'                                       │
│ )                                                  │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ FRONTEND (AppContext.reloadExtrasFromAPI)          │
├────────────────────────────────────────────────────┤
│ // GET /api/extras                                 │
│ const apiExtras = await extrasService.getExtras()  │
│                                                    │
│ // Reconstruir Maps                                │
│ categoryExtras = Map {                             │
│   "cat-123" => ["extra-id"],                       │
│   "cat-456" => ["extra-id"]                        │
│ }                                                  │
│                                                    │
│ productExtras = Map {}                             │
└────────────────────────────────────────────────────┘
```

### 6.2 Tomar Orden (Mesero selecciona producto)

```
MESERO SELECCIONA: "Taco de Pastor"
│
├─ Producto: { id: "prod-001-pastor", categoryId: "cat-123" }
│
└─ Abre ExtrasModal
    │
    ▼
┌────────────────────────────────────────────────────┐
│ ExtrasModal - Filtrar extras disponibles           │
├────────────────────────────────────────────────────┤
│ const availableExtras = extras.filter(extra => {   │
│                                                    │
│   // ✅ Extra global                               │
│   if (extra.applicationType === 'global')          │
│     return true                                    │
│                                                    │
│   // ✅ Extra por categoría                        │
│   if (extra.applicationType === 'category') {      │
│     const categoryExtraIds =                       │
│       categoryExtras.get("cat-123") || []          │
│     return categoryExtraIds.includes(extra.id)     │
│   }                                                │
│                                                    │
│   // ✅ Extra por producto                         │
│   if (extra.applicationType === 'product') {       │
│     const productExtraIds =                        │
│       productExtras.get("prod-001-pastor") || []   │
│     return productExtraIds.includes(extra.id)      │
│   }                                                │
│ })                                                 │
│                                                    │
│ // Resultado:                                      │
│ availableExtras = [                                │
│   { id: "extra-001", name: "Salsa extra" },        │
│   { id: "extra-002", name: "Piña" },  // De cat-123│
│ ]                                                  │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ UI - Mesero ve y selecciona extras                 │
├────────────────────────────────────────────────────┤
│ ☐ Salsa extra (+$5)                                │
│ ☑ Piña (Gratis)                                    │
│                                                    │
│ selectedExtras = [                                 │
│   { id: "extra-002", name: "Piña", price: 0 }      │
│ ]                                                  │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ Agregar a orden                                    │
├────────────────────────────────────────────────────┤
│ OrderItem {                                        │
│   ...producto,                                     │
│   quantity: 1,                                     │
│   extras: [                                        │
│     { id: "extra-002", name: "Piña", price: 0 }    │
│   ],                                               │
│   notes: ""                                        │
│ }                                                  │
│                                                    │
│ Total: $45 (producto) + $0 (piña) = $45            │
└────────────────────────────────────────────────────┘
```

---

## 7. Resumen de Cambios

### ✅ Base de Datos

1. **Modificar `category_extras`:**
   - Cambiar `category` (VARCHAR) → `category_id` (VARCHAR(36))
   - Agregar FK: `category_id` → `categories.id`

### ✅ Backend

1. **extraModel.js:**
   - `insertCategoryExtras`: Usar `category_id` en INSERT
   - `getAllExtras`: Devolver arrays `categories` y `products` con IDs

2. **extraController.js:**
   - Mejorar validaciones
   - Agregar logs para debugging

### ✅ Frontend

1. **AppContext.tsx:**
   - `addExtra`: Enviar `categoryIds` directamente (sin convertir a nombres)
   - `updateExtra`: Enviar `categoryIds` directamente
   - `reloadExtrasFromAPI`: Reconstruir Maps desde respuesta de API
   - `deleteExtra`: Usar API

2. **extrasService.ts:**
   - Ya está correcto ✅

---

## 8. Checklist de Implementación

- [ ] Ejecutar script SQL para modificar `category_extras`
- [ ] Actualizar `extraModel.js` (insertCategoryExtras + getAllExtras)
- [ ] Actualizar `extraController.js` (validaciones + logs)
- [ ] Actualizar `AppContext.tsx` (addExtra + updateExtra + reloadExtrasFromAPI)
- [ ] Probar crear extra global
- [ ] Probar crear extra por categoría
- [ ] Probar crear extra por producto
- [ ] Probar editar extra (cambiar de tipo)
- [ ] Probar eliminar extra
- [ ] Probar flujo de mesero (tomar orden con extras)
- [ ] Verificar que los extras se muestran correctamente según producto

---

**Fecha de última actualización**: Mayo 2026
