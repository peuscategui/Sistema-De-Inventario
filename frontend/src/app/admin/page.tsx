'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { ActionGuard } from '@/components/auth/PermissionGuard';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  isAdmin: boolean;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  action: string;
  resource: {
    id: number;
    name: string;
    displayName: string;
    description?: string;
  };
}

interface UserPermission {
  id: number;
  granted: boolean;
  permission: Permission;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Formulario de usuario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    isActive: true,
    isAdmin: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.users}`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsers([]);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}`);
      const data = await response.json();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState('USER');

  const fetchUserPermissions = async (userId: number) => {
    try {
      // Obtener el rol actual del usuario desde la base de datos
      const response = await fetch(`${API_ENDPOINTS.auth}/user-roles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Establecer el rol actual en el selector
        if (data.roles && data.roles.length > 0) {
          setSelectedRole(data.roles[0]);
        }
        console.log('🔍 Rol actual del usuario:', data);
      } else {
        // Si no hay endpoint, usar rol por defecto
        setSelectedRole('USER');
      }
    } catch (error) {
      console.error('Error al cargar rol del usuario:', error);
      setSelectedRole('USER');
    }
  };

  const changeUserRole = async (userId: number, newRole: string) => {
    try {
      console.log(`🔄 Cambiando rol del usuario ${userId} a ${newRole}`);
      
      const response = await fetch(`${API_ENDPOINTS.auth}/change-role/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Rol cambiado exitosamente:`, data);
        
        // Actualizar la lista de usuarios para reflejar el cambio
        fetchUsers();
        
        // Cerrar el modal
        setShowPermissionModal(false);
      } else {
        const errorData = await response.json();
        console.error('❌ Error al cambiar rol:', errorData);
        alert(`Error al cambiar rol: ${errorData.message || 'Error desconocido'}`);
      }
      
    } catch (error) {
      console.error('Error al cambiar rol del usuario:', error);
      alert(`Error al cambiar rol: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_ENDPOINTS.users}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUsers();
        setShowUserForm(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          fullName: '',
          isActive: true,
          isAdmin: false,
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear usuario');
    }
  };

  const handleUserPermissions = (user: User) => {
    console.log('🔍 handleUserPermissions llamado para usuario:', user);
    setSelectedUser(user);
    fetchUserPermissions(user.id);
    setShowPermissionModal(true);
    console.log('🔍 Modal de permisos abierto');
  };

  const updateUserPermissions = async (permissionIds: number[]) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}/user/${selectedUser.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissionIds }),
      });

      if (response.ok) {
        await fetchUserPermissions(selectedUser.id);
        alert('Permisos actualizados correctamente');
      } else {
        alert('Error al actualizar permisos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar permisos');
    }
  };

  const getActionIcon = (action: string) => {
    const icons = {
      read: '👁️',
      create: '➕',
      update: '✏️',
      delete: '🗑️',
    };
    return icons[action as keyof typeof icons] || '❓';
  };

  const getActionName = (action: string) => {
    const names = {
      read: 'Ver',
      create: 'Crear',
      update: 'Editar',
      delete: 'Eliminar',
    };
    return names[action as keyof typeof names] || action;
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <ActionGuard resource="users" action="create">
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>➕</span>
          Nuevo Usuario
        </button>
        </ActionGuard>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Usuarios del Sistema</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.fullName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const role = user.roles && user.roles.length > 0 ? user.roles[0] : (user.isAdmin ? 'ADMIN' : 'USER');
                      const labelMap: Record<string, string> = {
                        SUPER_ADMIN: 'Super Administrador',
                        ADMIN: 'Administrador',
                        USER: 'Usuario',
                        VIEWER: 'Visualizador',
                      };
                      const colorMap: Record<string, string> = {
                        SUPER_ADMIN: 'bg-yellow-100 text-yellow-800',
                        ADMIN: 'bg-purple-100 text-purple-800',
                        USER: 'bg-gray-100 text-gray-800',
                        VIEWER: 'bg-gray-100 text-gray-800',
                      };
                      const label = labelMap[role] || 'Usuario';
                      const color = colorMap[role] || 'bg-gray-100 text-gray-800';
                      return (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionGuard resource="users" action="edit">
                    <button
                      onClick={() => handleUserPermissions(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      🔐 Permisos
                    </button>
                    </ActionGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulario de usuario */}
      {showUserForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuevo Usuario</h3>
            <form onSubmit={handleSubmitUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Usuario activo
                </label>
              </div>
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                  Administrador
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de permisos */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Cambiar Rol para {selectedUser.username}
            </h3>
            
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">Seleccionar Rol:</span>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="VIEWER">👁️ Visualizador (Solo lectura)</option>
                  <option value="USER">👤 Usuario (Lectura y edición básica)</option>
                  <option value="ADMIN">⚙️ Administrador (Todas las funciones excepto gestión de usuarios)</option>
                  <option value="SUPER_ADMIN">👑 Super Administrador (Todas las funciones)</option>
                </select>
              </label>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedUser) {
                    changeUserRole(selectedUser.id, selectedRole);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Guardar Rol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 