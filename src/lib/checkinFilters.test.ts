import { describe, expect, it } from 'vitest';
import { formatLocalDate } from './checkinCsv';
import { filterCheckins, getCheckinsForDay } from './checkinFilters';
import type { Checkin } from '../types/checkin';

const createCheckin = (overrides: Partial<Checkin> = {}): Checkin => ({
  id: 'checkin-1',
  created_at: new Date(2025, 5, 14, 12).toISOString(),
  room_number: '',
  booking_reference: '',
  full_name: 'Ana Ruiz',
  street: 'Calle Mayor',
  street_number: '12',
  postal_code: '28001',
  city: 'Madrid',
  country: 'España',
  phone: '600123456',
  email: 'ana@example.com',
  ...overrides,
});

describe('getCheckinsForDay', () => {
  it('selects records by local calendar day', () => {
    const lateCheckin = createCheckin({
      id: 'late',
      created_at: new Date(2025, 5, 14, 23, 50).toISOString(),
    });
    const nextDayCheckin = createCheckin({
      id: 'next-day',
      created_at: new Date(2025, 5, 15, 0, 10).toISOString(),
    });
    const selectedDay = formatLocalDate(new Date(lateCheckin.created_at));

    expect(getCheckinsForDay([lateCheckin, nextDayCheckin], selectedDay)).toEqual([
      lateCheckin,
    ]);
  });
});

describe('filterCheckins', () => {
  it('searches case-insensitively across the supported fields', () => {
    const guest = createCheckin();
    const otherGuest = createCheckin({
      id: 'checkin-2',
      full_name: 'Luis Pérez',
      street: 'Avenida Central',
      email: 'luis@example.com',
    });

    expect(filterCheckins([guest, otherGuest], 'ANA@EXAMPLE', 'all')).toEqual([guest]);
    expect(filterCheckins([guest, otherGuest], 'MAYOR', 'all')).toEqual([guest]);
  });

  it('filters pending and assigned rooms independently', () => {
    const pending = createCheckin({ id: 'pending', room_number: '' });
    const assigned = createCheckin({ id: 'assigned', room_number: '204' });

    expect(filterCheckins([pending, assigned], '', 'pending')).toEqual([pending]);
    expect(filterCheckins([pending, assigned], '', 'assigned')).toEqual([assigned]);
    expect(filterCheckins([pending, assigned], '', 'all')).toEqual([pending, assigned]);
  });

  it('combines search terms with the selected room filter', () => {
    const pending = createCheckin({ id: 'pending', room_number: '' });
    const assigned = createCheckin({ id: 'assigned', room_number: '204' });

    expect(filterCheckins([pending, assigned], 'ana', 'assigned')).toEqual([assigned]);
    expect(filterCheckins([pending, assigned], 'missing', 'all')).toEqual([]);
  });
});
