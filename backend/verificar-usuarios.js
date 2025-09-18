const { PrismaClient } = require('./generated/prisma');

async function verificarUsuarios() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany();
    console.log('Usuarios existentes:');
    console.log('==================');
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Username: ${user.username}`);
      console.log(`Full Name: ${user.fullName}`);
      console.log(`isAdmin: ${user.isAdmin}`);
      console.log(`isActive: ${user.isActive}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    });
    
    console.log(`Total usuarios: ${users.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarios();
