const { Client } = require('pg');

const client = new Client({
  host: '192.168.40.129',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function loadBasicData() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Cargar Clasificaciones
    console.log('\n📋 1. Cargando Clasificaciones...');
    const clasificaciones = [
      { id: 1, familia: 'Computadoras', sub_familia: 'Desktop', tipo_equipo: 'PC de Escritorio', vida_util: '5 años', valor_reposicion: 1500.00 },
      { id: 2, familia: 'Computadoras', sub_familia: 'Laptop', tipo_equipo: 'Portátil', vida_util: '4 años', valor_reposicion: 2000.00 },
      { id: 3, familia: 'Impresoras', sub_familia: 'Laser', tipo_equipo: 'Impresora Laser', vida_util: '3 años', valor_reposicion: 800.00 },
      { id: 4, familia: 'Impresoras', sub_familia: 'Inyección', tipo_equipo: 'Impresora de Inyección', vida_util: '3 años', valor_reposicion: 300.00 },
      { id: 5, familia: 'Redes', sub_familia: 'Switch', tipo_equipo: 'Switch de Red', vida_util: '7 años', valor_reposicion: 500.00 },
      { id: 6, familia: 'Redes', sub_familia: 'Router', tipo_equipo: 'Router', vida_util: '5 años', valor_reposicion: 400.00 },
      { id: 7, familia: 'Almacenamiento', sub_familia: 'Disco Duro', tipo_equipo: 'Disco Duro Externo', vida_util: '4 años', valor_reposicion: 200.00 },
      { id: 8, familia: 'Almacenamiento', sub_familia: 'SSD', tipo_equipo: 'Disco SSD', vida_util: '4 años', valor_reposicion: 300.00 },
      { id: 9, familia: 'Monitores', sub_familia: 'LCD', tipo_equipo: 'Monitor LCD', vida_util: '6 años', valor_reposicion: 400.00 },
      { id: 10, familia: 'Monitores', sub_familia: 'LED', tipo_equipo: 'Monitor LED', vida_util: '6 años', valor_reposicion: 500.00 }
    ];

    for (const clas of clasificaciones) {
      await client.query(`
        INSERT INTO clasificacion (id, familia, sub_familia, tipo_equipo, vida_util, valor_reposicion)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [clas.id, clas.familia, clas.sub_familia, clas.tipo_equipo, clas.vida_util, clas.valor_reposicion]);
    }
    console.log('✅ Clasificaciones cargadas');

    // 2. Cargar Empleados
    console.log('\n👥 2. Cargando Empleados...');
    const empleados = [
      { id: 1, nombre: 'Juan Pérez', cargo: 'Analista de Sistemas', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 2, nombre: 'María García', cargo: 'Desarrollador', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 3, nombre: 'Carlos López', cargo: 'Administrador de Redes', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 4, nombre: 'Ana Rodríguez', cargo: 'Analista de Datos', gerencia: 'Analytics', sede: 'Lima' },
      { id: 5, nombre: 'Luis Martínez', cargo: 'Desarrollador Senior', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 6, nombre: 'Sofia Torres', cargo: 'Analista de Negocios', gerencia: 'Operaciones', sede: 'Lima' },
      { id: 7, nombre: 'Roberto Silva', cargo: 'Administrador de Sistemas', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 8, nombre: 'Carmen Vargas', cargo: 'Desarrollador', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 9, nombre: 'Diego Morales', cargo: 'Analista de Seguridad', gerencia: 'Tecnología', sede: 'Lima' },
      { id: 10, nombre: 'Patricia Ruiz', cargo: 'Desarrollador', gerencia: 'Tecnología', sede: 'Lima' }
    ];

    for (const emp of empleados) {
      await client.query(`
        INSERT INTO empleado (id, nombre, cargo, gerencia, sede)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [emp.id, emp.nombre, emp.cargo, emp.gerencia, emp.sede]);
    }
    console.log('✅ Empleados cargados');

    // 3. Cargar Inventory
    console.log('\n💻 3. Cargando Inventory...');
    const inventory = [
      {
        id: 1, codigoEFC: 'PC-001', marca: 'Dell', modelo: 'OptiPlex 7090', descripcion: 'PC de Escritorio para oficina',
        serie: 'SN123456', procesador: 'Intel i5-10500', anio: 2021, ram: '8GB', discoDuro: '256GB SSD',
        sistemaOperativo: 'Windows 10', status: 'libre', estado: 'Activo', ubicacionEquipo: 'Oficina 101',
        qUsuarios: 1, condicion: 'Bueno', repotenciadas: false, clasificacionObsolescencia: 'No obsoleto',
        clasificacionRepotenciadas: 'No repotenciado', motivoCompra: 'Reemplazo equipo anterior',
        proveedor: 'Dell Perú', factura: 'F001-2021', anioCompra: 2021, observaciones: 'Equipo nuevo',
        fecha_compra: '2021-01-15', precioUnitarioSinIgv: '1800.00', clasificacionId: 1, empleadoId: 1
      },
      {
        id: 2, codigoEFC: 'PC-002', marca: 'HP', modelo: 'EliteDesk 800', descripcion: 'PC de Escritorio para desarrollo',
        serie: 'SN789012', procesador: 'Intel i7-10700', anio: 2021, ram: '16GB', discoDuro: '512GB SSD',
        sistemaOperativo: 'Windows 10', status: 'asignado', estado: 'Activo', ubicacionEquipo: 'Oficina 102',
        qUsuarios: 1, condicion: 'Excelente', repotenciadas: false, clasificacionObsolescencia: 'No obsoleto',
        clasificacionRepotenciadas: 'No repotenciado', motivoCompra: 'Desarrollo de software',
        proveedor: 'HP Perú', factura: 'F002-2021', anioCompra: 2021, observaciones: 'Equipo para desarrollador',
        fecha_compra: '2021-02-20', precioUnitarioSinIgv: '2200.00', clasificacionId: 1, empleadoId: 2
      },
      {
        id: 3, codigoEFC: 'LAP-001', marca: 'Dell', modelo: 'Latitude 5520', descripcion: 'Laptop para trabajo móvil',
        serie: 'SN345678', procesador: 'Intel i5-1135G7', anio: 2021, ram: '8GB', discoDuro: '256GB SSD',
        sistemaOperativo: 'Windows 10', status: 'libre', estado: 'Activo', ubicacionEquipo: 'Oficina 103',
        qUsuarios: 1, condicion: 'Bueno', repotenciadas: false, clasificacionObsolescencia: 'No obsoleto',
        clasificacionRepotenciadas: 'No repotenciado', motivoCompra: 'Trabajo remoto',
        proveedor: 'Dell Perú', factura: 'F003-2021', anioCompra: 2021, observaciones: 'Equipo portátil',
        fecha_compra: '2021-03-10', precioUnitarioSinIgv: '2500.00', clasificacionId: 2, empleadoId: 3
      },
      {
        id: 4, codigoEFC: 'PRN-001', marca: 'HP', modelo: 'LaserJet Pro M404n', descripcion: 'Impresora laser para oficina',
        serie: 'SN901234', procesador: 'No aplica', anio: 2020, ram: 'No aplica', discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica', status: 'libre', estado: 'Activo', ubicacionEquipo: 'Oficina 104',
        qUsuarios: 5, condicion: 'Bueno', repotenciadas: false, clasificacionObsolescencia: 'No obsoleto',
        clasificacionRepotenciadas: 'No repotenciado', motivoCompra: 'Impresión documentos',
        proveedor: 'HP Perú', factura: 'F004-2020', anioCompra: 2020, observaciones: 'Impresora compartida',
        fecha_compra: '2020-11-15', precioUnitarioSinIgv: '800.00', clasificacionId: 3, empleadoId: 4
      },
      {
        id: 5, codigoEFC: 'SW-001', marca: 'Cisco', modelo: 'Catalyst 2960', descripcion: 'Switch de red 24 puertos',
        serie: 'SN567890', procesador: 'No aplica', anio: 2020, ram: 'No aplica', discoDuro: 'No aplica',
        sistemaOperativo: 'No aplica', status: 'libre', estado: 'Activo', ubicacionEquipo: 'Sala de servidores',
        qUsuarios: 50, condicion: 'Excelente', repotenciadas: false, clasificacionObsolescencia: 'No obsoleto',
        clasificacionRepotenciadas: 'No repotenciado', motivoCompra: 'Infraestructura de red',
        proveedor: 'Cisco Perú', factura: 'F005-2020', anioCompra: 2020, observaciones: 'Switch principal',
        fecha_compra: '2020-12-01', precioUnitarioSinIgv: '500.00', clasificacionId: 5, empleadoId: 5
      }
    ];

    for (const inv of inventory) {
      await client.query(`
        INSERT INTO inventory (
          id, codigoEFC, marca, modelo, descripcion, serie, procesador, anio, ram, discoDuro,
          sistemaOperativo, status, estado, ubicacionEquipo, qUsuarios, condicion, repotenciadas,
          clasificacionObsolescencia, clasificacionRepotenciadas, motivoCompra, proveedor, factura,
          anioCompra, observaciones, fecha_compra, precioUnitarioSinIgv, clasificacionId, empleadoId
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        ON CONFLICT (id) DO NOTHING
      `, [
        inv.id, inv.codigoEFC, inv.marca, inv.modelo, inv.descripcion, inv.serie, inv.procesador,
        inv.anio, inv.ram, inv.discoDuro, inv.sistemaOperativo, inv.status, inv.estado,
        inv.ubicacionEquipo, inv.qUsuarios, inv.condicion, inv.repotenciadas,
        inv.clasificacionObsolescencia, inv.clasificacionRepotenciadas, inv.motivoCompra,
        inv.proveedor, inv.factura, inv.anioCompra, inv.observaciones, inv.fecha_compra,
        inv.precioUnitarioSinIgv, inv.clasificacionId, inv.empleadoId
      ]);
    }
    console.log('✅ Inventory cargado');

    console.log('\n🎉 ¡Carga de datos completada exitosamente!');
    console.log('📊 Datos cargados:');
    console.log('   - Clasificaciones: 10 registros');
    console.log('   - Empleados: 10 registros');
    console.log('   - Inventory: 5 registros');

  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error.message);
  } finally {
    await client.end();
  }
}

loadBasicData(); 