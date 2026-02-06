import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { AuthJwtConfig } from '../config/auth-jwt.config'
import { User } from '../user/schemas/user.schema'
import DeviceDetector = require('device-detector-js')
import { CreateUserDto } from '../user/dto/create-user.dto'

const deviceDetector = new DeviceDetector()

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private authJwtConfig: AuthJwtConfig
  ) {}

  async validateOAuthUser(profile: any): Promise<User> {
    const { provider, providerId } = profile

    // Check if user exists
    let user : any= await this.userService.findByProviderId(provider, providerId)

    if (!user) {
      // Create new user
      const createUserDto: CreateUserDto = {
        name: profile.name,
        email: profile.email,
        profilePicture: profile.profilePicture || null,
        provider: profile.provider,
        providerId: profile.providerId,
        googleId: profile.googleId || null,
        appleUserIdentifier: profile.appleUserIdentifier || null,
        phoneNumber: null
      }
      user = await this.userService.create(createUserDto)
    } else {
      // Update user info if needed
      if (profile.profilePicture && !user.profilePicture) {
        user.profilePicture = profile.profilePicture
        await user.save()
      }
    }

    return user
  }

  async login(user: any, ipAddress: string, userAgent: string) {
    const payload = {
      email: user.email,
      sub: user.id.toString(),
      provider: user.provider
    }

    const accessToken = this.jwtService.sign(
      payload,
      {
        // Cast expiresIn to any to satisfy jsonwebtoken's StringValue type
        expiresIn: this.authJwtConfig.expirationTime as any
      } as any
    )

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        provider: user.provider
      },
      accessToken
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userService.findOne(userId)
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive')
    }
    return user
  }
}



