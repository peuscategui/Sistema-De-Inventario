import { PlusCircle } from 'lucide-react';

const ArticulosPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Artículos</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <PlusCircle size={20} />
          <span>Crear Artículo</span>
        </button>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <p className="text-muted-foreground">Aquí se mostrará la gestión de artículos.</p>
      </div>
    </div>
  );
};

export default ArticulosPage; 