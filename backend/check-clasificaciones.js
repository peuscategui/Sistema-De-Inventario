const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkClasificaciones() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar total de clasificaciones
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM clasificacion');
    console.log(`📊 Total clasificaciones: ${count.count}`);

    // Obtener todas las clasificaciones
    const { rows: clasificaciones } = await client.query(`
      SELECT id, familia, sub_familia, tipo_equipo 
      FROM clasificacion 
      ORDER BY id
    `);

    console.log('\n📋 Clasificaciones disponibles:');
    clasificaciones.forEach(c => {
      console.log(`ID ${c.id}: ${c.familia} - ${c.sub_familia} - ${c.tipo_equipo}`);
    });

    // Verificar IDs específicos del archivo inventory
    const idsToCheck = [16]; // IDs que vemos en el archivo inventory
    console.log('\n🔍 Verificando IDs específicos:');
    for (const id of idsToCheck) {
      const { rows } = await client.query('SELECT * FROM clasificacion WHERE id = $1', [id]);
      if (rows.length > 0) {
        console.log(`✅ ID ${id} existe: ${rows[0].familia} - ${rows[0].tipo_equipo}`);
      } else {
        console.log(`❌ ID ${id} no existe en la tabla clasificacion`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkClasificaciones();
