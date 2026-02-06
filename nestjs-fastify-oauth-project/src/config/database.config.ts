import { IsNotEmpty, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  @Env('DATABASE_URI')
  databaseUri: string

  @IsString()
  @IsNotEmpty()
  @Env('DATABASE_NAME')
  databaseName: string

  get dbMongo(): string {
    return this.databaseUri
  }
}



