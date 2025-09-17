const { Client } = require('pg');

async function verificarObsoletos() {
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

        // Verificar todas las condiciones disponibles
        console.log('🔍 Verificando todas las condiciones en la base de datos...');
        const condicionesResult = await client.query(`
            SELECT 
                condicion,
                COUNT(*) as cantidad
            FROM inventory 
            WHERE condicion IS NOT NULL
            GROUP BY condicion
            ORDER BY cantidad DESC
        `);

        console.log('\n📊 DISTRIBUCIÓN POR CONDICIÓN:');
        console.log('================================================================================');
        condicionesResult.rows.forEach((item, index) => {
            console.log(`${index + 1}. ${item.condicion}: ${item.cantidad} registros`);
        });

        // Verificar específicamente OBSOLETO
        console.log('\n🔍 Verificando registros OBSOLETOS específicamente...');
        const obsoletosResult = await client.query(`
            SELECT 
                COUNT(*) as total_obsoletos
            FROM inventory 
            WHERE condicion = 'OBSOLETO'
        `);

        const totalObsoletos = obsoletosResult.rows[0].total_obsoletos;
        console.log(`\n📊 TOTAL DE REGISTROS OBSOLETOS: ${totalObsoletos}`);

        // Verificar también OBSOLETA (por si hay variaciones)
        const obsoletaResult = await client.query(`
            SELECT 
                COUNT(*) as total_obsoleta
            FROM inventory 
            WHERE condicion = 'OBSOLETA'
        `);

        const totalObsolenta = obsoletaResult.rows[0].total_obsoleta;
        console.log(`📊 TOTAL DE REGISTROS OBSOLETA: ${totalObsolenta}`);

        // Total combinado
        const totalObsoletosCombinado = totalObsoletos + totalObsolenta;
        console.log(`📊 TOTAL OBSOLETOS + OBSOLETA: ${totalObsoletosCombinado}`);

        // Mostrar algunos ejemplos de registros obsoletos
        if (totalObsoletos > 0) {
            console.log('\n📋 EJEMPLOS DE REGISTROS OBSOLETOS:');
            const ejemplosResult = await client.query(`
                SELECT 
                    id, "codigoEFC", marca, modelo, condicion
                FROM inventory 
                WHERE condicion = 'OBSOLETO'
                ORDER BY id 
                LIMIT 10
            `);
            
            ejemplosResult.rows.forEach((item, index) => {
                console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - ${item.marca} ${item.modelo} - ${item.condicion}`);
            });
        }

        // Estadísticas generales
        const statsResult = await client.query(`
            SELECT 
                COUNT(*) as total_registros,
                COUNT(CASE WHEN condicion IS NOT NULL THEN 1 END) as con_condicion,
                COUNT(CASE WHEN condicion IS NULL THEN 1 END) as sin_condicion
            FROM inventory
        `);

        const stats = statsResult.rows[0];
        console.log('\n📊 ESTADÍSTICAS GENERALES:');
        console.log('================================================================================');
        console.log(`   Total registros: ${stats.total_registros}`);
        console.log(`   Con condición: ${stats.con_condicion}`);
        console.log(`   Sin condición: ${stats.sin_condicion}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarObsoletos();
