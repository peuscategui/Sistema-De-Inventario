'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw, X, Eye } from 'lucide-react';
import InventarioModal from '@/components/inventario/InventarioModal';
import InventarioDetalleModal from '@/components/inventario/InventarioDetalleModal';
import { API_ENDPOINTS } from '@/config/api';

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
  fecha_compra: string | null;
  precioUnitarioSinIgv: number | null;
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

const filterOptions = [
  { value: 'codigoEFC', label: 'Código EFC' },
  { value: 'marca', label: 'Marca' },
  { value: 'modelo', label: 'Modelo' },
  { value: 'estado', label: 'Estado' },
  { value: 'sede', label: 'Sede' },
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'familia', label: 'Familia' },
  { value: 'empleado', label: 'Empleado' },
];

export default function InventarioPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedFilter, setSelectedFilter] = useState<string>(filterOptions[0].value);
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.inventario}?page=${page}&limit=${pageSize}`;
      
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

  useEffect(() => {
    fetchInventory();
  }, [page, pageSize, filters]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  const handleSearch = () => {
    setPage(1); // Resetear a la primera página al buscar
    if (selectedFilter && filterValue) {
      setFilters({ [selectedFilter]: filterValue });
    } else {
      setFilters({});
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedFilter(filterOptions[0].value);
    setFilterValue('');
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
      let url = API_ENDPOINTS.inventarioExport;
      
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
      const response = await fetch(API_ENDPOINTS.inventarioBatch, {
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
      ? `${API_ENDPOINTS.inventory}/${editItem.id}`
      : API_ENDPOINTS.inventory;
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

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.inventario}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el item');
      }

      fetchInventory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openDetalleModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetalleModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Nuevo Item
        </button>
      </div>

      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-green-200 [&>option]:bg-white"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-white text-gray-700">
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex-1 flex gap-2 max-w-xl">
            <input
              type="text"
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Buscar por ${filterOptions.find(opt => opt.value === selectedFilter)?.label}`}
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              onClick={handleSearch}
              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
            >
              <Search size={20} />
              Buscar
            </button>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
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
              onChange={handlePageSizeChange}
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
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="text-green-600 hover:text-green-700 disabled:text-gray-400"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
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
        {selectedItems.length > 0 && (
          <button
            onClick={deleteSelected}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-100"
          >
            <Trash2 size={20} />
            Eliminar ({selectedItems.length})
          </button>
        )}

        <div className="flex gap-2 ml-auto">
          <button
            onClick={exportToCSV}
            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100"
          >
            <Download size={20} />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-primary/10 border-b">
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedItems.length === inventory.length && inventory.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="py-3 px-4 text-left uppercase">Código EFC</th>
              <th className="py-3 px-4 text-left uppercase">Tipo Equipo</th>
              <th className="py-3 px-4 text-left uppercase">Marca</th>
              <th className="py-3 px-4 text-left uppercase">Modelo</th>
              <th className="py-3 px-4 text-left uppercase">Estado</th>
              <th className="py-3 px-4 text-left uppercase">Usuario</th>
              <th className="py-3 px-4 text-left uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="py-3 px-4 uppercase">{item.codigoEFC || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.tipoEquipo || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.marca || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.modelo || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.estado || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.usuarios || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetalleModal(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InventarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleModalSubmit}
        inventario={editItem}
        isSubmitting={isSubmitting}
      />
      <InventarioDetalleModal
        isOpen={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
} 