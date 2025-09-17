const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function verificarRegistrosFallidos() {
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

        // Leer el CSV y verificar cada registro que falló
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1); // Saltar header

        console.log('\n🔍 Verificando registros que fallaron...');

        // Líneas que reportaron error en el log anterior
        const lineasConError = [86, 87, 88, 89, 91, 94, 95, 96, 102, 103, 104, 105, 109, 110, 113, 116, 121, 122, 123, 125, 130, 134, 142, 166];

        lineasConError.forEach(lineNum => {
            const lineIndex = lineNum - 2; // Convertir a índice (línea 86 = índice 84)
            if (lineIndex >= 0 && lineIndex < dataLines.length) {
                const line = dataLines[lineIndex];
                const columns = line.split(',');
                
                if (columns.length >= 27) {
                    const codigoEFC = columns[0]?.trim();
                    const clasificacionId = columns[25]?.trim();
                    const empleadoId = columns[26]?.trim();
                    
                    console.log(`\n📋 Línea ${lineNum}: ${codigoEFC}`);
                    console.log(`   ClasificacionId: ${clasificacionId}`);
                    console.log(`   EmpleadoId: ${empleadoId}`);
                    console.log(`   Total columnas: ${columns.length}`);
                    
                    // Verificar si el clasificacionId existe
                    const clasificacionExiste = clasificaciones.rows.find(c => c.id == clasificacionId);
                    console.log(`   Clasificacion existe: ${clasificacionExiste ? 'SÍ' : 'NO'}`);
                    
                    if (clasificacionExiste) {
                        console.log(`   ✅ Clasificación válida: ${clasificacionExiste.familia}`);
                    } else {
                        console.log(`   ❌ Clasificación inválida: ID ${clasificacionId} no existe`);
                    }
                } else {
                    console.log(`\n📋 Línea ${lineNum}: Solo tiene ${columns.length} columnas`);
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

verificarRegistrosFallidos();
