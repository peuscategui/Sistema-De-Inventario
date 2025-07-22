import { PrismaService } from '../prisma.service';

async function safeMigration() {
  const prisma = new PrismaService();
  
  try {
    console.log('🔍 Verificando estado actual de la base de datos...');
    
    // Verificar si las tablas tienen datos
    const inventoryCount = await prisma.inventory.count();
    const clasificacionCount = await prisma.clasificacion.count();
    const empleadoCount = await prisma.empleado.count();
    
    console.log(`📊 Datos actuales:
    - Inventory: ${inventoryCount} registros
    - Clasificación: ${clasificacionCount} registros  
    - Empleados: ${empleadoCount} registros`);
    
    if (inventoryCount > 0 || clasificacionCount > 0 || empleadoCount > 0) {
      console.log('✅ Se encontraron datos existentes');
      console.log('💡 Para hacer cambios al schema:');
      console.log('   1. Crear backup: pg_dump -h 192.168.40.129 -p 5432 -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql');
      console.log('   2. Aplicar cambios con: npx prisma db push');
      console.log('   3. Si hay problemas, restaurar con: psql -h 192.168.40.129 -p 5432 -U postgres -d postgres < backup_file.sql');
    } else {
      console.log('⚠️  No se encontraron datos. Las tablas están vacías.');
      console.log('🔄 Necesitas restaurar desde backup antes de continuar.');
    }
    
  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  safeMigration();
}

export { safeMigration }; 