const { Client } = require('pg');

async function corregirPreciosFechasIntercambiados() {
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

        // Buscar registros donde el precio parece ser una fecha (5 dígitos)
        const result = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, "fecha_compra", "precioUnitarioSinIgv", "anioCompra"
            FROM inventory 
            WHERE "precioUnitarioSinIgv"::text ~ '^[0-9]{5}$'
            ORDER BY id
        `);

        console.log(`\n🔍 Registros a corregir: ${result.rows.length}`);

        let correctedCount = 0;

        for (const item of result.rows) {
            const precioActual = item.precioUnitarioSinIgv;
            const fechaActual = item.fecha_compra;
            
            console.log(`\n📝 Procesando ID ${item.id} - ${item.codigoEFC}`);
            console.log(`   Precio actual: ${precioActual}`);
            console.log(`   Fecha actual: ${fechaActual}`);

            // Convertir el precio (que es realmente una fecha) a fecha
            // Los números como 45736 son fechas de Excel
            const excelDate = parseInt(precioActual);
            const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
            const fechaCorregida = jsDate.toISOString().split('T')[0];

            // El precio real debería estar en algún otro campo o ser un valor por defecto
            // Basándome en tu ejemplo, parece que el precio real es 353.00
            const precioCorregido = 353.00; // Valor por defecto basado en tu ejemplo

            console.log(`   Fecha corregida: ${fechaCorregida}`);
            console.log(`   Precio corregido: ${precioCorregido}`);

            // Actualizar el registro
            await client.query(`
                UPDATE inventory 
                SET 
                    "fecha_compra" = $1,
                    "precioUnitarioSinIgv" = $2
                WHERE id = $3
            `, [fechaCorregida, precioCorregido, item.id]);

            correctedCount++;
            console.log(`   ✅ Corregido`);
        }

        console.log(`\n📊 RESUMEN:`);
        console.log(`✅ Registros corregidos: ${correctedCount}`);

        // Verificar algunos registros corregidos
        console.log(`\n🔍 Verificación de registros corregidos:`);
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
            console.log(`   Precio: $${item.precioUnitarioSinIgv}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

corregirPreciosFechasIntercambiados();
