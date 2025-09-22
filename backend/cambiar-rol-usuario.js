const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cambiarRolUsuario(userId, nuevoRol) {
  try {
    console.log(`🔄 Cambiando rol del usuario ${userId} a ${nuevoRol}`);
    
    // Primero, obtener el ID del rol
    const rol = await prisma.$queryRaw`
      SELECT id FROM public.roles WHERE nombre = ${nuevoRol}
    `;
    
    if (!rol || rol.length === 0) {
      throw new Error(`Rol ${nuevoRol} no encontrado`);
    }
    
    const roleId = rol[0].id;
    console.log(`📋 ID del rol ${nuevoRol}: ${roleId}`);
    
    // Verificar si el usuario ya tiene un rol asignado
    const usuarioRolExistente = await prisma.$queryRaw`
      SELECT * FROM public.user_roles WHERE user_id = ${userId}
    `;
    
    if (usuarioRolExistente.length > 0) {
      // Actualizar rol existente
      await prisma.$queryRaw`
        UPDATE public.user_roles 
        SET role_id = ${roleId} 
        WHERE user_id = ${userId}
      `;
      console.log(`✅ Rol actualizado para usuario ${userId}`);
    } else {
      // Crear nuevo rol
      await prisma.$queryRaw`
        INSERT INTO public.user_roles (user_id, role_id) 
        VALUES (${userId}, ${roleId})
      `;
      console.log(`✅ Nuevo rol asignado para usuario ${userId}`);
    }
    
    // Verificar el cambio
    const usuarioConRol = await prisma.$queryRaw`
      SELECT u.id, u.username, u.email, r.nombre as rol
      FROM public.user u
      LEFT JOIN public.user_roles ur ON u.id = ur.user_id
      LEFT JOIN public.roles r ON ur.role_id = r.id
      WHERE u.id = ${userId}
    `;
    
    console.log(`📊 Usuario actualizado:`, usuarioConRol[0]);
    
  } catch (error) {
    console.error('❌ Error al cambiar rol:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejemplo de uso
// cambiarRolUsuario(1, 'ADMIN');

module.exports = { cambiarRolUsuario };

