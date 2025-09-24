const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function probarPrismaFamilia() {
  try {
    console.log('🔍 Probando consulta Prisma con filtro familia=Computadora...\n');
    
    // Simular la consulta que hace el servicio
    const whereClause = {
      clasificacion: {
        familia: {
          equals: 'Computadora',
          mode: 'insensitive'
        }
      },
      estado: {
        notIn: ['BAJA', 'DONACION']
      }
    };
    
    console.log('🔍 DEBUG: whereClause:', JSON.stringify(whereClause, null, 2));
    
    const items = await prisma.inventory.findMany({
      where: whereClause,
      take: 5,
      include: {
        clasificacion: true,
        empleado: true,
      },
    });
    
    console.log(`📊 Resultados encontrados: ${items.length}`);
    
    if (items.length > 0) {
      console.log('\n📋 Primeros 5 items:');
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.codigoEFC} - ${item.marca} ${item.modelo} - Familia: ${item.clasificacion?.familia} - Estado: ${item.estado}`);
      });
    } else {
      console.log('\n❌ No se encontraron items');
    }
    
    // Contar total
    const total = await prisma.inventory.count({
      where: whereClause
    });
    
    console.log(`\n🎯 Total de equipos de familia "Computadora": ${total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

probarPrismaFamilia();
