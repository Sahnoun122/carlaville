import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Client } from 'minio';
import { getMediaBaseUrl } from '../common/utils/media-url';

@Injectable()
export class UploadsService {
  private readonly minioClient: Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('storage.endPoint', '127.0.0.1');
    const port = this.configService.get<number>('storage.port', 9000);
    const useSSL = this.configService.get<boolean>('storage.useSSL', false);
    const accessKey = this.configService.get<string>('storage.accessKey', 'minioadmin');
    const secretKey = this.configService.get<string>('storage.secretKey', 'minioadmin');

    this.bucketName = this.configService.get<string>('storage.bucket', 'carlaville-media');
    const defaultPublicBaseUrl = `${useSSL ? 'https' : 'http'}://${endPoint}:${port}`;
    this.publicBaseUrl = this.configService.get<string>(
      'storage.publicBaseUrl',
      defaultPublicBaseUrl,
    ).replace(/\/+$/, '') || getMediaBaseUrl();

    this.minioClient = new Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async uploadImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files received for upload.');
    }

    await this.ensureBucketExists();

    const uploaded = await Promise.all(
      files.map(async (file) => {
        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException('Only image files are allowed.');
        }

        const extension = this.resolveExtension(file.originalname, file.mimetype);
        const objectName = `uploads/${new Date().getFullYear()}/${randomUUID()}.${extension}`;

        await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, {
          'Content-Type': file.mimetype,
        });

        return {
          key: objectName,
          url: `${this.publicBaseUrl}/${this.bucketName}/${objectName}`,
          mimeType: file.mimetype,
          size: file.size,
          originalName: file.originalname,
        };
      }),
    );

    return {
      files: uploaded,
    };
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }

      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Unable to access MinIO bucket.');
    }
  }

  private resolveExtension(fileName: string, mimeType: string) {
    const extensionFromName = fileName.split('.').pop()?.toLowerCase();

    if (extensionFromName && extensionFromName.length <= 5) {
      return extensionFromName;
    }

    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';
    if (mimeType === 'image/gif') return 'gif';
    return 'jpg';
  }
}
