import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { OAuthConfig } from '../../config/oauth.config'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private oauthConfig: OAuthConfig) {
    super({
      clientID: oauthConfig.googleClientId,
      clientSecret: oauthConfig.googleClientSecret,
      callbackURL: oauthConfig.googleCallbackUrl,
      scope: ['email', 'profile']
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, name, emails, photos } = profile
    const user = {
      provider: 'google',
      providerId: id,
      googleId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      profilePicture: photos[0].value,
      accessToken
    }
    done(null, user)
  }
}



