'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw, X, Eye } from 'lucide-react';
import ClasificacionModal from '@/components/clasificacion/ClasificacionModal';
import { API_ENDPOINTS } from '@/config/api';
import { CreateGuard, EditGuard, DeleteGuard } from '@/components/auth/RoleGuard';
import { ImportGuard } from '@/components/auth/ImportGuard';
// import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'; // TEMPORALMENTE DESACTIVADO

interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
  tipo_equipo: string | null;
  vida_util: string | null;
  valor_reposicion: number | null;
}

export default function ClasificacionPage() {
  // const { authenticatedFetch } = useAuthenticatedFetch(); // TEMPORALMENTE DESACTIVADO
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });
  const [activeFilter, setActiveFilter] = useState<'familia' | 'sub_familia' | 'tipo_equipo'>('familia');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedClasificaciones, setSelectedClasificaciones] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClasificacion, setEditingClasificacion] = useState<Clasificacion | null>(null);
  
  // State for view modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingClasificacion, setViewingClasificacion] = useState<Clasificacion | null>(null);

  // Filtros
  const [filters, setFilters] = useState({
    familia: '',
    sub_familia: '',
    tipo_equipo: ''
  });

  const filterOptions = [
    { id: 'familia', label: 'Familia' },
    { id: 'sub_familia', label: 'Sub Familia' },
    { id: 'tipo_equipo', label: 'Tipo de Equipo' }
  ];

  const fetchClasificaciones = async () => {
    setLoading(true);
    try {
      // CORREGIDO: usar pageSize en lugar de limit
      let url = `${API_ENDPOINTS.clasificacion}?page=${page}&pageSize=${pageSize}`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      console.log('🔍 DEBUG Clasificaciones: URL de solicitud:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener las clasificaciones');
      }
      const result = await response.json();
      
      console.log('🔍 DEBUG Clasificaciones: Respuesta del servidor:', result);
      
      // Ajustar según la estructura real del backend
      const clasificacionesData = result.data || result.items || result;
      const paginationData = result.pagination || result.meta || {
        totalCount: Array.isArray(clasificacionesData) ? clasificacionesData.length : 0,
        totalPages: 1
      };
      
      setClasificaciones(Array.isArray(clasificacionesData) ? clasificacionesData : []);
      setPagination(paginationData);
    } catch (err: any) {
      console.error('❌ Error al cargar clasificaciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClasificaciones = async () => {
    try {
      // CORREGIDO: usar pageSize en lugar de limit
      let url = `${API_ENDPOINTS.clasificacion}?page=1&pageSize=10000`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
              });

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener todos los datos');
      const result = await response.json();
      const data = result.data || result.items || result;
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      throw new Error('Error al obtener todas las clasificaciones');
    }
  };

  useEffect(() => {
    fetchClasificaciones();
  }, [page, pageSize, filters]);

  const handleFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, [activeFilter]: value }));
  };

  const handleSearch = () => {
    setPage(1); // Resetear a la primera página al buscar
    fetchClasificaciones();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    fetchClasificaciones();
  };

  // Funciones de exportar e importar
  const handleExport = async (exportType: 'all' | 'current' | 'selected') => {
    let dataToExport: Clasificacion[] = [];

    try {
      if (exportType === 'all') {
        dataToExport = await fetchAllClasificaciones();
      } else if (exportType === 'current') {
        dataToExport = clasificaciones;
      } else if (exportType === 'selected') {
        dataToExport = clasificaciones.filter(clas => selectedClasificaciones.includes(clas.id));
      }

      if (dataToExport.length === 0) {
        alert('No hay datos para exportar');
        return;
      }

      const csvContent = [
        ['ID', 'Familia', 'Sub Familia', 'Tipo de Equipo', 'Vida Útil', 'Valor Reposición'],
        ...dataToExport.map(clas => [
          clas.id,
          clas.familia || '',
          clas.sub_familia || '',
          clas.tipo_equipo || '',
          clas.vida_util || '',
          clas.valor_reposicion && !isNaN(Number(clas.valor_reposicion)) 
            ? Number(clas.valor_reposicion).toFixed(2) 
            : ''
        ])
      ].map(row => row.map(field => `"${String(field)}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const exportTypeText = exportType === 'all' ? 'todos' : exportType === 'current' ? 'página_actual' : 'seleccionados';
      link.setAttribute('download', `clasificaciones_${exportTypeText}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportDropdown(false);
    } catch (error) {
      alert(`Error al exportar: ${error}`);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const importData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        return {
          familia: values[1] || null,
          sub_familia: values[2] || null,
          tipo_equipo: values[3] || null,
          vida_util: values[4] || null,
          valor_reposicion: values[5] ? parseFloat(values[5]) : null
        };
      });

      try {
        const response = await fetch(API_ENDPOINTS.clasificacionBatch, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importData)
        });

        if (!response.ok) throw new Error('Error al importar los datos');
        
        await fetchClasificaciones();
        alert('Importación completada exitosamente');
      } catch (err: any) {
        alert(`Error en la importación: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkDelete = async () => {
    if (selectedClasificaciones.length === 0) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${selectedClasificaciones.length} clasificaciones?`)) return;

    try {
      const deletePromises = selectedClasificaciones.map(id => 
        fetch(`${API_ENDPOINTS.clasificacion}/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      await fetchClasificaciones();
      setSelectedClasificaciones([]);
    } catch (err: any) {
      setError('Error al eliminar clasificaciones');
    }
  };

  const handleSelectAll = () => {
    if (selectedClasificaciones.length === clasificaciones.length) {
      setSelectedClasificaciones([]);
    } else {
      setSelectedClasificaciones(clasificaciones.map(clas => clas.id));
    }
  };

  const handleSelectClasificacion = (id: number) => {
    setSelectedClasificaciones(prev => 
      prev.includes(id) 
        ? prev.filter(clasId => clasId !== id)
        : [...prev, id]
    );
  };

  const handleOpenModal = () => {
    setEditingClasificacion(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClasificacion(null);
  };

  const handleView = (clasificacion: Clasificacion) => {
    setViewingClasificacion(clasificacion);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingClasificacion(null);
  };

  const handleEdit = (clasificacion: Clasificacion) => {
    setEditingClasificacion(clasificacion);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = editingClasificacion
        ? `${API_ENDPOINTS.clasificacion}/${editingClasificacion.id}`
        : API_ENDPOINTS.clasificacion;
      const method = editingClasificacion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(editingClasificacion ? 'Error al actualizar' : 'Error al crear');
      }
      
      handleCloseModal();
      fetchClasificaciones(); // Recargar datos
    } catch (error) {
      console.error(error);
      // Aquí podrías mostrar una notificación de error
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta clasificación?')) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.clasificacion}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar la clasificación');
      fetchClasificaciones(); // Recargar datos
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clasificación</h1>
        <CreateGuard>
          <button
            onClick={handleOpenModal}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Nueva Clasificación
          </button>
        </CreateGuard>
      </div>

      {/* Barra de filtros y acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'familia' | 'sub_familia' | 'tipo_equipo')}
            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-green-200 [&>option]:bg-white"
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id} className="bg-white text-gray-700">
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex-1 flex gap-2 max-w-xl">
            <input
              type="text"
              value={filters[activeFilter]}
              onChange={(e) => handleFilterChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Buscar por ${filterOptions.find(opt => opt.id === activeFilter)?.label.toLowerCase()}`}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              onClick={handleSearch}
              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
            >
              <Search size={20} />
              Buscar
            </button>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={() => {
                  setFilters({ familia: '', sub_familia: '', tipo_equipo: '' });
                  setPage(1);
                }}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-100"
              >
                <X size={20} />
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Registros por página:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded-lg px-2 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-green-600 hover:text-green-700 disabled:text-gray-400"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="text-green-600 hover:text-green-700 disabled:text-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleRefresh}
          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
        >
          <RefreshCw size={20} />
          Actualizar
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('all')}
            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
          >
            <Download size={20} />
            Exportar
          </button>
          <ImportGuard>
            <label className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100 cursor-pointer">
              <Upload size={20} />
              Importar
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </ImportGuard>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedClasificaciones.length === clasificaciones.length && clasificaciones.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-2 text-left uppercase">Familia</th>
                <th className="px-4 py-2 text-left uppercase">Sub Familia</th>
                <th className="px-4 py-2 text-left uppercase">Tipo de Equipo</th>
                <th className="px-4 py-2 text-left uppercase">Vida Útil</th>
                <th className="px-4 py-2 text-left uppercase">Valor Reposición</th>
                <th className="px-4 py-2 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 uppercase">
                    Cargando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-red-600 uppercase">
                    {error}
                  </td>
                </tr>
              ) : clasificaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 uppercase">
                    No hay clasificaciones para mostrar
                  </td>
                </tr>
              ) : (
                clasificaciones.map((clasificacion) => (
                  <tr key={clasificacion.id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedClasificaciones.includes(clasificacion.id)}
                        onChange={() => handleSelectClasificacion(clasificacion.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 uppercase">{clasificacion.familia || '-'}</td>
                    <td className="px-4 py-2 uppercase">{clasificacion.sub_familia || '-'}</td>
                    <td className="px-4 py-2 uppercase">{clasificacion.tipo_equipo || '-'}</td>
                    <td className="px-4 py-2 uppercase">{clasificacion.vida_util || '-'}</td>
                    <td className="px-4 py-2 uppercase">
                      {clasificacion.valor_reposicion 
                        ? `$${clasificacion.valor_reposicion.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                        : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(clasificacion)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye size={20} />
                        </button>
                        <EditGuard>
                          <button
                            onClick={() => handleEdit(clasificacion)}
                            className="text-primary hover:text-primary/80"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </button>
                        </EditGuard>
                        <DeleteGuard>
                          <button
                            onClick={() => handleDelete(clasificacion.id)}
                            className="text-destructive hover:text-destructive/80"
                            title="Eliminar"
                          >
                            <Trash2 size={20} />
                          </button>
                        </DeleteGuard>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClasificacionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingClasificacion}
        isEditing={!!editingClasificacion}
      />

      {/* Modal de visualización */}
      {isViewModalOpen && viewingClasificacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles de la Clasificación</h2>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Familia
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingClasificacion.familia || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Familia
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingClasificacion.sub_familia || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Equipo
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingClasificacion.tipo_equipo || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vida Útil (años)
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingClasificacion.vida_util || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Reposición
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingClasificacion.valor_reposicion 
                    ? `$${viewingClasificacion.valor_reposicion.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : 'No especificado'}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseViewModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 