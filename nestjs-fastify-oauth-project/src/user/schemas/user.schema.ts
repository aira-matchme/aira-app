import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { Schema as MongooseSchema } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { AppConstants } from '../../helpers/constants/app-constants'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @Prop({ required: false })
  profilePicture?: string

  @Prop({ required: false })
  phoneNumber?: string

  // OAuth Provider Information
  @Prop({ required: true, enum: ['google', 'apple'] })
  provider: string

  @Prop({ required: true, unique: true })
  providerId: string // Google ID or Apple ID

  // For Apple Sign In - user identifier
  @Prop({ required: false })
  appleUserIdentifier?: string

  // For Google - additional info
  @Prop({ required: false })
  googleId?: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: false })
  emailVerified: boolean

  // ********* [START] Common Properties *********
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  createdBy: User

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', select: false })
  updatedBy: User

  @Prop({ select: false })
  createdAt: Date

  @Prop({ select: false })
  updatedAt: Date
  // ********* [END] Common Properties *********
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.plugin(paginate)
UserSchema.plugin(aggregatePaginate)

// Note: email and providerId already have unique: true which creates indexes
// Only add compound index for provider + providerId
UserSchema.index({ provider: 1, providerId: 1 })


