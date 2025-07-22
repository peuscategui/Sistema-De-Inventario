import EditBajaForm from './EditBajaForm';

interface EditBajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  baja?: {
    id: number;
    codigoEFC: string;
    fechaBaja?: string;
    motivoBaja?: string;
  };
  isSubmitting?: boolean;
}

const EditBajaModal = ({ isOpen, onClose, onSubmit, baja, isSubmitting }: EditBajaModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Baja</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Editando: <span className="font-semibold">{baja?.codigoEFC}</span>
          </p>
        </div>

        <EditBajaForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={{
            fechaBaja: baja?.fechaBaja || '',
            motivoBaja: baja?.motivoBaja || '',
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditBajaModal; 
 