const fetch = require('node-fetch');

async function testUserRoles() {
  try {
    console.log('🔍 Probando endpoint de roles de usuario...\n');

    // 1. Login con superadmin
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

    if (!loginResponse.ok) {
      console.log('❌ Error en login');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    // 2. Probar endpoint /roles/user/6 (usuario 'user')
    console.log('2. Probando endpoint /roles/user/6...');
    const userRolesResponse = await fetch('http://localhost:3002/roles/user/6', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('User roles status:', userRolesResponse.status);
    
    if (userRolesResponse.ok) {
      const userRolesData = await userRolesResponse.json();
      console.log('✅ Roles del usuario obtenidos correctamente');
      console.log('User roles:', userRolesData);
    } else {
      const errorText = await userRolesResponse.text();
      console.log('❌ Error en user roles:', errorText);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testUserRoles();
