const { Client } = require('pg');

async function cargarIMPTINTAEPS0010() {
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

        // Verificar si el registro ya existe
        const existingRecord = await client.query(
            'SELECT id FROM inventory WHERE "codigoEFC" = $1',
            ['IMPTINTAEPS0010']
        );

        if (existingRecord.rows.length > 0) {
            console.log('⏭️ El registro IMPTINTAEPS0010 ya existe en la base de datos');
            return;
        }

        // Datos del registro IMPTINTAEPS0010
        const values = [
            'IMPTINTAEPS0010', // codigoEFC
            'Epson', // marca
            'L6270', // modelo
            null, // descripcion
            '', // serie (vacío)
            'No aplica', // procesador
            2025, // anio
            'No aplica', // ram
            'No aplica', // discoDuro
            'No aplica', // sistemaOperativo
            'Asignado', // status
            'Asignada', // estado
            'Surquillo', // ubicacionEquipo
            1, // qUsuarios
            'OPERATIVO', // condicion
            false, // repotenciadas
            null, // clasificacionObsolescencia
            null, // clasificacionRepotenciadas
            null, // motivoCompra
            'DELTRON', // proveedor
            'F106-00502209', // factura
            2025, // anioCompra
            null, // observaciones
            null, // fecha_compra
            367.92, // precioUnitarioSinIgv
            null, // fecha_baja
            null, // motivo_baja
            19, // clasificacionId
            440 // empleadoId
        ];

        const dbColumns = [
            "codigoEFC", "marca", "modelo", "descripcion", "serie", "procesador", "anio",
            "ram", "discoDuro", "sistemaOperativo", "status", "estado", "ubicacionEquipo",
            "qUsuarios", "condicion", "repotenciadas", "clasificacionObsolescencia",
            "clasificacionRepotenciadas", "motivoCompra", "proveedor", "factura",
            "anioCompra", "observaciones", "fecha_compra", "precioUnitarioSinIgv",
            "fecha_baja", "motivo_baja", "clasificacionId", "empleadoId"
        ];

        const insertQuery = `
            INSERT INTO inventory (${dbColumns.map(col => `"${col}"`).join(', ')})
            VALUES (${dbColumns.map((_, i) => `$${i + 1}`).join(', ')})
        `;

        try {
            await client.query(insertQuery, values);
            console.log('✅ Registro IMPTINTAEPS0010 cargado exitosamente');
            
            // Verificar el total de registros
            const totalRecords = await client.query('SELECT COUNT(*) FROM inventory');
            console.log(`📊 Total de registros en la tabla: ${totalRecords.rows[0].count}`);
            
        } catch (error) {
            console.error('❌ Error al cargar el registro:', error.message);
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

cargarIMPTINTAEPS0010();
