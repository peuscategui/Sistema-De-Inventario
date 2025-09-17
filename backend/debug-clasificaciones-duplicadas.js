const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function debugClasificacionesDuplicadas() {
    const client = new Client({
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    });

    try {
        await client.connect();
        console.log('🔍 Investigando clasificaciones duplicadas...\n');

        // Buscar clasificaciones con el mismo nombre
        const res = await client.query(`
            SELECT 
                id,
                familia,
                COUNT(*) as cantidad
            FROM clasificacion 
            WHERE LOWER(familia) LIKE '%computadora%'
            GROUP BY id, familia
            ORDER BY familia, id
        `);

        console.log('📊 Clasificaciones de "Computadora" encontradas:');
        console.log('='.repeat(80));
        res.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Familia: "${row.familia}"`);
        });

        // Contar cuántos items hay en cada clasificación
        console.log('\n📊 Items por clasificación:');
        for (const row of res.rows) {
            const countRes = await client.query(
                'SELECT COUNT(*) FROM inventory WHERE "clasificacionId" = $1',
                [row.id]
            );
            console.log(`   ID ${row.id} ("${row.familia}"): ${countRes.rows[0].count} items`);
        }

        // Buscar duplicados exactos por nombre
        console.log('\n🔍 Buscando duplicados exactos por nombre:');
        const duplicadosRes = await client.query(`
            SELECT 
                familia,
                COUNT(*) as cantidad,
                STRING_AGG(id::text, ', ' ORDER BY id) as ids
            FROM clasificacion 
            GROUP BY familia 
            HAVING COUNT(*) > 1
            ORDER BY cantidad DESC
        `);

        if (duplicadosRes.rows.length > 0) {
            console.log('⚠️ Familias duplicadas:');
            duplicadosRes.rows.forEach(row => {
                console.log(`   "${row.familia}": ${row.cantidad} registros (IDs: ${row.ids})`);
            });
        } else {
            console.log('✅ No se encontraron duplicados exactos');
        }

    } catch (error) {
        console.error('❌ Error investigando clasificaciones:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Desconectado de la base de datos');
    }
}

debugClasificacionesDuplicadas();
