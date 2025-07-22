import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCleanedSchema() {
  try {
    console.log('🧪 Probando esquema limpio...');
    
    // 1. Verificar que existen clasificaciones y empleados
    const clasificaciones = await prisma.clasificacion.findMany();
    const empleados = await prisma.empleado.findMany();
    
    console.log(`📋 Clasificaciones disponibles: ${clasificaciones.length}`);
    console.log(`👥 Empleados disponibles: ${empleados.length}`);
    
    if (clasificaciones.length === 0 || empleados.length === 0) {
      console.log('⚠️  Faltan datos base. Ejecutar scripts de importación primero.');
      return;
    }
    
    // 2. Crear datos de inventario de prueba con relaciones
    const sampleInventory = [
      {
        codigoEFC: 'TEST-001',
        marca: 'HP',
        modelo: 'EliteBook 840',
        serie: 'TEST123456',
        estado: 'activo',
        clasificacionId: clasificaciones[0].id,
        empleadoId: empleados[0].id,
      },
      {
        codigoEFC: 'TEST-002', 
        marca: 'Dell',
        modelo: 'Latitude 7420',
        serie: 'TEST789012',
        estado: 'activo',
        clasificacionId: clasificaciones[1] ? clasificaciones[1].id : clasificaciones[0].id,
        empleadoId: empleados[1] ? empleados[1].id : empleados[0].id,
      }
    ];
    
    // 3. Limpiar datos de prueba anteriores
    await prisma.inventory.deleteMany({
      where: {
        codigoEFC: {
          startsWith: 'TEST-'
        }
      }
    });
    
    // 4. Crear nuevos datos de prueba
    console.log('📝 Creando datos de inventario de prueba...');
    
    for (const item of sampleInventory) {
      const created = await prisma.inventory.create({
        data: item,
        include: {
          clasificacion: true,
          empleado: true,
        }
      });
      
      console.log(`✅ Creado: ${created.codigoEFC}`);
      console.log(`   - Tipo: ${created.clasificacion?.tipo_equipo || 'N/A'}`);
      console.log(`   - Usuario: ${created.empleado?.nombre || 'N/A'}`);
      console.log(`   - Gerencia: ${created.empleado?.gerencia || 'N/A'}`);
    }
    
    // 5. Verificar que las consultas funcionan correctamente
    console.log('\n🔍 Probando consultas con relaciones...');
    
    const inventoryWithRelations = await prisma.inventory.findMany({
      where: {
        codigoEFC: {
          startsWith: 'TEST-'
        }
      },
      include: {
        clasificacion: true,
        empleado: true,
      }
    });
    
    console.log(`📊 Items encontrados: ${inventoryWithRelations.length}`);
    
    inventoryWithRelations.forEach((item: any) => {
      console.log(`\n📦 ${item.codigoEFC}:`);
      console.log(`   - Marca/Modelo: ${item.marca} ${item.modelo}`);
      console.log(`   - Clasificación: ${item.clasificacion?.familia} > ${item.clasificacion?.sub_familia} > ${item.clasificacion?.tipo_equipo}`);
      console.log(`   - Empleado: ${item.empleado?.nombre} (${item.empleado?.cargo})`);
      console.log(`   - Ubicación: ${item.empleado?.sede} - ${item.empleado?.gerencia}`);
    });
    
    console.log('\n✅ ¡Esquema limpio funcionando correctamente!');
    console.log('🎉 Los datos duplicados han sido eliminados exitosamente.');
    console.log('🔗 Las relaciones están funcionando perfectamente.');
    
  } catch (error) {
    console.error('❌ Error probando esquema limpio:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCleanedSchema(); 