'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw, X, Eye } from 'lucide-react';
import InventarioModal from '@/components/inventario/InventarioModal';
import InventarioDetalleModal from '@/components/inventario/InventarioDetalleModal';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
// import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'; // TEMPORALMENTE DESACTIVADO

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
  sede: string | null;
}

// Interface principal para el item de inventario - CORREGIDA para coincidir con schema
interface InventoryItem {
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
  status: string | null; // CORREGIDO: en schema es 'status' no 'estado'
  estado: string | null; // Campo adicional del frontend
  ubicacionEquipo: string | null;
  qUsuarios: number | null;
  condicion: string | null;
  repotenciadas: boolean | null;
  clasificacionObsolescencia: string | null;
  clasificacionRepotenciadas: string | null;
  motivoCompra: string | null;
  proveedor: string | null;
  factura: string | null;
  anioCompra: number | null;
  observaciones: string | null;
  fecha_compra: string | null;
  precioUnitarioSinIgv: string | null; // CORREGIDO: en schema es string
  // Relaciones - CORREGIDAS: son opcionales
  clasificacionId: number | null;
  empleadoId: number | null;
  clasificacion: Clasificacion | null;
  empleado: Empleado | null;
  // CORREGIDO: Agregar campos de baja
  fechaBaja?: string | null;
  motivoBaja?: string | null;
}

interface Filters {
  codigoEFC?: string;
  marca?: string;
  modelo?: string;
  estado?: string;
  empleado?: string;
}

const filterOptions = [
  { value: 'codigoEFC', label: 'Código EFC' },
  { value: 'marca', label: 'Marca' },
  { value: 'modelo', label: 'Modelo' },
  { value: 'estado', label: 'Estado' },
  { value: 'empleado', label: 'Empleado' },
];

export default function InventarioPage() {
  // const { authenticatedFetch } = useAuthenticatedFetch(); // TEMPORALMENTE DESACTIVADO
  const { canCreate, canEdit, canDelete } = useAuth();
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
      // CORREGIDO: usar pageSize en lugar de limit para coincidir con backend
      let url = `${API_ENDPOINTS.inventario}?page=${page}&pageSize=${pageSize}`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      // IMPORTANTE: Excluir items con estado BAJA y DONACION de la página de Inventario
      // Solo mostrar items activos (ASIGNADO, STOCK, EN SERVICIO, etc.)
      url += '&excludeEstados=BAJA,DONACION';

      console.log('🔍 DEBUG: URL de solicitud:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los datos del inventario');
      }
      const data = await response.json();
      
      console.log('🔍 DEBUG: Respuesta del servidor:', data);
      
      // CORREGIDO: ajustar según la estructura real del backend
      const inventoryData = data.data || data.items || data;
      const paginationData = data.pagination || data.meta || {
        total: Array.isArray(inventoryData) ? inventoryData.length : 0,
        totalPages: 1
      };
      
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setPagination(paginationData);
    } catch (err: any) {
      console.error('❌ Error al cargar inventario:', err);
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
      // TEMPORAL: mientras se implementa el endpoint de export, usar datos actuales
      let url = API_ENDPOINTS.inventario;
      
      // Agregar filtros a la URL para obtener todos los datos
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('pageSize', '1000'); // Obtener muchos registros para exportar
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }
      
      const result = await response.json();
      const data = result.data || result.items || result;
      
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
        headers: { 'Content-Type': 'application/json' },
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
    let url: string = API_ENDPOINTS.inventario;
    let method = 'POST';
    let bodyData = { ...data };
    
    console.log('🔍 DEBUG: handleModalSubmit - editItem:', editItem);
    console.log('🔍 DEBUG: handleModalSubmit - data recibida:', data);
    
    // CORREGIDO: Mapear campos de baja del frontend al backend
    if (data.fechaBaja) {
      bodyData.fecha_baja = data.fechaBaja;
      delete bodyData.fechaBaja;
    }
    if (data.motivoBaja) {
      bodyData.motivo_baja = data.motivoBaja;
      delete bodyData.motivoBaja;
    }
    
    if (editItem && editItem.id && !isNaN(editItem.id)) {
      url = `${API_ENDPOINTS.inventario}/${editItem.id}` as string;
      method = 'PUT';
      const { id, ...rest } = bodyData;
      bodyData = rest;
      console.log('🔍 DEBUG: Actualizando inventario con id:', editItem.id, 'URL:', url);
      console.log('🔍 DEBUG: Body data (sin id):', bodyData);
    } else {
      console.log('🔍 DEBUG: Creando nuevo inventario');
    }
    try {
      console.log('🔍 DEBUG: Enviando request a:', url);
      console.log('🔍 DEBUG: Método:', method);
      console.log('🔍 DEBUG: Body data final:', JSON.stringify(bodyData, null, 2));
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      
      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 DEBUG: Error response:', errorData);
        throw new Error(errorData.message || `Error al ${editItem ? 'actualizar' : 'crear'} el item`);
      }
      
      const result = await response.json();
      console.log('🔍 DEBUG: Success response:', result);
      
      setModalOpen(false);
      setEditItem(null);
      fetchInventory(); // Recargar los datos
    } catch (err: any) {
      console.error('🔍 DEBUG: Error completo:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    // Validar que el item y su ID sean válidos
    if (!item || !item.id || isNaN(item.id)) {
      console.error('❌ ERROR: Item o ID inválido para editar:', item);
      setError('Item inválido para editar');
      return;
    }

    console.log('🔍 DEBUG: Abriendo modal de edición con item:', item);
    console.log('🔍 DEBUG: ID del item:', item.id);
    console.log('🔍 DEBUG: articuloId que se pasará:', item.id);
    
    // Usar el objeto original que tiene el id correcto
    setEditItem({
      id: item.id, // IMPORTANTE: Incluir el id original
      articuloId: item.id, // CORREGIDO: El articuloId es el mismo que el id del item
      clasificacionId: item.clasificacion?.id ?? (typeof item.clasificacionId === 'number' ? item.clasificacionId : null),
      empleadoId: item.empleado?.id ?? (typeof item.empleadoId === 'number' ? item.empleadoId : null),
      empleadoNombre: item.empleado?.nombre ?? '',
      sede: item.empleado?.sede ?? '',
      estado: item.estado ?? '',
      ubicacionEquipo: item.ubicacionEquipo ?? '',
      condicion: item.condicion ?? '',
      observaciones: item.observaciones ?? '',
      // CORREGIDO: Agregar campos de baja para que se carguen en el formulario
      fechaBaja: item.fechaBaja ?? '',
      motivoBaja: item.motivoBaja ?? '',
      // Otros campos si necesitas
    } as any);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      console.error('❌ ERROR: ID inválido para eliminar:', id);
      setError('ID inválido para eliminar el item');
      return;
    }

    console.log('🔍 DEBUG: Eliminando item con ID:', id);

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
    // Validar que el item y su ID sean válidos
    if (!item || !item.id || isNaN(item.id)) {
      console.error('❌ ERROR: Item o ID inválido para ver detalles:', item);
      setError('Item inválido para ver detalles');
      return;
    }

    console.log('🔍 DEBUG: Abriendo modal de detalles con item:', item);
    console.log('🔍 DEBUG: ID del item:', item.id);
    
    setSelectedItem(item);
    setDetalleModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventario</h1>
        {canCreate() && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Nuevo Item
          </button>
        )}
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
        {selectedItems.length > 0 && canDelete() && (
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
                <td className="py-3 px-4 uppercase">{item.clasificacion?.tipo_equipo || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.marca || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.modelo || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.estado || '-'}</td>
                <td className="py-3 px-4 uppercase">{item.empleado?.nombre || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetalleModal(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </button>
                    {canEdit() && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                    )}
                    {canDelete() && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
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
        inventario={editItem as any}
        isSubmitting={isSubmitting}
      />
      <InventarioDetalleModal
        isOpen={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem as any}
      />
    </div>
  );
} 
