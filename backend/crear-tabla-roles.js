const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function crearTablaRoles() {
  try {
    await client.connect();
    console.log('🔌 Conectado a la base de datos');

    // Crear tabla de roles
    const crearTablaRoles = `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        descripcion TEXT,
        permisos JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(crearTablaRoles);
    console.log('✅ Tabla "roles" creada exitosamente');

    // Insertar roles por defecto
    const insertarRoles = `
      INSERT INTO roles (nombre, descripcion, permisos) VALUES
      ('ADMIN', 'Administrador del sistema', '{
        "inventario": ["create", "read", "update", "delete"],
        "empleados": ["create", "read", "update", "delete"],
        "dashboard": ["read"],
        "reportes": ["read", "export"],
        "configuracion": ["read", "update"]
      }'),
      ('USER', 'Usuario estándar', '{
        "inventario": ["read"],
        "empleados": ["read"],
        "dashboard": ["read"],
        "reportes": ["read"],
        "configuracion": []
      }')
      ON CONFLICT (nombre) DO NOTHING;
    `;

    await client.query(insertarRoles);
    console.log('✅ Roles por defecto insertados');

    // Agregar columna rol_id a la tabla usuarios si no existe
    const agregarColumnaRol = `
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS rol_id INTEGER REFERENCES roles(id) DEFAULT 2;
    `;

    await client.query(agregarColumnaRol);
    console.log('✅ Columna "rol_id" agregada a tabla "usuarios"');

    // Asignar rol de usuario por defecto a usuarios existentes
    const asignarRolUsuario = `
      UPDATE usuarios 
      SET rol_id = 2 
      WHERE rol_id IS NULL;
    `;

    const result = await client.query(asignarRolUsuario);
    console.log(`✅ ${result.rowCount} usuarios actualizados con rol USER`);

    // Mostrar roles creados
    const mostrarRoles = await client.query('SELECT * FROM roles ORDER BY id');
    console.log('\n📋 Roles disponibles:');
    mostrarRoles.rows.forEach(rol => {
      console.log(`- ${rol.nombre}: ${rol.descripcion}`);
    });

    // Mostrar usuarios con sus roles
    const mostrarUsuarios = await client.query(`
      SELECT u.id, u.usuario, r.nombre as rol
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `);
    
    console.log('\n👥 Usuarios y sus roles:');
    mostrarUsuarios.rows.forEach(usuario => {
      console.log(`- ${usuario.usuario}: ${usuario.rol || 'Sin rol'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

crearTablaRoles();
