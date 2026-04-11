import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { customAlphabet } from 'nanoid';
import {
  ReservationDayControl,
  ReservationDayControlDocument,
  ReservationExtraBillingType,
  ReservationExtraOption,
  ReservationExtraScope,
} from './schemas/reservation-day-control.schema';
import { UpdateDayControlSettingsDto } from './dto/update-day-control-settings.dto';
import { Car, CarDocument } from '../cars/schemas/car.schema';
import { RevenueService } from '../revenue/revenue.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { getMediaBaseUrl, normalizeMediaUrls } from '../common/utils/media-url';
import { AvailabilityStatus } from '../common/enums/car.enum';

const toPlainObject = <T>(value: T): T => {
  if (value && typeof value === 'object' && 'toObject' in (value as object)) {
    const maybeDocument = value as { toObject?: () => T };
    if (typeof maybeDocument.toObject === 'function') {
      return maybeDocument.toObject();
    }
  }

  return value;
};

const normalizeReservationForDisplay = <T extends { carId?: unknown }>(reservation: T) => {
  const reservationObject = toPlainObject(reservation) as T;
  const car = reservationObject.carId;

  if (!car || typeof car !== 'object') {
    return reservationObject;
  }

  const carRecord = toPlainObject(car as { images?: string[]; imageUrl?: string });

  return {
    ...reservationObject,
    carId: {
      ...(carRecord as Record<string, unknown>),
      images: normalizeMediaUrls(carRecord.images, getMediaBaseUrl()),
      imageUrl: carRecord.imageUrl
        ? normalizeMediaUrls([carRecord.imageUrl], getMediaBaseUrl())[0]
        : carRecord.imageUrl,
    },
  };
};

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(ReservationDayControl.name)
    private reservationDayControlModel: Model<ReservationDayControlDocument>,
    @InjectModel(Car.name)
    private carModel: Model<CarDocument>,
    private readonly revenueService: RevenueService,
  ) {}

  private readonly nanoid = customAlphabet(
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    8,
  );

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const settings = await this.getDayControlSettings();
    const car = await this.carModel
      .findById(dto.carId)
      .select('minRentalDays dailyPrice agencyId')
      .exec();

    if (!car) {
      throw new NotFoundException(`Car with id ${dto.carId} not found`);
    }

    if (!car.agencyId) {
      throw new BadRequestException(
        `Car with id ${dto.carId} is not associated with any agency. Please contact support.`,
      );
    }

    const effectiveMinRentalDays =
      typeof car.minRentalDays === 'number' && car.minRentalDays > 0
        ? car.minRentalDays
        : settings.minRentalDays;

    const bookingReference = `CRVL-${this.nanoid()}`;
    const rentalDays = this.calculateRentalDays(dto.pickupDate, dto.returnDate);

    this.validateDayControlRules(
      dto,
      rentalDays,
      settings,
      effectiveMinRentalDays,
    );

    const applicableExtras = this.getApplicableExtras(
      settings,
      dto.carId,
    );
    const selectedExtras = this.normalizeSelectedExtras(
      dto.selectedExtras,
      applicableExtras,
    );
    const extrasTotal = this.calculateExtrasTotal(selectedExtras, applicableExtras, rentalDays);
    const dailyPrice = Number(car.dailyPrice) || 0;
    const basePrice = dailyPrice * rentalDays;
    const total = basePrice + extrasTotal;

    const reservation = new this.reservationModel({
      ...dto,
      agencyId: car.agencyId, // Enforce from car record
      bookingReference,
      rentalDays,
      selectedExtras,
      pricingBreakdown: {
        ...(dto.pricingBreakdown || {}),
        daily: dailyPrice,
        days: rentalDays,
        basePrice,
        extrasTotal,
        extrasPrice: extrasTotal,
        total,
      },
      status: ReservationStatus.PENDING,
    });
    return reservation.save();
  }

  async getDayControlSettings(): Promise<ReservationDayControlDocument> {
    const existing = await this.reservationDayControlModel.findOne().exec();
    if (existing) {
      return existing;
    }

    const defaultSettings = new this.reservationDayControlModel({
      minRentalDays: 1,
      maxRentalDays: 30,
      maxAdvanceBookingDays: 365,
      allowSameDayBooking: true,
      blockedWeekdays: [],
      extras: [],
    });

    return defaultSettings.save();
  }

  async updateDayControlSettings(
    dto: UpdateDayControlSettingsDto,
  ): Promise<ReservationDayControlDocument> {
    const settings = await this.getDayControlSettings();

    if (
      typeof dto.minRentalDays === 'number' &&
      typeof dto.maxRentalDays === 'number' &&
      dto.minRentalDays > dto.maxRentalDays
    ) {
      throw new BadRequestException(
        'minRentalDays cannot be greater than maxRentalDays.',
      );
    }

    if (
      typeof dto.minRentalDays === 'number' &&
      dto.minRentalDays > settings.maxRentalDays
    ) {
      throw new BadRequestException(
        'minRentalDays cannot be greater than current maxRentalDays.',
      );
    }

    if (
      typeof dto.maxRentalDays === 'number' &&
      dto.maxRentalDays < settings.minRentalDays
    ) {
      throw new BadRequestException(
        'maxRentalDays cannot be less than current minRentalDays.',
      );
    }

    const { blockedWeekdays, extras, ...updatableFields } = dto;

    if (Array.isArray(blockedWeekdays)) {
      const hasInvalidWeekday = blockedWeekdays.some(
        (value) => !Number.isInteger(value) || value < 0 || value > 6,
      );
      if (hasInvalidWeekday) {
        throw new BadRequestException(
          'blockedWeekdays must contain values between 0 and 6.',
        );
      }

      settings.blockedWeekdays = Array.from(
        new Set(blockedWeekdays),
      ).sort((a, b) => a - b);
    }

    if (Array.isArray(extras)) {
      const seenIds = new Set<string>();
      const normalizedExtras = extras.map((extra) => {
        const normalizedId = extra.id.trim().toLowerCase();

        if (seenIds.has(normalizedId)) {
          throw new BadRequestException(
            `Duplicate extra id detected: ${normalizedId}`,
          );
        }

        seenIds.add(normalizedId);

        const normalizedCarIds = Array.isArray(extra.carIds)
          ? Array.from(new Set(extra.carIds.map((carId) => carId.trim())))
          : [];

        if (
          extra.scope === ReservationExtraScope.SELECTED_CARS &&
          normalizedCarIds.length === 0
        ) {
          throw new BadRequestException(
            `Extra "${extra.label}" must target at least one car when scope is SELECTED_CARS.`,
          );
        }

        return {
          id: normalizedId,
          label: extra.label.trim(),
          price: Number(extra.price) || 0,
          billingType: extra.billingType,
          scope: extra.scope,
          carIds: normalizedCarIds,
          active: extra.active ?? true,
        };
      });

      settings.extras = normalizedExtras;
    }

    const updatePayload: any = {};
    for (const key of Object.keys(updatableFields)) {
      if (updatableFields[key] !== undefined) {
        updatePayload[key] = updatableFields[key];
      }
    }

    Object.assign(settings, updatePayload);
    return settings.save();
  }

  async findAll(filterDto: FilterReservationDto, page: number, limit: number) {
    const query: any = {};
    if (filterDto.status) query.status = filterDto.status;
    if (filterDto.agencyId) query.agencyId = filterDto.agencyId;
    if (filterDto.carId) query.carId = filterDto.carId;
    if (filterDto.bookingReference)
      query.bookingReference = filterDto.bookingReference;
    if (filterDto.date) {
      const searchDate = new Date(filterDto.date);
      query.pickupDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    }
    if (filterDto.customerEmail) query.customerEmail = filterDto.customerEmail;

    const reservations = await this.reservationModel
      .find(query)
      .populate('agencyId', 'name')
      .populate('carId', 'brand model year transmission fuelType seats city images imageUrl availabilityStatus')
      .populate('assignedDeliveryAgentId', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const count = await this.reservationModel.countDocuments(query);
    return {
      reservations: reservations.map((reservation) => normalizeReservationForDisplay(reservation)),
      count,
    };
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('agencyId')
      .populate('carId')
      .populate('assignedDeliveryAgentId')
      .exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }
    return normalizeReservationForDisplay(reservation) as Reservation;
  }

  async confirm(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.CONFIRMED, [
      ReservationStatus.PENDING,
    ]);
  }

  async reject(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.REJECTED, [
      ReservationStatus.PENDING,
    ]);
  }

  async markPending(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.PENDING, [
      ReservationStatus.CONFIRMED,
      ReservationStatus.REJECTED,
    ]);
  }

  async assignDeliveryAgent(id: string, agentId: string): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Cannot assign agent to a non-confirmed reservation.',
      );
    }
    const updatedReservation = await this.reservationModel.findByIdAndUpdate(
      id,
      { assignedDeliveryAgentId: agentId },
      { new: true },
    );
    if (!updatedReservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }
    return updatedReservation;
  }

  async markReadyForDelivery(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.READY_FOR_DELIVERY, [
      ReservationStatus.CONFIRMED,
    ], {
      requireOperationalVehicle: true,
    });
  }

  async markInDelivery(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.IN_DELIVERY, [
      ReservationStatus.READY_FOR_DELIVERY,
    ], {
      requireOperationalVehicle: true,
    });
  }

  async markDelivered(id: string): Promise<Reservation> {
    const updated = await this.updateStatus(id, ReservationStatus.DELIVERED, [
      ReservationStatus.IN_DELIVERY,
    ], {
      requireOperationalVehicle: true,
    });

    if (updated.paymentStatus === PaymentStatus.PAID_ON_DELIVERY) {
       await this.revenueService.recognizeFromReservation(updated as any);
    }

    return updated;
  }

  async markActiveRental(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.ACTIVE_RENTAL, [
      ReservationStatus.DELIVERED,
    ], {
      requireOperationalVehicle: true,
      setCarAvailability: AvailabilityStatus.RENTED,
    });
  }

  async markReturnScheduled(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.RETURN_SCHEDULED, [
      ReservationStatus.ACTIVE_RENTAL,
    ]);
  }

  async markReturned(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.RETURNED, [
      ReservationStatus.ACTIVE_RENTAL,
      ReservationStatus.RETURN_SCHEDULED,
    ], {
      setCarAvailability: AvailabilityStatus.AVAILABLE,
    });
  }

  async complete(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.COMPLETED, [
      ReservationStatus.RETURNED,
    ], {
      setCarAvailability: AvailabilityStatus.AVAILABLE,
    });
  }

  async addInternalNote(id: string, note: string): Promise<Reservation> {
    const reservation = await this.findById(id);
    const newNote = reservation.internalNotes
      ? `${reservation.internalNotes}\n${note}`
      : note;
    const updatedReservation = await this.reservationModel.findByIdAndUpdate(
      id,
      { internalNotes: newNote },
      { new: true },
    );
    if (!updatedReservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }
    return updatedReservation;
  }

  private async updateStatus(
    id: string,
    newStatus: ReservationStatus,
    allowedInitialStatuses: ReservationStatus[],
    options?: {
      requireOperationalVehicle?: boolean;
      setCarAvailability?: AvailabilityStatus;
    },
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (!allowedInitialStatuses.includes(reservation.status)) {
      throw new ConflictException(
        `Cannot transition from ${reservation.status} to ${newStatus}`,
      );
    }

    let carDocument: CarDocument | null = null;
    const needsCarLookup =
      options?.requireOperationalVehicle ||
      options?.setCarAvailability !== undefined;

    if (needsCarLookup) {
      const carId = this.resolveReservationCarId(reservation);

      if (!carId) {
        throw new BadRequestException(
          'Cannot update reservation status without an assigned vehicle.',
        );
      }

      carDocument = await this.carModel
        .findById(carId)
        .select('availabilityStatus')
        .exec();

      if (!carDocument) {
        throw new NotFoundException(`Car with id ${carId} not found`);
      }
    }

    if (
      options?.requireOperationalVehicle &&
      carDocument &&
      [AvailabilityStatus.MAINTENANCE, AvailabilityStatus.UNAVAILABLE].includes(
        carDocument.availabilityStatus as AvailabilityStatus,
      )
    ) {
      throw new BadRequestException(
        'Le vehicule est indisponible. Mettez son etat a disponible avant de poursuivre cette etape.',
      );
    }

    const updated = await this.reservationModel.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    if (carDocument && options?.setCarAvailability !== undefined) {
      carDocument.availabilityStatus = options.setCarAvailability;
      await carDocument.save();
    }

    return updated;
  }

  private resolveReservationCarId(reservation: Reservation): string {
    const carRef = (reservation as { carId?: unknown }).carId;

    if (typeof carRef === 'string') {
      return carRef;
    }

    if (!carRef || typeof carRef !== 'object') {
      return '';
    }

    const carRecord = carRef as { id?: unknown; _id?: unknown };
    const rawId = carRecord._id ?? carRecord.id;

    if (typeof rawId === 'string') {
      return rawId;
    }

    if (rawId && typeof rawId === 'object' && 'toString' in rawId) {
      return rawId.toString();
    }

    return '';
  }

  async confirmPayment(id: string, dto: ConfirmPaymentDto): Promise<Reservation> {
    console.log('--- BACKEND DEBUG: confirmPayment ---');
    console.log('ID:', id);
    console.log('DTO:', JSON.stringify(dto, null, 2));
    
    const reservation = await this.findById(id);
    console.log('Current Status:', reservation.status);
    // Only allow payment on relevant statuses
    const allowedStatuses = [
      ReservationStatus.CONFIRMED,
      ReservationStatus.READY_FOR_DELIVERY,
      ReservationStatus.IN_DELIVERY,
      ReservationStatus.DELIVERED,
      ReservationStatus.ACTIVE_RENTAL,
      ReservationStatus.RETURN_SCHEDULED,
      ReservationStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(reservation.status)) {
      throw new BadRequestException(`Cannot confirm payment for reservation in ${reservation.status} status`);
    }

    const updated = await this.reservationModel.findByIdAndUpdate(
      id,
      {
        paymentStatus: PaymentStatus.PAID_ON_DELIVERY,
        paymentMethod: dto.paymentMethod,
        amountCollected: dto.amountCollected,
        paidAt: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    // Immediately trigger revenue recognition upon payment confirmation
    await this.revenueService.recognizeFromReservation(updated as any);

    return updated;
  }

  private calculateRentalDays(pickupDate: string, returnDate: string): number {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid pickup or return date.');
    }

    if (diffTime < 0) {
      throw new BadRequestException(
        'Return date must be greater than or equal to pickup date.',
      );
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  }

  private validateDayControlRules(
    dto: CreateReservationDto,
    rentalDays: number,
    settings: ReservationDayControl,
    effectiveMinRentalDays: number,
  ) {
    const effectiveMaxRentalDays = Math.max(
      settings.maxRentalDays,
      effectiveMinRentalDays,
    );

    if (rentalDays < effectiveMinRentalDays) {
      throw new BadRequestException(
        `Minimum reservation duration is ${effectiveMinRentalDays} day(s).`,
      );
    }

    if (rentalDays > effectiveMaxRentalDays) {
      throw new BadRequestException(
        `Maximum reservation duration is ${effectiveMaxRentalDays} day(s).`,
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pickup = new Date(dto.pickupDate);
    const returnDate = new Date(dto.returnDate);

    const pickupDay = new Date(
      pickup.getFullYear(),
      pickup.getMonth(),
      pickup.getDate(),
    );

    if (pickupDay.getTime() < today.getTime()) {
      throw new BadRequestException(
        'Pickup date cannot be in the past.',
      );
    }

    const advanceDays = Math.floor(
      (pickupDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!settings.allowSameDayBooking && advanceDays === 0) {
      throw new BadRequestException(
        'Same-day reservations are not allowed.',
      );
    }

    if (advanceDays > settings.maxAdvanceBookingDays) {
      throw new BadRequestException(
        `Reservations can be created up to ${settings.maxAdvanceBookingDays} day(s) in advance.`,
      );
    }

    if (settings.blockedWeekdays.includes(pickup.getDay())) {
      throw new BadRequestException(
        'Pickup day is blocked by reservation policy.',
      );
    }

    if (settings.blockedWeekdays.includes(returnDate.getDay())) {
      throw new BadRequestException(
        'Return day is blocked by reservation policy.',
      );
    }
  }

  private getApplicableExtras(
    settings: ReservationDayControl,
    carId: string,
  ): ReservationExtraOption[] {
    return (settings.extras || []).filter((extra) => {
      if (!extra.active) {
        return false;
      }

      if (extra.scope === ReservationExtraScope.ALL_CARS) {
        return true;
      }

      return (extra.carIds || []).includes(carId);
    });
  }

  private normalizeSelectedExtras(
    selectedExtras: string[] | undefined,
    applicableExtras: ReservationExtraOption[],
  ): string[] {
    if (!Array.isArray(selectedExtras) || selectedExtras.length === 0) {
      return [];
    }

    const byId = new Map(
      applicableExtras.map((extra) => [extra.id.toLowerCase(), extra.id]),
    );
    const byLabel = new Map(
      applicableExtras.map((extra) => [extra.label.toLowerCase(), extra.id]),
    );

    const normalizedIds = new Set<string>();

    for (const rawValue of selectedExtras) {
      const token = rawValue.trim().toLowerCase();

      if (!token) {
        continue;
      }

      const matchedId = byId.get(token) || byLabel.get(token);
      if (matchedId) {
        normalizedIds.add(matchedId);
      }
    }

    return Array.from(normalizedIds);
  }

  private calculateExtrasTotal(
    selectedExtraIds: string[],
    applicableExtras: ReservationExtraOption[],
    rentalDays: number,
  ): number {
    const selectedSet = new Set(selectedExtraIds);

    return applicableExtras.reduce((sum, extra) => {
      if (!selectedSet.has(extra.id)) {
        return sum;
      }

      const unitPrice = Number(extra.price) || 0;
      if (extra.billingType === ReservationExtraBillingType.PER_RENTAL) {
        return sum + unitPrice;
      }

      return sum + unitPrice * rentalDays;
    }, 0);
  }
}
