const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecord() {
  try {
    const record = await prisma.inventory.findFirst({
      where: { codigoEFC: 'LT-00005' },
      include: {
        empleado: true,
        clasificacion: true
      }
    });
    console.log('Registro encontrado:', JSON.stringify(record, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecord();
