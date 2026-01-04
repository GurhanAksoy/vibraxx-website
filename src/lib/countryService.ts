/**
 * VIBRAXX COUNTRY DETECTION SERVICE
 * Detects user's country via IP and provides flag emoji
 */

export interface CountryData {
  countryCode: string;
  countryName: string;
  flag: string;
  continent: string;
  timezone: string;
}

/**
 * Converts country code to flag emoji
 * @param countryCode - ISO 3166-1 alpha-2 code (e.g., 'TR', 'US')
 * @returns Flag emoji (e.g., '🇹🇷', '🇺🇸')
 */
export const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍'; // Default world emoji
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

/**
 * Detects user's country using IP geolocation
 * Multiple fallback services for reliability
 */
export const detectCountry = async (): Promise<CountryData> => {
  try {
    // Primary: ipapi.co (free, 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'User-Agent': 'VibraXX/1.0' }
    });
    
    if (!response.ok) throw new Error('Primary service failed');
    
    const data = await response.json();
    
    return {
      countryCode: data.country_code || 'XX',
      countryName: data.country_name || 'Unknown',
      flag: getFlagEmoji(data.country_code || 'XX'),
      continent: data.continent_code || 'Unknown',
      timezone: data.timezone || 'UTC'
    };
  } catch (error) {
    console.error('Primary country detection failed, trying fallback...', error);
    
    try {
      // Fallback: ip-api.com (free, unlimited)
      const response = await fetch('http://ip-api.com/json/?fields=countryCode,country,timezone,continent');
      
      if (!response.ok) throw new Error('Fallback service failed');
      
      const data = await response.json();
      
      return {
        countryCode: data.countryCode || 'XX',
        countryName: data.country || 'Unknown',
        flag: getFlagEmoji(data.countryCode || 'XX'),
        continent: data.continent || 'Unknown',
        timezone: data.timezone || 'UTC'
      };
    } catch (fallbackError) {
      console.error('All country detection services failed', fallbackError);
      
      // Return default
      return {
        countryCode: 'XX',
        countryName: 'Unknown',
        flag: '🌍',
        continent: 'Unknown',
        timezone: 'UTC'
      };
    }
  }
};

/**
 * Popular countries list with flags
 * Used for manual country picker
 */
export const POPULAR_COUNTRIES = [
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
];

/**
 * All countries (complete list)
 * Sorted alphabetically by name
 */
export const ALL_COUNTRIES = [
  ...POPULAR_COUNTRIES,
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Get country name from flag emoji
 */
export const getCountryNameFromFlag = (flag: string): string => {
  const country = ALL_COUNTRIES.find(c => c.flag === flag);
  return country?.name || 'Unknown';
};

/**
 * Validate country flag emoji
 */
export const isValidCountryFlag = (flag: string): boolean => {
  return ALL_COUNTRIES.some(c => c.flag === flag) || flag === '🌍';
};
