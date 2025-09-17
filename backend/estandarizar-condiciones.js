const https = require('https');
const http = require('http');

async function estandarizarCondiciones() {
  try {
    console.log('🔍 Iniciando estandarización de condiciones...');
    
    // Hacer petición al API para obtener todos los items
    const response = await fetch('http://localhost:3002/inventory?page=1&pageSize=1000');
    const data = await response.json();
    
    console.log(`📊 Total de items obtenidos: ${data.data.length}`);
    
    // Identificar items que necesitan corrección
    const correcciones = {
      'OBSOLETO': [],      // 17 items → OBSOLETA
      'Operativo': [],     // 106 items → OPERATIVO  
      'OPERATIVA': []      // 350 items → OPERATIVO
    };
    
    data.data.forEach(item => {
      if (item.condicion === 'OBSOLETO') {
        correcciones.OBSOLETO.push(item.id);
      } else if (item.condicion === 'Operativo') {
        correcciones.Operativo.push(item.id);
      } else if (item.condicion === 'OPERATIVA') {
        correcciones.OPERATIVA.push(item.id);
      }
    });
    
    console.log('\n📋 Items que necesitan corrección:');
    console.log(`  - "OBSOLETO" → "OBSOLETA": ${correcciones.OBSOLETO.length} items`);
    console.log(`  - "Operativo" → "OPERATIVO": ${correcciones.Operativo.length} items`);
    console.log(`  - "OPERATIVA" → "OPERATIVO": ${correcciones.OPERATIVA.length} items`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de items a corregir:');
    if (correcciones.OBSOLETO.length > 0) {
      const ejemplo = data.data.find(item => item.condicion === 'OBSOLETO');
      console.log(`  - OBSOLETO: ${ejemplo.codigoEFC} (${ejemplo.marca} ${ejemplo.modelo})`);
    }
    if (correcciones.Operativo.length > 0) {
      const ejemplo = data.data.find(item => item.condicion === 'Operativo');
      console.log(`  - Operativo: ${ejemplo.codigoEFC} (${ejemplo.marca} ${ejemplo.modelo})`);
    }
    if (correcciones.OPERATIVA.length > 0) {
      const ejemplo = data.data.find(item => item.condicion === 'OPERATIVA');
      console.log(`  - OPERATIVA: ${ejemplo.codigoEFC} (${ejemplo.marca} ${ejemplo.modelo})`);
    }
    
    // Realizar las correcciones
    let totalCorregidos = 0;
    
    // 1. Corregir OBSOLETO → OBSOLETA
    if (correcciones.OBSOLETO.length > 0) {
      console.log('\n🔧 Corrigiendo OBSOLETO → OBSOLETA...');
      for (const id of correcciones.OBSOLETO) {
        try {
          const updateResponse = await fetch(`http://localhost:3002/inventory/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              condicion: 'OBSOLETA'
            })
          });
          
          if (updateResponse.ok) {
            totalCorregidos++;
          } else {
            console.error(`❌ Error actualizando item ${id}:`, await updateResponse.text());
          }
        } catch (error) {
          console.error(`❌ Error actualizando item ${id}:`, error.message);
        }
      }
      console.log(`✅ Corregidos ${totalCorregidos} items: OBSOLETO → OBSOLETA`);
    }
    
    // 2. Corregir Operativo → OPERATIVO
    if (correcciones.Operativo.length > 0) {
      console.log('\n🔧 Corrigiendo Operativo → OPERATIVO...');
      let corregidosOperativo = 0;
      for (const id of correcciones.Operativo) {
        try {
          const updateResponse = await fetch(`http://localhost:3002/inventory/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              condicion: 'OPERATIVO'
            })
          });
          
          if (updateResponse.ok) {
            corregidosOperativo++;
          } else {
            console.error(`❌ Error actualizando item ${id}:`, await updateResponse.text());
          }
        } catch (error) {
          console.error(`❌ Error actualizando item ${id}:`, error.message);
        }
      }
      console.log(`✅ Corregidos ${corregidosOperativo} items: Operativo → OPERATIVO`);
      totalCorregidos += corregidosOperativo;
    }
    
    // 3. Corregir OPERATIVA → OPERATIVO
    if (correcciones.OPERATIVA.length > 0) {
      console.log('\n🔧 Corrigiendo OPERATIVA → OPERATIVO...');
      let corregidosOperativa = 0;
      for (const id of correcciones.OPERATIVA) {
        try {
          const updateResponse = await fetch(`http://localhost:3002/inventory/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              condicion: 'OPERATIVO'
            })
          });
          
          if (updateResponse.ok) {
            corregidosOperativa++;
          } else {
            console.error(`❌ Error actualizando item ${id}:`, await updateResponse.text());
          }
        } catch (error) {
          console.error(`❌ Error actualizando item ${id}:`, error.message);
        }
      }
      console.log(`✅ Corregidos ${corregidosOperativa} items: OPERATIVA → OPERATIVO`);
      totalCorregidos += corregidosOperativa;
    }
    
    console.log(`\n🎉 Total de items corregidos: ${totalCorregidos}`);
    
    // Verificar el resultado
    console.log('\n🔍 Verificando resultado...');
    const verifyResponse = await fetch('http://localhost:3002/inventory?page=1&pageSize=1000');
    const verifyData = await verifyResponse.json();
    
    const condicionCounts = {};
    verifyData.data.forEach(item => {
      const condicion = item.condicion || 'SIN_CONDICION';
      condicionCounts[condicion] = (condicionCounts[condicion] || 0) + 1;
    });
    
    console.log('\n📊 Valores finales en el campo condicion:');
    Object.entries(condicionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([condicion, count]) => {
        console.log(`  - "${condicion}": ${count} items`);
      });
    
  } catch (error) {
    console.error('❌ Error en estandarización:', error);
  }
}

estandarizarCondiciones();
