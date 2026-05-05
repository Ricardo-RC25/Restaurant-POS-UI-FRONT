import { useNavigate } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { 
  Package, 
  Users, 
  LayoutGrid, 
  FileText,
  TrendingUp,
  Settings,
  Plus,
  Receipt,
  History,
  Shield
} from 'lucide-react';

export function BackOfficeView() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Productos',
      description: 'Gestionar catálogo y precios',
      icon: Package,
      color: 'bg-blue-500',
      path: '/inventory',
    },
    {
      title: 'Categorías',
      description: 'Administrar categorías del menú',
      icon: LayoutGrid,
      color: 'bg-purple-500',
      path: '/categories',
    },
    {
      title: 'Extras',
      description: 'Gestionar extras y modificaciones',
      icon: Plus,
      color: 'bg-teal-500',
      path: '/extras',
    },
    {
      title: 'Usuarios',
      description: 'Gestionar empleados y permisos',
      icon: Users,
      color: 'bg-green-500',
      path: '/users',
    },
    {
      title: 'Mesas',
      description: 'Configurar mesas del restaurante',
      icon: LayoutGrid,
      color: 'bg-orange-500',
      path: '/tables',
    },
    {
      title: 'Historial de Ventas',
      description: 'Consultar todas las órdenes cobradas',
      icon: History,
      color: 'bg-[#a2774c]',
      path: '/saleshistory',
    },
    {
      title: 'Auditoría',
      description: 'Registro completo de actividad',
      icon: Shield,
      color: 'bg-[#6c5033]',
      path: '/auditlog',
    },
    {
      title: 'Facturación',
      description: 'Portal de facturas electrónicas',
      icon: Receipt,
      color: 'bg-[#2e636e]',
      path: '/invoicing',
    },
  ];

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        title="Gestión"
        subtitle="Panel de administración de la taquería"
        breadcrumb="POS / ADMINISTRACIÓN"
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.title}
                onClick={() => navigate(module.path)}
                className="bg-card rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow border border-border hover:border-primary"
              >
                <div className={`${module.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{module.title}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}