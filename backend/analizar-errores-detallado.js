const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function analizarErroresDetallado() {
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
        const clasificaciones = await client.query('SELECT id FROM clasificacion ORDER BY id');
        const idsClasificacion = new Set(clasificaciones.rows.map(row => row.id));
        console.log(`📊 Clasificaciones disponibles: ${idsClasificacion.size} (IDs: ${Array.from(idsClasificacion).join(', ')})`);

        // Leer el archivo CSV
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        let fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });

        // Limpiar el contenido
        const cleanedLines = fileContent.split('\n').map(line => {
            let cleanedLine = line.replace(/,(\s*)/g, ',');
            cleanedLine = cleanedLine.replace(/\$(\d+),(\d{2})/g, '$1.$2');
            return cleanedLine.trim();
        }).filter(line => line.length > 0);

        const lines = cleanedLines;
        const dataLines = lines.slice(1); // Saltar header

        // Líneas que reportaron error en el log anterior
        const lineasConError = [166, 207, 211, 341, 345, 351, 352, 364, 408, 488, 489, 491, 505, 506];

        console.log('\n🔍 ANÁLISIS DETALLADO DE LOS 14 REGISTROS CON ERROR:');
        console.log('='.repeat(80));

        for (const lineNum of lineasConError) {
            const lineIndex = lineNum - 2; // Convertir a índice
            if (lineIndex >= 0 && lineIndex < dataLines.length) {
                const line = dataLines[lineIndex];
                const columns = line.split(',');
                
                console.log(`\n📋 Línea ${lineNum}: ${columns[0]}`);
                console.log(`   Total de columnas: ${columns.length}`);
                
                // Mostrar las columnas relevantes
                console.log(`   Columna 6 (anio): "${columns[6]}"`);
                console.log(`   Columna 24 (precio): "${columns[24]}"`);
                console.log(`   Columna 25 (clasificacionId): "${columns[25]}"`);
                console.log(`   Columna 26 (empleadoId): "${columns[26]}"`);
                
                // Verificar clasificacionId
                const clasificacionId = columns[25] ? parseInt(columns[25]) : null;
                const clasificacionExiste = clasificacionId ? idsClasificacion.has(clasificacionId) : false;
                console.log(`   ClasificacionId existe: ${clasificacionExiste} (ID: ${clasificacionId})`);
                
                // Verificar empleadoId
                const empleadoId = columns[26] ? parseInt(columns[26]) : null;
                console.log(`   EmpleadoId: ${empleadoId}`);
                
                // Verificar si hay comas en el precio que puedan estar causando problemas
                const precioOriginal = columns[24];
                const precioConComas = precioOriginal.includes(',');
                console.log(`   Precio tiene comas: ${precioConComas} (Original: "${precioOriginal}")`);
                
                // Mostrar la línea completa para debug
                console.log(`   Línea completa: ${line.substring(0, 150)}...`);
            }
        }

        // Verificar específicamente LT-00247
        console.log('\n🔍 VERIFICACIÓN ESPECÍFICA DE LT-00247:');
        console.log('='.repeat(50));
        
        const lt00247Index = dataLines.findIndex(line => line.startsWith('LT-00247,'));
        if (lt00247Index !== -1) {
            const line = dataLines[lt00247Index];
            const columns = line.split(',');
            console.log(`Línea encontrada en índice: ${lt00247Index + 2}`);
            console.log(`Total de columnas: ${columns.length}`);
            console.log(`ClasificacionId: "${columns[25]}"`);
            console.log(`EmpleadoId: "${columns[26]}"`);
            console.log(`Línea completa: ${line}`);
        } else {
            console.log('❌ LT-00247 no encontrado en el archivo');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

analizarErroresDetallado();
