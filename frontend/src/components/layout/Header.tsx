'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';

const getRoleDisplay = (user: any) => {
  if (user?.roles && user.roles.length > 0) {
    // Priorizar SUPER_ADMIN sobre otros roles
    if (user.roles.includes('SUPER_ADMIN')) {
      return 'Super Administrador';
    }
    if (user.roles.includes('ADMIN')) {
      return 'Administrador';
    }
    if (user.roles.includes('MANAGER')) {
      return 'Gerente';
    }
    if (user.roles.includes('USER')) {
      return 'Usuario';
    }
    if (user.roles.includes('VIEWER')) {
      return 'Visualizador';
    }
  }
  
  // Fallback al sistema anterior
  return user?.isAdmin ? 'Administrador' : 'Usuario';
};

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800">EFC INVENTARIO</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Información del usuario */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">
                  {user?.fullName || user?.username}
                </div>
                <div className="text-xs text-gray-500">
                  {getRoleDisplay(user)}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.username}
                </div>
                <div className="text-sm text-gray-500">{user?.email}</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.isAdmin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.isAdmin ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
              </div>
              
              <div className="py-2">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
} 