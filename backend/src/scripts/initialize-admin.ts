import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

async function initializeAdmin() {
  const prisma = new PrismaService();
  
  try {
    console.log('🚀 Inicializando sistema de administración...');

    // 1. Crear recursos
    const resources = [
      { name: 'inventario', displayName: 'Inventario', description: 'Gestión de inventario de equipos' },
      { name: 'colaboradores', displayName: 'Colaboradores', description: 'Gestión de colaboradores' },
      { name: 'clasificaciones', displayName: 'Clasificaciones', description: 'Gestión de clasificaciones' },
      { name: 'articulos', displayName: 'Artículos', description: 'Gestión de artículos' },
      { name: 'dashboard', displayName: 'Dashboard', description: 'Panel de control' },
      { name: 'admin', displayName: 'Administración', description: 'Panel de administración' },
    ];

    console.log('📂 Creando recursos...');
    for (const resourceData of resources) {
      const existingResource = await prisma.resource.findUnique({
        where: { name: resourceData.name }
      });

      if (!existingResource) {
        await prisma.resource.create({
          data: resourceData
        });
        console.log(`   ✅ Recurso '${resourceData.displayName}' creado`);
      } else {
        console.log(`   ⚠️  Recurso '${resourceData.displayName}' ya existe`);
      }
    }

    // 2. Crear permisos para cada recurso
    const actions = ['read', 'create', 'update', 'delete'];
    console.log('🔐 Creando permisos...');
    
    const allResources = await prisma.resource.findMany();
    for (const resource of allResources) {
      for (const action of actions) {
        const existingPermission = await prisma.permission.findUnique({
          where: {
            action_resourceId: {
              action,
              resourceId: resource.id
            }
          }
        });

        if (!existingPermission) {
          await prisma.permission.create({
            data: {
              action,
              resourceId: resource.id
            }
          });
          console.log(`   ✅ Permiso '${action}' para '${resource.displayName}' creado`);
        }
      }
    }

    // 3. Crear usuario administrador por defecto
    console.log('👤 Creando usuario administrador...');
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: 'admin' },
          { email: 'admin@inventario-efc.com' }
        ]
      }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@inventario-efc.com',
          password: hashedPassword,
          fullName: 'Administrador del Sistema',
          isActive: true,
          isAdmin: true,
        }
      });

      // Asignar todos los permisos al admin
      const allPermissions = await prisma.permission.findMany();
      for (const permission of allPermissions) {
        await prisma.userPermission.create({
          data: {
            userId: adminUser.id,
            permissionId: permission.id,
            granted: true
          }
        });
      }

      console.log('   ✅ Usuario administrador creado');
      console.log('   📧 Email: admin@inventario-efc.com');
      console.log('   🔑 Password: admin123');
      console.log('   ⚠️  CAMBIA LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');
    } else {
      console.log('   ⚠️  Usuario administrador ya existe');
    }

    console.log('\n🎉 Sistema de administración inicializado correctamente!');
    console.log('\n📋 Recursos creados:');
    resources.forEach(r => console.log(`   - ${r.displayName}: ${r.description}`));
    
    console.log('\n🔐 Permisos disponibles para cada recurso:');
    actions.forEach(a => console.log(`   - ${a}: ${getActionDescription(a)}`));

  } catch (error) {
    console.error('❌ Error al inicializar sistema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getActionDescription(action: string): string {
  const descriptions: { [key: string]: string } = {
    read: 'Visualizar/Leer',
    create: 'Crear/Agregar',
    update: 'Editar/Actualizar',
    delete: 'Eliminar/Borrar'
  };
  return descriptions[action] || action;
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  initializeAdmin();
}

export { initializeAdmin }; 