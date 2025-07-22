import InventarioForm from './InventarioForm';

interface Inventario {
  id?: number;
  articuloId?: number;
  articulo?: { id: number };
  sede?: string | null;
  estado?: string | null;
  ubicacionEquipo?: string | null;
  condicion?: string | null;
  cumpleStandard?: boolean;
  observaciones?: string | null;
  clasificacionId?: number;
  clasificacion?: { id: number };
  empleadoId?: number | null;
  empleado?: { id: number; sede?: string | null };
  fechaBaja?: string | null;
  motivoBaja?: string | null;
  fechaDonacion?: string | null;
  motivoDonacion?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  inventario?: Inventario | null;
  isSubmitting: boolean;
}

const InventarioModal = ({ isOpen, onClose, onSubmit, inventario, isSubmitting }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{inventario ? 'Editar Inventario' : 'Crear Nuevo Inventario'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <InventarioForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={inventario ? {
            ...inventario,
            articuloId: typeof inventario.articuloId === 'number' ? inventario.articuloId : (inventario.articulo?.id ?? undefined),
            clasificacionId: typeof inventario.clasificacionId === 'number' ? inventario.clasificacionId : (inventario.clasificacion?.id ?? undefined),
            empleadoId: typeof inventario.empleadoId === 'number' ? inventario.empleadoId : (inventario.empleado?.id ?? undefined),
            sede: inventario.sede ?? inventario.empleado?.sede ?? '',
            estado: inventario.estado ?? '',
            ubicacionEquipo: inventario.ubicacionEquipo ?? '',
            condicion: inventario.condicion ?? '',
            cumpleStandard: inventario.cumpleStandard ?? false,
            observaciones: inventario.observaciones ?? '',
            fechaBaja: inventario.fechaBaja ?? '',
            motivoBaja: inventario.motivoBaja ?? '',
            fechaDonacion: inventario.fechaDonacion ?? '',
            motivoDonacion: inventario.motivoDonacion ?? '',
          } : {}}
          isEditing={!!inventario}
        />
      </div>
    </div>
  );
};

export default InventarioModal; 