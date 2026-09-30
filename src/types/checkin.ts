export interface Checkin {
  id: string;
  created_at: string;
  room_number: string;
  booking_reference: string;
  full_name: string;
  street: string;
  street_number: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

export type CheckinEditForm = Omit<Checkin, 'id' | 'created_at'>;
export type CheckinFilter = 'all' | 'pending' | 'assigned';

export interface AdminToast {
  id: number;
  message: string;
  type: 'success' | 'error';
}