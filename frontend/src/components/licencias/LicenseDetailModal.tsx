'use client';

import { X, KeySquare, Calendar, DollarSign, Users, Building2, FileText, User, Package } from 'lucide-react';

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
  area?: { id: number; nombre: string };
  gerencia?: { id: number; nombre: string };
  createdAt: string;
  updatedAt: string;
}

interface LicenseDetailModalProps {
  licencia: Licencia | null;
  onClose: () => void;
}

export default function LicenseDetailModal({ licencia, onClose }: LicenseDetailModalProps) {
  if (!licencia) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'Activa': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
      'Vencida': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
      'PorVencer': 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
      'Suspendida': 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full',
    };
    return badges[estado as keyof typeof badges] || badges['Activa'];
  };

  const getTipoBadge = (tipo: string) => {
    const badges = {
      'Software': 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
      'Hardware': 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full',
      'Servicio': 'px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full',
      'Subscripcion': 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full',
    };
    return badges[tipo as keyof typeof badges] || badges['Software'];
  };

  const getDaysUntilExpiry = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return null;
    
    const today = new Date();
    const expiry = new Date(fechaVencimiento);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry(licencia.fechaVencimiento);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <KeySquare className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Detalles de Licencia</h2>
              <p className="text-sm text-muted-foreground">{licencia.codigoLicencia}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Licencia
                </label>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                    {licencia.codigoLicencia}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Licencia
                </label>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{licencia.nombre}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Licencia
                </label>
                <span className={getTipoBadge(licencia.tipoLicencia)}>
                  {licencia.tipoLicencia}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <span className={getEstadoBadge(licencia.estado)}>
                  {licencia.estado}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{licencia.proveedor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Compra
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formatDate(licencia.fechaCompra)}</span>
                </div>
              </div>

              {licencia.fechaVencimiento && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(licencia.fechaVencimiento)}</span>
                  </div>
                  {daysUntilExpiry !== null && (
                    <div className={`text-xs mt-1 ${
                      daysUntilExpiry < 0 ? 'text-red-600' :
                      daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {daysUntilExpiry < 0 
                        ? `Vencida hace ${Math.abs(daysUntilExpiry)} días`
                        : `${daysUntilExpiry} días restantes`
                      }
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold">
                    {formatCurrency(licencia.costo, licencia.moneda)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Uso */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Información de Uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Usuarios
                </label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{licencia.cantidadUsuarios}</span>
                </div>
              </div>

              {licencia.asignadoA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asignado A
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{licencia.asignadoA}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organización */}
          {(licencia.area || licencia.gerencia) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Organización</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {licencia.gerencia && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gerencia
                    </label>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{licencia.gerencia.nombre}</span>
                    </div>
                  </div>
                )}

                {licencia.area && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área
                    </label>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{licencia.area.nombre}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          {licencia.descripcion && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Descripción</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {licencia.descripcion}
                </p>
              </div>
            </div>
          )}

          {/* Información de Sistema */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Creación
                </label>
                <span className="text-sm text-gray-600">
                  {formatDate(licencia.createdAt)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Última Actualización
                </label>
                <span className="text-sm text-gray-600">
                  {formatDate(licencia.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
} 