import { useState } from 'react';

import { LogIn, User } from 'lucide-react';

import { useApp } from '../context/AppContext';
import { PasswordInput } from './PasswordInput';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1722875183792-bebac14859b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzA4NTI2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080';

// ============================================================================
// COMPONENT
// ============================================================================

export function Login() {
  // Context
  const { login, users } = useApp();
  
  // Estados
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showQuickAccess, setShowQuickAccess] = useState(true);

  // Estados derivados
  const logoUrl = localStorage.getItem('taqueriaLogoUrl') || DEFAULT_LOGO;
  const restaurantName = localStorage.getItem('restaurantName') || 'Taquería POS';
  const availableUsers = users.filter(u => u.active);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  const handleQuickLogin = (user: any) => {
    login(user.username, user.password);
  };

  const handleResetUsers = () => {
    if (confirm('¿Deseas resetear los usuarios a los valores iniciales? Esto borrará todos los usuarios personalizados.')) {
      localStorage.removeItem('pos_users');
      window.location.reload();
    }
  };

  // Funciones auxiliares
  const getRoleLabel = (role: string) => {
    const labels = {
      waiter: 'Mesero',
      cashier: 'Cajero',
      manager: 'Gerente',
      admin: 'Administrador',
    };
    return labels[role as keyof typeof labels];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      waiter: 'bg-blue-100 text-blue-800',
      cashier: 'bg-green-100 text-green-800',
      manager: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role as keyof typeof colors];
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-primary">
              <img 
                src={logoUrl} 
                alt="Taquería Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">UX/UI - HI-FI</p>
          <h1 className="text-3xl font-bold text-card-foreground mb-2">{restaurantName}</h1>
          <p className="text-muted-foreground">Inicia sesión para continuar</p>
        </div>

        {/* Card de Login */}
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Ingresa tu contraseña"
              label="Contraseña"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </form>
        </div>

        {/* Acceso Rápido (para demostración) */}
        {showQuickAccess && (
          <div className="mt-6 bg-card rounded-lg shadow-lg p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-card-foreground">Acceso Rápido (Demo)</h3>
              <button
                onClick={() => setShowQuickAccess(false)}
                className="text-sm text-muted-foreground hover:text-card-foreground"
              >
                Ocultar
              </button>
            </div>
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-card-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              admin: "admin123" | cajero: "cajero123" | mesero: "mesero123"
            </p>
            <button
              onClick={handleResetUsers}
              className="w-full mt-3 text-xs text-red-600 hover:text-red-800 underline"
            >
              Resetear usuarios a valores iniciales
            </button>
          </div>
        )}
      </div>
    </div>
  );
}