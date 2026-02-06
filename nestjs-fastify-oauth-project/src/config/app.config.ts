import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class AppConfig {
  @IsNumber()
  @IsNotEmpty()
  @Env('APP_PORT', { default: 3000 })
  port: number

  @IsNumber()
  @Env('APP_RELEASE', { default: 1 })
  release: number

  @IsBoolean()
  @Env('APP_REQUEST_LOGGING', { default: true })
  requestLogging: boolean

  @IsString()
  @Env('NODE_ENV', { default: 'development' })
  nodeEnv: string
}



