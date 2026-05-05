import { useState } from 'react';

import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useApp } from '../context/AppContext';
import type { User } from '../types';

import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { ActionButton, IconButton } from '../components/ui/ActionButton';
import { AddUserModal, NewUserData } from '../components/AddUserModal';
import { EditUserModal, EditUserData } from '../components/EditUserModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

// ============================================================================
// COMPONENT
// ============================================================================

export function UsersManagement() {
  // Context
  const { users, addUser, updateUser, deleteUser } = useApp();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [userToDelete, setUserToDelete] = useState<typeof users[0] | null>(null);

  // Estados derivados
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    getRoleLabel(user.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleAddUser = (userData: NewUserData) => {
    // La API se encargará de crear el ID y otros campos
    addUser({
      username: userData.username,
      password: userData.password,
      name: userData.name,
      role: userData.role,
    });
    setShowAddUserModal(false);
    
    // Disparar evento para que el Login se actualice
    window.dispatchEvent(new Event('usersUpdated'));
  };

  const handleEditUser = (user: typeof users[0]) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = (userId: string, userData: EditUserData) => {
    const updates: Partial<User> = {
      username: userData.username,
      name: userData.name,
      role: userData.role as 'admin' | 'manager' | 'waiter' | 'cashier',
      active: userData.active,
    };
    
    // Incluir contraseña solo si se proporcionó
    if (userData.password) {
      updates.password = userData.password;
    }
    
    updateUser(userId, updates);
    setShowEditUserModal(false);
    setSelectedUser(null);
    
    // Disparar evento para que el Login se actualice
    window.dispatchEvent(new Event('usersUpdated'));
  };

  const handleDeleteClick = (user: typeof users[0]) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
      setShowDeleteModal(false);
      
      // Disparar evento para que el Login se actualice
      window.dispatchEvent(new Event('usersUpdated'));
    }
  };

  // Funciones auxiliares
  const getRoleLabel = (role: string) => {
    const labels = {
      waiter: 'Mesero',
      cashier: 'Cajero',
      manager: 'Gerente',
      admin: 'Administrador',
    };
    return labels[role as keyof typeof labels];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      waiter: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      cashier: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      manager: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      admin: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    };
    return colors[role as keyof typeof colors];
  };

  // Render
  return (
    <div className="h-full flex flex-col bg-[#f8f6f3] dark:bg-gray-950 overflow-hidden">
      {/* Header */}
      <PageHeader
        breadcrumb="BACK OFFICE / USUARIOS"
        title="Gestión de Usuarios"
        subtitle="Administrar empleados y permisos"
        actions={
          <ActionButton
            onClick={() => setShowAddUserModal(true)}
            variant="primary"
            icon={Plus}
          >
            Agregar Usuario
          </ActionButton>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre, usuario o rol..."
          className="mb-6"
        />

        {/* Table */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rol
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
                {filteredUsers.map((user, index) => (
                  <tr key={user.id || `user-${index}`} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-card-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">{user.email || 'Sin email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <IconButton
                          icon={Pencil}
                          onClick={() => handleEditUser(user)}
                          variant="edit"
                          title="Editar"
                        />
                        <IconButton
                          icon={Trash2}
                          onClick={() => handleDeleteClick(user)}
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
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdd={handleAddUser}
        />
      )}

      {/* Modal Editar Usuario */}
      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditUserModal(false)}
          onSave={handleSaveEditUser}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {showDeleteModal && userToDelete && (
        <DeleteConfirmationModal
          title="Eliminar Usuario"
          message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
          itemName={userToDelete.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}