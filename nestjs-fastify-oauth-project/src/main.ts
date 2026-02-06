import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ResponseTransformInterceptor } from './helpers/response-mapping/response.transformer'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { LoggingInterceptor } from './helpers/app-logger.interceptor'
import { SwaggerConfig } from './config/swagger.config'
import { AppConfig } from './config/app.config'
import { Logger } from 'nestjs-pino'
import { LoggingConfig } from './config/logging.config'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true
    }
  )

  // config services
  const swaggerConfig = app.get(SwaggerConfig)
  const appConfig = app.get(AppConfig)
  const loggingConfig = app.get(LoggingConfig)

  // enable cors
  await app.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  })

  // Apply Global Validation to prevent bad requests
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false
    })
  )

  // Generate Swagger Documentation
  if (swaggerConfig.generateDocumentation) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.appTitle)
      .setDescription(swaggerConfig.appDescription)
      .setVersion(swaggerConfig.appVersion.toString())
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header'
        },
        'access-token'
      )
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(swaggerConfig.apiPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  }

  // Logs all requests and responses for all incoming requests
  if (appConfig.requestLogging) {
    app.useGlobalInterceptors(new LoggingInterceptor())
  }

  // Transform Responses to use {data, status, message} format
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(app.get(Reflector))
  )

  //pino logger
  app.useLogger(app.get(Logger))

  await app.listen(appConfig.port || 3000, '0.0.0.0')
}
bootstrap()

