import { Module } from '@nestjs/common'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { GoogleStrategy } from './strategies/google.strategy'
// Apple OAuth - Commented out until Apple Developer account is set up
// import { AppleStrategy } from './strategies/apple.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from '../user/user.module'
import { AuthJwtConfig } from '../config/auth-jwt.config'
import { OAuthConfig } from '../config/oauth.config'

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [AuthJwtConfig],
      useFactory: (authJwtConfig: AuthJwtConfig): JwtModuleOptions => {
        return {
          secret: authJwtConfig.secret,
          // Cast expiresIn to any because jsonwebtoken's StringValue type
          // is stricter than a generic string like "1h", but it's valid at runtime.
          signOptions: {
            expiresIn: authJwtConfig.expirationTime as any
          } as any
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    // Apple OAuth - Commented out until Apple Developer account is set up
    // AppleStrategy,
    JwtStrategy
  ],
  exports: [AuthService]
})
export class AuthModule {}


