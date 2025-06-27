'use client';

import ColaboradorForm from './ColaboradorForm';
import { Empleado } from '@/app/colaboradores/page';

interface ColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  empleado: Partial<Empleado> | null;
  isSubmitting: boolean;
  isEditing: boolean;
  error: string | null;
}

export default function ColaboradorModal({
  isOpen,
  onClose,
  onSubmit,
  empleado,
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
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="mt-4 text-red-500 text-sm p-3 bg-red-100 border border-red-400 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
} 