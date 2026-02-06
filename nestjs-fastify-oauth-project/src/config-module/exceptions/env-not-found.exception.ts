import { HttpException, HttpStatus } from '@nestjs/common'

export class EnvNotFound extends HttpException {
  constructor(envVariables: string[]) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Missing environment variables: ${envVariables.join(', ')}`,
        error: 'Environment Variable Not Found'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}



