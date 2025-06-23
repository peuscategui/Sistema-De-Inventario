import { PrismaClient } from '../../generated/prisma';

const clasificaciones = [
  // Equipos de Colaboración
  {
    familia: 'Colaboración',
    sub_familia: 'Altavoz',
    tipo_equipo: 'VIDEO CONFERENCIA',
    vida_util: '4 años',
    valor_reposicion: 200.00
  },
  {
    familia: 'Colaboración',
    sub_familia: 'Cámara de videoconferencia',
    tipo_equipo: 'CAMARA',
    vida_util: '4 años',
    valor_reposicion: 300.00
  },
  // Videovigilancia
  {
    familia: 'Videovigilancia',
    sub_familia: 'Cámara hogar fija',
    tipo_equipo: 'CAMARA',
    vida_util: '4 años',
    valor_reposicion: 150.00
  },
  {
    familia: 'Videovigilancia',
    sub_familia: 'Cámara hogar ptz',
    tipo_equipo: 'CAMARA',
    vida_util: '4 años',
    valor_reposicion: 200.00
  },
  {
    familia: 'Videovigilancia',
    sub_familia: 'Cámara profesional ptz',
    tipo_equipo: 'CAMARA',
    vida_util: '4 años',
    valor_reposicion: 500.00
  },
  // Computadoras
  {
    familia: 'Computadora',
    sub_familia: 'Desktop',
    tipo_equipo: 'DESKTOP',
    vida_util: '4 años',
    valor_reposicion: 800.00
  },
  {
    familia: 'Computadora',
    sub_familia: 'Desktop Mini',
    tipo_equipo: 'DESKTOP',
    vida_util: '4 años',
    valor_reposicion: 600.00
  },
  // Impresoras
  {
    familia: 'Impresora',
    sub_familia: 'Inyección',
    tipo_equipo: 'IMPRESORA',
    vida_util: '4 años',
    valor_reposicion: 300.00
  },
  {
    familia: 'Impresora',
    sub_familia: 'Laser',
    tipo_equipo: 'IMPRESORA',
    vida_util: '4 años',
    valor_reposicion: 500.00
  },
  {
    familia: 'Impresora',
    sub_familia: 'Matricial',
    tipo_equipo: 'IMPRESORA',
    vida_util: '4 años',
    valor_reposicion: 400.00
  },
  {
    familia: 'Impresora',
    sub_familia: 'Portátil',
    tipo_equipo: 'IMPRESORA',
    vida_util: '4 años',
    valor_reposicion: 250.00
  },
  {
    familia: 'Impresora',
    sub_familia: 'Ticketera',
    tipo_equipo: 'IMPRESORA',
    vida_util: '4 años',
    valor_reposicion: 200.00
  },
  // Monitores
  {
    familia: 'Monitor',
    sub_familia: 'Monitor',
    tipo_equipo: 'MONITOR',
    vida_util: '4 años',
    valor_reposicion: 200.00
  },
  // Servidores
  {
    familia: 'Servidor',
    sub_familia: 'Servidor ensamblado ( Gamer)',
    tipo_equipo: 'SERVIDOR',
    vida_util: '5 años',
    valor_reposicion: 2000.00
  },
  {
    familia: 'Servidor',
    sub_familia: 'Servidor torre',
    tipo_equipo: 'SERVIDOR',
    vida_util: '5 años',
    valor_reposicion: 3000.00
  },
  // Redes
  {
    familia: 'Redes',
    sub_familia: 'Hub',
    tipo_equipo: 'SWITCH',
    vida_util: '4 años',
    valor_reposicion: 150.00
  },
  // Control Biométrico
  {
    familia: 'Control Biométrico',
    sub_familia: 'Control de Asistencia',
    tipo_equipo: 'MARCADORES',
    vida_util: '4 años',
    valor_reposicion: 300.00
  },
  // Telefonía
  {
    familia: 'TELEFONIA',
    sub_familia: 'Sistema IP PBX Appliance',
    tipo_equipo: 'SERVIDOR',
    vida_util: '5 años',
    valor_reposicion: 1500.00
  }
];

async function crearClasificaciones() {
  const prisma = new PrismaClient();
  
  try {
    for (const clasificacion of clasificaciones) {
      // Verificar si la clasificación ya existe
      const existente = await prisma.clasificacion.findFirst({
        where: {
          familia: clasificacion.familia,
          sub_familia: clasificacion.sub_familia,
          tipo_equipo: clasificacion.tipo_equipo
        }
      });

      if (!existente) {
        const nueva = await prisma.clasificacion.create({
          data: clasificacion
        });
        console.log('Clasificación creada:', nueva);
      } else {
        console.log('Clasificación ya existe:', existente);
      }
    }

    console.log('Proceso completado');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearClasificaciones(); 