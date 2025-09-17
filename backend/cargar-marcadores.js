const { Client } = require('pg');

async function cargarMarcadores() {
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

        // Verificar si los registros ya existen
        const existingRecords = await client.query(
            'SELECT "codigoEFC" FROM inventory WHERE "codigoEFC" IN ($1, $2, $3)',
            ['MARCADOR001', 'MARCADOR002', 'MARCADOR003']
        );

        if (existingRecords.rows.length > 0) {
            console.log('⏭️ Algunos registros ya existen:');
            existingRecords.rows.forEach(row => {
                console.log(`   - ${row.codigoEFC}`);
            });
        }

        // Datos de los 3 registros MARCADOR
        const marcadores = [
            {
                codigoEFC: 'MARCADOR001',
                marca: 'ZKTeco',
                modelo: 'K20 Pro',
                descripcion: null,
                serie: 'CQTW233360271',
                procesador: 'No aplica',
                anio: null, // Campo vacío, se establece como null
                ram: 'No aplica',
                discoDuro: 'No aplica',
                sistemaOperativo: 'No aplica',
                status: 'Asignado',
                estado: 'ASIGNADA',
                ubicacionEquipo: 'Surquillo',
                qUsuarios: 1,
                condicion: 'OPERATIVO',
                repotenciadas: false,
                clasificacionObsolescencia: null,
                clasificacionRepotenciadas: null,
                motivoCompra: null,
                proveedor: null,
                factura: null,
                anioCompra: null,
                observaciones: null,
                precioUnitarioSinIgv: 0,
                clasificacionId: 37,
                empleadoId: 410
            },
            {
                codigoEFC: 'MARCADOR002',
                marca: 'ZKTeco',
                modelo: 'Iclock 360',
                descripcion: null,
                serie: 'C3MG194460049',
                procesador: 'No aplica',
                anio: null, // Campo vacío, se establece como null
                ram: 'No aplica',
                discoDuro: 'No aplica',
                sistemaOperativo: 'No aplica',
                status: 'Asignado',
                estado: 'ASIGNADA',
                ubicacionEquipo: 'Surquillo',
                qUsuarios: 1,
                condicion: 'OPERATIVO',
                repotenciadas: false,
                clasificacionObsolescencia: null,
                clasificacionRepotenciadas: null,
                motivoCompra: null,
                proveedor: null,
                factura: null,
                anioCompra: null,
                observaciones: null,
                precioUnitarioSinIgv: 0,
                clasificacionId: 37,
                empleadoId: 410
            },
            {
                codigoEFC: 'MARCADOR003',
                marca: 'ZKTeco',
                modelo: 'Iclock 360',
                descripcion: null,
                serie: '',
                procesador: 'No aplica',
                anio: null, // Campo vacío, se establece como null
                ram: 'No aplica',
                discoDuro: 'No aplica',
                sistemaOperativo: 'No aplica',
                status: 'Asignado',
                estado: 'ASIGNADA',
                ubicacionEquipo: 'Chorrillos',
                qUsuarios: 1,
                condicion: 'OPERATIVO',
                repotenciadas: false,
                clasificacionObsolescencia: null,
                clasificacionRepotenciadas: null,
                motivoCompra: null,
                proveedor: null,
                factura: null,
                anioCompra: null,
                observaciones: null,
                precioUnitarioSinIgv: 0,
                clasificacionId: 37,
                empleadoId: 410
            }
        ];

        const dbColumns = [
            "codigoEFC", "marca", "modelo", "descripcion", "serie", "procesador", "anio",
            "ram", "discoDuro", "sistemaOperativo", "status", "estado", "ubicacionEquipo",
            "qUsuarios", "condicion", "repotenciadas", "clasificacionObsolescencia",
            "clasificacionRepotenciadas", "motivoCompra", "proveedor", "factura",
            "anioCompra", "observaciones", "fecha_compra", "precioUnitarioSinIgv",
            "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
        ];

        let loadedCount = 0;
        let errorCount = 0;

        for (const marcador of marcadores) {
            // Verificar si ya existe
            const existing = await client.query(
                'SELECT id FROM inventory WHERE "codigoEFC" = $1',
                [marcador.codigoEFC]
            );

            if (existing.rows.length > 0) {
                console.log(`⏭️ Saltando ${marcador.codigoEFC} - ya existe`);
                continue;
            }

            const values = [
                marcador.codigoEFC,
                marcador.marca,
                marcador.modelo,
                marcador.descripcion,
                marcador.serie,
                marcador.procesador,
                marcador.anio,
                marcador.ram,
                marcador.discoDuro,
                marcador.sistemaOperativo,
                marcador.status,
                marcador.estado,
                marcador.ubicacionEquipo,
                marcador.qUsuarios,
                marcador.condicion,
                marcador.repotenciadas,
                marcador.clasificacionObsolescencia,
                marcador.clasificacionRepotenciadas,
                marcador.motivoCompra,
                marcador.proveedor,
                marcador.factura,
                marcador.anioCompra,
                marcador.observaciones,
                null, // fecha_compra
                marcador.precioUnitarioSinIgv,
                null, // fecha_baja
                null, // motivo_baja
                marcador.clasificacionId,
                marcador.empleadoId
            ];

            const insertQuery = `
                INSERT INTO inventory (${dbColumns.map(col => `"${col}"`).join(', ')})
                VALUES (${dbColumns.map((_, i) => `$${i + 1}`).join(', ')})
            `;

            try {
                await client.query(insertQuery, values);
                console.log(`✅ ${marcador.codigoEFC} cargado exitosamente`);
                loadedCount++;
            } catch (error) {
                console.error(`❌ Error al cargar ${marcador.codigoEFC}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n✅ Carga de marcadores completada:');
        console.log(`   - Registros cargados: ${loadedCount}`);
        console.log(`   - Errores: ${errorCount}`);

        const totalRecords = await client.query('SELECT COUNT(*) FROM inventory');
        console.log(`📊 Total de registros en la tabla: ${totalRecords.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarMarcadores();
