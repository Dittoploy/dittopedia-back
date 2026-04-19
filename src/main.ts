import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL;

  console.log(`Debug: NODE_ENV is ${process.env.NODE_ENV}`);
  console.log(`Debug: FRONTEND_URL is "${frontendUrl}"`);

  app.enableCors({
    // On force le booléen true si on veut tout autoriser.
    // NestJS transformera 'true' en l'origine de la requête dans le header.
    origin:
      frontendUrl === '*' || !isProduction ? true : frontendUrl?.split(',').map((o) => o.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
