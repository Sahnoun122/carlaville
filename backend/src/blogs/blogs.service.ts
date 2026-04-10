import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { getMediaBaseUrl, normalizeMediaUrl, normalizeMediaUrls } from '../common/utils/media-url';

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const normalizeCoverImage = (coverImage: string | undefined, fallback?: string) => {
  const trimmed = coverImage?.trim();

  if (trimmed && /^(https?:\/\/|\/)/i.test(trimmed)) {
    return normalizeMediaUrl(trimmed);
  }

  return normalizeMediaUrl(fallback);
};

const mapBlogForDisplay = <T extends { coverImage?: string; images?: string[] }>(
  blog: T,
) => ({
  ...blog,
  coverImage: normalizeCoverImage(blog.coverImage, blog.images?.[0]),
  images: normalizeMediaUrls(blog.images, getMediaBaseUrl()),
});

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const slug = slugify(createBlogDto.slug || createBlogDto.title);

    if (!slug) {
      throw new BadRequestException('Unable to generate a valid slug for this blog.');
    }

    const existing = await this.blogModel.findOne({ slug }).lean().exec();
    if (existing) {
      throw new BadRequestException('A blog with this slug already exists.');
    }

    const normalizedImages = normalizeMediaUrls(createBlogDto.images, getMediaBaseUrl());

    const createdBlog = await this.blogModel.create({
      ...createBlogDto,
      slug,
      published: createBlogDto.published ?? true,
      title: createBlogDto.title.trim(),
      excerpt: createBlogDto.excerpt.trim(),
      content: createBlogDto.content.trim(),
      coverImage: normalizeCoverImage(createBlogDto.coverImage, normalizedImages[0]),
      images: normalizedImages,
    });

    return mapBlogForDisplay(createdBlog) as Blog;
  }

  async findAll(filterDto: FilterBlogDto, page: number, limit: number) {
    const query: Record<string, unknown> = {};

    if (typeof filterDto.published === 'string') {
      query.published = filterDto.published === 'true';
    }

    if (filterDto.q) {
      const escapedSearch = filterDto.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { excerpt: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const blogs = await this.blogModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const count = await this.blogModel.countDocuments(query);

    return { blogs: blogs.map((blog) => mapBlogForDisplay(blog)), count };
  }

  async findPublished(page: number, limit: number) {
    return this.findAll({ published: 'true' }, page, limit);
  }

  async findPublishedBySlug(slug: string): Promise<Blog> {
    const normalizedSlug = slug.trim().toLowerCase();

    const blog = await this.blogModel
      .findOne({ slug: normalizedSlug, published: true })
      .lean()
      .exec();

    if (!blog) {
      throw new NotFoundException(`Published blog with slug ${slug} not found`);
    }

    return mapBlogForDisplay(blog) as Blog;
  }

  async findById(id: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id).lean().exec();

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return mapBlogForDisplay(blog) as Blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    if (updateBlogDto.slug || updateBlogDto.title) {
      const slug = slugify(updateBlogDto.slug || updateBlogDto.title || '');

      if (!slug) {
        throw new BadRequestException('Invalid slug value.');
      }

      const existing = await this.blogModel
        .findOne({ slug, _id: { $ne: id } })
        .lean()
        .exec();

      if (existing) {
        throw new BadRequestException('A blog with this slug already exists.');
      }

      updateBlogDto.slug = slug;
    }

    const normalizedImages = updateBlogDto.images
      ? normalizeMediaUrls(updateBlogDto.images, getMediaBaseUrl())
      : undefined;

    const normalizedCoverImage =
      updateBlogDto.coverImage !== undefined
        ? normalizeCoverImage(updateBlogDto.coverImage, normalizedImages?.[0])
        : undefined;

    const updated = await this.blogModel
      .findByIdAndUpdate(
        id,
        {
          ...updateBlogDto,
          title: updateBlogDto.title?.trim(),
          excerpt: updateBlogDto.excerpt?.trim(),
          content: updateBlogDto.content?.trim(),
          coverImage: normalizedCoverImage,
          images: normalizedImages,
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return mapBlogForDisplay(updated) as Blog;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.blogModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return { message: 'Blog deleted successfully' };
  }
}
