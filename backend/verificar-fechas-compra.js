const { Client } = require('pg');

async function verificarFechasCompra() {
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

        // Verificar fechas de compra en la base de datos
        console.log('🔍 Verificando fechas de compra en la base de datos...');
        const result = await client.query(`
            SELECT 
                id,
                "codigoEFC",
                marca,
                modelo,
                "fecha_compra",
                "precioUnitarioSinIgv"
            FROM inventory 
            WHERE "fecha_compra" IS NOT NULL
            ORDER BY id
            LIMIT 10
        `);

        console.log(`📊 Registros con fecha_compra no null: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            console.log('\n📋 REGISTROS CON FECHA DE COMPRA:');
            result.rows.forEach((item, index) => {
                console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - Fecha: ${item.fecha_compra} - Precio: ${item.precioUnitarioSinIgv}`);
            });
        } else {
            console.log('❌ No hay registros con fecha_compra');
        }

        // Verificar todos los registros para ver el estado de fecha_compra
        console.log('\n🔍 Verificando estado general de fecha_compra...');
        const allResult = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT("fecha_compra") as con_fecha,
                COUNT(*) - COUNT("fecha_compra") as sin_fecha
            FROM inventory
        `);

        const stats = allResult.rows[0];
        console.log(`📊 Total registros: ${stats.total}`);
        console.log(`📊 Con fecha_compra: ${stats.con_fecha}`);
        console.log(`📊 Sin fecha_compra: ${stats.sin_fecha}`);

        // Verificar algunos registros específicos
        console.log('\n🔍 Verificando algunos registros específicos...');
        const sampleResult = await client.query(`
            SELECT 
                id,
                "codigoEFC",
                "fecha_compra",
                "precioUnitarioSinIgv"
            FROM inventory 
            ORDER BY id 
            LIMIT 5
        `);
        
        sampleResult.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - Fecha: ${item.fecha_compra} - Precio: ${item.precioUnitarioSinIgv}`);
        });

        // Verificar si hay datos de fecha en el CSV original
        console.log('\n🔍 Verificando datos de fecha en el CSV...');
        const fs = require('fs').promises;
        const path = require('path');
        
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        // Verificar las primeras 5 líneas de datos
        for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
            const line = lines[i];
            const columns = line.split(',');
            console.log(`\nLínea ${i + 1}:`);
            console.log(`   Código: ${columns[0]}`);
            console.log(`   Columna fecha_compra (25): "${columns[24]}"`);
            console.log(`   Columna precio (26): "${columns[25]}"`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarFechasCompra();
