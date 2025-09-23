const { Client } = require('pg');

async function verificarDatosPrecioFecha() {
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

        // Buscar registros con datos problemáticos
        const result = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "fecha_compra", "precioUnitarioSinIgv", 
                "anioCompra", observaciones
            FROM inventory 
            WHERE "codigoEFC" LIKE '%AP-615%' OR marca LIKE '%HPE%' OR modelo LIKE '%ARUBA%'
            ORDER BY id
        `);

        console.log(`\n🔍 Registros encontrados: ${result.rows.length}`);
        
        result.rows.forEach((item, index) => {
            console.log(`\n${index + 1}. ID: ${item.id}`);
            console.log(`   Código EFC: ${item.codigoEFC}`);
            console.log(`   Marca: ${item.marca}`);
            console.log(`   Modelo: ${item.modelo}`);
            console.log(`   Fecha Compra: ${item.fecha_compra}`);
            console.log(`   Precio Unitario: ${item.precioUnitarioSinIgv}`);
            console.log(`   Año Compra: ${item.anioCompra}`);
            console.log(`   Observaciones: ${item.observaciones}`);
        });

        // También buscar registros con precios que parecen fechas
        const result2 = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "precioUnitarioSinIgv"
            FROM inventory 
            WHERE "precioUnitarioSinIgv"::text ~ '^[0-9]{5}$'
            ORDER BY id
            LIMIT 10
        `);

        console.log(`\n🔍 Registros con precios que parecen fechas (5 dígitos): ${result2.rows.length}`);
        
        result2.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} - Código: ${item.codigoEFC} - Precio: ${item.precioUnitarioSinIgv}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarDatosPrecioFecha();
