import { useState } from 'react';
import { X, Check, Lock, Eye, EyeOff } from 'lucide-react';

export interface EditUserData {
  username: string;
  name: string;
  role: string;
  active: boolean;
  password?: string;
}

interface EditUserModalProps {
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    active: boolean;
  };
  onClose: () => void;
  onSave: (userId: string, userData: EditUserData) => void;
}

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<EditUserData>({
    username: user.username,
    name: user.name,
    role: user.role,
    active: user.active,
  });
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validatePassword = (): boolean => {
    if (!changePassword) return true;

    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    const dataToSave = { ...formData };
    if (changePassword && password) {
      dataToSave.password = password;
    }

    onSave(user.id, dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Editar Usuario</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                Rol *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                required
              >
                <option value="waiter">Mesero</option>
                <option value="cashier">Cajero</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 text-primary rounded border-border focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-medium text-card-foreground">
                Usuario activo
              </label>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Cambiar Contraseña
                </label>
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-border focus:ring-primary"
                />
              </div>
              {changePassword && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}