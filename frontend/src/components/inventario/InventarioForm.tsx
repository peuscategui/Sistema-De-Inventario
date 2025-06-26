'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';

// Esquema de validación Zod
const inventarioSchema = z.object({
  articuloId: z.coerce.number().min(1, 'Debe seleccionar un artículo'),
  sede: z.string().min(1, 'La sede es requerida'),
  estado: z.string().min(1, 'El estado es requerido'),
  ubicacionEquipo: z.string().optional(),
  condicion: z.string().optional(),
  cumpleStandard: z.boolean(),
  observaciones: z.string().optional(),
  clasificacionId: z.coerce.number().min(1, 'Debe seleccionar una clasificación'),
  empleadoId: z.coerce.number().optional().nullable(),
  fechaBaja: z.string().optional(),
  motivoBaja: z.string().optional(),
  fechaDonacion: z.string().optional(),
  motivoDonacion: z.string().optional(),
}).refine((data) => {
  // Si el estado es BAJA, fechaBaja y motivoBaja son requeridos
  if (data.estado === 'BAJA') {
    return data.fechaBaja && data.fechaBaja.length > 0 && 
           data.motivoBaja && data.motivoBaja.length > 0;
  }
  // Si el estado es DONACION, fechaDonacion y motivoDonacion son requeridos
  if (data.estado === 'DONACION') {
    return data.fechaDonacion && data.fechaDonacion.length > 0 && 
           data.motivoDonacion && data.motivoDonacion.length > 0;
  }
  return true;
}, {
  message: "Los campos de fecha y motivo son requeridos según el estado seleccionado",
  path: ["fechaBaja"] // Esto mostrará el error en el campo fechaBaja
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
}

interface Articulo {
  id: number;
  serie: string | null;
  marca: string | null;
  modelo: string | null;
  codigoEFC: string | null;
}

// Opciones estáticas
const SEDE_OPTIONS = ["Chorrillos", "Surquillo", "Arequipa", "Cusco", "Pasco"];
const ESTADO_OPTIONS = ["ASIGNADO", "BAJA", "STOCK", "EN SERVICIO", "DONACION"];
const CONDICION_OPTIONS = ["OPERATIVO", "OBSOLETO", "AVERIADO"];
const UBICACION_OPTIONS = ["AREQUIPA", "CHORRILLOS", "SURQUILLO", "CUZCO", "ESPAÑA", "HIBRIDO", "PASCO", "CASA"];

interface InventarioFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Partial<InventarioFormData>;
  isEditing?: boolean;
}

export default function InventarioForm({ onSubmit, onCancel, initialData, isEditing = false }: InventarioFormProps) {
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      cumpleStandard: false,
      ...initialData
    },
  });

  // Observar cambios en el campo estado
  const estadoValue = watch('estado');
  
  useEffect(() => {
    setEstadoSeleccionado(estadoValue || '');
    // Si el estado es BAJA, limpiar el campo condición y los campos de donación
    if (estadoValue === 'BAJA') {
      setValue('condicion', '');
      setValue('fechaDonacion', '');
      setValue('motivoDonacion', '');
    } else if (estadoValue === 'DONACION') {
      // Si el estado es DONACION, limpiar el campo condición y los campos de baja
      setValue('condicion', '');
      setValue('fechaBaja', '');
      setValue('motivoBaja', '');
    } else {
      // Si el estado no es BAJA ni DONACION, limpiar todos los campos especiales
      setValue('fechaBaja', '');
      setValue('motivoBaja', '');
      setValue('fechaDonacion', '');
      setValue('motivoDonacion', '');
    }
  }, [estadoValue, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [clasificacionesRes, empleadosRes, articulosRes] = await Promise.all([
          fetch('http://localhost:3002/clasificacion?limit=1000'),
          fetch('http://localhost:3002/colaboradores?pageSize=10000'),
          fetch('http://localhost:3002/inventory?pageSize=10000') // Obtener todos los artículos
        ]);

        if (clasificacionesRes.ok) {
          const clasificacionesData = await clasificacionesRes.json();
          setClasificaciones(Array.isArray(clasificacionesData.data) ? clasificacionesData.data : []);
        }

        if (empleadosRes.ok) {
          const empleadosData = await empleadosRes.json();
          setEmpleados(Array.isArray(empleadosData.data) ? empleadosData.data : []);
        }

        if (articulosRes.ok) {
          const articulosData = await articulosRes.json();
          setArticulos(Array.isArray(articulosData.data) ? articulosData.data : []);
        }
      } catch (error) {
        console.error('Error cargando datos para el formulario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const empleadoOptions = empleados.map(e => ({ value: e.id, label: e.nombre || 'Sin nombre' }));
  const articuloOptions = articulos.map(a => ({
    value: a.id,
    label: `Serie: ${a.serie || 'N/A'} (Marca: ${a.marca || 'N/A'}, Modelo: ${a.modelo || 'N/A'})`
  }));

  const handleArticuloChange = (option: any) => {
    setValue('articuloId', option ? option.value : 0);
    // Opcional: podrías usar esta selección para pre-rellenar otros campos si fuera necesario
  };

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
        color: '#6B7280', // Color del placeholder gris
        fontSize: '13px',
    })
  };

  return (
    <form onSubmit={handleSubmit(data => onSubmit({ ...data, id: data.articuloId }))} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
        
        {/* Columna 1: Asignación y Estado */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Asignación y Estado</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Artículo *</label>
            <Controller
              name="articuloId"
              control={control}
              render={({ field }) => (
                <Select
                  options={articuloOptions}
                  isClearable
                  isSearchable
                  isLoading={isLoading}
                  placeholder="Buscar por marca, modelo y/o serie"
                  styles={customSelectStyles}
                  value={articuloOptions.find(c => c.value === field.value)}
                  onChange={handleArticuloChange}
                />
              )}
            />
            {errors.articuloId && <p className="text-red-500 text-xs mt-1">{errors.articuloId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Colaborador</label>
            <Controller
              name="empleadoId"
              control={control}
              render={({ field }) => (
                <Select
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
            <label className="block text-sm font-medium mb-1">Clasificación *</label>
            <select {...register('clasificacionId')} className={inputClass} disabled={isLoading}>
              <option value="">{isLoading ? 'Cargando...' : 'Seleccionar clasificación'}</option>
              {clasificaciones.map(c => (<option key={c.id} value={c.id}>{c.familia} - {c.sub_familia}</option>))}
            </select>
            {errors.clasificacionId && <p className="text-red-500 text-xs mt-1">{errors.clasificacionId.message}</p>}
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
            <label className="block text-sm font-medium mb-1">Ubicación del Equipo</label>
            <select {...register('ubicacionEquipo')} className={inputClass}>
              <option value="">Seleccionar ubicación</option>
              {UBICACION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors.ubicacionEquipo && <p className="text-red-500 text-xs mt-1">{errors.ubicacionEquipo.message}</p>}
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
            <select 
              {...register('condicion')} 
              className={inputClass}
              disabled={estadoValue === 'BAJA' || estadoValue === 'DONACION'}
            >
              <option value="">
                {estadoValue === 'BAJA' ? 'No aplica (Estado: BAJA)' : 
                 estadoValue === 'DONACION' ? 'No aplica (Estado: DONACION)' : 
                 'Seleccionar condición'}
              </option>
              {CONDICION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors.condicion && <p className="text-red-500 text-xs mt-1">{errors.condicion.message}</p>}
          </div>

          {/* Campos que aparecen solo cuando el estado es BAJA */}
          {estadoValue === 'BAJA' && (
            <>
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
                  rows={3}
                  className={inputClass}
                  placeholder="Especificar el motivo de la baja del equipo"
                />
                {errors.motivoBaja && <p className="text-red-500 text-xs mt-1">{errors.motivoBaja.message}</p>}
              </div>
            </>
          )}

          {/* Campos que aparecen solo cuando el estado es DONACION */}
          {estadoValue === 'DONACION' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Donación *</label>
                <input 
                  {...register('fechaDonacion')} 
                  type="date"
                  className={inputClass}
                />
                {errors.fechaDonacion && <p className="text-red-500 text-xs mt-1">{errors.fechaDonacion.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo de Donación *</label>
                <textarea 
                  {...register('motivoDonacion')} 
                  rows={3}
                  className={inputClass}
                  placeholder="Especificar el motivo de la donación del equipo"
                />
                {errors.motivoDonacion && <p className="text-red-500 text-xs mt-1">{errors.motivoDonacion.message}</p>}
              </div>
            </>
          )}
        </div>

        {/* Columna 2: Detalles Adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Detalles Adicionales</h3>
          <div className="flex items-center gap-2 pt-2">
            <input {...register('cumpleStandard')} type="checkbox" id="cumpleStandard" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="cumpleStandard" className="text-sm font-medium">Cumple Standard</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <textarea {...register('observaciones')} rows={12} className={inputClass} placeholder="Añadir observaciones sobre el estado, historial, etc." />
          </div>
        </div>

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
          disabled={isLoading} 
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isEditing ? 'Actualizar' : 'Crear'} Inventario
        </button>
      </div>
    </form>
  );
} 