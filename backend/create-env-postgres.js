const fs = require('fs');

const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@192.168.40.129:5432/postgres?schema=public"

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=6e76e432-2c58-46b2-b7e1-72d9ea19484b
MICROSOFT_CLIENT_SECRET=your_client_secret_here
MICROSOFT_TENANT_ID=your_tenant_id_here
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3002
NODE_ENV=development
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Archivo .env creado exitosamente');
  console.log('📝 Configuración actualizada:');
  console.log('   - Host: 192.168.40.129');
  console.log('   - Base de datos: postgres');
  console.log('   - Usuario: postgres');
} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
} 