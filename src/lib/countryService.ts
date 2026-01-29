// src/lib/countryService.ts

export type Country = {
  code: string;
  name: string;
  flag: string;
};

export const ALL_COUNTRIES: Country[] = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
];

export const POPULAR_COUNTRIES: Country[] = [
  ALL_COUNTRIES[0],
  ALL_COUNTRIES[1],
  ALL_COUNTRIES[2],
  ALL_COUNTRIES[3],
  ALL_COUNTRIES[4],
];

/**
 * Returns ISO country code (ex: "GB")
 */
export async function detectCountry(): Promise<string> {
  try {
    const res = await fetch("https://api.country.is/");
    const data = await res.json();
    return data.country || "GB";
  } catch {
    return "GB";
  }
}
