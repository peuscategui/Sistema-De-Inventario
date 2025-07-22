const { PrismaClient } = require("./generated/prisma");
const fs = require("fs");

const prisma = new PrismaClient();

// Función para mostrar todos los empleados con sus IDs
async function listarEmpleados() {
  console.log("\n=== EMPLEADOS EXISTENTES ===");
  const empleados = await prisma.empleado.findMany({
    orderBy: { id: 'asc' }
  });
  
  if (empleados.length === 0) {
    console.log("No hay empleados registrados.");
    return;
  }
  
  console.log("ID | Nombre | Cargo | Gerencia | Sede");
  console.log("---|--------|-------|----------|------");
  
  empleados.forEach(e => {
    const nombre = (e.nombre || '').substring(0, 25);
    const cargo = (e.cargo || '').substring(0, 20);
    const gerencia = (e.gerencia || '').substring(0, 15);
    const sede = (e.sede || '').substring(0, 12);
    console.log(`${e.id.toString().padStart(2)} | ${nombre.padEnd(25)} | ${cargo.padEnd(20)} | ${gerencia.padEnd(15)} | ${sede}`);
  });
  
  console.log(`\nTotal: ${empleados.length} empleados`);
  return empleados;
}

// Función para cargar empleados desde CSV
async function cargarEmpleadosCSV(archivo = '../empleados_carga.csv') {
  if (!fs.existsSync(archivo)) {
    console.log(`❌ Archivo no encontrado: ${archivo}`);
    return;
  }
  
  console.log(`\n=== CARGANDO DESDE ${archivo} ===`);
  const content = fs.readFileSync(archivo, "utf-8");
  const lines = content.split("\n").filter(line => line.trim());
  
  if (lines.length < 2) {
    console.log("❌ Archivo vacío o sin datos");
    return;
  }
  
  const headers = lines[0].split(",").map(h => h.trim());
  let agregados = 0;
  let existentes = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    
    try {
      await prisma.empleado.create({
        data: {
          nombre: row.nombre,
          cargo: row.cargo,
          gerencia: row.gerencia,
          sede: row.sede
        }
      });
      console.log(`✅ Agregado: ${row.nombre}`);
      agregados++;
    } catch (error) {
      if (error.code === "P2002") {
        console.log(`⚠️  Ya existe: ${row.nombre}`);
        existentes++;
      } else {
        console.log(`❌ Error: ${row.nombre} - ${error.message}`);
      }
    }
  }
  
  console.log(`\n📊 Resultado: ${agregados} agregados, ${existentes} ya existían`);
}

// Función para agregar un empleado individual
async function agregarEmpleado(nombre, cargo, gerencia, sede) {
  try {
    const nuevo = await prisma.empleado.create({
      data: {
        nombre,
        cargo,
        gerencia,
        sede
      }
    });
    console.log(`✅ Empleado creado con ID: ${nuevo.id}`);
    console.log(`   ${nuevo.nombre} - ${nuevo.cargo} (${nuevo.gerencia})`);
    return nuevo;
  } catch (error) {
    if (error.code === "P2002") {
      console.log(`❌ Ya existe un empleado con ese nombre: ${nombre}`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Función para buscar empleados
async function buscarEmpleado(termino) {
  console.log(`\n=== BUSCANDO: "${termino}" ===`);
  const resultados = await prisma.empleado.findMany({
    where: {
      OR: [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { cargo: { contains: termino, mode: 'insensitive' } },
        { gerencia: { contains: termino, mode: 'insensitive' } },
        { sede: { contains: termino, mode: 'insensitive' } }
      ]
    },
    orderBy: { id: 'asc' }
  });
  
  if (resultados.length === 0) {
    console.log("No se encontraron resultados.");
    return [];
  }
  
  console.log("ID | Nombre | Cargo | Gerencia | Sede");
  console.log("---|--------|-------|----------|------");
  resultados.forEach(e => {
    const nombre = (e.nombre || '').substring(0, 25);
    const cargo = (e.cargo || '').substring(0, 20);
    const gerencia = (e.gerencia || '').substring(0, 15);
    const sede = (e.sede || '').substring(0, 12);
    console.log(`${e.id.toString().padStart(2)} | ${nombre.padEnd(25)} | ${cargo.padEnd(20)} | ${gerencia.padEnd(15)} | ${sede}`);
  });
  
  return resultados;
}

// Función para actualizar un empleado
async function actualizarEmpleado(id, nombre, cargo, gerencia, sede) {
  try {
    const actualizado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre || undefined,
        cargo: cargo || undefined,
        gerencia: gerencia || undefined,
        sede: sede || undefined
      }
    });
    console.log(`✅ Empleado actualizado (ID: ${actualizado.id})`);
    console.log(`   ${actualizado.nombre} - ${actualizado.cargo} (${actualizado.gerencia})`);
    return actualizado;
  } catch (error) {
    if (error.code === "P2025") {
      console.log(`❌ No se encontró empleado con ID: ${id}`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Función para mostrar empleados por gerencia
async function listarPorGerencia(gerencia) {
  console.log(`\n=== EMPLEADOS DE: ${gerencia} ===`);
  const empleados = await prisma.empleado.findMany({
    where: {
      gerencia: { contains: gerencia, mode: 'insensitive' }
    },
    orderBy: { nombre: 'asc' }
  });
  
  if (empleados.length === 0) {
    console.log("No se encontraron empleados en esa gerencia.");
    return [];
  }
  
  console.log("ID | Nombre | Cargo | Sede");
  console.log("---|--------|-------|------");
  empleados.forEach(e => {
    const nombre = (e.nombre || '').substring(0, 25);
    const cargo = (e.cargo || '').substring(0, 20);
    const sede = (e.sede || '').substring(0, 15);
    console.log(`${e.id.toString().padStart(2)} | ${nombre.padEnd(25)} | ${cargo.padEnd(20)} | ${sede}`);
  });
  
  console.log(`\nTotal: ${empleados.length} empleados`);
  return empleados;
}

// Función principal
async function main() {
  try {
    const args = process.argv.slice(2);
    const comando = args[0];
    
    switch (comando) {
      case 'listar':
        await listarEmpleados();
        break;
        
      case 'cargar':
        const archivo = args[1] || '../empleados_carga.csv';
        await cargarEmpleadosCSV(archivo);
        break;
        
      case 'agregar':
        if (args.length < 5) {
          console.log("❌ Uso: node gestionar-empleados.js agregar <nombre> <cargo> <gerencia> <sede>");
          console.log("   Ejemplo: node gestionar-empleados.js agregar 'Juan Pérez' 'Analista' 'Sistemas' 'Surquillo'");
          break;
        }
        await agregarEmpleado(args[1], args[2], args[3], args[4]);
        break;
        
      case 'buscar':
        if (args.length < 2) {
          console.log("❌ Uso: node gestionar-empleados.js buscar <termino>");
          console.log("   Ejemplo: node gestionar-empleados.js buscar juan");
          break;
        }
        await buscarEmpleado(args[1]);
        break;
        
      case 'actualizar':
        if (args.length < 3) {
          console.log("❌ Uso: node gestionar-empleados.js actualizar <id> [nombre] [cargo] [gerencia] [sede]");
          console.log("   Ejemplo: node gestionar-empleados.js actualizar 5 'Juan Carlos Pérez' 'Senior Analyst'");
          console.log("   Nota: Solo incluye los campos que quieres cambiar");
          break;
        }
        await actualizarEmpleado(args[1], args[2], args[3], args[4], args[5]);
        break;
        
      case 'gerencia':
        if (args.length < 2) {
          console.log("❌ Uso: node gestionar-empleados.js gerencia <nombre_gerencia>");
          console.log("   Ejemplo: node gestionar-empleados.js gerencia sistemas");
          break;
        }
        await listarPorGerencia(args[1]);
        break;
        
      default:
        console.log("\n👥 GESTIÓN DE EMPLEADOS");
        console.log("=======================");
        console.log("Comandos disponibles:");
        console.log("  listar                     - Mostrar todos los empleados con IDs");
        console.log("  cargar [archivo.csv]       - Cargar desde CSV (default: template_empleados.csv)");
        console.log("  agregar <datos>            - Agregar un empleado individual");
        console.log("  buscar <termino>           - Buscar empleados por término");
        console.log("  actualizar <id> <datos>    - Actualizar empleado existente");
        console.log("  gerencia <nombre>          - Listar empleados por gerencia");
        console.log("\nEjemplos:");
        console.log("  node gestionar-empleados.js listar");
        console.log("  node gestionar-empleados.js cargar mi_empleados.csv");
        console.log("  node gestionar-empleados.js buscar juan");
        console.log("  node gestionar-empleados.js agregar 'María García' 'Jefe de Área' 'Finanzas' 'Chorrillos'");
        console.log("  node gestionar-empleados.js actualizar 15 'María Elena García'");
        console.log("  node gestionar-empleados.js gerencia sistemas");
    }
    
  } catch (error) {
    console.error("❌ Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 