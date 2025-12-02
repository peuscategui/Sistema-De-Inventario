const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function addColumns() {
  try {
    console.log('Agregando columnas fecha_donacion y motivo_donacion...');
    
    // Agregar fecha_donacion si no existe
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'inventory' 
              AND column_name = 'fecha_donacion'
          ) THEN
              ALTER TABLE inventory ADD COLUMN fecha_donacion DATE;
          END IF;
      END $$;
    `;
    
    // Agregar motivo_donacion si no existe
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'inventory' 
              AND column_name = 'motivo_donacion'
          ) THEN
              ALTER TABLE inventory ADD COLUMN motivo_donacion VARCHAR(255);
          END IF;
      END $$;
    `;
    
    console.log('✅ Columnas agregadas exitosamente');
  } catch (error) {
    console.error('❌ Error al agregar columnas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addColumns();

