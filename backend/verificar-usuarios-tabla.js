const { PrismaClient } = require('./generated/prisma');

async function verificarUsuariosTabla() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando tabla usuarios...');
    
    // Verificar estructura de usuarios
    const usuariosStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estructura de tabla usuarios:');
    usuariosStructure.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar datos en usuarios
    const usuarios = await prisma.$queryRaw`SELECT * FROM usuarios;`;
    console.log('\n👥 Datos en tabla usuarios:');
    usuarios.forEach(user => {
      console.log(`ID: ${user.id}, Usuario: ${user.usuario}, Rol ID: ${user.rol_id || 'NULL'}`);
    });
    
    // Verificar restricciones de clave foránea
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'usuarios' OR tc.table_name = 'roles');
    `;
    
    console.log('\n🔗 Restricciones de clave foránea:');
    constraints.forEach(constraint => {
      console.log(`${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuariosTabla();
