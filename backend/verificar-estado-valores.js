const { Client } = require('pg');

async function verificarEstadoValores() {
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

        // Verificar valores únicos de estado
        console.log('🔍 Valores únicos de estado...');
        const valoresUnicos = await client.query(`
            SELECT DISTINCT estado, COUNT(*) as count
            FROM inventory
            WHERE estado IS NOT NULL
            GROUP BY estado
            ORDER BY count DESC
        `);

        console.log(`📊 Valores únicos de estado:`);
        valoresUnicos.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. "${item.estado}" (${item.count} registros)`);
        });

        // También verificar algunos registros específicos
        console.log('\n🔍 Verificando algunos registros específicos...');
        const registrosResult = await client.query(`
            SELECT 
                "codigoEFC",
                estado,
                "ubicacionEquipo",
                condicion
            FROM inventory
            ORDER BY id
            LIMIT 10
        `);

        console.log(`📊 Primeros 10 registros:`);
        registrosResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.codigoEFC} - Estado: "${item.estado}" - Ubicación: "${item.ubicacionEquipo}" - Condición: "${item.condicion}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarEstadoValores();
