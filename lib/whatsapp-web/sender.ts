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
   * Spintax Parser: Randomly selects from {option1|option2|option3} variants.
   * Completely defeats duplicate message hash detection on WhatsApp.
   */
  static parseSpintax(text: string): string {
    if (!text) return '';
    const spintaxRegex = /\{([^{}]+?\|[^{}]+?)\}/g;
    let result = text;
    let iterations = 0;
    while (spintaxRegex.test(result) && iterations < 10) {
      result = result.replace(spintaxRegex, (_, choices) => {
        const options = choices.split('|');
        const chosen = options[Math.floor(Math.random() * options.length)];
        return chosen !== undefined ? chosen.trim() : '';
      });
      iterations++;
    }
    return result;
  }

  /**
   * Replace placeholders like {name}, {{name}}, {phone}, {{phone}}, {1}, {{1}}, and Spintax
   */
  static interpolate(template: string, contact: WebContact): string {
    if (!template) return '';
    const safeName = (contact.name || 'Friend').trim();
    const firstName = safeName.split(' ')[0] || safeName;
    const phone = contact.phoneNumber || '';

    // 1. Process Spintax {Hello|Hi|Greetings} first so each contact gets unique phrasing
    let processed = this.parseSpintax(template);

    // 2. Replace contact & random attributes
    return processed
      // Name: {{name}}, {name}, [name], %name%, {{1}}, {1}, {{customer}}, {customer}, {{contact}}, {contact}
      .replace(/(\{\{\s*(?:name|customer|customer_name|contact|contact_name)\s*\}\}|\{\s*(?:name|customer|customer_name|contact|contact_name)\s*\}|\[\s*(?:name|customer|customer_name|contact|contact_name)\s*\]|%\s*(?:name|customer|contact)\s*%|\{\{\s*1\s*\}\}|\{\s*1\s*\})/gi, safeName)
      // First name: {{first_name}}, {first_name}
      .replace(/(\{\{\s*first_name\s*\}\}|\{\s*first_name\s*\}|\[\s*first_name\s*\])/gi, firstName)
      // Phone: {{phone}}, {phone}, {{number}}, {number}, {{2}}, {2}
      .replace(/(\{\{\s*(?:phone|number|mobile)\s*\}\}|\{\s*(?:phone|number|mobile)\s*\}|\[\s*(?:phone|number|mobile)\s*\]|\{\{\s*2\s*\}\}|\{\s*2\s*\})/gi, phone)
      // Random: {{random}}, {random}, {{uid}}, {uid}, {{code}}, {code}
      .replace(/(\{\{\s*(?:random|uid|code)\s*\}\}|\{\s*(?:random|uid|code)\s*\})/gi, () => Math.random().toString(36).substring(2, 7).toUpperCase());
  }

  /**
   * Automatically formats URLs inside message text so WhatsApp recognizes them as clickable links
   * 1. Adds https:// to standalone domains (e.g. toonest.vercel.app -> https://toonest.vercel.app)
   * 2. Ensures URLs have proper whitespace separation so they are not merged with adjoining punctuation
   */
  static formatMessageUrls(text: string): string {
    if (!text) return '';

    // Convert www.domain.com without protocol to https://www.domain.com
    let formatted = text.replace(/(^|[\s\(\[\{])(www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s\)\],]*)?)/gi, '$1https://$2');

    // Convert common domain names without protocol (e.g., toonest.vercel.app)
    const domainRegex = /(^|[\s\(\[\{])((?:[a-zA-Z0-9-]+\.)+(?:app|com|in|org|net|co|io|ai|dev|me|store|site|info|biz|online|xyz|tech|link|cc|tv|club)(?:\/[^\s\)\],]*)?)/gi;
    formatted = formatted.replace(domainRegex, (match, prefix, domain) => {
      if (domain.startsWith('http://') || domain.startsWith('https://')) {
        return match;
      }
      return `${prefix}https://${domain}`;
    });

    // Ensure whitespace before https?:// if immediately attached to a word or punctuation like : or ,
    formatted = formatted.replace(/([^\s\(\[\{<])(https?:\/\/)/gi, '$1 $2');

    return formatted;
  }

  /**
   * Extract the first valid URL from message text (if any)
   */
  static extractFirstUrl(text: string): { url: string; domain: string } | null {
    if (!text) return null;
    const formatted = this.formatMessageUrls(text);
    const match = formatted.match(/https?:\/\/[^\s\)\],]+/i);
    if (!match) return null;
    const rawUrl = match[0];
    try {
      const parsed = new URL(rawUrl);
      return { url: rawUrl, domain: parsed.hostname };
    } catch {
      return { url: rawUrl, domain: rawUrl.replace(/^https?:\/\//i, '').split('/')[0] };
    }
  }

  /**
   * Check if text contains any URL (either full https:// or naked domain)
   */
  static hasUrl(text: string): boolean {
    if (!text) return false;
    return !!this.extractFirstUrl(text);
  }

  /**
   * Generates direct WhatsApp Web URL for 1-click manual / fallback sending
   */
  static getDirectWhatsAppWebUrl(phone: string, text: string): string {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const formattedText = this.formatMessageUrls(text);
    return `https://web.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(formattedText)}`;
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
