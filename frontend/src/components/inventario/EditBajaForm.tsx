'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación para editar bajas
const editBajaSchema = z.object({
  fechaBaja: z.string().min(1, 'La fecha de baja es requerida'),
  motivoBaja: z.string().min(1, 'El motivo de baja es requerido'),
});

type EditBajaFormData = z.infer<typeof editBajaSchema>;

interface EditBajaFormProps {
  onSubmit: (data: EditBajaFormData) => void;
  onCancel: () => void;
  initialData?: {
    fechaBaja?: string;
    motivoBaja?: string;
  };
  isSubmitting?: boolean;
}

export default function EditBajaForm({ onSubmit, onCancel, initialData, isSubmitting = false }: EditBajaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBajaFormData>({
    resolver: zodResolver(editBajaSchema),
    defaultValues: {
      fechaBaja: initialData?.fechaBaja || '',
      motivoBaja: initialData?.motivoBaja || '',
    },
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Baja *</label>
          <input 
            {...register('fechaBaja')} 
            type="date"
            className={inputClass}
          />
          {errors.fechaBaja && <p className="text-red-500 text-xs mt-1">{errors.fechaBaja.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Motivo de Baja *</label>
          <textarea 
            {...register('motivoBaja')} 
            rows={4}
            className={inputClass}
            placeholder="Especificar el motivo de la baja del equipo"
          />
          {errors.motivoBaja && <p className="text-red-500 text-xs mt-1">{errors.motivoBaja.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Actualizar Baja'}
        </button>
      </div>
    </form>
  );
} 
 