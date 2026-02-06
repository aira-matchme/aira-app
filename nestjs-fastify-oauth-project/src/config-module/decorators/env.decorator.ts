import { ConfigModule } from '../config.module'

export interface EnvParams {
  default?: string | number | boolean | any
  optional?: boolean
}

/**
 * Env decorator to get and set the env variable's value from the file on the property
 * @param key name of the variable in the .env file
 * @param params options such as default if no value present
 * @returns
 */
export function Env(key: string, params?: EnvParams) {
  // register the env variable to check for it's presence
  ConfigModule.registerEnvVariable(key, params)

  const paramsWithDefault = Object.assign({ optional: false }, params)

  const { default: defaultValue } = paramsWithDefault

  // Property Decorator
  return (target: any, propertyName: string) => {
    // get the type of the property
    const targetType = Reflect.getMetadata('design:type', target, propertyName)

    // get the value from the process.env
    const env = process.env[key]

    // if the value is not present, set the default value
    if (env === undefined) {
      Object.defineProperty(target, propertyName, {
        enumerable: true,
        configurable: false,
        value: defaultValue
      })
      return
    }

    // as the value is available, cast the value to the defined type and set it on the property
    const envValue = castValue(env, targetType)

    Object.defineProperty(target, propertyName, {
      enumerable: true,
      configurable: false,
      value: envValue
    })
  }
}

function castValue(value: string, targetConstructor: any) {
  if (targetConstructor === Object) {
    return JSON.parse(value)
  }
  if (targetConstructor === Boolean) {
    return value === 'true'
  }
  return targetConstructor(value)
}



