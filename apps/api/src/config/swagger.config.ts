import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

interface SwaggerSetupResult {
  enabled: boolean;
  docsPath: string;
  jsonPath: string;
}

function sanitizePath(path: string): string {
  return path.replace(/^\/+/, '');
}

export function setupSwagger(app: INestApplication): SwaggerSetupResult {
  const isEnabled =
    (process.env.SWAGGER_ENABLED ?? 'true').toLowerCase() !== 'false';
  const docsPath = sanitizePath(process.env.SWAGGER_PATH ?? 'docs');
  const jsonPath = sanitizePath(
    process.env.SWAGGER_JSON_PATH ?? `${docsPath}-json`,
  );

  if (!isEnabled) {
    return { enabled: false, docsPath, jsonPath };
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Expedientes Legales API')
    .setDescription(
      'API REST para gestión de expedientes legales con RBAC y trazabilidad',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const documentOptions: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    documentOptions,
  );

  const customOptions: SwaggerCustomOptions = {
    jsonDocumentUrl: `/${jsonPath}`,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
    },
  };

  SwaggerModule.setup(docsPath, app, swaggerDocument, customOptions);

  return { enabled: true, docsPath, jsonPath };
}
