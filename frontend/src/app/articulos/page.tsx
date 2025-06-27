'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, RefreshCw, Filter, Search, Eye } from 'lucide-react';
import ArticuloModal from '@/components/articulos/ArticuloModal';
import { API_ENDPOINTS } from '@/config/api';



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
  status: string | null;
  condicion: string | null;
  motivoCompra: string | null;
  vidaUtil: string | null;
  fecha_compra: string | null;
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
  { key: 'status', label: 'Status' },
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
  
  // Modal de visualización
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingArticulo, setViewingArticulo] = useState<Articulo | null>(null);

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
    status: '',
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
    { id: 'status', label: 'Status' },
  ];

  // Fetch de datos
  const fetchArticulos = async (pageParam = page, pageSizeParam = pageSize, filtersParam = filters) => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.inventory}?page=${pageParam}&limit=${pageSizeParam}`;
      
      // Agregar filtros a la URL
      Object.entries(filtersParam).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los artículos');
      }
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
      let url = `${API_ENDPOINTS.inventory}?page=1&limit=10000`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url);
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
  };

  const handleSearch = () => {
    setPage(1); // Resetear a la primera página al buscar
    fetchArticulos(1, pageSize, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreate = () => {
    setEditingArticulo(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (articulo: Articulo) => {
    setEditingArticulo(articulo);
    setIsModalOpen(true);
  };

  const handleView = (articulo: Articulo) => {
    setViewingArticulo(articulo);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticulo(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingArticulo(null);
  };
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    const url = editingArticulo
      ? `${API_ENDPOINTS.inventory}/${editingArticulo.id}`
      : API_ENDPOINTS.inventory;
    const method = editingArticulo ? 'PUT' : 'POST';

    // Debug: Log de los datos que se están enviando
    console.log('Datos enviados:', data);
    console.log('URL:', url);
    console.log('Método:', method);

    try {
      // Limpiar datos antes de enviar - remover campos vacíos o null
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
      
      console.log('Datos limpiados:', cleanedData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al guardar el artículo: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Respuesta del servidor:', result);
      
      await fetchArticulos();
      handleCloseModal();
      alert('Artículo guardado exitosamente');
    } catch (err: any) {
      console.error('Error completo:', err);
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
      const response = await fetch(API_ENDPOINTS.inventoryBatch, {
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
      const response = await fetch(`${API_ENDPOINTS.inventory}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar el artículo');
      await fetchArticulos();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Artículos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
          >
            <PlusCircle size={20} />
            Nuevo Artículo
          </button>
        </div>
      </div>

      {/* Controles superiores */}
      <div className="bg-card rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* Filtros */}
          <div className="flex gap-2 items-center">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={20} />
                {filterOptions.find(opt => opt.id === activeFilter)?.label || 'Filtrar'}
              </button>
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-background border rounded-lg shadow-lg z-10">
                  {filterOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setActiveFilter(option.id as keyof typeof filters);
                        setShowFilterDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-primary/10"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {activeFilter === 'status' ? (
                <select
                  value={filters[activeFilter]}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-64"
                >
                  <option value="">Todos los status</option>
                  <option value="libre">Libre</option>
                  <option value="asignado">Asignado</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={filters[activeFilter]}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Buscar por ${filterOptions.find(opt => opt.id === activeFilter)?.label}`}
                  className="border rounded-lg px-4 py-2 w-64"
                />
              )}
              <button
                onClick={handleSearch}
                className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Search size={20} />
                Buscar
              </button>
            </div>
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Registros por página:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded-lg px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-primary/10 text-primary disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm">
                Página {page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 rounded-lg bg-primary/10 text-primary disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de tabla */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Actualizar
          </button>
          {selectedArticulos.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Trash2 size={20} />
              Eliminar ({selectedArticulos.length})
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download size={20} />
              Exportar
            </button>
            {showExportDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-background border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleExport('all')}
                  className="block w-full text-left px-4 py-2 hover:bg-primary/10"
                >
                  Exportar todo
                </button>
                <button
                  onClick={() => handleExport('current')}
                  className="block w-full text-left px-4 py-2 hover:bg-primary/10"
                >
                  Exportar página actual
                </button>
                {selectedArticulos.length > 0 && (
                  <button
                    onClick={() => handleExport('selected')}
                    className="block w-full text-left px-4 py-2 hover:bg-primary/10"
                  >
                    Exportar seleccionados ({selectedArticulos.length})
                  </button>
                )}
              </div>
            )}
          </div>
          <label className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
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
                    checked={selectedArticulos.length === articulos.length}
                    onChange={(e) => handleSelectAll()}
                    className="rounded"
                  />
                </th>
                {tableHeaders.map((header) => (
                  <th key={header.key} className="px-4 py-2 text-left uppercase">
                    {header.label}
                  </th>
                ))}
                <th className="px-4 py-2 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableHeaders.length + 2} className="text-center py-4 uppercase">
                    Cargando...
                  </td>
                </tr>
              ) : articulos.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length + 2} className="text-center py-4 uppercase">
                    No hay artículos para mostrar
                  </td>
                </tr>
              ) : (
                articulos.map((articulo) => (
                  <tr key={articulo.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedArticulos.includes(articulo.id)}
                        onChange={(e) => handleSelectArticulo(articulo.id)}
                        className="rounded"
                      />
                    </td>
                    {tableHeaders.map((header) => (
                      <td key={header.key} className="px-4 py-2 uppercase">
                        {header.key === 'status' && articulo[header.key] ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            articulo[header.key] === 'libre' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {articulo[header.key]}
                          </span>
                        ) : (
                          articulo[header.key as keyof Articulo] || '-'
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(articulo)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleEdit(articulo)}
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(articulo.id)}
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

      <ArticuloModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        articulo={editingArticulo}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Visualización */}
      {isViewModalOpen && viewingArticulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles del Artículo</h2>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Código EFC</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.codigoEFC || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Marca</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.marca || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.modelo || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.descripcion || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Serie</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.serie || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Procesador</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.procesador || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Año</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.anio || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">RAM</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.ram || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Disco Duro</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.discoDuro || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Sistema Operativo</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.sistemaOperativo || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {viewingArticulo.status ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewingArticulo.status === 'libre' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {viewingArticulo.status}
                    </span>
                  ) : '-'}
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Motivo de Compra</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.motivoCompra || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.fecha_compra || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.proveedor || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Factura</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.factura || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Precio Sin IGV</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.precioUnitarioSinIgv || '-'}</p>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Año de Compra</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{viewingArticulo.anioCompra || '-'}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  handleCloseViewModal();
                  handleEdit(viewingArticulo);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={handleCloseViewModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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