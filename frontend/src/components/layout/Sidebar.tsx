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
} from 'lucide-react'
import Image from 'next/image'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventario', label: 'Inventario', icon: Box },
  { href: '/donaciones', label: 'Donaciones', icon: Heart },
  { href: '/clasificacion', label: 'Clasificación', icon: Shapes },
  { href: '/colaboradores', label: 'Colaboradores', icon: Users },
  { href: '/articulos', label: 'Artículos', icon: Package },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <aside
      className={`relative flex flex-col bg-secondary transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-center h-24 border-b border-border">
        <Image
          src="/efc-logo.png"
          alt="Logo"
          width={isCollapsed ? 40 : 56}
          height={isCollapsed ? 40 : 56}
          className="transition-all duration-300"
        />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
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