'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_ENDPOINTS } from '@/config/api';

interface ResumenFinanciero {
  totalEquipos: number;
  valorTotalRenovacion: number;
  valorPromedioPorEquipo: number;
}

interface AnalisisFamilia {
  familia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtilPromedio: number;
  subfamilias: AnalisisSubfamilia[];
}

interface AnalisisSubfamilia {
  familia: string;
  subfamilia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtil: number;
}

interface AnalisisFinanciero {
  resumen: ResumenFinanciero;
  porFamilia: AnalisisFamilia[];
  porSubfamilia: AnalisisSubfamilia[];
}

export default function AnalisisFinanciero() {
  const [analisis, setAnalisis] = useState<AnalisisFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'familia' | 'subfamilia'>('familia');

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAnalisisFinanciero = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await authenticatedFetch(API_ENDPOINTS.dashboardFinanciero);
        
        if (!response.ok) {
          throw new Error('Error al cargar el análisis financiero');
        }

        const data = await response.json();
        setAnalisis(data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalisisFinanciero();
  }, [authenticatedFetch, isAuthenticated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando análisis financiero...</div>
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

  if (!analisis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero de Renovación</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleDateString('es-PE')}
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total de Equipos</h3>
          <p className="text-3xl font-bold text-gray-900">{analisis.resumen.totalEquipos.toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Equipos activos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Total de Renovación</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorTotalRenovacion)}</p>
          <p className="text-gray-600 mt-1">Inversión total requerida</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Promedio por Equipo</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorPromedioPorEquipo)}</p>
          <p className="text-gray-600 mt-1">Costo promedio unitario</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTabActiva('familia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'familia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Familia
          </button>
          <button
            onClick={() => setTabActiva('subfamilia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'subfamilia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Subfamilia
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {tabActiva === 'familia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Familia</h2>
          
          <div className="grid gap-6">
            {analisis.porFamilia.map((familia, index) => (
              <div key={familia.familia} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{familia.familia}</h3>
                    <p className="text-gray-600">{familia.cantidad} equipos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(familia.valorTotalReposicion)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Promedio: {formatCurrency(familia.valorPromedioReposicion)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cantidad</p>
                    <p className="text-lg font-semibold">{familia.cantidad}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorTotalReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Promedio</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorPromedioReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Vida Útil Promedio</p>
                    <p className="text-lg font-semibold">{familia.vidaUtilPromedio} años</p>
                  </div>
                </div>

                {/* Subfamilias */}
                {familia.subfamilias.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Subfamilias</h4>
                    <div className="grid gap-3">
                      {familia.subfamilias.map((subfamilia) => (
                        <div key={subfamilia.subfamilia} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{subfamilia.subfamilia}</p>
                              <p className="text-sm text-gray-500">{subfamilia.cantidad} equipos</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(subfamilia.valorTotalReposicion)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(subfamilia.valorPromedioReposicion)} c/u
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tabActiva === 'subfamilia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Subfamilia</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Familia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subfamilia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Promedio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vida Útil
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisis.porSubfamilia.map((subfamilia, index) => (
                    <tr key={`${subfamilia.familia}-${subfamilia.subfamilia}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subfamilia.familia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.subfamilia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(subfamilia.valorTotalReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(subfamilia.valorPromedioReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.vidaUtil} años
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_ENDPOINTS } from '@/config/api';

interface ResumenFinanciero {
  totalEquipos: number;
  valorTotalRenovacion: number;
  valorPromedioPorEquipo: number;
}

interface AnalisisFamilia {
  familia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtilPromedio: number;
  subfamilias: AnalisisSubfamilia[];
}

interface AnalisisSubfamilia {
  familia: string;
  subfamilia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtil: number;
}

interface AnalisisFinanciero {
  resumen: ResumenFinanciero;
  porFamilia: AnalisisFamilia[];
  porSubfamilia: AnalisisSubfamilia[];
}

export default function AnalisisFinanciero() {
  const [analisis, setAnalisis] = useState<AnalisisFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'familia' | 'subfamilia'>('familia');

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAnalisisFinanciero = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await authenticatedFetch(API_ENDPOINTS.dashboardFinanciero);
        
        if (!response.ok) {
          throw new Error('Error al cargar el análisis financiero');
        }

        const data = await response.json();
        setAnalisis(data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalisisFinanciero();
  }, [authenticatedFetch, isAuthenticated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando análisis financiero...</div>
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

  if (!analisis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero de Renovación</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleDateString('es-PE')}
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total de Equipos</h3>
          <p className="text-3xl font-bold text-gray-900">{analisis.resumen.totalEquipos.toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Equipos activos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Total de Renovación</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorTotalRenovacion)}</p>
          <p className="text-gray-600 mt-1">Inversión total requerida</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Promedio por Equipo</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorPromedioPorEquipo)}</p>
          <p className="text-gray-600 mt-1">Costo promedio unitario</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTabActiva('familia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'familia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Familia
          </button>
          <button
            onClick={() => setTabActiva('subfamilia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'subfamilia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Subfamilia
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {tabActiva === 'familia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Familia</h2>
          
          <div className="grid gap-6">
            {analisis.porFamilia.map((familia, index) => (
              <div key={familia.familia} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{familia.familia}</h3>
                    <p className="text-gray-600">{familia.cantidad} equipos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(familia.valorTotalReposicion)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Promedio: {formatCurrency(familia.valorPromedioReposicion)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cantidad</p>
                    <p className="text-lg font-semibold">{familia.cantidad}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorTotalReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Promedio</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorPromedioReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Vida Útil Promedio</p>
                    <p className="text-lg font-semibold">{familia.vidaUtilPromedio} años</p>
                  </div>
                </div>

                {/* Subfamilias */}
                {familia.subfamilias.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Subfamilias</h4>
                    <div className="grid gap-3">
                      {familia.subfamilias.map((subfamilia) => (
                        <div key={subfamilia.subfamilia} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{subfamilia.subfamilia}</p>
                              <p className="text-sm text-gray-500">{subfamilia.cantidad} equipos</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(subfamilia.valorTotalReposicion)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(subfamilia.valorPromedioReposicion)} c/u
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tabActiva === 'subfamilia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Subfamilia</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Familia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subfamilia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Promedio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vida Útil
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisis.porSubfamilia.map((subfamilia, index) => (
                    <tr key={`${subfamilia.familia}-${subfamilia.subfamilia}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subfamilia.familia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.subfamilia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(subfamilia.valorTotalReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(subfamilia.valorPromedioReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.vidaUtil} años
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_ENDPOINTS } from '@/config/api';

interface ResumenFinanciero {
  totalEquipos: number;
  valorTotalRenovacion: number;
  valorPromedioPorEquipo: number;
}

interface AnalisisFamilia {
  familia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtilPromedio: number;
  subfamilias: AnalisisSubfamilia[];
}

interface AnalisisSubfamilia {
  familia: string;
  subfamilia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtil: number;
}

interface AnalisisFinanciero {
  resumen: ResumenFinanciero;
  porFamilia: AnalisisFamilia[];
  porSubfamilia: AnalisisSubfamilia[];
}

export default function AnalisisFinanciero() {
  const [analisis, setAnalisis] = useState<AnalisisFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'familia' | 'subfamilia'>('familia');

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAnalisisFinanciero = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await authenticatedFetch(API_ENDPOINTS.dashboardFinanciero);
        
        if (!response.ok) {
          throw new Error('Error al cargar el análisis financiero');
        }

        const data = await response.json();
        setAnalisis(data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalisisFinanciero();
  }, [authenticatedFetch, isAuthenticated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando análisis financiero...</div>
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

  if (!analisis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero de Renovación</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleDateString('es-PE')}
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total de Equipos</h3>
          <p className="text-3xl font-bold text-gray-900">{analisis.resumen.totalEquipos.toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Equipos activos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Total de Renovación</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorTotalRenovacion)}</p>
          <p className="text-gray-600 mt-1">Inversión total requerida</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Promedio por Equipo</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorPromedioPorEquipo)}</p>
          <p className="text-gray-600 mt-1">Costo promedio unitario</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTabActiva('familia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'familia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Familia
          </button>
          <button
            onClick={() => setTabActiva('subfamilia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'subfamilia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Subfamilia
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {tabActiva === 'familia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Familia</h2>
          
          <div className="grid gap-6">
            {analisis.porFamilia.map((familia, index) => (
              <div key={familia.familia} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{familia.familia}</h3>
                    <p className="text-gray-600">{familia.cantidad} equipos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(familia.valorTotalReposicion)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Promedio: {formatCurrency(familia.valorPromedioReposicion)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cantidad</p>
                    <p className="text-lg font-semibold">{familia.cantidad}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorTotalReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Promedio</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorPromedioReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Vida Útil Promedio</p>
                    <p className="text-lg font-semibold">{familia.vidaUtilPromedio} años</p>
                  </div>
                </div>

                {/* Subfamilias */}
                {familia.subfamilias.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Subfamilias</h4>
                    <div className="grid gap-3">
                      {familia.subfamilias.map((subfamilia) => (
                        <div key={subfamilia.subfamilia} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{subfamilia.subfamilia}</p>
                              <p className="text-sm text-gray-500">{subfamilia.cantidad} equipos</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(subfamilia.valorTotalReposicion)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(subfamilia.valorPromedioReposicion)} c/u
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tabActiva === 'subfamilia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Subfamilia</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Familia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subfamilia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Promedio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vida Útil
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisis.porSubfamilia.map((subfamilia, index) => (
                    <tr key={`${subfamilia.familia}-${subfamilia.subfamilia}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subfamilia.familia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.subfamilia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(subfamilia.valorTotalReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(subfamilia.valorPromedioReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.vidaUtil} años
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_ENDPOINTS } from '@/config/api';

interface ResumenFinanciero {
  totalEquipos: number;
  valorTotalRenovacion: number;
  valorPromedioPorEquipo: number;
}

interface AnalisisFamilia {
  familia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtilPromedio: number;
  subfamilias: AnalisisSubfamilia[];
}

interface AnalisisSubfamilia {
  familia: string;
  subfamilia: string;
  cantidad: number;
  valorTotalReposicion: number;
  valorPromedioReposicion: number;
  vidaUtil: number;
}

interface AnalisisFinanciero {
  resumen: ResumenFinanciero;
  porFamilia: AnalisisFamilia[];
  porSubfamilia: AnalisisSubfamilia[];
}

export default function AnalisisFinanciero() {
  const [analisis, setAnalisis] = useState<AnalisisFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'familia' | 'subfamilia'>('familia');

  const { authenticatedFetch } = useAuthenticatedFetch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAnalisisFinanciero = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await authenticatedFetch(API_ENDPOINTS.dashboardFinanciero);
        
        if (!response.ok) {
          throw new Error('Error al cargar el análisis financiero');
        }

        const data = await response.json();
        setAnalisis(data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalisisFinanciero();
  }, [authenticatedFetch, isAuthenticated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando análisis financiero...</div>
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

  if (!analisis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero de Renovación</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleDateString('es-PE')}
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total de Equipos</h3>
          <p className="text-3xl font-bold text-gray-900">{analisis.resumen.totalEquipos.toLocaleString()}</p>
          <p className="text-gray-600 mt-1">Equipos activos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Total de Renovación</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorTotalRenovacion)}</p>
          <p className="text-gray-600 mt-1">Inversión total requerida</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Valor Promedio por Equipo</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analisis.resumen.valorPromedioPorEquipo)}</p>
          <p className="text-gray-600 mt-1">Costo promedio unitario</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTabActiva('familia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'familia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Familia
          </button>
          <button
            onClick={() => setTabActiva('subfamilia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActiva === 'subfamilia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análisis por Subfamilia
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {tabActiva === 'familia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Familia</h2>
          
          <div className="grid gap-6">
            {analisis.porFamilia.map((familia, index) => (
              <div key={familia.familia} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{familia.familia}</h3>
                    <p className="text-gray-600">{familia.cantidad} equipos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(familia.valorTotalReposicion)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Promedio: {formatCurrency(familia.valorPromedioReposicion)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cantidad</p>
                    <p className="text-lg font-semibold">{familia.cantidad}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorTotalReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valor Promedio</p>
                    <p className="text-lg font-semibold">{formatCurrency(familia.valorPromedioReposicion)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Vida Útil Promedio</p>
                    <p className="text-lg font-semibold">{familia.vidaUtilPromedio} años</p>
                  </div>
                </div>

                {/* Subfamilias */}
                {familia.subfamilias.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Subfamilias</h4>
                    <div className="grid gap-3">
                      {familia.subfamilias.map((subfamilia) => (
                        <div key={subfamilia.subfamilia} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{subfamilia.subfamilia}</p>
                              <p className="text-sm text-gray-500">{subfamilia.cantidad} equipos</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(subfamilia.valorTotalReposicion)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(subfamilia.valorPromedioReposicion)} c/u
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tabActiva === 'subfamilia' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Análisis por Subfamilia</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Familia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subfamilia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Promedio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vida Útil
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisis.porSubfamilia.map((subfamilia, index) => (
                    <tr key={`${subfamilia.familia}-${subfamilia.subfamilia}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subfamilia.familia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.subfamilia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(subfamilia.valorTotalReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(subfamilia.valorPromedioReposicion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subfamilia.vidaUtil} años
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






