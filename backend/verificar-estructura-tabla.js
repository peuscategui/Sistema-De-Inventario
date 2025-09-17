const { Client } = require('pg');

async function verificarEstructuraTabla() {
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

        // Verificar la estructura de la tabla inventory
        const result = await client.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'inventory' 
            ORDER BY ordinal_position
        `);

        console.log('📋 ESTRUCTURA DE LA TABLA INVENTORY:');
        console.log('================================================================================');
        console.log(`Total de columnas: ${result.rows.length}`);
        
        result.rows.forEach((column, index) => {
            console.log(`${index + 1}. ${column.column_name} (${column.data_type}) - Nullable: ${column.is_nullable} - Default: ${column.column_default || 'NULL'}`);
        });

        // Verificar si hay algún registro en la tabla
        const countResult = await client.query('SELECT COUNT(*) as total FROM inventory');
        console.log(`\n📊 Total de registros en la tabla: ${countResult.rows[0].total}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarEstructuraTabla();
