import { CallRecord } from './types';
import { normalizePhoneNumber, formatDuration } from './normalizer';

/**
 * Realistic sample call history dataset for instant user demonstration and testing.
 */
export function generateSampleCallHistory(): CallRecord[] {
  const baseTime = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  interface RawSample {
    name: string;
    phone: string;
    type: 'Incoming' | 'Outgoing' | 'Missed' | 'Rejected' | 'Declined' | 'Blocked';
    duration: number;
    daysAgo: number;
    hour: number;
    minute: number;
  }

  const rawList: RawSample[] = [
    // Today
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Incoming', duration: 151, daysAgo: 0, hour: 10, minute: 32 },
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Outgoing', duration: 342, daysAgo: 0, hour: 11, minute: 15 },
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Incoming', duration: 245, daysAgo: 0, hour: 12, minute: 40 },
    { name: 'Unknown Caller', phone: '+91 98999 11223', type: 'Missed', duration: 0, daysAgo: 0, hour: 13, minute: 10 },
    { name: 'Mom', phone: '+91 94000 12345', type: 'Incoming', duration: 620, daysAgo: 0, hour: 14, minute: 5 },
    { name: 'Telemarketing Spam', phone: '+91 80000 99999', type: 'Blocked', duration: 0, daysAgo: 0, hour: 15, minute: 22 },
    { name: 'Vikram Malhotra', phone: '+91 97234 56789', type: 'Outgoing', duration: 85, daysAgo: 0, hour: 16, minute: 45 },
    { name: 'Aarav Gupta', phone: '+91 99887 76655', type: 'Incoming', duration: 430, daysAgo: 0, hour: 18, minute: 12 },

    // Yesterday
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Outgoing', duration: 520, daysAgo: 1, hour: 9, minute: 20 },
    { name: 'Office Support', phone: '+91 11 4567 8900', type: 'Outgoing', duration: 180, daysAgo: 1, hour: 11, minute: 5 },
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Missed', duration: 0, daysAgo: 1, hour: 13, minute: 30 },
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Incoming', duration: 412, daysAgo: 1, hour: 13, minute: 45 },
    { name: 'Neha Verma', phone: '+91 91234 56780', type: 'Incoming', duration: 95, daysAgo: 1, hour: 15, minute: 50 },
    { name: 'Mom', phone: '+91 94000 12345', type: 'Outgoing', duration: 780, daysAgo: 1, hour: 20, minute: 10 },

    // 2 Days ago
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Incoming', duration: 90, daysAgo: 2, hour: 10, minute: 0 },
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Rejected', duration: 0, daysAgo: 2, hour: 11, minute: 30 },
    { name: 'Aarav Gupta', phone: '+91 99887 76655', type: 'Outgoing', duration: 1240, daysAgo: 2, hour: 14, minute: 15 },
    { name: 'Vikram Malhotra', phone: '+91 97234 56789', type: 'Incoming', duration: 310, daysAgo: 2, hour: 16, minute: 25 },
    { name: 'Telemarketing Spam', phone: '+91 80000 99999', type: 'Rejected', duration: 0, daysAgo: 2, hour: 17, minute: 5 },

    // 3-4 Days ago
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Outgoing', duration: 615, daysAgo: 3, hour: 10, minute: 15 },
    { name: 'Mom', phone: '+91 94000 12345', type: 'Incoming', duration: 540, daysAgo: 3, hour: 12, minute: 30 },
    { name: 'Courier Delivery', phone: '+91 96543 21098', type: 'Incoming', duration: 45, daysAgo: 3, hour: 14, minute: 0 },
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Outgoing', duration: 320, daysAgo: 4, hour: 9, minute: 50 },
    { name: 'Office Support', phone: '+91 11 4567 8900', type: 'Incoming', duration: 420, daysAgo: 4, hour: 11, minute: 40 },
    { name: 'Unknown Caller', phone: '+91 98999 11223', type: 'Missed', duration: 0, daysAgo: 4, hour: 17, minute: 20 },

    // 5-7 Days ago
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Incoming', duration: 185, daysAgo: 5, hour: 11, minute: 10 },
    { name: 'Aarav Gupta', phone: '+91 99887 76655', type: 'Incoming', duration: 610, daysAgo: 5, hour: 15, minute: 30 },
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Outgoing', duration: 325, daysAgo: 6, hour: 10, minute: 45 },
    { name: 'Vikram Malhotra', phone: '+91 97234 56789', type: 'Outgoing', duration: 210, daysAgo: 6, hour: 16, minute: 10 },
    { name: 'Mom', phone: '+91 94000 12345', type: 'Incoming', duration: 890, daysAgo: 7, hour: 19, minute: 40 },
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Missed', duration: 0, daysAgo: 7, hour: 21, minute: 15 },

    // 8-15 Days ago
    { name: 'Client Account Manager', phone: '+91 22 6789 0123', type: 'Incoming', duration: 1530, daysAgo: 9, hour: 11, minute: 0 },
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Outgoing', duration: 420, daysAgo: 10, hour: 14, minute: 20 },
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Incoming', duration: 210, daysAgo: 11, hour: 16, minute: 50 },
    { name: 'Aarav Gupta', phone: '+91 99887 76655', type: 'Outgoing', duration: 340, daysAgo: 12, hour: 10, minute: 30 },
    { name: 'Office Support', phone: '+91 11 4567 8900', type: 'Incoming', duration: 90, daysAgo: 13, hour: 12, minute: 15 },
    { name: 'Mom', phone: '+91 94000 12345', type: 'Outgoing', duration: 1100, daysAgo: 14, hour: 20, minute: 0 },
    { name: 'Vikram Malhotra', phone: '+91 97234 56789', type: 'Incoming', duration: 180, daysAgo: 15, hour: 15, minute: 20 },

    // 16-25 Days ago
    { name: 'Rahul Sharma', phone: '+91 98765 43210', type: 'Incoming', duration: 280, daysAgo: 18, hour: 11, minute: 40 },
    { name: 'Priya Patel', phone: '+91 98111 22334', type: 'Outgoing', duration: 510, daysAgo: 20, hour: 14, minute: 10 },
    { name: 'Aarav Gupta', phone: '+91 99887 76655', type: 'Incoming', duration: 195, daysAgo: 22, hour: 16, minute: 45 },
    { name: 'Mom', phone: '+91 94000 12345', type: 'Incoming', duration: 750, daysAgo: 24, hour: 19, minute: 30 },
    { name: 'Vikram Malhotra', phone: '+91 97234 56789', type: 'Outgoing', duration: 420, daysAgo: 25, hour: 17, minute: 0 },
  ];

  return rawList.map((item, index) => {
    const targetDate = new Date(baseTime - item.daysAgo * oneDay);
    targetDate.setHours(item.hour, item.minute, Math.floor(Math.random() * 59), 0);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const mins = String(targetDate.getMinutes()).padStart(2, '0');

    return {
      id: `sample_call_${index + 1}`,
      phoneNumber: item.phone,
      normalizedNumber: normalizePhoneNumber(item.phone),
      contactName: item.name,
      date: `${year}-${month}-${day}`,
      time: `${hours}:${mins}`,
      timestamp: targetDate.getTime(),
      type: item.type,
      durationSeconds: item.duration,
      durationFormatted: formatDuration(item.duration, 'clock'),
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}
