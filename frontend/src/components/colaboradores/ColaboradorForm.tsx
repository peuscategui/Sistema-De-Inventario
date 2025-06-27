'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Empleado } from '@/app/colaboradores/page';

const colaboradorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').trim(),
  cargo: z.string().min(1, 'El cargo es requerido').trim(),
  gerencia: z.string().min(1, 'La gerencia es requerida').trim(),
});

type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

interface ColaboradorFormProps {
  empleado: Partial<Empleado> | null;
  onSubmit: (data: ColaboradorFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ColaboradorForm({ empleado, onSubmit, onCancel, isSubmitting }: ColaboradorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      nombre: empleado?.nombre || '',
      cargo: empleado?.cargo || '',
      gerencia: empleado?.gerencia || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre *
        </label>
        <input
          type="text"
          {...register('nombre')}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 sm:text-sm"
        />
        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
      </div>
      
      <div>
        <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
          Cargo *
        </label>
        <input
          type="text"
          {...register('cargo')}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 sm:text-sm"
        />
        {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo.message}</p>}
      </div>
      
      <div>
        <label htmlFor="gerencia" className="block text-sm font-medium text-gray-700">
          Gerencia *
        </label>
        <input
          type="text"
          {...register('gerencia')}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 sm:text-sm"
        />
        {errors.gerencia && <p className="text-red-500 text-xs mt-1">{errors.gerencia.message}</p>}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
} 