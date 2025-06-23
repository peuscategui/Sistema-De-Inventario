'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw, X } from 'lucide-react';
import ColaboradorModal from '@/components/colaboradores/ColaboradorModal';

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

      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2">
            <Filter size={20} />
            {filterOptions.find(opt => opt.id === activeFilter)?.label}
          </div>
          <div className="flex-1 flex gap-2 max-w-xl">
            <input
              type="text"
              value={filters[activeFilter]}
              onChange={(e) => handleFilterChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRefresh()}
              placeholder={`Buscar por ${filterOptions.find(opt => opt.id === activeFilter)?.label}`}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              onClick={handleRefresh}
              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
            >
              <Search size={20} />
              Buscar
            </button>
            {Object.values(filters).some(value => value) && (
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
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">Gerencia</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Cargando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-red-600">
                    {error}
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
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
                    <td className="px-4 py-2">{empleado.nombre}</td>
                    <td className="px-4 py-2">{empleado.cargo || '-'}</td>
                    <td className="px-4 py-2">{empleado.gerencia || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(empleado)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(empleado.id)}
                          className="text-destructive hover:text-destructive/80"
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
        onFormChange={handleFormChange}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        error={modalError}
      />
    </div>
  );
} 