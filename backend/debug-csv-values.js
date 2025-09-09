const fs = require('fs');
const path = require('path');

function debugCSVValues() {
  try {
    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Obtener encabezados
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Encontrar índices de las columnas que nos interesan
    const clasificacionIdIndex = headers.findIndex(h => h === 'clasificacionId');
    const empleadoIdIndex = headers.findIndex(h => h === 'empleadoId');
    
    console.log(`📍 Índices encontrados:`);
    console.log(`clasificacionId: columna ${clasificacionIdIndex}`);
    console.log(`empleadoId: columna ${empleadoIdIndex}\n`);

    // Procesar cada línea
    const dataLines = lines.slice(1);
    dataLines.forEach((line, index) => {
      const values = line.split(',');
      
      // Obtener los valores de clasificacionId y empleadoId
      const clasificacionId = values[clasificacionIdIndex];
      const empleadoId = values[empleadoIdIndex];
      
      console.log(`Línea ${index + 2}:`);
      console.log(`clasificacionId: "${clasificacionId}" (${clasificacionId.length} caracteres)`);
      console.log(`empleadoId: "${empleadoId}" (${empleadoId.length} caracteres)`);
      
      // Mostrar los caracteres individuales para clasificacionId
      console.log('Caracteres de clasificacionId:');
      for (let i = 0; i < clasificacionId.length; i++) {
        const char = clasificacionId[i];
        console.log(`  Posición ${i}: "${char}" (código ASCII: ${char.charCodeAt(0)})`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugCSVValues();
