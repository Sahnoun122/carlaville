import { del, get, patch, post } from '@/lib/api';

export interface Revenue {
  _id?: string;
  id?: string;
  reservationId: string;
  bookingReference: string;
  amount: number;
  baseAmount: number;
  extrasTotal: number;
  insuranceFee: number;
  deliveryFee: number;
  taxAmount: number;
  commissionAmount: number;
  netAmount: number;
  recognizedDate: string | Date;
  paidAt?: string | Date;
  paymentMethod?: string;
  paymentStatus: string;
  agencyId: any;
  carId: any;
  source: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RevenueFormValues {
  amount: number;
  date: string;
  agencyId: string;
  carId?: string;
  category: string;
  description?: string;
}

export const getRevenues = async (params: { agencyId?: string; carId?: string }) => {
  const response = await get<Revenue[]>('/revenue', { params });
  return {
    revenues: Array.isArray(response) ? response.map((rev) => ({
      ...rev,
      id: rev.id || rev._id || '',
    })) : [],
    count: Array.isArray(response) ? response.length : 0,
  };
};

export const createRevenue = async (data: RevenueFormValues) => {
  return post<Revenue>('/revenue', data);
};

export const updateRevenue = async (data: RevenueFormValues & { id: string }) => {
  const { id, ...payload } = data;
  return patch<Revenue>(`/revenue/${id}`, payload);
};

export const deleteRevenue = async (id: string) => {
  return del(`/revenue/${id}`);
};

export interface RankingCar {
  _id: string;
  name: string;
  registrationNumber?: string;
  totalRevenue: number;
}

export interface RankingAgency {
  _id: string;
  name: string;
  city: string;
  totalRevenue: number;
}

export const getRevenueRankings = async () => {
  return get<{ topCars: RankingCar[]; topAgencies: RankingAgency[] }>('/revenue/rankings');
};

export interface BreakdownVehicle {
  carId: string;
  revenue: number;
  brand: string;
  model: string;
  registrationNumber?: string;
}

export interface TurnoverBreakdown {
  _id: string;
  agencyName: string;
  agencyCity: string;
  totalAgencyRevenue: number;
  totalAgencyNet: number;
  totalAgencyCommission: number;
  vehicles: BreakdownVehicle[];
}

export const getTurnoverBreakdown = async (agencyId?: string) => {
  return get<TurnoverBreakdown[]>('/revenue/turnover', { params: { agencyId } });
};

export interface TimeframeStat {
  total: number;
  net: number;
  count: number;
}

export interface TimeframeAnalytics {
  today: TimeframeStat;
  yesterday: TimeframeStat;
  thisWeek: TimeframeStat;
  thisMonth: TimeframeStat;
  thisYear: TimeframeStat;
}

export const getTimeframeAnalytics = async (agencyId?: string) => {
  console.log('[DEBUG] Calling Analytics for Agency:', agencyId || 'GLOBAL');
  const response = await get<TimeframeAnalytics>('/revenue/analytics/timeframe', { params: { agencyId } });
  console.log('[DEBUG] Analytics Response:', response);
  return response;
};
