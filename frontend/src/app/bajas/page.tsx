'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Download, Eye, Edit } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import InventarioDetalleModal from '@/components/inventario/InventarioDetalleModal';
import EditBajaModal from '@/components/inventario/EditBajaModal';

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

// Interface principal para el item de baja
interface BajaItem {
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
  fechaBaja: string | null;
  motivoBaja: string | null;
  // Campos obligatorios para compatibilidad con InventoryItem
  clasificacionId: number | null;
  empleadoId: number | null;
  clasificacion: Clasificacion | null;
  empleado: Empleado | null;
}

interface Filters {
  codigoEFC?: string;
  marca?: string;
  modelo?: string;
  sede?: string;
  gerencia?: string;
  familia?: string;
  empleado?: string;
}

const filterOptions = [
  { value: 'codigoEFC', label: 'Código EFC' },
  { value: 'marca', label: 'Marca' },
  { value: 'modelo', label: 'Modelo' },
  { value: 'sede', label: 'Sede' },
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'familia', label: 'Familia' },
  { value: 'empleado', label: 'Empleado' },
];

export default function BajasPage() {
  const [bajas, setBajas] = useState<BajaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedFilter, setSelectedFilter] = useState<string>(filterOptions[0].value);
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedBaja, setSelectedBaja] = useState<BajaItem | null>(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  // CORREGIDO: Agregar estados para edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBaja, setEditBaja] = useState<BajaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const fetchBajas = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.bajas}?page=${page}&pageSize=${pageSize}`;
      
      // Agregar filtros a la URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      console.log('🔍 DEBUG: URL de bajas:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los datos de bajas');
      }
      const data = await response.json();
      
      console.log('🔍 DEBUG: Respuesta de bajas:', data);
      
      // Ajustar según la estructura del backend
      const bajasData = data.data || data.items || data;
      const paginationData = data.pagination || data.meta || {
        total: Array.isArray(bajasData) ? bajasData.length : 0,
        totalPages: 1
      };
      
      setBajas(Array.isArray(bajasData) ? bajasData : []);
      setPagination(paginationData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBajas();
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

  const exportToCSV = async () => {
    try {
      let url = API_ENDPOINTS.inventarioExport;
      
      // Agregar filtros a la URL pero solo para bajas
      const params = new URLSearchParams();
      params.append('estado', 'BAJA'); // Solo exportar bajas
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Convertir a CSV
      const csvContent = [
        Object.keys(data[0] || {}).join(','),
        ...data.map((row: any) => Object.values(row).join(','))
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'bajas.csv';
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const openDetalleModal = (baja: BajaItem) => {
    setSelectedBaja(baja);
    setDetalleModalOpen(true);
  };

  // CORREGIDO: Agregar función para abrir modal de edición
  const openEditModal = (baja: BajaItem) => {
    setEditBaja(baja);
    setEditModalOpen(true);
  };

  // CORREGIDO: Agregar función para manejar la edición
  const handleEditSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Mapear campos de baja del frontend al backend
      const bodyData = { ...data };
      if (data.fechaBaja) {
        bodyData.fecha_baja = data.fechaBaja;
        delete bodyData.fechaBaja;
      }
      if (data.motivoBaja) {
        bodyData.motivo_baja = data.motivoBaja;
        delete bodyData.motivoBaja;
      }

      const response = await fetch(`${API_ENDPOINTS.inventario}/${editBaja?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la baja');
      }

      setEditModalOpen(false);
      setEditBaja(null);
      fetchBajas(); // Recargar los datos
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bajas</h1>
        <div className="text-sm text-gray-600">
          Total de bajas: {pagination.total}
        </div>
      </div>

      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-blue-200 [&>option]:bg-white"
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
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100"
            >
              <Search size={20} />
              Buscar
            </button>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
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
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100"
          >
            <Download size={20} />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Código EFC</th>
              <th className="py-3 px-4 text-left">Tipo de Equipo</th>
              <th className="py-3 px-4 text-left">Marca</th>
              <th className="py-3 px-4 text-left">Modelo</th>
              <th className="py-3 px-4 text-left">Serie</th>
              <th className="py-3 px-4 text-left">Sede</th>
              <th className="py-3 px-4 text-left">Fecha de Baja</th>
              <th className="py-3 px-4 text-left">Motivo de Baja</th>
              <th className="py-3 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bajas.map((baja) => (
              <tr key={baja.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 uppercase">{baja.codigoEFC || '-'}</td>
                <td className="py-3 px-4 uppercase">{baja.tipoEquipo || '-'}</td>
                <td className="py-3 px-4 uppercase">{baja.marca || '-'}</td>
                <td className="py-3 px-4 uppercase">{baja.modelo || '-'}</td>
                <td className="py-3 px-4 uppercase">{baja.serie || '-'}</td>
                <td className="py-3 px-4 uppercase">{baja.sede || '-'}</td>
                <td className="py-3 px-4 uppercase">
                  {baja.fechaBaja ? new Date(baja.fechaBaja).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 px-4 uppercase">{baja.motivoBaja || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetalleModal(baja)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => openEditModal(baja)}
                      className="text-green-600 hover:text-green-800"
                      title="Editar baja"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bajas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron bajas</p>
          </div>
        )}
      </div>

      <InventarioDetalleModal
        isOpen={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setSelectedBaja(null);
        }}
        item={selectedBaja as any}
      />

      <EditBajaModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditBaja(null);
        }}
        onSubmit={handleEditSubmit}
        baja={editBaja ? {
          id: editBaja.id,
          codigoEFC: editBaja.codigoEFC || '',
          fechaBaja: editBaja.fechaBaja || '',
          motivoBaja: editBaja.motivoBaja || '',
        } : undefined}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 