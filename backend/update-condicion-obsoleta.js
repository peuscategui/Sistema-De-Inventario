const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCondicionObsoleta() {
  try {
    console.log('🔍 Buscando items con estado OBSOLETO...');
    
    // Primero, verificar cuántos items tienen estado OBSOLETO
    const itemsObsoletos = await prisma.inventory.findMany({
      where: {
        estado: 'OBSOLETO'
      },
      select: {
        id: true,
        codigoEFC: true,
        marca: true,
        modelo: true,
        condicion: true
      }
    });
    
    console.log(`📊 Encontrados ${itemsObsoletos.length} items con estado OBSOLETO`);
    
    if (itemsObsoletos.length === 0) {
      console.log('✅ No hay items con estado OBSOLETO para actualizar');
      return;
    }
    
    // Mostrar algunos ejemplos
    console.log('📋 Ejemplos de items encontrados:');
    itemsObsoletos.slice(0, 5).forEach(item => {
      console.log(`  - ${item.codigoEFC}: ${item.marca} ${item.modelo} (condición actual: ${item.condicion})`);
    });
    
    // Actualizar la condición a OBSOLETA
    const result = await prisma.inventory.updateMany({
      where: {
        estado: 'OBSOLETO'
      },
      data: {
        condicion: 'OBSOLETA'
      }
    });
    
    console.log(`✅ Actualizados ${result.count} items con condición OBSOLETA`);
    
    // Verificar el resultado
    const itemsActualizados = await prisma.inventory.findMany({
      where: {
        estado: 'OBSOLETO',
        condicion: 'OBSOLETA'
      },
      select: {
        id: true,
        codigoEFC: true,
        marca: true,
        modelo: true,
        condicion: true
      }
    });
    
    console.log(`🔍 Verificación: ${itemsActualizados.length} items ahora tienen estado OBSOLETO y condición OBSOLETA`);
    
    // Mostrar algunos ejemplos actualizados
    console.log('📋 Ejemplos de items actualizados:');
    itemsActualizados.slice(0, 5).forEach(item => {
      console.log(`  - ${item.codigoEFC}: ${item.marca} ${item.modelo} (condición: ${item.condicion})`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando condición:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCondicionObsoleta();
