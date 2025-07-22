const https = require('https');
const http = require('http');

async function checkItemDetails() {
  try {
    console.log('🔍 Verificando detalles completos del item Ap-Almacen1...');
    
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/inventory/56', // ID del item Ap-Almacen1
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
          const item = JSON.parse(data);
          console.log('📋 DATOS COMPLETOS DEL ITEM:');
          console.log('================================');
          console.log(`ID: ${item.id}`);
          console.log(`Código EFC: "${item.codigoEFC}"`);
          console.log(`Marca: "${item.marca}"`);
          console.log(`Modelo: "${item.modelo}"`);
          console.log(`Descripción: "${item.descripcion}"`);
          console.log(`Serie: "${item.serie}"`);
          console.log(`Procesador: "${item.procesador}"`);
          console.log(`Año: ${item.anio}`);
          console.log(`RAM: "${item.ram}"`);
          console.log(`Disco Duro: "${item.discoDuro}"`);
          console.log(`Sistema Operativo: "${item.sistemaOperativo}"`);
          console.log(`Status: "${item.status}"`);
          console.log(`Estado: "${item.estado}"`);
          console.log(`Ubicación Equipo: "${item.ubicacionEquipo}"`);
          console.log(`Q Usuarios: ${item.qUsuarios}`);
          console.log(`Condición: "${item.condicion}"`);
          console.log(`Repotenciadas: ${item.repotenciadas}`);
          console.log(`Clasificación Obsolescencia: "${item.clasificacionObsolescencia}"`);
          console.log(`Clasificación Repotenciadas: "${item.clasificacionRepotenciadas}"`);
          console.log(`Motivo Compra: "${item.motivoCompra}"`);
          console.log(`Proveedor: "${item.proveedor}"`);
          console.log(`Factura: "${item.factura}"`);
          console.log(`Año Compra: ${item.anioCompra}`);
          console.log(`Observaciones: "${item.observaciones}"`);
          console.log(`Fecha Compra: "${item.fecha_compra}"`);
          console.log(`Precio Unitario Sin IGV: "${item.precioUnitarioSinIgv}"`);
          console.log(`Clasificación ID: ${item.clasificacionId}`);
          console.log(`Empleado ID: ${item.empleadoId}`);
          
          console.log('\n👤 DATOS DEL EMPLEADO:');
          if (item.empleado) {
            console.log(`Nombre: "${item.empleado.nombre}"`);
            console.log(`Cargo: "${item.empleado.cargo}"`);
            console.log(`Gerencia: "${item.empleado.gerencia}"`);
            console.log(`Sede: "${item.empleado.sede}"`);
          } else {
            console.log('❌ No hay empleado asignado');
          }
          
          console.log('\n📂 DATOS DE CLASIFICACIÓN:');
          if (item.clasificacion) {
            console.log(`Familia: "${item.clasificacion.familia}"`);
            console.log(`Sub Familia: "${item.clasificacion.sub_familia}"`);
            console.log(`Tipo Equipo: "${item.clasificacion.tipo_equipo}"`);
            console.log(`Vida Útil: "${item.clasificacion.vida_util}"`);
            console.log(`Valor Reposición: ${item.clasificacion.valor_reposicion}`);
          } else {
            console.log('❌ No hay clasificación asignada');
          }
          
          console.log('\n💡 CAMPOS QUE FALTAN EN LA SECCIÓN BAJAS:');
          console.log('- Sede (viene del empleado.sede)');
          console.log('- Fecha de Baja (no existe en el esquema)');
          console.log('- Motivo de Baja (no existe en el esquema)');
          
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

checkItemDetails(); 