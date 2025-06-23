'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Search, Download, Filter, X } from 'lucide-react';
import InventarioModal from '../../components/inventario/InventarioModal';

// Interfaces para los datos relacionados
interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
  tipo_equipo: string | null;
  vida_util: string | null;
  valor_reposicion: number | null;
}

interface Empleado {
  id: number;
  nombre: string | null;
  cargo: string | null;
  gerencia: string | null;
}

// Interface principal para el item de inventario
interface InventoryItem {
  id: number;
  codigoEFC: string | null;
  tipoEquipo: string | null;
  familia: string | null;
  subFamilia: string | null;
  marca: string | null;
  modelo: string | null;
  descripcion: string | null;
  serie: string | null;
  procesador: string | null;
  anio: number | null;
  ram: string | null;
  discoDuro: string | null;
  sistemaOperativo: string | null;
  sede: string | null;
  estado: string | null;
  usuarios: string | null;
  cargo: string | null;
  gerencia: string | null;
  ubicacionEquipo: string | null;
  qUsuarios: number | null;
  condicion: string | null;
  repotenciadas: boolean | null;
  clasificacionObsolescencia: string | null;
  clasificacionRepotenciadas: string | null;
  motivoCompra: string | null;
  precioReposicion: number | null;
  proveedor: string | null;
  factura: string | null;
  anioCompra: number | null;
  precioReposicion2024: number | null;
  observaciones: string | null;
  vidaUtil: string | null;
  fecha_compra: number | null;
  precioUnitarioSinIgv: string | null;
  clasificacion: Clasificacion | null;
  empleado: Empleado | null;
}

interface Filters {
  codigoEFC?: string;
  marca?: string;
  modelo?: string;
  estado?: string;
  sede?: string;
  gerencia?: string;
  familia?: string;
  empleado?: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3002/inventario-relacional?page=${page}&limit=${pageSize}`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los datos del inventario');
      }
      const data = await response.json();
      setInventory(data.items);
      setPagination(data.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchInventory = async () => {
    if (!searchQuery.trim()) {
      fetchInventory();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3002/inventario-relacional/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${pageSize}`
      );
      if (!response.ok) {
        throw new Error('Error al buscar en el inventario');
      }
      const data = await response.json();
      setInventory(data.items);
      setPagination(data.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      searchInventory();
    } else {
      fetchInventory();
    }
  }, [page, pageSize, filters, searchQuery]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(inventory.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const exportToCSV = async () => {
    try {
      let url = 'http://localhost:3002/inventario-relacional/export';
      
      // Agregar filtros a la URL
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }
      
      const data = await response.json();
      
      // Convertir a CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map((row: any) => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url2 = URL.createObjectURL(blob);
      link.setAttribute('href', url2);
      link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteSelected = async () => {
    if (!selectedItems.length) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedItems.length} elementos?`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/inventario-relacional/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedItems }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar elementos');
      }

      setSelectedItems([]);
      fetchInventory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleModalSubmit = async (data: any) => {
    setIsSubmitting(true);
    const url = editItem
      ? `http://localhost:3002/inventory/${editItem.id}`
      : 'http://localhost:3002/inventory';
    const method = editItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${editItem ? 'actualizar' : 'crear'} el item`);
      }

      setModalOpen(false);
      setEditItem(null);
      fetchInventory(); // Recargar los datos
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <InventarioModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleModalSubmit}
        inventario={editItem}
        isSubmitting={isSubmitting}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        <button
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          onClick={() => { setModalOpen(true); setEditItem(null); }}
        >
          <PlusCircle size={20} />
          Añadir Item
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Buscar en inventario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent"
          >
            <Filter size={20} />
            Filtros
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download size={20} />
            Exportar CSV
          </button>

          {selectedItems.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 size={20} />
              Eliminar ({selectedItems.length})
            </button>
          )}
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código EFC</label>
                <input
                  type="text"
                  value={filters.codigoEFC || ''}
                  onChange={(e) => handleFilterChange('codigoEFC', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  value={filters.marca || ''}
                  onChange={(e) => handleFilterChange('marca', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <input
                  type="text"
                  value={filters.modelo || ''}
                  onChange={(e) => handleFilterChange('modelo', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <input
                  type="text"
                  value={filters.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sede</label>
                <input
                  type="text"
                  value={filters.sede || ''}
                  onChange={(e) => handleFilterChange('sede', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gerencia</label>
                <input
                  type="text"
                  value={filters.gerencia || ''}
                  onChange={(e) => handleFilterChange('gerencia', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Familia</label>
                <input
                  type="text"
                  value={filters.familia || ''}
                  onChange={(e) => handleFilterChange('familia', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Empleado</label>
                <input
                  type="text"
                  value={filters.empleado || ''}
                  onChange={(e) => handleFilterChange('empleado', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="pageSize" className="mr-2 text-sm font-medium">Registros por página:</label>
          <select 
            id="pageSize" 
            value={pageSize} 
            onChange={handlePageSizeChange}
            className="bg-card border border-border rounded-md px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, pagination.total)} de {pagination.total} registros
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

      {loading && <p className="text-center py-4">Cargando inventario...</p>}
      {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="bg-card shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === inventory.length && inventory.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Código EFC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Serie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gerencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Familia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sede</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-accent/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.codigoEFC || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.marca || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.modelo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.serie || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${
                      item.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                      item.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.estado || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.empleado?.nombre || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.empleado?.cargo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.empleado?.gerencia || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.clasificacion?.familia || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.sede || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{item.ubicacionEquipo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="text-destructive hover:text-destructive/80">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && inventory.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron registros de inventario</p>
        </div>
      )}
    </div>
  );
} 