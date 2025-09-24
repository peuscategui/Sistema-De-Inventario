const fetch = require('node-fetch');

async function probarApiCondicion() {
  try {
    console.log('🔍 Probando API con filtro condicion=OBSOLETO...\n');
    
    const url = 'http://localhost:3002/inventory?page=1&pageSize=10&condicion=OBSOLETO&excludeEstados=BAJA,DONACION';
    console.log('📡 URL de prueba:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 Respuesta de la API:');
    console.log('- Total de items:', data.pagination?.total || 'No disponible');
    console.log('- Items en esta página:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Primeros 5 items:');
      data.data.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.codigoEFC} - ${item.marca} ${item.modelo} - Condición: ${item.condicion} - Estado: ${item.estado}`);
      });
    }
    
    // Verificar si todos los items tienen condición OBSOLETO
    const itemsNoObsoletos = data.data?.filter(item => item.condicion !== 'OBSOLETO') || [];
    if (itemsNoObsoletos.length > 0) {
      console.log('\n❌ PROBLEMA: Se encontraron items que NO son OBSOLETO:');
      itemsNoObsoletos.forEach(item => {
        console.log(`- ${item.codigoEFC}: ${item.condicion}`);
      });
    } else {
      console.log('\n✅ Todos los items tienen condición OBSOLETO');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

probarApiCondicion();
