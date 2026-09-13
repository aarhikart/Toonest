import { WebContact } from './types';

export interface CountryCodeOption {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  sampleDigits: number;
}

export const POPULAR_COUNTRY_CODES: CountryCodeOption[] = [
  { name: 'India', code: 'IN', dialCode: '91', flag: '🇮🇳', sampleDigits: 10 },
  { name: 'United States / Canada', code: 'US', dialCode: '1', flag: '🇺🇸', sampleDigits: 10 },
  { name: 'United Kingdom', code: 'GB', dialCode: '44', flag: '🇬🇧', sampleDigits: 10 },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '971', flag: '🇦🇪', sampleDigits: 9 },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '966', flag: '🇸🇦', sampleDigits: 9 },
  { name: 'Australia', code: 'AU', dialCode: '61', flag: '🇦🇺', sampleDigits: 9 },
  { name: 'Singapore', code: 'SG', dialCode: '65', flag: '🇸🇬', sampleDigits: 8 },
  { name: 'Germany', code: 'DE', dialCode: '49', flag: '🇩🇪', sampleDigits: 10 },
  { name: 'Brazil', code: 'BR', dialCode: '55', flag: '🇧🇷', sampleDigits: 11 },
  { name: 'South Africa', code: 'ZA', dialCode: '27', flag: '🇿🇦', sampleDigits: 9 },
  { name: 'Nigeria', code: 'NG', dialCode: '234', flag: '🇳🇬', sampleDigits: 10 }
];

export class WhatsAppSenderEngine {
  /**
   * Replace placeholders like {name}, {phone}, {number}
   */
  static interpolate(template: string, contact: WebContact): string {
    return template
      .replace(/\{name\}/gi, contact.name || 'Friend')
      .replace(/\{phone\}/gi, contact.phoneNumber)
      .replace(/\{number\}/gi, contact.phoneNumber)
      .replace(/\{first_name\}/gi, (contact.name || 'Friend').split(' ')[0])
      .replace(/\{random\}/gi, Math.random().toString(36).substring(2, 7).toUpperCase());
  }

  /**
   * Generates direct WhatsApp Web URL for 1-click manual / fallback sending
   */
  static getDirectWhatsAppWebUrl(phone: string, text: string): string {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    return `https://web.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(text)}`;
  }

  /**
   * Intelligent phone number normalizer supporting any country dial code (default India 91)
   */
  static cleanPhone(phone: string, defaultDialCode = '91'): string {
    if (!phone) return '';
    let clean = phone.replace(/[^0-9+]/g, '');

    // Already has +
    if (clean.startsWith('+')) {
      return '+' + clean.slice(1).replace(/[^0-9]/g, '');
    }

    // Starts with 00 (international format)
    if (clean.startsWith('00')) {
      return '+' + clean.slice(2);
    }

    const digits = clean.replace(/[^0-9]/g, '');

    // 10 digits (standard in India, US without code): prefix with default dial code
    if (digits.length === 10) {
      return `+${defaultDialCode}${digits}`;
    }

    // 11 digits starting with 0 (e.g. 08962048813)
    if (digits.length === 11 && digits.startsWith('0')) {
      return `+${defaultDialCode}${digits.slice(1)}`;
    }

    // Starts with default country code without + (e.g. 918962048813, 12 digits)
    if (digits.startsWith(defaultDialCode) && digits.length >= 10 + defaultDialCode.length - 2) {
      return `+${digits}`;
    }

    // 11 digits starting with 1 (US with country code)
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    return `+${digits}`;
  }

  /**
   * Parses raw pasted text into contacts
   */
  static parseRawText(text: string, defaultDialCode = '91'): WebContact[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const result: WebContact[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      let name = '';
      let rawPhone = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        name = parts[0].trim();
        rawPhone = parts.slice(1).join(',').trim();
      } else if (line.includes('-') && !line.startsWith('+')) {
        const parts = line.split('-');
        name = parts[0].trim();
        rawPhone = parts.slice(1).join('-').trim();
      } else if (line.includes('\t')) {
        const parts = line.split('\t');
        name = parts[0].trim();
        rawPhone = parts.slice(1).join(' ').trim();
      } else {
        rawPhone = line.trim();
        name = `Contact ${i + 1}`;
      }

      // If name looks like numbers and phone looks like name, swap them
      if (/^[0-9+() -]+$/.test(name) && !/^[0-9+() -]+$/.test(rawPhone)) {
        const temp = name;
        name = rawPhone;
        rawPhone = temp;
      }

      const formattedPhone = this.cleanPhone(rawPhone, defaultDialCode);
      if (formattedPhone.length >= 8) {
        result.push({
          id: `c_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          name: name || `Contact ${i + 1}`,
          phoneNumber: formattedPhone,
          status: 'PENDING'
        });
      }
    }

    return result;
  }

  /**
   * Sample contacts list for fast testing
   */
  static getSampleContacts(): WebContact[] {
    return [
      { id: 'sc_1', name: 'Rohan Sharma', phoneNumber: '+918962048813', status: 'PENDING' },
      { id: 'sc_2', name: 'Priya Patel', phoneNumber: '+919876543210', status: 'PENDING' },
      { id: 'sc_3', name: 'Amit Verma', phoneNumber: '+919123456789', status: 'PENDING' },
      { id: 'sc_4', name: 'Alex Wright', phoneNumber: '+12025550143', status: 'PENDING' },
      { id: 'sc_5', name: 'David Miller', phoneNumber: '+442079460192', status: 'PENDING' }
    ];
  }
}
