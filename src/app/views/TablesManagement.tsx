import { useState } from 'react';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useApp } from '../context/AppContext';

import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { ActionButton, IconButton } from '../components/ui/ActionButton';
import { AddTableModal } from '../components/AddTableModal';
import { EditTableModal } from '../components/EditTableModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

// ============================================================================
// COMPONENT
// ============================================================================

export function TablesManagement() {
  // Context
  const { tables, addTable, updateTable, deleteTable } = useApp();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showEditTableModal, setShowEditTableModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{ number: number; status: string } | null>(null);
  const [tableToDelete, setTableToDelete] = useState<{ number: number } | null>(null);

  // Estados derivados
  const existingTableNumbers = tables.map(t => t.number);
  const filteredTables = tables.filter(table =>
    table.number.toString().includes(searchQuery) ||
    table.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.waiterName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleAddTable = async (tableNumber: number) => {
    // Crear objeto mesa con datos mínimos (sin id, se genera en el backend)
    const newTable = {
      number: tableNumber,
      capacity: 4, // Valor por defecto
      status: 'free' as const,
      currentOrder: null,
      currentOrderId: null,
      waiterId: null,
      waiterName: undefined,
      occupiedAt: undefined,
    };

    await addTable(newTable);
    setShowAddTableModal(false);
  };

  const handleEditTable = (table: { number: number; status: string }) => {
    setSelectedTable(table);
    setShowEditTableModal(true);
  };

  const handleSaveEditTable = (oldNumber: number, newNumber: number) => {
    if (oldNumber !== newNumber) {
      // Verificar que el nuevo número no exista
      if (existingTableNumbers.includes(newNumber)) {
        toast.error(`La mesa ${newNumber} ya existe`);
        return;
      }
      updateTable(oldNumber, { number: newNumber });
      toast.success(`Mesa ${oldNumber} actualizada a Mesa ${newNumber}`);
    }
    setShowEditTableModal(false);
    setSelectedTable(null);
  };

  const handleDeleteClick = (table: { number: number }) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (tableToDelete) {
      await deleteTable(tableToDelete.number);
      setTableToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    const colors = {
      free: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      occupied: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      billed: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      free: 'Libre',
      occupied: 'Ocupada',
      billed: 'En cuenta',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f6f3] dark:bg-gray-950 overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / MESAS"
        title="Gestión de Mesas"
        subtitle="Configurar mesas del restaurante"
        actions={
          <ActionButton
            onClick={() => setShowAddTableModal(true)}
            variant="primary"
            icon={Plus}
          >
            Agregar Mesa
          </ActionButton>
        }
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por número de mesa, estado o mesero..."
          className="mb-6"
        />

        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mesero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredTables.map((table) => (
                  <tr key={table.number} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-card-foreground">Mesa {table.number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(table.status)}`}>
                        {getStatusLabel(table.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {table.waiterName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {table.occupiedAt?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {table.orderId ? `#${table.orderId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <IconButton
                          icon={Pencil}
                          onClick={() => handleEditTable({ number: table.number, status: table.status })}
                          variant="edit"
                          title="Editar"
                        />
                        <IconButton
                          icon={Trash2}
                          onClick={() => handleDeleteClick({ number: table.number })}
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
      {showAddTableModal && (
        <AddTableModal
          existingTableNumbers={existingTableNumbers}
          onClose={() => setShowAddTableModal(false)}
          onAdd={handleAddTable}
        />
      )}

      {/* Modal Editar Mesa */}
      {showEditTableModal && selectedTable && (
        <EditTableModal
          table={selectedTable}
          onClose={() => setShowEditTableModal(false)}
          onSave={handleSaveEditTable}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {showDeleteModal && tableToDelete && (
        <DeleteConfirmationModal
          title="Eliminar Mesa"
          message="¿Estás seguro de que deseas eliminar esta mesa? Esta acción no se puede deshacer."
          itemName={`Mesa ${tableToDelete.number}`}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}