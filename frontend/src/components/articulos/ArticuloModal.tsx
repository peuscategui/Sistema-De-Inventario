import ArticuloForm from './ArticuloForm';

interface Articulo {
  id: number;
  codigoEFC: string | null;
  marca: string | null;
  modelo: string | null;
  descripcion: string | null;
  serie: string | null;
  procesador: string | null;
  anio: number | null;
  ram: string | null;
  discoDuro: string | null;
  sistemaOperativo: string | null;
  condicion: string | null;
  motivoCompra: string | null;
  vidaUtil: string | null;
  fecha_compra: string | null;
  proveedor: string | null;
  factura: string | null;
  precioUnitarioSinIgv: string | null;
  anioCompra: number | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  articulo?: Articulo | null;
  isSubmitting: boolean;
}

const ArticuloModal = ({ isOpen, onClose, onSubmit, articulo, isSubmitting }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{articulo ? 'Editar Artículo' : 'Crear Nuevo Artículo'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="bg-white p-4 rounded-b-lg">
          <ArticuloForm
            onSubmit={onSubmit}
            onCancel={onClose}
            defaultValues={articulo || {}}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticuloModal; 