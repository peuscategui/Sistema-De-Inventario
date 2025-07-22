const https = require('https');
const http = require('http');

async function checkBajasAPI() {
  try {
    console.log('🔍 Verificando registros de bajas a través de la API...');
    
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/inventory/bajas?pageSize=50',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📊 Total de items en BAJA: ${response.data.length}`);
          
          if (response.data.length > 0) {
            console.log('\n📋 Lista de items en BAJA:');
            
            response.data.forEach((item, index) => {
              const isEmpty = !item.codigoEFC && !item.marca && !item.modelo && !item.descripcion;
              const status = isEmpty ? '❌ VACÍO' : '✅ CON DATOS';
              
              console.log(`${index + 1}. ID: ${item.id} - ${status}`);
              console.log(`   Código EFC: "${item.codigoEFC || 'N/A'}"`);
              console.log(`   Marca: "${item.marca || 'N/A'}"`);
              console.log(`   Modelo: "${item.modelo || 'N/A'}"`);
              console.log(`   Descripción: "${item.descripcion || 'N/A'}"`);
              console.log(`   Estado: ${item.estado}, Status: ${item.status}`);
              console.log('');
            });

            // Identificar registros vacíos
            const registrosVacios = response.data.filter(item => 
              !item.codigoEFC && !item.marca && !item.modelo && !item.descripcion
            );

            if (registrosVacios.length > 0) {
              console.log(`⚠️  REGISTROS VACÍOS ENCONTRADOS: ${registrosVacios.length}`);
              console.log('IDs de registros vacíos:');
              registrosVacios.forEach(item => {
                console.log(`   - ID: ${item.id}`);
              });
              
              console.log('\n💡 Para eliminar estos registros, puedes usar:');
              console.log('DELETE FROM inventory WHERE id IN (' + registrosVacios.map(item => item.id).join(',') + ');');
            } else {
              console.log('✅ No se encontraron registros vacíos');
            }
          } else {
            console.log('📭 No hay items en estado BAJA');
          }
        } catch (error) {
          console.error('❌ Error al parsear la respuesta:', error);
          console.log('Respuesta raw:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error en la petición:', error);
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBajasAPI(); 