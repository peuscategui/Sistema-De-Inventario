'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación para editar donaciones - campos opcionales
const editDonacionSchema = z.object({
  fechaDonacion: z.string().optional(),
  motivoDonacion: z.string().optional(),
});

type EditDonacionFormData = z.infer<typeof editDonacionSchema>;

interface EditDonacionFormProps {
  onSubmit: (data: EditDonacionFormData) => void;
  onCancel: () => void;
  initialData?: {
    fechaDonacion?: string;
    motivoDonacion?: string;
    fechaBaja?: string;
    motivoBaja?: string;
  };
  isSubmitting?: boolean;
}

export default function EditDonacionForm({ onSubmit, onCancel, initialData, isSubmitting = false }: EditDonacionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditDonacionFormData>({
    resolver: zodResolver(editDonacionSchema),
    defaultValues: {
      fechaDonacion: initialData?.fechaDonacion || '',
      motivoDonacion: initialData?.motivoDonacion || '',
    },
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Mostrar información de baja si existe */}
        {(initialData?.fechaBaja || initialData?.motivoBaja) && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4 border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-gray-700 mb-2">Información de Baja (Historial):</p>
            <p className="text-xs text-gray-600">Fecha: {initialData?.fechaBaja ? new Date(initialData.fechaBaja).toLocaleDateString() : '-'}</p>
            <p className="text-xs text-gray-600">Motivo: {initialData?.motivoBaja || '-'}</p>
            <p className="text-xs text-gray-500 mt-2 italic">Esta información se conservará al actualizar la donación</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Donación <span className="text-gray-500 text-xs">(opcional)</span></label>
          <input 
            {...register('fechaDonacion')} 
            type="date"
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-1">Si no se especifica, se conservará la fecha de baja como referencia</p>
          {errors.fechaDonacion && <p className="text-red-500 text-xs mt-1">{errors.fechaDonacion.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Motivo de Donación <span className="text-gray-500 text-xs">(opcional)</span></label>
          <textarea 
            {...register('motivoDonacion')} 
            rows={4}
            className={inputClass}
            placeholder="Especificar el motivo de la donación del equipo (opcional)"
          />
          <p className="text-xs text-gray-500 mt-1">Si no se especifica, se conservará el motivo de la baja</p>
          {errors.motivoDonacion && <p className="text-red-500 text-xs mt-1">{errors.motivoDonacion.message}</p>}
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
          {isSubmitting ? 'Guardando...' : 'Actualizar Donación'}
        </button>
      </div>
    </form>
  );
}

