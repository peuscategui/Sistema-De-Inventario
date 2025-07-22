'use client';

import { Edit, Trash2, Eye, AlertTriangle, Calendar, DollarSign, Users, Building2 } from 'lucide-react';

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
  area?: { id: number; nombre: string };
  gerencia?: { id: number; nombre: string };
}

interface LicensesListProps {
  licencias: Licencia[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (licencia: Licencia) => void;
  onEdit: (licencia: Licencia) => void;
  onDelete: (id: number) => void;
}

export default function LicensesList({
  licencias,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: LicensesListProps) {
  const getEstadoBadge = (estado: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (estado) {
      case 'Activa':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Vencida':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'PorVencer':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Suspendida':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (tipo) {
      case 'Software':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Hardware':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Servicio':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Subscripcion':
        return `${baseClasses} bg-cyan-100 text-cyan-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getDaysUntilExpiry = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return null;
    
    const today = new Date();
    const expiry = new Date(fechaVencimiento);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // Botón anterior
    pageButtons.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
    );

    // Botones de páginas
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            currentPage === i
              ? 'text-primary bg-primary/10 border-primary'
              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Botón siguiente
    pageButtons.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    );

    return (
      <div className="flex items-center justify-center space-x-0">
        {pageButtons}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (licencias.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <div className="text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay licencias</h3>
          <p>No se encontraron licencias con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Código / Nombre</th>
              <th className="text-left p-4 font-medium">Tipo</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-left p-4 font-medium">Proveedor</th>
              <th className="text-left p-4 font-medium">Vencimiento</th>
              <th className="text-left p-4 font-medium">Costo</th>
              <th className="text-left p-4 font-medium">Usuarios</th>
              <th className="text-left p-4 font-medium">Área/Gerencia</th>
              <th className="text-center p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {licencias.map((licencia) => {
              const daysUntilExpiry = getDaysUntilExpiry(licencia.fechaVencimiento);
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
              
              return (
                <tr key={licencia.id} className="border-t hover:bg-muted/20">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{licencia.codigoLicencia}</div>
                      <div className="text-muted-foreground text-sm truncate max-w-[200px]" title={licencia.nombre}>
                        {licencia.nombre}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={getTipoBadge(licencia.tipoLicencia)}>
                      {licencia.tipoLicencia}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={getEstadoBadge(licencia.estado)}>
                        {licencia.estado}
                      </span>
                                             {isExpiringSoon && (
                         <AlertTriangle className="h-4 w-4 text-yellow-500" />
                       )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className="text-sm">{licencia.proveedor}</span>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      {licencia.fechaVencimiento ? (
                        <div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(licencia.fechaVencimiento)}</span>
                          </div>
                          {daysUntilExpiry !== null && (
                            <div className={`text-xs ${
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
                      ) : (
                        <span className="text-muted-foreground">Sin vencimiento</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-sm">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatCurrency(licencia.costo, licencia.moneda)}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-sm">
                      <Users className="h-3 w-3" />
                      <span>{licencia.cantidadUsuarios}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      {licencia.area && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[120px]" title={licencia.area.nombre}>
                            {licencia.area.nombre}
                          </span>
                        </div>
                      )}
                      {licencia.gerencia && (
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]" title={licencia.gerencia.nombre}>
                          {licencia.gerencia.nombre}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onView(licencia)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(licencia)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Editar licencia"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(licencia.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar licencia"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            {renderPagination()}
          </div>
        </div>
      )}
    </div>
  );
} 