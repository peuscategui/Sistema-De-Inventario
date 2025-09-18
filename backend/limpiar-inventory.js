const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function limpiarInventory() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.79',
        database: 'inventario',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔗 Conectado a la base de datos PostgreSQL');

        // Verificar cuántos registros hay antes de limpiar
        const countBefore = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory antes de limpiar: ${countBefore.rows[0].count}`);

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        const deleteResult = await client.query('DELETE FROM inventory');
        console.log(`✅ Eliminados ${deleteResult.rowCount} registros de inventory`);

        // Verificar que la tabla esté vacía
        const countAfter = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory después de limpiar: ${countAfter.rows[0].count}`);

        // Resetear la secuencia del ID
        console.log('🔄 Reseteando secuencia del ID...');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Secuencia reseteada');

        console.log('\n🎉 Tabla inventory limpiada exitosamente');
        console.log('📋 Próximo paso: Cargar los datos corregidos');

    } catch (error) {
        console.error('❌ Error limpiando la tabla inventory:', error);
    } finally {
        await client.end();
        console.log('🔌 Desconectado de la base de datos');
    }
}

limpiarInventory();




async function limpiarInventory() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.79',
        database: 'inventario',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔗 Conectado a la base de datos PostgreSQL');

        // Verificar cuántos registros hay antes de limpiar
        const countBefore = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory antes de limpiar: ${countBefore.rows[0].count}`);

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        const deleteResult = await client.query('DELETE FROM inventory');
        console.log(`✅ Eliminados ${deleteResult.rowCount} registros de inventory`);

        // Verificar que la tabla esté vacía
        const countAfter = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory después de limpiar: ${countAfter.rows[0].count}`);

        // Resetear la secuencia del ID
        console.log('🔄 Reseteando secuencia del ID...');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Secuencia reseteada');

        console.log('\n🎉 Tabla inventory limpiada exitosamente');
        console.log('📋 Próximo paso: Cargar los datos corregidos');

    } catch (error) {
        console.error('❌ Error limpiando la tabla inventory:', error);
    } finally {
        await client.end();
        console.log('🔌 Desconectado de la base de datos');
    }
}

limpiarInventory();








async function limpiarInventory() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.79',
        database: 'inventario',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔗 Conectado a la base de datos PostgreSQL');

        // Verificar cuántos registros hay antes de limpiar
        const countBefore = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory antes de limpiar: ${countBefore.rows[0].count}`);

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        const deleteResult = await client.query('DELETE FROM inventory');
        console.log(`✅ Eliminados ${deleteResult.rowCount} registros de inventory`);

        // Verificar que la tabla esté vacía
        const countAfter = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory después de limpiar: ${countAfter.rows[0].count}`);

        // Resetear la secuencia del ID
        console.log('🔄 Reseteando secuencia del ID...');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Secuencia reseteada');

        console.log('\n🎉 Tabla inventory limpiada exitosamente');
        console.log('📋 Próximo paso: Cargar los datos corregidos');

    } catch (error) {
        console.error('❌ Error limpiando la tabla inventory:', error);
    } finally {
        await client.end();
        console.log('🔌 Desconectado de la base de datos');
    }
}

limpiarInventory();




async function limpiarInventory() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.79',
        database: 'inventario',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('🔗 Conectado a la base de datos PostgreSQL');

        // Verificar cuántos registros hay antes de limpiar
        const countBefore = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory antes de limpiar: ${countBefore.rows[0].count}`);

        // Limpiar la tabla inventory
        console.log('🧹 Limpiando tabla inventory...');
        const deleteResult = await client.query('DELETE FROM inventory');
        console.log(`✅ Eliminados ${deleteResult.rowCount} registros de inventory`);

        // Verificar que la tabla esté vacía
        const countAfter = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Registros en inventory después de limpiar: ${countAfter.rows[0].count}`);

        // Resetear la secuencia del ID
        console.log('🔄 Reseteando secuencia del ID...');
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('✅ Secuencia reseteada');

        console.log('\n🎉 Tabla inventory limpiada exitosamente');
        console.log('📋 Próximo paso: Cargar los datos corregidos');

    } catch (error) {
        console.error('❌ Error limpiando la tabla inventory:', error);
    } finally {
        await client.end();
        console.log('🔌 Desconectado de la base de datos');
    }
}

limpiarInventory();






