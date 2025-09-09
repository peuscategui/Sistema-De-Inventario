const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkInventoryStructure() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Obtener estructura de la tabla
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estructura de la tabla inventory:');
    columns.forEach(col => {
      console.log(`${col.column_name}:`);
      console.log(`  Tipo: ${col.data_type}`);
      console.log(`  Nullable: ${col.is_nullable}`);
      console.log(`  Default: ${col.column_default || 'none'}`);
      console.log('');
    });

    // Verificar constraints
    const { rows: constraints } = await client.query(`
      SELECT con.conname as constraint_name,
             con.contype as constraint_type,
             pg_get_constraintdef(con.oid) as definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'inventory';
    `);

    console.log('\n🔒 Constraints:');
    constraints.forEach(con => {
      console.log(`${con.constraint_name}:`);
      console.log(`  Tipo: ${con.constraint_type}`);
      console.log(`  Definición: ${con.definition}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkInventoryStructure();
