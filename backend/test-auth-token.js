const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('🔍 Probando autenticación...\n');

    // 1. Intentar login con superadmin
    console.log('1. Intentando login con superadmin...');
    const loginResponse = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });

    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login exitoso');
      console.log('Token:', loginData.access_token ? 'Presente' : 'Ausente');
      console.log('User:', loginData.user);
      
      const token = loginData.access_token;
      
      // 2. Probar endpoint /roles con el token
      console.log('\n2. Probando endpoint /roles...');
      const rolesResponse = await fetch('http://localhost:3002/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Roles status:', rolesResponse.status);
      
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        console.log('✅ Roles obtenidos correctamente');
        console.log('Roles:', rolesData);
      } else {
        const errorText = await rolesResponse.text();
        console.log('❌ Error en roles:', errorText);
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Error en login:', errorText);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testAuth();
