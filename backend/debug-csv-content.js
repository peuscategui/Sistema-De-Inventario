const fs = require('fs');
const path = require('path');

function debugCSVContent() {
  try {
    const csvPath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
    console.log(`📂 Leyendo archivo: ${csvPath}`);

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`📊 Total líneas encontradas: ${lines.length}`);
    console.log('\n📋 Primeras 5 líneas:');
    lines.slice(0, 5).forEach((line, index) => {
      console.log(`${index + 1}: ${line.substring(0, 100)}...`);
    });

    console.log('\n📋 Últimas 5 líneas:');
    lines.slice(-5).forEach((line, index) => {
      console.log(`${lines.length - 5 + index + 1}: ${line.substring(0, 100)}...`);
    });

    // Buscar registros de AP y Cam
    const apLines = lines.filter(line => line.includes('AP-') || line.includes('Ap-'));
    const camLines = lines.filter(line => line.includes('Cam '));
    
    console.log(`\n📊 Registros AP encontrados: ${apLines.length}`);
    console.log(`📊 Registros Cam encontrados: ${camLines.length}`);

    if (apLines.length > 0) {
      console.log('\n📋 Primeros registros AP:');
      apLines.slice(0, 3).forEach((line, index) => {
        console.log(`${index + 1}: ${line.substring(0, 100)}...`);
      });
    }

    if (camLines.length > 0) {
      console.log('\n📋 Primeros registros Cam:');
      camLines.slice(0, 3).forEach((line, index) => {
        console.log(`${index + 1}: ${line.substring(0, 100)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugCSVContent();
