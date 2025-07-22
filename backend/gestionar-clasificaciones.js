const { PrismaClient } = require("./generated/prisma");
const fs = require("fs");

const prisma = new PrismaClient();

// Función para mostrar todas las clasificaciones con sus IDs
async function listarClasificaciones() {
  console.log("\n=== CLASIFICACIONES EXISTENTES ===");
  const clasificaciones = await prisma.clasificacion.findMany({
    orderBy: { id: 'asc' }
  });
  
  if (clasificaciones.length === 0) {
    console.log("No hay clasificaciones registradas.");
    return;
  }
  
  console.log("ID | Familia | Sub-Familia | Tipo Equipo | Vida Útil | Valor Reposición");
  console.log("---|---------|-------------|-------------|-----------|------------------");
  
  clasificaciones.forEach(c => {
    console.log(`${c.id.toString().padEnd(2)} | ${(c.familia || '').padEnd(7)} | ${(c.sub_familia || '').padEnd(11)} | ${(c.tipo_equipo || '').padEnd(11)} | ${(c.vida_util || '').padEnd(9)} | ${c.valor_reposicion || 0}`);
  });
  
  console.log(`\nTotal: ${clasificaciones.length} clasificaciones`);
  return clasificaciones;
}

// Función para agregar clasificaciones desde CSV
async function cargarClasificacionesCSV(archivo = '../clasificaciones_carga.csv') {
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
  let agregadas = 0;
  let existentes = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    
    try {
      await prisma.clasificacion.create({
        data: {
          familia: row.familia,
          sub_familia: row.sub_familia,
          tipo_equipo: row.tipo_equipo,
          vida_util: row.vida_util,
          valor_reposicion: parseFloat(row.valor_reposicion) || 0
        }
      });
      console.log(`✅ Agregada: ${row.tipo_equipo}`);
      agregadas++;
    } catch (error) {
      if (error.code === "P2002") {
        console.log(`⚠️  Ya existe: ${row.tipo_equipo}`);
        existentes++;
      } else {
        console.log(`❌ Error: ${row.tipo_equipo} - ${error.message}`);
      }
    }
  }
  
  console.log(`\n📊 Resultado: ${agregadas} agregadas, ${existentes} ya existían`);
}

// Función para agregar una clasificación individual
async function agregarClasificacion(familia, subFamilia, tipoEquipo, vidaUtil, valorReposicion) {
  try {
    const nueva = await prisma.clasificacion.create({
      data: {
        familia,
        sub_familia: subFamilia,
        tipo_equipo: tipoEquipo,
        vida_util: vidaUtil,
        valor_reposicion: parseFloat(valorReposicion) || 0
      }
    });
    console.log(`✅ Clasificación creada con ID: ${nueva.id}`);
    console.log(`   ${nueva.familia} > ${nueva.sub_familia} > ${nueva.tipo_equipo}`);
    return nueva;
  } catch (error) {
    if (error.code === "P2002") {
      console.log(`❌ Ya existe una clasificación con ese tipo de equipo: ${tipoEquipo}`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Función para buscar clasificaciones
async function buscarClasificacion(termino) {
  console.log(`\n=== BUSCANDO: "${termino}" ===`);
  const resultados = await prisma.clasificacion.findMany({
    where: {
      OR: [
        { familia: { contains: termino, mode: 'insensitive' } },
        { sub_familia: { contains: termino, mode: 'insensitive' } },
        { tipo_equipo: { contains: termino, mode: 'insensitive' } }
      ]
    },
    orderBy: { id: 'asc' }
  });
  
  if (resultados.length === 0) {
    console.log("No se encontraron resultados.");
    return [];
  }
  
  console.log("ID | Familia | Sub-Familia | Tipo Equipo | Valor");
  console.log("---|---------|-------------|-------------|-------");
  resultados.forEach(c => {
    console.log(`${c.id.toString().padEnd(2)} | ${(c.familia || '').padEnd(7)} | ${(c.sub_familia || '').padEnd(11)} | ${(c.tipo_equipo || '').padEnd(11)} | ${c.valor_reposicion || 0}`);
  });
  
  return resultados;
}

// Función principal
async function main() {
  try {
    const args = process.argv.slice(2);
    const comando = args[0];
    
    switch (comando) {
      case 'listar':
        await listarClasificaciones();
        break;
        
      case 'cargar':
        const archivo = args[1] || '../clasificaciones_carga.csv';
        await cargarClasificacionesCSV(archivo);
        break;
        
      case 'agregar':
        if (args.length < 6) {
          console.log("❌ Uso: node gestionar-clasificaciones.js agregar <familia> <sub_familia> <tipo_equipo> <vida_util> <valor_reposicion>");
          console.log("   Ejemplo: node gestionar-clasificaciones.js agregar 'Computadora' 'Laptop' 'Laptop Gaming' '4 años' 2500");
          break;
        }
        await agregarClasificacion(args[1], args[2], args[3], args[4], args[5]);
        break;
        
      case 'buscar':
        if (args.length < 2) {
          console.log("❌ Uso: node gestionar-clasificaciones.js buscar <termino>");
          console.log("   Ejemplo: node gestionar-clasificaciones.js buscar laptop");
          break;
        }
        await buscarClasificacion(args[1]);
        break;
        
      default:
        console.log("\n🔧 GESTIÓN DE CLASIFICACIONES");
        console.log("=============================");
        console.log("Comandos disponibles:");
        console.log("  listar                     - Mostrar todas las clasificaciones con IDs");
        console.log("  cargar [archivo.csv]       - Cargar desde CSV (default: template_clasificaciones.csv)");
        console.log("  agregar <datos>            - Agregar una clasificación individual");
        console.log("  buscar <termino>           - Buscar clasificaciones por término");
        console.log("\nEjemplos:");
        console.log("  node gestionar-clasificaciones.js listar");
        console.log("  node gestionar-clasificaciones.js cargar mi_clasificaciones.csv");
        console.log("  node gestionar-clasificaciones.js buscar laptop");
        console.log("  node gestionar-clasificaciones.js agregar 'Servidor' 'Rack' 'Servidor Dell' '7 años' 8000");
    }
    
  } catch (error) {
    console.error("❌ Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 