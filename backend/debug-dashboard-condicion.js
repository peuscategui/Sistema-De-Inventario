const https = require('https');
const http = require('http');

async function debugDashboardCondicion() {
  try {
    console.log('🔍 Verificando condiciones en la base de datos...');
    
    // Hacer petición al API para obtener todos los items
    const response = await fetch('http://localhost:3002/inventory?page=1&pageSize=1000');
    const data = await response.json();
    
    console.log(`📊 Total de items obtenidos: ${data.data.length}`);
    
    // Contar por condición
    const condicionCounts = {};
    data.data.forEach(item => {
      const condicion = item.condicion || 'SIN_CONDICION';
      condicionCounts[condicion] = (condicionCounts[condicion] || 0) + 1;
    });
    
    console.log('\n📊 Conteo por condición:');
    Object.entries(condicionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([condicion, count]) => {
        console.log(`  - "${condicion}": ${count} items`);
      });
    
    // Verificar específicamente OBSOLETA
    const itemsObsoletos = data.data.filter(item => item.condicion === 'OBSOLETA');
    console.log(`\n🔍 Items con condición OBSOLETA: ${itemsObsoletos.length}`);
    
    if (itemsObsoletos.length > 0) {
      console.log('📋 Primeros 5 items obsoletos:');
      itemsObsoletos.slice(0, 5).forEach(item => {
        console.log(`  - ${item.codigoEFC}: ${item.marca} ${item.modelo} (condición: ${item.condicion})`);
      });
    }
    
    // Verificar OPERATIVO
    const itemsOperativos = data.data.filter(item => item.condicion === 'OPERATIVO');
    console.log(`\n🔍 Items con condición OPERATIVO: ${itemsOperativos.length}`);
    
    // Calcular porcentaje
    const totalItems = data.data.length;
    const porcentajeOperativo = totalItems > 0 ? Math.round((itemsOperativos.length / totalItems) * 100) : 0;
    console.log(`📊 Porcentaje de equipos en buen estado (OPERATIVO): ${porcentajeOperativo}%`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDashboardCondicion();
