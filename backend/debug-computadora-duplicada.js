const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function debugComputadoraDuplicada() {
    const client = new Client({
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    });

    try {
        await client.connect();
        console.log('🔍 Investigando duplicados de "Computadora"...\n');

        // Buscar todas las variaciones de "Computadora"
        const res = await client.query(`
            SELECT 
                familia,
                COUNT(*) as cantidad,
                STRING_AGG(DISTINCT "codigoEFC", ', ' ORDER BY "codigoEFC") as codigos_ejemplo
            FROM inventory 
            WHERE LOWER(familia) LIKE '%computadora%' 
               OR LOWER(familia) LIKE '%computador%'
               OR LOWER(familia) LIKE '%laptop%'
               OR LOWER(familia) LIKE '%desktop%'
            GROUP BY familia 
            ORDER BY cantidad DESC
        `);

        console.log('📊 Variaciones encontradas de "Computadora":');
        console.log('='.repeat(80));
        res.rows.forEach((row, index) => {
            console.log(`${index + 1}. "${row.familia}": ${row.cantidad} items`);
            console.log(`   Códigos ejemplo: ${row.codigos_ejemplo.substring(0, 100)}...`);
            console.log('-'.repeat(40));
        });

        // Buscar duplicados exactos
        console.log('\n🔍 Buscando duplicados exactos...');
        const duplicadosRes = await client.query(`
            SELECT 
                familia,
                COUNT(*) as cantidad
            FROM inventory 
            GROUP BY familia 
            HAVING COUNT(*) > 1
            ORDER BY cantidad DESC
        `);

        if (duplicadosRes.rows.length > 0) {
            console.log('⚠️ Familias con múltiples registros:');
            duplicadosRes.rows.forEach(row => {
                console.log(`   "${row.familia}": ${row.cantidad} items`);
            });
        } else {
            console.log('✅ No se encontraron duplicados exactos');
        }

        // Verificar si hay espacios o caracteres especiales
        console.log('\n🔍 Verificando caracteres especiales en "Computadora"...');
        const espaciosRes = await client.query(`
            SELECT 
                familia,
                LENGTH(familia) as longitud,
                ASCII(SUBSTRING(familia, 1, 1)) as primer_char,
                ASCII(SUBSTRING(familia, -1, 1)) as ultimo_char
            FROM inventory 
            WHERE familia ILIKE '%computadora%'
            GROUP BY familia, LENGTH(familia), ASCII(SUBSTRING(familia, 1, 1)), ASCII(SUBSTRING(familia, -1, 1))
            ORDER BY familia
        `);

        console.log('📊 Análisis de caracteres:');
        espaciosRes.rows.forEach(row => {
            console.log(`   "${row.familia}" (longitud: ${row.longitud}, primer: ${row.primer_char}, último: ${row.ultimo_char})`);
        });

    } catch (error) {
        console.error('❌ Error investigando duplicados:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Desconectado de la base de datos');
    }
}

debugComputadoraDuplicada();
