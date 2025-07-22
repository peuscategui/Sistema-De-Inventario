const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBajasItems() {
  try {
    console.log('🔍 Verificando todos los items con estado BAJA...');
    
    // Buscar todos los items con estado BAJA
    const bajas = await prisma.inventory.findMany({
      where: {
        estado: 'BAJA'
      },
      select: {
        id: true,
        codigoEFC: true,
        marca: true,
        modelo: true,
        descripcion: true,
        serie: true,
        estado: true,
        status: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📊 Total de items en BAJA: ${bajas.length}`);
    console.log('\n📋 Lista de items en BAJA:');
    
    bajas.forEach((item, index) => {
      const isEmpty = !item.codigoEFC && !item.marca && !item.modelo && !item.descripcion;
      const status = isEmpty ? '❌ VACÍO' : '✅ CON DATOS';
      
      console.log(`${index + 1}. ID: ${item.id} - ${status}`);
      console.log(`   Código EFC: "${item.codigoEFC || 'N/A'}"`);
      console.log(`   Marca: "${item.marca || 'N/A'}"`);
      console.log(`   Modelo: "${item.modelo || 'N/A'}"`);
      console.log(`   Descripción: "${item.descripcion || 'N/A'}"`);
      console.log(`   Estado: ${item.estado}, Status: ${item.status}`);
      console.log('');
    });

    // Identificar registros vacíos
    const registrosVacios = bajas.filter(item => 
      !item.codigoEFC && !item.marca && !item.modelo && !item.descripcion
    );

    if (registrosVacios.length > 0) {
      console.log(`⚠️  REGISTROS VACÍOS ENCONTRADOS: ${registrosVacios.length}`);
      console.log('IDs de registros vacíos:');
      registrosVacios.forEach(item => {
        console.log(`   - ID: ${item.id}`);
      });
      
      console.log('\n💡 Para eliminar estos registros, puedes usar:');
      console.log('DELETE FROM inventory WHERE id IN (IDs_AQUÍ);');
    } else {
      console.log('✅ No se encontraron registros vacíos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBajasItems(); 