const { PrismaClient } = require('./backend/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || null;
    });
    return obj;
  });
}

async function limpiarTablas() {
  console.log('🧹 Limpiando tablas...');
  
  try {
    // Eliminar en orden correcto (por las foreign keys)
    await prisma.inventory.deleteMany({});
    console.log('  ✅ Tabla inventory limpiada');
    
    await prisma.empleado.deleteMany({});
    console.log('  ✅ Tabla empleado limpiada');
    
    await prisma.clasificacion.deleteMany({});
    console.log('  ✅ Tabla clasificacion limpiada');
    
  } catch (error) {
    console.error('❌ Error limpiando tablas:', error);
    throw error;
  }
}

async function cargarClasificaciones() {
  console.log('📋 Cargando clasificaciones...');
  
  try {
    const csvContent = fs.readFileSync('clasificaciones_carga_con_id.csv', 'utf8');
    const clasificaciones = parseCSV(csvContent);
    
    for (const item of clasificaciones) {
      await prisma.clasificacion.create({
        data: {
          id: parseInt(item.id),
          familia: item.familia,
          sub_familia: item.sub_familia,
          tipo_equipo: item.tipo_equipo,
          vida_util: item.vida_util,
          valor_reposicion: item.valor_reposicion ? parseFloat(item.valor_reposicion) : null
        }
      });
    }
    
    console.log(`  ✅ ${clasificaciones.length} clasificaciones cargadas`);
    return clasificaciones.length;
  } catch (error) {
    console.error('❌ Error cargando clasificaciones:', error);
    throw error;
  }
}

async function cargarEmpleados() {
  console.log('👨‍💼 Cargando empleados...');
  
  try {
    const csvContent = fs.readFileSync('empleados_carga_con_id.csv', 'utf8');
    const empleados = parseCSV(csvContent);
    
    for (const item of empleados) {
      await prisma.empleado.create({
        data: {
          id: parseInt(item.id),
          nombre: item.nombre,
          cargo: item.cargo,
          gerencia: item.gerencia,
          sede: item.sede
        }
      });
    }
    
    console.log(`  ✅ ${empleados.length} empleados cargados`);
    return empleados.length;
  } catch (error) {
    console.error('❌ Error cargando empleados:', error);
    throw error;
  }
}

async function cargarInventario() {
  console.log('📦 Cargando inventario...');
  
  try {
    const csvContent = fs.readFileSync('inventario_carga_con_id.csv', 'utf8');
    const inventario = parseCSV(csvContent);
    
    for (const item of inventario) {
      const data = {
        id: parseInt(item.id),
        codigoEFC: item.codigo_efc,
        marca: item.marca,
        modelo: item.modelo,
        serie: item.serie,
        status: item.status || 'libre',
        observaciones: item.observaciones,
        precioUnitarioSinIgv: item.precio_unitario_sin_igv ? item.precio_unitario_sin_igv.toString() : null,
        fecha_compra: item.fecha_compra ? new Date(item.fecha_compra + 'T00:00:00.000Z') : null
      };
      
      // Agregar relaciones si existen
      if (item.clasificacion_id) {
        data.clasificacionId = parseInt(item.clasificacion_id);
      }
      
      if (item.empleado_id) {
        data.empleadoId = parseInt(item.empleado_id);
      }
      
      await prisma.inventory.create({ data });
    }
    
    console.log(`  ✅ ${inventario.length} items de inventario cargados`);
    return inventario.length;
  } catch (error) {
    console.error('❌ Error cargando inventario:', error);
    throw error;
  }
}

async function ajustarSecuencias() {
  console.log('🔧 Ajustando secuencias de PostgreSQL...');
  
  try {
    // Obtener los máximos IDs de cada tabla
    const maxClasificacion = await prisma.clasificacion.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    const maxEmpleado = await prisma.empleado.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    const maxInventory = await prisma.inventory.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    // Ajustar secuencias para que continúen desde el siguiente número
    if (maxClasificacion) {
      const nextId = maxClasificacion.id + 1;
      await prisma.$executeRaw`SELECT setval('clasificacion_id_seq', ${nextId})`;
      console.log(`  ✅ Secuencia clasificacion ajustada a ${nextId}`);
    }
    
    if (maxEmpleado) {
      const nextId = maxEmpleado.id + 1;
      await prisma.$executeRaw`SELECT setval('empleado_id_seq', ${nextId})`;
      console.log(`  ✅ Secuencia empleado ajustada a ${nextId}`);
    }
    
    if (maxInventory) {
      const nextId = maxInventory.id + 1;
      await prisma.$executeRaw`SELECT setval('inventory_id_seq', ${nextId})`;
      console.log(`  ✅ Secuencia inventory ajustada a ${nextId}`);
    }
    
  } catch (error) {
    console.error('❌ Error ajustando secuencias:', error);
    throw error;
  }
}

async function verificarCarga() {
  console.log('🔍 Verificando carga...');
  
  try {
    const totalClasificaciones = await prisma.clasificacion.count();
    const totalEmpleados = await prisma.empleado.count();
    const totalInventario = await prisma.inventory.count();
    
    console.log(`\n📊 RESUMEN DE CARGA:`);
    console.log(`  📋 Clasificaciones: ${totalClasificaciones}`);
    console.log(`  👨‍💼 Empleados: ${totalEmpleados}`);
    console.log(`  📦 Inventario: ${totalInventario}`);
    
    // Verificar algunas relaciones
    const inventarioConRelaciones = await prisma.inventory.findMany({
      include: {
        clasificacion: { select: { id: true, tipo_equipo: true } },
        empleado: { select: { id: true, nombre: true } }
      },
      take: 3
    });
    
    console.log(`\n🔗 MUESTRA DE RELACIONES:`);
    inventarioConRelaciones.forEach(item => {
      console.log(`  • ${item.codigoEFC} - ${item.clasificacion?.tipo_equipo || 'Sin clasificación'} - ${item.empleado?.nombre || 'Sin empleado'}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando carga:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 INICIANDO CARGA DE DATOS CON IDs ESPECÍFICOS\n');
    
    await limpiarTablas();
    console.log('');
    
    await cargarClasificaciones();
    console.log('');
    
    await cargarEmpleados();
    console.log('');
    
    await cargarInventario();
    console.log('');
    
    await ajustarSecuencias();
    console.log('');
    
    await verificarCarga();
    
    console.log('\n✅ CARGA COMPLETADA EXITOSAMENTE! 🎉');
    console.log('\n📝 Los nuevos registros que crees seguirán el correlativo automáticamente.');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA CARGA:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main }; 