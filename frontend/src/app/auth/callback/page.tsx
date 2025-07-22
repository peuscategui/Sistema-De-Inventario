'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
    const token = searchParams?.get('token');
    const userParam = searchParams?.get('user');
    const error = searchParams?.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Error en la autenticación: ${error}`);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    if (token && userParam) {
      try {
        // Decodificar información del usuario
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setStatus('success');
        setMessage(`¡Bienvenido, ${user.fullName || user.username}!`);
        
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (error) {
        console.error('Error procesando callback:', error);
        setStatus('error');
        setMessage('Error al procesar la información de autenticación');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } else {
      setStatus('error');
      setMessage('Información de autenticación incompleta');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Autenticación Microsoft 365
          </h2>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">{message}</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-gray-500 text-sm">Redirigiendo al sistema...</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-red-100 p-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{message}</p>
                <p className="text-gray-500 text-sm">Redirigiendo al login...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 