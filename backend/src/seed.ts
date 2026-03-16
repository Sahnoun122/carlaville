import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { RolesService } from './roles/roles.service';
import { Role } from './common/enums/role.enum';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agency, AgencyDocument } from './agencies/schemas/agency.schema';
import { AgencyStatus } from './common/enums/agency-status.enum';
import { Car, CarDocument } from './cars/schemas/car.schema';
import {
  AvailabilityStatus,
  CarCategory,
  FuelType,
  Transmission,
} from './common/enums/car.enum';
import {
  Reservation,
  ReservationDocument,
} from './reservations/schemas/reservation.schema';
import { ReservationStatus } from './common/enums/reservation-status.enum';
import { Delivery, DeliveryDocument } from './deliveries/schemas/delivery.schema';
import { DeliveryStatus, DeliveryType } from './common/enums/delivery.enum';
import { User, UserDocument } from './users/schemas/user.schema';

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const toDateString = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .split('T')[0];

const safeErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);
  const agencyModel = app.get<Model<AgencyDocument>>(getModelToken(Agency.name));
  const carModel = app.get<Model<CarDocument>>(getModelToken(Car.name));
  const reservationModel = app.get<Model<ReservationDocument>>(
    getModelToken(Reservation.name),
  );
  const deliveryModel = app.get<Model<DeliveryDocument>>(
    getModelToken(Delivery.name),
  );
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

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
  } catch (error: unknown) {
    if (safeErrorMessage(error).includes('duplicate key error')) {
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
  } catch (error: unknown) {
    if (safeErrorMessage(error).includes('duplicate key error')) {
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
  } catch (error: unknown) {
    if (safeErrorMessage(error).includes('duplicate key error')) {
      console.log('Delivery Agent user already exists.');
    } else {
      console.error('Error creating Delivery Agent user:', error);
    }
  }

  console.log('Seeding agencies...');
  const agencySeeds = [
    {
      name: 'Carlaville Casablanca',
      city: 'Casablanca',
      address: 'Maarif, Casablanca',
      phone: '+212600000001',
      email: 'agency.casablanca@carlaville.com',
      contactPerson: 'Yassine Amrani',
      status: AgencyStatus.APPROVED,
      active: true,
    },
    {
      name: 'Carlaville Marrakech',
      city: 'Marrakech',
      address: 'Guéliz, Marrakech',
      phone: '+212600000002',
      email: 'agency.marrakech@carlaville.com',
      contactPerson: 'Sara El Idrissi',
      status: AgencyStatus.APPROVED,
      active: true,
    },
  ];

  for (const seedAgency of agencySeeds) {
    const existingAgency = await agencyModel
      .findOne({ email: seedAgency.email })
      .exec();

    if (existingAgency) {
      console.log(`Agency already exists: ${seedAgency.name}`);
      continue;
    }

    await agencyModel.create(seedAgency);
    console.log(`Agency created: ${seedAgency.name}`);
  }

  const agencies = await agencyModel.find().exec();
  const primaryAgency = agencies[0];
  const secondaryAgency = agencies[1] || agencies[0];

  if (!primaryAgency) {
    throw new Error('Unable to seed reservations: no agency found.');
  }

  console.log('Seeding cars...');
  const carSeeds = [
    {
      agencyId: primaryAgency._id,
      brand: 'Dacia',
      model: 'Sandero',
      year: 2023,
      category: CarCategory.ECONOMY,
      transmission: Transmission.MANUAL,
      fuelType: FuelType.GASOLINE,
      seats: 5,
      luggage: 2,
      dailyPrice: 320,
      depositAmount: 1500,
      deliveryFee: 120,
      city: 'Casablanca',
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      images: [],
      active: true,
    },
    {
      agencyId: primaryAgency._id,
      brand: 'Renault',
      model: 'Clio',
      year: 2024,
      category: CarCategory.COMPACT,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seats: 5,
      luggage: 3,
      dailyPrice: 420,
      depositAmount: 2000,
      deliveryFee: 120,
      city: 'Casablanca',
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      images: [],
      active: true,
    },
    {
      agencyId: secondaryAgency._id,
      brand: 'Hyundai',
      model: 'Tucson',
      year: 2024,
      category: CarCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      seats: 5,
      luggage: 4,
      dailyPrice: 760,
      depositAmount: 3500,
      deliveryFee: 180,
      city: secondaryAgency.city,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      images: [],
      active: true,
    },
  ];

  for (const seedCar of carSeeds) {
    const existingCar = await carModel
      .findOne({
        brand: seedCar.brand,
        model: seedCar.model,
        year: seedCar.year,
        city: seedCar.city,
      })
      .exec();

    if (existingCar) {
      console.log(`Car already exists: ${seedCar.brand} ${seedCar.model}`);
      continue;
    }

    await carModel.create(seedCar as unknown as Record<string, unknown>);
    console.log(`Car created: ${seedCar.brand} ${seedCar.model}`);
  }

  const cars = await carModel.find({ active: { $ne: false } }).limit(3).exec();

  if (!cars.length) {
    throw new Error('Unable to seed reservations: no car found.');
  }

  console.log('Seeding reservations...');

  const today = new Date();
  const reservationSeeds = [
    {
      bookingReference: 'CRVL-SEED01',
      customerName: 'Karim Benali',
      customerEmail: 'karim.benali@example.com',
      customerPhone: '+212611111111',
      agencyId: primaryAgency._id,
      carId: cars[0]._id,
      pickupLocation: 'Casablanca Airport',
      returnLocation: 'Casablanca Airport',
      pickupDate: new Date(toDateString(addDays(today, 2))),
      returnDate: new Date(toDateString(addDays(today, 5))),
      pickupTime: '10:00',
      returnTime: '10:00',
      rentalDays: 3,
      selectedExtras: ['gps'],
      pricingBreakdown: {
        baseAmount: 960,
        extrasTotal: 60,
        totalAmount: 1140,
      },
      status: ReservationStatus.PENDING,
      internalNotes: 'Pending approval from admin.',
    },
    {
      bookingReference: 'CRVL-SEED02',
      customerName: 'Nadia El Fassi',
      customerEmail: 'nadia.elfassi@example.com',
      customerPhone: '+212622222222',
      agencyId: primaryAgency._id,
      carId: cars[1]?._id || cars[0]._id,
      pickupLocation: 'Casa Port',
      returnLocation: 'Casa Port',
      pickupDate: new Date(toDateString(addDays(today, 4))),
      returnDate: new Date(toDateString(addDays(today, 8))),
      pickupTime: '09:30',
      returnTime: '09:30',
      rentalDays: 4,
      selectedExtras: ['child-seat', 'gps'],
      pricingBreakdown: {
        baseAmount: 1680,
        extrasTotal: 180,
        totalAmount: 1980,
      },
      status: ReservationStatus.CONFIRMED,
      internalNotes: 'Confirmed by reservation manager.',
    },
    {
      bookingReference: 'CRVL-SEED03',
      customerName: 'Amine Tazi',
      customerEmail: 'amine.tazi@example.com',
      customerPhone: '+212633333333',
      agencyId: secondaryAgency._id,
      carId: cars[2]?._id || cars[0]._id,
      pickupLocation: 'Marrakech Train Station',
      returnLocation: 'Marrakech Train Station',
      pickupDate: new Date(toDateString(addDays(today, 6))),
      returnDate: new Date(toDateString(addDays(today, 7))),
      pickupTime: '14:00',
      returnTime: '14:00',
      rentalDays: 1,
      selectedExtras: [],
      pricingBreakdown: {
        baseAmount: 760,
        extrasTotal: 0,
        totalAmount: 760,
      },
      status: ReservationStatus.REJECTED,
      internalNotes: 'Rejected due to customer document issue.',
    },
  ];

  for (const seedReservation of reservationSeeds) {
    const existingReservation = await reservationModel
      .findOne({ bookingReference: seedReservation.bookingReference })
      .exec();

    if (existingReservation) {
      console.log(
        `Reservation already exists: ${seedReservation.bookingReference}`,
      );
      continue;
    }

    await reservationModel.create(
      seedReservation as unknown as Record<string, unknown>,
    );
    console.log(`Reservation created: ${seedReservation.bookingReference}`);
  }

  console.log('Seeding deliveries...');

  const deliveryAgent = await userModel
    .findOne({ email: 'delivery@carlaville.com' })
    .exec();

  if (!deliveryAgent) {
    throw new Error('Unable to seed deliveries: delivery agent not found.');
  }

  const seededReservations = await reservationModel
    .find({ bookingReference: { $in: ['CRVL-SEED01', 'CRVL-SEED02', 'CRVL-SEED03'] } })
    .exec();

  const reservationMap = new Map(
    seededReservations.map((reservation) => [reservation.bookingReference, reservation]),
  );

  const seedDeliveries = [
    {
      bookingReference: 'CRVL-SEED02',
      type: DeliveryType.PICKUP,
      scheduledDate: new Date(toDateString(addDays(today, 4))),
      scheduledTime: '09:00',
      status: DeliveryStatus.ASSIGNED,
      notes: 'Pickup assignment for confirmed reservation.',
    },
    {
      bookingReference: 'CRVL-SEED01',
      type: DeliveryType.PICKUP,
      scheduledDate: new Date(toDateString(addDays(today, 2))),
      scheduledTime: '09:30',
      status: DeliveryStatus.PENDING,
      notes: 'Pending pickup assignment review.',
    },
  ];

  for (const seedDelivery of seedDeliveries) {
    const reservation = reservationMap.get(seedDelivery.bookingReference);

    if (!reservation) {
      console.log(
        `Skipping delivery seed, reservation not found: ${seedDelivery.bookingReference}`,
      );
      continue;
    }

    const existingDelivery = await deliveryModel
      .findOne({
        reservationId: reservation._id,
        type: seedDelivery.type,
      } as unknown as Record<string, unknown>)
      .exec();

    if (existingDelivery) {
      console.log(
        `Delivery already exists: ${seedDelivery.bookingReference} (${seedDelivery.type})`,
      );
      continue;
    }

    await deliveryModel.create({
      reservationId: reservation._id,
      assignedAgentId: deliveryAgent._id,
      type: seedDelivery.type,
      scheduledDate: seedDelivery.scheduledDate,
      scheduledTime: seedDelivery.scheduledTime,
      status: seedDelivery.status,
      notes: seedDelivery.notes,
    } as unknown as Record<string, unknown>);

    reservation.assignedDeliveryAgentId = deliveryAgent._id as never;
    if (seedDelivery.type === DeliveryType.PICKUP) {
      reservation.status = ReservationStatus.READY_FOR_DELIVERY;
    }
    await reservation.save();

    console.log(
      `Delivery created: ${seedDelivery.bookingReference} (${seedDelivery.type})`,
    );
  }

  await app.close();
  console.log('Seeding finished.');
}

bootstrap();
