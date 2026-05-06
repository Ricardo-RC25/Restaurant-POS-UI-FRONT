# Esquema de Base de Datos para Sistema de Extras

## 📋 Índice

1. [Tablas Necesarias](#tablas-necesarias)
2. [⚠️ PROBLEMA CRÍTICO Encontrado](#problema-crítico-encontrado)
3. [Solución: Modificar `category_extras`](#solución-modificar-category_extras)
4. [Script SQL Completo](#script-sql-completo)
5. [Relaciones y Llaves Foráneas](#relaciones-y-llaves-foráneas)
6. [Diagrama ER](#diagrama-er)
7. [Ejemplos de Datos](#ejemplos-de-datos)

---

## 1. Tablas Necesarias

Para que el sistema de extras funcione correctamente necesitas **3 tablas**:

### ✅ Tabla 1: `extras`

**Ya existe en tu esquema** (línea 176-197) ✅

```sql
CREATE TABLE `extras` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `application_type` ENUM('global', 'category', 'product') NOT NULL DEFAULT 'global',
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_extras_active` (`active`),
  KEY `idx_extras_application_type` (`application_type`),

  CONSTRAINT `chk_extras_price` 
    CHECK (`price` >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Extras disponibles para productos';
```

**Campos:**
- `id`: VARCHAR(36) - UUID del extra
- `name`: VARCHAR(100) - Nombre del extra (ej: "Piña", "Salsa extra")
- `description`: TEXT - Descripción opcional
- `price`: DECIMAL(10,2) - Precio adicional (puede ser 0.00)
- `application_type`: ENUM - Tipo: 'global', 'category', 'product'
- `active`: BOOLEAN - Si está disponible para usar
- `created_at`: TIMESTAMP - Fecha de creación
- `updated_at`: TIMESTAMP - Última actualización

---

### ⚠️ Tabla 2: `category_extras` (TIENE PROBLEMA)

**Ya existe en tu esquema** (línea 207-220) pero **TIENE UN PROBLEMA CRÍTICO** ⚠️

```sql
-- ❌ VERSIÓN ACTUAL (INCORRECTA)
CREATE TABLE `category_extras` (
  `id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT 'Nombre de la categoría',  -- ❌ PROBLEMA AQUÍ
  `extra_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`extra_id`) REFERENCES `extras`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_category_extra` (`category`, `extra_id`),  -- ❌ PROBLEMA AQUÍ
  KEY `idx_category_extras_category` (`category`),
  KEY `idx_category_extras_extra_id` (`extra_id`)
  
) ENGINE=InnoDB;
```

**Problema:** Está usando el **NOMBRE** de la categoría (`VARCHAR`) en lugar del **ID** (`category_id`).

---

### ✅ Tabla 3: `product_extras`

**Ya existe en tu esquema** (línea 226-240) ✅

```sql
CREATE TABLE `product_extras` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `extra_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`extra_id`) REFERENCES `extras`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_product_extra` (`product_id`, `extra_id`),
  KEY `idx_product_extras_product_id` (`product_id`),
  KEY `idx_product_extras_extra_id` (`extra_id`)
  
) ENGINE=InnoDB;
```

**Campos:**
- `id`: VARCHAR(36) - UUID de la relación
- `product_id`: VARCHAR(36) - ID del producto (FK → `menu_items.id`)
- `extra_id`: VARCHAR(36) - ID del extra (FK → `extras.id`)
- `created_at`: TIMESTAMP - Fecha de creación

**Esta tabla está CORRECTA** ✅

---

## 2. ⚠️ PROBLEMA CRÍTICO Encontrado

### El Problema

La tabla `category_extras` está usando el **nombre de la categoría** como string:

```sql
`category` VARCHAR(50) NOT NULL COMMENT 'Nombre de la categoría'
```

### ¿Por qué es un problema?

#### 1. **Inconsistencia con el Frontend**

En el frontend (AppContext.tsx), `categoryExtras` es un Map que usa el **categoryId** (UUID):

```typescript
// Frontend usa categoryId
const categoryExtras: Map<string, string[]>
// Map {
//   "e3f4b2c1-8a7d-4c5e-9f1a-2b3c4d5e6f7a" => ["extra-123", "extra-456"]
// }
```

Pero la base de datos actual guarda el **nombre**:

```sql
-- Base de datos guarda el nombre
INSERT INTO category_extras (id, category, extra_id) VALUES
('rel-1', 'Tacos', 'extra-123');  -- ❌ Usa nombre "Tacos"
```

#### 2. **Sin Integridad Referencial**

No hay una llave foránea hacia la tabla `categories`, entonces:

- ✅ Puedes insertar `category = "Pizza"` aunque no exista esa categoría
- ✅ Puedes cambiar el nombre de una categoría y las relaciones quedan rotas
- ❌ No hay validación de que la categoría exista

```sql
-- Esto es válido aunque "Pizza" no exista:
INSERT INTO category_extras (id, category, extra_id) VALUES
(UUID(), 'Pizza', 'extra-123');  -- ❌ No hay validación
```

#### 3. **Problemas al Renombrar Categorías**

Si cambias el nombre de una categoría:

```sql
-- Cambiar nombre de categoría
UPDATE categories SET name = 'Tacos Tradicionales' WHERE name = 'Tacos';
```

Las relaciones en `category_extras` quedan rotas porque siguen apuntando al nombre antiguo:

```sql
-- Ahora estas relaciones son inválidas:
SELECT * FROM category_extras WHERE category = 'Tacos';
-- Ya no coinciden porque ahora se llama "Tacos Tradicionales"
```

#### 4. **Búsquedas Ineficientes**

El frontend busca por `categoryId` pero la base de datos tiene el `nombre`:

```typescript
// Frontend
const categoryExtraIds = categoryExtras.get(item.categoryId) || [];

// Backend necesitaría hacer JOIN para convertir ID → nombre
SELECT ce.extra_id 
FROM category_extras ce
INNER JOIN categories c ON ce.category = c.name  -- ❌ JOIN por nombre
WHERE c.id = 'e3f4b2c1-8a7d-4c5e-9f1a-2b3c4d5e6f7a';
```

---

## 3. Solución: Modificar `category_extras`

### 3.1 Script para Modificar la Tabla

**IMPORTANTE:** Ejecuta este script en tu base de datos MySQL:

```sql
-- ================================================================================
-- MODIFICACIÓN: category_extras
-- Cambiar de `category` (nombre) a `category_id` (UUID)
-- ================================================================================

USE restaurant_pos;

-- Paso 1: Crear tabla temporal con la estructura correcta
CREATE TABLE `category_extras_new` (
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
COMMENT='Relación entre extras y categorías - Usa category_id en lugar de nombre';

-- Paso 2: Migrar datos existentes (si los hay)
-- Convertir nombre de categoría → category_id
INSERT INTO category_extras_new (id, category_id, extra_id, created_at)
SELECT 
  ce.id,
  c.id AS category_id,  -- Convertir nombre → ID
  ce.extra_id,
  ce.created_at
FROM category_extras ce
INNER JOIN categories c ON ce.category = c.name;

-- Paso 3: Eliminar tabla antigua
DROP TABLE category_extras;

-- Paso 4: Renombrar tabla nueva
RENAME TABLE category_extras_new TO category_extras;
```

### 3.2 Estructura CORRECTA de `category_extras`

```sql
-- ✅ VERSIÓN CORRECTA
CREATE TABLE `category_extras` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL COMMENT 'ID de la categoría (FK)',  -- ✅ Usa ID
  `extra_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  -- ✅ Llave foránea hacia categories
  CONSTRAINT `fk_category_extras_category`
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories`(`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  -- ✅ Llave foránea hacia extras
  CONSTRAINT `fk_category_extras_extra`
    FOREIGN KEY (`extra_id`) 
    REFERENCES `extras`(`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  -- ✅ Índice único por category_id + extra_id
  UNIQUE KEY `unique_category_extra` (`category_id`, `extra_id`),
  KEY `idx_category_extras_category_id` (`category_id`),
  KEY `idx_category_extras_extra_id` (`extra_id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación entre extras y categorías';
```

**Campos:**
- `id`: VARCHAR(36) - UUID de la relación
- `category_id`: VARCHAR(36) - **ID de la categoría** (FK → `categories.id`) ✅
- `extra_id`: VARCHAR(36) - ID del extra (FK → `extras.id`)
- `created_at`: TIMESTAMP - Fecha de creación

---

## 4. Script SQL Completo

### 4.1 Crear las 3 Tablas (Versión Correcta)

```sql
-- ================================================================================
-- SISTEMA DE EXTRAS - VERSIÓN CORRECTA
-- ================================================================================

USE restaurant_pos;

-- ============================================================
-- Tabla 1: extras
-- ============================================================
CREATE TABLE IF NOT EXISTS `extras` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `application_type` ENUM('global', 'category', 'product') NOT NULL DEFAULT 'global',
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_extras_active` (`active`),
  KEY `idx_extras_application_type` (`application_type`),

  CONSTRAINT `chk_extras_price` 
    CHECK (`price` >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Extras disponibles para productos';


-- ============================================================
-- Tabla 2: category_extras (VERSIÓN CORRECTA)
-- ============================================================
CREATE TABLE IF NOT EXISTS `category_extras` (
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


-- ============================================================
-- Tabla 3: product_extras
-- ============================================================
CREATE TABLE IF NOT EXISTS `product_extras` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `extra_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  -- Llaves foráneas
  CONSTRAINT `fk_product_extras_product`
    FOREIGN KEY (`product_id`) 
    REFERENCES `menu_items`(`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  CONSTRAINT `fk_product_extras_extra`
    FOREIGN KEY (`extra_id`) 
    REFERENCES `extras`(`id`) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  
  -- Índices
  UNIQUE KEY `unique_product_extra` (`product_id`, `extra_id`),
  KEY `idx_product_extras_product_id` (`product_id`),
  KEY `idx_product_extras_extra_id` (`extra_id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación entre extras y productos específicos';
```

---

## 5. Relaciones y Llaves Foráneas

### 5.1 Diagrama de Relaciones

```
┌─────────────────┐
│   categories    │
│─────────────────│
│ id (PK)         │◄────────┐
│ name            │         │
│ description     │         │ FK
│ active          │         │
└─────────────────┘         │
                            │
                            │
┌─────────────────┐         │
│   menu_items    │         │
│─────────────────│         │
│ id (PK)         │◄────────┼───────┐
│ name            │         │       │
│ category_id (FK)│─────────┘       │
│ price_client    │                 │ FK
│ active          │                 │
└─────────────────┘                 │
                                    │
                                    │
┌─────────────────┐                 │
│     extras      │                 │
│─────────────────│                 │
│ id (PK)         │◄────────┬───────┼───────┐
│ name            │         │       │       │
│ price           │         │ FK    │ FK    │ FK
│ application_type│         │       │       │
│ active          │         │       │       │
└─────────────────┘         │       │       │
                            │       │       │
                ┌───────────┘       │       │
                │                   │       │
    ┌───────────────────────┐       │       │
    │  category_extras      │       │       │
    │───────────────────────│       │       │
    │ id (PK)               │       │       │
    │ category_id (FK)      │───────┘       │
    │ extra_id (FK)         │───────────────┘
    │ created_at            │
    └───────────────────────┘
    
    
    ┌───────────────────────┐
    │  product_extras       │
    │───────────────────────│
    │ id (PK)               │
    │ product_id (FK)       │───────────────────┘
    │ extra_id (FK)         │───────────────────────┘
    │ created_at            │
    └───────────────────────┘
```

### 5.2 Llaves Foráneas (Foreign Keys)

| Tabla | Campo | Referencia | ON DELETE | ON UPDATE |
|-------|-------|------------|-----------|-----------|
| `category_extras` | `category_id` | `categories.id` | CASCADE | CASCADE |
| `category_extras` | `extra_id` | `extras.id` | CASCADE | CASCADE |
| `product_extras` | `product_id` | `menu_items.id` | CASCADE | CASCADE |
| `product_extras` | `extra_id` | `extras.id` | CASCADE | CASCADE |

**Explicación de CASCADE:**

- **ON DELETE CASCADE**: Si eliminas una categoría, se eliminan automáticamente sus relaciones en `category_extras`
- **ON UPDATE CASCADE**: Si cambias el ID de un extra, se actualiza automáticamente en las tablas de relación

### 5.3 Índices Únicos (UNIQUE)

| Tabla | Índice | Campos | Propósito |
|-------|--------|--------|-----------|
| `category_extras` | `unique_category_extra` | (`category_id`, `extra_id`) | Evitar duplicados |
| `product_extras` | `unique_product_extra` | (`product_id`, `extra_id`) | Evitar duplicados |

**Ejemplo de cómo funciona:**

```sql
-- ✅ Válido: Primera inserción
INSERT INTO category_extras (id, category_id, extra_id) VALUES
(UUID(), 'cat-123-tacos', 'extra-456-piña');

-- ❌ Error: Duplicado
INSERT INTO category_extras (id, category_id, extra_id) VALUES
(UUID(), 'cat-123-tacos', 'extra-456-piña');
-- Error: Duplicate entry 'cat-123-tacos-extra-456-piña' for key 'unique_category_extra'
```

---

## 6. Diagrama ER (Entity-Relationship)

```
             ┌──────────────────────────────────────────┐
             │                                          │
             │         SISTEMA DE EXTRAS                │
             │                                          │
             └──────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    EXTRAS     │     │   CATEGORIES  │     │  MENU_ITEMS   │
│    (Tabla)    │     │    (Tabla)    │     │    (Tabla)    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        │                     │                     │
        │         ┌───────────┘                     │
        │         │                                 │
        │         ▼                                 │
        │  ┌─────────────────┐                     │
        │  │ category_extras │                     │
        └─►│   (Relación)    │                     │
           │  1:N con extras │                     │
           │  N:1 con categ. │                     │
           └─────────────────┘                     │
                                                    │
        ┌───────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ product_extras  │
│   (Relación)    │
│  1:N con extras │
│  N:1 con prod.  │
└─────────────────┘


CARDINALIDAD:

extras (1) ──────── (N) category_extras (N) ──────── (1) categories
  └──── Un extra puede estar en varias categorías
  └──── Una categoría puede tener varios extras

extras (1) ──────── (N) product_extras (N) ──────── (1) menu_items
  └──── Un extra puede estar en varios productos
  └──── Un producto puede tener varios extras
```

---

## 7. Ejemplos de Datos

### 7.1 Ejemplo: Extra Global

```sql
-- Insertar extra "Salsa extra" que aplica a TODOS los productos
INSERT INTO extras (id, name, description, price, application_type, active)
VALUES (
  'extra-001-salsa',
  'Salsa extra',
  'Porción adicional de salsa',
  5.00,
  'global',  -- ✅ Aplica a todos
  TRUE
);

-- NO se insertan relaciones en category_extras ni product_extras
-- Porque es 'global', ya aplica a todo
```

**Resultado:**
- ✅ extras: 1 registro
- ❌ category_extras: 0 registros
- ❌ product_extras: 0 registros

### 7.2 Ejemplo: Extra por Categoría

```sql
-- Paso 1: Insertar el extra
INSERT INTO extras (id, name, description, price, application_type, active)
VALUES (
  'extra-002-piña',
  'Piña',
  'Piña para tacos y tortas',
  0.00,
  'category',  -- ✅ Aplica a categorías específicas
  TRUE
);

-- Paso 2: Relacionar con categorías
-- Categoría "Tacos"
INSERT INTO category_extras (id, category_id, extra_id)
VALUES (
  UUID(),
  'cat-123-tacos',      -- ✅ ID de la categoría (no nombre)
  'extra-002-piña'
);

-- Categoría "Tortas"
INSERT INTO category_extras (id, category_id, extra_id)
VALUES (
  UUID(),
  'cat-456-tortas',     -- ✅ ID de la categoría (no nombre)
  'extra-002-piña'
);
```

**Resultado:**
- ✅ extras: 1 registro
- ✅ category_extras: 2 registros (Tacos + Tortas)
- ❌ product_extras: 0 registros

### 7.3 Ejemplo: Extra por Producto Individual

```sql
-- Paso 1: Insertar el extra
INSERT INTO extras (id, name, description, price, application_type, active)
VALUES (
  'extra-003-piña-pastor',
  'Piña',
  'Piña especial para tacos de pastor',
  0.00,
  'product',  -- ✅ Aplica a productos específicos
  TRUE
);

-- Paso 2: Relacionar con producto "Taco de Pastor"
INSERT INTO product_extras (id, product_id, extra_id)
VALUES (
  UUID(),
  'prod-789-pastor',        -- ✅ ID del producto
  'extra-003-piña-pastor'
);
```

**Resultado:**
- ✅ extras: 1 registro
- ❌ category_extras: 0 registros
- ✅ product_extras: 1 registro (solo Pastor)

### 7.4 Ejemplo Completo: Base de Datos con Datos

```sql
-- ================================================================================
-- DATOS DE EJEMPLO COMPLETOS
-- ================================================================================

-- Limpiar tablas
DELETE FROM product_extras;
DELETE FROM category_extras;
DELETE FROM extras;

-- ============================================================
-- EXTRA 1: Global (aplica a todos los productos)
-- ============================================================
INSERT INTO extras (id, name, description, price, application_type, active)
VALUES (
  'extra-001-salsa',
  'Salsa extra',
  'Porción adicional de salsa de cualquier tipo',
  5.00,
  'global',
  TRUE
);
-- No se insertan relaciones porque es global


-- ============================================================
-- EXTRA 2: Por categoría (Tacos y Tortas)
-- ============================================================
INSERT INTO extras (id, name, description, price, application_type, active)
VALUES (
  'extra-002-piña',
  'Piña',
  'Piña natural en rodajas',
  0.00,
  'category',
  TRUE
);

-- Relacionar con categorías
INSERT INTO category_extras (id, category_id, extra_id, created_at) VALUES
(UUID(), 'cat-00000001', 'extra-002-piña', NOW()),  -- Tacos
(UUID(), 'cat-00000003', 'extra-002-piña', NOW());  -- Postres (suponiendo que existe)


-- ============================================================
-- EXTRA 3: Por producto individual (solo Pastor)
-- ============================================================
INSERT INTO extras (id, name, description, price, application_type, active)
VALUES (
  'extra-003-cebolla-morada',
  'Cebolla morada',
  'Cebolla morada curtida especial',
  0.00,
  'product',
  TRUE
);

-- Suponiendo que tienes un producto "Taco de Pastor" con ID 'prod-001-pastor'
INSERT INTO product_extras (id, product_id, extra_id, created_at) VALUES
(UUID(), 'prod-001-pastor', 'extra-003-cebolla-morada', NOW());


-- ============================================================
-- VERIFICAR DATOS
-- ============================================================

-- Ver todos los extras
SELECT * FROM extras;

-- Ver relaciones con categorías
SELECT 
  ce.id,
  c.name AS category_name,
  c.id AS category_id,
  e.name AS extra_name,
  e.price
FROM category_extras ce
INNER JOIN categories c ON ce.category_id = c.id
INNER JOIN extras e ON ce.extra_id = e.id;

-- Ver relaciones con productos
SELECT 
  pe.id,
  mi.name AS product_name,
  mi.id AS product_id,
  e.name AS extra_name,
  e.price
FROM product_extras pe
INNER JOIN menu_items mi ON pe.product_id = mi.id
INNER JOIN extras e ON pe.extra_id = e.id;
```

---

## 8. Consultas Útiles

### 8.1 Obtener todos los extras con sus relaciones

```sql
SELECT 
  e.id,
  e.name,
  e.description,
  e.price,
  e.application_type,
  e.active,
  -- IDs de categorías relacionadas (JSON array)
  COALESCE(
    (SELECT JSON_ARRAYAGG(ce.category_id)
     FROM category_extras ce
     WHERE ce.extra_id = e.id),
    JSON_ARRAY()
  ) AS category_ids,
  -- IDs de productos relacionados (JSON array)
  COALESCE(
    (SELECT JSON_ARRAYAGG(pe.product_id)
     FROM product_extras pe
     WHERE pe.extra_id = e.id),
    JSON_ARRAY()
  ) AS product_ids
FROM extras e
WHERE e.active = TRUE
ORDER BY e.created_at DESC;
```

**Resultado ejemplo:**
```json
[
  {
    "id": "extra-001-salsa",
    "name": "Salsa extra",
    "price": 5.00,
    "application_type": "global",
    "active": 1,
    "category_ids": [],
    "product_ids": []
  },
  {
    "id": "extra-002-piña",
    "name": "Piña",
    "price": 0.00,
    "application_type": "category",
    "active": 1,
    "category_ids": ["cat-00000001", "cat-00000003"],
    "product_ids": []
  },
  {
    "id": "extra-003-cebolla-morada",
    "name": "Cebolla morada",
    "price": 0.00,
    "application_type": "product",
    "active": 1,
    "category_ids": [],
    "product_ids": ["prod-001-pastor"]
  }
]
```

### 8.2 Obtener extras disponibles para un producto específico

```sql
-- Para producto con ID 'prod-001-pastor'
SELECT DISTINCT e.*
FROM extras e
WHERE e.active = TRUE
  AND (
    -- Extras globales
    e.application_type = 'global'
    OR
    -- Extras de la categoría del producto
    (e.application_type = 'category' 
     AND e.id IN (
       SELECT ce.extra_id
       FROM category_extras ce
       INNER JOIN menu_items mi ON ce.category_id = mi.category_id
       WHERE mi.id = 'prod-001-pastor'
     ))
    OR
    -- Extras específicos del producto
    (e.application_type = 'product'
     AND e.id IN (
       SELECT pe.extra_id
       FROM product_extras pe
       WHERE pe.product_id = 'prod-001-pastor'
     ))
  );
```

---

## 9. Resumen de Cambios Necesarios

### ✅ Lo que YA tienes correcto:

1. ✅ Tabla `extras` con campo `application_type`
2. ✅ Tabla `product_extras` con llaves foráneas correctas
3. ✅ Estructura general del esquema

### ⚠️ Lo que DEBES modificar:

1. ⚠️ **MODIFICAR** `category_extras`:
   - Cambiar `category VARCHAR(50)` → `category_id VARCHAR(36)`
   - Agregar llave foránea: `category_id` → `categories.id`
   - Actualizar índice único: usar `category_id` en lugar de `category`

### 📝 Script de Migración:

```sql
-- Ejecuta este script para corregir la tabla
DROP TABLE IF EXISTS category_extras;

CREATE TABLE `category_extras` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,  -- ✅ Cambiado de 'category'
  `extra_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  CONSTRAINT `fk_category_extras_category`
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories`(`id`) 
    ON DELETE CASCADE,
  
  CONSTRAINT `fk_category_extras_extra`
    FOREIGN KEY (`extra_id`) 
    REFERENCES `extras`(`id`) 
    ON DELETE CASCADE,
  
  UNIQUE KEY `unique_category_extra` (`category_id`, `extra_id`),
  KEY `idx_category_extras_category_id` (`category_id`),
  KEY `idx_category_extras_extra_id` (`extra_id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 10. Beneficios de Usar `category_id` en lugar de `category`

| Aspecto | Con `category` (nombre) ❌ | Con `category_id` (UUID) ✅ |
|---------|---------------------------|----------------------------|
| **Integridad referencial** | ❌ No hay FK | ✅ FK valida que exista |
| **Renombrar categoría** | ❌ Rompe relaciones | ✅ Relaciones intactas |
| **Búsquedas** | ❌ JOIN por nombre | ✅ JOIN por ID (más rápido) |
| **Validación** | ❌ Acepta nombres inválidos | ✅ Solo IDs válidos |
| **Consistencia** | ❌ Inconsistente con frontend | ✅ Consistente (usa IDs) |
| **Duplicados** | ❌ Posibles inconsistencias | ✅ Índice único evita duplicados |

---

**Fecha de última actualización**: Mayo 2026
