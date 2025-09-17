const http = require('http');

async function testAuthFlow() {
    console.log('🔍 Probando flujo de autenticación...');

    // 1. Probar endpoint de perfil sin token
    console.log('\n1. Probando endpoint de perfil sin token...');
    try {
        const response = await makeRequest('http://localhost:3002/auth/profile');
        console.log(`Status: ${response.statusCode}`);
        if (response.statusCode === 401) {
            console.log('✅ Correcto: Endpoint requiere autenticación');
        } else {
            console.log('❌ Error: Endpoint debería requerir autenticación');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // 2. Probar endpoint de dashboard sin token
    console.log('\n2. Probando endpoint de dashboard sin token...');
    try {
        const response = await makeRequest('http://localhost:3002/dashboard');
        console.log(`Status: ${response.statusCode}`);
        if (response.statusCode === 401) {
            console.log('✅ Correcto: Dashboard requiere autenticación');
        } else {
            console.log('❌ Error: Dashboard debería requerir autenticación');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // 3. Probar con token válido (simulado)
    console.log('\n3. Probando con token válido...');
    try {
        const response = await makeRequest('http://localhost:3002/dashboard', {
            'Authorization': 'Bearer test-token'
        });
        console.log(`Status: ${response.statusCode}`);
        if (response.statusCode === 401) {
            console.log('✅ Correcto: Token inválido rechazado');
        } else {
            console.log('❌ Error: Token inválido debería ser rechazado');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n🔍 Verificando si el backend está corriendo...');
    try {
        const response = await makeRequest('http://localhost:3002/health');
        console.log(`Status: ${response.statusCode}`);
        if (response.statusCode === 200) {
            console.log('✅ Backend está corriendo correctamente');
        } else {
            console.log('❌ Backend no responde correctamente');
        }
    } catch (error) {
        console.log('❌ Backend no está corriendo:', error.message);
    }
}

function makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(url, options, (res) => {
            resolve(res);
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

testAuthFlow();
