import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get()
  getDashboard() {
    return {
      totalEquipos: 100,
      porcentajeBuenEstado: 85,
      equiposObsoletos: 15,
      familiaMasComun: {
        familia: 'COMPUTADORA',
        _count: { id: 40 }
      }
    };
  }

  @Get('distribucion-familia')
  getDistribucionFamilia() {
    return [
      { familia: 'COMPUTADORA', _count: { id: 40 } },
      { familia: 'SERVIDOR', _count: { id: 20 } },
      { familia: 'SWITCH', _count: { id: 15 } },
      { familia: 'MONITOR', _count: { id: 10 } },
      { familia: 'IMPRESORA', _count: { id: 5 } }
    ];
  }
} 