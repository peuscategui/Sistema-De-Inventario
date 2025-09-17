const { Client } = require('pg');

async function verificarCodigo() {
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

        // Verificar si IMPTINTAEPS0008 existe
        const result = await client.query(
            'SELECT id, "codigoEFC", marca, modelo FROM inventory WHERE "codigoEFC" = $1',
            ['IMPTINTAEPS0008']
        );

        if (result.rows.length > 0) {
            console.log('✅ IMPTINTAEPS0008 ya existe en la base de datos:');
            result.rows.forEach(row => {
                console.log(`   ID: ${row.id}, Código: ${row.codigoefc}, Marca: ${row.marca}, Modelo: ${row.modelo}`);
            });
        } else {
            console.log('❌ IMPTINTAEPS0008 NO existe en la base de datos');
        }

        // Verificar si IMPTINTAEPS0007 existe
        const result2 = await client.query(
            'SELECT id, "codigoEFC", marca, modelo FROM inventory WHERE "codigoEFC" = $1',
            ['IMPTINTAEPS0007']
        );

        if (result2.rows.length > 0) {
            console.log('\n✅ IMPTINTAEPS0007 ya existe en la base de datos:');
            result2.rows.forEach(row => {
                console.log(`   ID: ${row.id}, Código: ${row.codigoefc}, Marca: ${row.marca}, Modelo: ${row.modelo}`);
            });
        } else {
            console.log('\n❌ IMPTINTAEPS0007 NO existe en la base de datos');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarCodigo();
