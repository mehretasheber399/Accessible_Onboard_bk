import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Env, nestLogLevels, validateEnv } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule, {
    logger: nestLogLevels(env.LOG_LEVEL),
  });

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.enableShutdownHooks();

  const config = app.get(ConfigService<Env, true>);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OpenPath API')
    .setDescription(
      'HTTP API for AllWays jobs, career applications, and accounts.',
    )
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.getOrThrow('PORT'));
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
