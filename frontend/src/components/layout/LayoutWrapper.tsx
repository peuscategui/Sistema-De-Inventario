'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const publicRoutes = ['/login', '/auth/callback'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  const isPublicRoute = publicRoutes.includes(pathname);

  // Para rutas públicas, mostrar solo el contenido
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // TEMPORALMENTE: Siempre mostrar el layout (sin autenticación)
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );

  // CÓDIGO ORIGINAL COMENTADO:
  // // Para rutas privadas, mostrar layout completo si está autenticado
  // if (isAuthenticated) {
  //   return (
  //     <div className="flex h-screen bg-background">
  //       <Sidebar />
  //       <div className="flex-1 flex flex-col overflow-hidden">
  //         <Header />
  //         <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
  //           {children}
  //         </main>
  //       </div>
  //     </div>
  //   );
  // }

  // // Si no está autenticado y no es ruta pública, el AuthProvider se encargará de redirigir
  // return null;
} 