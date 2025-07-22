import { X } from 'lucide-react';

interface Clasificacion {
  id: number;
  familia: string | null;
  sub_familia: string | null;
  tipo_equipo: string | null;
  vida_util: string | null;
  valor_reposicion: number | null;
}

interface Empleado {
  id: number;
  nombre: string | null;
  cargo: string | null;
  gerencia: string | null;
  sede: string | null;
}

interface InventoryItem {
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
  estado: string | null;
  ubicacionEquipo: string | null;
  qUsuarios: number | null;
  condicion: string | null;
  repotenciadas: boolean | null;
  clasificacionObsolescencia: string | null;
  clasificacionRepotenciadas: string | null;
  motivoCompra: string | null;
  precioReposicion: number | null;
  proveedor: string | null;
  factura: string | null;
  anioCompra: number | null;
  precioReposicion2024: number | null;
  observaciones: string | null;
  fecha_compra: string | null;
  precioUnitarioSinIgv: number | null;
  // Relaciones - campos únicos del inventario
  clasificacionId: number;
  empleadoId: number;
  clasificacion: Clasificacion;
  empleado: Empleado;
  // Campos específicos para donaciones y bajas
  fechaBaja?: string | null;
  motivoBaja?: string | null;
  fechaDonacion?: string | null;
  motivoDonacion?: string | null;
}

interface InventarioDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

const InventarioDetalleModal = ({ isOpen, onClose, item }: InventarioDetalleModalProps) => {
  if (!isOpen || !item) return null;

  const formatDate = (dateStr: string | null) => {
    return dateStr || '';
  };

  const detalles = [
    { label: 'Código EFC', value: item.codigoEFC },
    { label: 'Tipo de Equipo', value: item.clasificacion?.tipo_equipo },
    { label: 'Familia', value: item.clasificacion?.familia },
    { label: 'Sub Familia', value: item.clasificacion?.sub_familia },
    { label: 'Marca', value: item.marca },
    { label: 'Modelo', value: item.modelo },
    { label: 'Descripción', value: item.descripcion },
    { label: 'Serie', value: item.serie },
    { label: 'Procesador', value: item.procesador },
    { label: 'Año', value: item.anio },
    { label: 'RAM', value: item.ram },
    { label: 'Disco Duro', value: item.discoDuro },
    { label: 'Sistema Operativo', value: item.sistemaOperativo },
    { label: 'Sede', value: item.empleado?.sede },
    { label: 'Estado', value: item.estado },
    { label: 'Usuario', value: item.empleado?.nombre },
    { label: 'Cargo', value: item.empleado?.cargo },
    { label: 'Gerencia', value: item.empleado?.gerencia },
    { label: 'Ubicación', value: item.ubicacionEquipo },
    { label: 'Cantidad de Usuarios', value: item.qUsuarios },
    { label: 'Condición', value: item.condicion },
    { label: 'Repotenciado', value: item.repotenciadas ? 'Sí' : 'No' },
    { label: 'Clasificación Obsolescencia', value: item.clasificacionObsolescencia },
    { label: 'Clasificación Repotenciadas', value: item.clasificacionRepotenciadas },
    { label: 'Motivo de Compra', value: item.motivoCompra },
    { label: 'Precio Reposición', value: item.precioReposicion ? item.precioReposicion.toLocaleString('es-PE') : null },
    { label: 'Proveedor', value: item.proveedor },
    { label: 'Factura', value: item.factura },
    { label: 'Año de Compra', value: item.anioCompra },
    { label: 'Precio Reposición 2024', value: item.precioReposicion2024 ? item.precioReposicion2024.toLocaleString('es-PE') : null },
    { label: 'Observaciones', value: item.observaciones },
    { label: 'Vida Útil', value: item.clasificacion?.vida_util },
    { label: 'Fecha de Compra', value: formatDate(item.fecha_compra) },
    { label: 'Precio Unitario sin IGV', value: item.precioUnitarioSinIgv },
    // Campos específicos según el estado
    ...(item.estado === 'BAJA' ? [
      { label: 'Fecha de Baja', value: formatDate(item.fechaBaja || null) },
      { label: 'Motivo de Baja', value: item.motivoBaja || null },
    ] : []),
    ...(item.estado === 'DONACION' ? [
      { label: 'Fecha de Donación', value: formatDate(item.fechaDonacion || null) },
      { label: 'Motivo de Donación', value: item.motivoDonacion || null },
    ] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-primary/10">
          <h2 className="text-xl font-semibold uppercase">Detalles del Equipo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detalles.map(({ label, value }) => (
              value !== null && (
                <div key={label} className="border-b pb-2">
                  <div className="text-sm text-gray-500 uppercase">{label}</div>
                  <div className="text-base uppercase">{value}</div>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventarioDetalleModal; 