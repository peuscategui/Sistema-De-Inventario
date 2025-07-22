const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function createTestUser() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n👤 Creando usuario de prueba...');
    
    // Crear usuario de prueba
    await client.query(`
      INSERT INTO usuarios (usuario, clave, permisos)
      VALUES ($1, $2, $3)
    `, [
      'admin',
      'admin123',
      'admin'
    ]);
    
    console.log('✅ Usuario creado exitosamente');
    console.log('   Usuario: admin');
    console.log('   Clave: admin123');
    console.log('   Permisos: admin');

    // Verificar usuarios existentes
    const usersResult = await client.query(`
      SELECT * FROM usuarios
    `);
    
    console.log(`\n👥 Usuarios en la base de datos (${usersResult.rows.length} registros):`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Usuario: ${user.usuario}, Permisos: ${user.permisos}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestUser(); 