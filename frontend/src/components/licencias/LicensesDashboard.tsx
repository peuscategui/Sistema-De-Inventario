'use client';

import { useState, useEffect } from 'react';
import { KeySquare, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface DashboardStats {
  total: number;
  activas: number;
  vencidas: number;
  costoTotal: number;
}

export default function LicensesDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    activas: 0,
    vencidas: 0,
    costoTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.licenciasDashboard);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <KeySquare className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">Dashboard de Licencias</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Licencias */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Licencias</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <KeySquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Licencias Activas */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Licencias Activas</p>
              <p className="text-2xl font-bold text-green-600">{stats.activas}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.activas / stats.total) * 100)}%` : '0%'} del total
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Licencias Vencidas */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Licencias Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{stats.vencidas}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.vencidas / stats.total) * 100)}%` : '0%'} del total
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Costo Total */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.costoTotal)}</p>
              <p className="text-xs text-muted-foreground">
                Inversión total en licencias
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {stats.vencidas > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Atención: Licencias Vencidas
              </h4>
              <p className="text-sm text-yellow-700">
                Tienes {stats.vencidas} licencia{stats.vencidas !== 1 ? 's' : ''} vencida{stats.vencidas !== 1 ? 's' : ''}. 
                Revisa y renueva las licencias necesarias.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 