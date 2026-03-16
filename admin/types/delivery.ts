export enum DeliveryType {
  PICKUP = 'pickup',
  RETURN = 'return',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ON_THE_WAY = 'on-the-way',
  ARRIVED = 'arrived',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Delivery {
  id?: string;
  _id?: string;
  reservationId:
    | string
    | {
        _id?: string;
        bookingReference?: string;
        customerName?: string;
        pickupLocation?: string;
        returnLocation?: string;
        status?: string;
      };
  assignedAgentId:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
      };
  type: DeliveryType;
  scheduledDate: string;
  scheduledTime: string;
  actualDateTime?: string;
  status: DeliveryStatus;
  proofPhotos?: string[];
  gpsLocation?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryListResponse {
  deliveries: Delivery[];
  count: number;
}
