const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function loadInventoryPendientes() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Registros pendientes
    const registros = [
      {
        codigoEFC: 'LT-00090',
        marca: 'DELL',
        modelo: 'LATITUDE 3520',
        descripcion: 'LAPTOP LT-00090 LATITUDE 3520',
        serie: 'G8L3KL3',
        procesador: 'i5-1135G7',
        anio: 2023,
        ram: '12 GB',
        discoDuro: '480 GB -SSD',
        sistemaOperativo: 'Windows 11 Pro',
        status: 'Asignado',
        estado: 'ASIGNADA',
        ubicacionEquipo: 'HIBRIDO',
        qUsuarios: 1,
        condicion: 'OPERATIVA',
        repotenciadas: true,
        clasificacionId: 6,
        empleadoId: 445
      },
      {
        codigoEFC: 'LT-00061',
        marca: 'DELL',
        modelo: 'LATITUDE 5500',
        descripcion: 'LAPTOP LT-00061 LATITUDE 5500',
        serie: '5G4T3Z2',
        procesador: 'i5-8265U',
        anio: 2020,
        ram: '8 GB',
        discoDuro: '480 GB -SSD',
        sistemaOperativo: 'Windows 10 Pro',
        status: 'Asignado',
        estado: 'ASIGNADA',
        ubicacionEquipo: 'HIBRIDO',
        qUsuarios: 1,
        condicion: 'OPERATIVA',
        repotenciadas: true,
        clasificacionId: 6,
        empleadoId: 443
      },
      {
        codigoEFC: 'LT-000073',
        marca: 'LENOVO',
        modelo: 'V330 15ISK',
        descripcion: 'LAPTOP LT-000073 V330 15ISK',
        serie: 'R90QPXRY',
        procesador: 'i5-8250U',
        anio: 2018,
        ram: '8 GB',
        discoDuro: '480 GB -SSD',
        sistemaOperativo: 'Windows 11 Pro',
        status: 'Asignado',
        estado: 'ASIGNADA',
        ubicacionEquipo: 'HIBRIDO',
        qUsuarios: 1,
        condicion: 'OPERATIVA',
        repotenciadas: true,
        clasificacionId: 6,
        empleadoId: 446
      },
      {
        codigoEFC: 'LT-00161',
        marca: 'DELL',
        modelo: 'LATITUDE 3520',
        descripcion: 'LAPTOP LT-00161 LATITUDE 3520',
        serie: '7ZMDHS3',
        procesador: 'i7-1165G7',
        anio: 2023,
        ram: '8 GB',
        discoDuro: '512 GB - SSD',
        sistemaOperativo: 'Windows 11 Pro',
        status: 'Asignado',
        estado: 'ASIGNADA',
        ubicacionEquipo: 'HIBRIDO',
        qUsuarios: 1,
        condicion: 'OPERATIVA',
        clasificacionId: 6,
        empleadoId: 442
      }
    ];

    console.log('\n📥 Cargando registros pendientes...');
    
    let successful = 0;
    let failed = 0;
    const errors = [];

    for (const registro of registros) {
      try {
        const query = `
          INSERT INTO inventory (
            "codigoEFC", marca, modelo, descripcion, serie, procesador, 
            anio, ram, "discoDuro", "sistemaOperativo", status, estado,
            "ubicacionEquipo", "qUsuarios", condicion, repotenciadas,
            "clasificacionId", "empleadoId"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18
          )
        `;

        const params = [
          registro.codigoEFC,
          registro.marca,
          registro.modelo,
          registro.descripcion,
          registro.serie,
          registro.procesador,
          registro.anio,
          registro.ram,
          registro.discoDuro,
          registro.sistemaOperativo,
          registro.status,
          registro.estado,
          registro.ubicacionEquipo,
          registro.qUsuarios,
          registro.condicion,
          registro.repotenciadas || false,
          registro.clasificacionId,
          registro.empleadoId
        ];

        await client.query(query, params);
        successful++;
        console.log(`✅ Registro cargado: ${registro.codigoEFC} (empleado ${registro.empleadoId})`);

      } catch (error) {
        failed++;
        errors.push({
          codigo: registro.codigoEFC,
          empleadoId: registro.empleadoId,
          error: error.message
        });
      }
    }

    console.log('\n📊 Resumen de la carga:');
    console.log(`✅ Registros exitosos: ${successful}`);
    console.log(`❌ Registros fallidos: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      errors.forEach(err => {
        console.log(`${err.codigo} (empleado ${err.empleadoId}):`);
        console.log(`Error: ${err.error}\n`);
      });
    }

    // Verificar la carga
    const { rows: [count] } = await client.query('SELECT COUNT(*) FROM inventory');
    console.log(`\n📊 Total registros en la base de datos: ${count.count}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
  }
}

loadInventoryPendientes();
