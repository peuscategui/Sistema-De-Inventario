const fetch = require('node-fetch');

async function probarApiFamiliaSimple() {
  try {
    console.log('🔍 Probando API con SOLO filtro familia=Computadora...\n');
    
    const url = 'http://localhost:3002/inventory?page=1&pageSize=10&familia=Computadora';
    console.log('📡 URL de prueba:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 Respuesta de la API:');
    console.log('- Total de items:', data.pagination?.total || 'No disponible');
    console.log('- Items en esta página:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Primeros 5 items:');
      data.data.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.codigoEFC} - ${item.marca} ${item.modelo} - Familia: ${item.familia} - Estado: ${item.estado}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

probarApiFamiliaSimple();
