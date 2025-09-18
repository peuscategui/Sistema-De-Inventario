const { PrismaClient } = require('./generated/prisma');

async function verificarTablas() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando tablas existentes...');
    
    // Verificar si existe la tabla roles
    const rolesExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `;
    
    console.log('Tabla roles existe:', rolesExists[0].exists);
    
    // Verificar si existe la tabla user_roles
    const userRolesExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_roles'
      );
    `;
    
    console.log('Tabla user_roles existe:', userRolesExists[0].exists);
    
    // Listar todas las tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tablas existentes:');
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTablas();
