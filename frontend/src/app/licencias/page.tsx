'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, KeySquare } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import LicensesList from '@/components/licencias/LicensesList';
import LicenseModal from '@/components/licencias/LicenseModal';
import LicensesDashboard from '@/components/licencias/LicensesDashboard';
import LicenseDetailModal from '@/components/licencias/LicenseDetailModal';

interface Licencia {
  id: number;
  codigoLicencia: string;
  nombre: string;
  tipoLicencia: string;
  proveedor: string;
  fechaCompra: string;
  fechaVencimiento?: string;
  costo: number;
  moneda: string;
  cantidadUsuarios: number;
  estado: string;
  asignadoA?: string;
  descripcion?: string;
  area?: { id: number; nombre: string };
  gerencia?: { id: number; nombre: string };
  createdAt: string;
  updatedAt: string;
}

export default function LicenciasPage() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLicencia, setSelectedLicencia] = useState<Licencia | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [licenciaToView, setLicenciaToView] = useState<Licencia | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [proveedorFilter, setProveedorFilter] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchLicencias();
  }, [currentPage, searchTerm, tipoFilter, estadoFilter, proveedorFilter]);

  const fetchLicencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm) {
        params.append('nombre', searchTerm);
      }
      if (tipoFilter) {
        params.append('tipoLicencia', tipoFilter);
      }
      if (estadoFilter) {
        params.append('estado', estadoFilter);
      }
      if (proveedorFilter) {
        params.append('proveedor', proveedorFilter);
      }

      const response = await fetch(`${API_ENDPOINTS.licencias}?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las licencias');
      }

      const data = await response.json();
      setLicencias(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLicencia = () => {
    setSelectedLicencia(null);
    setShowModal(true);
  };

  const handleViewLicencia = (licencia: Licencia) => {
    setLicenciaToView(licencia);
    setShowDetailModal(true);
  };

  const handleEditLicencia = (licencia: Licencia) => {
    setSelectedLicencia(licencia);
    setShowModal(true);
  };

  const handleDeleteLicencia = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta licencia?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.licencias}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la licencia');
      }

      await fetchLicencias();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleModalSave = async () => {
    setShowModal(false);
    await fetchLicencias();
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('nombre', searchTerm);
      if (tipoFilter) params.append('tipoLicencia', tipoFilter);
      if (estadoFilter) params.append('estado', estadoFilter);
      if (proveedorFilter) params.append('proveedor', proveedorFilter);

      const response = await fetch(`${API_ENDPOINTS.licencias}/export/excel?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al exportar los datos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `licencias_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al exportar');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setEstadoFilter('');
    setProveedorFilter('');
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <KeySquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Licencias</h1>
            <p className="text-muted-foreground">
              Total: {totalCount} licencia{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80"
          >
            {showDashboard ? 'Ocultar' : 'Mostrar'} Dashboard
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={handleCreateLicencia}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Licencia</span>
          </button>
        </div>
      </div>

      {/* Dashboard */}
      {showDashboard && (
        <div className="mb-6">
          <LicensesDashboard />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Buscar por nombre o código
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Servicio">Servicio</option>
              <option value="Subscripcion">Subscripción</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="Activa">Activa</option>
              <option value="Vencida">Vencida</option>
              <option value="PorVencer">Por Vencer</option>
              <option value="Suspendida">Suspendida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Proveedor</label>
            <input
              type="text"
              placeholder="Filtrar por proveedor..."
              value={proveedorFilter}
              onChange={(e) => setProveedorFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de Licencias */}
      <LicensesList
        licencias={licencias}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={handleViewLicencia}
        onEdit={handleEditLicencia}
        onDelete={handleDeleteLicencia}
      />

      {/* Modal de Edición */}
      {showModal && (
        <LicenseModal
          licencia={selectedLicencia}
          onClose={() => setShowModal(false)}
          onSave={handleModalSave}
        />
      )}

      {/* Modal de Detalles */}
      {showDetailModal && (
        <LicenseDetailModal
          licencia={licenciaToView}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
} 