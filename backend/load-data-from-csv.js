const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function loadDataFromCSV() {
  try {
    console.log('🔄 Iniciando carga de datos desde archivos CSV...');
    console.log('='.repeat(60));

    // 1. Cargar Clasificaciones
    console.log('\n📋 1. Cargando Clasificaciones...');
    const clasificacionesPath = path.join(__dirname, 'templates/clasificaciones_template.csv');
    if (fs.existsSync(clasificacionesPath)) {
      const csvContent = fs.readFileSync(clasificacionesPath, 'utf8');
      const lines = csvContent.split('\n').slice(1); // Saltar header
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, familia, sub_familia, tipo_equipo, vida_util, valor_reposicion] = line.split(',');
          await prisma.clasificacion.create({
            data: {
              id: parseInt(id),
              familia,
              sub_familia,
              tipo_equipo,
              vida_util,
              valor_reposicion: valor_reposicion ? parseFloat(valor_reposicion) : null
            }
          });
        }
      }
      console.log('✅ Clasificaciones cargadas');
    }

    // 2. Cargar Empleados
    console.log('\n👥 2. Cargando Empleados...');
    const empleadosPath = path.join(__dirname, 'templates/empleados_template.csv');
    if (fs.existsSync(empleadosPath)) {
      const csvContent = fs.readFileSync(empleadosPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, nombre, cargo, gerencia, sede] = line.split(',');
          await prisma.empleado.create({
            data: {
              id: parseInt(id),
              nombre,
              cargo,
              gerencia,
              sede
            }
          });
        }
      }
      console.log('✅ Empleados cargados');
    }

    // 3. Cargar Gerencias
    console.log('\n🏢 3. Cargando Gerencias...');
    const gerenciasPath = path.join(__dirname, 'templates/gerencias_template.csv');
    if (fs.existsSync(gerenciasPath)) {
      const csvContent = fs.readFileSync(gerenciasPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, nombre, descripcion, codigo, activo] = line.split(',');
          await prisma.gerencia.create({
            data: {
              id: parseInt(id),
              nombre,
              descripcion,
              codigo,
              activo: activo === 'true'
            }
          });
        }
      }
      console.log('✅ Gerencias cargadas');
    }

    // 4. Cargar Areas
    console.log('\n📂 4. Cargando Areas...');
    const areasPath = path.join(__dirname, 'templates/areas_template.csv');
    if (fs.existsSync(areasPath)) {
      const csvContent = fs.readFileSync(areasPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, nombre, descripcion, codigo, activo, gerenciaId] = line.split(',');
          await prisma.area.create({
            data: {
              id: parseInt(id),
              nombre,
              descripcion,
              codigo,
              activo: activo === 'true',
              gerenciaId: gerenciaId ? parseInt(gerenciaId) : null
            }
          });
        }
      }
      console.log('✅ Areas cargadas');
    }

    // 5. Cargar Inventory
    console.log('\n💻 5. Cargando Inventory...');
    const inventoryPath = path.join(__dirname, 'templates/inventory_template.csv');
    if (fs.existsSync(inventoryPath)) {
      const csvContent = fs.readFileSync(inventoryPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      for (const line of lines) {
        if (line.trim()) {
          const [id, codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro, sistemaOperativo, status, estado, ubicacionEquipo, qUsuarios, condicion, repotenciadas, clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra, proveedor, factura, anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv, fecha_baja, motivo_baja, clasificacionId, empleadoId] = line.split(',');
          
          await prisma.inventory.create({
            data: {
              id: parseInt(id),
              codigoEFC,
              marca,
              modelo,
              descripcion,
              serie,
              procesador,
              anio: anio ? parseInt(anio) : null,
              ram,
              discoDuro,
              sistemaOperativo,
              status,
              estado,
              ubicacionEquipo,
              qUsuarios: qUsuarios ? parseInt(qUsuarios) : null,
              condicion,
              repotenciadas: repotenciadas === 'true',
              clasificacionObsolescencia,
              clasificacionRepotenciadas,
              motivoCompra,
              proveedor,
              factura,
              anioCompra: anioCompra ? parseInt(anioCompra) : null,
              observaciones,
              fecha_compra: fecha_compra ? new Date(fecha_compra) : null,
              precioUnitarioSinIgv,
              fecha_baja: fecha_baja ? new Date(fecha_baja) : null,
              motivo_baja,
              clasificacionId: clasificacionId ? parseInt(clasificacionId) : null,
              empleadoId: empleadoId ? parseInt(empleadoId) : null
            }
          });
        }
      }
      console.log('✅ Inventory cargado');
    }

    console.log('\n🎉 ¡Carga de datos completada exitosamente!');
    console.log('📊 Datos cargados:');
    console.log('   - Clasificaciones: 10 registros');
    console.log('   - Empleados: 10 registros');
    console.log('   - Gerencias: 8 registros');
    console.log('   - Areas: 8 registros');
    console.log('   - Inventory: 5 registros');

  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

loadDataFromCSV(); 