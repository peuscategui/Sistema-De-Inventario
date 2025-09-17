const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function checkCamaras() {
    const client = new Client({
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    });

    try {
        await client.connect();
        console.log('🔍 Revisando items de cámaras...\n');

        // Buscar por diferentes variaciones de "cámara"
        const queries = [
            { term: 'cámara', query: "SELECT * FROM inventory WHERE LOWER(familia) LIKE '%cámara%' OR LOWER(familia) LIKE '%camara%'" },
            { term: 'camera', query: "SELECT * FROM inventory WHERE LOWER(familia) LIKE '%camera%'" },
            { term: 'cam', query: "SELECT * FROM inventory WHERE LOWER(familia) LIKE '%cam%'" },
            { term: 'video', query: "SELECT * FROM inventory WHERE LOWER(familia) LIKE '%video%'" }
        ];

        let totalCamaras = 0;
        const allCamaras = [];

        for (const { term, query } of queries) {
            console.log(`🔍 Buscando por "${term}":`);
            const res = await client.query(query);
            console.log(`   Encontrados: ${res.rows.length} items`);
            
            if (res.rows.length > 0) {
                res.rows.forEach(item => {
                    if (!allCamaras.find(c => c.id === item.id)) {
                        allCamaras.push(item);
                        totalCamaras++;
                    }
                });
            }
            console.log('');
        }

        console.log(`📊 Total de cámaras únicas encontradas: ${totalCamaras}\n`);

        if (allCamaras.length > 0) {
            console.log('📋 Lista de cámaras:');
            console.log('='.repeat(80));
            allCamaras.forEach((item, index) => {
                console.log(`${index + 1}. Código: ${item.codigoEFC}`);
                console.log(`   Familia: ${item.familia}`);
                console.log(`   Marca: ${item.marca}`);
                console.log(`   Modelo: ${item.modelo}`);
                console.log(`   Estado: ${item.estado}`);
                console.log(`   Condición: ${item.condicion}`);
                console.log(`   Ubicación: ${item.ubicacionEquipo}`);
                console.log(`   Empleado ID: ${item.empleadoId}`);
                console.log('-'.repeat(40));
            });

            // Estadísticas por estado
            console.log('\n📊 Estadísticas por estado:');
            const estadoStats = {};
            allCamaras.forEach(item => {
                estadoStats[item.estado] = (estadoStats[item.estado] || 0) + 1;
            });
            Object.entries(estadoStats).forEach(([estado, count]) => {
                console.log(`   ${estado}: ${count} items`);
            });

            // Estadísticas por condición
            console.log('\n📊 Estadísticas por condición:');
            const condicionStats = {};
            allCamaras.forEach(item => {
                condicionStats[item.condicion] = (condicionStats[item.condicion] || 0) + 1;
            });
            Object.entries(condicionStats).forEach(([condicion, count]) => {
                console.log(`   ${condicion}: ${count} items`);
            });

            // Estadísticas por ubicación
            console.log('\n📊 Estadísticas por ubicación:');
            const ubicacionStats = {};
            allCamaras.forEach(item => {
                ubicacionStats[item.ubicacionEquipo] = (ubicacionStats[item.ubicacionEquipo] || 0) + 1;
            });
            Object.entries(ubicacionStats).forEach(([ubicacion, count]) => {
                console.log(`   ${ubicacion}: ${count} items`);
            });
        }

    } catch (error) {
        console.error('❌ Error revisando cámaras:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Desconectado de la base de datos');
    }
}

checkCamaras();
