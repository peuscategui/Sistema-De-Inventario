import InventarioForm from './InventarioForm';

interface Inventario {
  id?: number;
  // ...otros campos relevantes si se usan para edición
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
          initialData={inventario || {}}
          isEditing={!!inventario}
        />
      </div>
    </div>
  );
};

export default InventarioModal; 