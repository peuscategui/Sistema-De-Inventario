const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function loadColaboradores() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla colaboradores
    console.log('\n🧹 Limpiando tabla colaboradores...');
    await client.query('DELETE FROM colaboradores');
    console.log('✅ Tabla colaboradores limpiada');

    // Leer el archivo CSV
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(__dirname, '..', 'empleados_carga_limpio.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');

    // Saltar la primera línea (encabezados)
    const dataLines = lines.slice(1);
    let count = 0;

    console.log('\n📥 Cargando colaboradores...');
    
    for (const line of dataLines) {
      if (line.trim()) {
        // Manejar líneas que pueden contener comas dentro de comillas
        let columns = [];
        let currentColumn = '';
        let insideQuotes = false;
        
        for (let char of line) {
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            columns.push(currentColumn.trim());
            currentColumn = '';
          } else {
            currentColumn += char;
          }
        }
        columns.push(currentColumn.trim());

        // Asegurarse de que tenemos todas las columnas necesarias
        if (columns.length >= 5) {
          const [id, nombre, cargo, gerencia, sede] = columns;

          try {
            await client.query(`
              INSERT INTO colaboradores (id, nombre, cargo, gerencia, sede)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              parseInt(id),
              nombre.replace(/"/g, '').trim(),
              cargo.replace(/"/g, '').trim(),
              gerencia.replace(/"/g, '').trim(),
              sede.replace(/"/g, '').trim()
            ]);
            count++;

            if (count % 50 === 0) {
              console.log(`✅ Cargados ${count} colaboradores...`);
            }
          } catch (insertError) {
            console.error(`❌ Error insertando colaborador ID ${id}:`, insertError.message);
            console.error('Datos:', { id, nombre, cargo, gerencia, sede });
          }
        }
      }
    }

    console.log(`\n✅ Carga completada: ${count} colaboradores insertados`);

    // Verificar la carga
    const { rows } = await client.query('SELECT COUNT(*) FROM colaboradores');
    console.log(`\n📊 Total colaboradores en la base de datos: ${rows[0].count}`);

    // Mostrar algunos ejemplos
    const { rows: ejemplos } = await client.query('SELECT * FROM colaboradores ORDER BY id LIMIT 5');
    console.log('\n📋 Ejemplos de colaboradores cargados:');
    ejemplos.forEach(col => {
      console.log(`ID: ${col.id}, Nombre: ${col.nombre}, Cargo: ${col.cargo}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

loadColaboradores();
