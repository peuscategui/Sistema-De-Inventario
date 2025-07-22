const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkItemStatus() {
  try {
    console.log('🔍 Buscando item "Ap-Almacen1"...');
    
    // Buscar por código EFC
    const item = await prisma.inventory.findFirst({
      where: {
        codigoEFC: {
          contains: 'Ap-Almacen1'
        }
      },
      include: {
        clasificacion: true,
        empleado: true,
      }
    });

    if (item) {
      console.log('✅ Item encontrado:');
      console.log('- ID:', item.id);
      console.log('- Código EFC:', item.codigoEFC);
      console.log('- Estado:', item.estado);
      console.log('- Status:', item.status);
      console.log('- Marca:', item.marca);
      console.log('- Modelo:', item.modelo);
      console.log('- Descripción:', item.descripcion);
      console.log('- Empleado:', item.empleado?.nombre || 'Sin asignar');
      console.log('- Clasificación:', item.clasificacion?.familia || 'Sin clasificar');
    } else {
      console.log('❌ Item "Ap-Almacen1" no encontrado');
      
      // Buscar items similares
      const similarItems = await prisma.inventory.findMany({
        where: {
          codigoEFC: {
            contains: 'Almacen'
          }
        },
        select: {
          id: true,
          codigoEFC: true,
          estado: true,
          status: true,
          marca: true,
          modelo: true
        }
      });
      
      console.log('📋 Items similares encontrados:');
      similarItems.forEach(item => {
        console.log(`- ${item.codigoEFC} (ID: ${item.id}, Estado: ${item.estado}, Status: ${item.status})`);
      });
    }

    // Verificar todos los items con estado BAJA
    console.log('\n🔍 Verificando todos los items con estado BAJA...');
    const bajas = await prisma.inventory.findMany({
      where: {
        OR: [
          { estado: 'BAJA' },
          { status: 'baja' }
        ]
      },
      select: {
        id: true,
        codigoEFC: true,
        estado: true,
        status: true,
        marca: true,
        modelo: true
      }
    });

    console.log(`📊 Total de items en BAJA: ${bajas.length}`);
    bajas.forEach(item => {
      console.log(`- ${item.codigoEFC} (ID: ${item.id}, Estado: ${item.estado}, Status: ${item.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkItemStatus(); 