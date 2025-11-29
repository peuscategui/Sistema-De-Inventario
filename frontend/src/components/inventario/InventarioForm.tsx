'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { API_ENDPOINTS } from '@/config/api';

// Esquema de validación Zod
const inventarioSchemaCreate = z.object({
  articuloId: z.coerce.number().min(1, 'Debe seleccionar un artículo'),
  codigoEFC: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  serie: z.string().optional(),
  descripcion: z.string().optional(),
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
  // Si el estado es DONACION, los campos de donación son opcionales
  // Se puede pasar de BAJA a DONACION manteniendo la info de baja
  return true;
}, {
  message: "Los campos de fecha y motivo son requeridos según el estado seleccionado",
  path: ["fechaBaja"] // Esto mostrará el error en el campo fechaBaja
});

const inventarioSchemaEdit = z.object({
  articuloId: z.coerce.number().min(1, 'Debe seleccionar un artículo'),
  codigoEFC: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  serie: z.string().optional(),
  descripcion: z.string().optional(),
  sede: z.string().optional(),
  estado: z.string().optional(),
  ubicacionEquipo: z.string().optional(),
  condicion: z.string().optional(),
  cumpleStandard: z.boolean().optional(),
  observaciones: z.string().optional(),
  clasificacionId: z.coerce.number().optional(),
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
  // Si el estado es DONACION, los campos de donación son opcionales
  // Se puede pasar de BAJA a DONACION manteniendo la info de baja
  return true;
}, {
  message: "Los campos de fecha y motivo son requeridos según el estado seleccionado",
  path: ["fechaBaja"]
});

type InventarioFormData = z.infer<typeof inventarioSchemaCreate>;

// Interfaces para los datos de la API
interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
  tipo_equipo?: string | null;
  vida_util?: string | null;
  valor_reposicion?: number | null;
}

interface Empleado {
  id: number;
  nombre: string | null;
  usuario: string | null; // Nuevo campo para el usuario
}

interface Articulo {
  id: number;
  serie: string | null;
  marca: string | null;
  modelo: string | null;
  codigoEFC: string | null;
  status: string;
  estado?: string | null;
  descripcion?: string | null;
}

// Opciones estáticas
const SEDE_OPTIONS = ["Chorrillos", "Surquillo", "Arequipa", "Cusco", "Pasco"];
const ESTADO_OPTIONS = ["ASIGNADA", "OPERATIVO", "STOCK", "AVERIADA", "PRESTAMO", "REPARACION", "BAJA", "DONACION"];
const CONDICION_OPTIONS = ["OPERATIVO", "OBSOLETO", "OBSOLETA", "AVERIADA", "VIGENTE"];
const UBICACION_OPTIONS = ["Arequipa", "Chorrillos", "Surquillo", "Cuzco", "Cusco", "España", "Hibrido", "Pasco", "Casa"];

interface InventarioFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Partial<InventarioFormData>;
  isEditing?: boolean;
}

export default function InventarioForm({ onSubmit, onCancel, initialData, isEditing = false }: InventarioFormProps) {
  console.log('🔍 DEBUG: ===== INVENTARIO FORM RENDERIZADO =====');
  console.log('🔍 DEBUG: isEditing:', isEditing);
  console.log('🔍 DEBUG: initialData:', initialData);
  
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Estado local para el colaborador
  const [selectedEmpleado, setSelectedEmpleado] = useState<any>(null);
  const [initialValuesSet, setInitialValuesSet] = useState(false);

  const schemaToUse = isEditing ? inventarioSchemaEdit : inventarioSchemaCreate;
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schemaToUse),
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
      // Si el estado es DONACION, mantener los campos de baja (historial)
      // Solo limpiar el campo condición
      setValue('condicion', '');
      // NO limpiar fechaBaja ni motivoBaja - se mantienen como historial
    } else {
      // Si el estado no es BAJA ni DONACION, limpiar todos los campos especiales
      setValue('fechaBaja', '');
      setValue('motivoBaja', '');
      setValue('fechaDonacion', '');
      setValue('motivoDonacion', '');
    }
  }, [estadoValue, setValue]);

  useEffect(() => {
    if (isEditing && initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, [isEditing, initialData, setValue]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setIsLoading(true);

        // Fetch paginado de colaboradores para traer todos
        const fetchAllColaboradores = async (): Promise<Empleado[]> => {
          let all: Empleado[] = [];
          let page = 1;
          let hasMore = true;
          const limit = 100;
          while (hasMore) {
            const res = await fetch(`${API_ENDPOINTS.colaboradores}?pageSize=${limit}&page=${page}`);
            const data = await res.json();
            console.log('DEBUG colaboradores respuesta:', data); // <-- LOG DE DEPURACIÓN
            let arr: Empleado[] = [];
            if (Array.isArray(data)) {
              arr = data;
            } else if (Array.isArray(data.items)) {
              arr = data.items;
            } else if (Array.isArray(data.data)) {
              arr = data.data;
            } else if (Array.isArray(data.colaboradores)) {
              arr = data.colaboradores;
            }
            all = all.concat(arr);
            hasMore = arr.length === limit;
            page++;
          }
          return all;
        };

        // Fetch paginado de artículos para traer todos (igual que colaboradores)
        const fetchAllArticulos = async (): Promise<Articulo[]> => {
          let all: Articulo[] = [];
          let page = 1;
          let hasMore = true;
          const pageSize = 100;
          while (hasMore) {
            const res = await fetch(`${API_ENDPOINTS.inventory}?pageSize=${pageSize}&page=${page}`);
            const data = await res.json();
            console.log('DEBUG artículos respuesta:', data); // <-- LOG DE DEPURACIÓN
            let arr: Articulo[] = [];
            if (Array.isArray(data)) {
              arr = data;
            } else if (Array.isArray(data.items)) {
              arr = data.items;
            } else if (Array.isArray(data.data)) {
              arr = data.data;
            } else if (Array.isArray(data.inventory)) {
              arr = data.inventory;
            }
            all = all.concat(arr);
            hasMore = arr.length === pageSize;
            page++;
          }
          return all;
        };

        const [clasificacionesRes, colaboradoresAll, articulosAll] = await Promise.all([
          fetch(`${API_ENDPOINTS.clasificacion}?pageSize=1000`),
          fetchAllColaboradores(),
          fetchAllArticulos() // CORREGIDO: Usar función paginada
        ]);

        // Clasificaciones
        if (clasificacionesRes.ok) {
          const clasificacionesData = await clasificacionesRes.json();
          const clasificacionesArray = clasificacionesData.items || clasificacionesData.data || clasificacionesData;
          setClasificaciones(Array.isArray(clasificacionesArray) ? clasificacionesArray : []);
        }

        // Colaboradores (ya es array)
        setEmpleados(Array.isArray(colaboradoresAll) ? colaboradoresAll : []);

        // Artículos (ya es array)
        setArticulos(Array.isArray(articulosAll) ? articulosAll : []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const empleadoOptions = Array.isArray(empleados)
    ? empleados.map(e => ({
        value: e.id,
        label:
          (e.nombre && e.nombre.trim()) ? e.nombre :
          (e.usuario && e.usuario.trim()) ? e.usuario :
          `Colaborador ID ${e.id}`
      }))
    : [];
  const articuloOptions = Array.isArray(articulos) ? articulos
    .filter(a => {
      // En modo de edición, incluir también el artículo que se está editando
      if (isEditing && initialData?.articuloId && a.id === initialData.articuloId) {
        return true;
      }
      // En modo de creación, solo artículos libres
      return a.status === 'libre';
    })
    .map(a => {
      const codigo = a.codigoEFC || 'Sin código';
      const marca = a.marca || 'N/A';
      const modelo = a.modelo || 'N/A';
      const serie = a.serie || 'N/A';
      const status = a.status || 'N/A';
      return {
        value: a.id,
        label: `${codigo} - ${marca} ${modelo} (Serie: ${serie}) [${status}]`
      };
    }) : [];

  useEffect(() => {
    if (
      isEditing &&
      initialData &&
      articuloOptions.length > 0 &&
      empleadoOptions.length > 0 &&
      clasificaciones.length > 0 &&
      !initialValuesSet
    ) {
      console.log('🔍 DEBUG: Estableciendo valores iniciales en modo edición (SOLO UNA VEZ)');
      console.log('🔍 DEBUG: initialData completo:', JSON.stringify(initialData, null, 2));
      console.log('🔍 DEBUG: initialData.articuloId:', initialData.articuloId);
      console.log('🔍 DEBUG: initialData.empleadoId:', initialData.empleadoId);
      console.log('🔍 DEBUG: initialData.estado:', initialData.estado);
      console.log('🔍 DEBUG: initialData.condicion:', initialData.condicion);
      console.log('🔍 DEBUG: initialData.ubicacionEquipo:', initialData.ubicacionEquipo);
      console.log('🔍 DEBUG: articuloOptions disponibles:', articuloOptions.map(a => ({ id: a.value, label: a.label })));
      console.log('🔍 DEBUG: empleadoOptions disponibles:', empleadoOptions.map(e => ({ id: e.value, label: e.label })));
      
      if (initialData.articuloId) {
        const articuloEncontrado = articuloOptions.some(a => a.value === initialData.articuloId);
        console.log('🔍 DEBUG: ¿Artículo encontrado en opciones?', articuloEncontrado);
        if (articuloEncontrado) {
          setValue('articuloId', initialData.articuloId);
          console.log('🔍 DEBUG: Valor articuloId establecido:', initialData.articuloId);
        }
      }
      
      if (initialData.empleadoId) {
        const empleadoEncontrado = empleadoOptions.some(e => e.value === initialData.empleadoId);
        console.log('🔍 DEBUG: ¿Empleado encontrado en opciones?', empleadoEncontrado);
        if (empleadoEncontrado) {
          setValue('empleadoId', initialData.empleadoId);
          console.log('🔍 DEBUG: Valor empleadoId establecido:', initialData.empleadoId);
          
          // Establecer el estado local del colaborador
          const empleadoSeleccionado = empleadoOptions.find(e => e.value === initialData.empleadoId);
          setSelectedEmpleado(empleadoSeleccionado);
          console.log('🔍 DEBUG: selectedEmpleado establecido:', empleadoSeleccionado);
        }
      }
      
      if (initialData.clasificacionId && clasificaciones.some(c => c.id === initialData.clasificacionId)) {
        setValue('clasificacionId', initialData.clasificacionId);
      }
      
      // Establecer estado y condición
      if (initialData.estado) {
        setValue('estado', initialData.estado);
        console.log('🔍 DEBUG: Valor estado establecido:', initialData.estado);
      }
      
      if (initialData.condicion) {
        setValue('condicion', initialData.condicion);
        console.log('🔍 DEBUG: Valor condicion establecido:', initialData.condicion);
      }
      
      if (initialData.ubicacionEquipo) {
        setValue('ubicacionEquipo', initialData.ubicacionEquipo);
        console.log('🔍 DEBUG: Valor ubicacionEquipo establecido:', initialData.ubicacionEquipo);
      }
      
      // Marcar que los valores iniciales ya se establecieron
      setInitialValuesSet(true);
    }
  }, [
    isEditing,
    initialData,
    articuloOptions,
    empleadoOptions,
    clasificaciones,
    setValue,
    initialValuesSet,
  ]);

  // Si el valor inicial no está en las opciones, lo agregamos temporalmente para que el select lo muestre
  const safeArticuloOptions = articuloOptions.slice();
  if (
    initialData?.articuloId &&
    !safeArticuloOptions.some(a => a.value === initialData.articuloId)
  ) {
    // Buscar el artículo en la lista completa de artículos para obtener más información
    const articuloCompleto = articulos.find(a => a.id === initialData.articuloId);
    let label = '';
    if (articuloCompleto) {
      const codigo = articuloCompleto.codigoEFC || 'Sin código';
      const marca = articuloCompleto.marca || 'N/A';
      const modelo = articuloCompleto.modelo || 'N/A';
      const serie = articuloCompleto.serie || 'N/A';
      const status = articuloCompleto.status || 'N/A';
      label = `${codigo} - ${marca} ${modelo} (Serie: ${serie}) [${status}] (artículo actual)`;
    } else {
      label = `Artículo ID ${initialData.articuloId} (no encontrado en la lista)`;
    }
    safeArticuloOptions.push({ value: initialData.articuloId, label });
    console.log('🔍 DEBUG: Artículo agregado a safeArticuloOptions:', { id: initialData.articuloId, label });
  }

  const safeEmpleadoOptions = empleadoOptions.slice();
  if (
    initialData?.empleadoId &&
    !safeEmpleadoOptions.some(e => e.value === initialData.empleadoId)
  ) {
    // Busca el nombre del colaborador en initialData (usando 'as any' para evitar error de TS)
    let label = '';
    const anyInitial = initialData as any;
    if (anyInitial.empleadoNombre) {
      label = anyInitial.empleadoNombre;
    } else if (anyInitial.empleado && anyInitial.empleado.nombre) {
      label = anyInitial.empleado.nombre;
    } else {
      label = `Colaborador ID ${initialData.empleadoId} (no encontrado)`;
    }
    safeEmpleadoOptions.push({ value: initialData.empleadoId, label });
  }

  const safeClasificaciones = clasificaciones.slice();
  if (
    initialData?.clasificacionId &&
    !safeClasificaciones.some(c => c.id === initialData.clasificacionId)
  ) {
    safeClasificaciones.push({ id: initialData.clasificacionId, familia: 'Clasificación desconocida', sub_familia: '', tipo_equipo: '', vida_util: '', valor_reposicion: null });
  }

  // DEBUG: Logs para depuración robusta
  console.log('InitialData:', initialData);
  console.log('safeArticuloOptions:', safeArticuloOptions);
  console.log('safeEmpleadoOptions:', safeEmpleadoOptions);
  console.log('safeClasificaciones:', safeClasificaciones);
  console.log('🔍 DEBUG: Valor actual del campo articuloId:', watch('articuloId'));
  console.log('🔍 DEBUG: Valores de campos en modo edición:', {
    ubicacionEquipo: watch('ubicacionEquipo'),
    estado: watch('estado'),
    condicion: watch('condicion'),
    initialData_ubicacionEquipo: initialData?.ubicacionEquipo,
    initialData_estado: initialData?.estado,
    initialData_condicion: initialData?.condicion
  });

  // DEBUG: Log del estado actual
  console.log('🔍 DEBUG: Estado actual del formulario:', {
    isEditing,
    totalArticulos: articulos.length,
    articulosLibres: articulos.filter(a => a.status === 'libre').length,
    articulosAsignados: articulos.filter(a => a.status === 'asignado').length,
    totalOpciones: articuloOptions.length,
    articuloIdEnEdicion: initialData?.articuloId,
    primerosArticulosLibres: articulos.filter(a => a.status === 'libre').slice(0, 3),
    URL_usada: `${API_ENDPOINTS.inventory} (con paginación)`
  });



  const handleArticuloChange = (option: any) => {
    setValue('articuloId', option ? option.value : 0);
    
    // Si se seleccionó un artículo, obtener sus datos para pre-rellenar campos
    if (option) {
      const articuloSeleccionado = articulos.find(a => a.id === option.value);
      if (articuloSeleccionado) {
        console.log('🔍 DEBUG: Artículo seleccionado:', articuloSeleccionado);
        // Pre-rellenar campos con datos del artículo seleccionado
        setValue('codigoEFC' as any, articuloSeleccionado.codigoEFC || '');
        setValue('marca' as any, articuloSeleccionado.marca || '');
        setValue('modelo' as any, articuloSeleccionado.modelo || '');
        setValue('serie' as any, articuloSeleccionado.serie || '');
        setValue('descripcion' as any, articuloSeleccionado.descripcion || '');
      }
    }
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

  // Normaliza el valor inicial de los selects a mayúsculas para que coincida con las opciones
  const normalizeSelectValue = (val: string | undefined) => (val ? val.toUpperCase() : '');

  // Función para encontrar la opción más parecida al valor actual (ignorando mayúsculas/minúsculas y espacios)
  const findMatchingOption = (options: string[], value: string | undefined) => {
    if (!value) return '';
    const normalizedValue = value.normalize('NFD').replace(/\s+/g, '').toLowerCase();
    const found = options.find(opt =>
      opt.normalize('NFD').replace(/\s+/g, '').toLowerCase() === normalizedValue
    );
    return found || '';
  };

  return (
    <form onSubmit={handleSubmit(data => {
      console.log('DATOS ENVIADOS AL BACKEND:', data);
      onSubmit({ ...data, id: (initialData as any)?.id });
    }, (errors) => {
      console.error('🔍 DEBUG: Errores de validación:', errors);
    })} className="space-y-6">
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
                  options={safeArticuloOptions}
                  isClearable
                  isSearchable
                  isLoading={isLoading}
                  placeholder={isEditing ? "Seleccionar artículo (incluye el actual)" : "Seleccionar artículo (solo artículos libres)"}
                  styles={customSelectStyles}
                  value={safeArticuloOptions.find(c => c.value === field.value)}
                  onMenuOpen={() => {
                    console.log('🔍 DEBUG: Menú de artículos abierto');
                    console.log('🔍 DEBUG: field.value:', field.value);
                    console.log('🔍 DEBUG: safeArticuloOptions:', safeArticuloOptions);
                    console.log('🔍 DEBUG: Opción encontrada:', safeArticuloOptions.find(c => c.value === field.value));
                  }}
                  onChange={handleArticuloChange}
                />
              )}
            />
            {errors.articuloId && <p className="text-red-500 text-xs mt-1">{errors.articuloId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Colaborador</label>
            
            <Select
              options={safeEmpleadoOptions}
              isClearable
              isSearchable
              isLoading={isLoading}
              placeholder="Seleccionar colaborador"
              styles={customSelectStyles}
              value={selectedEmpleado}
              onChange={(val) => {
                console.log('🔍 DEBUG: ===== CAMBIO DE COLABORADOR (ESTADO LOCAL) =====');
                console.log('🔍 DEBUG: Valor seleccionado:', val);
                console.log('🔍 DEBUG: Valor anterior selectedEmpleado:', selectedEmpleado);
                console.log('🔍 DEBUG: ¿Es null (X clickeada)?', val === null);
                console.log('🔍 DEBUG: ¿Es undefined?', val === undefined);
                
                // Actualizar estado local
                setSelectedEmpleado(val);
                
                // Actualizar formulario
                const newValue = val ? val.value : null;
                console.log('🔍 DEBUG: Nuevo valor empleadoId:', newValue);
                setValue('empleadoId', newValue);
                
                console.log('🔍 DEBUG: Valor después de setValue:', watch('empleadoId'));
                
                // Forzar re-render
                setForceUpdate(prev => prev + 1);
              }}
              onInputChange={(inputValue) => {
                console.log('🔍 DEBUG: Input change en colaborador:', inputValue);
              }}
              onMenuOpen={() => {
                console.log('🔍 DEBUG: Menú de colaboradores abierto');
                console.log('🔍 DEBUG: Valor actual selectedEmpleado:', selectedEmpleado);
                console.log('🔍 DEBUG: Opciones disponibles:', safeEmpleadoOptions.slice(0, 5));
              }}
              onMenuClose={() => {
                console.log('🔍 DEBUG: Menú de colaboradores cerrado');
              }}
              onFocus={() => {
                console.log('🔍 DEBUG: Select de colaborador enfocado');
              }}
              onBlur={() => {
                console.log('🔍 DEBUG: Select de colaborador perdió el foco');
              }}
            />
            {errors.empleadoId && <p className="text-red-500 text-xs mt-1">{errors.empleadoId.message}</p>}
          </div>

          {/* Solo mostrar Sede en modo creación, no en edición */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium mb-1">Sede *</label>
              <select {...register('sede')} className={inputClass} value={findMatchingOption(SEDE_OPTIONS, watch('sede') || initialData?.sede)}>
                <option value="">Seleccionar sede</option>
                {SEDE_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.sede && <p className="text-red-500 text-xs mt-1">{errors.sede.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Clasificación *</label>
            <Controller
              name="clasificacionId"
              control={control}
              render={({ field }) => (
                <Select
                  options={safeClasificaciones.map(c => ({
                    value: c.id,
                    label: `${c.tipo_equipo || ''}${c.tipo_equipo && c.sub_familia ? ' - ' : ''}${c.sub_familia || ''}`.trim()
                  }))}
                  isClearable
                  isSearchable
                  isLoading={isLoading}
                  placeholder="Seleccionar clasificación"
                  styles={customSelectStyles}
                  value={safeClasificaciones
                    .map(c => ({
                      value: c.id,
                      label: `${c.tipo_equipo || ''}${c.tipo_equipo && c.sub_familia ? ' - ' : ''}${c.sub_familia || ''}`.trim()
                    }))
                    .find(option => option.value === field.value) || null}
                  onChange={val => field.onChange(val ? val.value : null)}
                />
              )}
            />
            {errors.clasificacionId && <p className="text-red-500 text-xs mt-1">{errors.clasificacionId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ubicación del Equipo</label>
            <select {...register('ubicacionEquipo')} className={inputClass} value={watch('ubicacionEquipo') || ''}>
              <option value="">Seleccionar ubicación</option>
              {UBICACION_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.ubicacionEquipo && <p className="text-red-500 text-xs mt-1">{errors.ubicacionEquipo.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Estado *</label>
            <select {...register('estado')} className={inputClass} value={watch('estado') || ''}>
              <option value="">Seleccionar estado</option>
              {ESTADO_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condición</label>
            <select {...register('condicion')} className={inputClass} value={watch('condicion') || ''} disabled={estadoValue === 'BAJA' || estadoValue === 'DONACION'}>
              <option value="">
                {estadoValue === 'BAJA' ? 'No aplica (Estado: BAJA)' : 
                 estadoValue === 'DONACION' ? 'No aplica (Estado: DONACION)' : 
                 'Seleccionar condición'}
              </option>
              {CONDICION_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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

          {/* Campos que aparecen cuando el estado es DONACION - Opcionales si ya hay info de baja */}
          {estadoValue === 'DONACION' && (
            <>
              {/* Mostrar info de baja si existe (como historial) */}
              {(watch('fechaBaja') || initialData?.fechaBaja) && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Información de Baja (Historial):</p>
                    <p className="text-xs text-gray-600">Fecha: {watch('fechaBaja') || initialData?.fechaBaja || '-'}</p>
                    <p className="text-xs text-gray-600">Motivo: {watch('motivoBaja') || initialData?.motivoBaja || '-'}</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Donación <span className="text-gray-500 text-xs">(opcional)</span></label>
                <input 
                  {...register('fechaDonacion')} 
                  type="date"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">Si no se especifica, se usará la fecha de baja como referencia</p>
                {errors.fechaDonacion && <p className="text-red-500 text-xs mt-1">{errors.fechaDonacion.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo de Donación <span className="text-gray-500 text-xs">(opcional)</span></label>
                <textarea 
                  {...register('motivoDonacion')} 
                  rows={3}
                  className={inputClass}
                  placeholder="Especificar el motivo de la donación del equipo (opcional)"
                />
                <p className="text-xs text-gray-500 mt-1">Si no se especifica, se conservará la información de la baja</p>
                {errors.motivoDonacion && <p className="text-red-500 text-xs mt-1">{errors.motivoDonacion.message}</p>}
              </div>
            </>
          )}
        </div>

        {/* Columna 2: Detalles Adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Detalles Adicionales</h3>
          <div className="flex items-center gap-2 pt-2">
            <input {...register('cumpleStandard')} type="checkbox" id="cumpleStandard" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={!!watch('cumpleStandard')} />
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