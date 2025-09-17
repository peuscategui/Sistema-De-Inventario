const fetch = require('node-fetch');

async function limpiarInventoryViaAPI() {
    try {
        console.log('🧹 Limpiando tabla inventory via API...');
        
        // Primero obtener todos los IDs de los registros
        console.log('📊 Obteniendo lista de registros...');
        const response = await fetch('http://localhost:3002/inventory?page=1&pageSize=10000');
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.log('✅ La tabla inventory ya está vacía');
            return;
        }
        
        console.log(`📋 Encontrados ${data.data.length} registros para eliminar`);
        
        // Eliminar cada registro individualmente
        let eliminados = 0;
        for (const item of data.data) {
            try {
                const deleteResponse = await fetch(`http://localhost:3002/inventory/${item.id}`, {
                    method: 'DELETE'
                });
                
                if (deleteResponse.ok) {
                    eliminados++;
                    if (eliminados % 50 === 0) {
                        console.log(`🗑️ Eliminados ${eliminados} registros...`);
                    }
                } else {
                    console.log(`❌ Error eliminando ${item.codigoEFC}: ${deleteResponse.status}`);
                }
            } catch (error) {
                console.log(`❌ Error eliminando ${item.codigoEFC}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Limpieza completada:`);
        console.log(`   - Total eliminados: ${eliminados} registros`);
        console.log(`   - Registros restantes: ${data.data.length - eliminados}`);
        
    } catch (error) {
        console.error('❌ Error limpiando inventory:', error);
    }
}

limpiarInventoryViaAPI();
