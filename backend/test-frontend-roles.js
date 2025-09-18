const { PrismaClient } = require('./generated/prisma');

async function testFrontendRoles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Probando sistema de roles para frontend...');
    
    // 1. Verificar usuario de prueba
    const testUser = await prisma.user.findUnique({
      where: { email: 'user@efc.com.pe' }
    });
    
    if (!testUser) {
      console.log('❌ Usuario de prueba no encontrado');
      return;
    }
    
    console.log('✅ Usuario de prueba encontrado:');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   isAdmin: ${testUser.isAdmin}`);
    
    // 2. Obtener roles del usuario
    const userRoles = await prisma.$queryRaw`
      SELECT 
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        r.permisos
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${testUser.id};
    `;
    
    console.log('\n👥 Roles del usuario de prueba:');
    userRoles.forEach(role => {
      console.log(`   - ${role.role_nombre}: ${role.role_descripcion}`);
      console.log(`     Permisos: ${JSON.stringify(role.permisos)}`);
    });
    
    // 3. Simular lógica de permisos del frontend
    console.log('\n🔍 Simulando lógica de permisos del frontend:');
    
    const permissions = userRoles.flatMap(role => role.permisos);
    const uniquePermissions = [...new Set(permissions)];
    
    console.log(`   Permisos únicos: ${JSON.stringify(uniquePermissions)}`);
    
    // Verificar permisos específicos
    const canCreate = uniquePermissions.includes('*') || 
                     uniquePermissions.some(p => p.includes('write') || p.includes('create'));
    const canEdit = uniquePermissions.includes('*') || 
                   uniquePermissions.some(p => p.includes('write') || p.includes('edit'));
    const canDelete = uniquePermissions.includes('*') || 
                     uniquePermissions.some(p => p.includes('delete'));
    
    console.log(`   ✅ Puede crear: ${canCreate}`);
    console.log(`   ✅ Puede editar: ${canEdit}`);
    console.log(`   ✅ Puede eliminar: ${canDelete}`);
    
    // 4. Verificar que el usuario NO debería poder crear/editar/eliminar
    if (canCreate || canEdit || canDelete) {
      console.log('\n❌ PROBLEMA: El usuario USER no debería poder crear/editar/eliminar');
      console.log('   Solo debería poder visualizar (inventory:read)');
    } else {
      console.log('\n✅ CORRECTO: El usuario USER solo puede visualizar');
    }
    
    // 5. Verificar usuario ADMIN para comparar
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@efc.com' }
    });
    
    if (adminUser) {
      const adminRoles = await prisma.$queryRaw`
        SELECT 
          r.nombre as role_nombre,
          r.permisos
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ${adminUser.id};
      `;
      
      const adminPermissions = adminRoles.flatMap(role => role.permisos);
      const adminCanCreate = adminPermissions.includes('*') || 
                           adminPermissions.some(p => p.includes('write') || p.includes('create'));
      
      console.log('\n👑 Comparación con ADMIN:');
      console.log(`   ADMIN puede crear: ${adminCanCreate}`);
      console.log(`   USER puede crear: ${canCreate}`);
    }
    
    console.log('\n🎯 Recomendación:');
    console.log('   El usuario USER debería ver solo botones de visualización');
    console.log('   Los botones de crear/editar/eliminar deben estar ocultos');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendRoles();
