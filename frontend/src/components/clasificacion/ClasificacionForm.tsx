'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const clasificacionSchema = z.object({
  familia: z.string().min(1, 'La familia es requerida').trim(),
  sub_familia: z.string().min(1, 'La sub-familia es requerida').trim(),
  tipo_equipo: z.string().min(1, 'El tipo de equipo es requerido').trim(),
  vida_util: z.string().min(1, 'La vida útil es requerida').trim(),
  valor_reposicion: z.number().positive('El valor de reposición debe ser mayor a 0').min(0.01, 'El valor de reposición es requerido'),
});

type ClasificacionFormData = z.infer<typeof clasificacionSchema>;

interface ClasificacionFormProps {
  onSubmit: (data: ClasificacionFormData) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ClasificacionForm({ onSubmit, onCancel, initialData }: ClasificacionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClasificacionFormData>({
    resolver: zodResolver(clasificacionSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Familia *</label>
        <input {...register('familia')} className="w-full input" />
        {errors.familia && <p className="text-red-500 text-xs mt-1">{errors.familia.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Sub Familia *</label>
        <input {...register('sub_familia')} className="w-full input" />
        {errors.sub_familia && <p className="text-red-500 text-xs mt-1">{errors.sub_familia.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Equipo *</label>
        <input {...register('tipo_equipo')} className="w-full input" />
        {errors.tipo_equipo && <p className="text-red-500 text-xs mt-1">{errors.tipo_equipo.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Vida Útil (años) *</label>
        <input {...register('vida_util')} className="w-full input" />
        {errors.vida_util && <p className="text-red-500 text-xs mt-1">{errors.vida_util.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Valor de Reposición *</label>
        <input 
          type="number" 
          step="0.01" 
          {...register('valor_reposicion', { setValueAs: (v) => (v === "" ? NaN : parseFloat(v)) })} 
          className="w-full input" 
        />
        {errors.valor_reposicion && <p className="text-red-500 text-xs mt-1">{errors.valor_reposicion.message}</p>}
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
} 