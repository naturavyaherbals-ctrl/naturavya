import { addMinutes, addHours, addDays } from 'date-fns';

type FollowUp = {
  scheduled_at: string;
  channel: 'whatsapp';
  template: string;
};

export function buildFollowUps(status: string): FollowUp[] {
  const now = new Date();

  switch (status) {
    case 'not_picked':
      return [
        {
          scheduled_at: addMinutes(now, 30).toISOString(),
          channel: 'whatsapp',
          template: 'not_picked_1',
        },
        {
          scheduled_at: addHours(now, 4).toISOString(),
          channel: 'whatsapp',
          template: 'not_picked_2',
        },
      ];

    case 'follow_up':
      return [
        {
          scheduled_at: addHours(now, 24).toISOString(),
          channel: 'whatsapp',
          template: 'followup_1',
        },
      ];

    case 'callback':
      return [
        {
          scheduled_at: addHours(now, 2).toISOString(),
          channel: 'whatsapp',
          template: 'callback_1',
        },
      ];

    default:
      return [];
  }
}
