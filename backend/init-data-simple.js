const { PrismaClient } = require('@prisma/client');

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
      try {
        await prisma.clasificacion.create({
          data: clasificacion
        });
        console.log(`✅ Clasificación creada: ${clasificacion.tipo_equipo}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Clasificación ya existe: ${clasificacion.tipo_equipo}`);
        } else {
          console.error(`❌ Error creando clasificación: ${error.message}`);
        }
      }
    }
    
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
      try {
        await prisma.empleado.create({
          data: empleado
        });
        console.log(`✅ Empleado creado: ${empleado.nombre}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Empleado ya existe: ${empleado.nombre}`);
        } else {
          console.error(`❌ Error creando empleado: ${error.message}`);
        }
      }
    }
    
    // 3. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    
    try {
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@inventario.com',
          password: '$2b$10$OmC9mGzMj9c6qrj7YFgUZ.6KCLWZSYFqGFrJ6OhYlGsUeNKOK8jy2', // 'admin123'
          fullName: 'Administrador Sistema',
          isAdmin: true,
          isActive: true
        }
      });
      console.log('✅ Usuario administrador creado');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️  Usuario administrador ya existe');
      } else {
        console.error(`❌ Error creando usuario administrador: ${error.message}`);
      }
    }
    
    // 4. Verificar datos
    const conteo = {
      clasificaciones: await prisma.clasificacion.count(),
      empleados: await prisma.empleado.count(),
      usuarios: await prisma.user.count()
    };
    
    console.log('\n📊 Resumen de datos:');
    console.log(`- Clasificaciones: ${conteo.clasificaciones}`);
    console.log(`- Empleados: ${conteo.empleados}`);
    console.log(`- Usuarios: ${conteo.usuarios}`);
    
    console.log('\n🎉 ¡Datos básicos inicializados!');
    console.log('\n🔐 Credenciales de acceso:');
    console.log('- Email: admin@inventario.com');
    console.log('- Password: admin123');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initBasicData(); 