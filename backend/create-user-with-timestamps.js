const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function createUserWithTimestamps() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n👤 Creando usuario de prueba...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO "user" (username, email, password, "fullName", "isActive", "isAdmin", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'admin',
      'admin@efc.com',
      hashedPassword,
      'Administrador',
      true,
      true,
      now,
      now
    ]);
    
    console.log('✅ Usuario creado exitosamente');
    console.log('   Username: admin');
    console.log('   Email: admin@efc.com');
    console.log('   Password: admin123');
    console.log('   Admin: true');

    // Verificar usuarios existentes
    const usersResult = await client.query(`
      SELECT id, username, email, "fullName", "isActive", "isAdmin" FROM "user"
    `);
    
    console.log(`\n👥 Usuarios en la tabla user (${usersResult.rows.length} registros):`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Admin: ${user.isAdmin}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createUserWithTimestamps(); 