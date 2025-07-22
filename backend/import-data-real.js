const { PrismaClient } = require("./generated/prisma");
const fs = require("fs");

const prisma = new PrismaClient();

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  Archivo no encontrado: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter(line => line.trim());
  
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(",").map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    
    data.push(row);
  }

  return data;
}

async function importData() {
  try {
    console.log(" IMPORTANDO DATA REAL");
    
         // Clasificaciones
     console.log(" Cargando clasificaciones...");
     const clasificaciones = parseCSV("../clasificaciones_carga.csv");
    let creadas = 0;
    
    for (const c of clasificaciones) {
      try {
        await prisma.clasificacion.create({
          data: {
            familia: c.familia,
            sub_familia: c.sub_familia,
            tipo_equipo: c.tipo_equipo,
            vida_util: c.vida_util,
            valor_reposicion: parseFloat(c.valor_reposicion) || 0
          }
        });
        console.log(`   ${c.tipo_equipo}`);
        creadas++;
      } catch (e) {
        if (e.code === "P2002") {
          console.log(`    Ya existe: ${c.tipo_equipo}`);
        } else {
          console.log(`   Error: ${c.tipo_equipo} - ${e.message}`);
        }
      }
    }
    console.log(` Clasificaciones: ${creadas} nuevas\n`);

         // Empleados
     console.log(" Cargando empleados...");
     const empleados = parseCSV("../empleados_carga.csv");
    creadas = 0;
    
    for (const e of empleados) {
      try {
        await prisma.empleado.create({
          data: {
            nombre: e.nombre,
            cargo: e.cargo,
            gerencia: e.gerencia,
            sede: e.sede
          }
        });
        console.log(`   ${e.nombre}`);
        creadas++;
      } catch (err) {
        if (err.code === "P2002") {
          console.log(`    Ya existe: ${e.nombre}`);
        } else {
          console.log(`   Error: ${e.nombre} - ${err.message}`);
        }
      }
    }
    console.log(` Empleados: ${creadas} nuevos\n`);

         // Inventario
     console.log(" Cargando inventario...");
     const inventory = parseCSV("../inventario_carga.csv");
    
    // Mapas de referencia
    const clasMap = new Map(
      (await prisma.clasificacion.findMany()).map(c => [c.tipo_equipo, c.id])
    );
    const empMap = new Map(
      (await prisma.empleado.findMany()).map(e => [e.nombre, e.id])
    );
    
    console.log(` Referencias: ${clasMap.size} clasificaciones, ${empMap.size} empleados`);
    
    creadas = 0;
    let errores = 0;
    
    for (const item of inventory) {
      try {
        const clasId = clasMap.get(item.tipo_equipo_ref);
        const empId = empMap.get(item.empleado_ref);
        
        if (!clasId) {
          console.log(`   Clasificación no encontrada: ${item.tipo_equipo_ref} para ${item.codigoEFC}`);
          errores++;
          continue;
        }
        
        if (!empId) {
          console.log(`   Empleado no encontrado: ${item.empleado_ref} para ${item.codigoEFC}`);
          errores++;
          continue;
        }

        await prisma.inventory.create({
          data: {
            codigoEFC: item.codigoEFC,
            marca: item.marca,
            modelo: item.modelo,
            descripcion: item.descripcion,
            serie: item.serie,
            procesador: item.procesador,
            anio: item.anio ? parseInt(item.anio) : null,
            ram: item.ram,
            discoDuro: item.discoDuro,
            sistemaOperativo: item.sistemaOperativo,
            status: item.status,
            estado: item.estado,
            ubicacionEquipo: item.ubicacionEquipo,
            qUsuarios: item.qUsuarios ? parseInt(item.qUsuarios) : null,
            condicion: item.condicion,
            repotenciadas: item.repotenciadas === "TRUE",
            clasificacionObsolescencia: item.clasificacionObsolescencia,
            clasificacionRepotenciadas: item.clasificacionRepotenciadas,
            motivoCompra: item.motivoCompra,
            proveedor: item.proveedor,
            factura: item.factura,
            anioCompra: item.anioCompra ? parseInt(item.anioCompra) : null,
            observaciones: item.observaciones,
            fecha_compra: item.fecha_compra ? new Date(item.fecha_compra) : null,
            precioUnitarioSinIgv: item.precioUnitarioSinIgv,
            clasificacionId: clasId,
            empleadoId: empId
          }
        });
        console.log(`   ${item.codigoEFC} - ${item.marca} ${item.modelo}`);
        creadas++;
      } catch (err) {
        console.log(`   Error: ${item.codigoEFC} - ${err.message}`);
        errores++;
      }
    }
    console.log(` Inventario: ${creadas} equipos, ${errores} errores\n`);

    // Resumen final
    const totales = {
      clasificaciones: await prisma.clasificacion.count(),
      empleados: await prisma.empleado.count(),
      inventory: await prisma.inventory.count()
    };

    console.log(" IMPORTACIÓN COMPLETADA");
    console.log(` TOTALES EN BD:`);
    console.log(`   - ${totales.clasificaciones} clasificaciones`);
    console.log(`   - ${totales.empleados} empleados`);
    console.log(`   - ${totales.inventory} equipos`);

  } catch (error) {
    console.error(" Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
