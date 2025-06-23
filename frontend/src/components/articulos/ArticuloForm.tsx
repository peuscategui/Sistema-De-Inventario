import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  codigoEFC: z.string().optional().nullable(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  serie: z.string().optional().nullable(),
  procesador: z.string().optional().nullable(),
  anio: z.coerce.number().optional().nullable(),
  ram: z.string().optional().nullable(),
  discoDuro: z.string().optional().nullable(),
  sistemaOperativo: z.string().optional().nullable(),
  condicion: z.string().optional().nullable(),
  motivoCompra: z.string().optional().nullable(),
  vidaUtil: z.string().optional().nullable(),
  fecha_compra: z.string().optional().nullable(),
  proveedor: z.string().optional().nullable(),
  factura: z.string().optional().nullable(),
  precioUnitarioSinIgv: z.string().optional().nullable(),
  anioCompra: z.coerce.number().optional().nullable(),
});

type ArticuloFormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: ArticuloFormData) => void;
  defaultValues?: Partial<ArticuloFormData>;
  isSubmitting: boolean;
}

const formFields = [
  { name: 'codigoEFC', label: 'Código EFC', type: 'text' },
  { name: 'marca', label: 'Marca', type: 'text' },
  { name: 'modelo', label: 'Modelo', type: 'text' },
  { name: 'descripcion', label: 'Descripción', type: 'text' },
  { name: 'serie', label: 'Serie', type: 'text' },
  { name: 'procesador', label: 'Procesador', type: 'text' },
  { name: 'anio', label: 'Año', type: 'number' },
  { name: 'ram', label: 'RAM', type: 'text' },
  { name: 'discoDuro', label: 'Disco Duro', type: 'text' },
  { name: 'sistemaOperativo', label: 'S.O.', type: 'text' },
  { name: 'condicion', label: 'Condición', type: 'text' },
  { name: 'motivoCompra', label: 'Motivo de Compra', type: 'text' },
  { name: 'vidaUtil', label: 'Vida Útil', type: 'text' },
  { name: 'fecha_compra', label: 'Fecha de Compra', type: 'date' },
  { name: 'proveedor', label: 'Proveedor', type: 'text' },
  { name: 'factura', label: 'Factura', type: 'text' },
  { name: 'precioUnitarioSinIgv', label: 'Precio Sin IGV', type: 'text' },
  { name: 'anioCompra', label: 'Año de Compra', type: 'number' },
];

const ArticuloForm = ({ onSubmit, defaultValues = {}, isSubmitting }: Props) => {
  const { control, handleSubmit, formState: { errors } } = useForm<ArticuloFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const excelSerialDateToInputFormat = (serial: any) => {
    if (!serial || typeof serial !== 'number') return '';
    try {
      // El número 25569 es la diferencia de días entre la época de Unix y la época de Excel
      const utc_days = Math.floor(serial - 25569);
      const date = new Date(utc_days * 86400 * 1000);
      // Ajustar por la zona horaria para que la fecha en el input sea la correcta
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset * 60000));
      return adjustedDate.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formFields.map(({ name, label, type }) => (
          <div key={name} className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
            <Controller
              name={name as keyof ArticuloFormData}
              control={control}
              render={({ field }) => {
                // Interceptar y formatear el valor para el campo de fecha
                const value = name === 'fecha_compra' 
                  ? excelSerialDateToInputFormat(field.value) 
                  : field.value ?? '';

                return (
                  <input
                    {...field}
                    id={name}
                    type={type}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={value}
                  />
                );
              }}
            />
            {errors[name as keyof ArticuloFormData] && <span className="text-red-500 text-xs mt-1">{errors[name as keyof ArticuloFormData]?.message}</span>}
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Artículo'}
      </button>
    </form>
  );
};

export default ArticuloForm; 