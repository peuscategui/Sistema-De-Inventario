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
  
  // Configuración de experimental features
  experimental: {
    // Optimizaciones para Docker
  },
};

export default nextConfig;
