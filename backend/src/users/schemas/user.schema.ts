import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete (ret as any)._id;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      delete (ret as any)._id;
    },
  },
})
export class User {
  id?: string;
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.DELIVERY_AGENT,
  })
  role!: Role;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  name?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  // Only hash if the password is not already hashed (doesn't start with $2b$)
  if (!this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});
