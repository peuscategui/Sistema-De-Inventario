const { Client } = require('pg');

async function corregirObsolenta() {
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

        // Primero verificar cuántos registros tienen "OBSOLETA"
        console.log('🔍 Verificando registros con condición "OBSOLETA"...');
        const obsoletaResult = await client.query(`
            SELECT 
                id, "codigoEFC", marca, modelo, condicion
            FROM inventory 
            WHERE condicion = 'OBSOLETA'
        `);

        console.log(`📊 Registros encontrados con "OBSOLETA": ${obsoletaResult.rows.length}`);
        
        if (obsoletaResult.rows.length > 0) {
            console.log('\n📋 REGISTROS A CORREGIR:');
            obsoletaResult.rows.forEach((item, index) => {
                console.log(`${index + 1}. ID: ${item.id} - ${item.codigoEFC} - ${item.marca} ${item.modelo} - ${item.condicion}`);
            });

            // Actualizar los registros
            console.log('\n🔧 Actualizando registros...');
            const updateResult = await client.query(`
                UPDATE inventory 
                SET condicion = 'OBSOLETO' 
                WHERE condicion = 'OBSOLETA'
            `);

            console.log(`✅ Registros actualizados: ${updateResult.rowCount}`);

            // Verificar el resultado
            console.log('\n🔍 Verificando después de la actualización...');
            const verificacionResult = await client.query(`
                SELECT 
                    condicion,
                    COUNT(*) as cantidad
                FROM inventory 
                WHERE condicion IN ('OBSOLETO', 'OBSOLETA')
                GROUP BY condicion
                ORDER BY cantidad DESC
            `);

            console.log('\n📊 DISTRIBUCIÓN DESPUÉS DE LA CORRECCIÓN:');
            verificacionResult.rows.forEach((item, index) => {
                console.log(`${index + 1}. ${item.condicion}: ${item.cantidad} registros`);
            });

            // Total de obsoletos
            const totalObsoletos = verificacionResult.rows.reduce((total, item) => {
                return total + (item.condicion === 'OBSOLETO' ? item.cantidad : 0);
            }, 0);

            console.log(`\n📊 TOTAL DE REGISTROS OBSOLETOS: ${totalObsoletos}`);

        } else {
            console.log('ℹ️ No se encontraron registros con condición "OBSOLETA"');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

corregirObsolenta();
