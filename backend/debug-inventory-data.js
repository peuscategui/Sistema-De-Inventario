const fs = require('fs');
const path = require('path');

async function debugInventoryData() {
  try {
    // Leer el archivo CSV
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Obtener encabezados
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('📋 Encabezados:', headers);

    // Analizar cada línea
    const dataLines = lines.slice(1);
    dataLines.forEach((line, index) => {
      const values = line.split(',').map(val => val.trim());
      
      // Encontrar índices de clasificacionId y empleadoId
      const clasificacionIdIndex = headers.findIndex(h => h === 'clasificacionId');
      const empleadoIdIndex = headers.findIndex(h => h === 'empleadoId');
      
      console.log(`\n🔍 Línea ${index + 2}:`);
      console.log(`codigoEFC: ${values[0]}`);
      console.log(`clasificacionId: ${values[clasificacionIdIndex]} (índice ${clasificacionIdIndex})`);
      console.log(`empleadoId: ${values[empleadoIdIndex]} (índice ${empleadoIdIndex})`);
      
      // Mostrar todos los valores para debugging
      console.log('\nTodos los valores:');
      values.forEach((val, i) => {
        console.log(`${headers[i]}: ${val}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugInventoryData();
