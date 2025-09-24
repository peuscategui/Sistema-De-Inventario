'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from '@/config/api';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalEquipos: number;
  porcentajeBuenEstado: number;
  equiposObsoletos: number;
  totalBajas: number;
  familiaMasComun: {
    familia: string;
    _count: {
      id: number;
    };
  } | null;
  distribucionFamilia: Array<{
    familia: string;
    _count: {
      id: number;
    };
  }>;
}

// Iconos por familia
const FAMILIA_ICONS: { [key: string]: string } = {
  'COMPUTADORA': '💻',
  'SERVIDOR': '🖥️',
  'SWITCH': '🔌',
  'MONITOR': '🖥️',
  'TABLET': '📱',
  'VIDEOVIGILANCIA': '📹',
  'NVR': '📼',
  'IMPRESORA': '🖨️',
  'TELEFONIA': '☎️',
  'CONTROL BIOMETRICO': '👆',
  'RACK': '🗄️',
  'REDES': '🌐',
  'PROTECCION ELECTRICA': '⚡',
  'COLABORACION': '🤝',
  'DEFAULT': '📦'
};

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const [statsResponse, distribucionResponse] = await Promise.all([
          authenticatedFetch(API_ENDPOINTS.dashboard),
          authenticatedFetch(API_ENDPOINTS.dashboardDistribucion)
        ]);

        if (!statsResponse.ok || !distribucionResponse.ok) {
          throw new Error('Error al cargar los datos del dashboard');
        }

        const statsData = await statsResponse.json();
        const distribucionData = await distribucionResponse.json();

        setStats({
          ...statsData,
          distribucionFamilia: distribucionData || []
        });
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authenticatedFetch, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  // Ordenar familias por cantidad de equipos (de mayor a menor)
  const familiasOrdenadas = [...stats.distribucionFamilia].sort((a, b) => b._count.id - a._count.id);

  // Funciones para manejar clics en las tarjetas
  const handleTotalEquiposClick = () => {
    router.push('/inventario');
  };

  const handleEquiposBuenEstadoClick = () => {
    router.push('/inventario?condicion=OPERATIVO');
  };

  const handleEquiposObsoletosClick = () => {
    router.push('/inventario?condicion=OBSOLETO');
  };

  const handleTotalBajasClick = () => {
    router.push('/bajas');
  };

  const handleFamiliaMasComunClick = () => {
    if (stats.familiaMasComun?.familia) {
      router.push(`/inventario?familia=${encodeURIComponent(stats.familiaMasComun.familia)}`);
    }
  };

  const handleFamiliaClick = (familia: string) => {
    router.push(`/inventario?familia=${encodeURIComponent(familia)}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div 
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
          onClick={handleTotalEquiposClick}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Total de Equipos</h3>
            <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{(stats.totalEquipos || 0).toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Equipos registrados</p>
        </div>
        <div 
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
          onClick={handleEquiposBuenEstadoClick}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Equipos en Buen Estado</h3>
            <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.porcentajeBuenEstado || 0}%</p>
          <p className="text-gray-600 mt-1">Del total de equipos</p>
        </div>
        <div 
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
          onClick={handleEquiposObsoletosClick}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Equipos Obsoletos</h3>
            <span className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{(stats.equiposObsoletos || 0).toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Requieren actualización</p>
        </div>
        <div 
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
          onClick={handleTotalBajasClick}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Total de Bajas</h3>
            <span className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{(stats.totalBajas || 0).toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Equipos dados de baja</p>
        </div>
        <div 
          className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
          onClick={handleFamiliaMasComunClick}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Familia más Común</h3>
            <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.familiaMasComun?.familia || 'No hay datos'}</p>
          <p className="text-gray-600 mt-1">
            {(stats.familiaMasComun?._count.id || 0).toLocaleString()} unidades
          </p>
        </div>
      </div>

      {/* Distribución por Familias */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Distribución por Familias</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          {familiasOrdenadas.map((familia) => (
            <div 
              key={familia.familia}
              className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer group"
              onClick={() => handleFamiliaClick(familia.familia)}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 rounded-full">
                  <span className="text-2xl" role="img" aria-label={familia.familia}>
                    {FAMILIA_ICONS[familia.familia.toUpperCase()] || FAMILIA_ICONS['DEFAULT']}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">{familia.familia}</h3>
                  <p className="text-lg font-bold text-green-600">
                    {familia._count?.id || 0} {(familia._count?.id || 0) === 1 ? 'equipo' : 'equipos'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg">👁️</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
