import { PrismaClient } from '../../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

function parseCSVLine(line: string, separator = ',') {
  // Maneja comillas y separadores dentro de campos
  const regex = /(?:"([^"]*(?:""[^"]*)*)")|([^"\%s]+)/g;
  const fields: string[] = [];
  let match;
  let lastIndex = 0;
  while ((match = /(?:"([^"]*(?:""[^"]*)*)")|([^",]+)/g.exec(line.substring(lastIndex)))) {
    fields.push(match[1] || match[2] || '');
    lastIndex += match[0].length + 1;
    if (lastIndex >= line.length) break;
  }
  return fields.length ? fields : line.split(separator);
}

function parseCSV(content: string) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('El archivo CSV no tiene datos.');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i] !== undefined ? values[i] : null;
    });
    return row;
  });
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Debes indicar el archivo CSV a importar.');
    process.exit(1);
  }
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../../', filePath);
  if (!fs.existsSync(absPath)) {
    console.error('Archivo no encontrado:', absPath);
    process.exit(1);
  }
  const content = fs.readFileSync(absPath, 'utf-8');
  const rows = parseCSV(content);
  
  // Mostrar información previa a la importación
  console.log('Archivo CSV a importar:', absPath);
  console.log('Primeros 3 registros:');
  console.log(JSON.stringify(rows.slice(0, 3), null, 2));
  
  let agregados = 0;
  let existentes = 0;
  for (const item of rows) {
    try {
      // Mapeo de campos básicos
      const data: any = {
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
        repotenciadas: item.repotenciadas === 'TRUE',
        clasificacionObsolescencia: item.clasificacionObsolescencia,
        clasificacionRepotenciadas: item.clasificacionRepotenciadas,
        motivoCompra: item.motivoCompra,
        proveedor: item.proveedor,
        factura: item.factura,
        anioCompra: item.anioCompra ? parseInt(item.anioCompra) : null,
        observaciones: item.observaciones,
        fecha_compra: (item.fecha_compra && !isNaN(Date.parse(item.fecha_compra))) ? new Date(item.fecha_compra) : null,
        precioUnitarioSinIgv: item.precioUnitarioSinIgv ? item.precioUnitarioSinIgv.toString() : null,
        clasificacionId: item.clasificacionId ? parseInt(item.clasificacionId) : undefined,
        empleadoId: item.empleadoId ? parseInt(item.empleadoId) : undefined,
      };
      // Elimina campos undefined
      Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
      await prisma.inventory.create({ data });
      agregados++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        existentes++;
      } else {
        console.error('Error en registro:', item.codigoEFC, error.message);
      }
    }
  }
  console.log(`\n📦 Artículos importados: ${agregados}`);
  if (existentes) console.log(`⚠️  Artículos ya existentes (no duplicados): ${existentes}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error general:', e);
  prisma.$disconnect();
  process.exit(1);
}); 