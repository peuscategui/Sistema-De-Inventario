const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'localhost',
  database: process.env.POSTGRES_DB || 'inventario',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.DATABASE_URL ? parseInt(new URL(process.env.DATABASE_URL).port) : 5432,
});

async function cambiarRolUser() {
  console.log('🔄 Cambiando rol de user@efc.com.pe de ADMIN a VIEWER...');
  try {
    // Primero obtener los IDs de los roles
    const rolesResult = await pool.query('SELECT id, nombre FROM public.roles WHERE nombre IN ($1, $2)', ['ADMIN', 'VIEWER']);
    const roles = {};
    rolesResult.rows.forEach(row => {
      roles[row.nombre] = row.id;
    });
    
    console.log('📋 IDs de roles encontrados:');
    console.log('ADMIN:', roles.ADMIN);
    console.log('VIEWER:', roles.VIEWER);
    
    // Obtener el ID del usuario
    const userResult = await pool.query('SELECT id FROM public.user WHERE email = $1', ['user@efc.com.pe']);
    const userId = userResult.rows[0].id;
    console.log('👤 ID del usuario:', userId);
    
    // Eliminar rol ADMIN actual
    await pool.query('DELETE FROM public.user_roles WHERE user_id = $1 AND role_id = $2', [userId, roles.ADMIN]);
    console.log('❌ Rol ADMIN eliminado');
    
    // Agregar rol VIEWER
    await pool.query('INSERT INTO public.user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roles.VIEWER]);
    console.log('✅ Rol VIEWER asignado');
    
    // Verificar el cambio
    const verifyResult = await pool.query(`
      SELECT u.email, r.nombre as role_name
      FROM public.user u
      JOIN public.user_roles ur ON u.id = ur.user_id
      JOIN public.roles r ON ur.role_id = r.id
      WHERE u.email = 'user@efc.com.pe'
    `);
    
    console.log('🔍 Verificación del cambio:');
    console.table(verifyResult.rows);
    
    console.log('✅ Cambio de rol completado exitosamente');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

cambiarRolUser();

