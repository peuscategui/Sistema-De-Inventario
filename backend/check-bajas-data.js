const axios = require('axios');

async function checkBajasData() {
  try {
    console.log('🔍 Verificando datos de bajas...');
    
    const response = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = response.data.data;
    
    console.log(`📊 Total de items en bajas: ${bajas.length}`);
    
    if (bajas.length > 0) {
      console.log('\n📋 Datos de bajas:');
      bajas.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Código: ${item.codigoEFC}`);
        console.log(`   Estado: ${item.estado}`);
        console.log(`   Fecha Baja: ${item.fechaBaja || 'null'}`);
        console.log(`   Motivo Baja: ${item.motivoBaja || 'null'}`);
        console.log('   ---');
      });
      
      // Verificar si los datos están completos
      const item = bajas[0];
      if (item.fechaBaja && item.motivoBaja) {
        console.log('\n✅ ¡Perfecto! Los datos están completos');
        console.log('Ahora deberías ver en el frontend:');
        console.log(`- Fecha de Baja: ${item.fechaBaja}`);
        console.log(`- Motivo de Baja: ${item.motivoBaja}`);
      } else {
        console.log('\n❌ Los datos no están completos');
        console.log('Necesitamos actualizar los datos');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkBajasData(); 