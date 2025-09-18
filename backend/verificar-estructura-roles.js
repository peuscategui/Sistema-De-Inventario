const { PrismaClient } = require('./generated/prisma');

async function verificarEstructura() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando estructura de las tablas...');
    
    // Verificar estructura de roles
    const rolesStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'roles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estructura de tabla roles:');
    rolesStructure.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar estructura de user_roles
    const userRolesStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_roles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estructura de tabla user_roles:');
    userRolesStructure.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar estructura de user
    const userStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estructura de tabla user:');
    userStructure.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstructura();
