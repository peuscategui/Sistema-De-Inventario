'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Interfaces para los datos relacionados
interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
  // ... otros campos de clasificacion que quieras mostrar
}

interface Empleado {
  id: number;
  nombre: string | null;
  cargo: string | null;
  // ... otros campos de empleado
}

// Interface principal para el item de inventario
interface InventoryItem {
  id: number;
  codigoEFC: string;
  tipoEquipo: string;
  familia: string;
  subFamilia: string | null;
  marca: string | null;
  modelo: string;
  descripcion: string | null;
  serie: string | null;
  procesador: string | null;
  anio: number | null;
  ram: string | null;
  discoDuro: string | null;
  sistemaOperativo: string | null;
  sede: string;
  estado: string;
  usuarios: string | null;
  cargo: string | null;
  gerencia: string;
  ubicacionEquipo: string;
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

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3002/inventory?page=${page}&pageSize=${pageSize}`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos del inventario');
        }
        const { data, pagination: paginationData } = await response.json();
        setInventory(data);
        setPagination(paginationData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [page, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset to first page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <PlusCircle size={20} />
          Añadir Item
        </button>
      </div>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Código EFC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo Equipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Familia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sub Familia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Serie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Colaborador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gerencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Observaciones</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.codigoEFC}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.tipoEquipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.clasificacion?.familia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.clasificacion?.sub_familia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.marca}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.modelo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.serie}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.empleado?.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.gerencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.ubicacionEquipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm truncate max-w-xs">{item.observaciones}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button className="text-primary hover:text-primary/80 mr-4">
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
    </div>
  );
} 