import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseMessage } from '../helpers/response-mapping/response.decorator'
import { AuthService } from './auth.service'
import { GoogleAuthGuard } from './guards/google-auth.guard'
// Apple OAuth - Commented out until Apple Developer account is set up
// import { AppleAuthGuard } from './guards/apple-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { UserId } from './decorators/user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth() {
    // Guard redirects to Google
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ResponseMessage('Login successful')
  async googleAuthRedirect(@Request() req, @Request() reqFastify: any) {
    const user = await this.authService.validateOAuthUser(req.user)
    const ipAddress = reqFastify.ip || req.ip || 'unknown'
    const userAgent = reqFastify.headers['user-agent'] || 'unknown'
    return this.authService.login(user, ipAddress, userAgent)
  }

  // Apple OAuth - Commented out until Apple Developer account is set up
  // @ApiOperation({ summary: 'Initiate Apple OAuth login' })
  // @UseGuards(AppleAuthGuard)
  // @Get('apple')
  // @HttpCode(HttpStatus.OK)
  // async appleAuth() {
  //   // Guard redirects to Apple
  // }

  // @ApiOperation({ summary: 'Apple OAuth callback' })
  // @UseGuards(AppleAuthGuard)
  // @Get('apple/callback')
  // @ResponseMessage('Login successful')
  // async appleAuthRedirect(@Request() req: any) {
  //   const user = await this.authService.validateOAuthUser(req.user)
  //   const ipAddress = req.ip || 'unknown'
  //   const userAgent = req.headers['user-agent'] || 'unknown'
  //   return this.authService.login(user, ipAddress, userAgent)
  // }

  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  @ResponseMessage('Profile fetched successfully')
  async getProfile(@UserId() userId: string) {
    const user : any= await this.authService.validateUser(userId)
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      provider: user.provider,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    }
  }
}

