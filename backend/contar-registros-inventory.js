const { Client } = require('pg');

async function contarRegistrosInventory() {
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

        // Contar total de registros
        const totalResult = await client.query('SELECT COUNT(*) as total FROM inventory');
        const total = totalResult.rows[0].total;

        console.log(`📊 Total de registros en la tabla inventory: ${total}`);

        // También verificar algunos detalles adicionales
        const detallesResult = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT("clasificacionId") as con_clasificacion,
                COUNT(*) - COUNT("clasificacionId") as sin_clasificacion,
                COUNT("empleadoId") as con_empleado,
                COUNT(*) - COUNT("empleadoId") as sin_empleado
            FROM inventory
        `);

        const detalles = detallesResult.rows[0];
        console.log('\n📋 DETALLES ADICIONALES:');
        console.log(`   Total registros: ${detalles.total}`);
        console.log(`   Con clasificación: ${detalles.con_clasificacion}`);
        console.log(`   Sin clasificación: ${detalles.sin_clasificacion}`);
        console.log(`   Con empleado: ${detalles.con_empleado}`);
        console.log(`   Sin empleado: ${detalles.sin_empleado}`);

        // Verificar el rango de IDs
        const rangoResult = await client.query(`
            SELECT 
                MIN(id) as min_id,
                MAX(id) as max_id,
                MAX(id) - MIN(id) + 1 as rango_ids
            FROM inventory
        `);

        const rango = rangoResult.rows[0];
        console.log('\n🔢 RANGO DE IDs:');
        console.log(`   ID mínimo: ${rango.min_id}`);
        console.log(`   ID máximo: ${rango.max_id}`);
        console.log(`   Rango total: ${rango.rango_ids}`);

        // Verificar algunos registros de muestra
        console.log('\n📋 MUESTRA DE REGISTROS (primeros 5):');
        const muestraResult = await client.query(`
            SELECT 
                id,
                "codigoEFC",
                marca,
                modelo,
                "clasificacionId",
                "empleadoId"
            FROM inventory
            ORDER BY id
            LIMIT 5
        `);

        muestraResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - Marca: ${item.marca} - Clasificación: ${item.clasificacionId} - Empleado: ${item.empleadoId}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

contarRegistrosInventory();
