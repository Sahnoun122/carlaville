import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { RolesService } from './roles/roles.service';
import { Role } from './common/enums/role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);

  console.log('Seeding database...');

  // Seed roles
  console.log('Seeding roles...');
  for (const role of Object.values(Role)) {
    const existingRole = await rolesService.findByName(role);
    if (!existingRole) {
      await rolesService.create(role);
      console.log(`Role '${role}' created.`);
    }
  }
  console.log('Roles seeding finished.');

  await app.close();
  console.log('Seeding finished.');
}

bootstrap();
