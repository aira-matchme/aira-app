import { Module, DynamicModule, Type } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { EnvNotFound } from './exceptions/env-not-found.exception'
import { EnvValidationFailed } from './exceptions/env-validation-failed.exception'
import { EnvParams } from './decorators/env.decorator'
import {
  ConfigOptions,
  CONFIG_OPTIONS_DEFAULT
} from './config-options.interface'
import 'dotenv/config'

@Module({})
export class ConfigModule {
  private static registeredEnvVariables = []

  public static registerEnvVariable(envVariable: string, params?: EnvParams) {
    // add it to the current list
    this.registeredEnvVariables.push({
      name: envVariable,
      default: params?.default,
      optional: params?.optional || false
    })

    // make it unique to remove duplicates
    this.registeredEnvVariables = [...new Set(this.registeredEnvVariables)]
  }

  /**
   * Creates the ConfigModule with the given Config Classes for injecting and using values from the env variables
   * @param options ConfigOptions object with the configs array which can be injected for the envs
   * @returns Dynamic Module
   */
  static register(options: ConfigOptions): DynamicModule {
    const configOptions = Object.assign(CONFIG_OPTIONS_DEFAULT, options)

    // ********************** STEP 1 ****************************
    // STEP 1 : Check for missing envs from all the providers

    // check if the value is missing in .env file OR default value is not present, and used in config file
    const missingEnvVariables = this.registeredEnvVariables.filter(
      (e) =>
        !e.optional &&
        !Object.keys(process.env).includes(e.name) &&
        !(e.default !== undefined)
    )

    //give an exception if the value is not in .env file (key is required value is optional)
    if (missingEnvVariables.length) {
      throw new EnvNotFound(missingEnvVariables.map((e) => e.name))
    }

    // ********************** STEP 2 ****************************
    // Step 2: Now validates all the env values with the class validator

    // validate each config file and return an array of errors
    const errorsArray = configOptions.configs.map((it) => {
      return this.validate(process.env, it)
    })

    // convert single array from array of array and remove null values
    const isError = errorsArray.flat(1).filter((n) => n).length

    // if there are any errors found in the validation of the config classes, thorw an error
    if (isError) {
      // pass non-empty errors for exception
      throw new EnvValidationFailed(errorsArray.filter((n) => n))
    }

    return {
      module: ConfigModule,
      providers: configOptions.configs,
      exports: configOptions.configs,
      global: configOptions.global
    }
  }

  /**
   * Validates the given class with the value from the process envs
   * @param config generally available env
   * @param validateFile The class object to validate
   * @returns array of errors
   */
  private static validate(
    config: Record<string, unknown>,
    validateFile: Type<any>
  ): string[] {
    const validatedConfig = plainToClass(validateFile, config, {
      enableImplicitConversion: true
    })
    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false
    })

    if (errors.length > 0) {
      const stringErrors = errors.map((it) => it.toString())
      return stringErrors || []
    }
  }
}



