'use client';

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Users,
  Box,
  Shapes,
  Package,
  Settings,
  LogOut,
  Heart,
  X,
  Shield,
  KeySquare,
  DollarSign,
} from 'lucide-react'
import Image from 'next/image'
import { 
  DashboardGuard, 
  InventarioGuard, 
  BajasGuard, 
  ClasificacionGuard, 
  ColaboradoresGuard, 
  ArticulosGuard, 
  LicenciasGuard, 
  AdminGuard 
} from '@/components/auth/SectionGuard'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventario', label: 'Inventario', icon: Box },
  { href: '/analisis-financiero', label: 'Análisis Financiero', icon: DollarSign },
  { href: '/donaciones', label: 'Donaciones', icon: Heart },
  { href: '/bajas', label: 'Bajas', icon: X },
  { href: '/clasificacion', label: 'Clasificación', icon: Shapes },
  { href: '/colaboradores', label: 'Colaboradores', icon: Users },
  { href: '/articulos', label: 'Artículos', icon: Package },
  { href: '/licencias', label: 'Licencias', icon: KeySquare },
  { href: '/admin', label: 'Administrador', icon: Shield },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { canViewSection } = useAuth()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <aside
      className={`relative flex flex-col bg-secondary transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-center h-24 border-b border-border px-4">
        <div className="text-center">
          <h1 className="text-white font-bold text-lg">EFC</h1>
          {!isCollapsed && (
            <p className="text-white text-xs font-medium">INVENTARIO</p>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          const section = href.replace('/', '') || 'dashboard'
          
          // Determinar qué guard usar según la sección
          let GuardComponent = null
          switch (section) {
            case 'dashboard':
              GuardComponent = DashboardGuard
              break
            case 'inventario':
              GuardComponent = InventarioGuard
              break
            case 'bajas':
              GuardComponent = BajasGuard
              break
            case 'clasificacion':
              GuardComponent = ClasificacionGuard
              break
            case 'colaboradores':
              GuardComponent = ColaboradoresGuard
              break
            case 'articulos':
              GuardComponent = ArticulosGuard
              break
            case 'licencias':
              GuardComponent = LicenciasGuard
              break
            case 'admin':
              GuardComponent = AdminGuard
              break
            case 'analisis-financiero':
            case 'donaciones':
              // Estas secciones no deben ser visibles para VIEWER
              if (!canViewSection(section)) {
                return null;
              }
              // Si puede ver la sección, mostrar el enlace
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center p-2 rounded-lg ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
                </Link>
              )
            default:
              // Para secciones sin guard específico, mostrar siempre
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center p-2 rounded-lg ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
                </Link>
              )
          }
          
          if (GuardComponent) {
            return (
              <GuardComponent key={href}>
                <Link
                  href={href}
                  className={`flex items-center p-2 rounded-lg ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
                </Link>
              </GuardComponent>
            )
          }
          
          return null
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
    </aside>
  )
} 