const { PrismaClient } = require('./generated/prisma');
const fs = require('fs');

const prisma = new PrismaClient();

async function backupEmpleados() {
  try {
    console.log('💾 Creando backup de empleados...');
    
    const empleados = await prisma.empleado.findMany({
      orderBy: {
        id: 'asc'
      }
    });

    const fecha = new Date().toISOString().split('T')[0];
    const archivo = `backup-empleados-${fecha}.json`;
    
    fs.writeFileSync(archivo, JSON.stringify(empleados, null, 2));
    
    console.log(`✅ Backup creado: ${archivo}`);
    console.log(`📊 Total empleados respaldados: ${empleados.length}`);
    
  } catch (error) {
    console.error('❌ Error al crear backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupEmpleados(); 