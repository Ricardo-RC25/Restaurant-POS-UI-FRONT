/**
 * EXTRA MODAL
 * 
 * Modal para crear/editar extras con asignación a categorías y productos
 */

import { useState, useEffect } from 'react';
import { DollarSign, Package, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FormModal } from './FormModal';
import { FormField, InputField, TextAreaField, CheckboxField } from './FormField';
import { isValidPrice, PRICE_ERROR_MESSAGE } from '../utils/priceValidation';

interface ExtraModalProps {
  extra: any;
  onClose: () => void;
  onSave: (extraData: any) => void;
}

export function ExtraModal({ extra, onClose, onSave }: ExtraModalProps) {
  const { categories, menuItems } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    active: true,
    applicationType: 'global' as 'global' | 'category' | 'product',
    applyToAllProducts: false,
    categoryIds: [] as string[],
    productIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (extra) {
      console.log('📝 [ExtraModal] Cargando extra para editar:', {
        id: extra.id,
        name: extra.name,
        applicationType: extra.applicationType,
        categoryIds: extra.categoryIds,
        productIds: extra.productIds,
      });

      setFormData({
        name: extra.name,
        description: extra.description || '',
        price: extra.price,
        active: extra.active !== false,
        applicationType: extra.applicationType || 'global',
        applyToAllProducts: extra.applicationType === 'global',
        categoryIds: extra.categoryIds || [],
        productIds: extra.productIds || [],
      });
    }
  }, [extra]);

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds?.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...(prev.categoryIds || []), categoryId],
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds?.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...(prev.productIds || []), productId],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.price < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    } else if (formData.price > 0 && !isValidPrice(formData.price)) {
      newErrors.price = PRICE_ERROR_MESSAGE;
    }

    if (!formData.applyToAllProducts) {
      if (!formData.categoryIds?.length && !formData.productIds?.length) {
        newErrors.application = 'Debe seleccionar al menos una categoría o producto';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Determinar el tipo de aplicación basado en las selecciones
      let applicationType: 'global' | 'category' | 'product' = 'global';

      if (!formData.applyToAllProducts) {
        if (formData.productIds.length > 0) {
          applicationType = 'product';
        } else if (formData.categoryIds.length > 0) {
          applicationType = 'category';
        }
      }

      const dataToSave = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        active: formData.active,
        applicationType,
        categoryIds: formData.categoryIds,
        productIds: formData.productIds,
      };

      console.log('💾 [ExtraModal] Guardando extra:', dataToSave);

      onSave(dataToSave);
    }
  };

  // Safe defaults para evitar undefined
  const safeCategories = categories || [];
  const safeMenuItems = menuItems || [];

  return (
    <FormModal
      title={extra ? 'Editar Extra' : 'Crear Nuevo Extra'}
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* Nombre */}
      <FormField label="Nombre del Extra" required error={errors.name}>
        <InputField
          icon={Tag}
          type="text"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="Ej: Extra salsa"
          error={!!errors.name}
        />
      </FormField>

      {/* Descripción */}
      <FormField label="Descripción (opcional)">
        <TextAreaField
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="Descripción del extra"
          rows={2}
        />
      </FormField>

      {/* Precio */}
      <FormField label="Precio Adicional" required error={errors.price} helpText="Ingresa 0 si es gratis. Ej: 5, 10, 4.50, 10.50">
        <InputField
          icon={DollarSign}
          type="number"
          step="0.50"
          min="0"
          value={formData.price.toString()}
          onChange={(value) => setFormData({ ...formData, price: parseFloat(value) || 0 })}
          placeholder="0"
          error={!!errors.price}
        />
      </FormField>

      {/* Estado */}
      <CheckboxField
        label="Extra activo"
        checked={formData.active}
        onChange={(checked) => setFormData({ ...formData, active: checked })}
      />

      {/* Aplicación */}
      <FormField label="Dónde aplica este extra" required error={errors.application}>
        {/* Aplicar a todos */}
        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-border rounded-xl hover:border-primary transition-colors bg-card">
            <input
              type="checkbox"
              checked={formData.applyToAllProducts}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  applyToAllProducts: e.target.checked,
                  categoryIds: e.target.checked ? [] : formData.categoryIds,
                  productIds: e.target.checked ? [] : formData.productIds,
                });
              }}
              className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-card-foreground">Aplicar a todos los productos</p>
              <p className="text-xs text-muted-foreground">
                Este extra estará disponible en todo el menú
              </p>
            </div>
          </label>
        </div>

        {/* Categorías específicas */}
        {!formData.applyToAllProducts && (
          <>
            <p className="text-sm font-semibold text-card-foreground mb-2">
              O selecciona categorías específicas:
            </p>
            <div className="space-y-2 mb-4">
              {safeCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer p-3 border-2 border-border rounded-xl hover:border-primary transition-colors bg-card"
                >
                  <input
                    type="checkbox"
                    checked={formData.categoryIds?.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-card-foreground">{category.name}</span>
                </label>
              ))}
            </div>

            {/* Productos específicos */}
            <p className="text-sm font-semibold text-card-foreground mb-2">
              O productos individuales:
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 border-2 border-border rounded-xl p-3 bg-card">
              {safeMenuItems.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.productIds?.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-card-foreground">{product.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{product.category}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </FormField>
    </FormModal>
  );
}