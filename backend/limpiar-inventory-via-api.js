const fetch = require('node-fetch');

async function limpiarInventoryViaAPI() {
    try {
        console.log('🧹 Limpiando tabla inventory via API...');
        
        // Obtener todos los registros
        console.log('📊 Obteniendo lista de registros...');
        const response = await fetch('http://localhost:3002/inventory?page=1&pageSize=10000');
        
        if (!response.ok) {
            throw new Error(`Error obteniendo datos: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.log('✅ La tabla inventory ya está vacía');
            return;
        }
        
        console.log(`📋 Encontrados ${data.data.length} registros para eliminar`);
        
        // Eliminar cada registro individualmente
        let eliminados = 0;
        let errores = 0;
        
        for (let i = 0; i < data.data.length; i++) {
            const item = data.data[i];
            try {
                const deleteResponse = await fetch(`http://localhost:3002/inventory/${item.id}`, {
                    method: 'DELETE'
                });
                
                if (deleteResponse.ok) {
                    eliminados++;
                    if (eliminados % 50 === 0 || eliminados === data.data.length) {
                        console.log(`🗑️ Eliminados ${eliminados}/${data.data.length} registros...`);
                    }
                } else {
                    console.log(`❌ Error eliminando ${item.codigoEFC}: ${deleteResponse.status}`);
                    errores++;
                }
            } catch (error) {
                console.log(`❌ Error eliminando ${item.codigoEFC}:`, error.message);
                errores++;
            }
        }
        
        console.log(`\n🎉 Limpieza completada:`);
        console.log(`   - Total procesados: ${data.data.length}`);
        console.log(`   - Eliminados exitosamente: ${eliminados}`);
        console.log(`   - Errores: ${errores}`);
        console.log(`   - Registros restantes: ${data.data.length - eliminados}`);
        
        if (eliminados === data.data.length) {
            console.log('✅ Tabla inventory completamente limpiada');
        }
        
    } catch (error) {
        console.error('❌ Error limpiando inventory:', error);
    }
}

limpiarInventoryViaAPI();
