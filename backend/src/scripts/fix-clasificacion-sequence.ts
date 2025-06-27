import { PrismaService } from '../prisma.service';

async function fixClasificacionSequence() {
  const prisma = new PrismaService();
  
  try {
    // Obtener el ID máximo actual
    const maxId = await prisma.clasificacion.aggregate({
      _max: {
        id: true,
      },
    });
    
    const nextId = (maxId._max.id || 0) + 1;
    
    console.log('ID máximo actual:', maxId._max.id);
    console.log('Próximo ID que debería ser:', nextId);
    
    // Reiniciar la secuencia (esto es específico para PostgreSQL)
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('clasificacion', 'id'), ${nextId}, false);`;
    
    console.log('Secuencia de clasificacion reiniciada correctamente');
    
    // Verificar que no hay IDs duplicados
    const duplicates = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count 
      FROM clasificacion 
      GROUP BY id 
      HAVING COUNT(*) > 1;
    `;
    
    if (Array.isArray(duplicates) && duplicates.length > 0) {
      console.log('IDs duplicados encontrados:', duplicates);
    } else {
      console.log('No se encontraron IDs duplicados');
    }
    
  } catch (error) {
    console.error('Error al arreglar la secuencia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixClasificacionSequence(); 