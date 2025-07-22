const axios = require('axios');

async function updateBajasFinal() {
  try {
    console.log('🔍 Actualizando datos de bajas...');
    
    // 1. Obtener el item de bajas
    const response = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = response.data.data;
    
    if (bajas.length === 0) {
      console.log('❌ No hay items en bajas');
      return;
    }
    
    const item = bajas[0];
    console.log(`📝 Actualizando item ID: ${item.id} - ${item.codigoEFC}`);
    
    // 2. Actualizar con fecha y motivo de baja
    const updateData = {
      estado: 'BAJA',
      fecha_baja: '2025-07-12',
      motivo_baja: 'Renovación tecnológica'
    };
    
    console.log('📋 Datos a actualizar:', updateData);
    
    const updateResponse = await axios.put(`http://localhost:3002/inventory/${item.id}`, updateData);
    console.log('✅ Actualización exitosa');
    
    // 3. Verificar que se actualizó correctamente
    console.log('\n🔍 Verificando datos actualizados...');
    const verifyResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const updatedBajas = verifyResponse.data.data;
    
    if (updatedBajas.length > 0) {
      const updatedItem = updatedBajas[0];
      console.log('\n📋 Datos actualizados:');
      console.log(`ID: ${updatedItem.id}`);
      console.log(`Código: ${updatedItem.codigoEFC}`);
      console.log(`Estado: ${updatedItem.estado}`);
      console.log(`Fecha Baja: ${updatedItem.fechaBaja || 'null'}`);
      console.log(`Motivo Baja: ${updatedItem.motivoBaja || 'null'}`);
      
      if (updatedItem.fechaBaja && updatedItem.motivoBaja) {
        console.log('\n✅ ¡Perfecto! Los datos están completos');
        console.log('Ahora deberías ver en el frontend:');
        console.log(`- Fecha de Baja: ${updatedItem.fechaBaja}`);
        console.log(`- Motivo de Baja: ${updatedItem.motivoBaja}`);
      } else {
        console.log('\n❌ Los datos aún no están completos');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateBajasFinal(); 