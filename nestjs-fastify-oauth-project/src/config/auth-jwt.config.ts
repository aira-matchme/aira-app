import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class AuthJwtConfig {
  @IsString()
  @IsNotEmpty()
  @Env('AUTH_JWT_SECRET')
  secret: string

  @IsString()
  @Env('AUTH_JWT_EXPIRATION_TIME', { default: '1h' })
  expirationTime: string

  @IsNumber()
  @Env('AUTH_MAX_SESSIONS', { default: 5 })
  maxSessions: number

  @IsNumber()
  @Env('AUTH_ACCESS_TOKEN_RENEW_EXPIRE_TIME', { default: 3600000 })
  accessTokenRenewExpireTime: number
}



