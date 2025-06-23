'use client';

import ColaboradorForm from './ColaboradorForm';
import { Empleado } from '@/app/colaboradores/page';

interface ColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  empleado: Partial<Empleado> | null;
  onFormChange: (name: keyof Empleado, value: string) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  error: string | null;
}

export default function ColaboradorModal({
  isOpen,
  onClose,
  onSubmit,
  empleado,
  onFormChange,
  isSubmitting,
  isEditing,
  error,
}: ColaboradorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar Colaborador' : 'Añadir Nuevo Colaborador'}
        </h2>
        
        <ColaboradorForm 
          empleado={empleado}
          onFormChange={onFormChange}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="mt-4 text-red-500 text-sm p-3 bg-red-100 border border-red-400 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
} 