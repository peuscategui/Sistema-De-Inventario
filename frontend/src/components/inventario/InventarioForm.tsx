'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';

// Esquema de validación Zod
const inventarioSchema = z.object({
  codigoEFC: z.string().min(1, 'El código EFC es requerido'),
  marca: z.string().min(1, 'La marca es requerida'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  serie: z.string().optional(),
  descripcion: z.string().optional(),
  sede: z.string().min(1, 'La sede es requerida'),
  estado: z.string().min(1, 'El estado es requerido'),
  ubicacionEquipo: z.string().optional(),
  condicion: z.string().optional(),
  repotenciadas: z.boolean().default(false),
  observaciones: z.string().optional(),
  clasificacionId: z.coerce.number().min(1, 'Debe seleccionar una clasificación'),
  empleadoId: z.coerce.number().optional().nullable(), // Permitir nulo y opcional
});

type InventarioFormData = z.infer<typeof inventarioSchema>;

// Interfaces para los datos de la API
interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
}

interface Empleado {
  id: number;
  nombre: string | null;
  cargo: string | null;
  gerencia: string | null;
}

// Opciones estáticas para las listas desplegables
const SEDE_OPTIONS = ["Chorrillos", "Surquillo", "Arequipa", "Cusco", "Pasco"];
const ESTADO_OPTIONS = ["ASIGNADA", "AVERIADA", "BAJA", "OPERATIVO", "PRESTAMO", "REPARACION", "STOCK"];
const CONDICION_OPTIONS = ["AVERIADA", "BAJA", "OBSOLETO", "OPERATIVO", "VIGENTE"];

interface InventarioFormProps {
  onSubmit: (data: InventarioFormData) => void;
  onCancel: () => void;
  initialData?: Partial<InventarioFormData>;
  isEditing?: boolean;
}

export default function InventarioForm({ onSubmit, onCancel, initialData, isEditing = false }: InventarioFormProps) {
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control, // Importante para integrar react-select
  } = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      codigoEFC: initialData?.codigoEFC ?? '',
      marca: initialData?.marca ?? '',
      modelo: initialData?.modelo ?? '',
      serie: initialData?.serie ?? '',
      descripcion: initialData?.descripcion ?? '',
      sede: initialData?.sede ?? '',
      estado: initialData?.estado ?? '',
      ubicacionEquipo: initialData?.ubicacionEquipo ?? '',
      condicion: initialData?.condicion ?? '',
      observaciones: initialData?.observaciones ?? '',
      clasificacionId: initialData?.clasificacionId ?? 0,
      repotenciadas: initialData?.repotenciadas ?? false,
      empleadoId: initialData?.empleadoId ?? null,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [clasificacionesRes, empleadosRes] = await Promise.all([
          fetch('http://localhost:3002/clasificacion?limit=1000'),
          fetch('http://localhost:3002/colaboradores?pageSize=10000')
        ]);

        if (clasificacionesRes.ok) {
          const clasificacionesData = await clasificacionesRes.json();
          setClasificaciones(Array.isArray(clasificacionesData.data) ? clasificacionesData.data : []);
        }

        if (empleadosRes.ok) {
          const empleadosData = await empleadosRes.json();
          setEmpleados(Array.isArray(empleadosData.data) ? empleadosData.data : []);
        }
      } catch (error) {
        console.error('Error cargando datos para el formulario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const empleadoOptions = empleados.map(e => ({
    value: e.id,
    label: e.nombre || 'Sin nombre',
  }));

  if (isLoading && !isEditing) {
    return <div className="p-8 text-center">Cargando datos del formulario...</div>;
  }

  const inputClass = "w-full px-3 py-2 border border-border rounded-md bg-background text-foreground";
  const btnPrimaryClass = "px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
  const btnSecondaryClass = "px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90";
  
  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#FFFFFF', // Fondo blanco para el control
      borderColor: '#E5E7EB',    // Borde gris claro
      height: '40px',          // Altura fija para igualar otros campos
      minHeight: '40px',       // Asegurar altura mínima
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#111827', // Texto oscuro para el valor seleccionado
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#FFFFFF', // Fondo del menú blanco
      border: '1px solid #E5E7EB', // Borde gris claro
      zIndex: 9999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#F3F4F6' : (state.isSelected ? '#E5E7EB' : '#FFFFFF'), // Gris claro para foco, gris más oscuro para selección, blanco normal
      color: '#111827', // Texto oscuro para las opciones
      "&:hover": {
        backgroundColor: '#F3F4F6' // Gris claro al pasar el mouse
      }
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#111827', // Texto de búsqueda oscuro
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#6B7280' // Color del placeholder gris
    })
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
        
        {/* Columna 1: Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Información Básica</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Código EFC *</label>
            <input {...register('codigoEFC')} className={inputClass} placeholder="Ingrese el código EFC" />
            {errors.codigoEFC && <p className="text-red-500 text-xs mt-1">{errors.codigoEFC.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marca *</label>
            <input {...register('marca')} className={inputClass} placeholder="Ej: HP, Dell, Lenovo" />
            {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modelo *</label>
            <input {...register('modelo')} className={inputClass} placeholder="Ej: ProBook 450 G8" />
            {errors.modelo && <p className="text-red-500 text-xs mt-1">{errors.modelo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Serie</label>
            <input {...register('serie')} className={inputClass} placeholder="Número de serie" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea {...register('descripcion')} rows={3} className={inputClass} placeholder="Descripción detallada del equipo" />
          </div>
        </div>

        {/* Columna 2: Asignación y Estado */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Asignación y Estado</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Clasificación *</label>
            <select {...register('clasificacionId')} className={inputClass} disabled={isLoading}>
              <option value="">{isLoading ? 'Cargando...' : 'Seleccionar clasificación'}</option>
              {clasificaciones.map(c => (
                <option key={c.id} value={c.id}>
                  {c.familia} - {c.sub_familia}
                </option>
              ))}
            </select>
            {errors.clasificacionId && <p className="text-red-500 text-xs mt-1">{errors.clasificacionId.message}</p>}
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Colaborador</label>
            <Controller
                name="empleadoId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={empleadoOptions}
                    isClearable
                    isSearchable
                    isLoading={isLoading}
                    placeholder="Buscar..."
                    styles={customSelectStyles}
                    value={empleadoOptions.find(c => c.value === field.value)}
                    onChange={val => field.onChange(val ? val.value : null)}
                  />
                )}
              />
            {errors.empleadoId && <p className="text-red-500 text-xs mt-1">{errors.empleadoId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sede *</label>
            <select {...register('sede')} className={inputClass}>
                <option value="">Seleccionar sede</option>
                {SEDE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors.sede && <p className="text-red-500 text-xs mt-1">{errors.sede.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado *</label>
            <select {...register('estado')} className={inputClass}>
              <option value="">Seleccionar estado</option>
              {ESTADO_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condición</label>
            <select {...register('condicion')} className={inputClass}>
              <option value="">Seleccionar condición</option>
              {CONDICION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Ubicación del Equipo</label>
            <input {...register('ubicacionEquipo')} className={inputClass} placeholder="Ej: Oficina 301, Almacén" />
          </div>
        </div>

        {/* Columna 3: Detalles Adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Detalles Adicionales</h3>
           <div className="flex items-center gap-2 pt-2">
            <input {...register('repotenciadas')} type="checkbox" id="repotenciadas" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="repotenciadas" className="text-sm font-medium">¿Es repotenciada?</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <textarea {...register('observaciones')} rows={8} className={inputClass} placeholder="Añadir observaciones sobre el estado, historial, etc." />
          </div>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
        <button type="button" onClick={onCancel} className={btnSecondaryClass}>
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className={btnPrimaryClass}>
          {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Inventario' : 'Crear Inventario')}
        </button>
      </div>
    </form>
  );
} 