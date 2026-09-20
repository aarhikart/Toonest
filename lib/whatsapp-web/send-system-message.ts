import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders } from './config';

/**
 * Format phone number for WhatsApp delivery:
 * Removes spaces, dashes, brackets, plus signs, and prepends default 91 if 10 digits.
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Dispatches an automated WhatsApp notification using the Admin / Default connected session.
 * Does not throw errors so admin actions are never blocked if the worker is temporarily busy.
 */
export async function sendSystemWhatsAppNotification(
  toPhone: string,
  message: string,
  preferredUserId: string = 'hitesh1720'
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedTo = formatWhatsAppNumber(toPhone);
    if (!formattedTo || formattedTo.length < 10) {
      console.warn('[System WhatsApp Sender] Invalid phone number:', toPhone);
      return { success: false, error: 'Invalid phone number' };
    }

    const serviceUrl = await getWhatsAppServiceUrl();
    const serviceSecret = getWhatsAppServiceSecret();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    // Try preferred admin user session first, then fallback to 'default'
    const userIdsToTry = [preferredUserId, 'hitesh1720', 'default'].filter(
      (v, i, a) => a.indexOf(v) === i
    );

    let lastError = '';

    for (const userId of userIdsToTry) {
      try {
        const res = await fetch(`${serviceUrl}/send`, {
          method: 'POST',
          headers: getWorkerHeaders(serviceSecret, userId),
          body: JSON.stringify({
            to: formattedTo,
            text: message,
            userId
          }),
          signal: controller.signal
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          clearTimeout(timeout);
          console.log(`[System WhatsApp Notification] Successfully sent message to ${formattedTo} using session "${userId}"`);
          return { success: true };
        } else {
          lastError = data.error || `HTTP ${res.status}`;
        }
      } catch (innerErr: any) {
        lastError = innerErr.message || 'Worker fetch failed';
      }
    }

    clearTimeout(timeout);
    console.warn(`[System WhatsApp Notification] Could not dispatch to ${formattedTo}: ${lastError}`);
    return { success: false, error: lastError };
  } catch (err: any) {
    console.error('[System WhatsApp Notification Error]:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
