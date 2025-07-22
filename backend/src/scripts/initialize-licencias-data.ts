import { PrismaService } from '../prisma.service';

async function initializeLicenciasData() {
  const prisma = new PrismaService();
  
  try {
    console.log('🚀 Inicializando datos para el sistema de licencias...');

    // Crear gerencias
    const gerencias = [
      { nombre: 'Tecnología', codigo: 'TEC', descripcion: 'Gerencia de Tecnología de la Información' },
      { nombre: 'Administración', codigo: 'ADM', descripcion: 'Gerencia de Administración y Finanzas' },
      { nombre: 'Recursos Humanos', codigo: 'RRHH', descripcion: 'Gerencia de Recursos Humanos' },
      { nombre: 'Operaciones', codigo: 'OPE', descripcion: 'Gerencia de Operaciones' },
      { nombre: 'Comercial', codigo: 'COM', descripcion: 'Gerencia Comercial y Ventas' },
      { nombre: 'Legal', codigo: 'LEG', descripcion: 'Gerencia Legal y Cumplimiento' },
    ];

    const gerenciasCreadas = [];
    for (const gerencia of gerencias) {
      try {
        const nuevaGerencia = await prisma.gerencia.create({ data: gerencia });
        gerenciasCreadas.push(nuevaGerencia);
        console.log(`✅ Gerencia creada: ${gerencia.nombre}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Gerencia ya existe: ${gerencia.nombre}`);
          const existente = await prisma.gerencia.findFirst({
            where: { nombre: gerencia.nombre }
          });
          if (existente) gerenciasCreadas.push(existente);
        }
      }
    }

    // Crear áreas por gerencia
    const areas = [
      // Tecnología
      { nombre: 'Desarrollo de Software', codigo: 'DEV', gerenciaId: gerenciasCreadas[0].id },
      { nombre: 'Infraestructura', codigo: 'INF', gerenciaId: gerenciasCreadas[0].id },
      { nombre: 'Seguridad Informática', codigo: 'SEC', gerenciaId: gerenciasCreadas[0].id },
      { nombre: 'Soporte Técnico', codigo: 'SUP', gerenciaId: gerenciasCreadas[0].id },
      
      // Administración
      { nombre: 'Contabilidad', codigo: 'CON', gerenciaId: gerenciasCreadas[1].id },
      { nombre: 'Tesorería', codigo: 'TES', gerenciaId: gerenciasCreadas[1].id },
      { nombre: 'Compras', codigo: 'COM', gerenciaId: gerenciasCreadas[1].id },
      
      // Recursos Humanos
      { nombre: 'Selección de Personal', codigo: 'SEL', gerenciaId: gerenciasCreadas[2].id },
      { nombre: 'Capacitación', codigo: 'CAP', gerenciaId: gerenciasCreadas[2].id },
      { nombre: 'Nómina', codigo: 'NOM', gerenciaId: gerenciasCreadas[2].id },
      
      // Operaciones
      { nombre: 'Logística', codigo: 'LOG', gerenciaId: gerenciasCreadas[3].id },
      { nombre: 'Calidad', codigo: 'CAL', gerenciaId: gerenciasCreadas[3].id },
      { nombre: 'Producción', codigo: 'PRO', gerenciaId: gerenciasCreadas[3].id },
      
      // Comercial
      { nombre: 'Ventas', codigo: 'VEN', gerenciaId: gerenciasCreadas[4].id },
      { nombre: 'Marketing', codigo: 'MKT', gerenciaId: gerenciasCreadas[4].id },
      { nombre: 'Atención al Cliente', codigo: 'ATC', gerenciaId: gerenciasCreadas[4].id },
      
      // Legal
      { nombre: 'Asesoría Legal', codigo: 'ASE', gerenciaId: gerenciasCreadas[5].id },
      { nombre: 'Cumplimiento', codigo: 'CUM', gerenciaId: gerenciasCreadas[5].id },
    ];

    let areasCreadas = 0;
    for (const area of areas) {
      try {
        await prisma.area.create({ data: area });
        console.log(`✅ Área creada: ${area.nombre}`);
        areasCreadas++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Área ya existe: ${area.nombre}`);
        }
      }
    }

    // Agregar recursos y permisos para licencias
    const recursos = [
      {
        name: 'licencias',
        displayName: 'Licencias',
        description: 'Gestión de licencias de software y servicios',
      },
      {
        name: 'areas',
        displayName: 'Áreas',
        description: 'Gestión de áreas organizacionales',
      },
      {
        name: 'gerencias',
        displayName: 'Gerencias',
        description: 'Gestión de gerencias organizacionales',
      },
    ];

    for (const recurso of recursos) {
      try {
        const nuevoRecurso = await prisma.resource.create({ data: recurso });
        console.log(`✅ Recurso creado: ${recurso.displayName}`);

        // Crear permisos para cada recurso
        const permisos = ['read', 'create', 'update', 'delete'];
        for (const permiso of permisos) {
          try {
            await prisma.permission.create({
              data: {
                action: permiso,
                resourceId: nuevoRecurso.id,
              },
            });
            console.log(`✅ Permiso creado: ${permiso} para ${recurso.displayName}`);
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`⚠️  Permiso ya existe: ${permiso} para ${recurso.displayName}`);
            }
          }
        }
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Recurso ya existe: ${recurso.displayName}`);
        }
      }
    }

    console.log('\n📊 Resumen de inicialización:');
    console.log(`- Gerencias: ${gerenciasCreadas.length} procesadas`);
    console.log(`- Áreas: ${areasCreadas} creadas`);
    console.log(`- Recursos: ${recursos.length} procesados`);
    console.log('\n✅ Inicialización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeLicenciasData(); 