import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { PublicBlogsController } from './public-blogs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  controllers: [BlogsController, PublicBlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
