import { IsBoolean, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class SwaggerConfig {
  @IsBoolean()
  @Env('SWAGGER_GENERATE_DOCUMENTATION', { default: true })
  generateDocumentation: boolean

  @IsString()
  @Env('SWAGGER_APP_TITLE', { default: 'NestJS Fastify OAuth API' })
  appTitle: string

  @IsString()
  @Env('SWAGGER_APP_DESCRIPTION', { default: 'API documentation for NestJS Fastify OAuth project' })
  appDescription: string

  @IsNumber()
  @Env('SWAGGER_APP_VERSION', { default: 1 })
  appVersion: number

  @IsString()
  @Env('SWAGGER_API_PATH', { default: 'api' })
  apiPath: string
}



