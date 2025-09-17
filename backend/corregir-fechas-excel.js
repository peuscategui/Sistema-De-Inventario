const { Client } = require('pg');

async function corregirFechasExcel() {
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

        // Obtener registros con fechas incorrectas
        const result = await client.query(`
            SELECT 
                id, "codigoEFC", "fecha_compra", "precioUnitarioSinIgv"
            FROM inventory 
            WHERE "fecha_compra" IS NOT NULL
            ORDER BY id 
            LIMIT 10
        `);

        console.log('🔍 Verificando fechas actuales...');
        result.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - Fecha: ${item.fecha_compra} - Precio: ${item.precioUnitarioSinIgv}`);
        });

        // Función para convertir número de Excel a fecha
        function excelDateToJSDate(excelDate) {
            const excelEpoch = new Date(1900, 0, 1);
            const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
            return jsDate;
        }

        // Obtener todos los registros que necesitan corrección
        const allRecords = await client.query(`
            SELECT 
                id, "precioUnitarioSinIgv"
            FROM inventory 
            WHERE "precioUnitarioSinIgv" IS NOT NULL 
            AND "precioUnitarioSinIgv" ~ '^[0-9]+$'
            ORDER BY id
        `);

        console.log(`\n🔧 Corrigiendo fechas para ${allRecords.rows.length} registros...`);

        let correctedCount = 0;
        for (const record of allRecords.rows) {
            const excelDate = parseFloat(record.precioUnitarioSinIgv);
            
            if (!isNaN(excelDate) && excelDate > 0) {
                try {
                    const jsDate = excelDateToJSDate(excelDate);
                    
                    // Verificar que la fecha sea válida y no sea 1900
                    if (jsDate.getFullYear() > 1900 && jsDate.getFullYear() < 2030) {
                        const fechaFormateada = jsDate.toISOString().split('T')[0];
                        
                        await client.query(
                            'UPDATE inventory SET "fecha_compra" = $1 WHERE id = $2',
                            [fechaFormateada, record.id]
                        );
                        
                        correctedCount++;
                        
                        if (correctedCount <= 5) {
                            console.log(`   ✅ ID ${record.id}: ${excelDate} -> ${fechaFormateada}`);
                        }
                    }
                } catch (error) {
                    console.log(`   ❌ Error con ID ${record.id}: ${error.message}`);
                }
            }
        }

        console.log(`\n📊 Fechas corregidas: ${correctedCount}`);

        // Verificar el resultado final
        console.log('\n🔍 Verificando fechas después de la corrección...');
        const finalResult = await client.query(`
            SELECT 
                id, "codigoEFC", "fecha_compra", "precioUnitarioSinIgv"
            FROM inventory 
            WHERE "fecha_compra" IS NOT NULL
            ORDER BY id 
            LIMIT 10
        `);

        finalResult.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - Fecha: ${item.fecha_compra} - Precio: ${item.precioUnitarioSinIgv}`);
        });

        // Estadísticas finales
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT("fecha_compra") as con_fecha,
                COUNT(*) - COUNT("fecha_compra") as sin_fecha
            FROM inventory
        `);

        const finalStats = stats.rows[0];
        console.log(`\n📊 ESTADÍSTICAS FINALES:`);
        console.log(`   Total registros: ${finalStats.total}`);
        console.log(`   Con fecha_compra: ${finalStats.con_fecha}`);
        console.log(`   Sin fecha_compra: ${finalStats.sin_fecha}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

corregirFechasExcel();
