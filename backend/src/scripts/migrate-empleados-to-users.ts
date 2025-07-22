import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

async function migrateEmpleadosToUsers() {
  const prisma = new PrismaService();
  
  try {
    console.log('🔄 Iniciando migración de empleados a usuarios...');
    
    // 1. Obtener todos los empleados
    const empleados = await prisma.empleado.findMany();
    console.log(`📋 Encontrados ${empleados.length} empleados para migrar`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const empleado of empleados) {
      try {
        // Generar email basado en el nombre
        const email = empleado.nombre 
          ? `${empleado.nombre.toLowerCase().replace(/\s+/g, '.')}@inventario-efc.com`
          : `empleado.${empleado.id}@inventario-efc.com`;
        
        // Generar username basado en el nombre
        const username = empleado.nombre 
          ? empleado.nombre.toLowerCase().replace(/\s+/g, '.')
          : `empleado${empleado.id}`;
        
        // Verificar si ya existe un usuario con este email
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
        
        if (existingUser) {
          console.log(`⚠️  Usuario ya existe: ${email}`);
          skipped++;
          continue;
        }
        
        // Crear usuario con contraseña temporal
        const tempPassword = 'inventario2024'; // Temporal, debe cambiar en primer login
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const newUser = await prisma.user.create({
          data: {
            username: username.substring(0, 50), // Limitar longitud
            email: email.substring(0, 100), // Limitar longitud
            password: hashedPassword,
            fullName: empleado.nombre || `Empleado ${empleado.id}`,
            isActive: true,
            isAdmin: false,
          }
        });
        
        // Actualizar inventarios que referencien a este empleado
        const updatedInventarios = await prisma.inventory.updateMany({
          where: { empleadoId: empleado.id },
          data: { 
            // Nota: En el schema actual no existe usuarioId, 
            // pero mantenemos empleadoId por ahora
          }
        });
        
        console.log(`✅ Migrado: ${empleado.nombre} → ${email} (${updatedInventarios.count} inventarios)`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Error migrando empleado ${empleado.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log(`  ✅ Migrados exitosamente: ${migrated}`);
    console.log(`  ⚠️  Omitidos (ya existían): ${skipped}`);
    console.log(`  ❌ Errores: ${errors}`);
    console.log(`  📧 Contraseña temporal para todos: inventario2024`);
    
    // Sugerencias para el siguiente paso
    console.log('\n🔜 PRÓXIMOS PASOS:');
    console.log('1. Verificar usuarios creados');
    console.log('2. Actualizar schema para agregar usuarioId a inventory');
    console.log('3. Migrar relaciones empleadoId → usuarioId');
    console.log('4. Eliminar tabla empleado');
    
  } catch (error) {
    console.error('❌ Error general en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateEmpleadosToUsers(); 