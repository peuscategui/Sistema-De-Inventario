const { Client } = require('pg');

async function buscarSinClasificar() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔌 Conectando a la base de datos...');

        // Buscar registros sin clasificación (clasificacionId es null)
        console.log('🔍 Buscando registros sin clasificación...');
        const result = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i.marca,
                i.modelo,
                i.descripcion,
                i."clasificacionId",
                i."empleadoId",
                c.familia,
                c.tipo_equipo,
                e.nombre as empleado_nombre
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            WHERE i."clasificacionId" IS NULL
            ORDER BY i.id
        `);

        console.log(`📊 Registros sin clasificación encontrados: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            console.log('\n📋 DETALLES DE LOS REGISTROS SIN CLASIFICACIÓN:');
            console.log('================================================================================');
            
            result.rows.forEach((item, index) => {
                console.log(`\n${index + 1}. ID: ${item.id}`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   Marca: ${item.marca}`);
                console.log(`   Modelo: ${item.modelo}`);
                console.log(`   Descripción: ${item.descripcion}`);
                console.log(`   Clasificación ID: ${item.clasificacionId}`);
                console.log(`   Empleado ID: ${item.empleadoId}`);
                console.log(`   Empleado: ${item.empleado_nombre}`);
                console.log(`   Familia: ${item.familia}`);
                console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
            });
        } else {
            console.log('✅ No hay registros sin clasificación');
        }

        // También verificar si hay registros con clasificacionId = 0 o valores inválidos
        console.log('\n🔍 Verificando registros con clasificacionId = 0 o valores inválidos...');
        const resultInvalid = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."clasificacionId",
                c.familia,
                c.tipo_equipo
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            WHERE i."clasificacionId" = 0 OR (i."clasificacionId" IS NOT NULL AND c.id IS NULL)
            ORDER BY i.id
            LIMIT 10
        `);

        if (resultInvalid.rows.length > 0) {
            console.log(`📊 Registros con clasificacionId inválido: ${resultInvalid.rows.length}`);
            resultInvalid.rows.forEach((item, index) => {
                console.log(`   ${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - ClasificacionId: ${item.clasificacionId} - Familia: ${item.familia}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

buscarSinClasificar();
