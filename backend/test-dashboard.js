const { Client } = require('pg');

async function testDashboard() {
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

        // Simular la consulta del dashboard
        console.log('🔍 Verificando consultas del dashboard...');

        // Total de equipos
        const totalEquipos = await client.query('SELECT COUNT(*) as total FROM inventory');
        console.log(`📊 Total equipos: ${totalEquipos.rows[0].total}`);

        // Equipos en buen estado (OPERATIVO)
        const equiposBuenEstado = await client.query(`
            SELECT COUNT(*) as total 
            FROM inventory 
            WHERE condicion = 'OPERATIVO'
        `);
        console.log(`📊 Equipos en buen estado: ${equiposBuenEstado.rows[0].total}`);

        // Equipos obsoletos (OBSOLETO) - CORREGIDO
        const equiposObsoletos = await client.query(`
            SELECT COUNT(*) as total 
            FROM inventory 
            WHERE condicion = 'OBSOLETO'
        `);
        console.log(`📊 Equipos obsoletos: ${equiposObsoletos.rows[0].total}`);

        // Total de bajas
        const totalBajas = await client.query(`
            SELECT COUNT(*) as total 
            FROM inventory 
            WHERE estado = 'BAJA'
        `);
        console.log(`📊 Total bajas: ${totalBajas.rows[0].total}`);

        // Porcentaje de equipos en buen estado
        const total = parseInt(totalEquipos.rows[0].total);
        const buenos = parseInt(equiposBuenEstado.rows[0].total);
        const porcentaje = total > 0 ? Math.round((buenos / total) * 100) : 0;
        console.log(`📊 Porcentaje en buen estado: ${porcentaje}%`);

        console.log('\n✅ Dashboard corregido - ahora debería mostrar 79 equipos obsoletos');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

testDashboard();
