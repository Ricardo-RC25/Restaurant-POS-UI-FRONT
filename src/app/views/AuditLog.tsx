import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Search, Shield, User, Package, ShoppingCart, LogIn, LogOut, Edit, Trash2, Plus, DollarSign, Filter, Calendar } from 'lucide-react';
import { AuditLog as AuditLogType } from '../types';

export function AuditLogView() {
  const { auditLogs, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'all' | 'auth' | 'inventory' | 'orders' | 'users'>('all');
  const [actionFilter, setActionFilter] = useState<'all' | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'payment'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filtrar por módulo
  const filteredByModule = useMemo(() => {
    if (moduleFilter === 'all') return auditLogs;
    return auditLogs.filter(log => log.module === moduleFilter);
  }, [auditLogs, moduleFilter]);

  // Filtrar por acción
  const filteredByAction = useMemo(() => {
    if (actionFilter === 'all') return filteredByModule;
    return filteredByModule.filter(log => log.action === actionFilter);
  }, [filteredByModule, actionFilter]);

  // Filtrar por fecha
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return filteredByAction.filter(log => {
      const logDate = new Date(log.timestamp);
      switch (dateFilter) {
        case 'today':
          return logDate >= today;
        case 'week':
          return logDate >= weekAgo;
        case 'month':
          return logDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  }, [filteredByAction, dateFilter]);

  // Aplicar búsqueda
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return filteredByDate;
    
    const query = searchQuery.toLowerCase();
    return filteredByDate.filter(log =>
      log.userName?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query) ||
      log.module?.toLowerCase().includes(query)
    );
  }, [filteredByDate, searchQuery]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalLogs = filteredByDate.length;
    const authLogs = filteredByDate.filter(l => l.module === 'auth').length;
    const inventoryLogs = filteredByDate.filter(l => l.module === 'inventory').length;
    const ordersLogs = filteredByDate.filter(l => l.module === 'orders').length;
    const usersLogs = filteredByDate.filter(l => l.module === 'users').length;

    return {
      total: totalLogs,
      auth: authLogs,
      inventory: inventoryLogs,
      orders: ordersLogs,
      users: usersLogs,
    };
  }, [filteredByDate]);

  const getModuleInfo = (module: string) => {
    switch (module) {
      case 'auth':
        return { label: 'Autenticación', icon: Shield, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' };
      case 'inventory':
        return { label: 'Inventario', icon: Package, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' };
      case 'orders':
        return { label: 'Órdenes', icon: ShoppingCart, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
      case 'users':
        return { label: 'Usuarios', icon: User, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' };
      default:
        return { label: module, icon: Shield, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' };
    }
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Crear', icon: Plus, color: 'text-green-700 dark:text-green-300' };
      case 'update':
        return { label: 'Actualizar', icon: Edit, color: 'text-blue-700 dark:text-blue-300' };
      case 'delete':
        return { label: 'Eliminar', icon: Trash2, color: 'text-red-700 dark:text-red-300' };
      case 'login':
        return { label: 'Login', icon: LogIn, color: 'text-green-700 dark:text-green-300' };
      case 'logout':
        return { label: 'Logout', icon: LogOut, color: 'text-gray-700 dark:text-gray-300' };
      case 'payment':
        return { label: 'Pago', icon: DollarSign, color: 'text-purple-700 dark:text-purple-300' };
      default:
        return { label: action, icon: Shield, color: 'text-gray-700 dark:text-gray-300' };
    }
  };

  // 🔥 Generar descripción amigable basada en módulo + acción + entityType
  const getDescription = (log: AuditLogType): string => {
    const actionLabels: Record<string, string> = {
      create: 'creó',
      update: 'actualizó',
      delete: 'eliminó',
      login: 'inició sesión',
      logout: 'cerró sesión',
      payment: 'procesó pago',
    };
    
    const entityLabels: Record<string, string> = {
      product: 'un producto',
      category: 'una categoría',
      user: 'un usuario',
      order: 'una orden',
      session: 'una sesión',
    };
    
    const actionLabel = actionLabels[log.action] || log.action;
    const entityLabel = log.entityType ? entityLabels[log.entityType] || log.entityType : '';
    
    return `${log.userName || 'Usuario'} ${actionLabel} ${entityLabel}`.trim();
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / AUDITORÍA"
        title="Registro de Auditoría"
        subtitle="Historial completo de actividad del sistema"
        actions={
          currentUser ? (
            <div className="text-right">
              <p className="text-xs text-[#a2774c] uppercase tracking-wide">Usuario</p>
              <p className="font-semibold text-foreground">{currentUser.name}</p>
            </div>
          ) : null
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-[#2e636e] to-[#a2774c] text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-sm opacity-90">Total Registros</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-card border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">Autenticación</p>
            <p className="text-3xl font-bold text-foreground">{stats.auth}</p>
          </div>

          <div className="bg-card border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground">Inventario</p>
            <p className="text-3xl font-bold text-foreground">{stats.inventory}</p>
          </div>

          <div className="bg-card border-2 border-green-200 dark:border-green-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">Órdenes</p>
            <p className="text-3xl font-bold text-foreground">{stats.orders}</p>
          </div>

          <div className="bg-card border-2 border-orange-200 dark:border-orange-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <User className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm text-muted-foreground">Usuarios</p>
            <p className="text-3xl font-bold text-foreground">{stats.users}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-xl shadow-md p-6 border border-border space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#a2774c]" />
            Filtros
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Usuario, descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                />
              </div>
            </div>

            {/* Filtro de módulo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Módulo
              </label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
              >
                <option value="all">Todos los módulos</option>
                <option value="auth">Autenticación</option>
                <option value="inventory">Inventario</option>
                <option value="orders">Órdenes</option>
                <option value="users">Usuarios</option>
              </select>
            </div>

            {/* Filtro de acción */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Acción
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
              >
                <option value="all">Todas las acciones</option>
                <option value="create">Crear</option>
                <option value="update">Actualizar</option>
                <option value="delete">Eliminar</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="payment">Pago</option>
              </select>
            </div>

            {/* Filtro de fecha */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Período
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
              >
                <option value="all">Todo el historial</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de logs */}
        <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Módulo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">No se encontraron registros</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => {
                    const moduleInfo = getModuleInfo(log.module);
                    const actionInfo = getActionInfo(log.action);
                    const ModuleIcon = moduleInfo.icon;
                    const ActionIcon = actionInfo.icon;

                    return (
                      <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(log.timestamp).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {log.userName || 'Usuario desconocido'}
                              </span>
                              {log.userRole && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({log.userRole})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${moduleInfo.color}`}>
                            <ModuleIcon className="w-3 h-3" />
                            {moduleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-2 ${actionInfo.color}`}>
                            <ActionIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{actionInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground max-w-md">
                            {getDescription(log)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {log.details ? (
                            <p className="text-xs text-muted-foreground max-w-sm truncate" title={log.details}>
                              {log.details}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen */}
        {filteredLogs.length > 0 ? (
          <div className="bg-gradient-to-r from-[#2e636e] to-[#a2774c] text-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm opacity-90">Resultados de búsqueda</p>
                <p className="text-2xl font-bold">{filteredLogs.length} registros encontrados</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Período seleccionado</p>
                <p className="text-xl font-bold">
                  {dateFilter === 'today' ? 'Hoy' : 
                   dateFilter === 'week' ? 'Última semana' : 
                   dateFilter === 'month' ? 'Último mes' : 'Todo el historial'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}