const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function debugClasificacion() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar estructura de la tabla clasificacion
    console.log('📋 Estructura de la tabla clasificacion:');
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clasificacion'
      ORDER BY ordinal_position;
    `);
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Verificar registros existentes
    console.log('\n📊 Registros en clasificacion:');
    const { rows: clasificaciones } = await client.query(`
      SELECT id, familia, sub_familia, tipo_equipo
      FROM clasificacion
      ORDER BY id;
    `);
    clasificaciones.forEach(c => {
      console.log(`ID ${c.id}: ${c.familia} - ${c.sub_familia} - ${c.tipo_equipo}`);
    });

    // Verificar secuencia
    const { rows: [sequence] } = await client.query(`
      SELECT last_value, is_called
      FROM clasificacion_id_seq;
    `);
    console.log('\n🔢 Estado de la secuencia:');
    console.log(`Último valor: ${sequence.last_value}`);
    console.log(`Llamada: ${sequence.is_called}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

debugClasificacion();
