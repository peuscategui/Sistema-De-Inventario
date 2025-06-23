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
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  }));

  // Habilitar CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: 'http://localhost:3000', // Origen del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3002);
}
bootstrap();
