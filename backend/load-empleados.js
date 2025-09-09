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

function parseCSV(content) {
  // Limpiar el contenido y manejar comillas
  const cleanContent = content
    .replace(/\r\n/g, '\n')  // Normalizar saltos de línea
    .replace(/"{2,}/g, '"')  // Reemplazar comillas dobles repetidas
    .trim();

  const lines = cleanContent.split('\n');
  const header = lines[0];
  const dataLines = lines.slice(1);
  const result = [];

  let currentLine = '';
  let inQuotes = false;

  for (let line of dataLines) {
    line = line.trim();
    
    // Si la línea está dentro de comillas, acumular
    if (inQuotes) {
      currentLine += ' ' + line;
    } else {
      currentLine = line;
    }

    // Contar comillas en la línea
    const quoteCount = (currentLine.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 === 1;

    // Si no estamos dentro de comillas, procesar la línea
    if (!inQuotes && currentLine) {
      // Limpiar comillas extras y espacios
      const cleanLine = currentLine
        .replace(/^"/, '')     // Quitar comilla inicial
        .replace(/"$/, '')     // Quitar comilla final
        .replace(/"{2}/g, '"') // Reemplazar comillas dobles por una
        .trim();

      const columns = cleanLine.split(',').map(col => col.trim());
      
      if (columns.length >= 5) {
        result.push({
          id: parseInt(columns[0]),
          nombre: columns[1],
          cargo: columns[2],
          gerencia: columns[3],
          sede: columns[4]
        });
      }
    }
  }

  return result;
}

async function loadEmpleados() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Limpiar tabla empleados primero
    console.log('\n🧹 Limpiando tabla empleados...');
    await client.query('DELETE FROM empleados');
    console.log('✅ Tabla empleados limpiada');

    // Cargar desde 02_empleados.csv
    console.log('\n👥 Cargando empleados...');
    const empleadosPath = path.join(__dirname, 'excel-templates', '02_empleados.csv');
    
    console.log('📂 Buscando archivo en:', empleadosPath);
    
    if (fs.existsSync(empleadosPath)) {
      console.log('✅ Archivo encontrado');
      const csvContent = fs.readFileSync(empleadosPath, 'utf8');
      const empleados = parseCSV(csvContent);
      
      console.log(`📄 Total empleados a cargar: ${empleados.length}`);
      
      let count = 0;
      for (const emp of empleados) {
        if (!isNaN(emp.id)) {
          try {
            await client.query(`
              INSERT INTO empleados (id, nombre, cargo, gerencia, sede)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              emp.id,
              emp.nombre,
              emp.cargo,
              emp.gerencia,
              emp.sede
            ]);
            count++;
            
            if (count % 50 === 0) {
              console.log(`Cargados ${count} empleados...`);
            }
          } catch (insertError) {
            console.error(`❌ Error insertando empleado ID ${emp.id}:`, insertError.message);
            console.error('Datos:', emp);
          }
        } else {
          console.log(`⚠️ Saltando línea con ID inválido:`, emp);
        }
      }
      console.log(`\n✅ ${count} empleados cargados exitosamente`);
    } else {
      console.log('❌ No se encontró el archivo 02_empleados.csv');
    }

  } catch (error) {
    console.error('❌ Error detallado:', error);
    console.error('Mensaje:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await client.end();
  }
}

loadEmpleados(); 