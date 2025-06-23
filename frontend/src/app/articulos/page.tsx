'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, RefreshCw } from 'lucide-react';
import ArticuloModal from '../../components/articulos/ArticuloModal';

// Tipos de datos
interface Articulo {
  id: number;
  codigoEFC: string | null;
  marca: string | null;
  modelo: string | null;
  descripcion: string | null;
  serie: string | null;
  procesador: string | null;
  anio: number | null;
  ram: string | null;
  discoDuro: string | null;
  sistemaOperativo: string | null;
  condicion: string | null;
  motivoCompra: string | null;
  vidaUtil: string | null;
  fecha_compra: number | null;
  proveedor: string | null;
  factura: string | null;
  precioUnitarioSinIgv: string | null;
  anioCompra: number | null;
}

const tableHeaders = [
  { key: 'codigoEFC', label: 'Código EFC' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'serie', label: 'Serie' },
  { key: 'procesador', label: 'Procesador' },
  { key: 'anio', label: 'Año' },
  { key: 'ram', label: 'RAM' },
  { key: 'discoDuro', label: 'Disco Duro' },
  { key: 'sistemaOperativo', label: 'S.O.' },
  { key: 'condicion', label: 'Condición' },
  { key: 'motivoCompra', label: 'Motivo de Compra' },
  { key: 'vidaUtil', label: 'Vida Útil' },
  { key: 'fecha_compra', label: 'Fecha de Compra' },
  { key: 'proveedor', label: 'Proveedor' },
  { key: 'factura', label: 'Factura' },
  { key: 'precioUnitarioSinIgv', label: 'Precio Sin IGV' },
  { key: 'anioCompra', label: 'Año de Compra' },
];

// Función para convertir fecha de serie de Excel a formato legible
const excelSerialDateToJSDate = (serial: number) => {
  if (!serial || typeof serial !== 'number') return null;
  // El número 25569 es la diferencia de días entre el 01/01/1970 (epoch de Unix) y el 01/01/1900 (epoch de Excel)
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date;
};

const formatDate = (date: Date | null) => {
  if (!date) return '-';
  // Ajuste para la zona horaria local
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000));
  return adjustedDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState<Articulo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });

  // Filtros
  const [filters, setFilters] = useState({
    codigoEFC: '',
    marca: '',
    modelo: '',
    serie: '',
  });
  const [activeFilter, setActiveFilter] = useState<keyof typeof filters>('codigoEFC');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Selecciones y acciones
  const [selectedArticulos, setSelectedArticulos] = useState<number[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const filterOptions = [
    { id: 'codigoEFC', label: 'Código EFC' },
    { id: 'marca', label: 'Marca' },
    { id: 'modelo', label: 'Modelo' },
    { id: 'serie', label: 'Serie' },
  ];

  // Fetch de datos
  const fetchArticulos = async (pageParam = page, pageSizeParam = pageSize, filtersParam = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        pageSize: pageSizeParam.toString(),
        ...Object.entries(filtersParam)
          .filter(([, value]) => value)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      });

      const response = await fetch(`http://localhost:3002/inventory?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener los artículos');
      const { data, pagination: paginationData } = await response.json();
      setArticulos(data);
      setPagination(paginationData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllArticulos = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        pageSize: '10000', // Un número grande para obtener todos
        ...Object.entries(filters)
          .filter(([, value]) => value)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      });

      const response = await fetch(`http://localhost:3002/inventory?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener todos los artículos');
      const { data } = await response.json();
      return data;
    } catch (err: any) {
      throw new Error('Error al obtener todos los artículos');
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, [page, pageSize, filters]);

  // Manejadores de eventos
  const handleFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, [activeFilter]: value }));
    setPage(1);
  };

  const handleCreate = () => {
    setEditingArticulo(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (articulo: Articulo) => {
    setEditingArticulo(articulo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticulo(null);
  };
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    const url = editingArticulo
      ? `http://localhost:3002/inventory/${editingArticulo.id}`
      : 'http://localhost:3002/inventory';
    const method = editingArticulo ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al guardar el artículo');
      
      await fetchArticulos();
      handleCloseModal();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRefresh = () => fetchArticulos();
  const handleSelectAll = () => {
    setSelectedArticulos(selectedArticulos.length === articulos.length ? [] : articulos.map(a => a.id));
  };
  const handleSelectArticulo = (id: number) => {
    setSelectedArticulos(prev => prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]);
  };

  // Exportar, importar y eliminar
  const handleExport = async (exportType: 'all' | 'current' | 'selected') => {
    let dataToExport: Articulo[] = [];
    try {
      if (exportType === 'all') dataToExport = await fetchAllArticulos();
      else if (exportType === 'current') dataToExport = articulos;
      else if (exportType === 'selected') dataToExport = articulos.filter(a => selectedArticulos.includes(a.id));

      if (dataToExport.length === 0) return alert('No hay datos para exportar');

      const csvHeaders = tableHeaders.map(h => h.label);
      const csvKeys = tableHeaders.map(h => h.key as keyof Articulo);
      
      const csvContent = [
        csvHeaders.join(','),
        ...dataToExport.map(item => 
          csvKeys.map(key => {
            const value = item[key] ?? '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `articulos_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportDropdown(false);
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      // Implementar lógica de importación aquí si es necesario
      alert('Funcionalidad de importación no implementada.');
    };
    reader.readAsText(file);
  };
  
  const handleBulkDelete = async () => {
    if (selectedArticulos.length === 0 || !window.confirm(`¿Eliminar ${selectedArticulos.length} artículos seleccionados?`)) return;

    try {
      // Asume un endpoint de eliminación en lote
      const response = await fetch(`http://localhost:3002/inventory/batch`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedArticulos }),
      });

      if (!response.ok) throw new Error('Error al eliminar artículos');
      
      await fetchArticulos();
      setSelectedArticulos([]);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) return;
    try {
      const response = await fetch(`http://localhost:3002/inventory/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar el artículo');
      await fetchArticulos();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <ArticuloModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        articulo={editingArticulo}
        isSubmitting={isSubmitting}
      />

      {/* Cabecera y acciones principales */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Artículos</h1>
        <div className="flex items-center gap-2">
          {/* Botón de exportar */}
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Exportar
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg z-10 border border-border">
                <a href="#" onClick={() => handleExport('all')} className="block px-4 py-2 text-sm hover:bg-muted/50">Todos los registros</a>
                <a href="#" onClick={() => handleExport('current')} className="block px-4 py-2 text-sm hover:bg-muted/50">Página actual ({articulos.length})</a>
                <a href="#" onClick={() => handleExport('selected')} className={`block px-4 py-2 text-sm ${selectedArticulos.length > 0 ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}>
                  Seleccionados ({selectedArticulos.length})
                </a>
              </div>
            )}
          </div>
          
          {/* Botón de importar */}
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload size={18} />
            Importar
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          
          {/* Botón de crear */}
          <button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
          <PlusCircle size={20} />
          <span>Crear Artículo</span>
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
      
      {/* Acciones en lote */}
      {selectedArticulos.length > 0 && (
        <div className="mb-4 p-3 bg-blue-900/10 border border-blue-400/20 rounded-lg flex justify-between items-center">
          <span>{selectedArticulos.length} artículos seleccionados</span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
          >
            <Trash2 size={16} className="inline-block mr-1" />
            Eliminar seleccionados
          </button>
        </div>
      )}

      {/* Contenedor de la tabla con scroll */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="p-4 sticky left-0 z-10 bg-gray-50">
                <div className="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    onChange={e => handleSelectAll()}
                    checked={selectedArticulos.length > 0 && selectedArticulos.length === articulos.length}
                  />
                  <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                </div>
              </th>
              {tableHeaders.map(header => (
                <th key={header.key} scope="col" className="px-6 py-3 whitespace-nowrap">
                  {header.label}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 sticky right-0 z-10 bg-gray-50 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={tableHeaders.length + 2} className="text-center p-4">Cargando...</td></tr>
            ) : error ? (
              <tr><td colSpan={tableHeaders.length + 2} className="text-center p-4 text-red-500">Error: {error}</td></tr>
            ) : articulos.length === 0 ? (
                <tr><td colSpan={tableHeaders.length + 2} className="text-center p-4">No se encontraron artículos.</td></tr>
            ) : (
              articulos.map(articulo => (
                <tr key={articulo.id} className="hover:bg-gray-50">
                  <td className="w-4 p-4 sticky left-0 z-10 bg-white hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        id={`checkbox-table-search-${articulo.id}`}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        checked={selectedArticulos.includes(articulo.id)}
                        onChange={() => handleSelectArticulo(articulo.id)}
                      />
                      <label htmlFor={`checkbox-table-search-${articulo.id}`} className="sr-only">checkbox</label>
                    </div>
                  </td>
                  {tableHeaders.map(header => (
                    <td key={header.key} className="px-6 py-4 uppercase whitespace-nowrap text-sm text-gray-900">
                      {header.key === 'fecha_compra'
                        ? formatDate(excelSerialDateToJSDate(articulo[header.key as keyof Articulo] as number))
                        : String(articulo[header.key as keyof Articulo] ?? '-')}
                    </td>
                  ))}
                  <td className="px-6 py-4 sticky right-0 z-10 bg-white hover:bg-gray-50">
                    <div className="flex items-center space-x-2 justify-end">
                      <button onClick={() => handleEdit(articulo)} className="p-1 text-indigo-600 hover:text-indigo-900">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(articulo.id)} className="p-1 text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <label htmlFor="pageSize" className="mr-2 text-sm font-medium">Registros por página:</label>
          <select 
            id="pageSize" 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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
              disabled={page === pagination.totalPages || articulos.length === 0}
              className="px-3 py-1 border border-border rounded-md disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 