import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema con validación mejorada
const formSchema = z.object({
  codigoEFC: z.string().optional().nullable(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  serie: z.string().optional().nullable(),
  procesador: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  discoDuro: z.string().optional().nullable(),
  sistemaOperativo: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  motivoCompra: z.string().optional().nullable(),
  fecha_compra: z.string().optional().nullable(),
  proveedor: z.string().optional().nullable(),
  factura: z.string().optional().nullable(),
  precioUnitarioSinIgv: z.string().optional().nullable(),
  anioCompra: z.coerce.number().optional().nullable(),
}).refine((data) => {
  // Validación: al menos un campo debe tener contenido para crear un artículo
  const hasContent = Object.values(data).some(value => 
    value !== null && value !== undefined && value !== '' && value !== 0
  );
  return hasContent;
}, {
  message: "Debe completar al menos un campo para crear el artículo",
});

type ArticuloFormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: ArticuloFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<ArticuloFormData>;
  isSubmitting: boolean;
  isEditing?: boolean; // Nueva prop para distinguir entre crear y editar
}

const formFields = [
  { name: 'codigoEFC', label: 'Código EFC', type: 'text' },
  { name: 'marca', label: 'Marca', type: 'text' },
  { name: 'modelo', label: 'Modelo', type: 'text' },
  { name: 'descripcion', label: 'Descripción', type: 'text' },
  { name: 'serie', label: 'Serie', type: 'text' },
  { name: 'procesador', label: 'Procesador', type: 'text' },
  { name: 'ram', label: 'RAM', type: 'text' },
  { name: 'discoDuro', label: 'Disco Duro', type: 'text' },
  { name: 'sistemaOperativo', label: 'S.O.', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['libre', 'asignado'] },
  { name: 'motivoCompra', label: 'Motivo de Compra', type: 'text' },
  { name: 'fecha_compra', label: 'Fecha de Compra', type: 'date' },
  { name: 'proveedor', label: 'Proveedor', type: 'text' },
  { name: 'factura', label: 'Factura', type: 'text' },
  { name: 'precioUnitarioSinIgv', label: 'Precio Sin IGV', type: 'text' },
  { name: 'anioCompra', label: 'Año de Compra', type: 'number' },
];

const ArticuloForm = ({ onSubmit, onCancel, defaultValues = {}, isSubmitting, isEditing = false }: Props) => {
  console.log('🔍 DEBUG: ArticuloForm - defaultValues recibidos:', defaultValues);
  
  const { control, handleSubmit, formState: { errors } } = useForm<ArticuloFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      status: defaultValues.status || 'libre', // Valor por defecto para nuevos artículos
    },
  });

  // Función para formatear fechas de Excel
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
      {/* Mostrar error de validación general */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{errors.root.message}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formFields
          .filter(({ name }) => {
            // Ocultar fecha_compra solo en modo edición
            if (name === 'fecha_compra' && isEditing) {
              return false;
            }
            return true;
          })
          .map(({ name, label, type, options }) => (
          <div key={name} className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
            <Controller
              name={name as keyof ArticuloFormData}
              control={control}
              render={({ field }) => {
                // Formatear valor para fecha_compra
                const value = name === 'fecha_compra' 
                  ? excelSerialDateToInputFormat(field.value) || field.value || ''
                  : field.value ?? '';

                // Renderizar select para el campo status
                if (type === 'select' && options) {
                  return (
                    <select
                      {...field}
                      id={name}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={field.value || 'libre'}
                    >
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  );
                }

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
      
      {/* Botones de acción del formulario */}
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
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Artículo' : 'Crear Artículo')}
        </button>
      </div>
    </form>
  );
};

export default ArticuloForm; 
