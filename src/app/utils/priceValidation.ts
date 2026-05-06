/**
 * Validación de precios para México
 * Los precios deben ser múltiplos de 0.50 (50 centavos)
 */

/**
 * Valida que un precio sea múltiplo de 0.50
 * Ejemplos válidos: 5, 10, 4.50, 10.50, 100
 * Ejemplos inválidos: 4.99, 0.34, 5.25
 */
export const isValidPrice = (price: number): boolean => {
  if (price < 0) return false;

  // Multiplicar por 2 para convertir a múltiplos de 50 centavos
  // Ej: 4.50 * 2 = 9, 5.25 * 2 = 10.5 (no entero)
  const doubled = price * 2;

  // Verificar que sea un número entero (sin decimales)
  return Number.isInteger(doubled);
};

/**
 * Redondea un precio al múltiplo de 0.50 más cercano
 */
export const roundToValidPrice = (price: number): number => {
  if (price < 0) return 0;

  // Redondear a múltiplos de 0.50
  return Math.round(price * 2) / 2;
};

/**
 * Mensaje de error para precios inválidos
 */
export const PRICE_ERROR_MESSAGE = 'El precio debe ser múltiplo de 50 centavos (Ej: 5, 10, 4.50, 10.50)';
