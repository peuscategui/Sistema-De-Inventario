const https = require('https');
const http = require('http');

async function checkCondicionValues() {
  try {
    console.log('🔍 Consultando valores de condición a través del API...');
    
    // Hacer petición al API para obtener todos los items
    const response = await fetch('http://localhost:3002/inventory?page=1&pageSize=1000');
    const data = await response.json();
    
    console.log(`📊 Total de items obtenidos: ${data.data.length}`);
    
    // Agrupar por condición
    const condicionCounts = {};
    const estadoCondicionCounts = {};
    
    data.data.forEach(item => {
      const condicion = item.condicion || 'SIN_CONDICION';
      const estado = item.estado || 'SIN_ESTADO';
      
      // Contar por condición
      condicionCounts[condicion] = (condicionCounts[condicion] || 0) + 1;
      
      // Contar por estado y condición
      const key = `${estado} - ${condicion}`;
      estadoCondicionCounts[key] = (estadoCondicionCounts[key] || 0) + 1;
    });
    
    console.log('\n📋 Valores únicos en el campo condicion:');
    Object.entries(condicionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([condicion, count]) => {
        console.log(`  - "${condicion}": ${count} items`);
      });
    
    console.log('\n📋 Combinaciones de estado y condición:');
    Object.entries(estadoCondicionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([combo, count]) => {
        console.log(`  - ${combo}: ${count} items`);
      });
    
    // Buscar específicamente items con estado OBSOLETO
    const itemsObsoletos = data.data.filter(item => item.estado === 'OBSOLETO');
    console.log(`\n🔍 Items con estado OBSOLETO: ${itemsObsoletos.length}`);
    
    if (itemsObsoletos.length > 0) {
      const condicionObsoletos = {};
      itemsObsoletos.forEach(item => {
        const condicion = item.condicion || 'SIN_CONDICION';
        condicionObsoletos[condicion] = (condicionObsoletos[condicion] || 0) + 1;
      });
      
      console.log('📋 Condiciones de items con estado OBSOLETO:');
      Object.entries(condicionObsoletos)
        .sort(([,a], [,b]) => b - a)
        .forEach(([condicion, count]) => {
          console.log(`  - "${condicion}": ${count} items`);
        });
    }
    
  } catch (error) {
    console.error('❌ Error consultando condición:', error);
  }
}

checkCondicionValues();
