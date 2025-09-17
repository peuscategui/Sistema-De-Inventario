const http = require('http');

async function testDashboardAPI() {
    const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/dashboard',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('\n📊 RESULTADO DEL DASHBOARD:');
                console.log('================================================================================');
                console.log(`Total equipos: ${result.totalEquipos}`);
                console.log(`Equipos en buen estado: ${result.porcentajeBuenEstado}%`);
                console.log(`Equipos obsoletos: ${result.equiposObsoletos}`);
                console.log(`Total bajas: ${result.totalBajas}`);
                console.log(`Familia más común: ${result.familiaMasComun.familia} (${result.familiaMasComun._count.id} unidades)`);
                
                if (result.equiposObsoletos === 79) {
                    console.log('\n✅ ¡CORRECTO! El dashboard ahora muestra 79 equipos obsoletos');
                } else {
                    console.log(`\n❌ ERROR: Se esperaban 79 equipos obsoletos, pero se obtuvieron ${result.equiposObsoletos}`);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error making request:', error);
    });

    req.end();
}

testDashboardAPI();
