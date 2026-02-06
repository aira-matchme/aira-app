import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthJwtConfig } from '../../config/auth-jwt.config'
import { UserService } from '../../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private authJwtConfig: AuthJwtConfig,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authJwtConfig.secret
    })
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub)
    if (!user) {
      throw new UnauthorizedException()
    }
    return { userId: payload.sub, email: payload.email }
  }
}



