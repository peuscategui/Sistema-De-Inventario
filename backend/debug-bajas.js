const axios = require('axios');

async function debugBajas() {
  try {
    console.log('🔍 Diagnosticando problema con bajas...');
    
    // 1. Obtener todos los items de inventory
    console.log('\n1️⃣ Obteniendo todos los items de inventory...');
    const allItemsResponse = await axios.get('http://localhost:3002/inventory');
    const allItems = allItemsResponse.data.data;
    
    console.log(`📊 Total de items en inventory: ${allItems.length}`);
    
    // Mostrar los primeros 5 items con su estado
    console.log('\n📋 Primeros 5 items:');
    allItems.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Código: ${item.codigoEFC}, Estado: ${item.estado}, Status: ${item.status}`);
    });
    
    // 2. Obtener items con estado BAJA
    console.log('\n2️⃣ Obteniendo items con estado BAJA...');
    const bajasResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = bajasResponse.data.data;
    
    console.log(`📊 Total de items en bajas: ${bajas.length}`);
    
    if (bajas.length > 0) {
      console.log('\n📋 Items en bajas:');
      bajas.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}, Código: ${item.codigoEFC}, Estado: ${item.estado}, Fecha: ${item.fechaBaja}, Motivo: ${item.motivoBaja}`);
      });
    }
    
    // 3. Verificar si hay items con estado BAJA pero no aparecen en bajas
    console.log('\n3️⃣ Verificando items con estado BAJA...');
    const itemsWithBajaEstado = allItems.filter(item => item.estado === 'BAJA');
    console.log(`📊 Items con estado 'BAJA': ${itemsWithBajaEstado.length}`);
    
    if (itemsWithBajaEstado.length > 0) {
      console.log('\n📋 Items con estado BAJA:');
      itemsWithBajaEstado.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}, Código: ${item.codigoEFC}, Estado: ${item.estado}, Fecha: ${item.fechaBaja}, Motivo: ${item.motivoBaja}`);
      });
    }
    
    // 4. Intentar actualizar un item específico
    if (bajas.length > 0) {
      console.log('\n4️⃣ Intentando actualizar el primer item de bajas...');
      const firstItem = bajas[0];
      
      const updateData = {
        estado: 'BAJA',
        fecha_baja: '2025-07-12',
        motivo_baja: 'Renovación tecnológica'
      };
      
      console.log(`📝 Actualizando item ID: ${firstItem.id} con datos:`, updateData);
      
      try {
        const updateResponse = await axios.put(`http://localhost:3002/inventory/${firstItem.id}`, updateData);
        console.log('✅ Actualización exitosa:', updateResponse.data);
      } catch (error) {
        console.error('❌ Error en actualización:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugBajas(); 