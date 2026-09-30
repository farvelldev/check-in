import { formatLocalDate } from './checkinCsv';
import type { Checkin, CheckinFilter } from '../types/checkin';

export function getCheckinsForDay(checkins: Checkin[], day: string): Checkin[] {
  return checkins.filter(
    (checkin) => formatLocalDate(new Date(checkin.created_at)) === day,
  );
}

export function filterCheckins(
  checkins: Checkin[],
  search: string,
  filter: CheckinFilter,
): Checkin[] {
  const normalizedSearch = search.toLowerCase();

  return checkins.filter((checkin) => {
    const searchableFields = [
      checkin.full_name,
      checkin.room_number,
      checkin.booking_reference,
      checkin.city,
      checkin.street,
      checkin.email,
      checkin.phone,
    ];
    const matchesSearch = searchableFields.some((value) =>
      value?.toLowerCase().includes(normalizedSearch),
    );
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !checkin.room_number) ||
      (filter === 'assigned' && Boolean(checkin.room_number));

    return matchesSearch && matchesFilter;
  });
}
