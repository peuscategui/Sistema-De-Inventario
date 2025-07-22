const axios = require('axios');

async function verifyBajasUpdated() {
  try {
    console.log('🔍 Verificando datos actualizados de bajas...');
    
    // Obtener items de bajas
    const bajasResponse = await axios.get('http://localhost:3002/inventory/bajas');
    const bajas = bajasResponse.data.data;
    
    console.log(`📊 Total de items en bajas: ${bajas.length}`);
    
    if (bajas.length > 0) {
      console.log('\n📋 Items en bajas con datos actualizados:');
      bajas.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Código: ${item.codigoEFC}`);
        console.log(`   Estado: ${item.estado}`);
        console.log(`   Fecha Baja: ${item.fechaBaja || 'No establecida'}`);
        console.log(`   Motivo Baja: ${item.motivoBaja || 'No establecido'}`);
        console.log('   ---');
      });
    }
    
    // Verificar que el frontend reciba los datos correctamente
    console.log('\n🌐 Verificando respuesta para el frontend...');
    console.log('Los datos deberían incluir:');
    console.log('- fechaBaja: formato YYYY-MM-DD');
    console.log('- motivoBaja: texto del motivo');
    
    if (bajas.length > 0) {
      const firstItem = bajas[0];
      console.log('\n📋 Ejemplo de datos para el frontend:');
      console.log(`{
  "id": ${firstItem.id},
  "codigoEFC": "${firstItem.codigoEFC}",
  "estado": "${firstItem.estado}",
  "fechaBaja": "${firstItem.fechaBaja || 'null'}",
  "motivoBaja": "${firstItem.motivoBaja || 'null'}"
}`);

      if (firstItem.fechaBaja && firstItem.motivoBaja) {
        console.log('\n✅ ¡Perfecto! Los datos están listos para mostrar en el frontend');
        console.log('Ahora deberías ver en la tabla de Bajas:');
        console.log('- Fecha de Baja: 12/07/2025');
        console.log('- Motivo de Baja: Renovación tecnológica');
      } else {
        console.log('\n❌ Los datos aún no están completos');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

verifyBajasUpdated(); 