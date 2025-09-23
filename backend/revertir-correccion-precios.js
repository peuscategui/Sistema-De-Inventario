const { Client } = require('pg');

async function revertirCorreccionPrecios() {
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

        // Revertir todos los registros que fueron cambiados a precio 353
        const result = await client.query(`
            UPDATE inventory 
            SET 
                "precioUnitarioSinIgv" = "fecha_compra"::text::numeric,
                "fecha_compra" = null
            WHERE "precioUnitarioSinIgv"::text = '353'
        `);

        console.log(`\n📊 RESUMEN:`);
        console.log(`✅ Registros revertidos: ${result.rowCount}`);

        // Verificar algunos registros revertidos
        console.log(`\n🔍 Verificación de registros revertidos:`);
        const verificationResult = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "fecha_compra", "precioUnitarioSinIgv"
            FROM inventory 
            WHERE id IN (1, 2, 3, 4, 5)
            ORDER BY id
        `);

        verificationResult.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC}`);
            console.log(`   Fecha: ${item.fecha_compra}`);
            console.log(`   Precio: ${item.precioUnitarioSinIgv}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

revertirCorreccionPrecios();
