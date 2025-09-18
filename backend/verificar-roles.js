const { PrismaClient } = require('./generated/prisma');

async function verificarRoles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando contenido de las tablas...');
    
    // Verificar roles
    const roles = await prisma.$queryRaw`SELECT * FROM roles ORDER BY id;`;
    console.log('\n👥 Roles existentes:');
    console.log('==================');
    roles.forEach(role => {
      console.log(`ID: ${role.id}`);
      console.log(`Name: ${role.name}`);
      console.log(`Display Name: ${role.display_name}`);
      console.log(`Description: ${role.description}`);
      console.log(`Permissions: ${JSON.stringify(role.permissions)}`);
      console.log('---');
    });
    
    // Verificar user_roles
    const userRoles = await prisma.$queryRaw`
      SELECT 
        ur.id,
        u.email,
        u.full_name,
        r.name as role_name,
        r.display_name as role_display_name,
        ur.assigned_at
      FROM user_roles ur
      JOIN "user" u ON ur.user_id = u.id
      JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `;
    
    console.log('\n🔗 Asignaciones de roles:');
    console.log('========================');
    userRoles.forEach(assignment => {
      console.log(`Usuario: ${assignment.full_name} (${assignment.email})`);
      console.log(`Rol: ${assignment.role_display_name} (${assignment.role_name})`);
      console.log(`Asignado: ${assignment.assigned_at}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarRoles();
