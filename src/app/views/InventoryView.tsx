import { useState } from 'react';

import { toast } from 'sonner';

import { AlertTriangle, Camera, Check, DollarSign, Edit2, Image as ImageIcon, Layers, Package, Plus, Tag, Trash2, TrendingDown, Upload, X } from 'lucide-react';

import { useApp } from '../context/AppContext';

import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { ActionButton, IconButton } from '../components/ui/ActionButton';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

import { MenuItem } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

export function InventoryView() {
  // Context
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, currentUser, categories } = useApp();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null); // 🔥 Guardar el archivo File
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceProvider: '',
    priceClient: '',
    categoryId: '', // 🔥 Guardar ID en lugar de nombre
    stock: '',
    minStock: '',
    unit: 'unidades',
    active: true,
    imageUrl: '',
  });

  // Verificar si el usuario es administrador
  const isAdmin = currentUser?.role === 'manager';

  // Detectar productos con stock bajo
  const lowStockItems = menuItems
    .filter(item => item.stock <= item.minStock)
    .map(item => ({
      id: item.id,
      name: item.name,
      currentStock: item.stock,
      minStock: item.minStock,
      unit: 'unidades',
    }));

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestock = (itemId: string) => {
    toast.info('Función de reabastecimiento próximamente');
    // Aquí se implementaría la lógica de reabastecimiento
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        priceProvider: item.priceProvider.toString(),
        priceClient: item.priceClient.toString(),
        categoryId: item.categoryId, // 🔥 Guardar ID en lugar de nombre
        stock: item.stock.toString(),
        minStock: item.minStock.toString(),
        unit: item.unit || 'unidades',
        active: item.active,
        imageUrl: item.imageUrl || '',
      });
      setImagePreview(item.imageUrl || '');
    } else {
      // 🔥 Al crear nuevo, NO seleccionar nada por defecto
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        priceProvider: '',
        priceClient: '',
        categoryId: '', // 🔥 Vacío - forzar selección
        stock: '10',
        minStock: '5',
        unit: 'unidades',
        active: true,
        imageUrl: '',
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setImagePreview('');
    setImageFile(null); // 🔥 Limpiar archivo
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 Validar campos requeridos
    if (!formData.name || !formData.priceClient || !formData.priceProvider) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // 🔥 Validar que se haya seleccionado una categoría
    if (!formData.categoryId) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    if (editingItem) {
      await updateMenuItem(editingItem.id, {
        name: formData.name,
        description: formData.description,
        priceProvider: parseFloat(formData.priceProvider),
        priceClient: parseFloat(formData.priceClient),
        category: categories.find(c => c.id === formData.categoryId)?.name || '',
        categoryId: formData.categoryId, // 🔥 Guardar ID en lugar de nombre
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        unit: formData.unit,
        active: formData.active,
        imageUrl: formData.imageUrl,
        imageFile: imageFile || undefined, // 🔥 Incluir archivo si hay uno nuevo
      });
      // No mostrar toast aquí - se muestra en el context después de llamar a la API
    } else {
      const newItem = {
        name: formData.name,
        description: formData.description,
        priceProvider: parseFloat(formData.priceProvider),
        priceClient: parseFloat(formData.priceClient),
        category: categories.find(c => c.id === formData.categoryId)?.name || '', // 🔥 Buscar el nombre
        categoryId: formData.categoryId, // 🔥 Guardar ID en lugar de nombre
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        unit: formData.unit,
        active: formData.active,
        imageUrl: formData.imageUrl,
        imageFile: imageFile || undefined, // 🔥 Pasar el archivo File
      };
      await addMenuItem(newItem);
      // No mostrar toast aquí - se muestra en el context después de llamar a la API
    }

    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    const item = menuItems.find(i => i.id === id);
    if (item) {
      setItemToDelete(item);
      setShowDeleteModal(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / INVENTARIO"
        title="Inventario"
        subtitle="Gestión de productos del menú"
        actions={
          <div className="flex gap-3">
            {lowStockItems.length > 0 && (
              <ActionButton
                onClick={() => toast.info('Función de stock bajo próximamente')}
                variant="danger"
                icon={AlertTriangle}
              >
                Stock Bajo ({lowStockItems.length})
              </ActionButton>
            )}
            <ActionButton
              onClick={() => handleOpenModal()}
              variant="primary"
              icon={Plus}
            >
              Agregar Producto
            </ActionButton>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar productos..."
          className="mb-6"
        />

        {/* Products Table */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    P. Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    P. Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLowStock = item.stock <= item.minStock;
                    const isOutOfStock = item.stock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-card-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isOutOfStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {isLowStock && !isOutOfStock && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            <span className={`font-semibold ${isOutOfStock ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-yellow-600 dark:text-yellow-400' : 'text-card-foreground'}`}>
                              {item.stock}
                            </span>
                            <span className="text-xs text-muted-foreground">/ min: {item.minStock}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          ${Number(item.priceProvider).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-card-foreground">
                          ${Number(item.priceClient).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {item.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <IconButton
                              icon={Edit2}
                              onClick={() => handleOpenModal(item)}
                              variant="edit"
                              title="Editar"
                            />
                            <IconButton
                              icon={Trash2}
                              onClick={() => handleDelete(item.id, item.name)}
                              variant="delete"
                              title="Eliminar"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
          <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {/* Nombre del Producto */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Nombre del Producto *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Taco al pastor"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción del producto"
                      rows={2}
                      className="w-full px-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Precio Proveedor */}
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Precio Proveedor *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.priceProvider}
                        onChange={(e) => setFormData({ ...formData, priceProvider: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Precio al Cliente */}
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Precio al Cliente *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.priceClient}
                        onChange={(e) => setFormData({ ...formData, priceClient: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Categoría *
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-background text-card-foreground"
                        required
                      >
                        <option value="" disabled>Seleccionar categoría</option>
                        {categories.filter(cat => cat.active).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Stock Actual */}
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Stock Actual *
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Stock Mínimo */}
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      Stock Mínimo *
                    </label>
                    <div className="relative">
                      <TrendingDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-card-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Producto Activo */}
                  <div className="col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="activeProduct"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 text-primary rounded border-border focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-card-foreground">
                        Producto activo
                      </span>
                    </label>
                  </div>

                  {/* Imagen del Producto */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-card-foreground mb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagen del Producto (opcional)
                      </div>
                    </label>
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, imageUrl: '' });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Botón Tomar Foto */}
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-background transition-colors">
                          <Camera className="w-8 h-8 text-primary mb-2" />
                          <span className="text-sm font-medium text-card-foreground">Tomar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                  setFormData({ ...formData, imageUrl: reader.result as string });
                                  setImageFile(file); // 🔥 Guardar el archivo File
                                  toast.success('Foto capturada');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {/* Botón Elegir Archivo */}
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-secondary rounded-lg cursor-pointer hover:bg-background transition-colors">
                          <Upload className="w-8 h-8 text-secondary mb-2" />
                          <span className="text-sm font-medium text-card-foreground">Elegir Archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                  setFormData({ ...formData, imageUrl: reader.result as string });
                                  setImageFile(file); // 🔥 Guardar el archivo File
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
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-border flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <DeleteConfirmationModal
          title="Eliminar Producto"
          message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          itemName={itemToDelete.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deleteMenuItem(itemToDelete.id);
              // No mostrar toast aquí - se muestra en el context después de llamar a la API
            }
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
}