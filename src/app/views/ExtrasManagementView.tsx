/**
 * EXTRAS MANAGEMENT VIEW
 *
 * Vista para gestionar extras/modificaciones del menú
 * Solo accesible para rol 'admin'
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { ActionButton, IconButton } from '../components/ui/ActionButton';
import { Plus, Pencil, Trash2, Search, Tag } from 'lucide-react';
import { ExtraModal } from '../components/ExtraModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';

export function ExtrasManagementView() {
  const { extras, addExtra, updateExtra, deleteExtra, categoryExtras, productExtras } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<any>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [extraToDelete, setExtraToDelete] = useState<any>(null);

  const handleAddExtra = () => {
    setSelectedExtra(null);
    setShowModal(true);
  };

  const handleEditExtra = (extra: any) => {
    // Buscar las categorías y productos asociados a este extra
    const associatedCategoryIds: string[] = [];
    const associatedProductIds: string[] = [];

    // Buscar en categoryExtras
    categoryExtras.forEach((extraIds, categoryId) => {
      if (extraIds.includes(extra.id)) {
        associatedCategoryIds.push(categoryId);
      }
    });

    // Buscar en productExtras
    productExtras.forEach((extraIds, productId) => {
      if (extraIds.includes(extra.id)) {
        associatedProductIds.push(productId);
      }
    });

    // Crear el objeto con las relaciones
    const extraWithRelations = {
      ...extra,
      categoryIds: associatedCategoryIds,
      productIds: associatedProductIds,
    };

    setSelectedExtra(extraWithRelations);
    setShowModal(true);
  };

  const handleDeleteExtra = (id: string) => {
    const extra = extras.find((e) => e.id === id);
    if (extra) {
      setExtraToDelete(extra);
      setShowDeleteModal(true);
    }
  };

  const handleSaveExtra = async (extraData: any) => {
    if (selectedExtra) {
      // Editar extra existente
      await updateExtra(selectedExtra.id, {
        name: extraData.name,
        description: extraData.description || '',
        price: extraData.price,
        applicationType: extraData.applicationType,
        active: extraData.active !== false,
        categoryIds: extraData.categoryIds || [],
        productIds: extraData.productIds || [],
      });
    } else {
      // Crear nuevo extra
      await addExtra({
        id: Date.now().toString(),
        name: extraData.name,
        description: extraData.description || '',
        price: extraData.price,
        applicationType: extraData.applicationType,
        active: extraData.active !== false,
        createdAt: new Date(),
        categoryIds: extraData.categoryIds || [],
        productIds: extraData.productIds || [],
      });
    }
    setShowModal(false);
  };

  const handleConfirmDelete = async () => {
    if (extraToDelete) {
      await deleteExtra(extraToDelete.id);
    }
    setShowDeleteModal(false);
    setExtraToDelete(null);
  };

  const filteredExtras = extras.filter((extra) => {
    const matchesSearch = extra.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && extra.active) ||
      (filterActive === 'inactive' && !extra.active);
    return matchesSearch && matchesFilter;
  });

  const getApplicationTypeLabel = (type: string) => {
    const labels = {
      global: 'Global',
      category: 'Por categoría',
      product: 'Por producto',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f6f3] dark:bg-gray-950 overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / EXTRAS"
        title="Gestión de Extras"
        subtitle="Administra las modificaciones y extras disponibles"
        actions={
          <ActionButton
            onClick={() => handleAddExtra()}
            variant="primary"
            icon={Plus}
          >
            Nuevo Extra
          </ActionButton>
        }
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {/* Barra de acciones */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a2774c] w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar extras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#a2774c] focus:border-[#a2774c] bg-card text-card-foreground"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterActive === 'all'
                    ? 'bg-[#2e636e] text-white'
                    : 'bg-muted text-card-foreground hover:bg-muted/80'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterActive === 'active'
                    ? 'bg-[#2e636e] text-white'
                    : 'bg-muted text-card-foreground hover:bg-muted/80'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-[#2e636e] text-white'
                    : 'bg-muted text-card-foreground hover:bg-muted/80'
                }`}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de extras */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Extra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Disponibilidad
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
                {filteredExtras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Tag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p>No se encontraron extras</p>
                    </td>
                  </tr>
                ) : (
                  filteredExtras.map((extra) => (
                    <tr
                      key={extra.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-card-foreground">{extra.name}</p>
                          {extra.description && (
                            <p className="text-sm text-muted-foreground">{extra.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-card-foreground">
                          {getApplicationTypeLabel(extra.applicationType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-card-foreground">
                          {formatCurrency(extra.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {extra.applicationType === 'global' ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Todos los productos
                            </span>
                          ) : extra.applicationType === 'category' ? (
                            <span className="text-card-foreground">
                              Por categoría
                            </span>
                          ) : (
                            <span className="text-card-foreground">
                              Productos específicos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            extra.active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {extra.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <IconButton
                            icon={Pencil}
                            onClick={() => handleEditExtra(extra)}
                            variant="edit"
                            title="Editar"
                          />
                          <IconButton
                            icon={Trash2}
                            onClick={() => handleDeleteExtra(extra.id)}
                            variant="delete"
                            title="Eliminar"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales - FUERA del contenedor con overflow */}
      {showModal && (
        <ExtraModal
          extra={selectedExtra}
          onClose={() => setShowModal(false)}
          onSave={handleSaveExtra}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && extraToDelete && (
        <DeleteConfirmationModal
          title="Eliminar Extra"
          message="¿Estás seguro de que deseas eliminar este extra? Esta acción no se puede deshacer."
          itemName={extraToDelete.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}