import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter());

    const config = new DocumentBuilder()
      .setTitle('Love Travel API')
      .setDescription('API for the Love Travel project')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    app.useGlobalFilters(new AllExceptionsFilter());

    const defaultOrigins = ['http://localhost:8080', 'http://localhost:5173'];
    const extraOriginsRaw =
      process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? '';
    const extraOrigins = extraOriginsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const origins = Array.from(new Set([...defaultOrigins, ...extraOrigins]));

    app.enableCors({
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`API documentation with Swagger: http://localhost:${port}/api/docs`);
    console.log(`LOGS with Dozzle: http://localhost:8081`);
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}
bootstrap();
