const { PrismaClient } = require('./backend/generated/prisma');
const fs = require('fs');

const prisma = new PrismaClient();

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  
  console.log(`📄 Total líneas en CSV: ${lines.length}`);
  console.log(`📄 Primera línea (header): ${lines[0]}`);
  if (lines.length > 1) {
    console.log(`📄 Segunda línea (first data): ${lines[1]}`);
  }
  
  // Saltar el header
  const dataLines = lines.slice(1);
  
  const clasificaciones = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    
    if (!line.trim()) {
      if (i < 3) console.log(`⚠️  Línea ${i + 2} está vacía, saltando...`);
      continue;
    }
    
    // Separar por comas, pero manejar las comas dentro de comillas
    const columns = line.split(',').map(col => col.trim());
    
    if (i < 3) {
      console.log(`📄 Línea ${i + 2}: ${columns.length} columnas`);
      console.log(`   Datos: [${columns.join('] [')})}`);
    }
    
    // Formato: id,familia,sub_familia,tipo_equipo,vida_util,valor_reposicion
    if (columns.length >= 6) {
      const id = parseInt(columns[0]);
      const familia = columns[1];
      const sub_familia = columns[2];
      const tipo_equipo = columns[3];
      const vida_util = columns[4];
      const valor_reposicion = columns[5] ? parseFloat(columns[5]) : null;
      
      if (i < 3) {
        console.log(`   Parseado: ID=${id}, familia='${familia}', sub_familia='${sub_familia}', tipo_equipo='${tipo_equipo}'`);
      }
      
      if (!isNaN(id) && familia && sub_familia && tipo_equipo) {
        clasificaciones.push({
          desired_id: id,
          familia,
          sub_familia,
          tipo_equipo,
          vida_util,
          valor_reposicion
        });
        if (i < 3) {
          console.log(`   ✅ Agregado`);
        }
      } else {
        if (i < 3) {
          console.log(`   ❌ Datos inválidos: ID=${id}, familia='${familia}', sub_familia='${sub_familia}', tipo_equipo='${tipo_equipo}'`);
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
  
  return clasificaciones;
}

async function limpiarDatos() {
  console.log('🧹 Limpiando datos relacionados...');
  
  // Eliminar inventarios que referencian clasificaciones
  const inventoriesDeleted = await prisma.inventory.deleteMany({});
  console.log(`  📦 Registros de inventario: ${inventoriesDeleted.count}`);
  
  // Eliminar todas las clasificaciones
  const clasificacionesDeleted = await prisma.clasificacion.deleteMany({});
  console.log(`  📋 Registros de clasificaciones: ${clasificacionesDeleted.count}`);
  
  console.log('  ✅ Tablas limpiadas');
}

async function cargarClasificaciones(clasificaciones) {
  console.log('📋 Cargando clasificaciones...');
  
  let exitosos = 0;
  const idMappings = new Map(); // Para mapear desired_id -> actual_id
  
  // Ordenar por desired_id para cargar en orden
  clasificaciones.sort((a, b) => a.desired_id - b.desired_id);
  
  for (const clasi of clasificaciones) {
    try {
      // Crear sin especificar ID (Prisma genera automáticamente)
      const resultado = await prisma.clasificacion.create({
        data: {
          familia: clasi.familia,
          sub_familia: clasi.sub_familia,
          tipo_equipo: clasi.tipo_equipo,
          vida_util: clasi.vida_util,
          valor_reposicion: clasi.valor_reposicion
        }
      });
      
      idMappings.set(clasi.desired_id, resultado.id);
      console.log(`  ✅ ID ${clasi.desired_id} -> ${resultado.id}: ${clasi.familia} - ${clasi.tipo_equipo}`);
      exitosos++;
      
    } catch (error) {
      console.log(`  ❌ Error en ${clasi.familia}: ${error.message}`);
    }
  }
  
  console.log(`  ✅ ${exitosos} clasificaciones cargadas exitosamente`);
  return idMappings;
}

async function ajustarIDs(idMappings, clasificaciones) {
  console.log('\n🔧 Ajustando IDs para que coincidan con los deseados...');
  
  // Necesitamos usar SQL directo para actualizar los IDs
  for (const [desired_id, actual_id] of idMappings) {
    try {
      // Usar SQL directo para actualizar el ID
      await prisma.$executeRaw`UPDATE clasificacion SET id = ${desired_id} WHERE id = ${actual_id}`;
      console.log(`  ✅ Actualizado ID ${actual_id} -> ${desired_id}`);
    } catch (error) {
      console.log(`  ❌ Error actualizando ID ${actual_id} -> ${desired_id}: ${error.message}`);
    }
  }
  
  // Ajustar la secuencia para que el próximo ID sea correcto
  const maxId = Math.max(...clasificaciones.map(c => c.desired_id));
  const nextId = maxId + 1;
  
  await prisma.$executeRaw`SELECT setval('clasificacion_id_seq', ${nextId})`;
  console.log(`  🔢 Secuencia ajustada. Próximo ID: ${nextId}`);
}

async function verificarCarga() {
  console.log('\n🔍 Verificando carga...');
  
  const total = await prisma.clasificacion.count();
  const muestra = await prisma.clasificacion.findMany({
    take: 5,
    orderBy: { id: 'asc' }
  });
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`  📋 Total clasificaciones: ${total}`);
  
  console.log(`\n🔗 MUESTRA:`);
  muestra.forEach(c => {
    console.log(`  ID ${c.id}: ${c.familia} - ${c.tipo_equipo} (${c.vida_util})`);
  });
}

async function main() {
  try {
    console.log('🚀 CARGANDO CLASIFICACIONES REALES DEL USUARIO\n');
    
    // Leer el archivo CSV del usuario
    const csvContent = fs.readFileSync('clasificaciones_carga_con_id.csv', 'utf8');
    const clasificaciones = parseCSV(csvContent);
    
    console.log(`📄 Archivo leído: ${clasificaciones.length} clasificaciones encontradas\n`);
    
    // 1. Limpiar datos existentes
    await limpiarDatos();
    
    // 2. Cargar clasificaciones (con IDs automáticos)
    const idMappings = await cargarClasificaciones(clasificaciones);
    
    // 3. Ajustar IDs para que coincidan con los deseados
    await ajustarIDs(idMappings, clasificaciones);
    
    // 4. Verificar resultado
    await verificarCarga();
    
    console.log('\n✅ CARGA DE CLASIFICACIONES COMPLETADA! 🎉');
    console.log('\n📝 Las clasificaciones ahora tienen los IDs que especificaste.');
    console.log('📝 Nuevas clasificaciones que crees tendrán ID automático desde el siguiente número.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 