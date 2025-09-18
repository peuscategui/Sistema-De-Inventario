const fetch = require('node-fetch');

async function testRoleAssignment() {
  try {
    console.log('🔍 Probando asignación de roles...\n');

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

    // 2. Probar asignar rol USER al usuario 6
    console.log('2. Probando asignar rol USER al usuario 6...');
    const assignResponse = await fetch('http://localhost:3002/roles/assign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 6,
        roleName: 'USER'
      })
    });
    
    console.log('Assign status:', assignResponse.status);
    
    if (assignResponse.ok) {
      const assignData = await assignResponse.json();
      console.log('✅ Rol asignado correctamente');
      console.log('Response:', assignData);
    } else {
      const errorText = await assignResponse.text();
      console.log('❌ Error al asignar rol:', errorText);
    }

    // 3. Probar eliminar rol USER del usuario 6
    console.log('\n3. Probando eliminar rol USER del usuario 6...');
    const removeResponse = await fetch('http://localhost:3002/roles/remove', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 6,
        roleName: 'USER'
      })
    });
    
    console.log('Remove status:', removeResponse.status);
    
    if (removeResponse.ok) {
      const removeData = await removeResponse.json();
      console.log('✅ Rol eliminado correctamente');
      console.log('Response:', removeData);
    } else {
      const errorText = await removeResponse.text();
      console.log('❌ Error al eliminar rol:', errorText);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testRoleAssignment();
