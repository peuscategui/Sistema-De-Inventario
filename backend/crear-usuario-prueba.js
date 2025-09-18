const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

async function crearUsuarioPrueba() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👤 Creando usuario de prueba...');
    
    // 1. Verificar si ya existe el usuario
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: 'user@efc.com.pe' }
    });
    
    if (usuarioExistente) {
      console.log('⚠️ El usuario user@efc.com.pe ya existe');
      console.log('ID:', usuarioExistente.id);
      console.log('Username:', usuarioExistente.username);
      console.log('isAdmin:', usuarioExistente.isAdmin);
      return;
    }
    
    // 2. Crear el usuario
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const nuevoUsuario = await prisma.user.create({
      data: {
        username: 'user',
        email: 'user@efc.com.pe',
        password: hashedPassword,
        fullName: 'Usuario de Prueba',
        isActive: true,
        isAdmin: false,
      }
    });
    
    console.log('✅ Usuario creado exitosamente:');
    console.log('ID:', nuevoUsuario.id);
    console.log('Username:', nuevoUsuario.username);
    console.log('Email:', nuevoUsuario.email);
    console.log('Full Name:', nuevoUsuario.fullName);
    console.log('isAdmin:', nuevoUsuario.isAdmin);
    
    // 3. Asignar rol USER
    console.log('\n🔗 Asignando rol USER...');
    
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      SELECT u.id, r.id, CURRENT_TIMESTAMP, (SELECT id FROM "user" WHERE email = 'admin@efc.com')
      FROM "user" u, roles r
      WHERE u.email = 'user@efc.com.pe' AND r.nombre = 'USER';
    `;
    
    // 4. Verificar la asignación
    const usuarioConRol = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u."fullName",
        u."isAdmin",
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        r.permisos
      FROM "user" u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'user@efc.com.pe';
    `;
    
    console.log('\n📊 Usuario con rol asignado:');
    usuarioConRol.forEach(user => {
      console.log(`👤 ${user.fullName} (${user.email})`);
      console.log(`   Rol: ${user.role_nombre} - ${user.role_descripcion}`);
      console.log(`   Permisos: ${JSON.stringify(user.permisos)}`);
      console.log(`   isAdmin: ${user.isAdmin}`);
    });
    
    // 5. Mostrar credenciales de acceso
    console.log('\n🔑 Credenciales de acceso:');
    console.log('========================');
    console.log('Email: user@efc.com.pe');
    console.log('Password: password123');
    console.log('Rol: USER');
    console.log('Permisos: inventory:read, reports:read');
    
    console.log('\n🎉 Usuario de prueba creado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearUsuarioPrueba();
