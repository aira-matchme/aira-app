import { Type } from '@nestjs/common'

export interface ConfigOptions {
  configs: Array<Type<any>>
  global?: boolean
}

export const CONFIG_OPTIONS_DEFAULT = {
  global: true
}



