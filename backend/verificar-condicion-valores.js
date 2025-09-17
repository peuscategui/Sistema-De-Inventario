const { Client } = require('pg');

async function verificarCondicionValores() {
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

        // Verificar valores únicos de condicion
        console.log('🔍 Valores únicos de condicion...');
        const valoresUnicos = await client.query(`
            SELECT DISTINCT condicion, COUNT(*) as count
            FROM inventory
            WHERE condicion IS NOT NULL
            GROUP BY condicion
            ORDER BY count DESC
        `);

        console.log(`📊 Valores únicos de condicion:`);
        valoresUnicos.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. "${item.condicion}" (${item.count} registros)`);
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

verificarCondicionValores();
