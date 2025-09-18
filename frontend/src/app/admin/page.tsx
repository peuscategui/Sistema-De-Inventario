'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { CreateGuard, EditGuard, DeleteGuard } from '@/components/auth/RoleGuard';
import { UserManagementGuard, PermissionManagementGuard } from '@/components/auth/SuperAdminGuard';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user: currentUser, canManageUsers, canManagePermissions, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
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

  const fetchAvailableRoles = async () => {
    try {
      console.log('🔍 Fetching roles from:', `${API_ENDPOINTS.roles}`);
      const token = localStorage.getItem('access_token');
      console.log('🔍 Token from localStorage:', token ? 'Present' : 'Missing');
      console.log('🔍 Full token:', token);
      
      const response = await fetch(`${API_ENDPOINTS.roles}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('🔍 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Roles data:', data);
        setAvailableRoles(data);
      } else {
        console.error('❌ Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching roles:', error);
    }
  };

  const fetchUserRoles = async (userId: number) => {
    try {
      console.log('🔍 Fetching user roles for user:', userId);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_ENDPOINTS.roles}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('🔍 User roles response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 User roles data:', data);
        const roleNames = data.map((ur: any) => ur.role.nombre);
        console.log('🔍 Setting userRoles to:', roleNames);
        setUserRoles(roleNames);
      } else {
        console.error('❌ Error fetching user roles:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching user roles:', error);
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

  const handleUserPermissions = async (user: User) => {
    console.log('🔍 Abriendo modal de permisos para usuario:', user);
    console.log('🔍 Usuario logueado actual:', { email: currentUser?.email, username: currentUser?.username, roles: currentUser?.roles });
    console.log('🔍 canManageUsers():', canManageUsers());
    console.log('🔍 isSuperAdmin():', isSuperAdmin());
    console.log('🔍 user roles del usuario seleccionado:', user.roles);
    setSelectedUser(user);
    
    // Esperar a que se carguen los roles antes de abrir el modal
    await fetchUserRoles(user.id);
    await fetchAvailableRoles();
    setShowPermissionModal(true);
  };

  const updateUserRoles = async (selectedRoles: string[]) => {
    if (!selectedUser) return;

    try {
      console.log('🔄 Actualizando roles para usuario:', selectedUser.id);
      console.log('🔄 Roles seleccionados:', selectedRoles);
      
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Obtener roles actuales del usuario directamente del backend
      console.log('🔍 Obteniendo roles actuales del backend...');
      const currentRolesResponse = await fetch(`${API_ENDPOINTS.roles}/user/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!currentRolesResponse.ok) {
        throw new Error('Error al obtener roles actuales');
      }
      
      const currentRolesData = await currentRolesResponse.json();
      const currentRoleNames = currentRolesData.map((ur: any) => ur.role.nombre);
      console.log('🔍 Roles actuales del backend:', currentRoleNames);

      // Primero eliminar todos los roles actuales
      console.log('🗑️ Eliminando roles actuales...');
      for (const role of currentRoleNames) {
        console.log(`🗑️ Eliminando rol: ${role}`);
        const removeResponse = await fetch(`${API_ENDPOINTS.roles}/remove`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ userId: selectedUser.id, roleName: role }),
        });
        console.log(`🗑️ Respuesta eliminar ${role}:`, removeResponse.status);
        
        if (!removeResponse.ok) {
          const errorText = await removeResponse.text();
          console.error(`❌ Error eliminando ${role}:`, errorText);
        }
      }

      // Luego asignar los nuevos roles
      console.log('➕ Asignando nuevos roles...');
      for (const role of selectedRoles) {
        console.log(`➕ Asignando rol: ${role}`);
        const assignResponse = await fetch(`${API_ENDPOINTS.roles}/assign`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId: selectedUser.id, roleName: role }),
        });
        console.log(`➕ Respuesta asignar ${role}:`, assignResponse.status);
        
        if (!assignResponse.ok) {
          const errorText = await assignResponse.text();
          console.error(`❌ Error asignando ${role}:`, errorText);
        }
      }

      // Recargar datos
      console.log('🔄 Recargando datos...');
      await fetchUsers();
      await fetchUserRoles(selectedUser.id);
      alert('Roles actualizados correctamente');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al actualizar roles');
    }
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

  const getUserRoleDisplay = (user: User) => {
    if (user.roles && user.roles.length > 0) {
      // Priorizar SUPER_ADMIN sobre otros roles
      if (user.roles.includes('SUPER_ADMIN')) {
        return { name: 'Super Administrador', color: 'bg-red-100 text-red-800' };
      }
      if (user.roles.includes('ADMIN')) {
        return { name: 'Administrador', color: 'bg-purple-100 text-purple-800' };
      }
      if (user.roles.includes('MANAGER')) {
        return { name: 'Gerente', color: 'bg-blue-100 text-blue-800' };
      }
      if (user.roles.includes('USER')) {
        return { name: 'Usuario', color: 'bg-gray-100 text-gray-800' };
      }
      if (user.roles.includes('VIEWER')) {
        return { name: 'Visualizador', color: 'bg-yellow-100 text-yellow-800' };
      }
    }
    
    // Fallback al sistema anterior
    return user.isAdmin 
      ? { name: 'Administrador', color: 'bg-purple-100 text-purple-800' }
      : { name: 'Usuario', color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          {!canManageUsers() && (
            <p className="text-sm text-gray-600 mt-1">
              Solo Super Administradores pueden gestionar usuarios y permisos
            </p>
          )}
        </div>
        <UserManagementGuard>
          <button
            onClick={() => setShowUserForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>➕</span>
            Nuevo Usuario
          </button>
        </UserManagementGuard>
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
                      const roleDisplay = getUserRoleDisplay(user);
                      return (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleDisplay.color}`}>
                          {roleDisplay.name}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <PermissionManagementGuard>
                      <button
                        onClick={() => handleUserPermissions(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        🔐 Permisos
                      </button>
                    </PermissionManagementGuard>
                    {!canManagePermissions() && (
                      <span className="text-gray-400 text-sm">Solo Super Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulario de usuario */}
      {showUserForm && canManageUsers() && (
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
      {showPermissionModal && selectedUser && canManagePermissions() && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Roles para {selectedUser.username}
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los roles que deseas asignar a este usuario:
              </p>
              
              <div className="space-y-3">
                {availableRoles.map(role => {
                  const isSelected = userRoles.includes(role.nombre);
                  
                  return (
                    <label key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserRoles([...userRoles, role.nombre]);
                          } else {
                            setUserRoles(userRoles.filter(r => r !== role.nombre));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{role.nombre}</div>
                        <div className="text-sm text-gray-600">{role.descripcion}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Permisos: {Array.isArray(role.permisos) ? role.permisos.join(', ') : 'N/A'}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedUser(null);
                  setUserRoles([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateUserRoles(userRoles);
                  setShowPermissionModal(false);
                  setSelectedUser(null);
                  setUserRoles([]);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Guardar Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 