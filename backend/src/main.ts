// Cargar variables de entorno desde .env
import * as dotenv from 'dotenv';
import { join } from 'path';

// Cargar archivo .env desde la raíz del proyecto
dotenv.config({ path: join(__dirname, '..', '.env') });

// Debug: Mostrar si las variables se cargaron correctamente
console.log('🔧 Variables de entorno cargadas:');
console.log('- MICROSOFT_CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
console.log('- MICROSOFT_TENANT_ID:', process.env.MICROSOFT_TENANT_ID ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
console.log('- MICROSOFT_REDIRECT_URI:', process.env.MICROSOFT_REDIRECT_URI ? '[CONFIGURADO]' : '[NO CONFIGURADO]');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aumentar el límite de tamaño para archivos grandes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove non-whitelisted properties
    forbidNonWhitelisted: false, // No lanzar error por propiedades no permitidas, solo removerlas
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    skipMissingProperties: true, // Skip validation of missing properties
  }));

  // Habilitar CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: [
      'http://localhost:3000', // Desarrollo local
      'http://192.168.40.79:3005', // Frontend en EasyPanel
      'http://192.168.40.79:3000', // Por si usa puerto 3000
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3002);
}
bootstrap();
