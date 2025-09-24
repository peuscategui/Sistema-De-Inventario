const fetch = require('node-fetch');

async function probarApiFamilia() {
  try {
    console.log('🔍 Probando API con filtro familia=Computadora...\n');
    
    const url = 'http://localhost:3002/inventory?page=1&pageSize=10&familia=Computadora&excludeEstados=BAJA,DONACION';
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
    
    // Verificar si todos los items son de la familia Computadora
    const itemsNoComputadora = data.data?.filter(item => item.familia !== 'Computadora') || [];
    if (itemsNoComputadora.length > 0) {
      console.log('\n❌ PROBLEMA: Se encontraron items que NO son de familia Computadora:');
      itemsNoComputadora.forEach(item => {
        console.log(`- ${item.codigoEFC}: ${item.familia}`);
      });
    } else {
      console.log('\n✅ Todos los items son de familia Computadora');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

probarApiFamilia();
