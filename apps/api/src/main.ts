import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { configureHttpApp } from './config/http-app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApp(app);

  const swagger = setupSwagger(app);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚀 API corriendo en http://localhost:${port}`);
  if (swagger.enabled) {
    console.log(`📚 Swagger en http://localhost:${port}/${swagger.docsPath}`);
    console.log(
      `🧾 OpenAPI JSON en http://localhost:${port}/${swagger.jsonPath}`,
    );
  }
}

void bootstrap();
