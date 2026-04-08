import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { loadEnvironment } from '@common/config/env.loader';
import { appConfig } from '@common/config/app.config';
import { GlobalExceptionFilter } from '@common/http/global-exception.filter';
import { ApiResponseInterceptor } from '@common/http/api-response.interceptor';

async function bootstrap() {
  loadEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: appConfig.corsOrigins.length > 0 ? appConfig.corsOrigins : true,
    credentials: true,
  });
  app.setGlobalPrefix(appConfig.apiPrefix, {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.enableShutdownHooks();

  await app.listen(appConfig.port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(
    `${appConfig.appName} is running on http://localhost:${appConfig.port}`,
  );
  logger.log(`Health endpoint: http://localhost:${appConfig.port}/health`);
  logger.log(`API prefix: /${appConfig.apiPrefix}`);
}

void bootstrap();
