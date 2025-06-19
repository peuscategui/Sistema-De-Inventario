import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilitando CORS para permitir peticiones desde otros dominios
  await app.listen(3002); // Forzando el uso del puerto 3002
}
bootstrap();
