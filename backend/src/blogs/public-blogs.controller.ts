import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';

@Controller('blogs')
export class PublicBlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.blogsService.findPublished(page, limit);
    console.log(`[Public API] Found ${result.blogs.length} published articles`);
    return result;
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogsService.findPublishedBySlug(slug);
  }
}
