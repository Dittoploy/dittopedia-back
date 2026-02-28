import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: app.setGlobalPrefix('api/v1');
  // TODO: app.useGlobalFilters(...);
  // TODO: app.useGlobalInterceptors(...);
  // TODO: app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
