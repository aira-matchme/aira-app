import { Module } from '@nestjs/common'
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from './config-module/config.module'
import { AppConfig } from './config/app.config'
import { DatabaseConfig } from './config/database.config'
import { AuthJwtConfig } from './config/auth-jwt.config'
import { LoggingConfig } from './config/logging.config'
import { SwaggerConfig } from './config/swagger.config'
import { OAuthConfig } from './config/oauth.config'
import { Connection } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { AppConstants } from './helpers/constants/app-constants'
import { mongooseSchemaTransform } from './helpers/schema-transform/mongoose-schema-transform-plugin'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { LoggerModule } from 'nestjs-pino'
const pino = require('pino')
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ConfigModule.register({
      configs: [
        DatabaseConfig,
        AppConfig,
        AuthJwtConfig,
        LoggingConfig,
        SwaggerConfig,
        OAuthConfig
      ]
    }),

    MongooseModule.forRootAsync({
      inject: [DatabaseConfig],
      useFactory: async (databaseConfig: DatabaseConfig) => ({
        uri: databaseConfig.dbMongo,
        dbName: databaseConfig.databaseName,
        connectionFactory(connection: Connection, name: string) {
          mongoosePaginate.paginate.options =
            AppConstants.DEFAULT_PAGINATION_OPTIONS

          connection.plugin(mongooseSchemaTransform)
          return connection
        }
      })
    }),

    //pino module for logging
    LoggerModule.forRootAsync({
      inject: [LoggingConfig],
      useFactory: (loggingConfig: LoggingConfig) => {
        const streams: any = []

        if (loggingConfig.logToFile) {
          const options = {
            filename: loggingConfig.fileName,
            frequency: loggingConfig.fileFrequency,
            size: loggingConfig.fileSize,
            verbose: true,
            date_format: loggingConfig.fileDateFormat,
            max_logs: loggingConfig.fileMaxLogsTime,
            audit_hash_type: 'sha256',
            end_stream: true
          }

          if (loggingConfig.fileExtension) {
            options['extension'] = loggingConfig.fileExtension
          }

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const rotatingLogStream = require('file-stream-rotator').getStream(
            options
          )

          streams.push({ stream: rotatingLogStream })
        }

        if (loggingConfig.logToConsole) {
          // add pretty print remove pid and hostname and formate timestamp
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const pinoDebugPrettyStream = require('pino-pretty')({
            ignore: 'pid,hostname',
            translateTime: 'yyyy-mm-dd HH:MM:ss.l o'
          })
          streams.push({ stream: pinoDebugPrettyStream })
        }

        return {
          pinoHttp: {
            useLevel: 'trace',
            //transport to file
            stream: pino.multistream(streams),
            //remove headers from request object
            serializers: {
              req: (r) => {
                delete r.headers
                delete r.remoteAddress
                delete r.remotePort
                return r
              }
            }
          }
        }
      }
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100 // 100 requests per minute
      }
    ]),

    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}



