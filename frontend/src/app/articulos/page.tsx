'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, RefreshCw, Filter, Search } from 'lucide-react';
import ArticuloModal from '../../components/articulos/ArticuloModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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
              <input
                type="text"
                value={filters[activeFilter]}
                onChange={(e) => handleFilterChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Buscar por ${filterOptions.find(opt => opt.id === activeFilter)?.label}`}
                className="border rounded-lg px-4 py-2 w-64"
              />
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
                  <tr key={articulo.id} className="border-t">
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
                        {header.key === 'fecha_compra' && articulo[header.key]
                          ? articulo[header.key]
                          : articulo[header.key as keyof Articulo] || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(articulo)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(articulo.id)}
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

      <ArticuloModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        articulo={editingArticulo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 