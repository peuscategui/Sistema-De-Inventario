import { PrismaService } from '../prisma.service';
import * as fs from 'fs';

interface GerenciaData {
  nombre: string;
  codigo: string;
  descripcion?: string;
  areas?: string[]; // Array de nombres de áreas
}

async function importGerencias() {
  const prisma = new PrismaService();
  
  try {
    console.log('🏢 Importando gerencias desde CSV...');
    
    // Verificar si existe el archivo CSV
    const csvPath = 'data/gerencias.csv';
    if (!fs.existsSync(csvPath)) {
      console.log('📄 Archivo CSV no encontrado. Creando plantilla...');
      await createTemplate();
      return;
    }
    
    const gerenciasData: GerenciaData[] = [];
    
    // Leer archivo CSV línea por línea
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 2) {
        gerenciasData.push({
          nombre: values[0]?.trim(),
          codigo: values[1]?.trim(),
          descripcion: values[2]?.trim() || undefined,
          areas: values[3] ? values[3].split('|').map(a => a.trim()) : []
        });
      }
    }
    
    console.log(`📊 ${gerenciasData.length} gerencias encontradas en CSV`);
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    let areasCreated = 0;
    
    for (const item of gerenciasData) {
      try {
        // Buscar si existe la gerencia
        let gerencia = await prisma.gerencia.findFirst({
          where: { nombre: item.nombre }
        });
        
        if (gerencia) {
          // Actualizar existente
          gerencia = await prisma.gerencia.update({
            where: { id: gerencia.id },
            data: {
              codigo: item.codigo,
              descripcion: item.descripcion
            }
          });
          updated++;
          console.log(`✅ Actualizada: ${item.nombre}`);
        } else {
          // Crear nueva
          gerencia = await prisma.gerencia.create({
            data: {
              nombre: item.nombre,
              codigo: item.codigo,
              descripcion: item.descripcion,
              activo: true
            }
          });
          created++;
          console.log(`➕ Creada: ${item.nombre}`);
        }
        
        // Crear áreas asociadas
        if (item.areas && item.areas.length > 0) {
          for (const areaNombre of item.areas) {
            try {
              const existingArea = await prisma.area.findFirst({
                where: { nombre: areaNombre }
              });
              
              if (!existingArea) {
                await prisma.area.create({
                  data: {
                    nombre: areaNombre,
                    codigo: `${item.codigo}-${areaNombre.substring(0, 3).toUpperCase()}`,
                    gerenciaId: gerencia.id,
                    activo: true
                  }
                });
                areasCreated++;
                console.log(`  ➕ Área creada: ${areaNombre}`);
              } else {
                // Actualizar gerencia de área existente
                await prisma.area.update({
                  where: { id: existingArea.id },
                  data: { gerenciaId: gerencia.id }
                });
                console.log(`  ✅ Área actualizada: ${areaNombre}`);
              }
            } catch (areaError) {
              console.error(`  ❌ Error con área ${areaNombre}:`, areaError.message);
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Error procesando ${item.nombre}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
    console.log(`  🏢 Gerencias creadas: ${created}`);
    console.log(`  🏢 Gerencias actualizadas: ${updated}`);
    console.log(`  🏢 Áreas creadas: ${areasCreated}`);
    console.log(`  ❌ Errores: ${errors}`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTemplate() {
  // Crear directorio data si no existe
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  
  // Crear plantilla CSV
  const template = `nombre,codigo,descripcion,areas
Gerencia de Tecnología,GER-TEC,Gestión de infraestructura tecnológica,Sistemas|Desarrollo|Soporte Técnico
Gerencia de Administración,GER-ADM,Administración y finanzas,Contabilidad|Recursos Humanos|Finanzas
Gerencia Comercial,GER-COM,Ventas y atención al cliente,Ventas|Marketing|Atención al Cliente
Gerencia de Operaciones,GER-OPE,Operaciones logísticas,Almacén|Distribución|Inventario
Gerencia de Proyectos,GER-PRO,Gestión de proyectos,Planificación|Ejecución|Control
Gerencia Legal,GER-LEG,Asuntos legales y compliance,Contratos|Compliance|Legal`;
  
  fs.writeFileSync('data/gerencias.csv', template);
  
  console.log('📄 Plantilla creada en: data/gerencias.csv');
  console.log('📝 Edita el archivo y ejecuta el script nuevamente');
  console.log('\n📋 Formato requerido:');
  console.log('  - nombre: Nombre de la gerencia');
  console.log('  - codigo: Código único (ej: GER-TEC)');
  console.log('  - descripcion: Descripción opcional');
  console.log('  - areas: Áreas separadas por | (ej: Sistemas|Desarrollo)');
}

// Función para limpiar gerencias y áreas existentes (opcional)
async function cleanExistingGerencias() {
  const prisma = new PrismaService();
  
  try {
    console.log('🧹 Limpiando gerencias y áreas existentes...');
    
    // Verificar si hay licencias vinculadas
    const licenciasVinculadas = await prisma.licencia.count({
      where: { 
        OR: [
          { gerenciaId: { not: null } },
          { areaId: { not: null } }
        ]
      }
    });
    
    if (licenciasVinculadas > 0) {
      console.log(`⚠️ Hay ${licenciasVinculadas} licencias vinculadas. No se puede limpiar.`);
      return;
    }
    
    // Eliminar áreas primero (por FK constraint)
    const deletedAreas = await prisma.area.deleteMany({});
    console.log(`🗑️ ${deletedAreas.count} áreas eliminadas`);
    
    const deletedGerencias = await prisma.gerencia.deleteMany({});
    console.log(`🗑️ ${deletedGerencias.count} gerencias eliminadas`);
    
  } catch (error) {
    console.error('❌ Error limpiando:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar importación
importGerencias(); 