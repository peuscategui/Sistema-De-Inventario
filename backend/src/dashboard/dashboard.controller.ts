import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('distribucion-familia')
  async getDistribucionPorFamilia() {
    return this.dashboardService.getDistribucionPorFamilia();
  }

  @Get('estado-gerencia')
  async getEstadoPorGerencia() {
    return this.dashboardService.getEstadoPorGerencia();
  }
} 