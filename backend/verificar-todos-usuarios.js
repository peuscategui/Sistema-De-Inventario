const { PrismaClient } = require('./generated/prisma');

async function verificarTodosUsuarios() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👥 Verificando todos los usuarios y sus roles...');
    console.log('================================================');
    
    // Obtener todos los usuarios con sus roles
    const usuariosConRoles = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.username,
        u."fullName",
        u."isAdmin",
        u."isActive",
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        r.permisos,
        ur.assigned_at
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id, r.nombre;
    `;
    
    // Agrupar por usuario
    const usuariosAgrupados = {};
    usuariosConRoles.forEach(row => {
      if (!usuariosAgrupados[row.id]) {
        usuariosAgrupados[row.id] = {
          id: row.id,
          email: row.email,
          username: row.username,
          fullName: row.fullName,
          isAdmin: row.isAdmin,
          isActive: row.isActive,
          roles: []
        };
      }
      
      if (row.role_nombre) {
        usuariosAgrupados[row.id].roles.push({
          nombre: row.role_nombre,
          descripcion: row.role_descripcion,
          permisos: row.permisos,
          assigned_at: row.assigned_at
        });
      }
    });
    
    // Mostrar usuarios
    Object.values(usuariosAgrupados).forEach(usuario => {
      console.log(`\n👤 ${usuario.fullName} (${usuario.email})`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Username: ${usuario.username}`);
      console.log(`   isAdmin: ${usuario.isAdmin}`);
      console.log(`   isActive: ${usuario.isActive}`);
      
      if (usuario.roles.length > 0) {
        console.log(`   Roles asignados:`);
        usuario.roles.forEach(role => {
          console.log(`     - ${role.nombre}: ${role.descripcion}`);
          console.log(`       Permisos: ${JSON.stringify(role.permisos)}`);
          console.log(`       Asignado: ${role.assigned_at}`);
        });
      } else {
        console.log(`   ⚠️ Sin roles asignados`);
      }
    });
    
    // Resumen
    console.log('\n📊 Resumen del sistema:');
    console.log('======================');
    console.log(`Total usuarios: ${Object.keys(usuariosAgrupados).length}`);
    
    const usuariosConRolesCount = Object.values(usuariosAgrupados).filter(u => u.roles.length > 0).length;
    console.log(`Usuarios con roles: ${usuariosConRolesCount}`);
    
    const admins = Object.values(usuariosAgrupados).filter(u => u.isAdmin).length;
    console.log(`Administradores: ${admins}`);
    
    // Mostrar roles disponibles
    const rolesDisponibles = await prisma.$queryRaw`
      SELECT nombre, descripcion, permisos
      FROM roles
      ORDER BY nombre;
    `;
    
    console.log('\n🎭 Roles disponibles:');
    rolesDisponibles.forEach(role => {
      console.log(`- ${role.nombre}: ${role.descripcion}`);
      console.log(`  Permisos: ${JSON.stringify(role.permisos)}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTodosUsuarios();
