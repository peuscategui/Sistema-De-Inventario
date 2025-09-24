const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarCondiciones() {
  try {
    console.log('🔍 Verificando valores de condición en la base de datos...\n');
    
    // Obtener todos los valores únicos de condición
    const condiciones = await prisma.inventory.findMany({
      select: {
        condicion: true
      },
      distinct: ['condicion']
    });
    
    console.log('📊 Valores únicos de condición encontrados:');
    condiciones.forEach((item, index) => {
      console.log(`${index + 1}. "${item.condicion}"`);
    });
    
    // Contar cuántos equipos hay por cada condición
    console.log('\n📈 Conteo por condición:');
    for (const condicion of condiciones) {
      if (condicion.condicion) {
        const count = await prisma.inventory.count({
          where: {
            condicion: condicion.condicion
          }
        });
        console.log(`- "${condicion.condicion}": ${count} equipos`);
      }
    }
    
    // Verificar específicamente OBSOLETO
    const obsoletos = await prisma.inventory.count({
      where: {
        condicion: 'OBSOLETO'
      }
    });
    
    console.log(`\n🎯 Equipos con condición "OBSOLETO": ${obsoletos}`);
    
    // Verificar si hay variaciones de OBSOLETO
    const obsoletosVariaciones = await prisma.inventory.findMany({
      where: {
        condicion: {
          contains: 'OBSOLET'
        }
      },
      select: {
        condicion: true
      },
      distinct: ['condicion']
    });
    
    console.log('\n🔍 Variaciones de OBSOLETO encontradas:');
    obsoletosVariaciones.forEach(item => {
      console.log(`- "${item.condicion}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCondiciones();
