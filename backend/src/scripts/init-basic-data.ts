import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initBasicData() {
  try {
    console.log('🚀 Inicializando datos básicos...');
    
    // 1. Crear clasificaciones básicas
    console.log('📋 Creando clasificaciones...');
    
    const clasificaciones = [
      {
        familia: 'Tecnología',
        sub_familia: 'Computadoras',
        tipo_equipo: 'Laptop',
        vida_util: '4',
        valor_reposicion: 1500.00
      },
      {
        familia: 'Tecnología', 
        sub_familia: 'Computadoras',
        tipo_equipo: 'Desktop',
        vida_util: '5',
        valor_reposicion: 1200.00
      },
      {
        familia: 'Tecnología',
        sub_familia: 'Impresoras',
        tipo_equipo: 'Impresora',
        vida_util: '3',
        valor_reposicion: 800.00
      }
    ];
    
    for (const clasificacion of clasificaciones) {
      await prisma.clasificacion.upsert({
        where: {
          familia_sub_familia_tipo_equipo: {
            familia: clasificacion.familia,
            sub_familia: clasificacion.sub_familia,
            tipo_equipo: clasificacion.tipo_equipo
          }
        },
        update: {},
        create: clasificacion
      });
    }
    
    console.log(`✅ ${clasificaciones.length} clasificaciones creadas`);
    
    // 2. Crear empleados básicos
    console.log('👥 Creando empleados...');
    
    const empleados = [
      {
        nombre: 'Juan Pérez',
        cargo: 'Analista',
        gerencia: 'Tecnología',
        sede: 'Surquillo'
      },
      {
        nombre: 'María García',
        cargo: 'Supervisor',
        gerencia: 'Administración',
        sede: 'Chorrillos'
      },
      {
        nombre: 'Carlos López',
        cargo: 'Técnico',
        gerencia: 'Operaciones',
        sede: 'Surquillo'
      }
    ];
    
    for (const empleado of empleados) {
      await prisma.empleado.upsert({
        where: { nombre: empleado.nombre },
        update: {},
        create: empleado
      });
    }
    
    console.log(`✅ ${empleados.length} empleados creados`);
    
    // 3. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    
    await prisma.user.upsert({
      where: { email: 'admin@inventario.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@inventario.com',
        password: '$2b$10$OmC9mGzMj9c6qrj7YFgUZ.6KCLWZSYFqGFrJ6OhYlGsUeNKOK8jy2', // 'admin123'
        fullName: 'Administrador Sistema',
        isAdmin: true,
        isActive: true
      }
    });
    
    console.log('✅ Usuario administrador creado');
    console.log('   - Email: admin@inventario.com');
    console.log('   - Password: admin123');
    
    // 4. Verificar datos
    const conteo = {
      clasificaciones: await prisma.clasificacion.count(),
      empleados: await prisma.empleado.count(),
      usuarios: await prisma.user.count()
    };
    
    console.log('\n📊 Resumen de datos creados:');
    console.log(`- Clasificaciones: ${conteo.clasificaciones}`);
    console.log(`- Empleados: ${conteo.empleados}`);
    console.log(`- Usuarios: ${conteo.usuarios}`);
    
    console.log('\n🎉 ¡Datos básicos inicializados correctamente!');
    console.log('Ahora puedes acceder al sistema con:');
    console.log('- Email: admin@inventario.com');
    console.log('- Password: admin123');
    
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initBasicData();
}

export { initBasicData }; 