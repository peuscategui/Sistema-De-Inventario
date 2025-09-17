const { Client } = require('pg');

async function verificarCamPiso3() {
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

        // Buscar el registro CAM PISO 3 GPS
        console.log('🔍 Buscando registro CAM PISO 3 GPS...');
        const result = await client.query(`
            SELECT 
                i.*,
                c.familia,
                c.tipo_equipo,
                c.sub_familia,
                c.vida_util,
                c.valor_reposicion,
                e.nombre,
                e.sede,
                e.gerencia,
                e.cargo
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            WHERE i."codigoEFC" LIKE '%CAM PISO 3%'
            ORDER BY i.id
        `);

        console.log(`📊 Registros encontrados: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            const item = result.rows[0];
            console.log('\n📋 DATOS DEL REGISTRO:');
            console.log(`   ID: ${item.id}`);
            console.log(`   Código EFC: ${item.codigoEFC}`);
            console.log(`   ClasificacionId: ${item.clasificacionId}`);
            console.log(`   EmpleadoId: ${item.empleadoId}`);
            console.log(`   Familia: ${item.familia}`);
            console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
            console.log(`   Sub Familia: ${item.sub_familia}`);
            console.log(`   Empleado: ${item.nombre}`);
            console.log(`   Sede: ${item.sede}`);
            console.log(`   Gerencia: ${item.gerencia}`);
            console.log(`   Cargo: ${item.cargo}`);
        } else {
            console.log('❌ No se encontró el registro CAM PISO 3 GPS');
        }

        // También verificar la clasificación 29
        console.log('\n🔍 Verificando clasificación 29...');
        const clasificacionResult = await client.query(`
            SELECT * FROM clasificacion WHERE id = 29
        `);

        if (clasificacionResult.rows.length > 0) {
            const clasificacion = clasificacionResult.rows[0];
            console.log('📋 CLASIFICACIÓN 29:');
            console.log(`   ID: ${clasificacion.id}`);
            console.log(`   Familia: ${clasificacion.familia}`);
            console.log(`   Tipo Equipo: ${clasificacion.tipo_equipo}`);
            console.log(`   Sub Familia: ${clasificacion.sub_familia}`);
        } else {
            console.log('❌ No se encontró la clasificación 29');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarCamPiso3();
