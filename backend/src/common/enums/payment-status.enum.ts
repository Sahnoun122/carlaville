export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PAID_ON_DELIVERY = 'paid-on-delivery',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially-paid',
  FAILED = 'failed',
}

// PaymentMethod removed from here, using central one in payment-method.enum.ts

