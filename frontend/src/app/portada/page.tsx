'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PortadaApps() {
  const router = useRouter();
  const { user } = useAuth();

  const shortcuts = [
    {
      title: 'Sistema de Inventario',
      description: 'Gestión de activos, clasificación y colaboradores',
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => router.push('/'),
      iconComponent: (
        <div className="w-32 h-32 rounded-2xl bg-[#283447] flex items-center justify-center shadow-lg p-4 relative">
          {/* Iconos de TI centrales */}
          <div className="grid grid-cols-2 gap-3 items-center justify-center">
            {/* Laptop */}
            <div className="w-8 h-6 border-2 border-green-400 rounded-sm relative">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 border-2 border-green-400 rounded-sm"></div>
              <div className="absolute top-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
            </div>
            
            {/* Monitor */}
            <div className="w-8 h-6 border-2 border-green-400 rounded-sm relative">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400"></div>
              <div className="absolute top-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
            </div>
            
            {/* PC/Torre */}
            <div className="w-6 h-8 border-2 border-green-400 rounded-sm relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
            </div>
            
            {/* Cámara */}
            <div className="w-6 h-6 border-2 border-green-400 rounded-full relative">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 border border-green-400"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dashboard de Soporte EFC',
      description: 'Panel con métricas de atención y tickets',
      color: 'from-indigo-500 to-indigo-600',
      onClick: () => {
        const soporteUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001' 
          : 'https://soporte.efc.com.pe/';
        window.open(soporteUrl, '_blank');
      },
      iconComponent: (
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg p-4 relative">
          {/* Iconos de soporte centrales */}
          <div className="grid grid-cols-2 gap-3 items-center justify-center">
            {/* Herramientas */}
            <div className="w-8 h-6 border-2 border-[#283447] relative">
              <div className="absolute top-1 left-1 w-4 h-1 border border-[#283447]"></div>
              <div className="absolute top-2 left-2 w-1 h-3 border border-[#283447]"></div>
              <div className="absolute top-3 left-1 w-1 h-1 bg-[#283447] rounded-full"></div>
            </div>
            
            {/* Ticket/Soporte */}
            <div className="w-8 h-6 border-2 border-[#283447] rounded-sm relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-[#283447] rounded-full"></div>
              <div className="absolute top-2 left-1 w-4 h-1 border border-[#283447]"></div>
              <div className="absolute top-3 left-1 w-2 h-1 border border-[#283447]"></div>
            </div>
            
            {/* Chat/Mensaje */}
            <div className="w-6 h-6 border-2 border-[#283447] rounded-full relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-[#283447] rounded-full"></div>
              <div className="absolute top-2 left-1 w-2 h-1 border border-[#283447]"></div>
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#283447] rounded-full"></div>
            </div>
            
            {/* Dashboard/Gráfico */}
            <div className="w-6 h-6 border-2 border-[#283447] rounded-sm relative">
              <div className="absolute top-1 left-1 w-1 h-1 bg-[#283447]"></div>
              <div className="absolute top-2 left-1 w-1 h-2 border border-[#283447]"></div>
              <div className="absolute top-3 left-2 w-1 h-1 bg-[#283447]"></div>
              <div className="absolute top-4 left-2 w-1 h-1 border border-[#283447]"></div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header minimalista */}
      <header className="bg-[#283447] border-b border-[#1e2a3a]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-[#283447] flex items-center justify-center shadow-md">
                <div className="text-white text-2xl">⚡</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">APP Soporte EFC</h1>
                <p className="text-sm text-gray-300">Portal de Aplicaciones</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.fullName || user.username}</div>
                  <div className="text-xs text-gray-300">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('permissions');
                    router.push('/login');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  title="Cerrar Sesión"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Título de bienvenida */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido, {user?.fullName || user?.username || 'Usuario'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accede a las aplicaciones disponibles para gestionar tu trabajo de manera eficiente
          </p>
        </div>

        {/* Tarjetas de aplicaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-200"
              onClick={shortcut.onClick}
            >
              {/* Contenido de la tarjeta */}
              <div className="relative p-8">
                <div className="flex items-center justify-center mb-6">
                  {shortcut.iconComponent}
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {shortcut.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {shortcut.description}
                  </p>
                  
                           {/* Botón de acción */}
                           <button
                             className="px-8 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 bg-[#283447] hover:bg-[#1e2a3a]"
                           >
                             Acceder →
                           </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer informativo */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Selecciona una aplicación para comenzar tu sesión de trabajo
          </p>
        </div>
      </main>
    </div>
  );
}
