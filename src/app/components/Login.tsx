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
  const { login } = useApp();

  // Estados
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Estados derivados
  const logoUrl = localStorage.getItem('taqueriaLogoUrl') || DEFAULT_LOGO;
  const restaurantName = localStorage.getItem('restaurantName') || 'Taquería POS';

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
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
      </div>
    </div>
  );
}