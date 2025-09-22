'use client';

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SectionGuard } from '@/components/auth/PermissionGuard'
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

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { href: '/inventario', label: 'Inventario', icon: Box, section: 'inventario' },
  { href: '/analisis-financiero', label: 'Análisis Financiero', icon: DollarSign, section: 'analisis-financiero' },
  { href: '/donaciones', label: 'Donaciones', icon: Heart, section: 'donaciones' },
  { href: '/bajas', label: 'Bajas', icon: X, section: 'bajas' },
  { href: '/clasificacion', label: 'Clasificación', icon: Shapes, section: 'clasificacion' },
  { href: '/colaboradores', label: 'Colaboradores', icon: Users, section: 'colaboradores' },
  { href: '/articulos', label: 'Artículos', icon: Package, section: 'articulos' },
  { href: '/licencias', label: 'Licencias', icon: KeySquare, section: 'licencias' },
  { href: '/admin', label: 'Administrador', icon: Shield, section: 'admin' },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

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
        {navItems.map(({ href, label, icon: Icon, section }) => {
          const isActive = pathname === href
          return (
            <SectionGuard key={href} section={section}>
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
            </SectionGuard>
          )
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