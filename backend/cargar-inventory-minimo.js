const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function cargarInventoryMinimo() {
    const client = new Client({
        user: 'postgres',
        host: '192.168.40.129',
        database: 'postgres',
        password: 'postgres',
        port: 5432,
    });

    try {
        console.log('🔌 Conectando a la base de datos de producción...');
        await client.connect();
        console.log('✅ Conectado a la base de datos');

        // Limpiar la tabla primero
        console.log('🧹 Limpiando tabla inventory...');
        const deleteResult = await client.query('DELETE FROM inventory');
        console.log(`🗑️ Eliminados ${deleteResult.rowCount} registros existentes`);

        // Resetear la secuencia
        await client.query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
        console.log('🔄 Secuencia del ID reseteada');

        // Leer el archivo limpio
        console.log('📂 Cargando datos del archivo limpio...');
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory_limpio.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Procesar cada línea (saltando header)
        let registrosCargados = 0;
        let errores = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const columns = line.split(',');
                
                // Insertar solo las columnas básicas necesarias
                const insertQuery = `
                    INSERT INTO inventory (
                        "codigoEFC", marca, modelo, descripcion, serie, procesador, anio, 
                        ram, "discoDuro", "sistemaOperativo", status, estado, "ubicacionEquipo", 
                        "qUsuarios", condicion, "clasificacionId", "empleadoId"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
                    )
                `;
                
                const values = [
                    columns[0] || null,  // codigoEFC
                    columns[1] || null,  // marca
                    columns[2] || null,  // modelo
                    columns[3] || null,  // descripcion
                    columns[4] || null,  // serie
                    columns[5] || null,  // procesador
                    columns[6] ? parseInt(columns[6]) : null,  // anio
                    columns[7] || null,  // ram
                    columns[8] || null,  // discoDuro
                    columns[9] || null,  // sistemaOperativo
                    columns[10] || null, // status
                    columns[11] || null, // estado
                    columns[12] || null, // ubicacionEquipo
                    columns[13] ? parseInt(columns[13]) : 1,  // qUsuarios
                    columns[14] || null, // condicion
                    columns[25] ? parseInt(columns[25]) : null, // clasificacionId
                    columns[26] ? parseInt(columns[26]) : null  // empleadoId
                ];
                
                await client.query(insertQuery, values);
                registrosCargados++;
                
                if (registrosCargados % 50 === 0) {
                    console.log(`📝 Cargados ${registrosCargados} registros...`);
                }
                
            } catch (error) {
                console.log(`❌ Error en línea ${i + 1}: ${error.message}`);
                console.log(`   Datos: ${line.substring(0, 100)}...`);
                errores++;
            }
        }
        
        console.log(`\n✅ Carga completada:`);
        console.log(`   - Registros cargados: ${registrosCargados}`);
        console.log(`   - Errores: ${errores}`);
        
        // Verificar el total
        const countResult = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${countResult.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarInventoryMinimo();
