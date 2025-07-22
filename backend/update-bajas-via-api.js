const axios = require('axios');

async function updateBajasViaAPI() {
  try {
    console.log('🔄 Actualizando items con fecha y motivo de baja via API...');
    
    // Obtener los items de bajas actuales
    const bajasResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = bajasResponse.data.data;
    
    console.log(`📋 Encontrados ${bajas.length} items en bajas`);
    
    // Actualizar los primeros 3 items con fecha y motivo de baja
    for (let i = 0; i < Math.min(3, bajas.length); i++) {
      const item = bajas[i];
      console.log(`\n📝 Actualizando item ID: ${item.id} - ${item.codigoEFC}`);
      
      const updateData = {
        estado: 'BAJA',
        fecha_baja: '2025-07-12',
        motivo_baja: 'Renovación tecnológica'
      };
      
      try {
        const updateResponse = await axios.put(`http://localhost:3002/inventory/${item.id}`, updateData);
        console.log(`✅ Item ${item.id} actualizado exitosamente`);
      } catch (error) {
        console.error(`❌ Error actualizando item ${item.id}:`, error.response?.data || error.message);
      }
    }
    
    // Verificar los items actualizados
    console.log('\n🔍 Verificando items actualizados...');
    const verifyResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const updatedBajas = verifyResponse.data.data;
    
    console.log('\n📋 Items con estado BAJA actualizados:');
    updatedBajas.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Código: ${item.codigoEFC}, Fecha: ${item.fechaBaja}, Motivo: ${item.motivoBaja}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateBajasViaAPI(); 