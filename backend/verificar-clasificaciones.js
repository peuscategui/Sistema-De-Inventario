const { Client } = require('pg');

async function verificarClasificaciones() {
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

        // Obtener todas las clasificaciones disponibles
        const clasificaciones = await client.query('SELECT id, familia FROM clasificacion ORDER BY id');
        console.log('📊 Clasificaciones disponibles:');
        clasificaciones.rows.forEach(row => {
            console.log(`   ID: ${row.id} - ${row.familia}`);
        });

        // Obtener los clasificacionId que se intentaron usar en el CSV
        const fs = require('fs').promises;
        const path = require('path');
        
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1); // Saltar header

        const clasificacionIdsUsados = new Set();
        dataLines.forEach(line => {
            const columns = line.split(',');
            if (columns.length >= 26) {
                const clasificacionId = columns[25]?.trim();
                if (clasificacionId && !isNaN(clasificacionId)) {
                    clasificacionIdsUsados.add(parseInt(clasificacionId));
                }
            }
        });

        console.log('\n📊 ClasificacionId usados en el CSV:');
        Array.from(clasificacionIdsUsados).sort((a, b) => a - b).forEach(id => {
            console.log(`   ID: ${id}`);
        });

        // Encontrar los IDs que no existen
        const idsExistentes = new Set(clasificaciones.rows.map(row => row.id));
        const idsNoExistentes = Array.from(clasificacionIdsUsados).filter(id => !idsExistentes.has(id));

        console.log('\n❌ ClasificacionId que NO existen en la base de datos:');
        idsNoExistentes.forEach(id => {
            console.log(`   ID: ${id}`);
        });

        // Mostrar los registros que fallaron
        console.log('\n📋 Registros que fallaron por clasificacionId inválido:');
        dataLines.forEach((line, index) => {
            const columns = line.split(',');
            if (columns.length >= 26) {
                const codigoEFC = columns[0]?.trim();
                const clasificacionId = columns[25]?.trim();
                if (clasificacionId && !isNaN(clasificacionId) && idsNoExistentes.includes(parseInt(clasificacionId))) {
                    console.log(`   Línea ${index + 2}: ${codigoEFC} - ClasificacionId: ${clasificacionId}`);
                }
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarClasificaciones();
