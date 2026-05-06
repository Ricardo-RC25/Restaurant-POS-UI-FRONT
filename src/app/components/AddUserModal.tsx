import { useState, memo, useCallback } from 'react';
import { X, Eye, EyeOff, User as UserIcon, Lock, Check } from 'lucide-react';
import { User } from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface NewUserData {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'waiter' | 'cashier';
}

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (user: Omit<User, 'id' | 'active' | 'createdAt'>) => void;
}

const ROLE_LABELS = {
  waiter: 'Mesero',
  cashier: 'Cajero',
  admin: 'Administrador',
} as const;

export const AddUserModal = memo(function AddUserModal({ onClose, onAdd }: AddUserModalProps) {
  const [formData, setFormData] = useState<NewUserData>({
    username: '',
    password: '',
    name: '',
    role: 'waiter',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewUserData | 'confirmPassword', string>>>({});

  const handleChange = useCallback((field: keyof NewUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof NewUserData | 'confirmPassword', string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Mínimo 4 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, confirmPassword]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
    }
  }, [formData, validateForm, onAdd]);

  const toggleShowPassword = useCallback(() => setShowPassword(p => !p), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword(p => !p), []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-bold text-card-foreground">Agregar Nuevo Usuario</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground transition-colors touch-manipulation">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Usuario *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="nombre.usuario"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground ${
                    errors.username ? 'border-red-500 dark:border-red-600' : 'border-border'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Juan Pérez"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground ${
                  errors.name ? 'border-red-500 dark:border-red-600' : 'border-border'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground ${
                    errors.password ? 'border-red-500 dark:border-red-600' : 'border-border'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground touch-manipulation"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground ${
                    errors.confirmPassword ? 'border-red-500 dark:border-red-600' : 'border-border'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground touch-manipulation"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-3">
                Rol del Usuario *
              </label>
              <div className="space-y-2">
                {(Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleChange('role', role)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-colors touch-manipulation ${
                      formData.role === role
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium text-card-foreground">{ROLE_LABELS[role]}</span>
                    {formData.role === role && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors touch-manipulation"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 touch-manipulation"
            >
              <Check className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});