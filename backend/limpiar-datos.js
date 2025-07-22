const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();

async function limpiarSoloInventory() {
  try {
    console.log('🧹 Eliminando todos los registros de la tabla inventory...');
    const eliminados = await prisma.inventory.deleteMany({});
    console.log(`✅ Inventory: ${eliminados.count} registros eliminados`);
    console.log('\nLimpieza de inventory completada.');
  } catch (error) {
    console.error('❌ Error durante la limpieza de inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarSoloInventory(); 