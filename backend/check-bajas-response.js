const https = require('https');
const http = require('http');

async function checkBajasResponse() {
  try {
    console.log('🔍 Verificando respuesta completa del endpoint de bajas...');
    
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/inventory/bajas',
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
          console.log('✅ Respuesta del endpoint de bajas:');
          console.log('====================================');
          
          if (response.data && response.data.length > 0) {
            const item = response.data[0]; // Primer item
            console.log('📋 CAMPOS DISPONIBLES:');
            console.log(`ID: ${item.id}`);
            console.log(`Código EFC: "${item.codigoEFC}"`);
            console.log(`Marca: "${item.marca}"`);
            console.log(`Modelo: "${item.modelo}"`);
            console.log(`Descripción: "${item.descripcion}"`);
            console.log(`Serie: "${item.serie}"`);
            console.log(`Estado: "${item.estado}"`);
            console.log(`Status: "${item.status}"`);
            
            // Campos adicionales que agregamos
            console.log('\n📊 CAMPOS ADICIONALES PARA BAJAS:');
            console.log(`Sede: "${item.sede || 'N/A'}"`);
            console.log(`Gerencia: "${item.gerencia || 'N/A'}"`);
            console.log(`Cargo: "${item.cargo || 'N/A'}"`);
            console.log(`Nombre Empleado: "${item.nombreEmpleado || 'N/A'}"`);
            console.log(`Tipo Equipo: "${item.tipoEquipo || 'N/A'}"`);
            console.log(`Familia: "${item.familia || 'N/A'}"`);
            console.log(`Sub Familia: "${item.subFamilia || 'N/A'}"`);
            console.log(`Vida Útil: "${item.vidaUtil || 'N/A'}"`);
            console.log(`Fecha Baja: "${item.fechaBaja || 'N/A'}"`);
            console.log(`Motivo Baja: "${item.motivoBaja || 'N/A'}"`);
            
            console.log('\n✅ RESULTADO:');
            if (item.sede && item.sede !== 'N/A') {
              console.log('✅ Sede: INCLUIDA');
            } else {
              console.log('❌ Sede: FALTANTE');
            }
            
            if (item.fechaBaja && item.fechaBaja !== 'N/A') {
              console.log('✅ Fecha Baja: INCLUIDA');
            } else {
              console.log('❌ Fecha Baja: FALTANTE (campo no existe en esquema)');
            }
            
            if (item.motivoBaja && item.motivoBaja !== 'N/A') {
              console.log('✅ Motivo Baja: INCLUIDA');
            } else {
              console.log('❌ Motivo Baja: FALTANTE (campo no existe en esquema)');
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

checkBajasResponse(); 