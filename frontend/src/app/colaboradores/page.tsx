'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw } from 'lucide-react';
import ColaboradorModal from '@/components/colaboradores/ColaboradorModal';

export interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
  gerencia: string | null;
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

  const fetchEmpleados = async (pageParam = page, pageSizeParam = pageSize, filtersParam = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        pageSize: pageSizeParam.toString(),
        ...(filtersParam.nombre && { nombre: filtersParam.nombre }),
        ...(filtersParam.cargo && { cargo: filtersParam.cargo }),
        ...(filtersParam.gerencia && { gerencia: filtersParam.gerencia })
      });

      const response = await fetch(`http://localhost:3002/colaboradores?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener los datos');
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
      const queryParams = new URLSearchParams({
        page: '1',
        pageSize: '10000', // Un número grande para obtener todos
        ...(filters.nombre && { nombre: filters.nombre }),
        ...(filters.cargo && { cargo: filters.cargo }),
        ...(filters.gerencia && { gerencia: filters.gerencia })
      });

      const response = await fetch(`http://localhost:3002/colaboradores?${queryParams}`);
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

  const handleFormChange = (name: keyof Empleado, value: string) => {
    setSelectedEmpleado(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async () => {
    if (!selectedEmpleado) return;
    setIsSubmitting(true);
    setModalError(null);

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://localhost:3002/colaboradores/${selectedEmpleado.id}`
      : 'http://localhost:3002/colaboradores';
    
    const payload = {
      nombre: selectedEmpleado.nombre || '',
      cargo: selectedEmpleado.cargo || null,
      gerencia: selectedEmpleado.gerencia || null,
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
      const response = await fetch(`http://localhost:3002/colaboradores/${id}`, { method: 'DELETE' });
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
        const response = await fetch('http://localhost:3002/colaboradores/batch', {
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
        fetch(`http://localhost:3002/colaboradores/${id}`, { method: 'DELETE' })
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
    <div className="container mx-auto p-8">
      <ColaboradorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        empleado={selectedEmpleado}
        onFormChange={handleFormChange}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        error={modalError}
      />
      
      {/* Header con acciones principales */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Colaboradores</h1>
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
                  Exportar Página Actual ({empleados.length})
                </button>
                <button
                  onClick={() => handleExport('selected')}
                  disabled={selectedEmpleados.length === 0}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    selectedEmpleados.length === 0 ? 'text-gray-400 cursor-not-allowed' : ''
                  }`}
                >
                  Exportar Seleccionados ({selectedEmpleados.length})
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
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Añadir Colaborador
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
      {selectedEmpleados.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-yellow-800">
              {selectedEmpleados.length} colaborador(es) seleccionado(s)
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Eliminar Seleccionados
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

      {loading && <p className="text-center py-4">Cargando colaboradores...</p>}
      {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="p-4">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedEmpleados.length === empleados.length && empleados.length > 0} />
                </th>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Cargo</th>
                <th scope="col" className="px-6 py-3">Gerencia</th>
                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmpleados.includes(empleado.id)}
                      onChange={() => handleSelectEmpleado(empleado.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {empleado.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {empleado.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {empleado.cargo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {empleado.gerencia || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(empleado)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(empleado.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 