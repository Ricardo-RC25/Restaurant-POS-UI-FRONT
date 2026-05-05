/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Mexican format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+?52)?[1-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

/**
 * Validate number is positive
 */
export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}

/**
 * Validate number is non-negative
 */
export function isNonNegativeNumber(value: number): boolean {
  return !isNaN(value) && value >= 0;
}

/**
 * Validate price
 */
export function isValidPrice(price: number): boolean {
  return isPositiveNumber(price) && price < 999999;
}

/**
 * Validate stock
 */
export function isValidStock(stock: number): boolean {
  return isNonNegativeNumber(stock) && Number.isInteger(stock);
}

/**
 * Validate string is not empty
 */
export function isNotEmpty(str: string): boolean {
  return str.trim().length > 0;
}

/**
 * Validate table number
 */
export function isValidTableNumber(tableNumber: number): boolean {
  return Number.isInteger(tableNumber) && tableNumber > 0 && tableNumber < 1000;
}
