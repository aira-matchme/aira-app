import { Schema } from 'mongoose'

export const mongooseSchemaTransform = (schema: Schema) => {
  // Transform _id to id
  schema.set('toJSON', {
    transform: function (doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  })

  schema.set('toObject', {
    transform: function (doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  })
}



