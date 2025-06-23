'use client';

import ClasificacionForm from './ClasificacionForm';

interface ClasificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing: boolean;
}

export default function ClasificacionModal({ isOpen, onClose, onSubmit, initialData, isEditing }: ClasificacionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-background p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Clasificación' : 'Añadir Nueva Clasificación'}</h2>
        <ClasificacionForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </div>
    </div>
  );
} 