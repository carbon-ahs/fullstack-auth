import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes( // must put it before listening
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(8000);

}
await bootstrap();
