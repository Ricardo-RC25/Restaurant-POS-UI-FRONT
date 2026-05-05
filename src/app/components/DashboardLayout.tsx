import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { Login } from './Login';
import { Footer } from './Footer';
import {
  LogOut,
  User,
  Home,
  ShoppingBag,
  DollarSign,
  Package,
  Menu,
  X,
  Settings
} from 'lucide-react';

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1722875183792-bebac14859b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzA4NTI2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080';

export function DashboardLayout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoUrl = localStorage.getItem('taqueriaLogoUrl') || DEFAULT_LOGO;
  const restaurantName = localStorage.getItem('restaurantName') || 'Taquería POS';

  if (!currentUser) {
    return <Login />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      waiter: 'Mesero',
      cashier: 'Cajero',
      manager: 'Gerente',
      admin: 'Administrador',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'manager', 'cashier', 'waiter'] },
    { path: '/waiter', icon: ShoppingBag, label: 'Mesero', roles: ['admin', 'waiter', 'manager'] },
    { path: '/cashier', icon: DollarSign, label: 'Caja', roles: ['admin', 'cashier', 'manager'] },
    { path: '/backoffice', icon: Home, label: 'Gestión', roles: ['admin', 'manager'] },
    { path: '/settings', icon: Settings, label: 'Configuración', roles: ['admin', 'manager', 'cashier', 'waiter'] },
  ];

  const availableMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Mobile Header - Fuera del flex principal */}
      <div className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-primary">
            <img 
              src={logoUrl} 
              alt="Taquería Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-accent text-sm">{restaurantName}</h1>
            <p className="text-xs text-primary">{getRoleLabel(currentUser.role)}</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-accent" />
          ) : (
            <Menu className="w-6 h-6 text-accent" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop & Mobile Drawer */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border flex flex-col shadow-lg md:shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* SIDEBAR HEADER - Altura fija para alinearse con header del contenido */}
          <div className="hidden md:block bg-card border-b border-border flex-shrink-0" style={{ height: '96px' }}>
            <div className="h-full flex flex-col justify-center px-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm border-2 border-primary flex-shrink-0">
                  <img 
                    src={logoUrl} 
                    alt="Taquería Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-card-foreground dark:text-[#f5f1ed] text-sm leading-tight truncate">{restaurantName}</h1>
                  <p className="text-[10px] text-muted-foreground dark:text-[#d4a574] leading-tight">Sistema POS</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 bg-muted dark:bg-[#3a3229] py-2 px-3 rounded-lg border border-border">
                <User className="w-4 h-4 text-primary dark:text-[#d4a574] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground dark:text-[#f5f1ed] leading-tight truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground dark:text-[#b8a591] leading-tight">{getRoleLabel(currentUser.role)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header Inside Drawer */}
          <div className="md:hidden bg-card border-b border-border space-y-2.5 py-2.5">
            <div className="flex items-center gap-2.5 px-4">
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm border-2 border-primary flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Taquería Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-card-foreground dark:text-[#f5f1ed] text-sm leading-tight truncate">{restaurantName}</h1>
                <p className="text-[10px] text-muted-foreground dark:text-[#d4a574] leading-tight">Sistema POS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-muted dark:bg-[#3a3229] py-2 mx-4 px-3 rounded-lg border border-border">
              <User className="w-4 h-4 text-primary dark:text-[#d4a574] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-card-foreground dark:text-[#f5f1ed] leading-tight truncate">{currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground dark:text-[#b8a591] leading-tight">{getRoleLabel(currentUser.role)}</p>
              </div>
            </div>
          </div>

          {/* SIDEBAR NAV - flex-1 para ocupar espacio disponible */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {availableMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-secondary text-secondary-foreground shadow-md'
                          : 'text-foreground hover:bg-muted active:bg-muted/80'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* SIDEBAR FOOTER - Altura fija para alinearse con footer del contenido */}
          <div className="border-t border-border flex-shrink-0" style={{ height: '64px' }}>
            <div className="h-full flex items-center px-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 py-2 px-3 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 active:bg-red-200 dark:active:bg-red-900/50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-xs font-medium text-destructive">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}