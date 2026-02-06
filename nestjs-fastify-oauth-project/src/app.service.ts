import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'NestJS Fastify OAuth API is running!'
  }
}



