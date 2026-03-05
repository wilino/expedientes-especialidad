import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from '../shared/filters';

export function configureHttpApp(app: INestApplication): void {
  // Seguridad: headers HTTP
  app.use(helmet());

  // CORS estricto
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // Validación global (class-validator) — rechaza propiedades no declaradas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro global de excepciones (respuestas estandarizadas)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Prefijo global de API
  app.setGlobalPrefix('api');
}
