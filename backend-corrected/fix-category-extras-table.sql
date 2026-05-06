-- ================================================================================
-- CORRECCIÓN: category_extras
-- Cambiar 'category' (nombre) por 'category_id' (UUID)
-- ================================================================================
--
-- IMPORTANTE: Este script corrige la tabla category_extras para usar
-- category_id en lugar de category (nombre)
--
-- Ejecutar en la base de datos restaurant_pos
-- ================================================================================

USE restaurant_pos;

-- Verificar que estamos en la base de datos correcta
SELECT DATABASE();

-- ============================================================
-- PASO 1: Eliminar tabla actual
-- ============================================================
-- ADVERTENCIA: Esto eliminará todos los datos de category_extras
-- Si tienes datos importantes, primero haz un respaldo con:
-- mysqldump -u root -p restaurant_pos category_extras > backup_category_extras.sql

DROP TABLE IF EXISTS category_extras;

-- ============================================================
-- PASO 2: Crear tabla con estructura CORRECTA
-- ============================================================
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

-- ============================================================
-- PASO 3: Verificar estructura
-- ============================================================
DESCRIBE category_extras;

-- Resultado esperado:
-- +-------------+-------------+------+-----+-------------------+
-- | Field       | Type        | Null | Key | Default           |
-- +-------------+-------------+------+-----+-------------------+
-- | id          | varchar(36) | NO   | PRI | NULL              |
-- | category_id | varchar(36) | NO   | MUL | NULL              | <-- ✅ Correcto
-- | extra_id    | varchar(36) | NO   | MUL | NULL              |
-- | created_at  | timestamp   | NO   |     | CURRENT_TIMESTAMP |
-- +-------------+-------------+------+-----+-------------------+

-- ============================================================
-- PASO 4: Verificar llaves foráneas
-- ============================================================
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'restaurant_pos'
  AND TABLE_NAME = 'category_extras'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Resultado esperado:
-- +------------------------------+------------------+-------------+-----------------------+------------------------+
-- | CONSTRAINT_NAME              | TABLE_NAME       | COLUMN_NAME | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
-- +------------------------------+------------------+-------------+-----------------------+------------------------+
-- | fk_category_extras_category  | category_extras  | category_id | categories            | id                     |
-- | fk_category_extras_extra     | category_extras  | extra_id    | extras                | id                     |
-- +------------------------------+------------------+-------------+-----------------------+------------------------+

-- ================================================================================
-- FIN DEL SCRIPT
-- ================================================================================
-- La tabla category_extras ahora está corregida y lista para usar con la API
-- ================================================================================
