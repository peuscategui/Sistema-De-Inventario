const fetch = require('node-fetch');

async function verificarInventory() {
    try {
        console.log('🔍 Verificando estado de la tabla inventory...');
        
        const response = await fetch('http://localhost:3002/inventory?page=1&pageSize=10');
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`📊 Total de registros: ${data.pagination.total}`);
        console.log(`📋 Registros en esta página: ${data.data.length}`);
        
        if (data.data.length > 0) {
            console.log('\n📋 Primeros registros:');
            data.data.slice(0, 3).forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.codigoEFC} - ${item.marca} ${item.modelo}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verificarInventory();
