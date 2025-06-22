'use client';

import { Empleado } from '@/app/colaboradores/page';

interface ColaboradorFormProps {
  empleado: Partial<Empleado> | null;
  onFormChange: (name: keyof Empleado, value: string) => void;
  isSubmitting: boolean;
}

export default function ColaboradorForm({ empleado, onFormChange, isSubmitting }: ColaboradorFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFormChange(e.target.name as keyof Empleado, e.target.value);
  };

  return (
    <form className="space-y-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          name="nombre"
          id="nombre"
          value={empleado?.nombre || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
          Cargo
        </label>
        <input
          type="text"
          name="cargo"
          id="cargo"
          value={empleado?.cargo || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="gerencia" className="block text-sm font-medium text-gray-700">
          Gerencia
        </label>
        <input
          type="text"
          name="gerencia"
          id="gerencia"
          value={empleado?.gerencia || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 sm:text-sm"
        />
      </div>
    </form>
  );
} 