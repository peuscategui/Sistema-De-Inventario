'use client';

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
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
  const { user, hasRole } = useAuth()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  // Filtrar elementos de navegación según el rol
  const filteredNavItems = navItems.filter(item => {
    if (item.href === '/admin') {
      return hasRole('ADMIN')
    }
    return true
  })

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
        {filteredNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
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
        })}
      </nav>

      {/* Información del usuario */}
      {user && !isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
    </aside>
  )} 

  )
} 