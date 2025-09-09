const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  
  console.log(`📄 Total líneas en CSV: ${lines.length}`);
  console.log(`📄 Primera línea (header): ${lines[0]}`);
  if (lines.length > 1) {
    console.log(`📄 Segunda línea (first data): ${lines[1]}`);
  }
  
  // Saltar el header
  const dataLines = lines.slice(1);
  
  const empleados = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    
    if (!line.trim()) {
      if (i < 3) console.log(`⚠️  Línea ${i + 2} está vacía, saltando...`);
      continue;
    }
    
    // Separar por comas
    const columns = line.split(',').map(col => col.trim());
    
    if (i < 3) {
      console.log(`📄 Línea ${i + 2}: ${columns.length} columnas`);
      console.log(`   Datos: [${columns.join('] [')})}`);
    }
    
    // Formato: id,nombre,cargo,gerencia,sede
    if (columns.length >= 5) {
      const id = parseInt(columns[0]);
      const nombre = columns[1].trim();
      const cargo = columns[2].trim();
      const gerencia = columns[3].trim();
      const sede = columns[4].trim();
      
      if (i < 3) {
        console.log(`   Parseado: ID=${id}, nombre='${nombre}', cargo='${cargo}', gerencia='${gerencia}', sede='${sede}'`);
      }
      
      // Validar que los datos son consistentes y no sean registros de equipos
      const esRegistroValido = !isNaN(id) && 
                            nombre && nombre.length > 1 && 
                            cargo && cargo.length > 1 && 
                            gerencia && gerencia.length > 5 && 
                            sede && sede.length > 3;
      
      if (esRegistroValido) {
        empleados.push({
          id,
          nombre: nombre.trim(),
          cargo: cargo.trim(),
          gerencia: gerencia.trim(),
          sede: sede.trim()
        });
        if (i < 3) {
          console.log(`   ✅ Agregado`);
        }
      } else {
        if (i < 3) {
          console.log(`   ❌ Datos inválidos: ID=${id}, nombre='${nombre}', cargo='${cargo}'`);
        }
      }
    } else {
      if (i < 3) {
        console.log(`   ❌ Línea con ${columns.length} columnas (necesita >= 5)`);
      }
    }
    
    // Mostrar progreso cada 10 líneas después de las primeras 3
    if (i === 2) {
      console.log(`   ... (procesando resto silenciosamente)`);
    } else if (i > 2 && (i + 1) % 10 === 0) {
      console.log(`   📊 Procesadas ${i + 1} líneas...`);
    }
  }
  
  return empleados;
}

async function limpiarDatos() {
  console.log('🧹 Limpiando datos...');
  
  try {
    // Eliminar todos los empleados
    await client.query('DELETE FROM empleados');
    console.log('  ✅ Tabla empleados limpiada');
  } catch (error) {
    console.log('  ⚠️  Error al limpiar datos:', error.message);
  }
}

async function cargarEmpleados(empleados) {
  console.log('👨‍💼 Cargando empleados...');
  
  let exitosos = 0;
  
  for (const emp of empleados) {
    try {
      await client.query(
        'INSERT INTO empleados (id, nombre, cargo, gerencia, sede) VALUES ($1, $2, $3, $4, $5)',
        [emp.id, emp.nombre, emp.cargo, emp.gerencia, emp.sede]
      );
      
      console.log(`  ✅ ID ${emp.id}: ${emp.nombre} - ${emp.cargo}`);
      exitosos++;
      
    } catch (error) {
      console.log(`  ❌ Error en ${emp.nombre}: ${error.message}`);
    }
  }
  
  console.log(`  ✅ ${exitosos} empleados cargados exitosamente`);
}

async function verificarCarga() {
  console.log('\n🔍 Verificando carga...');
  
  const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM empleados');
  const { rows: muestra } = await client.query('SELECT * FROM empleados ORDER BY id ASC LIMIT 5');
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`  👨‍💼 Total empleados: ${count}`);
  
  console.log(`\n🔗 MUESTRA:`);
  muestra.forEach(e => {
    console.log(`  ID ${e.id}: ${e.nombre} - ${e.cargo} (${e.gerencia})`);
  });
}

async function main() {
  try {
    console.log('🚀 CARGANDO EMPLEADOS\n');
    
    // Conectar a la base de datos
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Leer el archivo CSV de empleados desde su ubicación original
    const csvPath = path.join(__dirname, 'backend', 'excel-templates', '02_empleados.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const empleados = parseCSV(csvContent);
    
    console.log(`📄 Archivo leído: ${empleados.length} empleados encontrados\n`);
    
    // 1. Limpiar datos existentes
    await limpiarDatos();
    
    // 2. Cargar empleados
    await cargarEmpleados(empleados);
    
    // 3. Verificar resultado
    await verificarCarga();
    
    console.log('\n✅ CARGA DE EMPLEADOS COMPLETADA! 🎉');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

main(); 