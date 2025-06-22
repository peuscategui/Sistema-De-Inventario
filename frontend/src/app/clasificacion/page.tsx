'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface Clasificacion {
  id: number;
  familia: string;
  sub_familia: string;
  tipo_equipo: string;
  vida_util: string;
  valor_reposicion: number;
}

export default function ClasificacionPage() {
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasificaciones = async () => {
      try {
        const response = await fetch('http://localhost:3002/clasificacion');
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        const data = await response.json();
        setClasificaciones(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasificaciones();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Clasificación</h1>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <PlusCircle size={20} />
          Crear Nueva Clasificación
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="bg-card shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Familia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sub Familia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Equipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vida Útil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Reposición</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {clasificaciones.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.familia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.sub_familia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.tipo_equipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.vida_util}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${Number(item.valor_reposicion).toFixed(2)}</td>
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