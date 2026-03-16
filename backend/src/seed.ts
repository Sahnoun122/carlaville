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

  // Create Admin User
  const adminDto: CreateUserDto = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@carlaville.com',
    password: 'password',
    phone: '1234567890',
    role: Role.ADMIN,
  };

  try {
    const adminUser = await usersService.create(adminDto);
    console.log('Admin user created:', adminUser);
  } catch (error) {
    if (error.message.includes('duplicate key error')) {
      console.log('Admin user already exists.');
    } else {
      console.error('Error creating admin user:', error);
    }
  }

  // Create Reservation Manager User
  const reservationManagerDto: CreateUserDto = {
    firstName: 'Reservation',
    lastName: 'Manager',
    email: 'reservation@carlaville.com',
    password: 'password',
    phone: '1234567890',
    role: Role.RESERVATION_MANAGER,
  };

  try {
    const reservationManagerUser = await usersService.create(
      reservationManagerDto,
    );
    console.log('Reservation Manager user created:', reservationManagerUser);
  } catch (error) {
    if (error.message.includes('duplicate key error')) {
      console.log('Reservation Manager user already exists.');
    } else {
      console.error('Error creating Reservation Manager user:', error);
    }
  }

  // Create Delivery Agent User
  const deliveryAgentDto: CreateUserDto = {
    firstName: 'Delivery',
    lastName: 'Agent',
    email: 'delivery@carlaville.com',
    password: 'password',
    phone: '1234567890',
    role: Role.DELIVERY_AGENT,
  };

  try {
    const deliveryAgentUser = await usersService.create(deliveryAgentDto);
    console.log('Delivery Agent user created:', deliveryAgentUser);
  } catch (error) {
    if (error.message.includes('duplicate key error')) {
      console.log('Delivery Agent user already exists.');
    } else {
      console.error('Error creating Delivery Agent user:', error);
    }
  }

  await app.close();
  console.log('Seeding finished.');
}

bootstrap();
