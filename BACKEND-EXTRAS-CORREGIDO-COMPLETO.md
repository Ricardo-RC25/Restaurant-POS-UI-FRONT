# Corrección Completa del Backend - API de Extras

## 🔴 Problema Identificado

**Error:** `Unknown column 'category' in 'field list'`

**Causa:** El código está insertando en la columna `category` pero la tabla tiene `category_id`.

---

## 📝 Archivos a Modificar

### 1. extraModel.js
### 2. extraController.js
### 3. extras.js (routes) - NO requiere cambios

---

## 1️⃣ extraModel.js (CÓDIGO COMPLETO CORREGIDO)

**Ubicación:** `backend/models/extraModel.js`

**Reemplaza TODO el contenido con este código:**

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
      [crypto.randomUUID(), categoryId, extraId]
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

### 🔧 Cambios Realizados en extraModel.js:

1. ✅ **Línea 61:** `category` → `category_id` en el INSERT
2. ✅ **Línea 63:** Parámetro renombrado: `categories` → `categoryIds`
3. ✅ **Línea 65:** Variable renombrada: `category` → `categoryId`
4. ✅ **Línea 75:** Parámetro renombrado: `products` → `productIds`
5. ✅ **Línea 77:** Variable renombrada: `product_id` → `productId`
6. ✅ **Línea 87-111:** GET ahora devuelve arrays `categories` y `products`

---

## 2️⃣ extraController.js (CÓDIGO COMPLETO CORREGIDO)

**Ubicación:** `backend/controllers/extraController.js`

**Reemplaza TODO el contenido con este código:**

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

### 🔧 Cambios Realizados en extraController.js:

1. ✅ Mejor manejo de errores con rollback completo
2. ✅ Validación de `application_type`
3. ✅ Manejo de `description` cuando es undefined
4. ✅ Logs mejorados para debugging
5. ✅ Comentarios descriptivos

---

## 3️⃣ extras.js (routes) - ✅ NO REQUIERE CAMBIOS

**Ubicación:** `backend/routes/extras.js`

**Este archivo está correcto, NO necesita modificación:**

```javascript
const express = require("express");
const router = express.Router();

const {
  createExtra,
  updateExtra,
  getExtras,
  deleteExtra,
} = require("../controllers/extraController");

router.get("/", getExtras);
router.post("/", createExtra);
router.put("/:id", updateExtra);
router.delete("/:id", deleteExtra);

module.exports = router;
```

---

## 📊 Comparación: Antes vs Después

### ❌ ANTES (Incorrecto):

```javascript
// extraModel.js - LÍNEA 57
const insertCategoryExtras = async (connection, extraId, categories) => {
  for (const category of categories) {
    await connection.query(
      `INSERT INTO category_extras (id, category, extra_id)  // ❌ 'category'
       VALUES (?, ?, ?)`,
      [crypto.randomUUID(), category, extraId]  // ❌ intenta insertar nombre
    );
  }
};
```

### ✅ DESPUÉS (Correcto):

```javascript
// extraModel.js - LÍNEA 61
const insertCategoryExtras = async (connection, extraId, categoryIds) => {
  for (const categoryId of categoryIds) {
    await connection.query(
      `INSERT INTO category_extras (id, category_id, extra_id)  // ✅ 'category_id'
       VALUES (?, ?, ?)`,
      [crypto.randomUUID(), categoryId, extraId]  // ✅ inserta UUID
    );
  }
};
```

---

## 🚀 Pasos para Aplicar la Corrección

### 1. **Detener el servidor backend**
```bash
# Presiona Ctrl+C en la terminal donde corre el backend
```

### 2. **Hacer respaldo (opcional pero recomendado)**
```bash
cd backend
cp models/extraModel.js models/extraModel.js.backup
cp controllers/extraController.js controllers/extraController.js.backup
```

### 3. **Reemplazar archivos**

Copia el contenido de este documento:

- Abre `backend/models/extraModel.js` → Pega el código del **apartado 1️⃣**
- Abre `backend/controllers/extraController.js` → Pega el código del **apartado 2️⃣**

### 4. **Reiniciar el servidor backend**
```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Servidor corriendo en puerto 3000
✅ Conectado a MySQL: restaurant_pos
```

### 5. **Probar la corrección**

**En el frontend:**
1. Ve a **Gestión → Extras**
2. Edita un extra existente
3. Cambia el tipo a "Por categoría"
4. Selecciona categorías (ej: Tacos, Tortas)
5. Guarda

**Debería funcionar sin error 500** ✅

---

## 🧪 Verificación en Postman

### PUT - Actualizar Extra por Categoría

```http
PUT http://localhost:3000/api/extras/4c4802ad-be90-4360-9bc6-dad27803bbf8
Content-Type: application/json

{
  "name": "Piña",
  "description": "Piña para tacos y tortas",
  "price": 0,
  "application_type": "category",
  "active": true,
  "categories": [
    "ec13171e-9303-483e-b886-6a5af966ed2d",
    "cat-00000002"
  ],
  "products": []
}
```

**Respuesta esperada:**
```json
{
  "message": "Extra actualizado correctamente"
}
```

### Verificar en MySQL:

```sql
-- Ver el extra actualizado
SELECT * FROM extras WHERE id = '4c4802ad-be90-4360-9bc6-dad27803bbf8';

-- Ver las relaciones creadas
SELECT 
  ce.id,
  ce.category_id,
  c.name AS category_name,
  ce.extra_id,
  e.name AS extra_name
FROM category_extras ce
INNER JOIN categories c ON ce.category_id = c.id
INNER JOIN extras e ON ce.extra_id = e.id
WHERE ce.extra_id = '4c4802ad-be90-4360-9bc6-dad27803bbf8';
```

**Resultado esperado:**
```
+--------------------------------------+--------------------------------------+---------------+--------------------------------------+------------+
| id                                   | category_id                          | category_name | extra_id                             | extra_name |
+--------------------------------------+--------------------------------------+---------------+--------------------------------------+------------+
| uuid-generado-1                      | ec13171e-9303-483e-b886-6a5af966ed2d | Tacos         | 4c4802ad-be90-4360-9bc6-dad27803bbf8 | Piña       |
| uuid-generado-2                      | cat-00000002                         | Tortas        | 4c4802ad-be90-4360-9bc6-dad27803bbf8 | Piña       |
+--------------------------------------+--------------------------------------+---------------+--------------------------------------+------------+
```

---

## 📋 Checklist de Verificación

Después de aplicar los cambios, verifica:

- [ ] Backend se inicia sin errores
- [ ] GET `/api/extras` devuelve extras con arrays `categories` y `products`
- [ ] POST crear extra global funciona
- [ ] POST crear extra por categoría funciona
- [ ] POST crear extra por producto funciona
- [ ] PUT actualizar extra funciona sin error 500
- [ ] DELETE eliminar extra funciona
- [ ] Frontend puede editar extras y marcar categorías/productos correctamente
- [ ] El mesero puede tomar órdenes y ver los extras filtrados correctamente

---

## 🎯 Resumen de la Corrección

### Problema:
```sql
INSERT INTO category_extras (id, category, extra_id)  -- ❌ columna 'category' no existe
```

### Solución:
```sql
INSERT INTO category_extras (id, category_id, extra_id)  -- ✅ columna 'category_id' existe
```

### Archivos Modificados:
1. ✅ `backend/models/extraModel.js` - 2 cambios principales
2. ✅ `backend/controllers/extraController.js` - Mejoras en validación y manejo de errores
3. ❌ `backend/routes/extras.js` - Sin cambios

---

**Fecha:** Mayo 2026  
**Versión:** Corrección completa de API de Extras
