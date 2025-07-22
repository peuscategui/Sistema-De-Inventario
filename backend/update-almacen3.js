const axios = require('axios');

async function updateAlmacen3() {
  try {
    console.log('🔍 Actualizando AP-ALMACEN3...');
    
    // 1. Obtener todos los items de bajas
    const response = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = response.data.data;
    
    // Buscar el item AP-ALMACEN3
    const item = bajas.find(baja => baja.codigoEFC === 'Ap-Almacen3');
    
    if (!item) {
      console.log('❌ No se encontró el item Ap-Almacen3');
      console.log('📋 Items disponibles:');
      bajas.forEach((baja, index) => {
        console.log(`${index + 1}. ${baja.codigoEFC} (ID: ${baja.id})`);
      });
      return;
    }
    
    console.log(`📝 Actualizando item ID: ${item.id} - ${item.codigoEFC}`);
    
    // 2. Actualizar con fecha y motivo de baja
    const updateData = {
      estado: 'BAJA',
      fecha_baja: '2025-07-19',
      motivo_baja: 'Equipo obsoleto - Reemplazo por nueva tecnología'
    };
    
    console.log('📋 Datos a actualizar:', updateData);
    
    const updateResponse = await axios.put(`http://localhost:3002/inventory/${item.id}`, updateData);
    console.log('✅ Actualización exitosa');
    
    // 3. Verificar que se actualizó correctamente
    console.log('\n🔍 Verificando datos actualizados...');
    const verifyResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const updatedBajas = verifyResponse.data.data;
    
    const updatedItem = updatedBajas.find(baja => baja.codigoEFC === 'Ap-Almacen3');
    
    if (updatedItem) {
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
    } else {
      console.log('\n❌ No se pudo verificar el item actualizado');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateAlmacen3(); 

async function updateAlmacen3() {
  try {
    console.log('🔍 Actualizando AP-ALMACEN3...');
    
    // 1. Obtener todos los items de bajas
    const response = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = response.data.data;
    
    // Buscar el item AP-ALMACEN3
    const item = bajas.find(baja => baja.codigoEFC === 'Ap-Almacen3');
    
    if (!item) {
      console.log('❌ No se encontró el item Ap-Almacen3');
      console.log('📋 Items disponibles:');
      bajas.forEach((baja, index) => {
        console.log(`${index + 1}. ${baja.codigoEFC} (ID: ${baja.id})`);
      });
      return;
    }
    
    console.log(`📝 Actualizando item ID: ${item.id} - ${item.codigoEFC}`);
    
    // 2. Actualizar con fecha y motivo de baja
    const updateData = {
      estado: 'BAJA',
      fecha_baja: '2025-07-19',
      motivo_baja: 'Equipo obsoleto - Reemplazo por nueva tecnología'
    };
    
    console.log('📋 Datos a actualizar:', updateData);
    
    const updateResponse = await axios.put(`http://localhost:3002/inventory/${item.id}`, updateData);
    console.log('✅ Actualización exitosa');
    
    // 3. Verificar que se actualizó correctamente
    console.log('\n🔍 Verificando datos actualizados...');
    const verifyResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const updatedBajas = verifyResponse.data.data;
    
    const updatedItem = updatedBajas.find(baja => baja.codigoEFC === 'Ap-Almacen3');
    
    if (updatedItem) {
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
    } else {
      console.log('\n❌ No se pudo verificar el item actualizado');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateAlmacen3(); 
 