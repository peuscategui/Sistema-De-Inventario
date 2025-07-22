const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function checkUserTable() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('\n👥 Verificando tabla user:');
    
    // Verificar estructura de la tabla user
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de la tabla user:');
    structureResult.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar usuarios existentes
    const usersResult = await client.query(`
      SELECT id, username, email, "fullName", "isActive", "isAdmin" FROM "user" LIMIT 10
    `);
    
    console.log(`\n👤 Usuarios existentes en tabla user (${usersResult.rows.length} registros):`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Admin: ${user.isAdmin}`);
    });

    // Si no hay usuarios, crear uno de prueba
    if (usersResult.rows.length === 0) {
      console.log('\n👤 Creando usuario de prueba...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO "user" (username, email, password, "fullName", "isActive", "isAdmin")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'admin',
        'admin@efc.com',
        hashedPassword,
        'Administrador',
        true,
        true
      ]);
      
      console.log('✅ Usuario creado exitosamente');
      console.log('   Username: admin');
      console.log('   Email: admin@efc.com');
      console.log('   Password: admin123');
      console.log('   Admin: true');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserTable(); 