'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface Licencia {
  id: number;
  codigoLicencia: string;
  nombre: string;
  tipoLicencia: string;
  proveedor: string;
  fechaCompra: string;
  fechaVencimiento?: string;
  costo: number;
  moneda: string;
  cantidadUsuarios: number;
  estado: string;
  asignadoA?: string;
  descripcion?: string;
  areaId?: number;
  gerenciaId?: number;
  area?: { id: number; nombre: string };
  gerencia?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

interface Area {
  id: number;
  nombre: string;
}

interface Gerencia {
  id: number;
  nombre: string;
}

interface LicenseModalProps {
  licencia: Licencia | null;
  onClose: () => void;
  onSave: () => void;
}

export default function LicenseModal({ licencia, onClose, onSave }: LicenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [gerencias, setGerencias] = useState<Gerencia[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(true);

  const [formData, setFormData] = useState({
    codigoLicencia: '',
    nombre: '',
    tipoLicencia: '',
    proveedor: '',
    fechaCompra: '',
    fechaVencimiento: '',
    costo: 0,
    moneda: 'USD',
    cantidadUsuarios: 1,
    estado: 'Activa',
    asignadoA: '',
    descripcion: '',
    areaId: '',
    gerenciaId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSelectData();
    
    if (licencia) {
      setFormData({
        codigoLicencia: licencia.codigoLicencia,
        nombre: licencia.nombre,
        tipoLicencia: licencia.tipoLicencia,
        proveedor: licencia.proveedor,
        fechaCompra: licencia.fechaCompra.split('T')[0],
        fechaVencimiento: licencia.fechaVencimiento ? licencia.fechaVencimiento.split('T')[0] : '',
        costo: licencia.costo,
        moneda: licencia.moneda,
        cantidadUsuarios: licencia.cantidadUsuarios,
        estado: licencia.estado,
        asignadoA: licencia.asignadoA || '',
        descripcion: licencia.descripcion || '',
        areaId: licencia.areaId?.toString() || '',
        gerenciaId: licencia.gerenciaId?.toString() || '',
      });
    }
  }, [licencia]);

  const loadSelectData = async () => {
    try {
      setLoadingSelects(true);
      const [areasResponse, gerenciasResponse] = await Promise.all([
        fetch(API_ENDPOINTS.areasActive),
        fetch(API_ENDPOINTS.gerenciasActive),
      ]);

      if (areasResponse.ok) {
        const areasData = await areasResponse.json();
        setAreas(areasData);
      }

      if (gerenciasResponse.ok) {
        const gerenciasData = await gerenciasResponse.json();
        setGerencias(gerenciasData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoadingSelects(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigoLicencia.trim()) {
      newErrors.codigoLicencia = 'El código de licencia es requerido';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.tipoLicencia) {
      newErrors.tipoLicencia = 'El tipo de licencia es requerido';
    }

    if (!formData.proveedor.trim()) {
      newErrors.proveedor = 'El proveedor es requerido';
    }

    if (!formData.fechaCompra) {
      newErrors.fechaCompra = 'La fecha de compra es requerida';
    }

    if (formData.costo <= 0) {
      newErrors.costo = 'El costo debe ser mayor a 0';
    }

    if (formData.cantidadUsuarios <= 0) {
      newErrors.cantidadUsuarios = 'La cantidad de usuarios debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        costo: Number(formData.costo),
        cantidadUsuarios: Number(formData.cantidadUsuarios),
        areaId: formData.areaId ? Number(formData.areaId) : undefined,
        gerenciaId: formData.gerenciaId ? Number(formData.gerenciaId) : undefined,
        fechaVencimiento: formData.fechaVencimiento || undefined,
      };

      const url = licencia 
        ? `${API_ENDPOINTS.licencias}/${licencia.id}`
        : API_ENDPOINTS.licencias;
      
      const method = licencia ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la licencia');
      }

      onSave();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {licencia ? 'Editar Licencia' : 'Nueva Licencia'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Código y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Código de Licencia *
              </label>
              <input
                type="text"
                value={formData.codigoLicencia}
                onChange={(e) => handleInputChange('codigoLicencia', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.codigoLicencia ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: LIC-001"
              />
              {errors.codigoLicencia && (
                <p className="text-red-500 text-sm mt-1">{errors.codigoLicencia}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de la Licencia *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Microsoft Office 365"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>
          </div>

          {/* Row 2: Tipo y Proveedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Licencia *
              </label>
              <select
                value={formData.tipoLicencia}
                onChange={(e) => handleInputChange('tipoLicencia', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tipoLicencia ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar tipo</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Servicio">Servicio</option>
                <option value="Subscripcion">Subscripción</option>
              </select>
              {errors.tipoLicencia && (
                <p className="text-red-500 text-sm mt-1">{errors.tipoLicencia}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Proveedor *
              </label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => handleInputChange('proveedor', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.proveedor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Microsoft"
              />
              {errors.proveedor && (
                <p className="text-red-500 text-sm mt-1">{errors.proveedor}</p>
              )}
            </div>
          </div>

          {/* Row 3: Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Compra *
              </label>
              <input
                type="date"
                value={formData.fechaCompra}
                onChange={(e) => handleInputChange('fechaCompra', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fechaCompra ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaCompra && (
                <p className="text-red-500 text-sm mt-1">{errors.fechaCompra}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 4: Costo y Usuarios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Costo *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costo}
                onChange={(e) => handleInputChange('costo', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.costo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.costo && (
                <p className="text-red-500 text-sm mt-1">{errors.costo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Moneda
              </label>
              <select
                value={formData.moneda}
                onChange={(e) => handleInputChange('moneda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="PEN">PEN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cantidad de Usuarios *
              </label>
              <input
                type="number"
                min="1"
                value={formData.cantidadUsuarios}
                onChange={(e) => handleInputChange('cantidadUsuarios', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cantidadUsuarios ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cantidadUsuarios && (
                <p className="text-red-500 text-sm mt-1">{errors.cantidadUsuarios}</p>
              )}
            </div>
          </div>

          {/* Row 5: Estado y Asignado A */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Activa">Activa</option>
                <option value="Vencida">Vencida</option>
                <option value="PorVencer">Por Vencer</option>
                <option value="Suspendida">Suspendida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Asignado A
              </label>
              <input
                type="text"
                value={formData.asignadoA}
                onChange={(e) => handleInputChange('asignadoA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>

          {/* Row 6: Área y Gerencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Gerencia
              </label>
              <select
                value={formData.gerenciaId}
                onChange={(e) => handleInputChange('gerenciaId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingSelects}
              >
                <option value="">Seleccionar gerencia</option>
                {gerencias.map((gerencia) => (
                  <option key={gerencia.id} value={gerencia.id}>
                    {gerencia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Área
              </label>
              <select
                value={formData.areaId}
                onChange={(e) => handleInputChange('areaId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingSelects}
              >
                <option value="">Seleccionar área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 7: Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción adicional de la licencia..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 