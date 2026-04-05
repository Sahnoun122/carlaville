export interface Agency {
  id: string;
  _id?: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  commissionRate?: number;
}
