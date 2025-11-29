import EditDonacionForm from './EditDonacionForm';

interface EditDonacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  donacion?: {
    id: number;
    codigoEFC: string;
    fechaDonacion?: string;
    motivoDonacion?: string;
    fechaBaja?: string;
    motivoBaja?: string;
  };
  isSubmitting?: boolean;
}

const EditDonacionModal = ({ isOpen, onClose, onSubmit, donacion, isSubmitting }: EditDonacionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Donación</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Editando: <span className="font-semibold">{donacion?.codigoEFC}</span>
          </p>
        </div>

        <EditDonacionForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={{
            fechaDonacion: donacion?.fechaDonacion || '',
            motivoDonacion: donacion?.motivoDonacion || '',
            fechaBaja: donacion?.fechaBaja || '',
            motivoBaja: donacion?.motivoBaja || '',
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditDonacionModal;

