import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string

  @ApiProperty({ enum: ['google', 'apple'] })
  // Note: 'apple' is commented out in OAuth setup, but keeping in enum for future use
  @IsEnum(['google', 'apple'])
  @IsNotEmpty()
  provider: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerId: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  appleUserIdentifier?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  googleId?: string
}



