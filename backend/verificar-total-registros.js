const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function verificarTotalRegistros() {
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

        // Contar registros en la base de datos
        const dbCount = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la base de datos: ${dbCount.rows[0].count}`);

        // Contar líneas en el CSV
        const csvFilePath = path.join(__dirname, 'excel-templates', '05_inventory.csv');
        const fileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1); // Saltar header
        
        console.log(`📊 Total de líneas en el CSV: ${lines.length}`);
        console.log(`📊 Líneas de datos en el CSV: ${dataLines.length}`);

        // Verificar cuántos registros únicos hay por código EFC
        const codigosUnicos = new Set();
        dataLines.forEach(line => {
            const columns = line.split(',');
            if (columns.length > 0) {
                const codigoEFC = columns[0]?.trim();
                if (codigoEFC) {
                    codigosUnicos.add(codigoEFC);
                }
            }
        });

        console.log(`📊 Códigos EFC únicos en el CSV: ${codigosUnicos.size}`);

        // Verificar si hay duplicados en el CSV
        const codigosConDuplicados = [];
        const codigosVistos = new Map();
        
        dataLines.forEach((line, index) => {
            const columns = line.split(',');
            if (columns.length > 0) {
                const codigoEFC = columns[0]?.trim();
                if (codigoEFC) {
                    if (codigosVistos.has(codigoEFC)) {
                        codigosConDuplicados.push({
                            codigo: codigoEFC,
                            linea1: codigosVistos.get(codigoEFC),
                            linea2: index + 2
                        });
                    } else {
                        codigosVistos.set(codigoEFC, index + 2);
                    }
                }
            }
        });

        if (codigosConDuplicados.length > 0) {
            console.log(`\n⚠️ Códigos EFC duplicados en el CSV:`);
            codigosConDuplicados.forEach(dup => {
                console.log(`   ${dup.codigo}: líneas ${dup.linea1} y ${dup.linea2}`);
            });
        } else {
            console.log(`\n✅ No hay códigos EFC duplicados en el CSV`);
        }

        // Verificar registros en la base de datos por código EFC
        const registrosEnBD = await client.query('SELECT "codigoEFC" FROM inventory ORDER BY "codigoEFC"');
        const codigosEnBD = new Set(registrosEnBD.rows.map(row => row.codigoEFC));
        
        console.log(`\n📊 Códigos EFC únicos en la base de datos: ${codigosEnBD.size}`);

        // Encontrar códigos que están en el CSV pero no en la BD
        const codigosFaltantes = Array.from(codigosUnicos).filter(codigo => !codigosEnBD.has(codigo));
        if (codigosFaltantes.length > 0) {
            console.log(`\n❌ Códigos EFC que están en el CSV pero NO en la BD (${codigosFaltantes.length}):`);
            codigosFaltantes.forEach(codigo => {
                console.log(`   ${codigo}`);
            });
        }

        // Encontrar códigos que están en la BD pero no en el CSV
        const codigosExtra = Array.from(codigosEnBD).filter(codigo => !codigosUnicos.has(codigo));
        if (codigosExtra.length > 0) {
            console.log(`\n➕ Códigos EFC que están en la BD pero NO en el CSV (${codigosExtra.length}):`);
            codigosExtra.forEach(codigo => {
                console.log(`   ${codigo}`);
            });
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   - CSV tiene ${codigosUnicos.size} códigos únicos`);
        console.log(`   - BD tiene ${codigosEnBD.size} códigos únicos`);
        console.log(`   - Faltantes: ${codigosFaltantes.length}`);
        console.log(`   - Extra: ${codigosExtra.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

verificarTotalRegistros();
