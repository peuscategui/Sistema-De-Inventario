const { Client } = require('pg');

async function verificarNullClasificacion() {
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

        // Buscar registros con clasificacionId null
        console.log('🔍 Buscando registros con clasificacionId null...');
        const result = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."clasificacionId",
                i."empleadoId",
                c.familia,
                c.tipo_equipo,
                c.sub_familia,
                e.nombre,
                e.sede,
                e.gerencia
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            WHERE i."clasificacionId" IS NULL
            ORDER BY i.id
            LIMIT 10
        `);

        console.log(`📊 Registros con clasificacionId null: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            result.rows.forEach((item, index) => {
                console.log(`\n📋 REGISTRO ${index + 1}:`);
                console.log(`   ID: ${item.id}`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   ClasificacionId: ${item.clasificacionId}`);
                console.log(`   EmpleadoId: ${item.empleadoId}`);
                console.log(`   Familia: ${item.familia}`);
                console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
                console.log(`   Empleado: ${item.nombre}`);
            });
        }

        // También verificar registros con clasificacionId 29
        console.log('\n🔍 Buscando registros con clasificacionId 29...');
        const result29 = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."clasificacionId",
                i."empleadoId",
                c.familia,
                c.tipo_equipo,
                c.sub_familia,
                e.nombre,
                e.sede,
                e.gerencia
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            WHERE i."clasificacionId" = 29
            ORDER BY i.id
            LIMIT 5
        `);

        console.log(`📊 Registros con clasificacionId 29: ${result29.rows.length}`);
        
        if (result29.rows.length > 0) {
            result29.rows.forEach((item, index) => {
                console.log(`\n📋 REGISTRO ${index + 1}:`);
                console.log(`   ID: ${item.id}`);
                console.log(`   Código EFC: ${item.codigoEFC}`);
                console.log(`   ClasificacionId: ${item.clasificacionId}`);
                console.log(`   EmpleadoId: ${item.empleadoId}`);
                console.log(`   Familia: ${item.familia}`);
                console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
                console.log(`   Empleado: ${item.nombre}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarNullClasificacion();
