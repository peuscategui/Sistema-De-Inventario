const { Client } = require('pg');

async function verificarEstructuraInventory() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        console.log('🔌 Conectando a la base de datos de producción...');
        await client.connect();
        console.log('✅ Conectado a la base de datos');

        // Obtener la estructura de la tabla inventory
        const structureQuery = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'inventory' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        const result = await client.query(structureQuery);
        
        console.log('\n📋 Estructura de la tabla inventory:');
        console.log('=====================================');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
        });
        
        console.log(`\n📊 Total de columnas: ${result.rows.length}`);
        
        // Verificar si hay datos
        const countQuery = 'SELECT COUNT(*) FROM inventory';
        const countResult = await client.query(countQuery);
        console.log(`\n📊 Registros en la tabla: ${countResult.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarEstructuraInventory();
