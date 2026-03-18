import { get, patch } from '@/lib/api';
import {
  ReservationDayControlSettings,
  UpdateReservationDayControlSettingsPayload,
} from '@/types';

const toSettings = (
  input: ReservationDayControlSettings & { _id?: string },
): ReservationDayControlSettings => ({
  ...input,
  id: input.id || input._id || '',
  extras: input.extras || [],
});

export const getReservationDayControlSettings = async () => {
  const response = await get<ReservationDayControlSettings & { _id?: string }>(
    '/admin/reservations/settings/day-control',
  );

  return toSettings(response);
};

export const updateReservationDayControlSettings = async (
  payload: UpdateReservationDayControlSettingsPayload,
) => {
  const response = await patch<ReservationDayControlSettings & { _id?: string }>(
    '/admin/reservations/settings/day-control',
    payload,
  );

  return toSettings(response);
};
