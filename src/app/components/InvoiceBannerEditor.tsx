import { useState } from 'react';
import { X, Plus, Trash2, Palette, Type, AlertCircle, Upload, Camera, Image as ImageIcon, Check } from 'lucide-react';
import { useApp, InvoiceBannerProduct } from '../context/AppContext';
import { toast } from 'sonner';

interface InvoiceBannerEditorProps {
  onClose: () => void;
}

export function InvoiceBannerEditor({ onClose }: InvoiceBannerEditorProps) {
  const { invoiceBanner, updateInvoiceBanner } = useApp();
  const [formData, setFormData] = useState({
    ...invoiceBanner,
    products: [...invoiceBanner.products],
  });

  // Obtener logo y nombre del restaurante
  const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1722875183792-bebac14859b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzA4NTI2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080';
  const logoUrl = localStorage.getItem('taqueriaLogoUrl') || DEFAULT_LOGO;
  const restaurantName = localStorage.getItem('restaurantName') || 'Taquería POS';

  const handleAddProduct = () => {
    const newProduct: InvoiceBannerProduct = {
      id: Date.now().toString(),
      name: '',
      price: '',
      imageUrl: '',
    };
    setFormData({
      ...formData,
      products: [...formData.products, newProduct],
    });
  };

  const handleRemoveProduct = (id: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.id !== id),
    });
  };

  const handleUpdateProduct = (id: string, field: 'name' | 'price' | 'imageUrl', value: string) => {
    setFormData({
      ...formData,
      products: formData.products.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const handleSave = () => {
    if (!formData.systemName.trim()) {
      toast.error('El nombre del sistema es obligatorio');
      return;
    }

    if (!formData.slogan.trim()) {
      toast.error('El slogan es obligatorio');
      return;
    }

    // Validar que los productos tengan nombre y precio
    const invalidProducts = formData.products.filter(p => !p.name.trim() || !p.price.trim());
    if (invalidProducts.length > 0) {
      toast.error('Todos los productos deben tener nombre y precio');
      return;
    }

    updateInvoiceBanner(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#a2774c] to-[#2e636e] p-4 sm:p-6 text-white rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold mb-1">Editor de Banner de Facturación</h2>
            <p className="text-white/80 text-sm">Personaliza cómo se verá el banner en los tickets del cliente</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Vista Previa del Banner
            </h3>
            <div
              className="rounded-xl p-6 border-2 border-border"
              style={{
                backgroundColor: formData.backgroundColor,
                color: formData.textColor,
              }}
            >
              {/* Logo y nombre del restaurante */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-white/30">
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{restaurantName}</h2>
                  <p className="text-sm opacity-75">Sistema POS</p>
                </div>
              </div>

              {/* Nombre del sistema y slogan */}
              <div className="text-center mb-4 border-t border-white/20 pt-4">
                <h1 className="text-3xl font-bold mb-2">{formData.systemName || 'Nombre del Sistema'}</h1>
                <p className="text-lg font-medium opacity-90">{formData.slogan || 'Slogan aquí'}</p>
              </div>
              
              <p className="text-center mb-6 opacity-80">{formData.message}</p>
              
              {formData.products.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.products.map((product) => (
                    <div key={product.id} className="bg-white/10 rounded-lg overflow-hidden">
                      {/* Imagen del producto */}
                      {product.imageUrl && (
                        <div className="aspect-video w-full bg-white/5">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name || 'Producto'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {/* Información del producto */}
                      <div className="p-3">
                        <p className="font-semibold">{product.name || 'Nombre del producto'}</p>
                        <p className="text-sm opacity-90">{product.price || 'Precio'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* System Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Type className="inline w-4 h-4 mr-1" />
                Nombre del Sistema *
              </label>
              <input
                type="text"
                value={formData.systemName}
                onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                placeholder="Ej: La Taquería"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              />
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Type className="inline w-4 h-4 mr-1" />
                Slogan *
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                placeholder="Ej: La Mejor Taquería de la Ciudad"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mensaje Publicitario
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Ej: Disfruta nuestros auténticos tacos..."
                rows={3}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground resize-none"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Palette className="inline w-4 h-4 mr-1" />
                  Color de Fondo
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-12 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Palette className="inline w-4 h-4 mr-1" />
                  Color de Texto
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-12 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Productos Publicitarios
                </label>
                <button
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#a2774c] dark:bg-[#c8956b] text-white rounded-lg hover:bg-[#6c5033] dark:hover:bg-[#a2774c] transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </button>
              </div>

              <div className="space-y-3">
                {formData.products.map((product) => (
                  <div key={product.id} className="border border-border rounded-lg p-4 bg-muted/30">
                    {/* Nombre y Precio */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                        placeholder="Nombre del producto"
                        className="px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      />
                      <input
                        type="text"
                        value={product.price}
                        onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value)}
                        placeholder="Precio (Ej: 5 piezas $125)"
                        className="px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      />
                    </div>

                    {/* Imagen del Producto */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        <ImageIcon className="inline w-3 h-3 mr-1" />
                        Imagen del Producto (Opcional)
                      </label>
                      
                      {product.imageUrl ? (
                        <div className="relative">
                          <img
                            src={product.imageUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateProduct(product.id, 'imageUrl', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {/* Botón Tomar Foto */}
                          <label className="flex flex-col items-center justify-center p-3 border border-dashed border-primary/50 rounded-lg cursor-pointer hover:bg-background transition-colors">
                            <Camera className="w-5 h-5 text-primary mb-1" />
                            <span className="text-xs text-muted-foreground">Tomar Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleUpdateProduct(product.id, 'imageUrl', reader.result as string);
                                    toast.success('Foto capturada');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {/* Botón Subir Archivo */}
                          <label className="flex flex-col items-center justify-center p-3 border border-dashed border-secondary/50 rounded-lg cursor-pointer hover:bg-background transition-colors">
                            <Upload className="w-5 h-5 text-secondary mb-1" />
                            <span className="text-xs text-muted-foreground">Subir Archivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleUpdateProduct(product.id, 'imageUrl', reader.result as string);
                                    toast.success('Imagen cargada');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Botón Eliminar Producto */}
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Producto
                    </button>
                  </div>
                ))}
                {formData.products.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No hay productos agregados. Click en "Agregar Producto" para comenzar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-[#2e636e] dark:bg-[#3d7a89] text-white rounded-lg font-medium hover:bg-[#a2774c] dark:hover:bg-[#c8956b] transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}