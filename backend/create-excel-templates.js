const fs = require('fs');
const path = require('path');

// Función para crear directorio si no existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Crear directorio para templates Excel
const excelDir = path.join(__dirname, 'excel-templates');
ensureDirectoryExists(excelDir);

// Lista de archivos CSV a convertir
const csvFiles = [
  { csv: 'templates/clasificaciones_template.csv', excel: 'excel-templates/01_clasificaciones.xlsx' },
  { csv: 'templates/empleados_template.csv', excel: 'excel-templates/02_empleados.xlsx' },
  { csv: 'templates/gerencias_template.csv', excel: 'excel-templates/03_gerencias.xlsx' },
  { csv: 'templates/areas_template.csv', excel: 'excel-templates/04_areas.xlsx' },
  { csv: 'templates/inventory_template.csv', excel: 'excel-templates/05_inventory.xlsx' },
  { csv: 'templates/licencias_template.csv', excel: 'excel-templates/06_licencias.xlsx' }
];

console.log('📁 Creando archivos Excel para carga de datos...');
console.log('='.repeat(60));

csvFiles.forEach((file, index) => {
  const csvPath = path.join(__dirname, file.csv);
  const excelPath = path.join(__dirname, file.excel);
  
  if (fs.existsSync(csvPath)) {
    // Copiar CSV como Excel (los usuarios pueden abrir CSV en Excel)
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const excelContent = csvContent; // Por ahora copiamos el contenido CSV
    
    // Crear archivo con extensión .xlsx pero contenido CSV
    fs.writeFileSync(excelPath.replace('.xlsx', '.csv'), excelContent);
    
    console.log(`✅ ${index + 1}. ${path.basename(file.csv)} → ${path.basename(file.excel.replace('.xlsx', '.csv'))}`);
  } else {
    console.log(`❌ ${index + 1}. No se encontró: ${file.csv}`);
  }
});

console.log('\n📋 Instrucciones para cargar datos:');
console.log('1. Abre cada archivo CSV en Excel');
console.log('2. Completa los datos según tus necesidades');
console.log('3. Guarda como CSV');
console.log('4. Usa los scripts de carga para importar a la base de datos');
console.log('\n📁 Archivos creados en: backend/excel-templates/'); 