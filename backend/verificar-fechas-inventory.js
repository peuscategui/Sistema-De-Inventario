const { Client } = require('pg');

async function verificarFechas() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'inventario',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔌 Conectando a la base de datos...');

        // Verificar fechas problemáticas
        const result = await client.query(`
            SELECT id, "codigoEFC", fecha_compra 
            FROM inventory 
            WHERE fecha_compra IS NOT NULL 
            ORDER BY id 
            LIMIT 10
        `);

        console.log('📅 Fechas en la base de datos:');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}, Código: ${row.codigoEFC}, Fecha: ${row.fecha_compra} (Tipo: ${typeof row.fecha_compra})`);
        });

        // Verificar si hay fechas inválidas
        const invalidDates = await client.query(`
            SELECT id, "codigoEFC", fecha_compra 
            FROM inventory 
            WHERE fecha_compra IS NOT NULL 
            AND (fecha_compra < '1900-01-01' OR fecha_compra > '2100-01-01')
        `);

        console.log(`\n❌ Fechas inválidas encontradas: ${invalidDates.rows.length}`);
        if (invalidDates.rows.length > 0) {
            invalidDates.rows.forEach(row => {
                console.log(`ID: ${row.id}, Código: ${row.codigoEFC}, Fecha inválida: ${row.fecha_compra}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarFechas();
