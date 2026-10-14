export interface PhoneValidationDetails {
  raw: string;
  cleaned: string;
  countryCode: string;
  nationalNumber: string;
  isValidLength: boolean;
  isDummy: boolean;
  isMobile: boolean;
  carrierType: 'mobile' | 'landline' | 'toll_free' | 'dummy' | 'invalid';
  reason: string;
}

export const COMMON_COUNTRY_CODES = [
  { code: '91', country: 'India', flag: '🇮🇳' },
  { code: '1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '61', country: 'Australia', flag: '🇦🇺' },
  { code: '65', country: 'Singapore', flag: '🇸🇬' },
  { code: '60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '49', country: 'Germany', flag: '🇩🇪' },
  { code: '33', country: 'France', flag: '🇫🇷' },
  { code: '55', country: 'Brazil', flag: '🇧🇷' },
  { code: '27', country: 'South Africa', flag: '🇿🇦' },
  { code: '234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '977', country: 'Nepal', flag: '🇳🇵' },
  { code: '94', country: 'Sri Lanka', flag: '🇱🇰' },
];

export function analyzePhoneNumber(rawInput: string, defaultCountryCode: string = '91'): PhoneValidationDetails {
  let digits = rawInput.replace(/\D/g, '');

  if (!digits || digits.length < 5) {
    return {
      raw: rawInput,
      cleaned: digits,
      countryCode: defaultCountryCode,
      nationalNumber: digits,
      isValidLength: false,
      isDummy: false,
      isMobile: false,
      carrierType: 'invalid',
      reason: 'Phone number is too short or missing digits.'
    };
  }

  // Handle leading zero (e.g. UK 07xxx or India 098xxx)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // If 10 digits and default country provided, prepend default code
  if (digits.length === 10) {
    digits = `${defaultCountryCode}${digits}`;
  }

  // Detect Country Code
  let matchedCountry = defaultCountryCode;
  let nationalNumber = digits;

  // Sort country codes by length descending so e.g. 971 matches before 9
  const sortedCodes = [...COMMON_COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sortedCodes) {
    if (digits.startsWith(c.code)) {
      matchedCountry = c.code;
      nationalNumber = digits.slice(c.code.length);
      break;
    }
  }

  // Length Check (E.164: 7 to 15 digits overall)
  if (digits.length < 7 || digits.length > 15) {
    return {
      raw: rawInput,
      cleaned: digits,
      countryCode: matchedCountry,
      nationalNumber,
      isValidLength: false,
      isDummy: false,
      isMobile: false,
      carrierType: 'invalid',
      reason: `Invalid digit length (${digits.length} digits). Standard numbers are 8–15 digits.`
    };
  }

  // Dummy Number Detection (e.g. 0000000000, 1111111111, 1234567890, 9999999999)
  const isAllSameDigit = /^(\d)\1+$/.test(nationalNumber);
  const isSequentialAscending = '0123456789012345'.includes(nationalNumber) && nationalNumber.length >= 6;
  const isSequentialDescending = '9876543210987654'.includes(nationalNumber) && nationalNumber.length >= 6;
  const isObviousDummy =
    isAllSameDigit ||
    isSequentialAscending ||
    isSequentialDescending ||
    nationalNumber.startsWith('000') ||
    nationalNumber.startsWith('1111');

  if (isObviousDummy) {
    return {
      raw: rawInput,
      cleaned: digits,
      countryCode: matchedCountry,
      nationalNumber,
      isValidLength: true,
      isDummy: true,
      isMobile: false,
      carrierType: 'dummy',
      reason: 'Dummy/test number pattern (non-existent subscriber).'
    };
  }

  // Country-Specific Carrier & Prefix Validation
  if (matchedCountry === '91') {
    // India: 10-digit mobile must start with 6, 7, 8, or 9
    if (nationalNumber.length !== 10) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: false,
        isDummy: false,
        isMobile: false,
        carrierType: 'invalid',
        reason: `Indian mobile numbers must be exactly 10 digits (got ${nationalNumber.length}).`
      };
    }

    const firstDigit = nationalNumber.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: false,
        carrierType: 'landline',
        reason: `Indian mobile numbers must start with 6, 7, 8, or 9. Prefix '${firstDigit}' is a landline or invalid.`
      };
    }

    return {
      raw: rawInput,
      cleaned: digits,
      countryCode: matchedCountry,
      nationalNumber,
      isValidLength: true,
      isDummy: false,
      isMobile: true,
      carrierType: 'mobile',
      reason: 'Valid Indian mobile network format.'
    };
  }

  if (matchedCountry === '44') {
    // UK: Mobile numbers start with 7
    if (nationalNumber.startsWith('7') && nationalNumber.length === 10) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: true,
        carrierType: 'mobile',
        reason: 'Valid UK mobile network format.'
      };
    } else if (nationalNumber.startsWith('1') || nationalNumber.startsWith('2')) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: false,
        carrierType: 'landline',
        reason: 'UK geographic fixed landline number (cannot have WhatsApp).'
      };
    } else if (nationalNumber.startsWith('8')) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: false,
        carrierType: 'toll_free',
        reason: 'UK toll-free / service number.'
      };
    }
  }

  if (matchedCountry === '1') {
    // USA/Canada: 10 digits
    if (nationalNumber.length === 10) {
      const areaCode = nationalNumber.slice(0, 3);
      const exchangeCode = nationalNumber.slice(3, 6);
      if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
        return {
          raw: rawInput,
          cleaned: digits,
          countryCode: matchedCountry,
          nationalNumber,
          isValidLength: true,
          isDummy: true,
          isMobile: false,
          carrierType: 'invalid',
          reason: 'Invalid North American area code (cannot begin with 0 or 1).'
        };
      }
      if (areaCode === '555' || exchangeCode === '555') {
        return {
          raw: rawInput,
          cleaned: digits,
          countryCode: matchedCountry,
          nationalNumber,
          isValidLength: true,
          isDummy: true,
          isMobile: false,
          carrierType: 'dummy',
          reason: 'Fictional 555 exchange/test number.'
        };
      }
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: true,
        carrierType: 'mobile',
        reason: 'Valid North American number format.'
      };
    }
  }

  if (matchedCountry === '971') {
    // UAE: Mobile starts with 5 (50, 52, 54, 55, 56, 58)
    if (nationalNumber.startsWith('5') && nationalNumber.length === 9) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: true,
        carrierType: 'mobile',
        reason: 'Valid UAE mobile network format.'
      };
    }
  }

  if (matchedCountry === '966') {
    // Saudi Arabia: Mobile starts with 5
    if (nationalNumber.startsWith('5') && nationalNumber.length === 9) {
      return {
        raw: rawInput,
        cleaned: digits,
        countryCode: matchedCountry,
        nationalNumber,
        isValidLength: true,
        isDummy: false,
        isMobile: true,
        carrierType: 'mobile',
        reason: 'Valid Saudi mobile network format.'
      };
    }
  }

  // General international mobile check (typical mobile lengths 8-13 digits)
  const isLikelyMobile = nationalNumber.length >= 8 && nationalNumber.length <= 12;
  return {
    raw: rawInput,
    cleaned: digits,
    countryCode: matchedCountry,
    nationalNumber,
    isValidLength: true,
    isDummy: false,
    isMobile: isLikelyMobile,
    carrierType: isLikelyMobile ? 'mobile' : 'landline',
    reason: isLikelyMobile
      ? 'Valid international mobile format.'
      : 'Unlikely mobile length / format.'
  };
}
