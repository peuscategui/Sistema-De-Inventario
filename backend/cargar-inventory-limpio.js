const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function cargarInventoryLimpio() {
    try {
        console.log('📂 Cargando datos del archivo limpio...');
        
        // Leer el archivo limpio
        const csvPath = path.join(__dirname, 'excel-templates', '05_inventory_limpio.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        console.log(`📊 Total de líneas en el archivo: ${lines.length}`);
        
        // Obtener headers
        const headers = lines[0].split(',');
        console.log('📋 Headers:', headers.slice(0, 5).join(', '), '...');
        
        // Procesar cada línea (saltando header)
        const registros = [];
        let errores = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const columns = line.split(',');
                
                // Mapear los datos según la estructura esperada
                const registro = {
                    codigoEFC: columns[0],
                    marca: columns[1],
                    modelo: columns[2],
                    descripcion: columns[3],
                    serie: columns[4],
                    procesador: columns[5],
                    anio: parseInt(columns[6]) || null,
                    ram: columns[7],
                    discoDuro: columns[8],
                    sistemaOperativo: columns[9],
                    status: columns[10],
                    estado: columns[11],
                    ubicacionEquipo: columns[12],
                    qUsuarios: parseInt(columns[13]) || 1,
                    condicion: columns[14],
                    repotenciadas: columns[15] || null,
                    clasificacionObsolescencia: columns[16] || null,
                    clasificacionRepotenciadas: columns[17] || null,
                    motivoCompra: columns[18] || null,
                    proveedor: columns[19] || null,
                    factura: columns[20] || null,
                    anioCompra: parseInt(columns[21]) || null,
                    observaciones: columns[22] || null,
                    fecha_compra: columns[23] ? new Date(columns[23]) : null,
                    precioUnitarioSinIgv: parseFloat(columns[24]) || 0,
                    clasificacionId: parseInt(columns[25]) || null,
                    empleadoId: parseInt(columns[26]) || null
                };
                
                registros.push(registro);
                
                if (registros.length % 50 === 0) {
                    console.log(`📝 Procesados ${registros.length} registros...`);
                }
                
            } catch (error) {
                console.log(`❌ Error procesando línea ${i + 1}: ${error.message}`);
                errores++;
            }
        }
        
        console.log(`\n📊 Registros procesados: ${registros.length}`);
        console.log(`❌ Errores de procesamiento: ${errores}`);
        
        if (registros.length === 0) {
            console.log('⚠️ No hay registros válidos para cargar');
            return;
        }
        
        // Cargar los datos usando la API
        console.log('\n🚀 Enviando datos a la API...');
        
        const response = await fetch('http://localhost:3002/inventory/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registros)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en la API: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        console.log('\n✅ Datos cargados exitosamente:');
        console.log(`   - Total enviados: ${registros.length}`);
        console.log(`   - Cargados: ${result.created || result.length || 'N/A'}`);
        
        if (result.errors && result.errors.length > 0) {
            console.log(`   - Errores: ${result.errors.length}`);
            console.log('\n❌ Primeros errores:');
            result.errors.slice(0, 5).forEach((error, index) => {
                console.log(`     ${index + 1}. ${error.message}`);
            });
        }
        
        // Verificar el total en la base de datos
        console.log('\n🔍 Verificando total en la base de datos...');
        const verifyResponse = await fetch('http://localhost:3002/dashboard');
        if (verifyResponse.ok) {
            const dashboardData = await verifyResponse.json();
            console.log(`📊 Total de equipos en la base de datos: ${dashboardData.totalEquipos}`);
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
    }
}

cargarInventoryLimpio();
