import { IsNotEmpty, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class OAuthConfig {
  // Google OAuth
  @IsString()
  @IsNotEmpty()
  @Env('GOOGLE_CLIENT_ID')
  googleClientId: string

  @IsString()
  @IsNotEmpty()
  @Env('GOOGLE_CLIENT_SECRET')
  googleClientSecret: string

  @IsString()
  @Env('GOOGLE_CALLBACK_URL', { default: 'http://localhost:3000/auth/google/callback' })
  googleCallbackUrl: string

  // Apple OAuth - Commented out until Apple Developer account is set up
  // @IsString()
  // @IsNotEmpty()
  // @Env('APPLE_CLIENT_ID', { optional: true })
  // appleClientId?: string

  // @IsString()
  // @IsNotEmpty()
  // @Env('APPLE_TEAM_ID', { optional: true })
  // appleTeamId?: string

  // @IsString()
  // @IsNotEmpty()
  // @Env('APPLE_KEY_ID', { optional: true })
  // appleKeyId?: string

  // @IsString()
  // @IsNotEmpty()
  // @Env('APPLE_PRIVATE_KEY', { optional: true })
  // applePrivateKey?: string

  // @IsString()
  // @Env('APPLE_CALLBACK_URL', { default: 'http://localhost:3000/auth/apple/callback' })
  // appleCallbackUrl?: string
}



