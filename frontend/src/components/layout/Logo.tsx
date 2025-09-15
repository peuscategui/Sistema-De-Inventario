'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className,
  variant = 'default'
}: LogoProps) {
  const logoSize = size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80;
  
  const textColorClass = variant === 'white' 
    ? 'text-white' 
    : variant === 'dark' 
    ? 'text-gray-900' 
    : 'text-gray-800';

  // Determinar la ruta del logo según el entorno
  const logoSrc = process.env.NODE_ENV === 'production' 
    ? '/efc-logo.png' // Next.js rewrite manejará la redirección
    : '/efc-logo.png';

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="relative">
        <Image
          src={logoSrc}
          alt="EFC Logo"
          width={logoSize}
          height={logoSize}
          className="object-contain transition-all duration-300 hover:scale-105"
          priority
          onError={(e) => {
            console.warn('Error loading logo, falling back to default');
            // Fallback a una imagen por defecto si falla
            e.currentTarget.src = '/efc-logo.png';
          }}
        />
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold tracking-wide',
            textSizeClasses[size],
            textColorClass
          )}>
            EFC
          </span>
          <span className={cn(
            'text-xs font-medium tracking-wider opacity-80',
            textColorClass
          )}>
            INVENTARIO
          </span>
        </div>
      )}
    </div>
  );
}
