const { PrismaClient } = require('./backend/generated/prisma');
const fs = require('fs');

const prisma = new PrismaClient();

function parseCSV(csvContent) {
  // Limpiar comillas sueltas mal cerradas
  const cleanedContent = csvContent
    .replace(/"/g, '') // Remover todas las comillas problemáticas
    .trim();
  
  const lines = cleanedContent.split('\n');
  
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
    
    // Formato: id,nombre,cargo,gerencia,gerencia_duplicada,sede
    if (columns.length >= 6) {
      const id = parseInt(columns[0]);
      const nombre = columns[1].trim();
      const cargo = columns[2].trim();
      const gerencia = columns[3].trim(); // Primera gerencia
      // Saltamos columns[4] que es la gerencia duplicada
      const sede = columns[5].trim();
      
      if (i < 3) {
        console.log(`   Parseado: ID=${id}, nombre='${nombre}', cargo='${cargo}', gerencia='${gerencia}', sede='${sede}'`);
      }
      
      // Validar que los datos son consistentes y no sean registros de equipos
      const esRegistroValido = !isNaN(id) && 
                              nombre && nombre.length > 1 && 
                              cargo && cargo.length > 1 && 
                              gerencia && gerencia.length > 5 && 
                              sede && sede.length > 3 &&
                              !nombre.toLowerCase().includes('cam') && 
                              !nombre.toLowerCase().includes('camera') &&
                              !nombre.toLowerCase().includes('dvr') &&
                              !nombre.toLowerCase().includes('nvr');
      
      if (esRegistroValido) {
        empleados.push({
          desired_id: id,
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
          console.log(`   ❌ Datos inválidos/equipo: ID=${id}, nombre='${nombre}', cargo='${cargo}'`);
        }
      }
    } else {
      if (i < 3) {
        console.log(`   ❌ Línea con ${columns.length} columnas (necesita >= 6)`);
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
    // Eliminar todos los empleados directamente
    const empleadosDeleted = await prisma.empleado.deleteMany({});
    console.log(`  👨‍💼 Registros de empleados eliminados: ${empleadosDeleted.count}`);
    console.log('  ✅ Tablas limpiadas');
  } catch (error) {
    console.log('  ⚠️  Error al limpiar datos, continuando...');
    console.log(`  📝 ${error.message}`);
  }
}

async function cargarEmpleados(empleados) {
  console.log('👨‍💼 Cargando empleados...');
  
  let exitosos = 0;
  const idMappings = new Map(); // Para mapear desired_id -> actual_id
  
  // Ordenar por desired_id para cargar en orden
  empleados.sort((a, b) => a.desired_id - b.desired_id);
  
  for (const emp of empleados) {
    try {
      // Crear sin especificar ID (Prisma genera automáticamente)
      const resultado = await prisma.empleado.create({
        data: {
          nombre: emp.nombre,
          cargo: emp.cargo,
          gerencia: emp.gerencia,
          sede: emp.sede
        }
      });
      
      idMappings.set(emp.desired_id, resultado.id);
      console.log(`  ✅ ID ${emp.desired_id} -> ${resultado.id}: ${emp.nombre} - ${emp.cargo}`);
      exitosos++;
      
    } catch (error) {
      console.log(`  ❌ Error en ${emp.nombre}: ${error.message}`);
    }
  }
  
  console.log(`  ✅ ${exitosos} empleados cargados exitosamente`);
  return idMappings;
}

async function ajustarIDs(idMappings, empleados) {
  console.log('\n🔧 Ajustando IDs para que coincidan con los deseados...');
  
  // Necesitamos usar SQL directo para actualizar los IDs
  for (const [desired_id, actual_id] of idMappings) {
    try {
      // Usar SQL directo para actualizar el ID
      await prisma.$executeRaw`UPDATE empleado SET id = ${desired_id} WHERE id = ${actual_id}`;
      console.log(`  ✅ Actualizado ID ${actual_id} -> ${desired_id}`);
    } catch (error) {
      console.log(`  ❌ Error actualizando ID ${actual_id} -> ${desired_id}: ${error.message}`);
    }
  }
  
  // Ajustar la secuencia para que el próximo ID sea correcto
  const maxId = Math.max(...empleados.map(e => e.desired_id));
  const nextId = maxId + 1;
  
  await prisma.$executeRaw`SELECT setval('empleado_id_seq', ${nextId})`;
  console.log(`  🔢 Secuencia ajustada. Próximo ID: ${nextId}`);
}

async function verificarCarga() {
  console.log('\n🔍 Verificando carga...');
  
  const total = await prisma.empleado.count();
  const muestra = await prisma.empleado.findMany({
    take: 5,
    orderBy: { id: 'asc' }
  });
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`  👨‍💼 Total empleados: ${total}`);
  
  console.log(`\n🔗 MUESTRA:`);
  muestra.forEach(e => {
    console.log(`  ID ${e.id}: ${e.nombre} - ${e.cargo} (${e.gerencia})`);
  });
}

async function main() {
  try {
    console.log('🚀 CARGANDO EMPLEADOS/COLABORADORES\n');
    
    // Leer el archivo CSV de empleados
    const csvContent = fs.readFileSync('empleados_carga_limpio.csv', 'utf8');
    const empleados = parseCSV(csvContent);
    
    console.log(`📄 Archivo leído: ${empleados.length} empleados encontrados\n`);
    
    // 1. Limpiar datos existentes
    await limpiarDatos();
    
    // 2. Cargar empleados (con IDs automáticos)
    const idMappings = await cargarEmpleados(empleados);
    
    // 3. Ajustar IDs para que coincidan con los deseados
    await ajustarIDs(idMappings, empleados);
    
    // 4. Verificar resultado
    await verificarCarga();
    
    console.log('\n✅ CARGA DE EMPLEADOS/COLABORADORES COMPLETADA! 🎉');
    console.log('\n📝 Los empleados ahora tienen los IDs que especificaste.');
    console.log('📝 Nuevos empleados que crees tendrán ID automático desde el siguiente número.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 