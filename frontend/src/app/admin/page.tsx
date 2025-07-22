'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  isAdmin: boolean;
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

  const fetchUserPermissions = async (userId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}/user/${userId}`);
      const data = await response.json();
      setUserPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar permisos del usuario:', error);
      setUserPermissions([]);
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
    setSelectedUser(user);
    fetchUserPermissions(user.id);
    setShowPermissionModal(true);
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
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>➕</span>
          Nuevo Usuario
        </button>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isAdmin ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUserPermissions(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      🔐 Permisos
                    </button>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Permisos para {selectedUser.username}
            </h3>
            
            <div className="space-y-4">
              {/* Agrupar permisos por recurso */}
              {Array.from(new Set(permissions.map(p => p.resource.name))).map(resourceName => {
                const resourcePermissions = permissions.filter(p => p.resource.name === resourceName);
                const resource = resourcePermissions[0]?.resource;
                
                return (
                  <div key={resourceName} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {resource?.displayName} ({resource?.name})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {resourcePermissions.map(permission => {
                        const hasPermission = userPermissions.some(up => 
                          up.permission.id === permission.id && up.granted
                        );
                        
                        return (
                          <label key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Agregar permiso
                                  setUserPermissions(prev => [...prev, {
                                    id: 0,
                                    granted: true,
                                    permission
                                  }]);
                                } else {
                                  // Quitar permiso
                                  setUserPermissions(prev => 
                                    prev.filter(up => up.permission.id !== permission.id)
                                  );
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {getActionIcon(permission.action)} {getActionName(permission.action)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                  const permissionIds = userPermissions
                    .filter(up => up.granted)
                    .map(up => up.permission.id);
                  updateUserPermissions(permissionIds);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Guardar Permisos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 