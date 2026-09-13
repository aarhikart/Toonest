import { Contact, ConsentStatus } from './types';

export class ContactService {
  /**
   * Normalize phone number to strict E.164 format (+12025550192)
   */
  static normalizeE164(phone: string, defaultCountryCode = '1'): { valid: boolean; formatted: string; countryCode: string } {
    let clean = phone.replace(/[^0-9+]/g, '');

    if (!clean) {
      return { valid: false, formatted: '', countryCode: '' };
    }

    if (!clean.startsWith('+')) {
      if (clean.length === 10) {
        clean = `+${defaultCountryCode}${clean}`;
      } else {
        clean = `+${clean}`;
      }
    }

    const digitsOnly = clean.substring(1);
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { valid: false, formatted: clean, countryCode: '' };
    }

    let detectedCountry = '1';
    if (clean.startsWith('+44')) detectedCountry = '44';
    else if (clean.startsWith('+91')) detectedCountry = '91';
    else if (clean.startsWith('+61')) detectedCountry = '61';
    else if (clean.startsWith('+49')) detectedCountry = '49';
    else if (clean.startsWith('+33')) detectedCountry = '33';
    else if (clean.startsWith('+971')) detectedCountry = '971';
    else if (clean.startsWith('+81')) detectedCountry = '81';

    return {
      valid: true,
      formatted: clean,
      countryCode: detectedCountry
    };
  }

  /**
   * Parse CSV content into contact list
   */
  static parseCsv(csvText: string, defaultTags: string[] = []): { contacts: Partial<Contact>[]; errors: string[] } {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const contacts: Partial<Contact>[] = [];
    const errors: string[] = [];

    if (lines.length < 2) {
      errors.push('CSV must contain at least a header row and one contact row');
      return { contacts, errors };
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const phoneIdx = header.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('number'));
    const firstNameIdx = header.findIndex(h => h.includes('first') || h.includes('fname'));
    const lastNameIdx = header.findIndex(h => h.includes('last') || h.includes('lname'));
    const nameIdx = header.findIndex(h => h === 'name' || h.includes('full'));
    const emailIdx = header.findIndex(h => h.includes('email'));
    const tagIdx = header.findIndex(h => h.includes('tag'));

    if (phoneIdx === -1) {
      errors.push('CSV header must contain a column for Phone/Mobile/Number');
      return { contacts, errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Handle quoted commas
      const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^["']|["']$/g, ''));
      const rawPhone = row[phoneIdx];

      if (!rawPhone) {
        errors.push(`Row ${i + 1}: Missing phone number`);
        continue;
      }

      const { valid, formatted, countryCode } = this.normalizeE164(rawPhone);
      if (!valid) {
        errors.push(`Row ${i + 1}: Invalid phone number "${rawPhone}"`);
        continue;
      }

      let firstName = '';
      let lastName = '';

      if (firstNameIdx !== -1) firstName = row[firstNameIdx] || '';
      if (lastNameIdx !== -1) lastName = row[lastNameIdx] || '';
      if (!firstName && nameIdx !== -1 && row[nameIdx]) {
        const parts = row[nameIdx].split(' ');
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      }

      const email = emailIdx !== -1 ? row[emailIdx] || undefined : undefined;
      const rowTags = tagIdx !== -1 && row[tagIdx] ? row[tagIdx].split(';').map(t => t.trim()).filter(Boolean) : [];
      const combinedTags = Array.from(new Set([...defaultTags, ...rowTags]));

      contacts.push({
        phoneNumber: formatted,
        countryCode,
        firstName,
        lastName,
        email,
        consentStatus: 'OPTED_IN',
        optInSource: 'CSV Import',
        optInAt: new Date().toISOString(),
        tags: combinedTags,
        metadata: {}
      });
    }

    return { contacts, errors };
  }

  /**
   * Filter contacts ensuring strict WhatsApp policy compliance:
   * 1. Must be strictly OPTED_IN
   * 2. Must not be OPTED_OUT
   * 3. Must match tag filters if specified
   */
  static filterEligibleRecipients(contacts: Contact[], targetTags: string[] = []): Contact[] {
    return contacts.filter(c => {
      // Must have opted in
      if (c.consentStatus !== 'OPTED_IN') return false;

      // Tag match
      if (targetTags.length > 0) {
        const hasMatchingTag = targetTags.some(tag => c.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }
}
