# Utilidades del Sistema POS

## 📦 Contenido

Este directorio contiene todas las funciones de utilidad reutilizables del sistema.

---

## 📁 Archivos

### 1. `constants.ts`
Constantes y configuraciones centralizadas.

**Ejemplo de uso**:
```typescript
import { PAYMENT_METHOD_LABELS, ORDER_STATUS, TAX_RATE } from '../utils/constants';

// Obtener label de método de pago
const label = PAYMENT_METHOD_LABELS['cash']; // "Efectivo"

// Verificar estado de orden
if (order.status === ORDER_STATUS.PAID) {
  // ...
}

// Calcular impuesto
const tax = subtotal * TAX_RATE;
```

---

### 2. `format.ts`
Funciones para formatear datos.

**Ejemplo de uso**:
```typescript
import { formatCurrency, formatDate, formatTime } from '../utils/format';

// Formatear moneda
formatCurrency(1234.56); // "$1,234.56 MXN"
formatCurrency(1234.56, false); // "$1,235 MXN" (sin decimales)

// Formatear fecha
formatDate(new Date()); // "05/05/2026 14:30"
formatDate(new Date(), false); // "05/05/2026" (solo fecha)

// Formatear hora
formatTime(new Date()); // "14:30"

// Formatear número
formatNumber(1234567); // "1,234,567"

// Formatear porcentaje
formatPercentage(0.16); // "16%"
```

---

### 3. `validation.ts`
Funciones de validación.

**Ejemplo de uso**:
```typescript
import { 
  isValidEmail, 
  isValidPhone, 
  isValidPassword,
  isValidPrice 
} from '../utils/validation';

// Validar email
isValidEmail('[email protected]'); // true
isValidEmail('invalid'); // false

// Validar teléfono
isValidPhone('5512345678'); // true
isValidPhone('+525512345678'); // true

// Validar contraseña
const result = isValidPassword('MyPass123');
if (!result.isValid) {
  console.log(result.errors); // Array de errores
}

// Validar precio
isValidPrice(99.99); // true
isValidPrice(-10); // false
```

---

### 4. `helpers.ts`
Funciones auxiliares generales.

**Ejemplo de uso**:
```typescript
import { 
  generateId, 
  calculateTotal,
  filterBySearch,
  sortBy,
  getTodayOrders,
  debounce
} from '../utils/helpers';

// Generar ID único
const id = generateId(); // "1714922400000-x7k9m2p5q"

// Calcular total con impuesto
const subtotal = 100;
const tax = calculateTax(subtotal); // 16
const total = calculateTotal(subtotal, tax); // 116

// Filtrar por búsqueda
const results = filterBySearch(
  products, 
  'tacos', 
  ['name', 'description']
);

// Ordenar
const sorted = sortBy(orders, 'createdAt', 'desc');

// Obtener órdenes de hoy
const todayOrders = getTodayOrders(allOrders);

// Debounce para búsqueda
const debouncedSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);
```

---

### 5. `index.ts`
Exportación centralizada.

**Ejemplo de uso**:
```typescript
// Importar todo desde un solo lugar
import { 
  formatCurrency, 
  ORDER_STATUS, 
  isValidEmail,
  generateId 
} from '../utils';
```

---

## 🎯 Mejores Prácticas

### 1. **Siempre importar desde utils**
```typescript
// ✅ CORRECTO
import { formatCurrency } from '../utils/format';

// ❌ INCORRECTO - No duplicar funciones
function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}
```

### 2. **Usar constantes en lugar de strings**
```typescript
// ✅ CORRECTO
if (order.status === ORDER_STATUS.PAID) { }

// ❌ INCORRECTO
if (order.status === 'paid') { }
```

### 3. **Validar antes de procesar**
```typescript
// ✅ CORRECTO
if (isValidEmail(email)) {
  sendEmail(email);
}

// ❌ INCORRECTO
sendEmail(email); // Sin validar
```

### 4. **Usar helpers para lógica común**
```typescript
// ✅ CORRECTO
const todayOrders = getTodayOrders(orders);

// ❌ INCORRECTO - Duplicar lógica
const today = new Date().toDateString();
const todayOrders = orders.filter(order => 
  order.createdAt.toDateString() === today
);
```

---

## 🔧 Agregar Nuevas Utilidades

### Paso 1: Elegir el archivo correcto
- **Constantes** → `constants.ts`
- **Formateo** → `format.ts`
- **Validación** → `validation.ts`
- **Helpers generales** → `helpers.ts`

### Paso 2: Agregar documentación JSDoc
```typescript
/**
 * Descripción de la función
 * @param param1 - Descripción del parámetro
 * @returns Descripción del retorno
 */
export function myFunction(param1: string): boolean {
  // ...
}
```

### Paso 3: Agregar tipos TypeScript
```typescript
// ✅ CORRECTO - Tipos explícitos
export function calculate(a: number, b: number): number {
  return a + b;
}

// ❌ INCORRECTO - Sin tipos
export function calculate(a, b) {
  return a + b;
}
```

### Paso 4: Exportar desde index.ts
```typescript
// Ya está configurado para exportar todo automáticamente
export * from './constants';
export * from './format';
export * from './helpers';
export * from './validation';
```

---

## 📊 Estadísticas

- **Total de líneas**: 462
- **Funciones de formato**: 8
- **Funciones de validación**: 11
- **Funciones helpers**: 15
- **Constantes**: 60+

---

## 🚀 Siguientes Pasos

1. **Refactorizar otros componentes** para usar estas utilidades
2. **Agregar tests** para las funciones críticas
3. **Documentar casos de uso** más complejos
4. **Agregar más validaciones** según necesidades

---

## 💡 Tips

- Usa **autocomplete** de tu IDE para descubrir todas las utilidades disponibles
- Revisa el archivo de constantes antes de hardcodear strings
- Las funciones helpers pueden encadenarse para operaciones complejas
- Todas las funciones son **type-safe** gracias a TypeScript

---

## 📞 Soporte

Si necesitas agregar una nueva utilidad o tienes dudas sobre alguna función existente, consulta este README o revisa el código fuente de las utilidades.
