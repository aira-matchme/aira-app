// import { Injectable } from '@nestjs/common'
// import { PassportStrategy } from '@nestjs/passport'
// import AppleStrategyBase from 'passport-apple'
// import { OAuthConfig } from '../../config/oauth.config'
// import * as jwt from 'jsonwebtoken'

// @Injectable()
// export class AppleStrategy extends PassportStrategy(AppleStrategyBase, 'apple') {
//   constructor(private oauthConfig: OAuthConfig) {
//     // Generate client secret for Apple
//     const clientSecret = jwt.sign(
//       {
//         iss: oauthConfig.appleTeamId,
//         iat: Math.floor(Date.now() / 1000),
//         exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 months
//         aud: 'https://appleid.apple.com',
//         sub: oauthConfig.appleClientId
//       },
//       oauthConfig.applePrivateKey.replace(/\\n/g, '\n'),
//       {
//         algorithm: 'ES256',
//         keyid: oauthConfig.appleKeyId
//       }
//     )

//     super({
//       clientID: oauthConfig.appleClientId,
//       teamID: oauthConfig.appleTeamId,
//       keyID: oauthConfig.appleKeyId,
//       privateKeyString: oauthConfig.applePrivateKey.replace(/\\n/g, '\n'),
//       callbackURL: oauthConfig.appleCallbackUrl,
//       scope: ['name', 'email'],
//       clientSecret: clientSecret
//     })
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     decodedIdToken: any,
//     profile: any,
//     done: (err: Error | null, user?: any) => void
//   ): Promise<any> {
//     // decodedIdToken is already decoded by passport-apple
//     const decoded = decodedIdToken
    
//     const user = {
//       provider: 'apple',
//       providerId: decoded.sub,
//       appleUserIdentifier: decoded.sub,
//       email: decoded.email || profile?.email || null,
//       name: profile?.name
//         ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
//         : 'Apple User',
//       profilePicture: null,
//       accessToken
//     }
//     done(null, user)
//   }
// }

