import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret._id;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret._id;
    },
  },
})
export class Blog {
  id?: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ required: true, trim: true, maxlength: 300 })
  excerpt!: string;

  @Prop({ required: true, trim: true })
  content!: string;

  @Prop({ trim: true })
  coverImage?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ default: true })
  published!: boolean;

  @Prop({ trim: true })
  createdBy?: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ published: 1, createdAt: -1 });
