import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Get all records from inventario
    const inventarios = await prisma.inventario.findMany();
    console.log(`Found ${inventarios.length} records to migrate`);

    // First, let's clean up any existing data in the inventory table
    await prisma.inventory.deleteMany({});
    console.log('Cleaned up existing inventory records');

    // Migrate each record to inventory
    for (const inv of inventarios) {
      // Find or create clasificacion
      let clasificacionId = null;
      if (inv.familia || inv.sub_familia || inv.tipo_equipo) {
        const clasificacion = await prisma.clasificacion.create({
          data: {
            familia: inv.familia || '',
            sub_familia: inv.sub_familia,
            tipo_equipo: inv.tipo_equipo,
            vida_util: inv.vida_util?.toString() || '',
            valor_reposicion: inv.precio_reposicion
          }
        });
        clasificacionId = clasificacion.id;
      }

      // Find or create empleado
      let empleadoId = null;
      if (inv.usuarios || inv.cargo || inv.gerencia) {
        const empleado = await prisma.empleado.create({
          data: {
            nombre: inv.usuarios || '',
            cargo: inv.cargo || '',
            gerencia: inv.gerencia || ''
          }
        });
        empleadoId = empleado.id;
      }

      // Create inventory record with relations
      await prisma.inventory.create({
        data: {
          codigoEFC: inv.codigo_efc || '',
          tipoEquipo: inv.tipo_equipo || '',
          familia: inv.familia || '',
          subFamilia: inv.sub_familia,
          marca: inv.marca,
          modelo: inv.modelo || '',
          descripcion: inv.descripcion,
          serie: inv.serie,
          procesador: inv.procesador || '',
          anio: inv.anno,
          ram: inv.ram || '',
          discoDuro: inv.disco_duro || '',
          sistemaOperativo: inv.sistema_operativo || '',
          sede: inv.sede || '',
          estado: inv.estado || '',
          usuarios: inv.usuarios,
          cargo: inv.cargo || '',
          gerencia: inv.gerencia || '',
          ubicacionEquipo: inv.ubicacion_equipo || '',
          qUsuarios: inv.q_usuarios ? 1 : 0,
          repotenciadas: inv.repotenciadas,
          clasificacionObsolescencia: inv.clasificacion_obsolescencia,
          clasificacionRepotenciadas: inv.clasificacion_repotenciadas,
          motivoCompra: inv.motivo_compra,
          precioReposicion: inv.precio_reposicion,
          vidaUtil: inv.vida_util?.toString(),
          clasificacionId: clasificacionId,
          empleadoId: empleadoId
        }
      });
    }

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData(); 