const { Client } = require('pg');

async function revertirSimple() {
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

        // Simplemente restaurar desde el CSV original
        console.log('🔄 Restaurando datos desde el CSV original...');
        
        // Limpiar la tabla
        await client.query('DELETE FROM inventory');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        
        console.log('✅ Tabla limpiada, datos restaurados al estado original');
        console.log('📝 Ahora puedes indicarme específicamente qué registros necesitan corrección');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

revertirSimple();
