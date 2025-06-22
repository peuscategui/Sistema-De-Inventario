import Image from "next/image";

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border-t-4 border-accent-green">
        <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Actividad de Ventas</h3>
        <p className="text-3xl font-bold">54</p>
        <p className="text-muted-foreground">Pedidos para empaquetar</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border-t-4 border-accent-green">
        <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Resumen de Inventario</h3>
        <p className="text-3xl font-bold">12,345</p>
        <p className="text-muted-foreground">Cantidad en mano</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border-t-4 border-accent-green">
        <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Detalles del Producto</h3>
        <p className="text-3xl font-bold">8</p>
        <p className="text-muted-foreground">Items con bajo stock</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border-t-4 border-accent-green">
        <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Items más vendidos</h3>
        <p className="text-xl font-semibold">Laptop HP EliteBook</p>
        <p className="text-muted-foreground">250 unidades</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Resumen de Órdenes de Venta</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-md">
            <p className="text-gray-400">Gráfico de Ventas</p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Resumen de Órdenes de Compra</h3>
           <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-md">
            <p className="text-gray-400">Gráfico de Compras</p>
          </div>
        </div>
      </div>
    </div>
  );
}
