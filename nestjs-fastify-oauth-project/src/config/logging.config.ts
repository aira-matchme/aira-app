import { IsOptional, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

/**
 * All of the options are used for the file rotation mentioned here:
 * https://www.npmjs.com/package/file-stream-rotator
 */
export class LoggingConfig {
  @Env('LOG_FILE_NAME', { default: 'logs/application.log' })
  fileName: string

  @IsString()
  @Env('LOG_FILE_FREQUENCY', { default: '1d' })
  fileFrequency: string

  @IsString()
  @Env('LOG_FILE_DATE_FORMAT', { default: 'YYYY-MM-DD' })
  fileDateFormat: string

  @Env('LOG_FILE_RETENTION_DAYS', { default: '30d' })
  fileMaxLogsTime: string

  @Env('LOG_FILE_SIZE', { default: '100m' })
  fileSize: string

  @IsOptional()
  @Env('LOG_FILE_EXTENSION', { optional: true })
  fileExtension: string

  /* Other config for logging */
  @Env('LOG_TO_CONSOLE', { default: true })
  logToConsole: boolean

  @Env('LOG_TO_FILE', { default: false })
  logToFile: boolean
}



