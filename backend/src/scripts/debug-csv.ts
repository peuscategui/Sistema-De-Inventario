import * as fs from 'fs';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function cleanString(str: string): string {
  return str.replace(/^["']|["']$/g, '').trim();
}

async function debugCSV() {
  try {
    const csvPath = 'data/clasificaciones.csv';
    
    console.log('📄 Analizando archivo CSV:', csvPath);
    console.log('📍 Archivo existe:', fs.existsSync(csvPath));
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Archivo no encontrado');
      return;
    }
    
    // Leer el archivo completo
    const content = fs.readFileSync(csvPath, 'utf-8');
    console.log('📊 Tamaño del archivo:', content.length, 'caracteres');
    
    // Dividir en líneas
    const lines = content.split('\n');
    console.log('📋 Total de líneas (incluyendo vacías):', lines.length);
    
    // Filtrar líneas no vacías
    const nonEmptyLines = lines.filter(line => line.trim());
    console.log('📋 Líneas no vacías:', nonEmptyLines.length);
    
    // Analizar header
    if (nonEmptyLines.length > 0) {
      const header = nonEmptyLines[0];
      console.log('\n🏷️  HEADER:');
      console.log(`"${header}"`);
    }
    
    // Procesar todas las líneas de datos como lo hace el script real
    console.log('\n📊 PROCESANDO TODAS LAS LÍNEAS COMO EL SCRIPT REAL:');
    let validLines = 0;
    let invalidLines = 0;
    
    for (let i = 1; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i].trim();
      if (!line) continue;
      
      console.log(`\n--- Línea ${i} ---`);
      console.log(`Raw: "${line}"`);
      
      // Parsear CSV como el script real
      const values = parseCSVLine(line);
      console.log(`Valores parseados: ${values.length}`);
      console.log(`Valores: [${values.map(v => `"${v}"`).join(', ')}]`);
      
      // Validar como el script real
      if (values.length >= 3 && values[0]?.trim() && values[1]?.trim() && values[2]?.trim()) {
        const clasificacion = {
          familia: cleanString(values[0]),
          subFamilia: cleanString(values[1]),
          tipoEquipo: cleanString(values[2]),
          vidaUtil: cleanString(values[3]) || '5 años',
          valorReposicion: values[4] ? parseFloat(values[4].replace(/['"]/g, '')) : undefined,
          codigo: values[5] ? cleanString(values[5]) : undefined
        };
        
        console.log(`✅ VÁLIDA: ${clasificacion.familia} → ${clasificacion.subFamilia} → ${clasificacion.tipoEquipo}`);
        validLines++;
      } else {
        console.log(`❌ INVÁLIDA: No cumple criterios de validación`);
        console.log(`   - values.length >= 3: ${values.length >= 3}`);
        console.log(`   - values[0]?.trim(): "${values[0]?.trim()}"`);
        console.log(`   - values[1]?.trim(): "${values[1]?.trim()}"`);
        console.log(`   - values[2]?.trim(): "${values[2]?.trim()}"`);
        invalidLines++;
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`  📋 Total líneas: ${nonEmptyLines.length}`);
    console.log(`  🏷️  Header: 1`);
    console.log(`  📄 Líneas de datos: ${nonEmptyLines.length - 1}`);
    console.log(`  ✅ Válidas: ${validLines}`);
    console.log(`  ❌ Inválidas: ${invalidLines}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugCSV(); 