'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, RefreshCw } from 'lucide-react';
import ClasificacionModal from '../../components/clasificacion/ClasificacionModal';

interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
  tipo_equipo: string | null;
  vida_util: string | null;
  valor_reposicion: number | null;
}

export default function ClasificacionPage() {
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

  const fetchClasificaciones = async (pageParam = page, pageSizeParam = pageSize, filtersParam = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        pageSize: pageSizeParam.toString(),
        ...(filtersParam.familia && { familia: filtersParam.familia }),
        ...(filtersParam.sub_familia && { sub_familia: filtersParam.sub_familia }),
        ...(filtersParam.tipo_equipo && { tipo_equipo: filtersParam.tipo_equipo })
      });

      const response = await fetch(`http://localhost:3002/clasificacion?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener los datos');
      const { data, pagination: paginationData } = await response.json();
        setClasificaciones(data);
      setPagination(paginationData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const fetchAllClasificaciones = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        pageSize: '10000', // Un número grande para obtener todos
        ...(filters.familia && { familia: filters.familia }),
        ...(filters.sub_familia && { sub_familia: filters.sub_familia }),
        ...(filters.tipo_equipo && { tipo_equipo: filters.tipo_equipo })
      });

      const response = await fetch(`http://localhost:3002/clasificacion?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener todos los datos');
      const { data } = await response.json();
      return data;
    } catch (err: any) {
      throw new Error('Error al obtener todas las clasificaciones');
    }
  };

  useEffect(() => {
    fetchClasificaciones();
  }, [page, pageSize, filters]);

  const handleFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, [activeFilter]: value }));
    setPage(1);
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
          clas.valor_reposicion ? Number(clas.valor_reposicion).toFixed(2) : ''
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
        const response = await fetch('http://localhost:3002/clasificacion/batch', {
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
        fetch(`http://localhost:3002/clasificacion/${id}`, { method: 'DELETE' })
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

  const handleEdit = (clasificacion: Clasificacion) => {
    setEditingClasificacion(clasificacion);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = editingClasificacion
        ? `http://localhost:3002/clasificacion/${editingClasificacion.id}`
        : 'http://localhost:3002/clasificacion';
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
      const response = await fetch(`http://localhost:3002/clasificacion/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar la clasificación');
      fetchClasificaciones(); // Recargar datos
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-8">
      {/* Header con acciones principales */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Clasificación</h1>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download size={16} />
              Exportar
              <svg
                className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportDropdown && (
              <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                <button
                  onClick={() => handleExport('all')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Exportar Todos los Registros
                </button>
                <button
                  onClick={() => handleExport('current')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Exportar Página Actual ({clasificaciones.length})
                </button>
                <button
                  onClick={() => handleExport('selected')}
                  disabled={selectedClasificaciones.length === 0}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    selectedClasificaciones.length === 0 ? 'text-gray-400 cursor-not-allowed' : ''
                  }`}
                >
                  Exportar Seleccionados ({selectedClasificaciones.length})
                </button>
              </div>
            )}
          </div>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            Importar
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleOpenModal}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Añadir Clasificación
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium">Filtrar por:</span>
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-card border border-border rounded-md px-3 py-2 flex items-center gap-2 min-w-[150px]"
          >
            <span>{filterOptions.find(opt => opt.id === activeFilter)?.label}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFilterDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-md shadow-lg">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setActiveFilter(option.id as typeof activeFilter);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    activeFilter === option.id ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          value={filters[activeFilter]}
          onChange={(e) => handleFilterChange(e.target.value)}
          placeholder={`Buscar por ${filterOptions.find(opt => opt.id === activeFilter)?.label.toLowerCase()}...`}
          className="flex-1 px-3 py-2 border border-border rounded-md bg-card max-w-md"
        />
        <button
          onClick={handleRefresh}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* Acciones masivas */}
      {selectedClasificaciones.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-yellow-800">
              {selectedClasificaciones.length} clasificación(es) seleccionada(s)
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Eliminar Seleccionadas
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="pageSize" className="mr-2 text-sm font-medium">Registros por página:</label>
          <select 
            id="pageSize" 
            value={pageSize} 
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-card border border-border rounded-md px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Página {page} de {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded-md disabled:opacity-50"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 border border-border rounded-md disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor de la tabla */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="p-4 sticky left-0 bg-gray-50 z-10">
                <input type="checkbox" onChange={handleSelectAll} checked={selectedClasificaciones.length === clasificaciones.length && clasificaciones.length > 0} />
              </th>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Familia</th>
              <th scope="col" className="px-6 py-3">Sub Familia</th>
              <th scope="col" className="px-6 py-3">Tipo de Equipo</th>
              <th scope="col" className="px-6 py-3">Vida Útil</th>
              <th scope="col" className="px-6 py-3">Valor Reposición</th>
              <th scope="col" className="px-6 py-3 sticky right-0 bg-gray-50 z-10 text-right">Acciones</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8">Cargando...</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center py-8 text-red-500">{error}</td></tr>
            ) : clasificaciones.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="w-4 p-4 sticky left-0 bg-white hover:bg-gray-50 z-10">
                  <input type="checkbox" className="rounded border-gray-300" checked={selectedClasificaciones.includes(item.id)} onChange={() => handleSelectClasificacion(item.id)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.familia || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.sub_familia || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.tipo_equipo || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.vida_util || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                  {item.valor_reposicion != null
                    ? `$${Number(item.valor_reposicion).toFixed(2)}`
                    : '-'}
                </td>
                <td className="px-6 py-4 sticky right-0 bg-white hover:bg-gray-50 z-10 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      <ClasificacionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingClasificacion}
        isEditing={!!editingClasificacion}
      />
    </div>
  );
} 