import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function migrarFechas() {
  try {
    // Obtener todos los registros
    const registros = await prisma.inventory.findMany();

    console.log(`Encontrados ${registros.length} registros para actualizar`);

    // Actualizar cada registro con la fecha correcta
    for (const registro of registros) {
      await prisma.inventory.update({
        where: { id: registro.id },
        data: {
          fecha_compra: new Date('2023-05-22')
        }
      });
      console.log(`Actualizado registro ID: ${registro.id}`);
    }

    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrarFechas(); 