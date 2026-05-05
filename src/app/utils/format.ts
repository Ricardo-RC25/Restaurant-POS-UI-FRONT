/**
 * UTILIDADES DE FORMATO
 * Funciones para formatear datos en la aplicación
 */

/**
 * Formatea un número como moneda en pesos mexicanos
 * @param amount - Cantidad a formatear
 * @param showDecimals - Si debe mostrar decimales (default: true)
 * @returns String formateado como "$1,234.56 MXN"
 */
export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
  
  return formatted;
}

/**
 * Formatea una fecha en formato legible en español
 * @param date - Fecha a formatear
 * @param includeTime - Si debe incluir la hora (default: true)
 * @returns String formateado "12/03/2026 14:30"
 */
export function formatDate(date: Date, includeTime: boolean = true): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  
  return new Intl.DateTimeFormat('es-MX', options).format(date);
}

/**
 * Formatea un número con separadores de miles
 * @param num - Número a formatear
 * @returns String formateado "1,234"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

/**
 * Formatea un porcentaje
 * @param value - Valor decimal (0.15 = 15%)
 * @param decimals - Número de decimales (default: 0)
 * @returns String formateado "15%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formatea una hora en formato HH:MM
 * @param date - Fecha a formatear
 * @returns String formateado "14:30"
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea una fecha con hora completa
 * @param date - Fecha a formatear
 * @returns String formateado "05/05/2026, 14:30"
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Trunca un string a una longitud máxima
 * @param str - String a truncar
 * @param maxLength - Longitud máxima
 * @returns String truncado con "..." si excede el máximo
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Capitaliza la primera letra de un string
 * @param str - String a capitalizar
 * @returns String con primera letra en mayúscula
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
