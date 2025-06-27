'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw, X, Eye } from 'lucide-react';
import ColaboradorModal from '@/components/colaboradores/ColaboradorModal';
import { API_ENDPOINTS } from '@/config/api';

export interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
  gerencia: string | null;
  apellido: string | null;
  sede: string | null;
}

export default function ColaboradoresPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });
  const [activeFilter, setActiveFilter] = useState<'nombre' | 'cargo' | 'gerencia'>('nombre');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpleados, setSelectedEmpleados] = useState<number[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    nombre: '',
    cargo: '',
    gerencia: ''
  });

  const filterOptions = [
    { id: 'nombre', label: 'Nombre' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'gerencia', label: 'Gerencia' }
  ];

  // State for modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Partial<Empleado> | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // State for view modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEmpleado, setViewingEmpleado] = useState<Empleado | null>(null);

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.colaboradores}?page=${page}&limit=${pageSize}`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los empleados');
      }
      const { data, pagination: paginationData } = await response.json();
      setEmpleados(data);
      setPagination(paginationData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmpleados = async () => {
    try {
      let url = `${API_ENDPOINTS.colaboradores}?page=1&limit=10000`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener todos los datos');
      const { data } = await response.json();
      return data;
    } catch (err: any) {
      throw new Error('Error al obtener todos los colaboradores');
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [page, pageSize, filters]);

  const handleFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, [activeFilter]: value }));
    setPage(1);
  };

  const handleRefresh = () => {
    fetchEmpleados();
  };

  const handleOpenModal = (empleado: Empleado | null = null) => {
    if (empleado) {
      setSelectedEmpleado(empleado);
      setIsEditing(true);
    } else {
      setSelectedEmpleado({ nombre: '', cargo: '', gerencia: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
    setModalError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmpleado(null);
    setIsEditing(false);
    setModalError(null);
  };

  const handleView = (empleado: Empleado) => {
    setViewingEmpleado(empleado);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingEmpleado(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setModalError(null);

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `${API_ENDPOINTS.colaboradores}/${selectedEmpleado?.id}`
      : API_ENDPOINTS.colaboradores;
    
    const payload = {
      nombre: data.nombre,
      cargo: data.cargo,
      gerencia: data.gerencia,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (Array.isArray(errorData.message)) {
          throw new Error(errorData.message.join(', '));
        }
        throw new Error(errorData.message || 'Error al guardar el colaborador');
      }

      await fetchEmpleados();
      handleCloseModal();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este colaborador?')) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.colaboradores}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar el colaborador');
      await fetchEmpleados();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones de exportar e importar
  const handleExport = async (exportType: 'all' | 'current' | 'selected') => {
    let dataToExport: Empleado[] = [];

    try {
      if (exportType === 'all') {
        dataToExport = await fetchAllEmpleados();
      } else if (exportType === 'current') {
        dataToExport = empleados;
      } else if (exportType === 'selected') {
        dataToExport = empleados.filter(emp => selectedEmpleados.includes(emp.id));
      }

      if (dataToExport.length === 0) {
        alert('No hay datos para exportar');
        return;
      }

      const csvContent = [
        ['ID', 'Nombre', 'Cargo', 'Gerencia'],
        ...dataToExport.map(emp => [emp.id, emp.nombre, emp.cargo || '', emp.gerencia || ''])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const exportTypeText = exportType === 'all' ? 'todos' : exportType === 'current' ? 'página_actual' : 'seleccionados';
      link.setAttribute('download', `colaboradores_${exportTypeText}_${new Date().toISOString().split('T')[0]}.csv`);
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
          nombre: values[1] || '',
          cargo: values[2] || null,
          gerencia: values[3] || null
        };
      });

      try {
        const response = await fetch(API_ENDPOINTS.colaboradoresBatch, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importData)
        });

        if (!response.ok) throw new Error('Error al importar los datos');
        
        await fetchEmpleados();
        alert('Importación completada exitosamente');
      } catch (err: any) {
        alert(`Error en la importación: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkDelete = async () => {
    if (selectedEmpleados.length === 0) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${selectedEmpleados.length} colaboradores?`)) return;

    setIsSubmitting(true);
    try {
      const deletePromises = selectedEmpleados.map(id => 
        fetch(`${API_ENDPOINTS.colaboradores}/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      await fetchEmpleados();
      setSelectedEmpleados([]);
    } catch (err: any) {
      setError('Error al eliminar colaboradores');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmpleados.length === empleados.length) {
      setSelectedEmpleados([]);
    } else {
      setSelectedEmpleados(empleados.map(emp => emp.id));
    }
  };

  const handleSelectEmpleado = (id: number) => {
    setSelectedEmpleados(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Nuevo Colaborador
        </button>
      </div>

      {/* Barra de filtros y acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'nombre' | 'cargo' | 'gerencia')}
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
              placeholder={`Buscar por ${filterOptions.find(opt => opt.id === activeFilter)?.label.toLowerCase()}`}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              onClick={handleRefresh}
              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
            >
              <RefreshCw size={20} />
              Actualizar
            </button>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={() => {
                  setFilters({ nombre: '', cargo: '', gerencia: '' });
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
                    checked={selectedEmpleados.length === empleados.length && empleados.length > 0}
                    onChange={() => handleSelectAll()}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-2 text-left uppercase">Nombre</th>
                <th className="px-4 py-2 text-left uppercase">Cargo</th>
                <th className="px-4 py-2 text-left uppercase">Gerencia</th>
                <th className="px-4 py-2 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 uppercase">
                    Cargando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-red-600 uppercase">
                    {error}
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 uppercase">
                    No hay colaboradores para mostrar
                  </td>
                </tr>
              ) : (
                empleados.map((empleado) => (
                  <tr key={empleado.id} className="border-t">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedEmpleados.includes(empleado.id)}
                        onChange={() => handleSelectEmpleado(empleado.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 uppercase">{empleado.nombre}</td>
                    <td className="px-4 py-2 uppercase">{empleado.cargo || '-'}</td>
                    <td className="px-4 py-2 uppercase">{empleado.gerencia || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(empleado)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(empleado)}
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(empleado.id)}
                          className="text-destructive hover:text-destructive/80"
                          title="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ColaboradorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        empleado={selectedEmpleado}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        error={modalError}
      />

      {/* Modal de visualización */}
      {isViewModalOpen && viewingEmpleado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalles del Colaborador</h2>
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
                  Nombre
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingEmpleado.nombre}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingEmpleado.cargo || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gerencia
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {viewingEmpleado.gerencia || 'No especificado'}
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