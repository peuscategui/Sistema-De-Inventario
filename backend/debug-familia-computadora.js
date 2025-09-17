const { Client } = require('pg');

async function debugFamiliaComputadora() {
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

        // 1. Verificar la lógica de "Familia más común" (como en dashboard.controller.ts)
        console.log('🔍 Verificando lógica de "Familia más común"...');
        const familiaMasComun = await client.query(`
            SELECT 
                "clasificacionId",
                COUNT(*) as cantidad
            FROM inventory 
            GROUP BY "clasificacionId"
            ORDER BY cantidad DESC
            LIMIT 1
        `);

        console.log('Resultado de familia más común:');
        console.log(`Clasificación ID: ${familiaMasComun.rows[0].clasificacionId}`);
        console.log(`Cantidad: ${familiaMasComun.rows[0].cantidad}`);

        // Obtener el nombre de la clasificación más común
        if (familiaMasComun.rows.length > 0 && familiaMasComun.rows[0].clasificacionId) {
            const clasificacion = await client.query(`
                SELECT familia FROM clasificacion WHERE id = $1
            `, [familiaMasComun.rows[0].clasificacionId]);
            
            console.log(`Familia: ${clasificacion.rows[0].familia}`);
        }

        // 2. Verificar la lógica de "Distribución por Familias" (como en getDistribucionFamilia)
        console.log('\n🔍 Verificando lógica de "Distribución por Familias"...');
        const distribucion = await client.query(`
            SELECT 
                "clasificacionId",
                COUNT(*) as cantidad
            FROM inventory 
            GROUP BY "clasificacionId"
            ORDER BY cantidad DESC
        `);

        console.log('Distribución por clasificación ID:');
        distribucion.rows.forEach((item, index) => {
            console.log(`${index + 1}. Clasificación ID ${item.clasificacionId}: ${item.cantidad} equipos`);
        });

        // Obtener nombres de las clasificaciones
        const clasificaciones = await client.query(`
            SELECT id, familia FROM clasificacion
        `);

        console.log('\nClasificaciones disponibles:');
        clasificaciones.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID ${item.id}: ${item.familia}`);
        });

        // Agrupar por familia (sumando los conteos de las diferentes sub-familias)
        const familiaCounts = new Map();
        
        distribucion.rows.forEach(item => {
            const clasificacion = clasificaciones.rows.find(c => c.id === item.clasificacionId);
            const familia = clasificacion?.familia || 'Sin clasificar';
            
            if (familiaCounts.has(familia)) {
                familiaCounts.set(familia, familiaCounts.get(familia) + item.cantidad);
            } else {
                familiaCounts.set(familia, item.cantidad);
            }
        });

        console.log('\nDistribución agrupada por familia:');
        const resultado = Array.from(familiaCounts.entries())
            .map(([familia, count]) => ({ familia, count }))
            .sort((a, b) => b.count - a.count);

        resultado.forEach((item, index) => {
            console.log(`${index + 1}. ${item.familia}: ${item.count} equipos`);
        });

        // 3. Verificar específicamente las clasificaciones de "Computadora"
        console.log('\n🔍 Verificando clasificaciones de "Computadora"...');
        const computadoras = await client.query(`
            SELECT 
                c.id,
                c.familia,
                c.tipo_equipo,
                c.sub_familia,
                COUNT(i.id) as cantidad
            FROM clasificacion c
            LEFT JOIN inventory i ON c.id = i."clasificacionId"
            WHERE c.familia = 'Computadora'
            GROUP BY c.id, c.familia, c.tipo_equipo, c.sub_familia
            ORDER BY cantidad DESC
        `);

        console.log('Clasificaciones de Computadora:');
        computadoras.rows.forEach((item, index) => {
            console.log(`${index + 1}. ID ${item.id} - ${item.tipo_equipo} (${item.sub_familia}): ${item.cantidad} equipos`);
        });

        const totalComputadoras = computadoras.rows.reduce((sum, item) => sum + parseInt(item.cantidad), 0);
        console.log(`\nTotal de equipos de Computadora: ${totalComputadoras}`);

        // 4. Verificar si hay registros sin clasificación
        console.log('\n🔍 Verificando registros sin clasificación...');
        const sinClasificacion = await client.query(`
            SELECT COUNT(*) as cantidad
            FROM inventory 
            WHERE "clasificacionId" IS NULL
        `);

        console.log(`Registros sin clasificación: ${sinClasificacion.rows[0].cantidad}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

debugFamiliaComputadora();
