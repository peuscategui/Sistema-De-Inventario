const { Client } = require('pg');

async function verificarUbicacionEquipo() {
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

        // Buscar el registro específico que mencionas
        console.log('🔍 Buscando registro Ap-Piso1-Oficina Volante...');
        const result = await client.query(`
            SELECT 
                i.id,
                i."codigoEFC",
                i."ubicacionEquipo",
                i."estado",
                i."condicion",
                c.familia,
                c.tipo_equipo,
                e.nombre,
                e.sede
            FROM inventory i
            LEFT JOIN clasificacion c ON i."clasificacionId" = c.id
            LEFT JOIN empleado e ON i."empleadoId" = e.id
            WHERE i."codigoEFC" = 'Ap-Piso1-Oficina Volante'
        `);

        if (result.rows.length > 0) {
            const item = result.rows[0];
            console.log('\n📋 DATOS DEL REGISTRO:');
            console.log(`   ID: ${item.id}`);
            console.log(`   Código EFC: ${item.codigoEFC}`);
            console.log(`   Ubicación del Equipo: "${item.ubicacionEquipo}"`);
            console.log(`   Estado: "${item.estado}"`);
            console.log(`   Condición: "${item.condicion}"`);
            console.log(`   Familia: ${item.familia}`);
            console.log(`   Tipo Equipo: ${item.tipo_equipo}`);
            console.log(`   Empleado: ${item.nombre}`);
            console.log(`   Sede: ${item.sede}`);
        } else {
            console.log('❌ No se encontró el registro Ap-Piso1-Oficina Volante');
        }

        // También verificar algunos registros más para ver los valores de ubicacionEquipo
        console.log('\n🔍 Verificando otros registros con ubicacionEquipo...');
        const otrosResult = await client.query(`
            SELECT 
                i."codigoEFC",
                i."ubicacionEquipo",
                i."estado",
                i."condicion"
            FROM inventory i
            WHERE i."ubicacionEquipo" IS NOT NULL
            ORDER BY i.id
            LIMIT 10
        `);

        console.log(`📊 Registros con ubicacionEquipo no null: ${otrosResult.rows.length}`);
        otrosResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.codigoEFC} - Ubicación: "${item.ubicacionEquipo}" - Estado: "${item.estado}"`);
        });

        // Verificar valores únicos de ubicacionEquipo
        console.log('\n🔍 Valores únicos de ubicacionEquipo...');
        const valoresUnicos = await client.query(`
            SELECT DISTINCT "ubicacionEquipo", COUNT(*) as count
            FROM inventory
            WHERE "ubicacionEquipo" IS NOT NULL
            GROUP BY "ubicacionEquipo"
            ORDER BY count DESC
        `);

        console.log(`📊 Valores únicos de ubicacionEquipo:`);
        valoresUnicos.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. "${item.ubicacionEquipo}" (${item.count} registros)`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarUbicacionEquipo();
