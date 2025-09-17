const fetch = require('node-fetch');

async function probarCargaSimple() {
    try {
        console.log('🧪 Probando carga con un solo registro...');
        
        const registro = {
            codigoEFC: "TEST-001",
            marca: "TEST",
            modelo: "TEST MODEL",
            descripcion: "Registro de prueba",
            serie: "TEST123",
            procesador: "No aplica",
            anio: 2025,
            ram: "No aplica",
            discoDuro: "No aplica",
            sistemaOperativo: "No aplica",
            status: "Asignado",
            estado: "ASIGNADO",
            ubicacionEquipo: "SURQUILLO",
            qUsuarios: 1,
            condicion: "OPERATIVO",
            repotenciadas: null,
            clasificacionObsolescencia: null,
            clasificacionRepotenciadas: null,
            motivoCompra: "Prueba",
            proveedor: "TEST",
            factura: "TEST-001",
            anioCompra: 2025,
            observaciones: "Registro de prueba",
            fecha_compra: new Date(),
            precioUnitarioSinIgv: 100,
            clasificacionId: 1,
            empleadoId: 1
        };
        
        console.log('📤 Enviando registro de prueba...');
        console.log('Datos:', JSON.stringify(registro, null, 2));
        
        const response = await fetch('http://localhost:3002/inventory/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([registro])
        });
        
        console.log(`📊 Status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
        } else {
            const result = await response.json();
            console.log('✅ Respuesta exitosa:', JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

probarCargaSimple();
