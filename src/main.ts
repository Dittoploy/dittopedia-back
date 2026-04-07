import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: app.setGlobalPrefix('api/v1');
  // TODO: app.useGlobalFilters(...);
  // TODO: app.useGlobalInterceptors(...);
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendOrigins = process.env.FRONTEND_URL?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (isProduction && (!frontendOrigins || frontendOrigins.length === 0)) {
    throw new Error('FRONTEND_URL must be set in production');
  }

  app.enableCors({
    origin: frontendOrigins && frontendOrigins.length > 0 ? frontendOrigins : !isProduction,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
