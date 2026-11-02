import { WebContact, AntiBanProfile, AntiBanProfileConfig, AntiBanSafetyAnalysis } from './types';

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

export const ANTI_BAN_PROFILES: Record<AntiBanProfile, AntiBanProfileConfig> = {
  warmup: {
    id: 'warmup',
    name: 'Warm-Up & Cold List Protection',
    badge: '🛡️ Maximum Protection',
    description: 'Ultra-safe pacing for fresh numbers, new accounts, or cold contacts who have not saved your number.',
    recommendedDelay: 25,
    minDelay: 20,
    batchSize: 8,
    breakDurationSeconds: 180, // 3 min break every 8 msgs
    recommendedFor: 'Accounts < 30 days old or cold marketing lists'
  },
  balanced: {
    id: 'balanced',
    name: 'Standard Balanced Safe Mode',
    badge: '⚖️ Recommended (Safe)',
    description: 'Humanized pacing with automated coffee breaks, recommended for active WhatsApp accounts.',
    recommendedDelay: 18,
    minDelay: 15,
    batchSize: 10,
    breakDurationSeconds: 120, // 2 min break every 10 msgs
    recommendedFor: 'Warmed up accounts & customer broadcasts'
  },
  turbo: {
    id: 'turbo',
    name: 'Fast Delivery (Saved Contacts Only)',
    badge: '⚡ Fast Mode',
    description: 'Higher throughput with micro-breaks. WARNING: Only use if recipients have already saved your number in their phonebook!',
    recommendedDelay: 12,
    minDelay: 10,
    batchSize: 15,
    breakDurationSeconds: 90,
    recommendedFor: 'Existing clients who have your contact saved'
  }
};

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

  /**
   * Evaluates the Anti-Ban safety score and provides actionable recommendations
   */
  static calculateAntiBanScore(
    template: string,
    delaySeconds: number,
    hasOptOut: boolean,
    profile: AntiBanProfile = 'balanced'
  ): AntiBanSafetyAnalysis {
    const rawText = template || '';
    const hasSpintax = /\{([^{}]+?\|[^{}]+?)\}/.test(rawText);
    const hasPersonalization = /\{\{\s*(?:name|first_name|customer|contact)\s*\}\}|\{\s*(?:name|first_name|customer|contact)\s*\}|\[\s*(?:name|first_name|customer|contact)\s*\]|%\s*(?:name|customer|contact)\s*%/i.test(rawText);
    const hasUrl = this.hasUrl(rawText);

    let score = 0;
    const recommendations: string[] = [];

    // 1. Spintax variation (Weight: 30 pts)
    if (hasSpintax) {
      score += 30;
    } else {
      recommendations.push('Add Spintax variations like {Hello|Hi|Greetings} so each recipient gets a unique text hash.');
    }

    // 2. Delay Safety (Weight: 30 pts)
    let delayScore = 0;
    const safeDelay = Math.max(0, delaySeconds || 0);
    const isDelaySafe = safeDelay >= 16;
    if (safeDelay >= 24) {
      delayScore = 30;
    } else if (safeDelay >= 18) {
      delayScore = 25;
    } else if (safeDelay >= 15) {
      delayScore = 18;
    } else if (safeDelay >= 10) {
      delayScore = 8;
      recommendations.push('Delay is low (10-14s). Increase to 18s-25s to avoid automated cadence detection.');
    } else {
      delayScore = 0;
      recommendations.push('CRITICAL: Delay under 10s will almost certainly get your WhatsApp account blocked!');
    }
    score += delayScore;

    // 3. Opt-Out Protection (Weight: 20 pts)
    if (hasOptOut) {
      score += 20;
    } else {
      recommendations.push('Enable the Anti-Ban Opt-Out footer (Reply STOP) so recipients do not click "Report as Spam".');
    }

    // 4. Personalization (Weight: 20 pts)
    if (hasPersonalization) {
      score += 20;
    } else {
      recommendations.push("Use the {name} tag. Personalizing with the recipient's name reduces spam reports by 70%.");
    }

    // 5. Cold Link Penalty
    if (hasUrl) {
      if (!hasSpintax) {
        score = Math.max(0, score - 15);
        recommendations.push('Sending cold links without Spintax triggers WhatsApp Phishing Shields. Consider asking contacts to reply first.');
      } else {
        score = Math.max(0, score - 5);
      }
    }

    // Profile bonus / penalty
    if (profile === 'warmup') {
      score = Math.min(100, score + 5);
    } else if (profile === 'turbo' && !hasSpintax) {
      score = Math.max(0, score - 10);
    }

    score = Math.min(100, Math.max(0, Math.round(score)));

    let rating: AntiBanSafetyAnalysis['rating'] = 'moderate';
    if (score >= 88) rating = 'ultra_safe';
    else if (score >= 72) rating = 'good';
    else if (score >= 50) rating = 'moderate';
    else rating = 'danger';

    return {
      score,
      rating,
      hasSpintax,
      hasPersonalization,
      hasOptOut,
      hasUrl,
      isDelaySafe,
      delayScore,
      recommendations
    };
  }

  /**
   * Generates formal WhatsApp Unban Appeal templates for email or in-app review
   */
  static getUnbanAppealTemplate(phoneNumber?: string, businessName?: string) {
    const cleanPhone = phoneNumber ? phoneNumber.trim() : '+[Your Country Code & Phone Number]';
    const biz = businessName ? businessName.trim() : 'our business';

    const emailSubject = `Request to restore WhatsApp account: ${cleanPhone}`;
    const emailBody = `Dear WhatsApp Support Team,

I am writing to formally request a review of my WhatsApp account (${cleanPhone}), which was unexpectedly blocked by your automated spam detection system.

I believe this suspension was made in error. This phone number is our primary communication line for ${biz}, where we interact with our customers and clients. We have always strictly complied with WhatsApp's Terms of Service and community guidelines.

We do not engage in unauthorized scraping or malicious activities. Any recent messages were sent solely to our registered clients and customers with legitimate intent.

Could you please conduct a manual review of our account activity and restore our access? We are committed to maintaining a safe and respectful messaging experience.

Thank you very much for your understanding and prompt assistance.

Sincerely,
Account Owner (${cleanPhone})`;

    const inAppReviewText = `My WhatsApp number (${cleanPhone}) was blocked by mistake. I use this number exclusively for legitimate business communication with my customers and clients, and I always comply with WhatsApp's Terms of Service. Please review my account and restore access. Thank you.`;

    const hindiAppealText = `नमस्ते व्हाट्सएप सपोर्ट टीम,
मेरा व्हाट्सएप नंबर (${cleanPhone}) अनजाने में ऑटोमेटेड सिस्टम द्वारा ब्लॉक हो गया है। मैं इस नंबर का उपयोग केवल अपने ग्राहकों और परिचितों से वैध बातचीत के लिए करता हूँ। मैंने व्हाट्सएप के किसी नियम का उल्लंघन नहीं किया है। कृपया मेरे खाते की समीक्षा करें और इसे जल्द से जल्द अनब्लॉक करें। धन्यवाद।`;

    return {
      supportEmail: 'support@whatsapp.com',
      smbEmail: 'smb_web@support.whatsapp.com',
      emailSubject,
      emailBody,
      inAppReviewText,
      hindiAppealText
    };
  }
}

