const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');
    
    // Contar registros
    const clasificaciones = await prisma.clasificacion.count();
    const empleados = await prisma.empleado.count();
    const inventory = await prisma.inventory.count();
    
    console.log('📊 Conteo de registros:');
    console.log(`- Clasificaciones: ${clasificaciones}`);
    console.log(`- Empleados: ${empleados}`);
    console.log(`- Inventory: ${inventory}\n`);
    
    // Verificar estructura del inventario
    if (inventory > 0) {
      const sample = await prisma.inventory.findFirst({
        include: {
          clasificacion: true,
          empleado: true
        }
      });
      
      console.log('📦 Muestra de inventory (relaciones funcionando):');
      console.log(`- Código EFC: ${sample.codigoEFC || 'N/A'}`);
      console.log(`- Marca: ${sample.marca || 'N/A'}`);
      console.log(`- Tipo equipo (via relación): ${sample.clasificacion?.tipo_equipo || 'N/A'}`);
      console.log(`- Familia (via relación): ${sample.clasificacion?.familia || 'N/A'}`);
      console.log(`- Usuario (via relación): ${sample.empleado?.nombre || 'N/A'}`);
      console.log(`- Gerencia (via relación): ${sample.empleado?.gerencia || 'N/A'}`);
    } else {
      console.log('⚠️  No hay datos en inventory');
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData(); 