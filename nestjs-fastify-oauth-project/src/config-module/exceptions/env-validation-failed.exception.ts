import { HttpException, HttpStatus } from '@nestjs/common'

export class EnvValidationFailed extends HttpException {
  constructor(errors: string[][]) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Environment variable validation failed',
        errors: errors,
        error: 'Environment Validation Failed'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}



