import { useState } from 'react';

import { Check, FileText, FolderOpen, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { useApp } from '../context/AppContext';

import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { ActionButton, IconButton } from '../components/ui/ActionButton';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { FormModal } from '../components/FormModal';
import { FormField, InputField, TextAreaField, CheckboxField } from '../components/FormField';

import { Category } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

export function CategoriesView() {
  // Context
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });

  // Estados derivados
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        active: category.active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await addCategory(formData);
    }

    handleCloseModal();
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / CATEGORÍAS"
        title="Categorías"
        subtitle="Administra las categorías del menú"
        actions={
          <ActionButton
            onClick={() => handleOpenModal()}
            variant="primary"
            icon={Plus}
          >
            Agregar Categoría
          </ActionButton>
        }
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar categorías..."
          className="mb-6"
        />

        {/* Categories Table */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Productos
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
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-card-foreground">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">{category.productCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {category.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <IconButton
                          icon={Pencil}
                          onClick={() => handleOpenModal(category)}
                          variant="edit"
                          title="Editar"
                        />
                        <IconButton
                          icon={Trash2}
                          onClick={() => handleDeleteClick(category)}
                          variant="delete"
                          title="Eliminar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales - FUERA del contenedor con overflow */}
      <FormModal
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      >
        <FormField label="Nombre" required>
          <InputField
            icon={Tag}
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Ej: Tacos, Quesadillas"
          />
        </FormField>

        <FormField label="Descripción (opcional)">
          <TextAreaField
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Descripción de la categoría"
            rows={2}
          />
        </FormField>

        <CheckboxField
          label="Categoría activa"
          checked={formData.active}
          onChange={(checked) => setFormData({ ...formData, active: checked })}
        />
      </FormModal>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && categoryToDelete && (
        <DeleteConfirmationModal
          title="Eliminar Categoría"
          message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
          itemName={categoryToDelete.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}