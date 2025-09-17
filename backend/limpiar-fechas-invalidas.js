const { Client } = require('pg');

async function limpiarFechasInvalidas() {
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

        // Primero, verificar fechas problemáticas
        const result = await client.query(`
            SELECT id, "codigoEFC", fecha_compra 
            FROM inventory 
            WHERE fecha_compra IS NOT NULL 
            ORDER BY id 
            LIMIT 10
        `);

        console.log('📅 Fechas actuales en la base de datos:');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}, Código: ${row.codigoEFC}, Fecha: ${row.fecha_compra}`);
        });

        // Limpiar fechas inválidas (establecer como null)
        const updateResult = await client.query(`
            UPDATE inventory 
            SET fecha_compra = NULL 
            WHERE fecha_compra IS NOT NULL 
            AND (fecha_compra < '1900-01-01' OR fecha_compra > '2100-01-01')
        `);

        console.log(`\n✅ Fechas inválidas limpiadas: ${updateResult.rowCount} registros actualizados`);

        // Verificar el resultado
        const finalResult = await client.query(`
            SELECT COUNT(*) as total, 
                   COUNT(fecha_compra) as con_fecha,
                   COUNT(*) - COUNT(fecha_compra) as sin_fecha
            FROM inventory
        `);

        console.log('\n📊 Estado final de la tabla:');
        console.log(`   - Total de registros: ${finalResult.rows[0].total}`);
        console.log(`   - Con fecha de compra: ${finalResult.rows[0].con_fecha}`);
        console.log(`   - Sin fecha de compra: ${finalResult.rows[0].sin_fecha}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

limpiarFechasInvalidas();
