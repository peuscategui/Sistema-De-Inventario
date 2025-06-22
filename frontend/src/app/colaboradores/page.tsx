'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import ColaboradorModal from '@/components/colaboradores/ColaboradorModal';

export interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
  gerencia: string | null;
}

export default function ColaboradoresPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });

  // State for modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Partial<Empleado> | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/colaboradores?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Error al obtener los datos');
      const { data, pagination: paginationData } = await response.json();
      setEmpleados(data);
      setPagination(paginationData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [page, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleOpenModal = (empleado: Empleado | null = null) => {
    if (empleado) {
      setSelectedEmpleado(empleado);
      setIsEditing(true);
    } else {
      setSelectedEmpleado({ nombre: '', cargo: '', gerencia: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
    setModalError(null); // Clear previous errors when opening
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmpleado(null);
    setIsEditing(false);
    setModalError(null); // Also clear on close
  };

  const handleFormChange = (name: keyof Empleado, value: string) => {
    setSelectedEmpleado(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async () => {
    if (!selectedEmpleado) return;
    setIsSubmitting(true);
    setModalError(null); // Clear previous error on new submission

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://localhost:3002/colaboradores/${selectedEmpleado.id}`
      : 'http://localhost:3002/colaboradores';
    
    // Explicitly create the payload to avoid sending the ID on create/update
    const payload = {
      nombre: selectedEmpleado.nombre || '',
      cargo: selectedEmpleado.cargo || null,
      gerencia: selectedEmpleado.gerencia || null,
    };

    console.log('Enviando payload:', payload); // DEBUG: Check what's being sent

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle NestJS validation errors format
        if (Array.isArray(errorData.message)) {
          throw new Error(errorData.message.join(', '));
        }
        throw new Error(errorData.message || 'Error al guardar el colaborador');
      }

      await fetchEmpleados(); // Refresh data
      handleCloseModal();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este colaborador?')) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3002/colaboradores/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar el colaborador');
      await fetchEmpleados(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ColaboradorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        empleado={selectedEmpleado}
        onFormChange={handleFormChange}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        error={modalError}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Colaboradores</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Añadir Colaborador
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
            <option value={50}>50</option>
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

      {loading && <p className="text-center py-4">Cargando colaboradores...</p>}
      {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="bg-card shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gerencia</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {empleados.map((empleado) => (
                <tr key={empleado.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{empleado.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{empleado.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{empleado.cargo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{empleado.gerencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button onClick={() => handleOpenModal(empleado)} className="text-primary hover:text-primary/80 mr-4">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(empleado.id)} className="text-destructive hover:text-destructive/80">
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