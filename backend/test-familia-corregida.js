const { Client } = require('pg');

async function testFamiliaCorregida() {
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

        // Simular la lógica corregida del dashboard
        console.log('🔍 Probando lógica corregida de "Familia más común"...');

        // Obtener distribución por clasificación
        const distribucion = await client.query(`
            SELECT 
                "clasificacionId",
                COUNT(*) as cantidad
            FROM inventory 
            GROUP BY "clasificacionId"
            ORDER BY cantidad DESC
        `);

        // Obtener nombres de las clasificaciones
        const clasificaciones = await client.query(`
            SELECT id, familia FROM clasificacion
        `);

        // Agrupar por familia (sumando los conteos de las diferentes sub-familias)
        const familiaCounts = new Map();
        
        distribucion.rows.forEach(item => {
            const clasificacion = clasificaciones.rows.find(c => c.id === item.clasificacionId);
            const familia = clasificacion?.familia || 'Sin clasificar';
            
            if (familiaCounts.has(familia)) {
                familiaCounts.set(familia, familiaCounts.get(familia) + parseInt(item.cantidad));
            } else {
                familiaCounts.set(familia, parseInt(item.cantidad));
            }
        });

        // Encontrar la familia con más equipos
        let familiaMasComunNombre = 'N/A';
        let familiaMasComunCount = 0;
        
        for (const [familia, count] of familiaCounts.entries()) {
            if (count > familiaMasComunCount) {
                familiaMasComunNombre = familia;
                familiaMasComunCount = count;
            }
        }

        console.log('\n📊 RESULTADO CORREGIDO:');
        console.log('================================================================================');
        console.log(`Familia más común: ${familiaMasComunNombre}`);
        console.log(`Cantidad: ${familiaMasComunCount} equipos`);

        // Mostrar todas las familias para verificar
        console.log('\n📋 DISTRIBUCIÓN COMPLETA POR FAMILIA:');
        const resultado = Array.from(familiaCounts.entries())
            .map(([familia, count]) => ({ familia, count }))
            .sort((a, b) => b.count - a.count);

        resultado.forEach((item, index) => {
            console.log(`${index + 1}. ${item.familia}: ${item.count} equipos`);
        });

        // Verificar que Computadora tenga 295 equipos
        const computadoraCount = familiaCounts.get('Computadora') || 0;
        if (computadoraCount === 295) {
            console.log('\n✅ ¡CORRECTO! Computadora ahora muestra 295 equipos');
        } else {
            console.log(`\n❌ ERROR: Computadora muestra ${computadoraCount} equipos, se esperaban 295`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

testFamiliaCorregida();
