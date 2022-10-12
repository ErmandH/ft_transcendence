import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true // mesela ben gelip requeste ekstradan id eklersem onu da ekliyo whiteList bunu engelliyo, dto da ne varsa o geliyo
  }))
  app.enableCors(); // baska porttakiler istek atabilsin diye
  await app.listen(3334);
}
bootstrap();
