const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function loadCorrectClasificaciones() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla clasificacion primero
    console.log('\n🧹 Limpiando tabla clasificacion...');
    await client.query('DELETE FROM clasificacion');
    console.log('✅ Tabla clasificacion limpiada');

    // Cargar desde el archivo original con 38 registros
    console.log('\n📋 Cargando 38 registros de clasificaciones...');
    const clasificacionesPath = path.join(__dirname, '..', 'clasificaciones_carga_con_id.csv');
    
    if (fs.existsSync(clasificacionesPath)) {
      const csvContent = fs.readFileSync(clasificacionesPath, 'utf8');
      const lines = csvContent.split('\n').slice(1); // Saltar header
      
      let count = 0;
      for (const line of lines) {
        if (line.trim()) {
          const columns = line.split(',');
          if (columns.length >= 6) {
            const [id, familia, sub_familia, tipo_equipo, vida_util, valor_reposicion] = columns;
            
            await client.query(`
              INSERT INTO clasificacion (id, familia, sub_familia, tipo_equipo, vida_util, valor_reposicion)
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              parseInt(id), 
              familia, 
              sub_familia, 
              tipo_equipo, 
              vida_util, 
              valor_reposicion ? parseFloat(valor_reposicion) : null
            ]);
            count++;
            console.log(`Cargado: ID ${id} - ${familia} - ${tipo_equipo}`);
          }
        }
      }
      console.log(`\n✅ ${count} clasificaciones cargadas exitosamente`);
    } else {
      console.log('❌ No se encontró el archivo clasificaciones_carga_con_id.csv');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

loadCorrectClasificaciones(); 