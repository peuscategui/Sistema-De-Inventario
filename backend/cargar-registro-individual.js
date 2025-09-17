const { Client } = require('pg');

async function cargarRegistroIndividual() {
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
            ['IMPTINTAEPS0007']
        );

        if (existingRecord.rows.length > 0) {
            console.log('⏭️ El registro IMPTINTAEPS0007 ya existe en la base de datos');
            return;
        }

        // Datos del registro IMPTINTAEPS0007
        const values = [
            'IMPTINTAEPS0007', // codigoEFC
            'Epson', // marca
            'L395', // modelo
            null, // descripcion
            'X2P6159546', // serie
            'No aplica', // procesador
            null, // anio (2015)
            2015, // anio
            'No aplica', // ram
            'No aplica', // discoDuro
            'No aplica', // sistemaOperativo
            'Asignado', // status
            'Stock', // estado
            'Surquillo', // ubicacionEquipo
            1, // qUsuarios
            'OBSOLETO', // condicion
            false, // repotenciadas
            null, // clasificacionObsolescencia
            null, // clasificacionRepotenciadas
            null, // motivoCompra
            null, // proveedor
            null, // factura
            null, // anioCompra
            null, // observaciones
            null, // fecha_compra
            0, // precioUnitarioSinIgv
            null, // fecha_baja
            null, // motivo_baja
            null, // clasificacionId (se establecerá como null)
            null // empleadoId (se establecerá como null)
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
            console.log('✅ Registro IMPTINTAEPS0007 cargado exitosamente');
            
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

cargarRegistroIndividual();
