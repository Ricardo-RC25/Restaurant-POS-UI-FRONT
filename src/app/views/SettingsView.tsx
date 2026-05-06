import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { InvoiceBannerEditor } from '../components/InvoiceBannerEditor';
import { 
  Settings, 
  Image as ImageIcon, 
  Save, 
  Moon, 
  Sun, 
  Type,
  Eye, 
  Zap, 
  AlignJustify,
  Store,
  MapPin,
  Phone,
  Mail,
  Pencil,
  X,
  Globe,
  Receipt,
  Upload,
  Camera,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

// Settings View Component - Configuración del Sistema
const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1722875183792-bebac14859b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzA4NTI2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080';

export function SettingsView() {
  const { accessibility, updateAccessibility, currentUser } = useApp();
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  
  // Business Information State
  const [businessInfo, setBusinessInfo] = useState({
    name: localStorage.getItem('restaurantName') || 'Taquería POS',
    logoUrl: localStorage.getItem('taqueriaLogoUrl') || DEFAULT_LOGO,
    slogan: localStorage.getItem('restaurantSlogan') || 'Los mejores tacos de la ciudad',
    address: localStorage.getItem('restaurantAddress') || 'Calle Principal #123, Col. Centro',
    phone: localStorage.getItem('restaurantPhone') || '+52 55 1234 5678',
    email: localStorage.getItem('restaurantEmail') || 'contacto@taqueria.com',
    website: localStorage.getItem('restaurantWebsite') || 'www.taqueria.com',
  });

  const [tempBusinessInfo, setTempBusinessInfo] = useState(businessInfo);
  const [saved, setSaved] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleSaveBusiness = () => {
    localStorage.setItem('restaurantName', tempBusinessInfo.name);
    localStorage.setItem('taqueriaLogoUrl', tempBusinessInfo.logoUrl);
    localStorage.setItem('restaurantSlogan', tempBusinessInfo.slogan);
    localStorage.setItem('restaurantAddress', tempBusinessInfo.address);
    localStorage.setItem('restaurantPhone', tempBusinessInfo.phone);
    localStorage.setItem('restaurantEmail', tempBusinessInfo.email);
    localStorage.setItem('restaurantWebsite', tempBusinessInfo.website);
    
    setBusinessInfo(tempBusinessInfo);
    
    // Disparar evento personalizado para actualizar el footer ANTES del reload
    window.dispatchEvent(new Event('businessInfoUpdated'));
    
    toast.success('Información guardada correctamente', {
      description: 'La página se recargará en 2 segundos...',
    });
    
    setSaved(true);
    
    setTimeout(() => {
      setSaved(false);
      setShowBusinessModal(false);
      window.location.reload();
    }, 2000);
  };

  const handleCancelEdit = () => {
    setTempBusinessInfo(businessInfo);
    setShowBusinessModal(false);
  };

  const handleOpenBusinessModal = () => {
    // Cargar los valores más recientes desde localStorage
    const currentBusinessInfo = {
      name: localStorage.getItem('restaurantName') || 'Taquería POS',
      logoUrl: localStorage.getItem('taqueriaLogoUrl') || DEFAULT_LOGO,
      slogan: localStorage.getItem('restaurantSlogan') || 'Los mejores tacos de la ciudad',
      address: localStorage.getItem('restaurantAddress') || 'Calle Principal #123, Col. Centro',
      phone: localStorage.getItem('restaurantPhone') || '+52 55 1234 5678',
      email: localStorage.getItem('restaurantEmail') || 'contacto@taqueria.com',
      website: localStorage.getItem('restaurantWebsite') || 'www.taqueria.com',
    };
    setBusinessInfo(currentBusinessInfo);
    setTempBusinessInfo(currentBusinessInfo);
    setShowBusinessModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb={isAdmin ? "GESTIÓN / CONFIGURACIÓN" : "CONFIGURACIÓN"}
        title="Configuración"
        subtitle={isAdmin ? "Información del negocio y configuración personal" : "Configuración de accesibilidad personal"}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Business Information Section - SOLO PARA MANAGER */}
          {isAdmin && (
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">Información del Negocio</h2>
                    <p className="text-sm text-white/90">Datos de tu taquería</p>
                  </div>
                  <Button
                    onClick={handleOpenBusinessModal}
                    variant="outline"
                    className="bg-white text-primary hover:bg-white/90 dark:bg-white dark:text-primary border-2 border-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo y Nombre */}
                  <div className="md:col-span-2 flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-primary flex-shrink-0">
                      <img 
                        src={businessInfo.logoUrl} 
                        alt="Logo del negocio" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_LOGO;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-card-foreground">{businessInfo.name}</h3>
                      <p className="text-sm text-muted-foreground italic">{businessInfo.slogan}</p>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="flex gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg h-fit">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Dirección</p>
                      <p className="text-sm text-card-foreground">{businessInfo.address}</p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg h-fit">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Teléfono</p>
                      <p className="text-sm text-card-foreground">{businessInfo.phone}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg h-fit">
                      <Mail className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Correo Electrónico</p>
                      <p className="text-sm text-card-foreground">{businessInfo.email}</p>
                    </div>
                  </div>

                  {/* Sitio Web */}
                  <div className="flex gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg h-fit">
                      <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Sitio Web</p>
                      <p className="text-sm text-card-foreground">{businessInfo.website}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Banner Editor Section - SOLO PARA MANAGER */}
          {isAdmin && (
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-[#a2774c] to-[#2e636e] p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">Banner de Facturación</h2>
                    <p className="text-sm text-white/90">Personaliza el banner que verán tus clientes en el portal de facturación</p>
                  </div>
                  <Button
                    onClick={() => setShowBannerEditor(true)}
                    variant="outline"
                    className="bg-white text-[#a2774c] hover:bg-white/90 dark:bg-white dark:text-[#a2774c] border-2 border-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  El banner de facturación se muestra en los tickets impresos para el cliente. 
                  Personaliza el nombre, slogan, productos publicitarios y colores del banner.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Haz click en "Editar" para personalizar cómo se verá tu publicidad en los tickets del cliente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Settings Section */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Accesibilidad</h2>
                <p className="text-sm text-muted-foreground">
                  Personaliza tu experiencia visual - Usuario: {currentUser?.name || 'Invitado'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {accessibility.darkMode ? (
                    <Moon className="w-5 h-5 text-card-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-card-foreground" />
                  )}
                  <div>
                    <label htmlFor="dark-mode" className="text-base font-medium text-card-foreground cursor-pointer">
                      Modo Nocturno
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Reduce el brillo de la pantalla en ambientes oscuros
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={accessibility.darkMode}
                  onCheckedChange={(checked) => updateAccessibility({ darkMode: checked })}
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-card-foreground" />
                  <div>
                    <label htmlFor="reduced-motion" className="text-base font-medium text-card-foreground cursor-pointer">
                      Reducir Movimiento
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Minimiza animaciones y transiciones
                    </p>
                  </div>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={accessibility.reducedMotion}
                  onCheckedChange={(checked) => updateAccessibility({ reducedMotion: checked })}
                />
              </div>
            </div>

            {/* Accessibility Info */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Configuración Personal
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Estas configuraciones son específicas para tu usuario y se guardan automáticamente. 
                Los cambios se aplican de inmediato en toda la aplicación.
              </p>
            </div>

            {/* Preview Section */}
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Vista Previa
              </h3>
              <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h1 className="text-gray-900 dark:text-gray-100">Título Principal (H1)</h1>
                <h2 className="text-gray-800 dark:text-gray-200">Subtítulo (H2)</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Este es un párrafo de ejemplo para que puedas ver cómo se aplican 
                  las configuraciones de accesibilidad. El tamaño de texto, espaciado 
                  y contraste se ajustan según tus preferencias.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                    Botón Primario
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">
                    Botón Secundario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Información del Negocio */}
      {showBusinessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border modal-content">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Editar Información del Negocio</h2>
                  <p className="text-sm text-white/90">Actualiza los datos de tu taquería</p>
                </div>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-5">
                {/* Logo del Negocio */}
                <div>
                  <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-card-foreground">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Logo del Negocio
                  </label>
                  
                  {/* Vista previa del logo actual */}
                  {tempBusinessInfo.logoUrl && (
                    <div className="mb-3 flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="w-16 h-16 rounded-full overflow-hidden shadow-md bg-background border-2 border-primary flex-shrink-0">
                        <img 
                          src={tempBusinessInfo.logoUrl} 
                          alt="Logo actual" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_LOGO;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">Logo actual</p>
                        <p className="text-xs text-muted-foreground">Click en los botones para cambiar</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTempBusinessInfo({ ...tempBusinessInfo, logoUrl: '' })}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Botones para cargar logo */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Botón Tomar Foto */}
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Camera className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm font-medium text-card-foreground">Tomar Foto</span>
                      <span className="text-xs text-muted-foreground">Desde cámara</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTempBusinessInfo({ ...tempBusinessInfo, logoUrl: reader.result as string });
                              toast.success('Foto capturada correctamente');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Botón Elegir Archivo */}
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-secondary rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 text-secondary mb-2" />
                      <span className="text-sm font-medium text-card-foreground">Subir Archivo</span>
                      <span className="text-xs text-muted-foreground">Desde dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTempBusinessInfo({ ...tempBusinessInfo, logoUrl: reader.result as string });
                              toast.success('Imagen cargada correctamente');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Opción alternativa: URL */}
                  <div className="mt-3">
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-card-foreground flex items-center gap-1">
                        <span>O ingresa una URL de imagen</span>
                      </summary>
                      <div className="mt-2">
                        <input
                          type="url"
                          value={tempBusinessInfo.logoUrl}
                          onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, logoUrl: e.target.value })}
                          placeholder="https://ejemplo.com/logo.png"
                          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground text-sm"
                        />
                      </div>
                    </details>
                  </div>
                </div>

                {/* Nombre del Negocio */}
                <div>
                  <label htmlFor="businessName" className="flex items-center gap-2 mb-2 text-sm font-semibold text-card-foreground">
                    <Store className="w-4 h-4 text-primary" />
                    Nombre del Negocio
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={tempBusinessInfo.name}
                    onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, name: e.target.value })}
                    placeholder="Taquería POS"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                  />
                </div>

                {/* Eslogan */}
                <div>
                  <label htmlFor="slogan" className="flex items-center gap-2 mb-2 text-sm font-semibold text-card-foreground">
                    <Type className="w-4 h-4 text-primary" />
                    Eslogan
                  </label>
                  <input
                    id="slogan"
                    type="text"
                    value={tempBusinessInfo.slogan}
                    onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, slogan: e.target.value })}
                    placeholder="Los mejores tacos de la ciudad"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label htmlFor="address" className="flex items-center gap-2 mb-2 text-sm font-semibold text-card-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Dirección
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={tempBusinessInfo.address}
                    onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, address: e.target.value })}
                    placeholder="Calle Principal #123, Col. Centro"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="phone" className="flex items-center gap-2 mb-2 text-sm font-semibold text-card-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={tempBusinessInfo.phone}
                    onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, phone: e.target.value })}
                    placeholder="+52 55 1234 5678"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 mb-2 text-sm font-semibold text-card-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={tempBusinessInfo.email}
                    onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, email: e.target.value })}
                    placeholder="contacto@taqueria.com"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                  />
                </div>

                {/* Sitio Web */}
                <div>
                  <label htmlFor="website" className="flex items-center gap-2 mb-2 text-sm font-semibold text-card-foreground">
                    <Globe className="w-4 h-4 text-primary" />
                    Sitio Web
                  </label>
                  <input
                    id="website"
                    type="text"
                    value={tempBusinessInfo.website}
                    onChange={(e) => setTempBusinessInfo({ ...tempBusinessInfo, website: e.target.value })}
                    placeholder="www.taqueria.com"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground"
                  />
                </div>

                {saved && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                    ✓ Configuración guardada. Recargando...
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-6 flex gap-3 flex-shrink-0">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-3 bg-muted text-card-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBusiness}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Check className="w-5 h-5" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editor de Banner de Facturación */}
      {showBannerEditor && (
        <InvoiceBannerEditor onClose={() => setShowBannerEditor(false)} />
      )}
    </div>
  );
}