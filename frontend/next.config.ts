import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Docker y EasyPanel
  output: 'standalone',
  
  // Configuración de imágenes para Docker
  images: {
    unoptimized: true,
  },
  
  // Configuración de trailing slash
  trailingSlash: false,
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://tiinventory.efc.com.pe',
  },
  
  // Configuración de experimental features
  experimental: {
    // Optimizaciones para Docker
  },
  
  // Deshabilitar ESLint en el build para desarrollo
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración de headers para CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
